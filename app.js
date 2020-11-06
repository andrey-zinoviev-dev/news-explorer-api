require('dotenv').config();
const { SECRET_KEY } = process.env;
console.log(SECRET_KEY);
const express = require ('express');
const bodyParser = require ('body-parser');
const mongoose = require ('mongoose');
const auth = require('./middlewares/auth');
const { registerUser, loginUser } = require ('./controllers/user');
const indexRouter = require('./route/index');
const app = express();
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { celebrate, Joi, errors } = require('celebrate');
const NotFoundError = require('./errors/notFoundError');

mongoose.connect('mongodb://localhost:27017/news', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
})

app.use(bodyParser.json());

app.use(requestLogger);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().required().min(2).max(30),
  })
}), registerUser);
app.post('/signin', celebrate({
  body: {
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }
}), loginUser);

app.use(auth);
app.use('/', indexRouter);

app.use(errorLogger);
app.use(errors());

app.use((req, res, next) => {
  next(new NotFoundError('Ресурс не найден'));
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).send({ message: res.status === 500 ? 'Внутренняя ошбика сервера' : err.message });
});

const { PORT = 3000 } = process.env;

app.listen(PORT, () => {

});