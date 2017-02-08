var db = require('../../models/index');
var query = require('./../query');
var reference = require('./../reference');
/**
 * 1. Attended Class
 * 2. Finished Assignment
 * 3. Source Score
 * @constructor
 */
function HomeWork() {
  /**
   * getOverallScore
   * @param userId
   * @param callback
   * @returns {number} score number
   */
  this.getScore = function(userId, callback) {
    callback(null, 4);
  }

  /**
   *
   * @param userId
   * @param timePeriod [optional], set as this semester if not provided
   * @param callback
   */
  this.getHomeWorkData = function(userId, timePeriod, callback) {
    if((typeof timePeriod) == 'function') {
      callback = timePeriod;
      timePeriod = reference.getAcademicYear()
    }
    db.StudentAssignment.count(query.genWhereQuery({userId: userId, time: timePeriod})).then(function(count) {
      callback(null, {count: count})
    }).catch(function(err) {
      callback(err)
    })
  }
}



module.exports = new HomeWork();
