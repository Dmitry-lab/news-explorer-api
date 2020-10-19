const jwt = require('jsonwebtoken');
const AuthorizationError = require('../errors/authorization-error');

const { NODE_ENV, JWT_SECRET } = process.env;
const LOCAL_KEY = 'c2c32d14dbc2be2c8fbed1b67c63dd794601f4e0051fc26fae3150e0db0c86a6';

module.exports = (req, res, next) => {
  if (!req.cookies.jwt) {
    return next(new AuthorizationError('Необходима авторизация'));
  }

  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : LOCAL_KEY);
  } catch (err) {
    return next(new AuthorizationError('Необходима авторизация'));
  }

  req.user = payload;
  console.log(payload);
  return next();
};
