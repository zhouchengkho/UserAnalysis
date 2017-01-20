function HomeWork() {
  /**
   * getOverallScore
   * @param userId
   * @param callback
   * @returns {number} score number
   */
  this.getScore = function(userId, callback) {
    callback(4);
  }
}

module.exports = new HomeWork();
