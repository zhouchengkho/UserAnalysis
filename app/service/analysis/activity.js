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





}


module.exports = new Activity();
