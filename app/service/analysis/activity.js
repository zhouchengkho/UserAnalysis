var db = require('../../models/index');
var moment  = require('moment');
var reference = require('./../reference');
var Promise = require('bluebird');
var async = require('async')
function Activity() {
  /**
   * getOverallScore
   * @param userId
   * @param callback
   * @returns {number} score number
   */
  this.getScore = function(userId, callback) {
    callback(null, 5);
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
   * @param timePeriod [optional] if not provided, set as 'academic-year'
   * @param callback
   */
  this.getLineChartData = function(userId, timePeriod, callback) {
    if((typeof timePeriod) == 'function') {
      callback = timePeriod;
      timePeriod = 'academic-year'
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
