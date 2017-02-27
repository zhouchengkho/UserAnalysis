/**
 * Created by zhoucheng on 2/4/17.
 */

var db = require('../models/index')
var Promise = require('bluebird')
function Query() {
  /**
   * Traverse val to fill where clause
   * main purpose is to remove null key
   * @param val JSON
   */
  this.genWhereQuery = function(val) {
    var result = {where: {}};
    for(var key in val) {
      if(val[key])
        result.where[key] = val[key]
    }
    return result;
  }

  /**
   *
   * @param userId
   * result format: Array
   * ['classId', 'classId' ...]
   */
  this.getStudentClasses = function(userId) {
    return new Promise(function(resolve, reject){
      db.StudentClass.findAll({where: {userId: userId}}).then(function(result) {
        var data = [];
        for(var index in result)
          data.push(result[index].classId)
        resolve(data)
      }).catch(function(err) {reject(err)})
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
   * @param callback
   */
  this.getClassDetail = function(classId, callback) {

  }
}

module.exports = new Query();
