var express = require('express'),
  router = express.Router(),
  db = require('../models'),
  login = require('../service/login'),
  score = require('../service/score');

module.exports = function (app) {
  app.use('/', router);
};

router.all('/*', function(req, res, next) {
  if(req.url === '/login') {
    return next()
  }
  if(!req.session.login) {
    return res.redirect('/login');
  }
  next()
})

/**
 * For now, list all service data on main page
 * DO NOT DO QUERY in router, keep it simple
 */
router.get('/', function (req, res, next) {
  score.getOverallScore(req.session.login.userId, function(data) {
    res.render('index', getRenderOption(req, {
      title: 'Education User Analysis',
      data: data
    }));
  })
});

router.get('/login', function (req, res, next) {
  if(req.session.login)
    res.redirect('/');
  else {
    res.render('login', getRenderOption(req, {
      title: 'Education User Analysis',
      script: '<script type="text/javascript" src="/js/login.js"></script>'
    }));
  }
});

router.get('/logout', function(req, res, next) {
  req.session.login = null;
  res.redirect('/login');
})

router.post('/login', function (req, res, next) {
  login.login(db, req, function(valid) {
    if(valid)
      res.status(200).send({status: 'success'})
    else
      res.status(200).send({status: 'fail'})
  })
})

/**
 * add common data to render
 * @param req: get session data
 * @param data: specialized data
 * @returns {*}
 */
function getRenderOption(req, data) {
  data.login = req.session.login;
  return data;
}
