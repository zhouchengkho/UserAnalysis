var db = require('../../models/index')
var query = require('../query');
function Summary() {

  /**
   * getSummary
   * replace certain words & generate a summary
   * @param userId
   * @param callback
   */
  this.getSummary = function(userId, callback) {
    callback(null, 'You are doing great');
  }

  this.getClassStudentSummary = function(classId, userId, callback) {
    callback(null, 'this is class student summary');
  }

  /**
   *
   * @param userId
   * @param callback
   *
   * 你上了 {{total}} 门课\n
   * {{courseName}} 经验值 {{exp}}
   *
   */
  this.getStudentSummary = function(userId, callback) {
    query.getStudentClassesDetail(userId, function(err, result) {
    })
    callback(null, 'This is student overall summary');
  }
}

module.exports = new Summary();


