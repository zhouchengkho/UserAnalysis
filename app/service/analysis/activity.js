var moment  = require('moment');
var reference = require('./../reference');
var Promise = require('bluebird');
var async = require('async');
var query = Promise.promisifyAll(require('../query'));
var score = require('./score');
var helper = require('../helper');
function Activity() {


  const presetWeights = [0.10, 0.10, 0.6, 0.20];

  /**
   * class student exp
   * homework - code: 201, 202, 203
   * ppt - code: 301
   * discussion - 401, 402, 403, 404, 405
   * ppt - code: 501, 502, 503, 504, 505, 506, 507
   *
   *
   * @param classId {string}
   * @param userId {string}
   * @param callback {function} (err, exp)
   *
   *
   * 521  {Number} 0-1000
   */
  this.getClassStudentExp = function(classId, userId, callback) {

    Promise.all([
      query.getClassActionWeightedCountGroupAsync(classId, ['201', '202', '203'], [1, 0.5, 1]),
      query.getClassActionWeightedCountGroupAsync(classId, ['301'], [1]),
      query.getClassActionWeightedCountGroupAsync(classId, ['401', '402', '403', '404', '405'], [1, 0.25, 1, 0.75, 0.5]),
      query.getClassActionWeightedCountGroupAsync(classId, ['501', '502', '503', '504', '505', '506', '507'], [1, 0.5, 0.75, 0.25, 0.5, 1, 0.75])
    ]).spread(function(homeworkGroup, pptGroup, discussionGroup, sourceGroup) {

      getPunishmentFraction(classId, userId, ['301'], function(err, fraction) {
        console.log(fraction)
        var statistic = helper.organizeData([homeworkGroup, pptGroup, discussionGroup, sourceGroup]);
        var exp = score.entropy.getScoreOf(statistic, userId, presetWeights);
        // punish
        var weights = score.entropy.getWeightsFromData(statistic, presetWeights);
        console.log(weights)
        exp = getPunishedExp(exp, weights[1], fraction)
        console.log(exp)
        if (exp == Number.NaN)
          exp = 0;
        callback(err, exp)
      })

    })
  }



  /**
   *
   * punish with time distribution standard deviation
   * @param classId
   * @param userId
   * @param actionCode {Array}
   * @param callback
   *
   * {number}
   */
  function getPunishmentFraction(classId, userId, actionCode, callback) {
    query.getClassActionTimeDistribution(classId, actionCode, function(err, classDistribution) {
      if(err)
        callback(err)
      else {
        var generalDeviation = helper.getStandardDeviation(classDistribution, 'time');
        query.getClassStudentActionTimeDistribution(classId, userId, actionCode, function(err, studentDistribution) {
          var myDeviation = helper.getStandardDeviation(studentDistribution, 'time');
          var fraction = generalDeviation == 0 ? 0 : myDeviation / generalDeviation;
          callback(err, fraction)
        })
      }
    })
  }

  function getPunishedExp(exp, punishWeight, fraction) {
    return (exp * punishWeight * fraction) + (exp * (1 - punishWeight))
  }

  /**
   *
   * @param classId
   * @param callback
   */
  this.getClassExps = function(classId, callback) {
    Promise.all([
      query.getClassActionWeightedCountGroupAsync(classId, ['201', '202', '203'], [1, 0.5, 1]),
      query.getClassActionWeightedCountGroupAsync(classId, ['301'], [1]),
      query.getClassActionWeightedCountGroupAsync(classId, ['401', '402', '403', '404', '405'], [1, 0.25, 1, 0.75, 0.5]),
      query.getClassActionWeightedCountGroupAsync(classId, ['501', '502', '503', '504', '505', '506', '507'], [1, 0.5, 0.75, 0.25, 0.5, 1, 0.75])
    ]).spread(function(homeworkGroup, pptGroup, discussionGroup, sourceGroup) {
      query.getClassStudentIdsDesc(classId, function(err, studentIds) {
        var fractions = [];
        async.eachSeries(studentIds, function(studentId, done) {
          getPunishmentFraction(classId, studentId, ['301'], function(err, fraction) {
            fractions.push(fraction)
            done(err)
          })
        }, function done() {
          var statistic = helper.organizeData([homeworkGroup, pptGroup, discussionGroup, sourceGroup]);
          var weights = score.entropy.getWeightsFromData(statistic, presetWeights);
          var result = score.entropy.getClassScores(statistic, presetWeights);
          for(var i in result) {
            if (result[i].score == Number.NaN)
              result[i].score = 0;
            else {
              result[i].score = getPunishedExp(result[i].score, weights[1], fractions[i])
            }
          }
          callback(null, result)
        })
      })
    })
  }


}


module.exports = new Activity();



