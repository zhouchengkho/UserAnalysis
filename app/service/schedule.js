/**
 * Created by zhoucheng on 3/22/17.
 */
var schedule = require('node-schedule');
var exp = require('./exp');
/**
 * refill exp every sunday 3 am
 */
schedule.scheduleJob('0 0 3 * * 0', function() {
  exp.updateAllExp(function(err, result) {

  })
})
