/**
 * Created by zhoucheng on 1/20/17.
 */

var dorm = require('./dorm'),
  activity = require('./activity'),
  social = require('./social'),
  summary = require('./summary'),
  homework = require('./homework'),
  EventProxy = require('eventproxy');

function Score() {
  /**
   * getOverallScore
   * use event proxy to synchronize & monitor each module (homework, dorm, social...)
   * @param userId
   * @param callback
   * @returns {number} score number
   */
  this.getOverallScore = function(userId, callback) {
    var epEmitter = {
      dorm: 'dorm',
      social: 'social',
      summary: 'summary',
      homework: 'homework',
      activity: 'activity'
    }
    var ep = new EventProxy();

    ep.all([epEmitter.activity, epEmitter.dorm, epEmitter.social, epEmitter.homework, epEmitter.summary],
      function(activityScore, dormScore, socialScore, homeworkScore, summary) {
      callback({
        overallScore: (activityScore + dormScore + socialScore + homeworkScore) / 4,
        dormScore: dormScore,
        socialScore: socialScore,
        homeworkScore: homeworkScore,
        activityScore: activityScore,
        summary: summary
      });
    })

    activity.getScore(userId, function(activityScore) {
      ep.emit(epEmitter.activity, activityScore);
    })
    dorm.getScore(userId, function(dormScore) {
      ep.emit(epEmitter.dorm, dormScore);
    })
    social.getScore(userId, function(socialScore) {
      ep.emit(epEmitter.social, socialScore)
    })
    homework.getScore(userId, function(homeworkScore) {
      ep.emit(epEmitter.homework, homeworkScore)
    })
    summary.getSummary(userId, function(summary) {
      ep.emit(epEmitter.summary, summary)
    })

  }
}

module.exports = new Score();
