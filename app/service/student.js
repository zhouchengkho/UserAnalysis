/**
 * Created by zhoucheng on 3/4/17.
 */

var dorm = require('./analysis/dorm'),
  activity = require('./analysis/activity'),
  social = require('./analysis/social'),
  summary = require('./analysis/summary'),
  homework = require('./analysis/homework'),
  EventProxy = require('eventproxy'),
  db = require('../models/index'),
  async = require('async'),
  Promise = require('bluebird'),
  query = require('./query'),
  exp = require('./exp'),
  prefix = require('../../config/config').prefix;
function Student() {

  /**
   *
   * @param userId
   * @param callback
   * {
   *  "user":
   *    {
   *    "userId": "10132510237",
   *    "userName": "",
   *    "faceIcon": "",
   *    "exp": "",
   *    "summary": ""
   *    },
   *    "dorm":
   *    [
   *      {
   *        "exp": 4.56
   *      },
   *      {
   *        "exp": 6.36
   *      }
   *    ]
   * }
   */
  this.getData = function(userId, callback) {
    var data = {};
    query.getUserInfo(userId, function(err, result) {
      data.user = result;
      data.user.faceIcon = prefix + data.user.faceIcon;
      summary.getStudentSummary(userId, function(err, result) {
        data.user.summary = result;
        exp.getStudentExp(userId, function(err, result) {
          data.user.exp = result;
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
   *  "user":
   *    {
   *    "userId": "10132510237",
   *    "userName": "",
   *    "courseName": "",
   *    "faceIcon": "",
   *    "exp": "",
   *    "summary": ""
   *    }
   * }
   */
  this.getClassData = function(classId, userId, callback) {
    var data = {};
    query.getClassDetail(classId, function(err, result) {
      data.courseName = result.courseName;
      query.getUserInfo(userId, function(err, result) {
        data.user = result;
        data.user.faceIcon = prefix + data.user.faceIcon;
        summary.getStudentSummary(userId, function(err, result) {
          data.user.summary = result;
          exp.getClassStudentExp(classId, userId, function(err, result) {
            data.user.exp = result;
            callback(null, data)
          })

        })

      })

    })
  }
}


module.exports = new Student();
