/**
 * Created by zhoucheng on 3/22/17.
 */
var query = require('./query');
var ref = require('./reference');
var async = require('async');

function Counsellor() {
  /**
   *
   * get inactive users
   * @param userId
   * @param callback
   */
  this.getData = function(userId, callback) {
    var data = {};
    query.getUserInfo(userId, function(err, result) {
      data.userInfo = result;
      data.inactiveUsers = [];
      var lastFourYears = ref.getLastFourYears();
      async.eachSeries(lastFourYears, function(year, done) {
        query.getInactiveUsers(year, function(err, result) {
          data.inactiveUsers.push({
            year: year,
            data: result
          })
          done()
        })
      }, function done() {
        callback(null, data)
      })
    })
  }
}


module.exports = new Counsellor();
