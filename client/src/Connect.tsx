import * as React from 'react';
import Button from '@mui/material/Button';
import { calls } from './utils';
import { Alert, Box, Card, CardActions, CardContent, CircularProgress, Divider, TextField, Typography } from '@mui/material';

export interface Props {
  onValidate: (minecraftId: string) => void
}

interface State {
  code?: string,
  loading?: boolean
}

export default class Connect extends React.Component<Props, State> {

  state: State = {
    code: localStorage.getItem("minecraftId") || ""
  };

  public componentDidMount(): void {

  }

  private async tryDefineCode() {
    try {
      this.setState({ loading: true });
      const code: string = this.state.code?.replace(/[^a-z0-9]/gmi, "") || "";
  
      const { uuid } = await calls.get(`/v1/videocalls/request/${code}`);
      if (!uuid) throw "invalid uuid obtained, is the code valid ?";
      localStorage.setItem("minecraftId", code);
      this.setState({ loading: false });

      this.props.onValidate(uuid);
    } catch(err) {
      alert("unable to get a code " + err);
      this.setState({ loading: false });
    }
  }

  render() {
    const { code, loading } = this.state;

    return <Card sx={{ m: 1 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Getting Started
        </Typography>
        <Box sx={{p: 2}}>
          <TextField
            required
            sx={{ m: 2 }}
            id="filled-required"
            label="Required"
            defaultValue="Register code"
            variant="filled"
            value={code}
            onChange={event => this.setState({code: event.target.value})}
          />


          <Alert severity="success" sx={{ m: 2}}>Connect to eden.codlab.eu</Alert>
          <Alert severity="info" sx={{ m: 2}}>use the command /dolbyio-register</Alert>
        </Box>
        <Divider />
      </CardContent>
      <CardActions>
        { !loading
          ? <Button size="small" onClick={() => this.tryDefineCode()}>Click to join the audio session</Button>
          : <CircularProgress /> }
      </CardActions>
    </Card>;
  }
}