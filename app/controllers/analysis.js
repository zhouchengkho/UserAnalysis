/**
 * Created by zhoucheng on 1/24/17.
 */
var express = require('express'),
  router = express.Router(),
  activity = require('../service/analysis/activity'),
  social = require('../service/analysis/social'),
  homework = require('../service/analysis/homework'),
  refer = require('../service/reference'),
  dorm = require('../service/analysis/dorm'),
  teacher = require('../service/teacher'),
  db = require('../models/index'),
  exp = require('../service/exp'),
  graph = require('../service/graph'),
  query = require('../service/query');

module.exports = function (app) {
  app.use('/analysis', router);
};



router.get('/dorm-bar-chart-data', function(req, res) {
  graph.getBarChartDataForDorm(req.session.login.userId, function(err, result) {
    console.log(JSON.stringify(result))
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})

router.get('/class-dorm-bar-chart-data/:studentId/:classId', function(req, res) {
  graph.getClassBarChartDataForDorm(req.params.classId, req.params.studentId, function(err, result) {
    console.log(JSON.stringify(result))
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})


router.get('/activity-line-chart-data', function(req, res) {
  graph.getActivityLineChartData(req.session.login.userId, req.session.login.settings.timePeriod, function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})

router.get('/social-radar-chart-data', function(req, res) {
  graph.getSocialRadarChartData(req.session.login.userId, req.session.login.settings.timePeriod, function(err, result) {
    console.log(res.result)
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})

router.get('/student-class-line-chart-data/:studentId/:classId', function(req, res) {
  graph.getClassStudentLineChartData(req.params.classId, req.params.studentId, function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})

router.get('/homework-data', function(req, res) {
  homework.getHomeWorkData(req.session.login.userId, req.session.login.settings.timePeriod, function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})

router.get('/homework-html-data', function(req, res) {
  homework.getHtmlData(req.session.login.userId, req.session.login.settings.timePeriod, function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})

router.get('/activity-html-data', function(req, res) {
  activity.getHtmlData(req.session.login.userId, req.session.login.settings.timePeriod, function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})



router.get('/test', function(req, res) {
  // scoreGetter.getStudentData(req.session.login.userId, function(err, result) {
  // activity.getClassStudentExp('C180001201512', '10112510101', function(err, result) {
  //   res.json({exp: result})
  // })
  // query.getClassFriendsCountGroup('C180001201512', function(err, result) {
  //   res.json(result)
  // })
  social.getClassStudentExpTest('C180001201512', '10112510101', function(err, result) {
    res.json(result)
  })
});

router.get('/get-class-detail/:id', function(req, res) {
  exp.getClassBadExpers(req.params.id, function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json({status: 200, data: result})
  })
})


