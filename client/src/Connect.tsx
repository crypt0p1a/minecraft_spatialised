import * as React from 'react';
import Button from '@mui/material/Button';
import calls from './calls';
import { Box, Card, CardActions, CardContent, CircularProgress, TextField, Typography } from '@mui/material';

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

    return <Card>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Getting Started
        </Typography>
        <Box>
          <TextField
            required
            id="filled-required"
            label="Required"
            defaultValue="Register code"
            variant="filled"
            value={code}
            onChange={event => this.setState({code: event.target.value})}
          />
        </Box>
      </CardContent>
      <CardActions>
        { !loading
          ? <Button size="small" onClick={() => this.tryDefineCode()}>Init &amp; Connect</Button>
          : <CircularProgress /> }
      </CardActions>
    </Card>;
  }
}