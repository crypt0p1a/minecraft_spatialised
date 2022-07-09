import cors from 'cors';
import { Server as IOServer } from "socket.io";
import express from "express";
import body_parser from "body-parser";
import path from "path";

import http, { Server } from "http";
import https from "https";

import { WebSocketServer, WebSocket } from "ws";

import config from "./config";
import API from "./api";
import fs from "fs";

interface MapUUID {
  [uuid: string]: { name: string, x: number, y:number, z: number, yaw: number, pitch: number, scale: number, rooms: string[]}
}

interface PositionUpdate {
  type: "PositionUpdate",
  positions: MapUUID
}
interface SendUUID {
  type: "SendUUID";
  requestID: string;
  uuid: string;
}

interface RequestUUID {
  type: "RequestUUID";
  requestID: string;
  code: string;
}

type MessageFromMinecraft = PositionUpdate|SendUUID;
type WebSocketMinecraft = WebSocket | {send: (message: any) => void};

export default class ApiServer {

  webSocketServer?: WebSocketServer;
  app?: any;
  server?: Server;
  io?: IOServer;
  current_websocket?: WebSocketMinecraft;

  start() {
    this.webSocketServer = new WebSocketServer(config.ws);

    this.webSocketServer.on("connection", (socket) => {
      console.log("on connection from minecraft socket");
      this.current_websocket = socket;
      socket.on("message", data => {
        const str = `${data}`;
        const result = this.manageMessage(socket, str);

        if(!!result) {
          socket.send(result);
        }
      })
    })

    API.onRequestCode = code => this.onRequestCode(code);

    if(this.app) {
      console.log("server already listening");
      return false;
    }
    this.app = express();
  
    this.app
    .set('view engine', 'ejs')
    .set('views', path.join(__dirname, '../views'))
    .use(cors())
    .use(express.static(path.join(__dirname, '../../public')))
    .use(body_parser.json())
    .use("/v1", API.api)


    const {
      path_key,
      path_cert,
      path_ca
    } = config.server.optional_https;

    const allValid = ![path_ca, path_cert, path_key].find(str => null === str || undefined === str || 0 === str.length);
    if (allValid && !!path_key && !!path_cert && !!path_ca) { //last to make typescript happy
      console.log("using https server");
      this.server = https.createServer({
        key: fs.readFileSync(path_key),
        cert: fs.readFileSync(path_cert),
        ca: fs.readFileSync(path_ca)
      }, this.app);
    } else {
      console.log("using http server");
      this.server = http.createServer(this.app);
    }
    
    this.io = new IOServer(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    this.server.listen(config.server.port, config.server.host);
  
    console.log(`server is now listening on ${config.server.host}:${config.server.port}`);
    console.log(`websocket is now listening on ${config.ws.host}:${config.ws.port}`);
  
    return true;
  }

  private requestsForUUID: any = {};

  private async onRequestCode(code: string) {
    if (!this.current_websocket) throw "";

    const id = `${Math.random()}`;
    const request = {
      type: "RequestUUID",
      id,
      code
    };

    return new Promise<string>((resolve, reject) => {
      this.requestsForUUID[id] = {id, request, resolve, reject};
      this.current_websocket?.send(JSON.stringify(request));

      setTimeout(() => {
        if (this.requestsForUUID[id]) {
          const { resolve, reject } = this.requestsForUUID[id];
          this.requestsForUUID[id] = undefined;
          delete this.requestsForUUID[id];
          reject("timeout");
        }
      }, 5000);
    });
  }

  private manageMessage(socket: WebSocket, message: string): string|null {
    try {
      const object = JSON.parse(message) as MessageFromMinecraft;

      switch(object.type||"") {
        case "SendUUID": {
          const SendUUID: SendUUID = object as SendUUID;
          const { requestID, uuid } = SendUUID;

          if (this.requestsForUUID[requestID]) {
            const { resolve } = this.requestsForUUID[requestID];
            this.requestsForUUID[requestID] = undefined;
            delete this.requestsForUUID[requestID];

            resolve(SendUUID.uuid);
          }
          break;
        }
        case "PositionUpdate": {
          const PositionUpdate: PositionUpdate = object as PositionUpdate;
          const uuids = Object.keys(PositionUpdate?.positions);
          uuids.forEach(uuid => {
            const position = PositionUpdate?.positions[uuid];
            console.log(`forwarding to ${uuid}`, position);
            
            if (!position) return;

            const { name, x, y, z, yaw, pitch, scale, rooms } = position;

            this.io?.emit("position", uuid, name, x, y, z, yaw, pitch, scale, rooms);
          });
          break;
        }
        default:
          console.log("unknown object", object);
      }
      console.log(object);
    } catch(err) {
      console.log("error with " + message);
      console.error(err);
    }
    return null;
  }
}

new ApiServer().start();