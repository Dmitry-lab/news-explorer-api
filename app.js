require('dotenv').config();
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const limiter = require('./middlewares/limiter');
const auth = require('./middlewares/auth');
const { registrationRouter, authorizationRouter, usersRouter, articlesRouter } = require('./routes/index');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/notfound-error');

const app = express();
const { PORT = 3000, NODE_ENV, CONNECTION_STRING } = process.env;
const dbConnectionString = NODE_ENV === 'production' ? CONNECTION_STRING : 'mongodb://localhost:27017/newsprojectdb';
const options = {
  origin: ['http://localhost:3000', 'https://newsprj.students.nomoreparties.space'],
  credentials: true,
};

mongoose.connect(dbConnectionString, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(cors(options));
app.use(limiter);
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use('/signup', registrationRouter);
app.use('/signin', authorizationRouter);

app.use(auth);
app.use('/users', usersRouter);
app.use('/articles', articlesRouter);

app.use(errorLogger);
app.use((req, res, next) => next(new NotFoundError('Запрашиваемый ресурс не найден')));
app.use(errors());
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  const errJSON = statusCode === 500 ? { message: 'Ошибка сервера.' } : { message };
  res.status(statusCode).send(errJSON);
  next();
});

app.listen(PORT, () => {
  console.log(`Listen ${PORT}`);
});
