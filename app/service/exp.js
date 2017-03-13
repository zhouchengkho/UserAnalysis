/**
 * Created by zhoucheng on 3/3/17.
 */
var db = require('./../models/index')
var Promise = require('bluebird');
var social = Promise.promisifyAll(require('./analysis/social'));
var dorm = require('./analysis/dorm');
var activity = Promise.promisifyAll(require('./analysis/activity'));
var homework = Promise.promisifyAll(require('./analysis/homework'));
var EventProxy = require('eventproxy');
var summary = Promise.promisifyAll(require('./analysis/summary'));
var query = Promise.promisifyAll(require('./query'));
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
    db.StudentClass.findAll({where: {classId: classId, userId: userId}}).then(function(result) {
      if(result.length === 0)
        return callback(new Error('user not in this class or not exist'))
      if(result[0].exp) {
        var data = result[0].exp
        callback(null, data)
      } else {
        Promise.all([
          activity.getClassStudentExpAsync(classId, userId),
          social.getClassStudentExpAsync(classId, userId),
          homework.getClassStudentExpAsync(classId, userId),
          summary.getClassStudentSummaryAsync(classId, userId)
        ]).spread(function (activityExp, socialExp, homeworkExp, summary) {
          console.log('result: ' + activityExp + ' ' + ' ' + socialExp + ' ' + homeworkExp);
          console.log('summary is: ' + summary)

          var overallExp = fixToTwo((activityExp + socialExp + homeworkExp ) / 3)
          callback(null, overallExp)
        })
      }
    })

  }

  /**
   *
   * @param classId
   * @param userId
   * @param callback
   * {
   *  "userId": "",
   *  "userName": "",
   *  "classId": "",
   *  "className": ""
   *  "exp": 2.46
   * }
   */
  this.getDetailedClassStudentExp = function(classId, userId, callback) {
    var data = {};
    var self = this;

    query.getUserInfo(userId, function(err, result) {
      if(err)
        return callback(err)
      data.userId = result.userId;
      data.userName = result.userName;
      query.getClassDetail(classId, function(err, result) {
        if(err)
          return callback(err)
        data.classId = result.classId;
        data.className = result.className;
        self.getClassStudentExp(classId, userId, function(err, result) {
          if(err)
            return callback(err)

          data.exp = result;
          callback(null, data)
        })
      })
    })
  }

  /**
   *
   * @param userId
   * @param callback
   * {
   *  "exp": 3,
   *  "classes":
   *  [
   *    {
   *      "userId": "",
   *      "userName": "",
   *      "className": ""
   *      "exp": 2.46
   *    },
   *    {
   *      "userId": "",
   *      "userName": "",
   *      "className": ""
   *      "exp": 2.46
   *    }
   *  ]
   * }
   *
   */
  this.getDetailedStudentClassesExp = function(userId, callback) {
    var self = this;
    var data = [];
    var exp = 0;
    console.log('getting detailed for userId: '+userId)
    query.getStudentClasses(userId, function(err, classIds) {
      async.eachSeries(classIds, function(classId, done) {
        self.getDetailedClassStudentExp(classId, userId, function(err, result) {
          data.push(result)
          exp += result.exp;
          done()
        })
      }, function done() {
        if(data.length === 0)
          exp = 0;
        else
          exp = fixToTwo(exp/data.length)
        callback(null, {exp: exp, classes: data})
      })
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
        data.userName = result[0].userName;
        query.getStudentClasses(userId, function(err, classIds) {
          classCount = classIds.length;
          async.eachSeries(classIds, function(classId, done) {
            self.getClassStudentExp(classId, userId, function(err, result) {
              exp += Number(result);
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
      console.log('yo')
      data = result;
      console.log(data)
      self.getStudentExp(userId, function(err, exp) {
        data.exp = exp;
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

  this.getMyDormOfClassExp = function(userId, callback) {
    var self = this;
    var data = [];
    query.getRoommates(userId, function(err, userIds) {
      async.eachSeries(userIds, function(roommateId, done) {
        self.getClassStudentExp(roommateId, function(err, result) {
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
      console.log('roommates: '+userIds)
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
  this.getDetailedClassDormExp = function(classId, userId, callback) {
    var self = this;
    var data = [];
    query.getRoommates(userId, function(err, userIds) {
      async.eachSeries(userIds, function(roommateId, done) {
        self.getDetailedClassStudentExp(classId, roommateId, function(err, result) {
          if(!err)
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
   * @param classId
   * @param callback
   * result format
   * [
   *  {
   *    "userId": "",
   *    "classId": "",
   *    "userName": "",
   *    "overallScore": ""
   *  },
   *  {
   *    "userId": "",
   *    "classId": "",
   *    "userName": "",
   *    "overallScore": ""
   *  },
   *  {
   *    "userId": "",
   *    "classId": "",
   *    "userName": "",
   *    "overallScore": ""
   *  }
   * ]
   */
  this.getClassBadExpers = function(classId, callback) {
    this.fillClassExp(classId, function(err, result) {
      if(err)
        callback(err)
      else {
        query.getClassBadExpers(classId, function(err, result) {
          if(err)
            callback(err)
          else
            callback(null, result)
        })
      }
    })

  }
}


function fixToTwo(exp) {
  exp  = exp + '';
  return exp.substring(0, exp.indexOf(".") + 3);
}


module.exports = new Exp();
