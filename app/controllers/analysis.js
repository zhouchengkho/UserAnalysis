/**
 * Created by zhoucheng on 1/24/17.
 */
var express = require('express'),
  router = express.Router(),
  activity = require('../service/activity'),
  social = require('../service/social');

module.exports = function (app) {
  app.use('/analysis', router);
};

/**
 * Login Authentication
 */
router.all('/*', function(req, res, next) {
  if(!req.session.login) {
    res.json({
      msg: 'login first'
    })
  }
  else {
    next()
  }
})

router.get('/action-count', function(req, res) {
  activity.getActionCount(req.session.login.userId, function(result) {
    res.json(result)
  })
})


router.get('/activity-line-chart-data', function(req, res) {
  activity.getLineChartData(req.session.login.userId, function(result) {
    res.json(result)
  })
})

router.get('/social-radar-chart-data', function(req, res) {
  social.getRadarChartData(req.session.login.userId, function(result) {
    res.json(result)
  })
})
