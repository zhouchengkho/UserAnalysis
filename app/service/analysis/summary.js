var db = require('../../models/index')

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
    callback(null, Math.random() * 10);
  }

  this.getStudentSummary = function(userId, callback) {
    callback(null, 'This is student overall summary');
  }
}

module.exports = new Summary();


