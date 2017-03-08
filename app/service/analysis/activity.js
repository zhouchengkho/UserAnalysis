var db = require('../../models/index');
var moment  = require('moment');
var reference = require('./../reference');
var Promise = require('bluebird');
var async = require('async');
var query = Promise.promisifyAll(require('../query'));
var score = require('./score');
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
    query.getStudentClasses(userId).then(function(classIds) {
      // var classId = data[index];
      async.eachSeries(classIds, function(classId, done) {
        self.getClassStudentScoreAsync(classId, userId, function(err, score) {
          if(err)
            throw new Error(err)
          data.classScores.push({classId: classId, score: score})
          done()
        })
      }, function done() {
        // compute avg
        var sum = 0;
        for(var index in data.classScores)
          sum += data.classScores[index].score
        data.overallScore = sum / data.classScores.length
        console.log('student score: ' + data)
        callback(null, data);
      })
    }).catch(function(err) {callback(err)})
  }

  this.getClassScore = function(userId, classId, callback) {
    callback(null, Math.random() * 10);
  }

  /**
   *
   *  count / avg > 1.8  =  10
   *  < 1.8:  ( (count / avg) / 1.8 ) * 10
   * @param score
   * @returns {number}
   */
  function getScore(count, avg) {
    // TODO: this should be considered with a serious model instead of simple math
    var score = (avg == 0) ? 0.9 : count / avg;
    if(score >= 1.8)
      return 10;
    else {
      return ( score / 1.8 ) * 10
    }
  }
  /**
   * class score
   * initiate discussion - code: 401, 30%
   * checkout discussion - code: 402, 10%
   * resource (check out / edit / download / rate) - (502  / 503 / 505 / 507) 20%
   * ppt download  - code: 301 * 20%
   * assignment (submit / resubmit / download) -  (201 / 202 / 203) 20%
   *
   *
   * @param classId
   * @param userId
   * @param callback
   */
  this.getClassStudentScore = function(classId, userId, callback) {
    var score = {};
    Promise.all([
      query.getClassStudentActionCountAsync(classId, userId, ['401']),
      // query.getClassActionCountAvgAsync(classId, ['401']),
      query.getClassStudentActionCountAsync(classId, userId, ['402']),
      // query.getClassActionCountAvgAsync(classId, ['402']),
      query.getClassStudentActionCountAsync(classId, userId, ['502', '503', '504', '505', '507']),
      // query.getClassActionCountAvgAsync(classId, ['502', '503', '504', '505', '507']),
      query.getClassStudentActionCountAsync(classId, userId, ['301']),
      // query.getClassActionCountAvgAsync(classId, ['301']),
      query.getClassStudentActionCountAsync(classId, userId, ['201', '202', '203']),
      // query.getClassActionCountAvgAsync(classId, ['201', '202', '203'])
    ]).spread(function(initCount, checkoutCount, rscCount, pptCount, assignmentCount) {
      var initAvg, checkoutAvg, rscAvg, pptAvg, assignmentAvg;
      query.getClassActionCountAvgAsync(classId, ['401']).then(function(count) {
        initAvg = count;
        return query.getClassActionCountAvgAsync(classId, ['402'])
      }).then(function(count) {
        checkoutAvg = count;
        return query.getClassActionCountAvgAsync(classId, ['502', '503', '504', '505', '507'])
      }).then(function(count) {
        rscAvg = count;
        return  query.getClassActionCountAvgAsync(classId, ['301'])
      }).then(function(count) {
        pptAvg = count;
        return query.getClassActionCountAvgAsync(classId, ['201', '202', '203'])
      }).then(function(count) {
        assignmentAvg = count;
        score.initDiscussionScore = getScore(initCount, initAvg);
        score.checkoutDiscussionScore = getScore(checkoutCount, checkoutAvg);
        score.resourceScore = getScore(rscCount, rscAvg);
        score.pptScore = getScore(pptCount, pptAvg);
        score.assignmentScore = getScore(assignmentCount, assignmentAvg);
        var final = score.initDiscussionScore * 0.3 + score.checkoutDiscussionScore * 0.1 + score.resourceScore * 0.2 + score.pptScore * 0.2 + score.assignmentScore * 0.2;
        console.log('param: '+initCount + ' '+ initAvg + ' '+ checkoutCount + ' ' + checkoutAvg + ' '+ rscCount + ' ' +rscAvg + ' '+ pptCount + ' '+ pptAvg + ' '+ assignmentCount + ' '+ assignmentAvg)
        console.log('score: '+JSON.stringify(score))
        console.log('final ' + classId + ' ' + final)
        callback(null, final)
      })
    }).catch(function(err) {callback(err)})
  }


  /**
   * class exp
   * initiate discussion - code: 401
   * checkout discussion - code: 402
   * resource (check out / edit / download / rate) - (502  / 503 / 505 / 507)
   * ppt download  - code: 301
   * assignment (submit / resubmit / download) -  (201 / 202 / 203)
   *
   *
   * @param classId
   * @param userId
   * @param callback
   *
   *
   * 5.21  {Number}
   */
  this.getClassStudentExp = function(classId, userId, callback) {

    Promise.all([
      query.getClassActionCountGroupAsync(classId, ['401']),
      query.getClassActionCountGroupAsync(classId, ['402']),
      query.getClassActionCountGroupAsync(classId, ['502', '503', '504', '505', '507']),
      query.getClassActionCountGroupAsync(classId, ['301']),
      query.getClassActionCountGroupAsync(classId, ['201', '202', '203'])
    ]).spread(function(initGroup, checkoutGroup, rscGroup, pptGroup, assignmentGroup) {
      var statistic = reverseMatrix([
        organize(initGroup, userId),
        organize(checkoutGroup, userId),
        organize(rscGroup, userId),
        organize(pptGroup, userId),
        organize(assignmentGroup, userId)
      ])

      callback(null, score.entropy.getScoreOf(statistic, 0))
    })
  }


  function reverseMatrix(datasets) {
    var data = [];
    for(var j in datasets[0]) {
      var column = [];
      for(var i in datasets) {
        column.push(datasets[i][j])
      }
      data.push(column)
    }
    return data;
  }
  /**
   *
   * @param data
   * @param firstId
   * returns
   * [3, 5, 7, 10]
   */
  function organize(data, firstId) {
    var result = [0];
    data = JSON.parse(JSON.stringify(data))
    for(var i in data) {
      if(data[i].userId == firstId)
        result[0] = data[i].count;
      else
        result.push(data[i].count);
    }
    return result
  }

  // /**
  //  * class score
  //  * initiate discussion - code: 401
  //  * checkout discussion - code: 402
  //  * resource (check out / edit / download / rate) - (502  / 503 / 505 / 507)
  //  * ppt download  - code: 301
  //  * assignment (submit / resubmit / download) -  (201 / 202 / 203)
  //  *
  //  * @param classId
  //  * @param userId
  //  * @param callback
  //  */
  // this.getClassStudentLineChartData = function(classId, userId, callback) {
  //
  //   var userCount = 0;
  //   var lineChartData = {
  //     type: 'line',
  //     option: {
  //       title: {
  //         text: 'Visit Frequency',
  //         display: true
  //       },
  //       responsive: false
  //     },
  //     data: {
  //       labels : ['发起讨论', '查看讨论', '下载资源', '下载ppt', '下载资源'],
  //       datasets : [
  //         {
  //           label: 'Mine',
  //           backgroundColor : 'rgba(207,220,229,0.5)',
  //           borderColor : 'rgba(160,185,204,1)',
  //           pointBackgroundColor: 'rgba(160,185,204,1)',
  //           pointBorderColor : 'rgba(255,255,255,1)',
  //           data : []
  //         },
  //         {
  //           label: 'Average',
  //           backgroundColor : 'rgba(247,223,229,0.5)',
  //           borderColor : 'rgba(226,97,128,1)',
  //           pointBackgroundColor: 'rgba(226,97,128,1)',
  //           pointBorderColor : 'rgba(255,255,255,1)',
  //           data : []
  //         }
  //       ]
  //     }
  //   }
  //
  //   Promise.all([
  //     query.getClassStudentActionCountAsync(classId, userId, ['401']),
  //     query.getClassStudentActionCountAsync(classId, userId, ['402']),
  //     query.getClassStudentActionCountAsync(classId, userId, ['505']),
  //     query.getClassStudentActionCountAsync(classId, userId, ['301']),
  //     query.getClassStudentActionCountAsync(classId, userId, ['203'])
  //   ]).spread(function(initScore, checkoutScore, rscScore, pptScore, assignmentScore) {
  //     var initAvg, checkoutAvg, rscAvg, pptAvg, assignmentAvg;
  //     query.getClassActionCountAvgAsync(classId, ['401']).then(function(count) {
  //       initAvg = count;
  //       return query.getClassActionCountAvgAsync(classId, ['402'])
  //     }).then(function(count) {
  //       checkoutAvg = count;
  //       return query.getClassActionCountAvgAsync(classId, ['505'])
  //     }).then(function(count) {
  //       rscAvg = count;
  //       return  query.getClassActionCountAvgAsync(classId, ['301'])
  //     }).then(function(count) {
  //       pptAvg = count;
  //       return query.getClassActionCountAvgAsync(classId, ['203'])
  //     }).then(function(count) {
  //       assignmentAvg = count;
  //       lineChartData.data.datasets[0].data.push(initScore)
  //       lineChartData.data.datasets[0].data.push(checkoutScore)
  //       lineChartData.data.datasets[0].data.push(rscScore)
  //       lineChartData.data.datasets[0].data.push(pptScore)
  //       lineChartData.data.datasets[0].data.push(assignmentScore)
  //       lineChartData.data.datasets[1].data.push(initAvg)
  //       lineChartData.data.datasets[1].data.push(checkoutAvg)
  //       lineChartData.data.datasets[1].data.push(rscAvg)
  //       lineChartData.data.datasets[1].data.push(pptAvg)
  //       lineChartData.data.datasets[1].data.push(assignmentAvg)
  //
  //       callback(null, lineChartData)
  //     })
  //
  //   })
  //
  //
  //
  // }
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

}


module.exports = new Activity();
