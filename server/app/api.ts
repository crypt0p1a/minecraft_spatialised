import { Router } from "express";
import calls from './calls';
import config from "./config";

const router = Router();

function btoa(value: string) {
  return Buffer.from(value).toString("base64");
}

interface TokenResult {
  token_type: "Bearer",
  access_token: string,
  refresh_token: string,
  expires_in: number
}

async function doRequest(): Promise<TokenResult> {
  const request = {
    host: "session.voxeet.com",
    path: "/v1/oauth2/token",
    consumerKey: config.audio.key || "",
    consumerSecret: config.audio.secret || "",
    body: JSON.stringify({ grant_type: 'client_credentials'})
  };

  const options = {
    hostname: request.host,
    port: 443,
    path: request.path,
    method: 'POST',
    headers: {
      'Authorization': "Basic " + btoa(encodeURI(request.consumerKey) + ":" + encodeURI(request.consumerSecret)),
      'Content-Type': 'application/json',
    }
  }

  const result = await calls.post("https://session.voxeet.com/v1/oauth2/token",
      { grant_type: 'client_credentials'}, options.headers );

  return result;
}

class API {
  public api: Router;

  public onRequestCode: (code: string) => Promise<string> = (code: string) => Promise.reject("not set");

  public constructor() {
    this.api = router;
    router.get("/videocalls/token", async (req, res) => {
      try {
        const result = await doRequest();
        return res.json({
          access_token: result.access_token,
          expires_in: result.expires_in,
        });
      } catch(e) {
        console.log("error", e);
        return res.status(403).json({ error: "Error" });
      }
    });
    
    router.get("/videocalls/request/:code", async (req, res) => {
      try {
        const code = req.params.code || "";
          console.log("code " + code);
        const uuid = await this.onRequestCode(code);

        return res.json({ uuid });
      } catch(e) {
        console.log("error", e);
        return res.status(403).json({ error: "Error" });
      }
    });
  }
}

const ApiInstance = new API();

export default ApiInstance;