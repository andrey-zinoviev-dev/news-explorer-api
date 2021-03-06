const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let { SECRET_KEY } = process.env;

const { NODE_ENV } = process.env;

if (!NODE_ENV || NODE_ENV !== 'production') {
  SECRET_KEY = 'SUPERSECRETDATA';
}

const User = require('../models/user');
const BadRequestError = require('../errors/badRequestError');
const ConflictError = require('../errors/conflictError');

const registerUser = (req, res, next) => {
  const { email, password, name } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictError(`Пользователь с почтой ${email} уже существует`);
      }
      return bcrypt.hash(password, 10)
        .then((hash) => {
          User.create({ email, password: hash, name })
            .then(() => {
              res.status(201).send({ message: 'Пользователь успешно создан!' });
            })
            .catch(() => {
              next(new BadRequestError('Проверьте почту, пароль или имя'));
            });
        });
    })
    .catch((err) => {
      next(err);
    });
};

const loginUser = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Проверьте почту или пароль');
  }
  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new BadRequestError('Проверьте почту или пароль');
      }
      bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new BadRequestError('Проверьте почту или пароль');
          }
          const token = jwt.sign({ _id: user._id }, SECRET_KEY);
          return res.status(200).send({ payload: token });
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

const showCurrentUser = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch(() => {
      next(new BadRequestError('Неправильный пользователь'));
    });
};

module.exports = {
  registerUser,
  loginUser,
  showCurrentUser,
};
