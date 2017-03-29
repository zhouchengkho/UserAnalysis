var db = require('../../models/index');
var query = require('./../query');
var reference = require('./../reference');
var helper = require('../helper');
var async = require('async');
/**
 * 1. Finished Assignment
 * @constructor
 */
function HomeWork() {

  /**
   * on a scale from 0-10, based on submitted time
   * y = 10 * e^ ((1/totalInterval) * In(4/5) * interval) this is for regular submission
   * y = 10 * e^ ((1/totalInterval) * In(4/5) * interval) * 0.5 this is for deadline submission
   *
   * @param startTime
   * @param endTime
   * @param submitTime
   */
  function getNewtonCoolingScore(startTime, endTime, submitTime) {
    var totalInterval = reference.getTimeInterval(startTime, endTime);
    var interval = reference.getTimeInterval(startTime, submitTime);
    if(interval / totalInterval < 9/10)
      return 1000 * Math.pow(Math.E, ( (1/totalInterval) * Math.log(4/5) * interval))
    else
      return 1000 * Math.pow(Math.E, ( (1/totalInterval) * Math.log(4/5) * interval)) * 0.5
  }

  /**
   *
   * @param str
   * @returns {boolean}
   */
  function containsKeyword(str) {
    var keywords = ['加分题', '参考答案', '作业本', '汇总', '完成课本'];
    for(var i in keywords) {
      if(str.indexOf(keywords[i]) >= 0)
        return true;
    }
    return false;
  }

  /**
   *
   */
  function needSubmitting(title) {
    return !containsKeyword(title)
  }

  /**
   * get all assignments of this class, estimate score of 0-10 according to hand in time
   * @param classId
   * @param userId
   * @param callback {function} (err, exp)
   */
  this.getClassStudentExp = function(classId, userId, callback) {
    query.getClassStudentAssignmentDetails(classId, userId, function(err, result) {
      if(err)
        return callback(err)
      else {

        var scores = [];
        for(var i in result) {
          if(!result[i].submitted) {
            if(needSubmitting(result[i].title))
              scores.push(0)
          }
          else {
            var adjust = Math.log10(result[i].submitCount)
            scores.push(adjust * getNewtonCoolingScore(result[i].startTime, result[i].endTime, result[i].submitTime))
          }
        }
        if(scores.length === 0)
          callback(null, 0)
        else
          callback(null, helper.avg(scores))
      }
    })
  }

  /**
   *
   * @param classId
   * @param callback
   */
  this.getClassExps = function(classId, callback) {
    var self = this;
    var result = [];
    query.getClassStudentIdsDesc(classId, function(err, studentIds) {
      async.eachSeries(studentIds, function(studentId, done) {
        self.getClassStudentExp(classId, studentId, function(err, score) {
          result.push({
            userId: studentId,
            score: score
          })
          done();
        })
      }, function done() {
        callback(null, result)
      })
    })
  }
  /**
   *
   * @param userId
   * @param timePeriod [optional], set as this semester if not provided
   * @param callback
   */
  this.getHomeWorkData = function(userId, timePeriod, callback) {
    if((typeof timePeriod) == 'function') {
      callback = timePeriod;
      timePeriod = reference.getTimePeriod('academic-year')
    }

    var result = {};
    var userCount = 0;

    db.sequelize.transaction(function(t) {
      return db.User.count({})
    }).then(function(count) {
      userCount = count;
      return db.StudentAssignment.findAll({where: {userId: userId, time: reference.getTimePeriod(timePeriod, userId)}, include: [db.Assignment]})
    }).then(function(assignment) {
      result.assignmentInfo = assignment;
      result.assignmentCount = assignment.length;
      return db.StudentClass.findAll({where: {userId: userId}, include: [{model: db.Class, include: [
        {model: db.Term, where: {termName: {$in: reference.getTermStrs(timePeriod, userId)}}}, {model: db.Course}
        ]}]})
    }).then(function(classInfo) {
      result.classInfo = classInfo;
      result.classCount = classInfo.length;
      return db.SourceScore.findAll({where: {userId: userId}})
    }).then(function(source) {
      result.sourceInfo = source;
      result.sourceCount = source.length;
      var sum = 0;
      for(var i = 0; i < source.length; i++) {
        sum+=source[i].score
      }

      result.sourceScoreAvg = sum / source.length;
      return db.StudentAssignment.count({where: {time: reference.getTimePeriod(timePeriod, userId)}, include: [db.Assignment]})
    }).then(function(assignmentCount) {
      result.assignmentAverage = assignmentCount / userCount;
      return db.StudentClass.count({where: {userId: userId}, include: [{model: db.Class, include: [
        {model: db.Term, where: {termName: {$or: reference.getTermStrs(timePeriod, userId)}}}
      ]}]})
    }).then(function(classAverage) {
      result.classAverage = classAverage / userCount;
      callback(null, result)
    }).catch(function(err) {
      callback(err)
    })
  }

  /**
   *
   * @param userId
   * @param callback
   *
   */
  this.getHtmlData = function(userId, callback) {
    query.getStudentClassesAssignments(userId, function(err, result) {
      callback(err, result)
    })

  }

  /**
   *
   * @param classId
   * @param userId
   * @param callback
   */
  this.getClassStudentHomeworkData = function(classId, userId, callback) {
    query.getDetailedClassStudentAssignments(classId, userId, function(err, result) {
      callback(err, result)
    })
  }


}



module.exports = new HomeWork();
