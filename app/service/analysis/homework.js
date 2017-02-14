var db = require('../../models/index');
var query = require('./../query');
var reference = require('./../reference');
/**
 * 1. Attended Class
 * 2. Finished Assignment
 * 3. Source Score
 * @constructor
 */
function HomeWork() {
  /**
   * getOverallScore
   * @param userId
   * @param callback
   * @returns {number} score number
   */
  this.getScore = function(userId, callback) {
    callback(null, 4);
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
      return db.StudentAssignment.findAll({where: {userId: userId, time: reference.getTimePeriod(timePeriod)}, include: [db.Assignment]})
    }).then(function(assignment) {
      result.assignmentInfo = assignment;
      result.assignmentCount = assignment.length;
      return db.StudentClass.findAll({where: {userId: userId}, include: [{model: db.Class, include: [
        {model: db.Term, where: {termName: {$or: reference.getTermStrs(timePeriod, userId)}}}, {model: db.Course}
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
      return db.StudentAssignment.count({where: {time: reference.getTimePeriod(timePeriod)}, include: [db.Assignment]})
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
      var html = '<div style="float: left">' +
        '<p>Finished ' + homeworkData.assignmentCount + ' Assignment(s)</p>' +
        '<p>Took ' + homeworkData.classCount + ' Course(s)</p>' +
        '<p>Finished ' + homeworkData.sourceCount + ' Source, Averaging Score ' + homeworkData.sourceScoreAvg + '</p>' +
        '</div>' +
        '<div style="float: right">' +
        '<p>Average ' + homeworkData.assignmentAverage + ' Assignment(s)</p>' +
        '<p>Average ' + homeworkData.classAverage + ' Course(s)</p>' +
        '</div>';

      callback(null, {html: html})
    })
  }
}



module.exports = new HomeWork();
