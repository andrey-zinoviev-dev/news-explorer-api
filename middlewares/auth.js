const jwt = require('jsonwebtoken');

const { SECRET_KEY = 'SUPERSECRETDATA' } = process.env;
const UnauthorizedError = require('../errors/unauthorizedError');

const auth = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.replace('Bearer ', '');
    try {
      const payload = jwt.verify(token, SECRET_KEY);
      req.user = payload;
      next();
    } catch (err) {
      throw new UnauthorizedError('Неверный токен');
    }
  } else {
    next(new UnauthorizedError('Необходима авторизация'));
  }
};

module.exports = auth;
