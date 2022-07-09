import { EventEmitter } from 'events';
import VoxeetSDK from 'voxeet-sdk';
import io, { Socket } from "socket.io-client";

var socket: Socket|undefined = undefined;

interface ParticipantRooms {
  [participant: string]: string[]
}

export interface ParticipantPositionUpdate {
  participant: string, name: string,
  x: number, y: number, z: number,
  yaw: number, pitch: number,
  local: boolean
}

interface ParticipantPositionUpdateHolder {
  [participant: string]: ParticipantPositionUpdate
}

interface EventMap {
  ["ParticipantPositionUpdate"]: ParticipantPositionUpdate;
}

const participantRooms: ParticipantRooms = {};

export class InternalSocketClass {

  private events: EventEmitter = new EventEmitter();
  private positionsHolder: ParticipantPositionUpdateHolder = {};

  public participants() {
    return Object.keys(this.positionsHolder);
  }

  public get(participant: string): ParticipantPositionUpdate|null {
    return this.positionsHolder[participant] || null;
  }

  public addListener<K extends keyof EventMap>(
    type: K,
    listener: (event: EventMap[K]) => void
  ): void {
    this.events.addListener(type, listener);
  }

  public removeListener<K extends keyof EventMap>(
    type: K,
    listener: (event: EventMap[K]) => void
  ): void {
    this.events.removeListener(type, listener);
  }

  private emit<K extends keyof EventMap>(
    type: K,
    event: EventMap[K]
  ): void {
    this.events.emit(type, event);
  }

  public init() {
    if (this._initialized) return;
    this._initialized = true;

    try {
      //@ts-ignore
      const port = Number.parseInt(websocket) || -1;
      if (port <= 0) throw "default port used";
      socket = io(`:${port}`);
    } catch (err) {
      console.log("socket error", err);
    }
    
    if (!socket) socket = io();
    
    socket.on("position", this.onPosition);
  }

  private _initialized: boolean = false;

  private onPosition = (participant: string, name: string,
    x: number, y: number, z: number,
    yaw: number, pitch: number,
    scale: number,
    rooms: string[]
  ) => {
    x = Math.round(x * 100) / 100;
    y = Math.round(y * 100) / 100;
    z = Math.round(z * 100) / 100;

    try {
      if (!VoxeetSDK.conference.current) {
        console.log("not in a conference...");
        return;
      }
  
      //TODO for participant updates specifically when it's about the local participant,
      // in the future it'd be interesting to have a dedicated method which will update the whole scene 
      // for instance when the local participant leaves a room, it needs to update every participant's positions
  
      //update the rooms for the given participant
      participantRooms[participant] = rooms || [];
  
      const localParticipant = VoxeetSDK.session.participant;
  
      const participants = VoxeetSDK.conference.participants;
      var inConf = localParticipant;
      for (const entry of participants.entries()) {
        const [id, inConferenceParticipant] = entry;
        console.log(entry);
        if (inConferenceParticipant?.info?.externalId == participant) {
          inConf = inConferenceParticipant;
        }
      }
  
  
      if (!inConf) {
        console.log(`${participant} not found in conference`);
        return;
      }
 
      const originalYaw = yaw;
      yaw = (yaw + 180.0) % 360.0;

      //set the position infos
      if(participant === localParticipant.info?.externalId) {
        VoxeetSDK.conference.setSpatialDirection(localParticipant, {
          x: 0, y: yaw, z:0
        });
        const forwardVec = { x : 0, y: 0, z: 1};
        const upVec = { x : 0, y: 1, z: 0};
        const rightVec = { x : 1, y: 0, z: 0};
        const scaleVec = { x : scale, y: scale, z: scale};
        VoxeetSDK.conference.setSpatialEnvironment(scaleVec, forwardVec, upVec, rightVec);
      }
 
      var eventEmitted: ParticipantPositionUpdate = {
        participant, name, x, y, z, pitch, yaw: originalYaw, local: false
      };

      // now a specific method so that we check the impact of the rooms vs the world
      if (participant !== localParticipant.info?.externalId) {
        const localRooms = participantRooms[localParticipant.info?.externalId] || [];
        const remoteRooms = participantRooms[participant] || [];
  
        const intersectRooms = localRooms?.filter(room => remoteRooms.includes(room));
        console.log({localRooms, remoteRooms})
        if (intersectRooms.length > 0 || (localRooms.length == 0 && remoteRooms.length == 0)) {
          console.log("people are in the same room or not in any rooms");
          VoxeetSDK.conference.setSpatialPosition(inConf, { x, y, z });
        } else {
          console.log("people are not in the same place and shouldn't be able to hear themselves");
          VoxeetSDK.conference.setSpatialPosition(inConf, { x: 999999999, y: 999999999, z: 999999999 });
          eventEmitted = { ...eventEmitted, x: 999999999, y: 999999999, z: 999999999 };
        }
        eventEmitted.local = true;
      } else {
        // local participant, nothing to do
        // save the position to filter out everything in the future maybe :)
        VoxeetSDK.conference.setSpatialPosition(inConf, {x, y, z});
        eventEmitted.local = true;
      }

      this.emit("ParticipantPositionUpdate", eventEmitted);
    } catch(err) {
      console.log("having error in message", err);
    }
  };


}

export default new InternalSocketClass();