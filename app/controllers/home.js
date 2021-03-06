var express = require('express'),
  router = express.Router(),
  login = require('../service/login'),
  teacher = require('../service/teacher'),
  student  = require('../service/student'),
  exp = require('../service/exp'),
  counsellor = require('../service/counsellor'),
  statistics = require('../service/statistics');
module.exports = function (app) {
  app.use('/', router);
};


/**
 * Enter Page according to the character [student, teacher]
 */
router.get('/', function (req, res, next) {
  console.log(req.session)
  switch (req.session.login.character) {
    case 'student':
      student.getData(req.session.login.userId, function(err, data) {
        if(err)
          res.json(err)
        else {
          res.render('student', getRenderOption(req, {
            data: data,
            script: '<script type="text/javascript" src="/js/Chart.js"></script>' +
            '<script type="text/javascript" src="/js/student.js"></script>'
          }));
        }
      })
      break;
    case 'teacher':
      teacher.getData(req.session.login.userId, function(err, data) {
        console.log(data)
        res.render('teacher', getRenderOption(req, {
          data: data,
          script: '<script type="text/javascript" src="/js/Chart.js"></script>'+
          '<script type="text/javascript" src="/js/teacher.js"></script>' +
          '<script type="text/javascript" src="/js/handlebars-v4.0.5.js"></script>' +
          '<script type="text/javascript" src="/js/partials/class_detail.js"></script>'
        }));
      })
      break;
    case 'counsellor':
      counsellor.getData(req.session.login.userId, function(err, data) {
        res.render('counsellor', getRenderOption(req, {
          data: data
        }));
      })
      break;
    default:
      res.json({status: 400, message: 'invalid request'})
      break;
  }
});

router.get('/student/overall/:id', function(req, res) {
  // check if is teacher
  console.log(req.url)
  if(req.session.login.character == 'teacher' || req.session.login.character == 'counsellor') {
    console.log('id: '+req.params.id)
    student.getData(req.params.id, function(err, data) {
      if(err)
        res.json(err)
      else {
        res.render('student', getRenderOption(req, {
          data: data,
          script: '<script type="text/javascript" src="/js/Chart.js"></script>' +
          '<script type="text/javascript" src="/js/student_overall.js"></script>'
        }));
      }
    })
   } else {
    res.redirect('/noaccess');
  }
})

router.get('/student/class/:studentId/:classId', function(req, res) {
  // check if is teacher
  if(req.session.login.character == 'teacher' || req.session.login.userId == req.params.studentId || req.session.login.character == 'counsellor') {
    student.getClassData(req.params.classId, req.params.studentId, function(err, data) {
      console.log(JSON.stringify(data))
      if(err)
        res.json(err)
      else {
        res.render('student_class', getRenderOption(req, {
          data: data,
          script: '<script type="text/javascript" src="/js/Chart.js"></script>' +
          '<script type="text/javascript" src="/js/handlebars-v4.0.5.js"></script>' +
          '<script type="text/javascript" src="/js/partials/class_student_homework.js"></script>'+
          '<script type="text/javascript" src="/js/student_class.js"></script>'
        }));
      }
    })

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
    // statistics.getSummary(function(err, summary) {
    //   if(err) {
    //     return res.send({
    //       status: 500,
    //       message: err.message
    //     })
    //   } else {
    //     statistics.getRank(function(err, rank) {
    //       if(err) {
    //         return res.send({
    //           status: 500,
    //           message: err.message
    //         })
    //       } else {
    //         res.render('login', {
    //           title: 'Education User Analysis',
    //           script: '<script type="text/javascript" src="/js/login.js"></script>',
    //           summary: summary,
    //           rank: rank
    //         });
    //       }
    //     })
    //   }
    // })
  }

  // console.log('login status: ' + req.session.login)
  // if(req.query.userId && req.query.password) {
  //   login.login(req, function(err, valid) {
  //     if(valid)
  //       res.redirect('/');
  //     else {
  //       statistics.getSummary(function(err, summary) {
  //         if(err) {
  //           return res.send({
  //             status: 500,
  //             message: err.message
  //           })
  //         } else {
  //           statistics.getRank(function(err, rank) {
  //             if(err) {
  //               return res.send({
  //                 status: 500,
  //                 message: err.message
  //               })
  //             } else {
  //               res.render('login', {
  //                 title: 'Education User Analysis',
  //                 script: '<script type="text/javascript" src="/js/login.js"></script>',
  //                 summary: summary,
  //                 rank: rank
  //               });
  //             }
  //           })
  //         }
  //       })
  //     }
  //   })
  // } else {
  //   if(req.session.login)
  //     res.redirect('/');
  //   else {
  //     res.render('login', {
  //       title: 'Education User Analysis',
  //       script: '<script type="text/javascript" src="/js/login.js"></script>'
  //     });
  //   }
  // }

});

router.get('/logout', function(req, res, next) {
  req.session.login = null;
  res.redirect('/login');
})

router.post('/login', function (req, res, next) {
  login.login(req, function(err, result) {
    res.send(result)
  })
})


router.get('/statistic', function(req, res) {
  res.render('statistic');
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
