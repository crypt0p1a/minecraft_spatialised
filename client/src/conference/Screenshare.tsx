import * as React from 'react';
import VoxeetSDK from 'voxeet-sdk';
import { Button, Card, CardActions, CardContent, CardHeader } from '@mui/material';

export interface Props {

}

interface State {
  screenshare?: boolean,
  local?: boolean,
}


export default class Screenshare extends React.Component<Props, State> {

  private _video?: HTMLVideoElement|null;

  state: State = {
  };

  public componentDidMount(): void {
    VoxeetSDK.conference.on("streamAdded", this.onStreamAdded);
    VoxeetSDK.conference.on("streamRemoved", this.onStreamRemoved);
  }

  private onStreamAdded = (participant: any, stream: MediaStream) => {
    console.log(participant);
    //@ts-ignore
    if (stream.type !== "ScreenShare" || !stream.getVideoTracks().length) return;
    this._video.autoplay = true;
    //@ts-ignore
    navigator.attachMediaStream(this._video, stream);

    this.setState({ local: participant?.id === VoxeetSDK.session.participant?.id });
  }

  private onStreamRemoved = (participant: any, stream: MediaStream) => {
    //@ts-ignore
    if (stream.type !== "ScreenShare") return;
    this._video.srcObject = null; // Prevent memory leak in Chrome
  }

  private async startScreenshare() {
    try {
      await VoxeetSDK.conference.startScreenShare();
      this.setState({ screenshare: true});
    } catch(err) {

    }
  }

  private async stopScreenshare() {
    try {
      await VoxeetSDK.conference.stopScreenShare();
      this.setState({ screenshare: false});
    } catch(err) {

    }
  }

  private fullscreen() {
    if (!this._video) return;
    const element: any = this._video;

    if (element.requestFullscreen) 
      element.requestFullscreen();
    else if (element.webkitRequestFullscreen) 
      element.webkitRequestFullscreen();
    else if (element.msRequestFullScreen) 
      element.msRequestFullScreen();
  }

  public render() {
    const { screenshare, local } = this.state;
    const canScreenshare = !screenshare;
    const canStop = screenshare && local;

    return <Card sx={{ m: 1 }}>
      <CardHeader title="screenshare"/>
      <CardContent>
        <video style={{width: "100%", height: "100%"}} ref={video => this._video = video}/>
      </CardContent>
      <CardActions>
        {!!canScreenshare && <Button size="small" onClick={() => this.startScreenshare()}>Start</Button>}
        {!!canStop && <Button size="small" onClick={() => this.stopScreenshare()}>Stop</Button>}
        {!!screenshare && <Button size="small" onClick={() => this.fullscreen()}>Fullscreen</Button>}
      </CardActions>
    </Card>;
  }
}