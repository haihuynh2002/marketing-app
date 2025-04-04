const http = require('http')
const pinoNoir = require('pino-noir')
const pinoLogger = require('express-pino-logger')

function cors(req, res, next) {
  const origin = req.headers.origin;

  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, DELETE, OPTIONS, XMODIFY"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );

  next();
}

function csrf(req, res, next) {
  res.cookie('SameSite', 'Strict');
  next();
}

function handleError(err, req, res, next) {
    console.error(err);
    if(res.headersSent) return next(err);
    
    const statusCode = err.statusCode || 500;
    const errorMessage = http.STATUS_CODES[statusCode] || 'Internal Error';
    res.status(statusCode).json({ error: errorMessage });
}

function notFound(req, res) {
    res.status(404).json({ error: 'Not Found' });
}

function logger () {
  return pinoLogger({
    serializers: pinoNoir([
      'res.headers.set-cookie',
      'req.headers.cookie',
      'req.headers.authorization'
    ])
  })
}

module.exports = {
  logger: logger(),
  cors,
  csrf,
  handleError,
  notFound
}
