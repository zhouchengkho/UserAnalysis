var db = require('../models');

function Social() {

  /**
   * getFriends
   * get a certain user's friends according his user id
   * @param userId
   * @param callback
   */
  this.getFriends = function(userId, callback) {
    db.Friend.findAll({where: {userId: userId}, include: [db.User]}).then(function (friends) {
      callback(friends);
    });
  }
  /**
   *
   * @param userId
   * @param callback
   */
  this.getScore = function(userId, callback) {
    callback(6);
  }
}


module.exports = new Social();



