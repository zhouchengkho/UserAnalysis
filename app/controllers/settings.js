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
  ref.getTerms(req.session.login.userId, req.session.login.settings.timePeriod, function(err, result) {
    console.log(JSON.stringify(result))
    res.render('settings', getRenderOption(req, {
      terms: result,
      test: [{termName: 'aa', termId: '11'}],
      script: '<script type="text/javascript" src="/js/bootstrap-datetimepicker.min.js"></script>' +
      '<script type="text/javascript" src="/js/settings.js"></script>',
      css: '<link rel="stylesheet" href="/css/bootstrap-datetimepicker.min.css">'
    }));
  })
})

router.get('/get-settings', function(req, res) {
  res.json(req.session.login.settings)
})

router.get('/time/get-last-semester', function(req, res) {
  ref.getTerms(req.session.login.userId, 'last-semester', function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json({status: 200, data: result})
  })
  // res.json({time: ref.getTimePeriod({timePeriod: 'last-semester'})});
})

router.get('/time/get-this-semester', function(req, res) {
  ref.getTerms(req.session.login.userId, 'this-semester', function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json({status: 200, data: result})
  })})

router.get('/time/get-academic-year', function(req, res) {
  ref.getTerms(req.session.login.userId, 'academic-year', function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json({status: 200, data: result})
  })})

router.get('/time/get-college-career', function(req, res) {
  ref.getTerms(req.session.login.userId, 'college-career', function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json({status: 200, data: result})
  })})


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
