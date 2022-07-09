import * as React from 'react';
import Devices from "./Devices";
import { Grid } from '@mui/material';

export interface Props {

}

interface State {
}


export default class InConference extends React.Component<Props, State> {

  state: State = { };

  public componentDidMount(): void {

  }

  render() {
    return (
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Devices />
        </Grid>
      </Grid>
    );
  }
}