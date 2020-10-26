const express = require('express');
const { celebrate, Joi } = require('celebrate');
const usersRouter = require('./users');
const articlesRouter = require('./articles');
const { createUser, login } = require('../controllers/users');

const authorizationRouter = express.Router();
const registrationRouter = express.Router();

registrationRouter.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

authorizationRouter.post('/', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

module.exports = { registrationRouter, authorizationRouter, usersRouter, articlesRouter };
