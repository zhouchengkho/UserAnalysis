/**
 * Created by zhoucheng on 3/3/17.
 */
var db = require('./../models/index')
var Promise = require('bluebird');
var social = Promise.promisifyAll(require('./analysis/social'));
var activity = Promise.promisifyAll(require('./analysis/activity'));
var homework = Promise.promisifyAll(require('./analysis/homework'));
var EventProxy = require('eventproxy');
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
   *
   * @param classId
   * @param callback
   */
  this.computeAndFillClassExp = function(classId, callback) {

    Promise.all([
      activity.getClassExpsAsync(classId),
      social.getClassExpsAsync(classId),
      homework.getClassExpsAsync(classId)
    ]).spread(function(activityScore, socialScore, homeworkScore) {
      query.getClassStudentIdsDesc(classId, function(err, studentIds) {

        async.eachSeries(studentIds, function(studentId, done) {
          var index = studentIds.indexOf(studentId);

          var roundDown = getRoundDownExpData(activityScore[index].score, socialScore[index].score, homeworkScore[index].score);

          var activityExp = roundDown.activityExp;
          var socialExp = roundDown.socialExp;
          var homeworkExp = roundDown.homeworkExp;
          var exp = roundDown.exp;

          db.StudentClass.update({exp: exp, activityExp: activityExp, homeworkExp: homeworkExp, socialExp: socialExp}, {where: {classId: classId, userId: studentId}}).then(function(result) {
            done()
          }).catch(function(err) {callback(err)})
        }, function done(err) {
          if(err)
            callback(err)
          else
            callback(null, {message: 'success'})
        })
      })
    })
  }



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

  /**
   * scheduled task, fill data in low traffic time
   * @param callback
   */
  this.updateAllExp = function(callback) {
    var self = this;
    query.getClassesInDb(function(err, result) {
      if(err)
        return callback(err)
      async.eachSeries(result, function(classId, done) {
        self.computeAndFillClassExp(classId, function() {
          done()
        })
      }, function done() {
        callback(null, 'success')
      })
    })
  }

  this.fillClassStudentExp = function(classId, userId, callback) {
    this.getClassStudentExp(classId, userId, function(err, exp) {
      db.StudentClass.update({exp: exp.exp, activityExp: exp.activityExp, homeworkExp: exp.homeworkExp, socialExp: exp.socialExp}, {where: {classId: classId, userId: userId}}).then(function(result) {
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
   * {
   *  "exp": 3.55,
   *  "socialExp": "",
   *  "homeworkExp": "",
   *  "activityExp": ""
   * }
   */
  function computeClassStudentExp(classId, userId, callback) {
    Promise.all([
      activity.getClassStudentExpAsync(classId, userId),
      social.getClassStudentExpAsync(classId, userId),
      homework.getClassStudentExpAsync(classId, userId)
    ]).spread(function (activityExp, socialExp, homeworkExp) {
      console.log('result: ' + activityExp + ' ' + ' ' + socialExp + ' ' + homeworkExp);

      // var overallExp = Math.round((activityExp + socialExp + homeworkExp ) / 3)
      var data = getRoundDownExpData(activityExp, socialExp, homeworkExp);
      callback(null, data)
    }).catch(function(err) {
      console.log('error: '+err)
      callback(err)})
  }


  /**
   *
   * @param classId
   * @param userId
   * @param callback
   *
   * {
   *  "exp": 3.55,
   *  "socialExp": "",
   *  "homeworkExp": "",
   *  "activityExp": ""
   * }
   */
  this.getClassStudentExp = function(classId, userId, callback) {
    db.StudentClass.findAll({where: {classId: classId, userId: userId}}).then(function(result) {
      if(result.length === 0)
        return callback(new Error('user not in this class or not exist'))
      if(result[0].exp != null) {
        callback(null, {
          exp: result[0].exp,
          activityExp: result[0].exp,
          socialExp: result[0].socialExp,
          homeworkExp: result[0].homeworkExp
        })
      } else {
        computeClassStudentExp(classId, userId, function(err, result) {
          callback(err, result)
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
   *  "exp": 3.44
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

        result = JSON.parse(JSON.stringify(result))
        data.classId = result.classId;
        data.className = result.className;
        data.credit = result.credit;
        data.time = result.time;
        self.getClassStudentExp(classId, userId, function(err, result) {
          if(err)
            return callback(err)

          data.exp = result.exp;
          data.socialExp = result.socialExp;
          data.homeworkExp = result.homeworkExp;
          data.activityExp = result.activityExp;
          console.log(data)
          callback(null, data)
        })
      })
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
   *  "exp": 3.44
   * }
   */
  this.getComputedClassStudentExp = function(classId, userId, callback) {
    var data = {};

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
        computeClassStudentExp(classId, userId, function(err, result) {
          data.exp = result.exp;
          data.activityExp = result.activityExp;
          data.socialExp = result.socialExp;
          data.homeworkExp = result.homeworkExp;
          callback(err, data)
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
    var sum = 0;
    query.getStudentClasses(userId, function(err, classIds) {
      async.eachSeries(classIds, function(classId, done) {
        self.getDetailedClassStudentExp(classId, userId, function(err, result) {
          data.push(result)
          exp += result.exp * (result.credit + result.time);
          sum += result.credit + result.time;
          done()
        })
      }, function done() {
        if(data.length === 0)
          exp = 0;
        else {
          exp = Math.round(exp / sum)
        }
        callback(null, {exp: exp, classes: data})
      })
    })
  }

  /**
   *
   * @param userId
   * @param callback
   *
   *
   * {
   *  "exp": 6.84,
   *  "userName": "cheng",
   *  "userId": "some_userId",
   *  "classes": [
   *    {
   *      "classId": "",
   *      "userId": "",
   *      "exp": ""
   *    }
   *  ]
   * }
   *
   */
  this.getStudentExp = function(userId, callback) {
    var self = this;
    var data = {
      userId: userId,
      classes: []
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
              var temp = {
                classId: classId,
                userId: userId,
                exp: result.exp
              }
              data.classes.push(temp)
              exp += Number(result.exp);
              done();
            })
          }, function done() {
            // calculate avg
            exp = Math.round(exp / classCount);
            resolve()
          })
        })
      })
    }).then(function() {
      data.exp = exp;
      callback(null, data)
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
      self.getStudentExp(userId, function(err, d) {
        data.exp = d.exp;
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
          data.push(result.exp)
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
          data.push(result.exp)
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

  this.getClassGoodExpers = function(classId, callback) {
    this.fillClassExp(classId, function(err, result) {
      if(err)
        callback(err)
      else {
        query.getClassGoodExpers(classId, function(err, result) {
          if(err)
            callback(err)
          else
            callback(null, result)
        })
      }
    })
  }

  /**
   *
   * @param classId
   * @param callback
   *
   * {
   *  "goodExpers": [],
   *  "badExpers": []
   * }
   */
  this.getClassPolariziedExpers = function(classId, callback) {
    var self = this;
    var data = {};
    self.fillClassExp(classId, function(err, result) {
      if(err)
        callback(err)
      else {
          query.getClassGoodExpers(classId, function(err, result) {
            data.goodExpers = result;
            query.getClassBadExpers(classId, function(err, result) {
              if(err)
                return callback(err)
              else {
                data.badExpers = result;
                callback(null, data)
              }
            })
          })
      }
    })
  }

  /**
   *
   * @param classId
   * @param callback
   *
   */
  this.getClassExpDistribution = function(classId, callback) {
    this.fillClassExp(classId, function(err) {
      if(err)
        callback(err)
      else {
        query.getClassExpDistribution(classId, function(err, result) {
          callback(err, result)
        })
      }
    })
  }



}


function getRoundDownExpData(activityExp, socialExp, homeworkExp) {
  activityExp = Math.round(activityExp);
  socialExp = Math.round(socialExp);
  homeworkExp = Math.round(homeworkExp);
  var exp = Math.round((activityExp + socialExp + homeworkExp) / 3);
  return {
    exp: exp,
    activityExp: activityExp,
    socialExp: socialExp,
    homeworkExp: homeworkExp
  }
}

module.exports = new Exp();


