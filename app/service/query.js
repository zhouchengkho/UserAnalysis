/**
 * Created by zhoucheng on 2/4/17.
 */

var db = require('../models/index')
var Promise = require('bluebird')
var helper = require('./helper');

function Query() {

  this.getClassTermName = function(classId, callback) {
    db.Class.findAll({where: {classId: classId}, include: [db.Term]}).then(function(result) {
      var termName = result[0].Term.termName
      callback(null, termName)
    }).catch(function(err) {callback(err)})
  }
  /**
   *
   * @param userId
   * result format: Array
   * ['classId', 'classId' ...]
   */
  this.getStudentClasses = function(userId, callback) {
    db.StudentClass.findAll({where: {userId: userId}}).then(function(result) {
      var data = [];
      for(var index in result)
        data.push(result[index].classId)
      callback(null, data)
    }).catch(function(err) {callback(err)})
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
   *
   * @param userId
   * @param callback
   * [
   *  {
   *    "classId": "C180001201403",
   *    "className": "数据结构"
   *    "exp":2.86
   *  },
   *  {
   *    ...
   *  }
   * ]
   */
  this.getStudentClassesDetail = function(userId, callback) {
    db.StudentClass.findAll({where: {userId: userId}, include: [{model: db.Class, include: [db.Course]}]}).then(function(result) {
      var data = [];
      for(var i in result) {
        var temp = {};
        temp.classId = result[i].classId;
        temp.className = result[i].Class.Course.courseName;
        temp.exp = result[i].exp;
      }
      callback(null, result)
    }).catch(function(err) {callback(err)})
  }

  /**
   *
   * @param classId
   * @param callback
   */
  this.getClassStudentIdsDesc = function(classId, callback) {
    var studentIds = [];
    db.StudentClass.findAll({where: {classId: classId}, order: 'userId desc'}).then(function(result) {
      for(var i in result) {
        studentIds.push(result[i].userId)
      }
      callback(null, studentIds)
    }).catch(function(err) {
      callback(err)
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
    var actionCodes = "(";
    for(var i in actionCode) {
      actionCodes+="'"+actionCode[i]+"',"
    }
    actionCodes = actionCodes.slice(0, -1);
    actionCodes+=")";
    var rawQuery = "select student_class.userId, ifnull(t.count, 0) count from student_class left outer join (select count(userId) count, userId from action where classId = '"+ classId +"' and actionCode in"+actionCodes+" group by userId) t on student_class.userId = t.userId where classId = '"+classId+"' order by student_class.userId desc;";
    db.sequelize.query(rawQuery).then(function(result) {
        callback(null, JSON.parse(JSON.stringify(result[0])))
    }).catch(function(err) {callback(err)})
  }
  /**
   *
   * @param classId
   * @param callback
   *
   * {
   *  "classId": "",
   *  "className": ""
   * }
   */
  this.getClassDetail = function(classId, callback) {
    db.Class.findAll({where: {classId: classId}, include:[db.Course]}).then(function(result) {
      callback(null, {classId: result[0].classId, className: result[0].Course.courseName})
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
      console.log('user info of: '+userId)
      console.log(JSON.stringify(result))
      callback(null, JSON.parse(JSON.stringify(result[0])))
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
      return db.Dorm.findAll({where: {dormId: result[0].dormId, enrollYear: result[0].enrollYear}})
    }).then(function(result) {
      var userIds = [];
      for(var i in result) {
        if(result[i].userId != userId)
          userIds.push(result[i].userId)
      }
      return db.User.findAll({attributes: ['userId'], where: {userId: {$in: userIds}}})
    }).then(function(userIds) {
      var data = [];
      for(var i in userIds)
        data.push(userIds[i].userId)
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
   * Callback userId s are in desc order
   * @param classId
   * @param callback
   *
   * [
   *  {
   *    "userId": "10132510237",
   *    "count": 20
   *  },
   *  {
   *    "userId": "10142510222",
   *    "count": 13
   *  }
   * ]
   */
  // this.getClassFriendsCountGroup = function(classId, callback) {
  //   this.getClassStudentIdsDesc(classId, function(err, userIds) {
  //     db.Friend.findAll({
  //       attributes: ['userId', [db.sequelize.fn('COUNT', 'userId'), 'count']],
  //       where: {userId: {$in: userIds}},
  //       group: ['userId'],
  //       order: 'userId desc'
  //     }).then(function(result) {
  //       callback(null, helper.fillZeroCountStudents(JSON.parse(JSON.stringify(result)), userIds))
  //     }).catch(function(err) {
  //       callback(err)
  //     })
  //   })
  // }

  this.getClassFriendsCountGroup = function(classId, callback) {
    var rawQuery = "select user.userId, ifnull(t.friendCount, 0) count from user left outer join (select userId, count(userId) friendCount from friend group by userId) t on user.userId = t.userId where user.userId in (select userId from student_class where classId = '"+classId+"') order by user.userId desc;";
    db.sequelize.query(rawQuery).then(function(result) {
      callback(null, result[0])
    }).catch(function(err) {callback(err)})
  }


  this.getClassStatusCountGroupInTime = function(classId, gte, lte, callback) {
    var rawQuery = "select user.userId, ifnull(t.count, 0) count from user left outer join (select userId, count(userId) count from status where time > '"+gte+"' and time < '" + lte + "'group by userId) t on user.userId = t.userId where user.userId in (select userId from student_class where classId = '"+classId+"') order by user.userId desc;";
    db.sequelize.query(rawQuery).then(function(result) {
      callback(null, result[0])
    }).catch(function(err) {callback(err)})
  }

  this.getClassStatusReplyCountGroupInTime = function(classId, gte, lte, callback) {
    var rawQuery = "select user.userId, ifnull(t.count, 0) count from user left outer join (select fromId, count(fromId) count from statusreply where time > '"+gte+"' and time < '" + lte + "'group by fromId) t on user.userId = t.fromId where user.userId in (select userId from student_class where classId = '"+classId+"') order by user.userId desc;";
    db.sequelize.query(rawQuery).then(function(result) {
      callback(null, result[0])
    }).catch(function(err) {
      console.log(err)
      callback(err)}
      )

  }

  this.getClassSourceReplyCountGroupInTime = function(classId, gte, lte, callback) {
    var rawQuery = "select user.userId, ifnull(t.count, 0) count from user left outer join (select fromId, count(fromId) count from sourcereply where time > '"+gte+"' and time < '" + lte + "'group by fromId) t on user.userId = t.fromId where user.userId in (select userId from student_class where classId = '"+classId+"') order by user.userId desc;";
    db.sequelize.query(rawQuery).then(function(result) {
      callback(null, result[0])
    }).catch(function(err) {callback(err)})

  }

  this.getClassTopicReplyCountGroupInTime = function(classId, gte, lte, callback) {
    var rawQuery = "select user.userId, ifnull(t.count, 0) count from user left outer join (select fromId, count(fromId) count from topicreply where time > '"+gte+"' and time < '" + lte + "'group by fromId) t on user.userId = t.fromId where user.userId in (select userId from student_class where classId = '"+classId+"') order by user.userId desc;";
    db.sequelize.query(rawQuery).then(function(result) {
      callback(null, result[0])
    }).catch(function(err) {callback(err)})

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

  this.getStudentStatusReplyCountInTime = function(userId, gte, lte, callback) {
    db.StatusReply.count({where: {fromId: userId, time: {gte: gte, lte: lte}}}).then(function(count) {
      callback(null, count)
    }).catch(function(err) {callback(err)})
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

  this.getClassBadExpers = function(classId, callback) {
    db.StudentClass.findAll({where: {classId: classId}, limit: 3, order: 'exp asc'}).then(function(result) {
      callback(null, result)
    }).catch(function(err) {callback(err)})
  }

  /**
   *
   * @param classId
   * @param callback
   * [1, 2, 3, 4, 6]
   */
  this.getClassAssignments = function(classId, callback) {
    db.Assignment.findAll({where: {classId: classId}, order: 'assignmentId desc'}).then(function(result) {
      var data = [];
      for(var i in result) {
        data.push(result[i].assignmentId)
      }
      callback(null, data)
    }).catch(function(err) {callback(err)})
  }


  /**
   *
   * @param classId
   * @param userId
   * @param callback
   *
   * [
   *  {
   *    "assignmentId": 127,
   *    "startTime": "2015-07-21T10:36:33.000Z",
   *    "endTime": "2015-07-22T16:00:00.000Z",
   *    "submitted": false
   *  },
   *  {
   *    "assignmentId": 126,
   *    "startTime": "2015-07-21T10:36:33.000Z",
   *    "endTime": "2015-07-22T16:00:00.000Z",
   *    "submitted": true,
   *    "submitTime": "2015-07-22T15:36:16.000Z"
   *  },
   *  {
   *    ...
   *  }
   * ]
   */
  this.getClassStudentAssignmentTimes = function(classId, userId, callback) {
    db.Assignment.findAll({
      attributes: ['assignmentId', ['startDate', 'startTime'], ['endDate', 'endTime']],
      where: {classId: classId},
      include: [{model: db.StudentAssignment, attributes: [['time', 'submitTime'], ['count', 'submitCount']], where: {userId: userId}, required: false}],
      order: 'assignmentId desc'
    }).then(function(result){
      var data = [];
      result = JSON.parse(JSON.stringify(result))
      for(var i in result) {
        var temp = {};
        temp.assignmentId = result[i].assignmentId;
        temp.startTime = result[i].startTime;
        temp.endTime = result[i].endTime;
        if(result[i].StudentAssignments.length === 0)
          temp.submitted = false;
        else {
          temp.submitTime = result[i].StudentAssignments[0].submitTime;
          temp.submitCount = result[i].StudentAssignments[0].submitCount;
          temp.submitted = true;
        }

        data.push(temp)
      }
      callback(null, data)
    }).catch(function(err) {callback(err)})
  }

  /**
   *
   * @param classId
   * @param userId
   * @param callback
   *
   * [
   *  {
   *    "assignmentId": 127,
   *    "title": "第二周作业",
   *    "startTime": "2015-07-21T10:36:33.000Z",
   *    "endTime": "2015-07-22T16:00:00.000Z",
   *    "submitted": false
   *  },
   *  {
   *    "assignmentId": 126,
   *    "title": "第三周作业",
   *    "startTime": "2015-07-21T10:36:33.000Z",
   *    "endTime": "2015-07-22T16:00:00.000Z",
   *    "submitted": true,
   *    "submitTime": "2015-07-22T15:36:16.000Z"
   *  },
   *  {
   *    ...
   *  }
   * ]
   */
  this.getDetailedClassStudentAssignments = function(classId, userId, callback) {
    console.log('getting detailed assignments for '+classId +' '+userId)
    db.Assignment.findAll({
      attributes: ['assignmentId', [db.sequelize.fn('date_format', db.sequelize.col('startDate'), '%Y-%m-%d'), 'startTime'], [db.sequelize.fn('date_format', db.sequelize.col('endDate'), '%Y-%m-%d'), 'endTime'], 'title'],
      where: {classId: classId},
      include: [{model: db.StudentAssignment, attributes: [[db.sequelize.fn('date_format', db.sequelize.col('time'), '%Y-%m-%d %h:%i:%s'), 'submitTime'], ['count', 'submitCount']], where: {userId: userId}, required: false}],
      order: 'assignmentId desc'
    }).then(function(result){
      var data = [];
      result = JSON.parse(JSON.stringify(result))
      var submitCount = 0;
      for(var i in result) {
        var temp = {};
        temp.assignmentId = result[i].assignmentId;
        temp.title = result[i].title;
        temp.startTime = result[i].startTime;
        temp.endTime = result[i].endTime;
        if(result[i].StudentAssignments.length === 0)
          temp.submitted = false;
        else {
          temp.submitTime = result[i].StudentAssignments[0].submitTime;
          temp.submitCount = result[i].StudentAssignments[0].submitCount;
          temp.submitted = true;
          submitCount++;
        }

        data.push(temp)
      }
      var final = {
        total: data.length,
        submitCount: submitCount,
        data: data
      }
      callback(null, final)
    }).catch(function(err) {callback(err)})
  }
}

module.exports = new Query();
