var moment  = require('moment');
var reference = require('./../reference');
var Promise = require('bluebird');
var async = require('async');
var query = Promise.promisifyAll(require('../query'));
var score = require('./score');
var helper = require('../helper');
function Activity() {



  /**
   * class student exp
   * initiate discussion - code: 401
   * checkout discussion - code: 402
   * resource (check out / edit / download / rate) - (502  / 503 / 505 / 507)
   * ppt download  - code: 301
   * assignment (submit / resubmit / download) -  (201 / 202 / 203)
   *
   *
   * @param classId {string}
   * @param userId {string}
   * @param callback {function} (err, exp)
   *
   *
   * 5.21  {Number} 0-10
   */
  this.getClassStudentExp = function(classId, userId, callback) {

    Promise.all([
      query.getClassActionWeightedCountGroupAsync(classId, ['201', '202', '203'], [1, 0.5, 1]),
      query.getClassActionWeightedCountGroupAsync(classId, ['301'], [1]),
      query.getClassActionWeightedCountGroupAsync(classId, ['401', '402', '403', '404', '405'], [1, 0.25, 1, 0.75, 0.5]),
      query.getClassActionWeightedCountGroupAsync(classId, ['501', '502', '503', '504', '505', '506', '507'], [1, 0.5, 0.75, 0.25, 0.5, 1, 0.75])
    ]).spread(function(homeworkGroup, pptGroup, discussionGroup, sourceGroup) {

      consecutiveActionPunishment(classId, userId, ['301'], [pptGroup], function(err) {
        if(err)
          callback(err)
        else {
          var statistic = helper.organizeData([homeworkGroup, pptGroup, discussionGroup, sourceGroup]);
          var exp = score.entropy.getScoreOf(statistic, userId, [0.10, 0.10, 0.6, 0.20]);
          console.log('two exp: '+' '+ exp)
          if (typeof  exp != 'number')
            exp = 0;
          callback(null, exp)
        }
      })

    })
  }


  /**
   *
   * punish with time distribution standard deviation
   * @param classId
   * @param userId
   * @param actionCode {Array}
   * @param group {Array}
   * @param callback
   */
  function consecutiveActionPunishment(classId, userId, actionCode, group, callback) {

    query.getClassActionTimeDistribution(classId, actionCode, function(err, result) {
      if(err)
        callback(err)
      else {
        var generalDeviation = helper.getStandardDeviation(result, 'time');
        query.getClassStudentActionTimeDistribution(classId, userId, actionCode, function(err, result) {
          var myDeviation = helper.getStandardDeviation(result, 'time');
          var fraction = myDeviation / generalDeviation;
          console.log('fraction: '+fraction)
          for(var i in group) {
            for(var j in group[i]) {
              if(group[i][j].userId == userId) {
                group[i][j].count *= fraction
              }
            }
          }
          callback(err)
        })
      }
    })
  }



}


module.exports = new Activity();
