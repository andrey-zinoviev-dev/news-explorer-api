const Article = require('../models/article');
const BadRequestError = require('../errors/badRequestError');
const UnauthorizedError = require('../errors/unauthorizedError');
const NotFoundError = require('../errors/notFoundError');
const ForbiddenError = require('../errors/forbiddenError');

const showAllArticles = (req, res, next) => {
  Article.find({})
    .then((data) => {
      if (data.length === 0) {
        return next(new NotFoundError('Статьи не найдены'));
      }
      return res.status(200).send(data);
    })
    .catch((err) => {
      next(err);
    });
};

const createArticle = (req, res, next) => {
  const { _id } = req.user;
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  Article.create({
    keyword, title, text, date, source, link, image, owner: _id.toString(),
  })
    .then(() => res.status(201).send({ message: 'Статья сохранена' }))
    .catch(() => {
      next(new BadRequestError('Проверьте корректные данные статьи'));
    });
};

const deleteArticle = (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.user;
  Article.findById(id).select('+owner')
    .then((data) => {
      if (data.owner.toString() !== _id) {
        return next(new ForbiddenError('Неавторизованы для удаления'));
      }
      return Article.findByIdAndDelete(id)
      .then((card) => {
        if (!card) {
          throw new NotFoundError('Неправильный запрос');
        }
        return res.status(201).send({ message: 'Статья успешно удалена' });
      })
      .catch((err) => {
        next(err);
      });
    })
    .catch(() => {
      next(new NotFoundError('Неправильный запрос статьи для ее удаления'));
    });
};

module.exports = {
  showAllArticles,
  createArticle,
  deleteArticle,
};
