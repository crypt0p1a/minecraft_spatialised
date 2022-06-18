import request, {UriOptions, CoreOptions, UrlOptions } from "request";

type Options = (UriOptions & CoreOptions) | (UrlOptions & CoreOptions);

const precall = (url: string, method: string, qs?: any, json?: {}, headers?: {}): Promise<any|undefined> => {
  if(!headers) headers = {};

  var options: Options = {
    method: method,
    uri: url,
    headers: {"Content-Type": "application/json", ...headers},
  }
  if(json) options.json = json || true;
  if(qs) options.qs = qs || undefined;

  return new Promise((resolve, reject) => {
    request(options, (e, resp, body) => {
      try {
        if(typeof body == "string") {
          body = JSON.parse(body);
        }
      } catch(e) {
        //error ?
        console.log("parsing body error", e);
      }
      //@ts-ignore
      if(body && !body.error && resp.code != 401) resolve(body);
      else {
        console.log("network error", e);
        console.log("body?", body);
        console.log(e);
        reject({error : body ? body.error : "invalid result"});
      }
    });
  });
}

export default {
  get: (url: string, params?: any, headers?: {}) => precall(url, "GET", params, undefined, headers),
  post: (url: string, params?: any, headers?: {}) => precall(url, "POST", undefined, params, headers),
  put: (url: string, params?: any, headers?: {}) => precall(url, "PUT", undefined, params, headers)
};
