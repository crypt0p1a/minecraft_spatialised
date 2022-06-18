//@ts-ignore
import dotenv from "dotenv";

dotenv.config();

export default {
  audio: {
    key: process.env.DOLBYIO_KEY,
    secret: process.env.DOLBYIO_SECRET,
  },
  ws: {
    host: process.env.INTERNAL_WEBSOCKET_HOST || "127.0.0.1",
    port: parseInt(process.env.INTERNAL_WEBSOCKET_PORT || "") || 10000,
  },
  server: {
    host: process.env.PUBLIC_SERVER_HOST,
    port: parseInt(process.env.PUBLIC_SERVER_PORT || "") || 9999,
    optional_https: {
      path_key: process.env.HTTPS_FILE_PATH_KEY,
      path_cert: process.env.HTTPS_FILE_PATH_CERT,
      path_ca: process.env.HTTPS_FILE_PATH_CA,
    }
  }
}