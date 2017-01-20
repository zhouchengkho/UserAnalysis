/**
 * Created by zhoucheng on 1/20/17.
 */

var dorm = require('./dorm'),
  homework = require('./homework'),
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
      homework: 'homework'
    }
    var ep = new EventProxy();

    ep.all([epEmitter.dorm, epEmitter.social, epEmitter.homework, epEmitter.summary],
      function(dormScore, socialScore, homeworkScore, summary) {
      console.log('?')
      callback({
        overallScore: (dormScore + socialScore + homeworkScore) / 3,
        dormScore: dormScore,
        socialScore: socialScore,
        homeworkScore: homeworkScore,
        summary: summary
      });
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
