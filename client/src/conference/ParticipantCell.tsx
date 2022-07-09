import * as React from 'react';
import { Alert, Avatar, Card, CardContent, CardHeader, Chip, Grid, LinearProgress, Typography } from '@mui/material';
import InternalSocket, { ParticipantPositionUpdate } from '../utils/InternalSocket';
import { Box } from '@mui/system';
import { Image } from '@mui/icons-material';

export interface Props {
  participant: string
}

interface State {
  position?: ParticipantPositionUpdate
}


export default class ParticipantCell extends React.PureComponent<Props, State> {

  state: State = { };

  public componentDidMount(): void {
    InternalSocket.addListener("ParticipantPositionUpdate", this.onParticipant);
  }

  public componentWillUnmount(): void {
    InternalSocket.removeListener("ParticipantPositionUpdate", this.onParticipant);
  }

  private onParticipant = (position: ParticipantPositionUpdate) => {
    const { participant } = this.props;

    if (participant !== position.participant) return;

    this.setState({ position });
  }

  private renderRemoteStatus() {
    if (!!this.state.position?.local) return <Chip color="success" label="local" variant="outlined" />;
    return <Chip color="primary" label="remote" variant="outlined" />;
  }

  private renderYaw() {
    const { position } = this.state;
    if (!position) return null;

    return <LinearProgress variant="determinate" value={((position.yaw + 180) % 360) * 100 / 360} />
  }

  render() {
    const { position } = this.state;
    if (!position) return null;

    const yaw = Math.round(position.yaw * 100) / 100;
    const pitch = Math.round(position.pitch * 100) / 100;

    return <Card sx={{ m: 1 }}>
      <CardContent>
        <CardHeader
          avatar={
            <Avatar src={`https://mc-heads.net/avatar/${position.participant}`}/>
          }

          title={position.name}
          subheader={position.participant}
        />
        <Box sx={{p: 2, flexGrow: 1 }}>
          <Grid container spacing={2} wrap="wrap">
            <Grid item xs={4} sm={4} xl={4}>
              <img src={`https://mc-heads.net/body/${position.participant}`} style={{maxHeight: 150, width: "100%", objectFit: "contain"}} />
            </Grid>

            <Grid item xs={8} sm={8} xl={8}>
              <Grid container spacing={1} sx={{ marginBottom: 2 }} wrap="wrap">
                {
                  [`x ${position.x}`,
                  `y ${position.y}`,
                  `z ${position.z}`,
                  `yaw ${yaw}`,
                  `pitch ${pitch}`,
                ].map(label => <Grid item xs={6} sm={12} xl={4} wrap="wrap">
                  <Chip color="primary" label={label}/>
                </Grid>)
                }

                <Grid item xs={6} sm={12} xl={4} wrap="wrap">
                  { this.renderRemoteStatus() }
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          { this.renderYaw() }
        </Box>
      </CardContent>
    </Card>;
  }
}