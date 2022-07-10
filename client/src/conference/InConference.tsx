import * as React from 'react';
import Devices from "./Devices";
import { Grid, TextField } from '@mui/material';
import InternalSocket, { ParticipantPositionUpdate } from '../utils/InternalSocket';
import ParticipantCell from './ParticipantCell';
import Screenshare from './Screenshare';

export interface Props {

}

interface State {
  participants: ParticipantPositionUpdate[]
}


export default class InConference extends React.Component<Props, State> {

  state: State = { participants: [] };

  public componentDidMount(): void {
    InternalSocket.addListener("ParticipantPositionUpdate", this.onParticipant);
  }

  public componentWillUnmount(): void {
    InternalSocket.removeListener("ParticipantPositionUpdate", this.onParticipant);
  }

  private onParticipant = (positionUpdate: ParticipantPositionUpdate) => {
    const { participants } = this.state;

    if (!!participants.find(p => p.participant == positionUpdate.participant)) return;

    this.setState({ participants: [...participants, positionUpdate] });
  }

  render() {
    return (
      <Grid container spacing={2} wrap="wrap">
        <Grid item xs={12} sm={6} xl={4}>
          <Devices />
        </Grid>
        <Grid item xs={12} sm={6} xl={4}>
          <Screenshare />
        </Grid>

        { this.state.participants.map(p => 
          <Grid item xs={12} sm={6} xl={4}>
            <ParticipantCell participant={p.participant} />
          </Grid>) }
      </Grid>
    );
  }
}