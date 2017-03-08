/**
 * Created by zhoucheng on 2/4/17.
 */

var db = require('../models/index')
var Promise = require('bluebird')


function Query() {
  /**
   * Traverse val to fill where clause
   * main purpose is to remove null key
   * @param val JSON
   */
  this.genWhereQuery = function(val) {
    var result = {where: {}};
    for(var key in val) {
      if(val[key])
        result.where[key] = val[key]
    }
    return result;
  }

  /**
   *
   * @param userId
   * result format: Array
   * ['classId', 'classId' ...]
   */
  this.getStudentClasses = function(userId) {
    return new Promise(function(resolve, reject){
      db.StudentClass.findAll({where: {userId: userId}}).then(function(result) {
        var data = [];
        for(var index in result)
          data.push(result[index].classId)
        resolve(data)
      }).catch(function(err) {reject(err)})
    })
  }

  /**
   *
   * @param classId
   * @param callback
   * [
   *  {
   *    "userId": "1231231",
   *    "classId": "CA4131",
   *    "exp": number | null
   *  },
   *  {
   *    ...
   *  }
   * ]
   */
  this.getStudentsByClass = function(classId, callback) {
    db.StudentClass.findAll({where: {classId: classId}}).then(function(result) {
      callback(null, result)
    })
  }

  /**
   * @param classId
   * @param userId
   * @param actionCode
   * @param callback
   * @returns {Promise}
   */
  this.getClassStudentActionCount = function(classId, userId, actionCode, callback) {
    if (typeof actionCode == 'string') {
      var temp = actionCode;
      actionCode = [];
      actionCode.push(temp)
    }
    db.Action.count({where: {userId: userId, classId: classId, actionCode: {$in: actionCode}}}).then(function(count) {
      callback(null, count)
    }).catch(function(err) {callback(err)})
  }

  /**
   *
   * @param classId
   * @param actionCode
   * @param callback
   */
  this.getClassActionCountAvg = function(classId, actionCode, callback) {
    if (typeof actionCode == 'string') {
      var temp = actionCode;
      actionCode = [];
      actionCode.push(temp)
    }
    var studentCount;
    db.sequelize.transaction(function() {
      return db.StudentClass.count({where: {classId: classId}})
    }).then(function(result) {
      studentCount = result;
      return db.Action.count({where: {classId: classId, actionCode: {$in: actionCode}}})
    }).then(function(count) {
      callback(null, studentCount == 0 ? 0 : count / studentCount)
    }).catch(function(err) {
      callback(err)
    })
  }


  /**
   *
   * @param classId
   * @param actionCode
   * @param callback
   *
   * [
   *  {
   *    "userId": "",
   *    "count": 5
   *  },
   *  {
   *    "userId": "",
   *    "count" 3
   *  }
   * ]
   */
  this.getClassActionCountGroup = function(classId, actionCode, callback) {
    if (typeof actionCode == 'string') {
      var temp = actionCode;
      actionCode = [];
      actionCode.push(temp)
    }
    db.Action.findAll({
      attributes: ['userId', [db.sequelize.fn('COUNT', 'actionCode'), 'count']],
      where: {classId: classId, actionCode: {$in: actionCode}},
      group: ['userId'],
      order: [['userId', 'desc']]}).then(function(result) {
        callback(null, result)
    }).catch(function(err) {callback(err)})
  }
  /**
   *
   * @param classId
   * @param callback
   *
   * {
   *  "classId": "",
   *  "courseName": ""
   * }
   */
  this.getClassDetail = function(classId, callback) {
    db.Class.findAll({where: {classId: classId}, include:[db.Course]}).then(function(result) {
      callback(null, {classId: result[0].classId, courseName: result[0].Course.courseName})
    })
  }

  /**
   *
   * @param callback
   * @returns {Array}
   * ['classId_1', 'classId_2'...]
   */
  this.getClassesInDb = function(callback) {
    db.Class.findAll({}).then(function(result) {
      var data = [];
      for(var index in result)
        data.push(result[index].classId)
      callback(null, data)
    }).catch(function(err) {callback(err)})
  }


  this.getUserInfo = function(userId, callback) {
    db.User.findAll({where: {userId: userId}}).then(function(result) {
      callback(null, result[0])
    }).catch(function(err) {callback(err)})
  }

  /**
   *
   * @param userId
   * @param callback
   *
   * ['userId', 'userId', 'userId', 'userId']
   */
  this.getRoommates = function(userId, callback) {
    db.sequelize.transaction(function() {
      return db.Dorm.findAll({where: {userId: userId}})
    }).then(function(result) {
      return db.Dorm.findAll({where: {dormId: result[0].dormId}})
    }).then(function(result) {
      var data = [];
      for(var i in result) {
        if(result[i].userId != userId)
          data.push(result[i].userId)
      }

      callback(null, data)
    }).catch(function(err) {
      callback(err)
    })
  }

  /**
   *
   * @param teacherId
   * @param callback
   *
   * {
   *  "classId": "",
   *  "courseId": "",
   *  "userId": "",
   *  "termId": "",
   *  "classStatus": "",
   *  "Course":
   *    {
   *      "courseId": "",
   *      "courseName": "",
   *      "courseCredit": "",
   *      "courseWeekTime": "",
   *      "courseStatus": ""
   *    }
   * }
   */
  this.getTeacherClasses = function(teacherId, callback) {
    db.Class.findAll({where: {userId: teacherId}, include: [db.Course]}).then(function(result) {
      callback(null, result)
    }).catch(function(err) {
      callback(err)
    })
  }


  /**
   *
   * @param callback
   *
   * 388 {Number}
   */
  this.getTotalUserCount = function(callback) {
    db.User.count({}).then(function(count) {
      callback(null, count)
    }).catch(function(err) {callback(err)})
  }

  /**
   *
   * @param userId
   * @param gte
   * @param lte
   * @param callback
   *
   * {Number}
   */
  this.getStudentActionCountInTime = function(userId, gte, lte, callback) {
    db.Action.count({where: {time: {gte: gte, lte: lte}, userId: userId}}).then(function(count) {
      callback(null, count)
    }).catch(function(err) {callback(err)})
  }

  /**
   *
   * @param userId
   * @param gte
   * @param lte
   * @param callback
   *
   * {Number}
   */
  this.getStudentActionCountInTimeAvg = function(userId, gte, lte, callback) {
    this.getTotalUserCount(function(err, userCount) {
      db.Action.count({where: {time: {gte: gte, lte: lte}}}).then(function(count) {


        callback(null, count/userCount)
      }).catch(function(err) {callback(err)})
    })
  }


  /**
   *
   * @param userId
   * @param callback
   *
   * {Number}
   */
  this.getStudentFriendsCount = function(userId, callback) {
    db.Friend.count({where: {userId: userId}}).then(function(count) {
      callback(null, count)
    }).catch(function(err) {callback(err)})
  }

  /**
   *
   * @param callback
   *
   * {Number}
   */
  this.getStudentFriendsCountAvg = function(callback) {
    this.getTotalUserCount(function(err, userCount) {
      db.Friend.count({}).then(function(count) {
        callback(null, count/userCount)
      }).catch(function(err) {callback(err)})
    })
  }

  /**
   *
   * @param userId
   * @param gte
   * @param lte
   * @param callback
   */
  this.getStudentStatusCountInTime = function(userId, gte, lte, callback) {
    db.Status.count({where: {userId: userId, time: {gte: gte, lte: lte}}}).then(function(count) {
      callback(null, count)
    }).catch(function(err) {callback(err)})
  }

  /**
   *
   * @param gte
   * @param lte
   * @param callback
   */
  this.getStudentStatusCountInTimeAvg = function(gte, lte, callback) {
    this.getTotalUserCount(function(err, userCount) {
      db.Status.count({where: {time: {gte: gte, lte: lte}}}).then(function(count) {
        callback(null, count/userCount)
      })
    })
  }

  /**
   *
   * @param userId
   * @param gte
   * @param lte
   * @param callback
   */
  this.getStudentTopicReplyCountInTime = function(userId, gte, lte, callback) {
    db.TopicReply.count({where: {fromId: userId, time: {gte: gte, lte: lte}}}).then(function(count) {
      callback(null, count)
    }).catch(function(err) {callback(err)})
  }

  /**
   *
   * @param gte
   * @param lte
   * @param callback
   */
  this.getStudentTopicReplyCountInTimeAvg = function(gte, lte, callback) {
    this.getTotalUserCount(function(err, userCount) {
      db.TopicReply.count({where: {time: {gte: gte, lte: lte}}}).then(function(count) {
        callback(null, count/userCount)
      }).catch(function(err) {callback(err)})
    })
  }

  /**
   *
   * @param userId
   * @param gte
   * @param lte
   * @param callback
   */
  this.getStudentSourceReplyCountInTime = function(userId, gte, lte, callback) {
    db.SourceReply.count({where: {fromId: userId, time: {gte: gte, lte: lte}}}).then(function(count) {
      callback(null, count)
    }).catch(function(err) {callback(err)})
  }

  /**
   *
   * @param gte
   * @param lte
   * @param callback
   */
  this.getStudentSourceReplyCountInTimeAvg = function(gte, lte, callback) {
    this.getTotalUserCount(function(err, userCount) {
      db.SourceReply.count({where: {time: {gte: gte, lte: lte}}}).then(function(count) {
        callback(null, count/userCount)
      }).catch(function(err) {callback(err)})
    })
  }
}

module.exports = new Query();
