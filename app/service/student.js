/**
 * Created by zhoucheng on 3/4/17.
 */

  var activity = require('./analysis/activity'),
  social = require('./analysis/social'),
  summary = require('./summary'),
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
   *      "userId": "10132510237",
   *      "userName": "",
   *      "faceIcon": "",
   *      "activity": 3,
   *      "summary": [
   *        {
   *          "className": "",
   *          "activity": 2
   *        },
   *        {
   *          "className": "",
   *          "activity": 4
   *        }
   *      ]
   *    }
   * }
   */
  this.getData = function(userId, callback) {
    var data = {};
    query.getUserInfo(userId, function(err, result) {
      data.user = result;
      // data.user.faceIcon = prefix + data.user.faceIcon;
      exp.getDetailedStudentClassesExp(userId, function(err, result) {
        data.user.summary = result.classes;
        data.user.activity = result.activity;
        callback(null, data)
      })

    })

  }


  /**
   *
   * @param classId
   * @param userId
   * @param callback
   *   {
   *    "userId": "10132510237",
   *    "userName": "",
   *    "className": "",
   *    "faceIcon": "",
   *    "activity": "",
   *    "summary": ""
   *   }
   */
  this.getClassData = function(classId, userId, callback) {
    var data = {};
    query.getClassDetail(classId, function(err, result) {
      data.className = result.className;
      query.getUserInfo(userId, function(err, result) {
        // data.faceIcon = prefix + result.faceIcon;
        data.userName = result.userName;
        data.faceIcon = result.faceIcon;
        summary.getClassStudentSummary(classId, userId, function(err, result) {
          data.summary = result;
          exp.getClassStudentExp(classId, userId, function(err, result) {
            data.activity = result.activity;
            callback(err, data)
          })
        })

      })

    })
  }
}


module.exports = new Student();
