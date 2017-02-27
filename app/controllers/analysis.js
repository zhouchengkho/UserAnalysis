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
  scoreFiller = require('../service/scorefiller'),
  scoreGetter = require('../service/scoregetter')
  db = require('../models/index');

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
  activity.getLineChartData(req.session.login.userId, req.session.login.settings.timePeriod, function(err, result) {
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



router.get('/test', function(req, res) {

      // db.Action.findAll(query).then(function(result) {
      //   res.json(result)
      // }).catch(function(err) {res.json({status: 400, message: err.message})})
  // refer.getAcademicYearTerms(function(err, result) {
  //   if(err)
  //     res.json({status: 400, message: err.message})
  //   else
  //     res.json(result)
  // })
  scoreGetter.getClassStudentScore('10152510134', 'C180001201512', function(err, result) {
    res.json(result)
  })
})

router.get('/get-class-detail/:id', function(req, res) {
  scoreGetter.getClassBadScores(req.params.id, function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json({status: 200, data: result})
  })
})
