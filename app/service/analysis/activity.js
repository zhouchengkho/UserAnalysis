var db = require('../../models/index');
var moment  = require('moment');
var reference = require('./../reference');
var Promise = require('bluebird');
var async = require('async');
var query = require('../query');
function Activity() {
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
  this.getClassStudentActivityCount = function(classId, userId, callback) {
    db.sequelize.transaction(function(t) {
      return db.Action.count({where: {classId: classId, userId: userId}})
    }).then(function(result) {
      callback(null, {count: result})
    }).catch(function(err) {callback(err)})
  }

  /**
   *
   * @param userId
   * @param timePeriod
   * @param callback
   */
  this.getStudentActivityCount = function(userId, timePeriod, callback) {

  }
  /**
   * return user's action count
   * @param userId
   * @param callback
   */
  this.getActionCount = function(userId, callback) {
    db.Action.count({
      where: {
        userId: userId
      }
    }).then(function(count) {
      callback(null, {
        count: count
      })
    });
  }
  /**
   * get data from according to semester
   * fall: 8 - 1
   * spring: 2 - 7
   * @param userId
   * @param timePeriod
   * @param callback
   */
  this.getLineChartData = function(userId, timePeriod, callback) {
    if((typeof timePeriod) == 'function') {
      callback = timePeriod;
      timePeriod = reference.getTimePeriod('academic-year')
    }

    var userCount = 0;
    var lineChartData = {
      type: 'line',
      option: {
        title: {
          text: 'Visit Frequency',
          display: true
        },
        responsive: false
      },
      data: {
        labels : [],
        datasets : [
          {
            label: 'Mine',
            backgroundColor : 'rgba(207,220,229,0.5)',
            borderColor : 'rgba(160,185,204,1)',
            pointBackgroundColor: 'rgba(160,185,204,1)',
            pointBorderColor : 'rgba(255,255,255,1)',
            data : []
          },
          {
            label: 'Average',
            backgroundColor : 'rgba(247,223,229,0.5)',
            borderColor : 'rgba(226,97,128,1)',
            pointBackgroundColor: 'rgba(226,97,128,1)',
            pointBorderColor : 'rgba(255,255,255,1)',
            data : []
          }
        ]
      }
    }


    // set labels
    lineChartData.data.labels = reference.getPartitionLabels(timePeriod)


    var nodes = reference.getPartition(timePeriod, userId)




    db.sequelize.transaction(function(t) {
      // find total user count
      return db.User.count({}, {transaction: t})
        .then(function(count) {
          userCount = count;
          // user
          return new Promise(function(resolve, reject) {
            async.eachSeries(nodes, function(node, done) {
              db.Action.count(getQuery(userId, node.gte, node.lte)).then(function(count) {
                lineChartData.data.datasets[0].data.push(count);
                done();
              }).catch(function(err) {reject(err)})
            }, function done() {
              resolve()
            })
          })
      }).then(function() {
        // average
        return new Promise(function(resolve, reject) {
          async.eachSeries(nodes, function(node, done) {
            db.Action.count(getQuery(null, node.gte, node.lte)).then(function(count) {
              lineChartData.data.datasets[1].data.push(count / userCount);
              done();
            }).catch(function(err) {reject(err)})
          }, function done() {
            resolve()
          })
        })
      }).then(function() {
        callback(null, lineChartData)
      }).catch(function(err) {
        callback(err)
      })
    });
  }

  /**
   *
   * @param userId
   * @param timePeriod
   * @param callback
   */
  this.getHtmlData = function(userId, timePeriod, callback) {
    if((typeof timePeriod) == 'function') {
      callback = timePeriod;
      timePeriod = 'academic-year'
    }
    Promise.all([
      db.User.count({}),
      db.Action.count({where: {userId: userId, time: reference.getTimePeriod(timePeriod, userId), actionName: '下载课件'}}),
      db.Action.count({where: {userId: userId, time: reference.getTimePeriod(timePeriod, userId), actionName: '发起讨论'}}),
      db.Action.count({where: {userId: userId, time: reference.getTimePeriod(timePeriod, userId), actionName: '提交作业'}}),
      db.Action.count({where: {userId: userId, time: reference.getTimePeriod(timePeriod, userId), actionName: '下载资源'}}),
      db.Action.count({where: {time: reference.getTimePeriod(timePeriod, userId), actionName: '下载课件'}}),
      db.Action.count({where: {time: reference.getTimePeriod(timePeriod, userId), actionName: '发起讨论'}}),
      db.Action.count({where: {time: reference.getTimePeriod(timePeriod, userId), actionName: '提交作业'}}),
      db.Action.count({where: {time: reference.getTimePeriod(timePeriod, userId), actionName: '下载资源'}})

    ]).spread(function(userCount, downloadPPTCount, discussCount, submitHomeworkCount, downloadResourceCount, downloadPPTSum, discussSum, submitHomeworkSum, downloadResourceSum) {
      var html = '<div style="float: left">' +
        '<p>Downloaded ' + downloadPPTCount + ' PPT(s)</p>' +
        '<p>Initiated ' + discussCount + ' Discussion(s)</p>' +
        '<p>Submitted ' + submitHomeworkCount + ' Homework(s)</p>' +
        '<p>Downloaded ' + downloadResourceCount + ' Resource(s)</p>' +
        '</div>' +
        '<div style="float: right">' +
        '<p>Avg Downloaded ' + downloadPPTSum / userCount + ' PPT(s)</p>' +
        '<p>Avg Initiated ' + discussSum / userCount + ' Discussion(s)</p>' +
        '<p>Avg Submitted ' + submitHomeworkSum / userCount + ' Homework(s)</p>' +
        '<p>Avg Downloaded ' + downloadResourceSum / userCount + ' Resource(s)</p>' +
        '</div>';
      callback(null, {html: html})
    }).catch(function(err) {
      callback(err)
    })

  }
  /**
   *
   * @param userId: if null, cancel this condition
   * @param gte
   * @param lte
   * @returns {{}}
   */
  function getQuery(userId, gte, lte) {
    if (!userId) {
      return {
        where: {
          time: {
            gte: gte,
            lte: lte
          }
        }
      }
    }
    else {
      return {
        where: {
          userId: userId,
          time: {
            gte: gte,
            lte: lte
          }
        }
      }
    }
  }
}


module.exports = new Activity();
