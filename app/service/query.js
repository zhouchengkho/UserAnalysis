/**
 * Created by zhoucheng on 2/4/17.
 */

var db = require('../models/index')
var Promise = require('bluebird')
var helper = require('./helper');
var prefix = require('../../config/config').prefix;
var async = require('async');
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
      for(var index in result) {
        data.push(result[index].classId)
      }
      callback(null, data)
    }).catch(function(err) {callback(err)})
  }


  this.getUserInfo = function(userId, callback) {
    db.User.findAll(
      {
        attributes: ['userId', 'userName', 'nickName', 'isTeacher', 'gender', 'departId', [db.sequelize.literal("CONCAT('" + prefix + "', faceIcon)"), 'faceIcon']],
        where: {userId: userId}}).then(function(result) {
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

  /**
   *
   * @param classId
   * @param callback
   *
   * {
   *  "userId": "",
   *  "classId": "",
   *  "exp": 0,
   *  "User": {
   *    "userName": ""
   *  }
   * }
   */
  this.getClassBadExpers = function(classId, callback) {
    db.StudentClass.findAll({where: {classId: classId}, limit: 3, include: [db.User], order: 'exp asc'}).then(function(result) {
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
   *  "exp": 0,
   *  "User": {
   *    "userName": ""
   *  }
   * }
   */
  this.getClassGoodExpers = function(classId, callback) {
    db.StudentClass.findAll({where: {classId: classId}, limit: 3, include: [db.User], order: 'exp desc'}).then(function(result) {
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
    var rawQuery = "select userId, rank from (SELECT userId, @curRank := @curRank + 1 AS rank FROM student_class s, (SELECT @curRank := 0) r where classId = '"+classId+"' ORDER BY  exp desc) t where userId = '"+userId+"';";
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
    var rawQuery = "select t.stage, t.count from "+
    "(select elt(interval(exp, 0, 100, 200, 300, 400, 500, 60, 700, 800, 900, 1000), '#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8', '#9', '#10') as stage, count(userId) count " +
    "from student_class where classId = '"+ classId + "' group by stage) t where t.stage in ('#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8', '#9', '#10');";

    db.sequelize.query(rawQuery).then(function(result) {
      var data = result[0];
      var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      for(var i in arr) {
        if(!data[i] || data[i].stage != '#'+arr[i]) {
            data.splice(i, 0, {stage: '#'+arr[i], count: 0});
        }
      }
      callback(null, result[0])
    }).catch(function(err) {callback(err)})

  }

  this.getInactiveUsers = function(enrollYear, callback) {
    var userIdLike = '10' +enrollYear.toString().substring(2, 4) + '%'

    var rawQuery = "select t.userId, user.userName, t.count from (SELECT COUNT('userId') AS `count`, `userId` FROM `action` AS `Action` WHERE `Action`.`actionCode` IN ('201', '202', '203', '301') AND `Action`.`userId` LIKE '" + userIdLike + "' GROUP BY userId ORDER BY count asc LIMIT 5) t left outer join user on t.userId = user.userId;";
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
   *    "exp": ""
   *  },
   *  {
   *    "userId": "",
   *    "userName": "",
   *    "exp": ""
   *  }
   * ]
   */
  this.getClassStudentsExp = function(classId, callback) {
    db.StudentClass.findAll({
      attributes: ['userId', 'exp', [db.sequelize.literal('User.userName'), 'userName'], 'classId'],
      where: {classId: classId},
      include: [{model: db.User, attributes: ['userName']}]
    }).then(function(result) {
      callback(null, result)
    }).catch(function(err) {callback(err)})
  }
}

module.exports = new Query();
