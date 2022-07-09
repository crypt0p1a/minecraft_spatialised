import * as React from 'react';

export interface Props {

}

interface MediaDeviceHolder {
  input?: string,
  output?: string,
  inputs: MediaDeviceInfo[],
  outputs: MediaDeviceInfo[]
}

interface State {
  audioDevices?: MediaDeviceHolder
}

import VoxeetSDK from 'voxeet-sdk';
import { Card, CardContent, CardHeader, Divider, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

export default class Devices extends React.Component<Props, State> {

  state: State = {
    audioDevices: {
      inputs: [], outputs: []
    }
  };

  public componentDidMount(): void {
    this.updateDevices();
  }

  private selectInput = async (event: SelectChangeEvent) => this.selectDevice(event.target.value, (value: string) => VoxeetSDK.mediaDevice.selectAudioInput(value));

  private selectOutput = async (event: SelectChangeEvent) => this.selectDevice(event.target.value, (value: string) => VoxeetSDK.mediaDevice.selectAudioOutput(value));

  private async selectDevice(id: string|undefined, set: (value: string) => Promise<string>) {
    try {
      if (!id) {
        alert(`cancelled, id is invalid = ${id}`);
        return;
      }

      const selected = await set(id);
      console.log("device selected", selected);
      return selected;
    } catch (err) {
      alert(`Error while updating device (id=${id}) : ${err}`)
    }
  }

  private async updateDevices() {
    try {
      const [inputs, outputs] = await Promise.all([
        VoxeetSDK.mediaDevice.enumerateAudioInputDevices(),
        VoxeetSDK.mediaDevice.enumerateAudioOutputDevices()
      ]);
      console.log(inputs);
      console.log(outputs);

      this.setState({ audioDevices: { inputs, outputs } })
    } catch(err) {
      console.log("updateDevices error", err);
    }
  }

  private deviceName({ deviceId, groupId, kind, label }: MediaDeviceInfo) {
    return [/*deviceId, groupId, kind,*/ label].filter((str, index) => !!str && str.length > 0).join(" :: ");
  }

  public render() {
    const { inputs, outputs } = this.state.audioDevices;
    return <Card sx={{ m: 1 }}>
      <CardHeader title="audio devices"/>
      <CardContent>
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="demo-simple-select-label">Input</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={this.state.audioDevices.input}
            label="Age"
            onChange={this.selectInput}
          >
            { inputs.map(input => <MenuItem value={input.deviceId}>{this.deviceName(input)}</MenuItem>)}
          </Select>
        </FormControl>

        <Divider />

        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <InputLabel id="demo-simple-select-label">Ouput</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={this.state.audioDevices.output}
            label="Age"
            onChange={this.selectOutput}
          >
            { outputs.map(output => <MenuItem value={output.deviceId}>{this.deviceName(output)}</MenuItem>)}
          </Select>
        </FormControl>
      </CardContent>
    </Card>;
  }
}