var express = require('express'),
  router = express.Router(),
  login = require('../service/login'),
  score = require('../service/analysis/score'),
  teacher = require('../service/analysis/teacher')
module.exports = function (app) {
  app.use('/', router);
};


/**
 * Enter Page according to the character [student, teacher]
 */
router.get('/', function (req, res, next) {
  switch (req.session.login.character) {
    case 'student':
      score.getOverallScore(req.session.login.userId, function(data) {
        res.render('student', getRenderOption(req, {
          data: data,
          script: '<script type="text/javascript" src="/js/Chart.js"></script>' +
          '<script type="text/javascript" src="/js/home.js"></script>'
        }));
      })
      break;
    case 'teacher':
      teacher.getData(req.session.login.userId, function(err, data) {
        res.render('teacher', getRenderOption(req, {
          data: data,
          script: '<script type="text/javascript" src="/js/Chart.js"></script>'
        }));
      })
      break;
    default:
      res.json({status: 400, message: 'invalid request'})
      break;
  }
});

router.get('/student/:id', function(req, res) {
  // check if is teacher
  if(req.session.login.character == 'teacher') {
    res.render('student', {
      title: 'Education User Analysis'
    });
  } else {
    res.redirect('/noaccess');
  }
})

router.get('/noaccess', function(req, res) {
  res.render('noaccess', {});
})
router.get('/login', function (req, res) {
  if(req.session.login)
    res.redirect('/');
  else {
    res.render('login', {
      title: 'Education User Analysis',
      script: '<script type="text/javascript" src="/js/login.js"></script>'
    });
  }
});

router.get('/logout', function(req, res, next) {
  req.session.login = null;
  res.redirect('/login');
})

router.post('/login', function (req, res, next) {
  login.login(req, function(err, valid) {
    if(valid)
      res.send({status: 200})
    else
      res.status(200).send({status: 200})
  })
})


/**
 * add common data to render
 * @param req: get session data
 * @param data: specialized data
 * @returns {*}
 */
function getRenderOption(req, data) {
  data = data ? data : {};
  data.login = {};
  data.login.userId = req.session.login.userId;
  data.login.userName = req.session.login.userName;
  return data;
}
