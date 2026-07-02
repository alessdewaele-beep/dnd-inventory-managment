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

    let data;
    try {
      data = await res.json();
    } catch (cause) {
      throw new ParseError(url, cause);
    }

    if (!res.ok) {
      // Alleen wanneer er ook echt een token werd meegestuurd betekent 401
      // "sessie verlopen/ongeldig". Zonder token (bv. mislukte login) laten
      // we de aanroeper zelf de fout afhandelen.
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
