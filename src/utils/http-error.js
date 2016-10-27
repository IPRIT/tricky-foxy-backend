export class HttpError extends Error {

  constructor(message = 'Unknown error', httpCode = 200, restParams = {}) {
    super(message);
    
    this.description = message;
    this.httpCode = httpCode;
    this.restParams = restParams;
  }
}