var db = require('../../models/index');
var reference = require('./../reference');
var Promise = require('bluebird');
var query = Promise.promisifyAll(require('../query'));
var score = require('./score');
var helper = require('../helper');
function Social() {


  const presetWeights = [0.15, 0.15, 0.15, 0.30, 0.25];
  /**
   *
   * Friends, Status, Status Reply, Topic Reply, Source Reply
   * @param classId
   * @param userId
   * @param callback {Function} 3.56
   */
  this.getClassStudentExp = function(classId, userId, callback) {
    reference.getTimeForClass(classId, function(err, time) {
      var gte = time.gte;
      var lte = time.lte;

      Promise.all([
        query.getClassFriendsCountGroupAsync(classId),
        query.getClassStatusCountGroupInTimeAsync(classId, gte, lte),
        query.getClassStatusReplyCountGroupInTimeAsync(classId, gte, lte),
        query.getClassTopicReplyCountGroupInTimeAsync(classId, gte, lte),
        query.getClassSourceReplyCountGroupInTimeAsync(classId, gte, lte)
      ]).spread(function(friendsCount, statusCount, statusReplyCount, TopicReplyCount, SourceReplyCount) {

        var statistic = helper.organizeData([friendsCount, statusCount, statusReplyCount, TopicReplyCount, SourceReplyCount]);
        var exp = score.entropy.getScoreOf(statistic, userId, presetWeights)
        if (exp == Number.NaN)
          exp = 0;
        callback(null, exp)
      })
    });

  }

  /**
   *
   * @param classId
   * @param callback
   */
  this.getClassExps = function(classId, callback) {
    reference.getTimeForClass(classId, function(err, time) {
      var gte = time.gte;
      var lte = time.lte;

      Promise.all([
        query.getClassFriendsCountGroupAsync(classId),
        query.getClassStatusCountGroupInTimeAsync(classId, gte, lte),
        query.getClassStatusReplyCountGroupInTimeAsync(classId, gte, lte),
        query.getClassTopicReplyCountGroupInTimeAsync(classId, gte, lte),
        query.getClassSourceReplyCountGroupInTimeAsync(classId, gte, lte)
      ]).spread(function(friendsCount, statusCount, statusReplyCount, TopicReplyCount, SourceReplyCount) {
        var statistic = helper.organizeData([friendsCount, statusCount, statusReplyCount, TopicReplyCount, SourceReplyCount]);
        var result = score.entropy.getClassScores(statistic, presetWeights);
        for(var i in result) {
          if (result[i].score == Number.NaN)
            result[i].score = 0;
        }
        callback(null, result)
      })
    });
  }
}




module.exports = new Social();



