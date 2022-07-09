import * as _ from 'lodash';
import * as React from "react";
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme, } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import Main from "./Main";
import InternalSocket from './InternalSocket';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#2e2c39',
      paper: '#2e2c39',
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Main />
      </ThemeProvider>
    </React.StrictMode>
  );
}

InternalSocket.init();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);