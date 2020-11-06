const express = require ('express');
const router = express();
const { celebrate, Joi } = require ('celebrate');

const { showAllArticles, createArticle, deleteArticle } = require ('../controllers/article');

router.get('/articles', showAllArticles);
router.post('/articles', celebrate({
  body: Joi.object().keys({
    keyword: Joi.string().required(),
    title: Joi.string().required(),
    text: Joi.string().required(),
    date: Joi.string().required(),
    source: Joi.string().required(),
    link: Joi.string().required().regex(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+=]+$/),
    image: Joi.string().required().regex(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+=]+$/),
  })
}), createArticle);

router.delete('/articles/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24),
  })
}), deleteArticle)

module.exports = router;