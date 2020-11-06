const Article = require ('../models/article');
const BadRequestError = require('../errors/badRequestError');
const UnauthorizedError = require('../errors/unauthorizedError');

const showAllArticles = (req, res, next) => {
  Article.find({})
  .then((data) => {
    if(data.length === 0) {
      return next(new BadRequestError('Статьи не найдены'));
    }
    return res.status(200).send(data);
  })
  .catch((err) => {
    next(err);
  })
}

const createArticle = (req, res, next) => {
  const { _id } = req.user;
  const { keyword, title, text, date, source, link, image } = req.body;
  Article.create({ keyword, title, text, date, source, link, image, owner: _id.toString() })
  .then(() => {
    return res.status(201).send({ message: "Статья сохранена" });
  })
  .catch((err) => {
    next(new BadRequestError('Проверьте данные статьи'));
  })
}

const deleteArticle = (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.user;
  Article.findById(id).select('+owner')
  .then((data) => {
    if(data.owner.toString() !== _id) {
      return next(new UnauthorizedError ('Неавторизованы для удаления'));
    }
    return res.status(201).send({ message: "Статья успешно удалена" });
  })
  .catch(() => {
    next (new BadRequestError ('Неверный запрос'));
  })
  // res.status(200).send({ message: "Скоро роут заработает" });
}

module.exports = {
  showAllArticles,
  createArticle,
  deleteArticle
}