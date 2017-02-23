/**
 * Created by zhoucheng on 1/20/17.
 */
function Dorm() {
  /**
   * getOverallScore
   * @param userId
   * @param callback
   * @returns {number} score number
   */
  this.getOverallScore = function(userId, callback) {
    callback(null, Math.random() * 10);
  }

  this.getClassScore = function(userId, classId, callback) {
    callback(null, Math.random() * 10);
  }
  this.getClassStudentScore = function(classId, userId, callback) {
    callback(null, Math.random() * 10);
  }
}

module.exports = new Dorm();
