var db = require('../models')

function Summary() {

  /**
   * getSummary
   * replace certain words & generate a summary
   * @param userId
   * @param callback
   */
  this.getSummary = function(userId, callback) {
    callback('You are doing great');
  }
}

module.exports = new Summary();


