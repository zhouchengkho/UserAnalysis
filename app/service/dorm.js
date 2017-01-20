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
  this.getScore = function(userId, callback) {
    callback(5);
  }
}

module.exports = new Dorm();
