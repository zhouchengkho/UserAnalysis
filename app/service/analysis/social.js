var db = require('../../models/index');
var reference = require('./../reference');
var query = require('./../query');
var Promise = require('bluebird');
var score = require('./score');
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
   * @param classId
   * @param userId
   * @param callback
   */
  this.getClassStudentExp = function(classId, userId, callback) {
    callback(null, Math.random() * 10);
  }

  /**
   *
   * Friends, Status, Status Reply, Topic Reply, Source Reply
   * @param timePeriod
   * @param callback
   */
  this.getClassStudentExpTest = function(classId, userId, timePeriod, callback) {
    var time = reference.getTimePeriod(timePeriod, userId);
    var gte = time.gte;
    var lte = time.lte;
    Promise.all([
      query.getStudentFriendsCountAsync(userId),
      query.getStudentStatusReplyCountInTimeAsync(userId, gte, lte),
      query.getStudentStatusCountInTimeAsync(userId, gte, lte),
      query.getStudentTopicReplyCountInTimeAsync(userId, gte, lte),
      query.getStudentSourceReplyCountInTimeAsync(userId, gte, lte)

    ]).spread(function() {

    })
  }
}




module.exports = new Social();



