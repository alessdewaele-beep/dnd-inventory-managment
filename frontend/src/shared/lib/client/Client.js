import { NetworkError, HTTPError, ParseError } from "./errors";

const ClientHelper = {
  getFullURI(relativePath, id = null) {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    if (relativePath.indexOf("/") !== 0) {
      relativePath = "/" + relativePath;
    }

    if (id) {
      relativePath += `/${id}`;
    }

    return baseUrl + relativePath;
  },

  async callAPI(relativePath, method = "GET", id = null, dataObject = null) {
    const url = ClientHelper.getFullURI(relativePath, id);
    const token = localStorage.getItem("JWT_token");

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    if (["POST", "PATCH", "PUT"].includes(method) && dataObject) {
      options.body = JSON.stringify(dataObject);
    }

    let res;
    try {
      res = await fetch(url, options);
    } catch (cause) {
      throw new NetworkError(url, cause);
    }

    // Read the body as text first, then try to parse it as JSON. This way an
    // empty or non-JSON body (e.g. a bare 500 or a proxy error page) does not
    // crash with a ParseError that hides the real HTTP status.
    const rawBody = await res.text();
    let data = null;
    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch (cause) {
        // A successful response is expected to be JSON; if it isn't, that is a
        // genuine parse problem. On an error response we keep data = null and
        // let HTTPError produce a friendly status-based message instead.
        if (res.ok) throw new ParseError(url, cause);
      }
    }

    if (!res.ok) {
      // Only when a token was actually sent does a 401 mean
      // "session expired/invalid". Without a token (e.g. a failed login) we
      // let the caller handle the error itself.
      if (res.status === 401 && token) {
        localStorage.removeItem("JWT_token");
        window.location.hash = "#/";
      }
      throw new HTTPError(url, res.status, data);
    }

    return data;
  },
};

const Client = {
  async getAll(relativePath) {
    return ClientHelper.callAPI(relativePath);
  },

  async get(relativePath, id) {
    return ClientHelper.callAPI(relativePath, "GET", id);
  },

  async post(relativePath, dataObject) {
    return ClientHelper.callAPI(relativePath, "POST", null, dataObject);
  },

  async patch(relativePath, id, dataObject) {
    return ClientHelper.callAPI(relativePath, "PATCH", id, dataObject);
  },

  async put(relativePath, id, dataObject) {
    return ClientHelper.callAPI(relativePath, "PUT", id, dataObject);
  },

  async delete(relativePath, id) {
    return ClientHelper.callAPI(relativePath, "DELETE", id);
  },
};

export default Client;
