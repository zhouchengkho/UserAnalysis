/**
 * Created by zhoucheng on 5/21/17.
 */
var express = require('express'),
  router = express.Router(),
  statistics = require('../service/statistics');
module.exports = function (app) {
  app.use('/statistics', router);
};

router.get('/rank/single', function(req, res) {
  statistics.getRank(function(err, result) {
    res.send(result ? result.single : [])
  })
})

router.get('/rank/overall', function(req, res) {
  statistics.getRank(function(err, result) {
    res.send(result ? result.overall : [])
  })
})


router.get('/summary', function(req, res) {
  statistics.getSummary(function(err, result) {
    console.log('??')
    console.log(result)
    res.send(result ? result : [])
  })
})
