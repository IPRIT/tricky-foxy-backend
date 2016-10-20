const defaultErrorMessage = 'Internal Server Error';

export function ClientError(err, req, res, next) {
  if (err.httpCode) {
    console.error('Client Error', err);
    if (req.hasOwnProperty('isJsonRequest') && !req.isJsonRequest) {
      //todo
    } else {
      res.status(err.httpCode).json({
        error: err
      });
    }
  } else {
    next(err);
  }
}

export function ServerError(err, req, res, next) {
  console.error('Server Error', err);
  if (res.headersSent) {
    return next(err);
  }
  const isDevelopmentMode = process.env.NODE_ENV === 'development';
  let errorMessage = isDevelopmentMode ?
    err && err.message || defaultErrorMessage : defaultErrorMessage;
  
  if (req.hasOwnProperty('isJsonRequest') && !req.isJsonRequest) {
    // todo
  } else {
    res.status(500).json({
      error: {
        description: errorMessage,
        httpCode: 500,
        restParams: err.restParams || {}
      }
    });
  }
}