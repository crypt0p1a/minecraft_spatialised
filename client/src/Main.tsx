import * as React from 'react';
import calls from './utils/calls';
import VoxeetSDK from 'voxeet-sdk';
import { LinearProgress } from '@mui/material';
import Connect from './Connect';
import { Container } from '@mui/system';
import { InConference } from './conference';

export interface Props {

}

interface State {
  initialized?: boolean,
  loading?: boolean
}

async function newToken() {
  const call = await calls.get("/v1/videocalls/token");
  return call.access_token;
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

export default class Main extends React.Component<Props, State> {

  state: State = { };

  public componentDidMount(): void {

  }

  private _initialized = false;
  private async initialize(minecraftId: string) {
    this.setState({loading: true});
    try {
      if (!this._initialized) {
        const accessToken = await newToken();
        await VoxeetSDK.initializeToken(accessToken, (isExpired: boolean) => newToken());
        this._initialized = true;
      }
    } catch(err) {
      console.error(err);
      alert(`error ${err}`);
    }

    try {
      await openAndJoin(minecraftId);
      this.setState({ initialized: true });
    } catch(err) {
      this.setState({ initialized: false });
      alert(`error ${err}`);
    }

    this.setState({loading: false});
  }

  render() {
    const { loading, initialized } = this.state;

    if (loading) return <Container maxWidth="xl">
      <LinearProgress />
    </Container>;

    if (initialized) {
      return <InConference />;
    }

    return <Container maxWidth="xs">
      <Connect onValidate={minecraftId => this.initialize(minecraftId)}/>
    </Container>;
  }
}