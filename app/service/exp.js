/**
 * Created by zhoucheng on 3/3/17.
 */
var db = require('./../models/index')
var social = require('./analysis/social');
var dorm = require('./analysis/dorm');
var activity = require('./analysis/activity');
var homework = require('./analysis/homework');
var Promise = require('bluebird');
var EventProxy = require('eventproxy');
var summary = require('./analysis/summary');
var query = require('./query');
var async = require('async');
function Exp() {
  /**
   * fill exp according to classId
   * write exp data to database, so next time loading will be faster
   * @param classId
   * @param callback
   */
  this.fillClassExp = function(classId, callback) {
    var self = this;
    query.getStudentsByClass(classId, function(err, students) {

      async.eachSeries(students, function(student, done) {
        if(!student.exp) {
          self.fillClassStudentExp(classId, student.userId, function(err, result) {
            done()
          })
        }
        else done()
      }, function done() {
        callback(null, {message: 'success'})
      })

    })
  }


  /**
   * scheduled task, fill data in low traffic time
   * @param callback
   */
  this.fillAllExp = function(callback) {
    var self = this;
    query.getClassesInDb(function(err, result) {
      if(err)
        return callback(err)
      async.eachSeries(result, function(classId, done) {
        self.fillClassExp(classId, function() {
          done()
        })
      }, function done() {
        callback(null, 'success')
      })
    })
  }

  this.fillClassStudentExp = function(classId, userId, callback) {
    this.getClassStudentExp(classId, userId, function(err, exp) {
      db.StudentClass.update({exp: exp}, {where: {classId: classId, userId: userId}}).then(function(result) {
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
   * 3.45   {Number}
   */
  this.getClassStudentExp = function(classId, userId, callback) {
    console.log('getting class student exp: '+classId + ' '+userId);
    db.StudentClass.findAll({where: {classId: classId, userId: userId}}).then(function(result) {
      if(result[0].exp) {
        var data = result[0].exp
        callback(null, data)
      } else {
        var epEmitter = {
          name: 'name',
          dorm: 'dorm',
          social: 'social',
          summary: 'summary',
          homework: 'homework',
          activity: 'activity',
          error: 'error'
        }
        var ep = new EventProxy();

        ep.all([epEmitter.name, epEmitter.activity, epEmitter.dorm, epEmitter.social, epEmitter.homework, epEmitter.summary],
          function(className, activityExp, dormExp, socialExp, homeworkExp, summary) {
          console.log('result: '+activityExp + ' '+ dormExp + ' '+ socialExp + ' '+homeworkExp);
            console.log('summary is: '+summary)
            var data = {
              userId: userId,
              classId: classId,
              className: className,
              overallExp: fixToTwo((activityExp + dormExp + socialExp +homeworkExp ) /4),
              dormExp: fixToTwo(dormExp),
              socialExp: fixToTwo(socialExp),
              homeworkExp: fixToTwo(homeworkExp),
              activityExp: fixToTwo(activityExp),
              summary: summary
            }
            console.log(JSON.stringify(data))
            callback(null, data.overallExp)
          })

        ep.bind(epEmitter.error, function(err) {
          // 卸载掉所有handler
          ep.unbind();
          // 异常回调
          callback(err);
        })

        db.Class.findAll({where: {classId: classId}, include:[db.Course]}).then(function(result) {
          ep.emit(epEmitter.name, result[0].Course.courseName);

        }).catch(function(err){ep.emit(epEmitter.error, err);})
        activity.getClassStudentExp(classId, userId, function(err, activityExp) {

          if(err)
            return ep.emit(epEmitter.error, err);
          ep.emit(epEmitter.activity, activityExp);
        })
        dorm.getClassStudentExp(classId, userId, function(err, dormExp) {
          if(err)
            return ep.emit(epEmitter.error, err);
          ep.emit(epEmitter.dorm, dormExp);
        })
        social.getClassStudentExp(classId, userId, function(err, socialExp) {
          if(err)
            return ep.emit(epEmitter.error, err);
          ep.emit(epEmitter.social, socialExp)
        })
        homework.getClassStudentExp(classId, userId, function(err, homeworkExp) {
          if(err)
            return ep.emit(epEmitter.error, err);
          ep.emit(epEmitter.homework, homeworkExp)
        })
        summary.getClassStudentSummary(classId, userId, function(err, summary) {
          if(err)
            return ep.emit(epEmitter.error, err);
          console.log('got summary: '+summary)
          ep.emit(epEmitter.summary, summary)
        })
      }
    })

  }


  /**
   *
   * @param userId
   * @param callback
   *
   * 6.84 {Number}
   */
  this.getStudentExp = function(userId, callback) {
    console.log('getting exp for: '+ userId);
    var self = this;
    var data = {
      userId: userId
    };
    var exp = 0;
    var classCount;
    db.User.findAll({where: {userId: userId}}).then(function(result) {
      return new Promise(function(resolve, reject) {
        if(result.length == 0)
          throw new Error('user does not exist')
        console.log('user: '+JSON.stringify(result[0]))
        data.userName = result[0].userName;
        query.getStudentClasses(userId).then(function(classIds) {
          classCount = classIds.length;
          console.log('classIds: '+classIds)
          async.eachSeries(classIds, function(classId, done) {
            self.getClassStudentExp(classId, userId, function(err, result) {
              exp +=result;
              done();
            })
          }, function done() {
            // calculate avg
            exp = fixToTwo(exp / classCount);
            resolve()
          })
        })
      })
    }).then(function() {
      // now get summary
      callback(null, exp)

    }).catch(function(err){
      console.log('err here')
      callback(err)})
  }


  /**
   *
   * @param userId
   * @param callback
   * {
   *  "userId": "",
   *  "userName": "",
   *  "exp": ""
   * }
   */
  this.getDetailedStudentExp = function(userId, callback) {
    var data = {};
    var self = this;
    query.getUserInfo(userId, function(err, result) {
      data = result;
      self.getStudentExp(userId, function(err, result) {
        data.exp = result;
        callback(null, data)
      })
    })
  }

  /**
   *
   * @param userId
   * @param callback
   *
   * [1.22, 4.66, 7.66...]
   */
  this.getMyDormExp = function(userId, callback) {
    var self = this;
    var data = [];
    query.getRoommates(userId, function(err, userIds) {
      async.eachSeries(userIds, function(roommateId, done) {
        self.getStudentExp(roommateId, function(err, result) {
          data.push(result)
          done();
        })
      }, function done() {
        callback(null, data)
      })
    })
  }

  /**
   *
   * @param userId
   * @param callback
   *
   * [
   *  {
   *    "userId": "",
   *    "userName": "",
   *    "exp": ""
   *  },
   *  {
   *    "userId": "",
   *    "userName": "",
   *    "exp": ""
   *  }
   * ]
   */
  this.getDetailedDormExp = function(userId, callback) {
    var self = this;
    var data = [];
    query.getRoommates(userId, function(err, userIds) {
      async.eachSeries(userIds, function(roommateId, done) {
        self.getDetailedStudentExp(roommateId, function(err, result) {
          data.push(result)
          done();
        })
      }, function done() {
        callback(null, data)
      })
    })
  }

}


function fixToTwo(exp) {
  exp  = exp + '';
  return exp.substring(0, exp.indexOf(".") + 3);
}


module.exports = new Exp();
