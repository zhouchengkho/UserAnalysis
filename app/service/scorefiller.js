/**
 * Created by zhoucheng on 2/21/17.
 */
var db = require('./../models/index')
var social = require('./analysis/social');
var dorm = require('./analysis/dorm');
var activity = require('./analysis/activity');
var homework = require('./analysis/homework');
var Promise = require('bluebird');
var EventProxy = require('eventproxy');
var summary = require('./analysis/summary');
var scoreGetter = require('./scoregetter');
var async = require('async');
  function ScoreFiller() {
  /**
   * fill score according to classId
   * write score data to database, so next time loading will be faster
   * @param classId
   * @param callback
   */
  this.fillClassScore = function(classId, callback) {
    var studentIds = [];
    db.sequelize.transaction(function(t) {
      return getStudentsByClass(classId)
    }).then(function(result) {
      for(var index in result) {
        studentIds.push(result[index].User.userId)
      }
      return db.AnalysisScore.findAll({where: {userId: {$in: studentIds}, classId: classId}})
    }).then(function(result) {
      // get these already in db, for these are not already in db, get score using scoregetter and then fill
      for(var index in result) {
        removeByValue(studentIds, result[index].userId)
      }


      // now we have a studentIds that are not stored, for each one fillScore
      async.eachSeries(studentIds, function(studentId, done) {
        this.fillClassStudentScore(classId, studentId, function(err, result) {
          done()
        })
      }, function done() {
        callback(null, {message: 'success'})
      })
    }).catch(function(err) {
      console.log(err)
      callback(err)
    })
  }

    function getStudentsByClass(classId) {
      return db.StudentClass.findAll({where: {classId: classId}, include: [db.User]})
    }
  /**
   * scheduled task, fill data in low traffic time
   * @param callback
   */
  this.fillAllScore = function(callback) {

  }

  this.fillClassStudentScore = function(classId, userId, callback) {
    scoreGetter.getClassStudentScore(classId, userId, function(data) {
      db.AnalysisScore.findCreateUpdate({classId: classId, userId: userId}, data).then(function(result) {
        callback(null, 'success').catch(function(err) {callback(err)})
      })
    })
  }
}

function removeByValue(arr, val) {
  for(var i=0; i<arr.length; i++) {
    if(arr[i] == val) {
      arr.splice(i, 1);
      break;
    }
  }
}
module.exports = new ScoreFiller();
