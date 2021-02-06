const Article = require('../models/article');
const NotFoundError = require('../errors/notfound-error');
const RequestError = require('../errors/request-error');
const ForbiddenError = require('../errors/forbidden-error');

module.exports.findAllArticles = (req, res, next) => {
  Article.find({ owner: req.user._id })
    .orFail()
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new RequestError('Некорректно задан Id пользователя'));
      } else if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Нет сохраненных статей'));
      } else {
        next(err);
      }
    });
};

module.exports.saveArticle = (req, res, next) => {
  const { keyword, title, text, date, source, link, image } = req.body;

  Article.create({
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
    owner: req.user._id,
  })
    .then((card) => res.send({ card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new RequestError('Ошибка сохранения статьи. Проверьте корректность переданных данных.'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteArticle = (req, res, next) => {
  const articleId = req.params.id;
  Article.findById(articleId).select('+owner')
    .orFail()
    .then((article) => {
      const articleOwnerId = Buffer.from(article.owner.id).toString('hex');
      if (articleOwnerId === req.user._id) {
        return Article.findByIdAndDelete(articleId);
      }
      return Promise.reject(new ForbiddenError('Статья не может быть удалаена этим пользователем'));
    })
    .then((article) => res.send({ data: article }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new RequestError('Некорректно задан Id статьи'));
      } else if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Статья не найдена'));
      } else {
        next(err);
      }
    });
};
