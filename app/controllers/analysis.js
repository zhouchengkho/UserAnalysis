/**
 * Created by zhoucheng on 1/24/17.
 */
var express = require('express'),
  router = express.Router(),
  activity = require('../service/analysis/activity'),
  social = require('../service/analysis/social'),
  homework = require('../service/analysis/homework'),
  refer = require('../service/reference'),
  teacher = require('../service/teacher'),
  scoreFiller = require('../service/scorefiller');

module.exports = function (app) {
  app.use('/analysis', router);
};



router.get('/action-count', function(req, res) {
  activity.getActionCount(req.session.login.userId, function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})


router.get('/activity-line-chart-data', function(req, res) {
  activity.getLineChartData(req.session.login.userId, req.session.login.settings.timePeriod,function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})

router.get('/social-radar-chart-data', function(req, res) {
  social.getRadarChartData(req.session.login.userId, req.session.login.settings.timePeriod, function(err, result) {
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



router.get('/test/:classId/:userId', function(req, res) {
  activity.getClassStudentOverallActivity(req.params.classId, req.params.userId, function(err, result) {
    res.json(result)
  })
})


