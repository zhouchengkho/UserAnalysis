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
var query = require('./query');
var async = require('async');
  function ScoreFiller() {
  /**
   * fill score according to classId
   * write score data to database, so next time loading will be faster
   * @param classId
   * @param callback
   */
  this.fillClassScore = function(classId, callback) {
    var self = this;
    var studentIds = [];
    db.sequelize.transaction(function(t) {
      return getStudentsByClass(classId)
    }).then(function(result) {

      for(var index in result) {
        if(result[index].User)
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
        self.fillClassStudentScore(classId, studentId, function(err, result) {
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
    var self = this;
    query.getClassesInDb(function(err, result) {
      if(err)
        return callback(err)
      async.eachSeries(result, function(classId, done) {
        self.fillClassScore(classId, function() {
          done()
        })
      }, function done() {
        callback(null, 'success')
      })
    })
  }

  this.fillClassStudentScore = function(classId, userId, callback) {
    this.getClassStudentScore(classId, userId, function(err, data) {
      db.AnalysisScore.findCreateUpdate({classId: classId, userId: userId}, data).then(function(result) {
        callback(null, 'success')
      }).catch(function(err) {callback(err)})
    })
  }

    /**
     *
     * @param classId
     * @param userId
     * @param callback
     *
     * result:
     * {
   *  userId: '1O132510237',
   *  classId: 'CABLABLABLA',
   *  overallScore: 5,
   *  dormScore: 6,
   *  socialScore: 5,
   *  homeworkScore: 6,
   *  activityScore: 5,
   *  summary: 'you are doing great'
   * }
     */
    this.getClassStudentScore = function(classId, userId, callback) {
      db.AnalysisScore.findAll({where: {classId: classId, userId: userId}}).then(function(result) {
        if(result[0]) {
          var data = {
            userId: result[0].userId,
            classId: result[0].classId,
            overallScore: result[0].overallScore,
            dormScore: result[0].dormScore,
            socialScore: result[0].socialScore,
            homeworkScore: result[0].homeworkScore,
            activityScore: result[0].activityScore,
            summary: summary
          }
          callback(null, data)
        } else {
          var epEmitter = {
            dorm: 'dorm',
            social: 'social',
            summary: 'summary',
            homework: 'homework',
            activity: 'activity',
            error: 'error'
          }
          var ep = new EventProxy();

          ep.all([epEmitter.activity, epEmitter.dorm, epEmitter.social, epEmitter.homework, epEmitter.summary],
            function(activityScore, dormScore, socialScore, homeworkScore, summary) {
              var data = {
                userId: userId,
                classId: classId,
                overallScore: (activityScore + dormScore + socialScore +homeworkScore ) /4,
                dormScore: dormScore,
                socialScore: socialScore,
                homeworkScore: homeworkScore,
                activityScore: activityScore,
                summary: summary
              }
              callback(null, data)
            })

          ep.bind(epEmitter.error, function(err) {
            // 卸载掉所有handler
            ep.unbind();
            // 异常回调
            callback(err);
          })

          activity.getClassStudentScore(classId, userId, function(err, activityScore) {

            if(err)
              return ep.emit(epEmitter.error, err);
            ep.emit(epEmitter.activity, activityScore);
          })
          dorm.getClassStudentScore(classId, userId, function(err, dormScore) {
            if(err)
              return ep.emit(epEmitter.error, err);
            ep.emit(epEmitter.dorm, dormScore);
          })
          social.getClassStudentScore(classId, userId, function(err, socialScore) {
            if(err)
              return ep.emit(epEmitter.error, err);
            ep.emit(epEmitter.social, socialScore)
          })
          homework.getClassStudentScore(classId, userId, function(err, homeworkScore) {
            if(err)
              return ep.emit(epEmitter.error, err);
            ep.emit(epEmitter.homework, homeworkScore)
          })
          summary.getClassStudentSummary(classId, userId, function(err, summary) {
            if(err)
              return ep.emit(epEmitter.error, err);
            ep.emit(epEmitter.summary, summary)
          })
        }
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
