/**
 * Created by zhoucheng on 1/24/17.
 */
var express = require('express'),
  router = express.Router(),
  activity = require('../service/analysis/activity'),
  social = require('../service/analysis/social'),
  homework = require('../service/analysis/homework');

module.exports = function (app) {
  app.use('/analysis', router);
};



router.get('/action-count', function(req, res) {
  activity.getActionCount(req.session.login.userId, function(err, result) {
    if(err)
      res.json({status: 0, err: err.message})
    else
      res.json(result)
  })
})


router.get('/activity-line-chart-data', function(req, res) {
  activity.getLineChartData(req.session.login.userId, function(err, result) {
    if(err)
      res.json({status: 0, err: err.message})
    else
      res.json(result)
  })
})

router.get('/social-radar-chart-data', function(req, res) {
  social.getRadarChartData(req.session.login.userId, function(err, result) {
    if(err)
      res.json({status: 0, err: err.message})
    else
      res.json(result)
  })
})


router.get('/homework-student-assignment', function(req, res) {
  homework.getHomeWorkData(req.session.login.userId, function(err, result) {
    if(err)
      res.json({status: 0, err: err.message})
    else
      res.json(result)
  })
})
