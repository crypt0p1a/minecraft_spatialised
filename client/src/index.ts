import VoxeetSDK from 'voxeet-sdk';
import * as _ from 'lodash';
import io from "socket.io-client";
import calls from './calls';

interface ParticipantRooms {
  [participant: string]: string[]
}

const participantRooms: ParticipantRooms = {};

var inputDevices = document.createElement("select");
var outputDevices = document.createElement("select");

function namedItem(select: HTMLSelectElement, device: MediaDeviceInfo) {
  var index = 0;
  while(index < select.options.length) {
    const item = select.options.item(index);
    if (!!item && item.value === device.deviceId) return item;
    index++;
  }
  return null;
}

function updateInput(type: "input"|"output", input: HTMLSelectElement, devices?: MediaDeviceInfo[]) {
  if (!devices) return;

  devices.forEach(device => {
    //namedItem wasn't working with value(?) so using old way
    const found = namedItem(input, device);
    if (!!found) return;

    const option = document.createElement("option");
    option.value = device.deviceId;
    option.text = `${device.label} (${type})`;
    input.options.add(option);
  });

  var index = 0;
  const options = input.options;
  while(index < options.length) {
    if (!!devices.find(d => d.deviceId === options.item(index)?.id)) {
      index ++;
    } else {
      input.options.remove(index);
    }
  }

  if (options.length != devices.length) {
    //alert("error in the device update, the input values will differ ");
  }
}

function selectDevice(select: HTMLSelectElement, setter: (id: string) => Promise<string>) {
  return async () => {
    var value: string|null|undefined;
    try {
      const selectedValue = select.selectedOptions.item(0);
      value = selectedValue?.value;
      console.log("update device ", value);
      if (!value) {
        alert(`cancelled, id is invalid = ${value}`);
        return;
      }

      await VoxeetSDK.mediaDevice.selectAudioOutput(value);
    } catch(err) {
      alert(`Error while updating device (id=${value}) : ${err}`)
    }
  }
}

async function updateDevices() {
  const [inputs, outputs] = await Promise.all([
    VoxeetSDK.mediaDevice.enumerateAudioInputDevices(),
    VoxeetSDK.mediaDevice.enumerateAudioOutputDevices()
  ]);
  console.log(inputs);
  console.log(outputs);

  updateInput("input", inputDevices, inputs);
  updateInput("output", outputDevices, outputs);

  inputDevices.onchange = selectDevice(inputDevices,
    id => VoxeetSDK.mediaDevice.selectAudioInput(id));

  outputDevices.onchange = selectDevice(outputDevices,
    id => VoxeetSDK.mediaDevice.selectAudioOutput(id));
}

function component() {
  updateDevices();
  console.log("loading default");
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
      await updateDevices();
      await initialize();
      //@ts-ignore
      var code: string = document.getElementById("minecraftId").value || "";
      code = code.replace(/[^a-z0-9]/gmi, "");
  
      const { uuid } = await calls.get(`/v1/videocalls/request/${code}`);
      if (!uuid) throw "invalid uuid obtained, is the code valid ?";
      localStorage.setItem("minecraftId", code);
      await openAndJoin(uuid);

      await updateDevices();
    } catch(err) {
      console.error(err);
      alert(`An error occured ${err}`);
    }
  }

  element.append(name, button, inputDevices, outputDevices);

  updateDevices();

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

io().on("position", (participant, x, y, z, yaw, pitch, scale, rooms) => {
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

    // now a specific method so that we check the impact of the rooms vs the world
    if(participant !== localParticipant.info?.externalId) {
      const localRooms = participantRooms[localParticipant.info?.externalId] || [];
      const remoteRooms = participantRooms[localParticipant.info?.externalId] || [];

      const intersectRooms = localRooms?.filter(room => remoteRooms.includes(room));
      if (intersectRooms.length > 0 || (localRooms.length == 0 && remoteRooms.length == 0)) {
        console.log("people are in the same room or not in any rooms");
        VoxeetSDK.conference.setSpatialPosition(inConf, { x, y, z });
      } else {
        console.log("people are not in the same place and shouldn't be able to hear themselves");
        VoxeetSDK.conference.setSpatialPosition(inConf, { x: Number.MAX_VALUE, y: Number.MAX_VALUE, z: Number.MAX_VALUE });
      }
    } else {
      // local participant, nothing to do
      // save the position to filter out everything in the future maybe :)
      VoxeetSDK.conference.setSpatialPosition(inConf, {x, y, z});
    }
  } catch(err) {
    console.log("having error in message", err);
  }
});