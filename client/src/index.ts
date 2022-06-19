import VoxeetSDK from 'voxeet-sdk';
import * as _ from 'lodash';
import io from "socket.io-client";
import calls from './calls';

function component() {
  const minecraftId = localStorage.getItem("minecraftId") || "";

  const element = document.createElement('div');

  const name = document.createElement('input');
  name.setAttribute("type", "text");
  name.setAttribute("id", "minecraftId");
  name.setAttribute("value", minecraftId);

  const button = document.createElement("INPUT");
  button.setAttribute("type", "button");
  button.setAttribute("value", "click to connect after issuing /dolbyio-register in minecraft");
  button.onclick = async () => {
    try {
      await initialize();
      //@ts-ignore
      var code: string = document.getElementById("minecraftId").value || "";
      code = code.replace(/[^a-z0-9]/gmi, "");
  
      const { uuid } = await calls.get(`/v1/videocalls/request/${code}`);
      if (!uuid) throw "invalid uuid obtained, is the code valid ?";
      localStorage.setItem("minecraftId", code);
      await openAndJoin(uuid);
    } catch(err) {
      console.error(err);
      alert(`An error occured ${err}`);
    }
  }

  element.append(name, button);

  return element;
}

async function newToken() {
  const call = await calls.get("/v1/videocalls/token");
  return call.access_token;
}

async function initialize() {
  try {
    const accessToken = await newToken();
    await VoxeetSDK.initializeToken(accessToken, (isExpired: boolean) => {
      return newToken();
    });
  } catch(err) {
    console.error(err);
    alert(`error ${err}`);
  }
}

async function openAndJoin(minecraftId: string) {
  try {
    await VoxeetSDK.session.open({ name: minecraftId, externalId: minecraftId});
  } catch(err) {
    console.error(err);
    alert(`error ${err}`);
  }

  try {
    const conferenceAlias = "minecraft";

    const conference = await VoxeetSDK.conference.create({ alias: conferenceAlias,
      params: {
        dolbyVoice: true,
      }
    });

    await VoxeetSDK.conference.join(conference, { 
      preferRecvMono: false,
      spatialAudio: true});
  } catch(err) {
    console.error(err);
    alert(`error ${err}`);
  }
}

document.body.appendChild(component());

io().on("position", (participant, x,y,z, yaw) => {
  try {
    if (!VoxeetSDK.conference.current) {
      console.log("not in a conference...");
      return;
    }

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

    //yaw = (-yaw + 180.0) % 360.0;
    //set the position infos
    if(participant === localParticipant.info?.externalId) {
      VoxeetSDK.conference.setSpatialDirection(localParticipant, {
        x: 0, y: yaw, z:0
      });
    }

    VoxeetSDK.conference.setSpatialPosition(inConf, {x,y,z});
  } catch(err) {
    console.log("having error in message", err);
  }
});