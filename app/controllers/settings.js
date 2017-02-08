/**
 * Created by zhoucheng on 2/6/17.
 */
var express = require('express'),
  router = express.Router(),
  settings = require('../service/settings'),
  ref = require('../service/reference');

module.exports = function (app) {
  app.use('/settings', router);
};


router.get('/', function(req, res) {
  res.render('settings', getRenderOption(req, {
    script: '<script type="text/javascript" src="/js/bootstrap-datetimepicker.min.js"></script>' +
    '<script type="text/javascript" src="/js/settings.js"></script>',
    css: '<link rel="stylesheet" href="/css/bootstrap-datetimepicker.min.css">'
  }));
})

router.get('/get-settings', function(req, res) {
  res.json(req.session.login.settings)
})

router.get('/time/get-last-semester', function(req, res) {
  res.json({time: ref.getTimePeriod({timePeriod: 'last-semester'})});
})

router.get('/time/get-this-semester', function(req, res) {
  res.json({time: ref.getTimePeriod({timePeriod: 'this-semester'})});
})

router.get('/time/get-academic-year', function(req, res) {
  res.json({time: ref.getTimePeriod({timePeriod: 'academic-year'})});
})

router.get('/time/get-college-career', function(req, res) {
  res.json({time: ref.getTimePeriod({timePeriod: 'college-career', userId: req.session.login.userId})});
})


router.post('/change-settings', function(req, res) {
  settings.changeSettings(req, function(err, ok) {
    if(ok)
      res.status(200).send({status: 1})
    else
      res.status(200).send({status: 0})
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
  data.login = req.session.login;
  return data;
}
