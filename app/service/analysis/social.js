var db = require('../../models/index');
var reference = require('./../reference');
var Promise = require('bluebird');
var query = Promise.promisifyAll(require('../query'));
var score = require('./score');
var helper = require('../helper');
function Social() {

  /**
   * getOverallScore
   * @param userId
   * @param callback
   * @returns {JSON}
   * {
   *  "overallScore": 8.33
   *  "classScores":
   *    [
   *      {
   *        "classId": "C12312312",
   *        "score": 7.33
   *      },
   *      {
   *      "classId": "C12312312",
   *        "score": "9.33"
   *      }
   *    ]
   * }
   */
  this.getStudentScore = function(userId, callback) {
    var self = this;
    var data = {};
    data.classScores = [];
    query.getStudentClasses(userId).then(function(data) {
      var classId = data[index];
      async.eachSeries(data, function(classId, done) {
        self.getClassStudentScore(classId, userId, function(err, score) {
          if(err)
            throw new Error(err)
          classScores.push({classId: classId, score: score})
          done()
        })
      }, function done() {
        // compute avg
        var sum = 0;
        for(var index in classScores)
          sum += classScores[index].score
        data.overallScore = sum / classScores.length
        callback(null, data);
      })
    }).catch(function(err) {callback(err)})
  }

  this.getClassScore = function(userId, classId, callback) {
    callback(null, Math.random() * 10);
  }

  this.getClassStudentScore = function(classId, userId, callback) {
    callback(null, Math.random() * 10);
  }

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
        callback(null, score.entropy.getScoreOf(statistic, userId))
      })
    });

  }
}




module.exports = new Social();



