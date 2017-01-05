var express = require('express'),
  router = express.Router(),
  db = require('../models'),
  login = require('../function/login');

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

router.get('/', function (req, res, next) {
  db.Friend.findAll({where: {userId: req.session.login.userId}, include: [db.User]}).then(function (friends) {
    // console.log('yo session ' + JSON.stringify(req.session.login))
    // console.log('yo '+JSON.stringify(friends));
    res.render('index', getRenderOption(req, {
      title: 'Education User Analysis',
      friends: friends
    }));
  });
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
