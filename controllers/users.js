const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { NODE_ENV, JWT_SECRET } = process.env;
const User = require('../models/user');
const ConflictError = require('../errors/conflict-error');
const RequestError = require('../errors/request-error');

const SALT_ROUNDS = 10;
const LOCAL_KEY = 'c2c32d14dbc2be2c8fbed1b67c63dd794601f4e0051fc26fae3150e0db0c86a6';

module.exports.createUser = (req, res, next) => {
  const { name, password, email } = req.body;

  bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => User.create({ name, email, password: hash }))
    .then(() => {
      res.status(201).send({ data: { name, email } });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new RequestError(`Ошибка создания пользователя ${err} Проверьте корректность переданных данных.`));
      } else if (err.name === 'MongoError' && err.code === 11000) {
        next(new ConflictError(`Ошибка создания пользователя ${err} пользователь с таким email уже существует.`));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCreditians(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : LOCAL_KEY,
        { expiresIn: '7d'},
      );

      res.cookie('jwt', token, { httpOnly: true }).end();
    })
    .catch(next);
};
