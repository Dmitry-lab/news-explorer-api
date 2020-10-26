const express = require('express');
const { celebrate, Joi } = require('celebrate');
const { findAllArticles, saveArticle, deleteArticle } = require('../controllers/article');

const router = express.Router();
const validUrl = new RegExp('https?:\\/\\/(?:www\\.|(?!www))[a-z0-9][a-z0-9-]+[a-z0-9]\\.[^\\s]{2,}|www\\.[a-z0-9][a-z0-9-]+[a-z0-9]\\.[^\\s]{2,}'
+ '|https?:\\/\\/(?:www\\.|(?!www))[a-z0-9]+\\.[^\\s]{2,}|www\\.[a-z]+\\.[^\\s]{2,}', 'i');

const validateURL = (value, helper) => {
  if (validUrl.test(value)) {
    return value;
  }
  return helper.message('Некорректный формат URL');
};

router.get('/', findAllArticles);
router.post('/', celebrate({
  body: Joi.object().keys({
    keyword: Joi.string().required(),
    title: Joi.string().required(),
    text: Joi.string().required(),
    date: Joi.string().required(),
    source: Joi.string().required(),
    link: Joi.string().required().custom(validateURL),
    image: Joi.string().required().custom(validateURL),
  }),
}), saveArticle);
router.delete('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().required().length(24).hex(),
  }),
}), deleteArticle);

module.exports = router;
