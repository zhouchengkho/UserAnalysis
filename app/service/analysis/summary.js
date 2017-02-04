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
}

module.exports = new Summary();


