/**
 * Created by zhoucheng on 1/20/17.
 */

var dorm = require('./analysis/dorm'),
  activity = require('./analysis/activity'),
  social = require('./analysis/social'),
  summary = require('./analysis/summary'),
  homework = require('./analysis/homework'),
  EventProxy = require('eventproxy'),
  db = require('../models/index'),
  async = require('async'),
  scoreFiller = require('./scorefiller'),
  Promise = require('bluebird');
function Score() {

  function fixToTwo(score) {
    score  = score + '';
    return score.substring(0, score.indexOf(".") + 3);
  }

  this.getStudentScore = function(userId, callback) {
    var self = this;
    var data = {
      userId: userId
    };
    var sum = {
      overallScore: 0,
      dormScore: 0,
      socialScore: 0,
      homeworkScore: 0,
      activityScore: 0
    }
    var classCount;
    db.User.findAll({where: {userId: userId}}).then(function(result) {
      return new Promise(function(resolve, reject) {
        data.userName = result[0].userName;
        getStudentClasses(userId, function(err, classIds) {
          classCount = classIds.length;
          async.eachSeries(classIds, function(classId, done) {
            self.getClassStudentScore(classId, userId, function(err, result) {
              sum.overallScore += result.overallScore;
              sum.dormScore += result.dormScore;
              sum.socialScore += result.socialScore;
              sum.homeworkScore += result.homeworkScore;
              sum.activityScore += result.activityScore;
              done();
            })
          }, function done() {
            // calculate avg
            data.overallScore = fixToTwo(sum.overallScore / classCount);
            data.dormScore = fixToTwo(sum.dormScore / classCount);
            data.socialScore = fixToTwo(sum.socialScore / classCount);
            data.homeworkScore = fixToTwo(sum.homeworkScore / classCount);
            data.activityScore = fixToTwo(sum.activityScore / classCount);
            resolve()
          })
        })
      })
    }).then(function() {
      // now get summary
      summary.getStudentSummary(userId, function(err, result) {
        data.summary = result;
        if(err)
          callback(err)
        callback(null, data)
      })
    })
  }


  /**
   * return an array of students score
   * @param userId
   * @param classId
   * @param callback
   */
  this.getClassScore = function(userId, classId, callback) {
    var data = [];
    getClassStudentIds(classId, function (err, studentIds) {
      async.eachSeries(studentIds, function (studentId, done) {
        this.getClassStudentScore(classId, studentId, function (err, result) {
          data.push(result)
        })
      }, function done() {
        callback(null, data)
      })
    })
  }

  /**
   *
   * @param classId
   * @param callback
   * result format
   * [
   *  {
   *    "userId": "",
   *    "userName": "",
   *    "overallScore": ""
   *  },
   *  {
   *    "userId": "",
   *    "userName": "",
   *    "overallScore": ""
   *  },
   *  {
   *    "userId": "",
   *    "userName": "",
   *    "overallScore": ""
   *  }
   * ]
   */
  this.getClassBadScores = function(classId, callback) {
    scoreFiller.fillClassScore(classId,function(err, result) {
      if(err)
        return callback(err)
      db.AnalysisScore.findAll({where: {classId: classId}, limit: 3, order: 'overallScore asc'}).then(function (result) {
        var data = [];
        for(var index = 0; index < result.length; index++) {
          var temp = {
            userId: result[index].userId,
            userName: result[index].userName,
            overallScore: result[index].overallScore
          }
          data.push(temp)
        }
        callback(null, data)
      })
    })
  }


  /**
   *
   * @param userId
   * @param callback
   * result format: Array
   * ['classId', 'classId' ...]
   */
  function getStudentClasses(userId, callback) {
    db.StudentClass.findAll({where: {userId: userId}}).then(function(result) {
      var data = [];
      for(var index in result)
        data.push(result[index].classId)
      callback(null, data)
    }).catch(function(err) {
      console.log(err)
      callback(err)
    })
  }


  function getClassStudentIds(classId, callback) {
    db.StudentClass.findAll({where: {classId: classId}, include: [db.User]}).then(function(result) {
      var data = [];
      for(var index in result)
        data.push(result[index].userId)
      callback(null, data)
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

module.exports = new Score();
