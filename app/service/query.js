/**
 * Created by zhoucheng on 2/4/17.
 */

var db = require('../models/index')
var Promise = require('bluebird')
var helper = require('./helper');
var prefix = require('../../config/config').prefix;
var async = require('async');
function Query() {

  this.login = function(userId, callback) {
    db.User.findAll({
      where: {
        userId: userId
      },
      raw: true
    }).then(function(users) {
      if(users.length > 0) {
        callback(null, users[0])
      } else {
        callback(null, null)
      }
    }).catch(function(err) {callback(err)})
  }
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
   *    "activity":2.86
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
        temp.activity = result[i].activity;
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
   *
   * @param classId
   * @param callback
   */
  this.getClassStudentCount = function(classId, callback) {
    db.StudentClass.count({where: {classId: classId}}).then(function(count) {
      callback(null, count)
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
      callback(null, helper.toFixed(studentCount == 0 ? 0 : count / studentCount))
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
   * @param actionCode {Array}
   * @param weights {Array}
   * @param callback
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
  this.getClassActionWeightedCountGroup = function(classId, actionCode, weights, callback) {
    var finalQuery = "select userId, sum(sum_table.count) count from ( ";
    for(var i in actionCode) {
      var rawQuery = i == 0 ? " " : " union all ";
      rawQuery +=  "select * from( " +
        "select student_class.userId, "+ weights[i] +" * ifnull(t.count, 0) count from student_class left outer join (select count(userId) count, userId from action "+
        "where classId = '" + classId + "' and actionCode = '" + actionCode[i] + "' group by userId) t on student_class.userId = t.userId where classId = '" + classId + "' order by student_class.userId desc) table"+i+" ";
      finalQuery += rawQuery;
    }
    finalQuery += " ) sum_table group by sum_table.userId order by sum_table.userId desc;";
    db.sequelize.query(finalQuery).then(function(result) {
      callback(null, result[0])
    }).catch(function(err) {callback(err)})
  }
  /**
   *
   * @param classId
   * @param callback
   *
   * {
   *  "classId": "",
   *  "className": "",
   *  "credit": "",
   *  "time: ""
   * }
   */
  this.getClassDetail = function(classId, callback) {
    db.Class.findAll({
      attributes: ['classId', [db.sequelize.literal('Course.courseName'), 'className'], [db.sequelize.literal('Course.courseCredit'), 'credit'], [db.sequelize.literal('Course.courseWeekTime'), 'time']],
      where: {classId: classId}, include:[db.Course]}).then(function(result) {
      callback(null, result[0])
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
      for(var index in result) {
        data.push(result[index].classId)
      }
      callback(null, data)
    }).catch(function(err) {callback(err)})
  }


  this.getUserInfo = function(userId, callback) {
    db.User.findAll(
      {
        attributes: ['userId', 'userName', 'nickName', 'isTeacher', 'gender', 'departId', [db.sequelize.literal("if(faceIcon=null, null,CONCAT('" + prefix + "', faceIcon))"), 'faceIcon']],
        raw: true,
        where: {userId: userId}}).then(function(result) {
          console.log('shout out')
          console.log(result)
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
    db.Class.findAll({where: {userId: teacherId}, include: [db.Course, db.Term], order: 'Term.termId desc'}).then(function(result) {
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


        callback(null, helper.toFixed(userCount == 0 ? 0 : count / userCount))
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
        callback(null, helper.toFixed(userCount == 0 ? 0 : count / userCount))
      }).catch(function(err) {callback(err)})
    })
  }

  this.getClassStudentFriendsCountAvg = function(classId, callback) {
    this.getClassStudentCount(classId, function(err, userCount) {
      var rawQuery = "select count(*) as count from friend left outer join student_class on friend.userId = student_class.userId where classId = '" + classId + "';";
      db.sequelize.query(rawQuery).then(function(result) {
        var count = result[0][0].count;
        callback(err, helper.toFixed(userCount == 0 ? 0 : count / userCount))
      })
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

  /**
   *
   * @param classId
   * @param callback
   *
   * [
   *  {
   *    "userId": "",
   *    "count": 5
   *  },
   *  {
   *    "userId": "",
   *    "count": 6
   *  }
   * ]
   */
  this.getClassFriendsCountGroup = function(classId, callback) {
    var rawQuery = "select student_class.userId, ifnull(t.friendCount, 0) count from student_class left outer join (select userId, count(userId) friendCount from friend group by userId) t on student_class.userId = t.userId where student_class.classId = '" + classId + "' order by student_class.userId desc;";
    db.sequelize.query(rawQuery).then(function(result) {
      callback(null, result[0])
    }).catch(function(err) {callback(err)})
  }


  this.getClassStatusCountGroupInTime = function(classId, gte, lte, callback) {
    var rawQuery = "select student_class.userId, ifnull(t.count, 0) count from student_class left outer join (select userId, count(userId) count from status where time > '" + gte + "' and time < '" + lte + "' group by userId) t on student_class.userId = t.userId where student_class.classId = '" + classId + "' order by student_class.userId desc;";
    db.sequelize.query(rawQuery).then(function(result) {
      callback(null, result[0])
    }).catch(function(err) {callback(err)})
  }

  this.getClassStatusReplyCountGroupInTime = function(classId, gte, lte, callback) {
    var rawQuery = "select student_class.userId, ifnull(t.count, 0) count from student_class left outer join (select fromId, count(fromId) count from statusreply where time > '" + gte + "' and time < '" + lte + "' group by fromId) t on student_class.userId = t.fromId where student_class.classId = '" + classId + "' order by student_class.userId desc;";
    db.sequelize.query(rawQuery).then(function(result) {
      callback(null, result[0])
    }).catch(function(err) {
      console.log(err)
      callback(err)}
      )

  }

  this.getClassSourceReplyCountGroupInTime = function(classId, gte, lte, callback) {
    var rawQuery = "select student_class.userId, ifnull(t.count, 0) count from student_class left outer join (select fromId, count(fromId) count from sourcereply where time > '" + gte + "' and time < '" + lte + "' group by fromId) t on student_class.userId = t.fromId where student_class.classId = '" + classId + "' order by student_class.userId desc;";
    db.sequelize.query(rawQuery).then(function(result) {
      callback(null, result[0])
    }).catch(function(err) {callback(err)})

  }

  this.getClassTopicReplyCountGroupInTime = function(classId, gte, lte, callback) {
    var rawQuery = "select student_class.userId, ifnull(t.count, 0) count from student_class left outer join (select fromId, count(fromId) count from topicreply where time > '" + gte + "' and time < '" + lte + "' group by fromId) t on student_class.userId = t.fromId where student_class.classId = '" + classId + "' order by student_class.userId desc;";
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
        callback(null, helper.toFixed(userCount == 0 ? 0 : count / userCount))
      })
    })
  }

  this.getClassStudentStatusCountInTimeAvg = function(classId, gte, lte, callback) {
    this.getClassStudentCount(classId, function(err, userCount) {
      var rawQuery = "select count(*) as count from status left outer join student_class on status.userId = student_class.userId where classId = '" + classId + "' and time > '" + gte + "' and time < '" + lte + "';";
      db.sequelize.query(rawQuery).then(function(result) {
        var count = result[0][0].count;
        callback(err, helper.toFixed(userCount == 0 ? 0 : count / userCount))
      })
    })
  }



  this.getStudentStatusReplyCountInTime = function(userId, gte, lte, callback) {
    db.StatusReply.count({where: {fromId: userId, time: {gte: gte, lte: lte}}}).then(function(count) {
      callback(null, count)
    }).catch(function(err) {callback(err)})
  }

  this.getStudentStatusReplyCountInTimeAvg = function(gte, lte, callback) {
    this.getTotalUserCount(function(err, userCount) {
      db.StatusReply.count({where: {time: {gte: gte, lte: lte}}}).then(function(count) {
        callback(null, helper.toFixed(userCount == 0 ? 0 : count / userCount))
      })
    })
  }

  this.getClassStudentStatusReplyCountInTimeAvg = function(classId, gte, lte, callback) {
    this.getClassStudentCount(classId, function(err, userCount) {
      var rawQuery = "select count(*) as count from statusreply left outer join student_class on statusreply.fromId = student_class.userId where classId = '" + classId + "' and time > '" + gte + "' and time < '" + lte + "';";
      db.sequelize.query(rawQuery).then(function(result) {
        var count = result[0][0].count;
        callback(err, helper.toFixed(userCount == 0 ? 0 : count / userCount))
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
        callback(null, helper.toFixed(userCount == 0 ? 0 : count / userCount))
      }).catch(function(err) {callback(err)})
    })
  }

  this.getClassStudentTopicReplyCountInTimeAvg = function(classId, gte, lte, callback) {
    this.getClassStudentCount(classId, function(err, userCount) {
      var rawQuery = "select count(*) as count from topicreply left outer join student_class on topicreply.fromId = student_class.userId where classId = '" + classId + "' and time > '" + gte + "' and time < '" + lte + "';";
      db.sequelize.query(rawQuery).then(function(result) {
        var count = result[0][0].count;
        callback(err, helper.toFixed(userCount == 0 ? 0 : count / userCount))
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
        callback(null, helper.toFixed(userCount == 0 ? 0 : count / userCount))
      }).catch(function(err) {callback(err)})
    })
  }

  this.getClassStudentSourceReplyCountInTimeAvg = function(classId, gte, lte, callback) {
    this.getClassStudentCount(classId, function(err, userCount) {
      var rawQuery = "select count(*) as count from sourcereply left outer join student_class on sourcereply.fromId = student_class.userId where classId = '" + classId + "' and time > '" + gte + "' and time < '" + lte + "';";
      db.sequelize.query(rawQuery).then(function(result) {
        var count = result[0][0].count;
        callback(err, helper.toFixed(userCount == 0 ? 0 : count / userCount))
      })
    })
  }
  /**
   *
   * @param classId
   * @param callback
   *
   * {
   *  "userId": "",
   *  "classId": "",
   *  "activity": 0,
   *  "User": {
   *    "userName": ""
   *  }
   * }
   */
  this.getClassBadExpers = function(classId, callback) {
    db.StudentClass.findAll({where: {classId: classId}, limit: 3, include: [db.User], order: 'activity asc'}).then(function(result) {
      callback(null, JSON.parse(JSON.stringify(result)))
    }).catch(function(err) {callback(err)})
  }

  /**
   *
   * @param classId
   * @param callback
   *
   * {
   *  "userId": "",
   *  "classId": "",
   *  "activity": 0,
   *  "User": {
   *    "userName": ""
   *  }
   * }
   */
  this.getClassGoodExpers = function(classId, callback) {
    db.StudentClass.findAll({where: {classId: classId}, limit: 3, include: [db.User], order: 'activity desc'}).then(function(result) {
      callback(null, JSON.parse(JSON.stringify(result)))
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
   *    "title": "",
   *    "startTime": "2015-07-21T10:36:33.000Z",
   *    "endTime": "2015-07-22T16:00:00.000Z",
   *    "submitted": false,
   *    "submitCount": 0
   *  },
   *  {
   *    "assignmentId": 126,
   *    "title": "",
   *    "startTime": "2015-07-21T10:36:33.000Z",
   *    "endTime": "2015-07-22T16:00:00.000Z",
   *    "submitted": true,
   *    "submitTime": "2015-07-22T15:36:16.000Z",
   *    "submitCount": 5
   *  },
   *  {
   *    ...
   *  }
   * ]
   */
  this.getClassStudentAssignmentDetails = function(classId, userId, callback) {
    db.Assignment.findAll({
      attributes: ['assignmentId', ['startDate', 'startTime'], ['endDate', 'endTime'], 'title'],
      where: {classId: classId},
      include: [{model: db.StudentAssignment, attributes: [['time', 'submitTime'], ['count', 'submitCount']], where: {userId: userId}, required: false}],
      order: 'assignmentId desc'
    }).then(function(result){
      var data = [];
      result = JSON.parse(JSON.stringify(result))
      for(var i in result) {
        var temp = {};
        temp.assignmentId = result[i].assignmentId;
        temp.title = result[i].title;
        temp.startTime = result[i].startTime;
        temp.endTime = result[i].endTime;
        if(result[i].StudentAssignments.length === 0) {
          temp.submitted = false;
          temp.submitCount = 0;
        }
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


  this.getDetailedClassStudentAssignments = function(classId, userId, callback) {
    console.log('getting detailed assignments for '+classId +' '+userId)
    db.Assignment.findAll({
      attributes: ['assignmentId', [db.sequelize.fn('date_format', db.sequelize.col('startDate'), '%Y-%m-%d'), 'startTime'], [db.sequelize.fn('date_format', db.sequelize.col('endDate'), '%Y-%m-%d'), 'endTime'], 'title'],
      where: {classId: classId},
      include: [{model: db.StudentAssignment, attributes: [[db.sequelize.fn('date_format', db.sequelize.col('time'), '%Y-%m-%d %h:%i:%s'), 'submitTime'], ['count', 'submitCount']], where: {userId: userId}, required: false}],
      order: 'assignmentId desc'
    }).then(function(result){
      callback(null, result)
    }).catch(function(err) {callback(err)})
  }


  /**
   *
   * @param classId
   * @param userId
   * @param callback
   *
   * {
   *  "userId": "",
   *  "rank": 1
   * }
   */
  this.getClassStudentRanking = function(classId, userId, callback) {
    var rawQuery = "select userId, rank from (SELECT userId, @curRank := @curRank + 1 AS rank FROM student_class s, (SELECT @curRank := 0) r where classId = '"+classId+"' ORDER BY  activity desc) t where userId = '"+userId+"';";
    db.sequelize.query(rawQuery).then(function(result) {
      callback(null, result[0][0])
    }).catch(function(err) {callback(err)})
  }

  /**
   *
   * @param userId
   * @param callback
   *
   * [
   *  {
   *    "classId": "",
   *    "className": "",
   *    "submitted": 5,
   *    "total": 7,
   *  },
   *  {
   *    ...
   *  }
   * ]
   */
  this.getStudentClassesAssignments = function(userId, callback) {
    var rawQuery = " select t1.classId, course.courseName className, t1.submitCount submitted, t2.count total from " +
      "(select count(t.classId) submitCount, t.classId from " +
      "(select student_assignment.userId, assignment.classId, student_assignment.assignmentId from student_assignment left outer join assignment on student_assignment.assignmentId = assignment.assignmentId " +
      "where student_assignment.userId = '" + userId + "' ) t group by t.classId) t1 " +
      "left outer join (select count(classId) count, classId from assignment group by classId) t2 on t1.classId = t2.classId " +
      "left outer join class on t1.classId = class.classId left outer join course on class.courseId = course.courseId;";
    db.sequelize.query(rawQuery).then(function(result) {
      callback(null, result[0])
    }).catch(function(err) {callback(err)})

  }

  /**
   *
   * @param callback
   *
   * [
   *  {
   *    "userId": "",
   *    "userName": ""
   *  },
   *  {
   *    "userId": "",
   *    "userName": ""
   *  }
   * ]
   */
  this.getStudents = function(callback) {
    db.User.findAll({
      attributes: ['userId', 'userName'],
      where: {
        isTeacher: 0
      }
    }).then(function(result) {
      callback(null, JSON.parse(JSON.stringify(result)))
    }).catch(function(err) {callback(err)})
  }

  /**
   *
   * @param classId
   * @param callback
   *
   * [
   *  {
   *    "stage": "#1",
   *    "count": 1
   *  },
   *  ...
   * ]
   */
  this.getClassExpDistribution = function(classId, callback) {
    // var rawQuery = "select t.stage, t.count from "+
    // "(select elt(interval(activity, 0, 100, 200, 300, 400, 500, 60, 700, 800, 900, 1000), '#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8', '#9', '#10') as stage, count(userId) count " +
    // "from student_class where classId = '"+ classId + "' group by stage) t where t.stage in ('#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8', '#9', '#10');";
    // db.sequelize.query(rawQuery).then(function(result) {
    //   var data = result[0];
    //   var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    //   for(var i in arr) {
    //     if(!data[i] || data[i].stage != '#'+arr[i]) {
    //         data.splice(i, 0, {stage: '#'+arr[i], count: 0});
    //     }
    //   }
    //   callback(null, result[0])
    // }).catch(function(err) {callback(err)})
    var stages = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    var data = [];
    async.eachSeries(stages, function(stage, done) {
      var sql = "select count(*) as count from student_class where  activity > " + stage+"  and activity < " + (Number(stage) + 100) +" and classId = '" + classId + "' and userId in (select userId from user);"
      console.log(sql);
      db.sequelize.query(sql).then(function(result) {
        console.log(JSON.stringify(result[0][0].count))
        data.push({
          stage: '#'+stage,
          count: result[0][0].count
        })
        done()
      }).catch(function(err) {done(err)})
    }, function done() {
      callback(null, data);
    })


  }

  /**
   *
   * @param enrollYear
   * @param callback
   *
   * [
   *  {
   *    "userId": "",
   *    "userName": "",
   *    "activityLevel": ""
   *  },
   *  {
   *    "userId": "",
   *    "userName": "",
   *    "activityLevel": ""
   *  }
   * ]
   */
  this.getInactiveUsers = function(enrollYear, callback) {
    var userIdLike = '10' +enrollYear.toString().substring(2, 4) + '%'

    // var rawQuery = "select t.userId, user.userName, t.count from (SELECT COUNT('userId') AS `count`, `userId` FROM `action` AS `Action` WHERE `Action`.`actionCode` IN ('201', '202', '203', '301') AND `Action`.`userId` LIKE '" + userIdLike + "' GROUP BY userId ORDER BY count asc LIMIT 5) t left outer join user on t.userId = user.userId;";
    var rawQuery = "select student_class.userId, user.userName, round(sum(activityExp)/count(activityExp)) activityLevel from student_class left outer join user on student_class.userId = user.userId where student_class.userId like '" + userIdLike + "' group by student_class.userId order by activityLevel asc;"
    db.sequelize.query(rawQuery).then(function(result) {
      callback(null, result[0])
    }).catch(function(err) {callback(err)})

  }

  this.getAllClassStudents = function(callback) {
    db.StudentClass.findAll({}).then(function(result) {
      callback(null, result)
    }).catch(function(err) {callback(err)})
  }

  /**
   *
   * @param classId
   * @param actionCode {Array}
   * @param callback
   *
   * [
   *  {"time": unix_timestamp},
   *  {"time": unix_timestamp},
   *  ...
   * ]
   */
  this.getClassActionTimeDistribution = function(classId, actionCode, callback) {
    db.Action.findAll({
      attributes: [[db.sequelize.literal('unix_timestamp(time)'), 'time']],
      where: {classId: classId, actionCode: {$in: actionCode}}
    }).then(function(result) {callback(null, result)}).catch(function(err) {callback(err)})
  }

  /**
   *
   * @param classId
   * @param userId
   * @param actionCode {Array}
   * @param callback
   */
  this.getClassStudentActionTimeDistribution = function(classId, userId, actionCode, callback) {
    db.Action.findAll({
      attributes: [[db.sequelize.literal('unix_timestamp(time)'), 'time']],
      where: {classId: classId, userId: userId, actionCode: {$in: actionCode}}
    }).then(function(result) {callback(null, result)}).catch(function(err) {
      console.log('error')
      console.log(err)
      callback(err)
    })
  }

  /**
   *
   * @param classId
   * @param callback
   *
   * [
   *  {
   *    "userId": "",
   *    "userName": "",
   *    "activity": ""
   *  },
   *  {
   *    "userId": "",
   *    "userName": "",
   *    "activity": ""
   *  }
   * ]
   */
  this.getClassStudentsExp = function(classId, callback) {
    db.StudentClass.findAll({
      attributes: ['userId', 'activity', [db.sequelize.literal('User.userName'), 'userName'], 'classId'],
      where: {classId: classId},
      include: [{model: db.User, attributes: ['userName']}],
      order: 'activity desc'
    }).then(function(result) {
      callback(null, result)
    }).catch(function(err) {callback(err)})
  }

  this.getClassStudentsNoPPTExp = function(classId, callback) {
    var rawQuery = "select student_class.userId, user.userName, activity from student_class " +
      "left outer join (select count(actionCode) as count, userId, userName from action where actionCode = '301' group by userId) t on student_class.userId = t.userId " +
      "left outer join user on student_class.userId = user.userId " +
      "where classId = " + db.sequelize.escape(classId) + " and student_class.userId in (select userId from user) and ifnull(t.count, 0) = 0 order by activity desc;"

    db.sequelize.query(rawQuery).then(function(result) {
      callback(null, JSON.parse(JSON.stringify(result[0])))
    }).catch(function(err) {callback(err)}
    )
  }

  this.getStudentsExp = function(callback) {
    var sql = "select student_class.userId, round(sum( (courseCredit + courseWeekTime) * student_class.activity)/sum(courseCredit + courseWeekTime)) as activity from student_class " +
      "left outer join class on student_class.classId = class.classId " +
      "left outer join course on class.courseId = course.courseId group by userId;"
    db.sequelize.query(sql).then(function(result) {
      var data = JSON.parse(JSON.stringify(result[0]));
      callback(null, data)
    }).catch(function(err) {
      callback(err)
    })
  }
  this.createDormRow = function(data, callback) {
    db.Dorm.create(data).then(function(result) {
      callback(null, result.id)
    }).catch(function(err) {
      callback(err)
    })
  }

  this.getClassStudentsActionCountGroup = function(classId, actionCode, callback) {
    var action = '';
    if (typeof actionCode == 'string') {
      action = '(' + actionCode + ')';
    } else {
      action = '(';
      for(var i in actionCode) {
        action+=actionCode+','
      }
      action = action.substring(0, action.length - 1);
      action += ')'
    }
    // var sql = "select userId, count(*) as count from action where actionCode in " + action + " and classId = 'C180027161703' and userId in (select userId from user) group by userId;"
    var sql = "select action.userId, userName , student_class.activity, count(*) as count from action left outer join student_class on action.userId = student_class.userId and action.classId = action.classId where actionCode in "+ action +" and action.classId = '" + classId + "' and action.userId in (select userId from user) group by userId;"
    db.sequelize.query(sql).then(function(result) {
      var data = JSON.parse(JSON.stringify(result[0]));
      callback(null, data)
    }).catch(function(err) {
      callback(err)
    })
  }

  this.getClassStudentsHomeworkAndPPTGroup = function(classId, callback) {
    var sql = "select t1.userId, t1.userName, t1.classId, t1.activity, ifnull(t2.actionCount, 0) as homeworkCount, ifnull(t3.actionCount, 0) as pptCount from ( " +
      "select student_class.userId, user.userName, student_class.activity, student_class.classId from student_class " +
      "left outer join user on student_class.userId = user.userId where classId = '" + classId + "' and student_class.userId in (select userId from user) " +
      ") t1 " +
      "left outer join (select userId, sum(actionCount) as actionCount from ( " +
      "select student_class.userId, student_class.activity, actionCode, count(actionCode) as actionCount from student_class " +
      "left join action on student_class.userId = action.userId and student_class.classId = action.classId " +
      "where student_class.classId = '" + classId + "' and student_class.userId in (select userId from user) " +
      "group by userId, actionCode) t where actionCode in (201, 202, 203) group by userId) t2 on t1.userId = t2.userId " +
      "left outer join ( " +
      "select userId, sum(actionCount) as actionCount from ( select student_class.userId, student_class.activity, actionCode, count(actionCode) as actionCount from student_class " +
      "left join action on student_class.userId = action.userId and student_class.classId = action.classId " +
      "where student_class.classId = '" + classId + "' and student_class.userId in (select userId from user) " +
      "group by userId, actionCode) t where actionCode in (301) group by userId) t3 on t1.userId = t3.userId";
    db.sequelize.query(sql).then(function(result) {
      var data = JSON.parse(JSON.stringify(result[0]));
      callback(null, data)
    }).catch(function(err) {
      callback(err)
    })
  }

  this.getOverallStudentRank = function(limit, callback) {
    db.User.findAll({
      attributes: ['userId', 'nickName', 'experience'],
      order: 'experience desc',
      limit: limit,
      raw: true
    }).then(function(result) {
      callback(null, result);
    }).catch(function(err) {
      callback(err)
    })
  }
  this.getSingleStudentsRank = function(limit, callback) {
    db.StudentClass.findAll({
      attributes: [
        'userId',
        [db.sequelize.literal('User.nickName'), 'nickName'],
        [db.sequelize.literal('`Class.Course`.courseName'), 'courseName'],
        'activity'
      ],
      order: 'activity desc',
      limit: limit,
      include: [{
        model: db.Class,
        attributes: [],
        include: {
          model: db.Course,
          attributes: []
        }
      }, {
        model: db.User,
        attributes: []
      }],
      raw: true
    }).then(function(result) {
      callback(null, result)
    }).catch(function(err) {
      callback(err)
    })
  }
  this.getUserCount = function(callback) {
    db.User.count({}).then(function(count) {
      callback(null, count)
    }).catch(function(err) {
      callback(err)
    })
  }
  this.getCourseCount = function(callback) {
    db.Course.count({}).then(function(count) {
      callback(null, count)
    }).catch(function(err) {
      callback(err)
    })
  }
  this.getSourceCount = function(callback) {
    db.Source.count({}).then(function(count) {
      callback(null, count)
    }).catch(function(err) {
      callback(err)
    })
  }
  this.getAssignmentCount = function(callback) {
    db.Assignment.count({}).then(function(count) {
      callback(null, count)
    }).catch(function(err) {
      callback(err)
    })
  }
  this.getTopicCount = function(callback) {
    db.Topic.count({}).then(function(count) {
      callback(null, count)
    }).catch(function(err) {
      callback(err)
    })
  }

}

module.exports = new Query();
