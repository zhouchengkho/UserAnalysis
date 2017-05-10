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
          data.inactiveUsers.push({
            year: year
          })
          done()
      }, function done() {
        callback(null, data)
      })
    })
  }

  /**
   *
   * @param data [{
   *  userId: "",
   *  dormId: "",
   *  enrollYear: ""
   * }]
   * @param callback
   */
  this.importDormData = function(data, callback) {
    async.eachSeries(data, function(row, done) {
      query.createDormRow(row, function(err, id) {
        done(err)
      })
    }, function done(err) {
      callback(err)
    })
  }
}


module.exports = new Counsellor();
