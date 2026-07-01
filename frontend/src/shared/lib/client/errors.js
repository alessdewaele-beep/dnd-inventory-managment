export class NetworkError extends Error {
  constructor(url, cause) {
    super(`Network request failed: ${url}`);
    this.name = "NetworkError";
    this.cause = cause;
  }
}

export class HTTPError extends Error {
  constructor(url, status, body) {
    super(`Request to ${url} failed with status ${status}`);
    this.name = "HTTPError";
    this.status = status;
    this.body = body;
  }
}

export class ParseError extends Error {
  constructor(url, cause) {
    super(`Failed to parse response from ${url}`);
    this.name = "ParseError";
    this.cause = cause;
  }
}
