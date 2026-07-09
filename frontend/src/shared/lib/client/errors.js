// Turns an HTTP failure into a message a user can actually understand.
// The backend sends a human-readable reason in `body.error` (or `body.message`)
// for the cases it knows about (e.g. "Incorrect username or password."); we
// prefer that. Otherwise we fall back to a friendly, status-based message
// instead of a technical "failed with status 4xx" string.
function friendlyHttpMessage(status, body) {
  const fromBody = body && (body.error || body.message);
  if (fromBody) return fromBody;

  switch (status) {
    case 400:
      return "Something in your input wasn't right. Please check and try again.";
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "You don't have permission to do that.";
    case 404:
      return "We couldn't find what you were looking for.";
    case 409:
      return "That conflicts with something that already exists.";
    default:
      if (status >= 500) {
        return "Something went wrong on our end. Please try again in a moment.";
      }
      return "Something went wrong. Please try again.";
  }
}

export class NetworkError extends Error {
  constructor(url, cause) {
    super("Could not reach the server. Please check your connection and try again.");
    this.name = "NetworkError";
    this.url = url;
    this.cause = cause;
  }
}

export class HTTPError extends Error {
  constructor(url, status, body) {
    super(friendlyHttpMessage(status, body));
    this.name = "HTTPError";
    this.status = status;
    this.body = body;
    this.url = url;
  }
}

export class ParseError extends Error {
  constructor(url, cause) {
    super("Something went wrong while reading the server's response. Please try again.");
    this.name = "ParseError";
    this.url = url;
    this.cause = cause;
  }
}
