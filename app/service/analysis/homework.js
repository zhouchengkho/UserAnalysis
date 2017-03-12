var db = require('../../models/index');
var query = require('./../query');
var reference = require('./../reference');
var helper = require('../helper');
/**
 * 1. Finished Assignment
 * @constructor
 */
function HomeWork() {

  /**
   * on a scale from 0-10, based on submitted time
   * y = 10 * e^ ((1/totalInterval) * In(1/2) * interval)
   * meaning submit on startTime, score = 10
   *         submit on endTime, score = 5
   *         lower after
   *         not submitted score is 0
   *
   * @param startTime
   * @param endTime
   * @param submitTime
   */
  function getNewtonCoolingScore(startTime, endTime, submitTime) {
    var totalInterval = reference.getTimeInterval(startTime, endTime);
    var interval = reference.getTimeInterval(startTime, submitTime);
    console.log(totalInterval + ' '+interval);
    return 10 * Math.pow(Math.E, ( (1/totalInterval) * Math.log(1/2) * interval))
  }


  /**
   * get all assignments of this class, estimate score of 0-10 according to hand in time
   * @param classId
   * @param userId
   * @param callback {function} (err, exp)
   */
  this.getClassStudentExp = function(classId, userId, callback) {
    query.getClassAssignments(classId, function(err, assignmentIds) {
      if(err)
        return callback(err)
      else {
          query.getStudentAssignmentTimes(userId, assignmentIds, function(err, result) {
            if(err)
              return callback(err)
            else {
                var scores = [];
                for(var i in result) {
                  if(result[i].submitted === false)
                    scores.push(0)
                  else
                    scores.push(getNewtonCoolingScore(result[i].startTime, result[i].endTime, result[i].submitTime))
                }
                callback(null, helper.avg(scores))
            }
          })
      }
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
   * @param timePeriod [optional]
   * @param callback
   */
  this.getHtmlData = function(userId, timePeriod, callback) {
    if((typeof timePeriod) == 'function') {
      callback = timePeriod;
      timePeriod = reference.getTimePeriod('academic-year')
    }


    this.getHomeWorkData(userId, timePeriod, function(err, homeworkData) {
      if(err)
        callback(err)
      var html = '<div class="col-xs-6">' +
        '<p>Finished ' + homeworkData.assignmentCount + ' Assignment(s)</p>' +
        '<p>Took ' + homeworkData.classCount + ' Course(s)</p>' +
        '<p>Finished ' + homeworkData.sourceCount + ' Source, Averaging Score ' + homeworkData.sourceScoreAvg + '</p>' +
        '</div>' +
        '<div class="col-xs-6">' +
        '<p>Average ' + homeworkData.assignmentAverage + ' Assignment(s)</p>' +
        '<p>Average ' + homeworkData.classAverage + ' Course(s)</p>' +
        '</div>';

      callback(null, {html: html})
    })
  }
}



module.exports = new HomeWork();
