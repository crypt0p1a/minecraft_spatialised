
async function precall(url: string, method: string, qs?: any, body?: BodyInit, headers?: {}): Promise<any|undefined> {
  if(!headers) headers = {};

  //TODO query params
  const response = await fetch(url, {
    method, 
    headers: {"Content-Type": "application/json", ...headers},
    body
  });

  return response.json();
}

export default {
  get: (url: string, params?: any, headers?: {}) => precall(url, "GET", params, undefined, headers),
  post: (url: string, params?: any, headers?: {}) => precall(url, "POST", undefined, params, headers),
  put: (url: string, params?: any, headers?: {}) => precall(url, "PUT", undefined, params, headers)
};
