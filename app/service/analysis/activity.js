var db = require('../../models/index');
var moment  = require('moment');
var reference = require('./../reference');
var Promise = require('bluebird');
var async = require('async');
var query = Promise.promisifyAll(require('../query'));
var score = require('./score');
var helper = require('../helper');
function Activity() {



  /**
   * class student exp
   * initiate discussion - code: 401
   * checkout discussion - code: 402
   * resource (check out / edit / download / rate) - (502  / 503 / 505 / 507)
   * ppt download  - code: 301
   * assignment (submit / resubmit / download) -  (201 / 202 / 203)
   *
   *
   * @param classId {string}
   * @param userId {string}
   * @param callback {function} (err, exp)
   *
   *
   * 5.21  {Number} 0-10
   */
  this.getClassStudentExp = function(classId, userId, callback) {

    Promise.all([
      query.getClassActionCountGroupAsync(classId, ['201', '202', '203']),
      query.getClassActionCountGroupAsync(classId, ['301']),
      query.getClassActionCountGroupAsync(classId, ['401', '402', '403', '404', '405']),
      query.getClassActionCountGroupAsync(classId, ['501', '502', '503', '504', '505', '506', '507']),
      query.getClassActionCountGroupAsync(classId, ['201', '202', '203'])
    ]).spread(function(homeworkGroup, pptGroup, discussionGroup, sourceGroup) {
      var statistic = helper.organizeData([homeworkGroup, pptGroup, discussionGroup, sourceGroup]);
      var exp = score.entropy.getScoreOf(statistic, userId);
      callback(null, exp)
    })
  }


  this.test = function(classId, userId, callback) {
    Promise.all([
      query.getClassActionCountGroupAsync(classId, ['201', '202', '203']),
      query.getClassActionCountGroupAsync(classId, ['301']),
      query.getClassActionCountGroupAsync(classId, ['401', '402', '403', '404', '405']),
      query.getClassActionCountGroupAsync(classId, ['501', '502', '503', '504', '505', '506', '507']),
      query.getClassActionCountGroupAsync(classId, ['201', '202', '203'])
    ]).spread(function(homeworkGroup, pptGroup, discussionGroup, sourceGroup) {
      // var statistic = helper.organizeData([homeworkGroup, pptGroup, discussionGroup, sourceGroup]);
      // callback(null, statistic)

      var statistic = helper.organizeData([homeworkGroup, pptGroup, discussionGroup, sourceGroup]);
      console.log(statistic)
      var exp = score.entropy.getScoreOf(statistic, userId);
      callback(null, exp)
    })
  }

  /**
   *
   * @param userId
   * @param timePeriod
   * @param callback
   */
  this.getHtmlData = function(userId, timePeriod, callback) {
    if((typeof timePeriod) == 'function') {
      callback = timePeriod;
      timePeriod = 'academic-year'
    }
    Promise.all([
      db.User.count({}),
      db.Action.count({where: {userId: userId, time: reference.getTimePeriod(timePeriod, userId), actionName: '下载课件'}}),
      db.Action.count({where: {userId: userId, time: reference.getTimePeriod(timePeriod, userId), actionName: '发起讨论'}}),
      db.Action.count({where: {userId: userId, time: reference.getTimePeriod(timePeriod, userId), actionName: '提交作业'}}),
      db.Action.count({where: {userId: userId, time: reference.getTimePeriod(timePeriod, userId), actionName: '下载资源'}}),
      db.Action.count({where: {time: reference.getTimePeriod(timePeriod, userId), actionName: '下载课件'}}),
      db.Action.count({where: {time: reference.getTimePeriod(timePeriod, userId), actionName: '发起讨论'}}),
      db.Action.count({where: {time: reference.getTimePeriod(timePeriod, userId), actionName: '提交作业'}}),
      db.Action.count({where: {time: reference.getTimePeriod(timePeriod, userId), actionName: '下载资源'}})

    ]).spread(function(userCount, downloadPPTCount, discussCount, submitHomeworkCount, downloadResourceCount, downloadPPTSum, discussSum, submitHomeworkSum, downloadResourceSum) {
      var html = '<div style="float: left">' +
        '<p>Downloaded ' + downloadPPTCount + ' PPT(s)</p>' +
        '<p>Initiated ' + discussCount + ' Discussion(s)</p>' +
        '<p>Submitted ' + submitHomeworkCount + ' Homework(s)</p>' +
        '<p>Downloaded ' + downloadResourceCount + ' Resource(s)</p>' +
        '</div>' +
        '<div style="float: right">' +
        '<p>Avg Downloaded ' + downloadPPTSum / userCount + ' PPT(s)</p>' +
        '<p>Avg Initiated ' + discussSum / userCount + ' Discussion(s)</p>' +
        '<p>Avg Submitted ' + submitHomeworkSum / userCount + ' Homework(s)</p>' +
        '<p>Avg Downloaded ' + downloadResourceSum / userCount + ' Resource(s)</p>' +
        '</div>';
      callback(null, {html: html})
    }).catch(function(err) {
      callback(err)
    })

  }

}


module.exports = new Activity();
