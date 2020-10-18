require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const limiter = require('./middlewares/limiter');
const { registrationRouter, authorizationRouter } = require('./routes/index');
const NotFoundError = require('./errors/notfound-error');

const app = express();
const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/newsprojectdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(limiter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/signup', registrationRouter);
app.use('/signin', authorizationRouter);

app.use((req, res, next) => next(new NotFoundError('Запрашиваемый ресурс не найден')));
app.use(errors());
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  const errJSON = statusCode === 500 ? { message: `Ошибка сервера ${err}` } : { message };
  res.status(statusCode).send(errJSON);
  next();
});

app.listen(PORT, () => {
  console.log(`Listen ${PORT}`);
});
