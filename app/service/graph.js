/**
 * Created by zhoucheng on 3/4/17.
 */
var exp = require('./exp');
var reference = require('./reference');
var async = require('async');
var query = require('bluebird').promisifyAll(require('./query'));
var Promise = require('bluebird');
function Graph() {
  this.getBarChartDataForDorm = function(userId, callback) {


    var barChartData = {
      type: 'bar',
      option: {
        title: {
          text: 'Exp Compare',
          display: true
        },
        responsive: false
      },
      data: {
        labels : [],
        datasets : [
          {
            label: '',
            backgroundColor : 'rgba(207,220,229,0.5)',
            borderColor : 'rgba(160,185,204,1)',
            pointBackgroundColor: 'rgba(160,185,204,1)',
            pointBorderColor : 'rgba(255,255,255,1)',
            data : []
          }
        ]
      }
    }

    exp.getDetailedStudentExp(userId, function(err, result) {
      barChartData.data.labels.push(result.userName)
      barChartData.data.datasets[0].data.push(result.exp)
      exp.getDetailedDormExp(userId, function(err, result) {
        for(var i in result) {
          barChartData.data.labels.push(result[i].userName)
          barChartData.data.datasets[0].data.push(result[i].exp)
        }
        callback(null, barChartData)
      })
    })




  }

  this.getClassBarChartDataForDorm = function(classId, userId, callback) {

    var barChartData = {
      type: 'bar',
      option: {
        title: {
          text: 'Exp Compare',
          display: true
        },
        responsive: false
      },
      data: {
        labels : [],
        datasets : [
          {
            label: '',
            backgroundColor : 'rgba(207,220,229,0.5)',
            borderColor : 'rgba(160,185,204,1)',
            pointBackgroundColor: 'rgba(160,185,204,1)',
            pointBorderColor : 'rgba(255,255,255,1)',
            data : []
          }
        ]
      }
    }


    exp.getDetailedClassStudentExp(classId, userId, function(err, result) {
      barChartData.data.labels.push(result.userName)
      barChartData.data.datasets[0].data.push(result.exp)
      exp.getDetailedClassDormExp(classId, userId, function(err, result) {
        console.log(JSON.stringify(result))
        for(var i in result) {
          barChartData.data.labels.push(result[i].userName)
          barChartData.data.datasets[0].data.push(result[i].exp)
        }
        callback(null, barChartData)
      })
    })
  }

  /**
   * get data from according to semester
   * fall: 8 - 1
   * spring: 2 - 7
   * @param userId
   * @param timePeriod
   * @param callback
   */
  this.getActivityLineChartData = function(userId, timePeriod, callback) {
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



    async.eachSeries(nodes, function(node, done) {
      query.getStudentActionCountInTime(userId, node.gte, node.lte, function(err, count) {
        lineChartData.data.datasets[0].data.push(count);
        done();
      })
    }, function done() {
      async.eachSeries(nodes, function(node, done) {
        query.getStudentActionCountInTimeAvg(userId, node.gte, node.lte, function(err, count) {
          lineChartData.data.datasets[1].data.push(count);
          done();
        })
      }, function done() {
        callback(null, lineChartData)

      })
    })
  }

  /**
   * getRadarData
   * get data for the radar chart
   * @param userId
   * @param timePeriod: [optional] 'last-semester' 'this-semester' 'academic-year'
   * @param callback
   */
  this.getSocialRadarChartData = function(userId, timePeriod, callback) {
    // check optional time
    if((typeof timePeriod) == 'function') {
      callback = timePeriod;
      timePeriod = 'academic-year';
    }
    var radarChartData = {
      type: 'radar',
      data: {
        labels: ['Friends', 'Status', 'Source Reply', 'Topic Reply'],
        datasets: [
          {
            label: 'Mine',
            backgroundColor : 'rgba(207,220,229,0.5)',
            borderColor : 'rgba(160,185,204,1)',
            pointBackgroundColor: 'rgba(160,185,204,1)',
            pointBorderColor : 'rgba(255,255,255,1)',
            data: []
          },
          {
            label: 'Average',
            backgroundColor : 'rgba(247,223,229,0.5)',
            borderColor : 'rgba(226,97,128,1)',
            pointBackgroundColor: 'rgba(226,97,128,1)',
            pointBorderColor : 'rgba(255,255,255,1)',
            data: []
          }
        ]
      }
    };

    var gte = reference.getTimePeriod(timePeriod, userId).gte;
    var lte = reference.getTimePeriod(timePeriod, userId).lte;
    console.log('getting chart social for: '+userId)

    Promise.all([
      query.getStudentFriendsCountAsync(userId),
      query.getStudentFriendsCountAvgAsync(),
      query.getStudentStatusCountInTimeAsync(userId, gte, lte),
      query.getStudentStatusCountInTimeAvgAsync(gte, lte),
      query.getStudentSourceReplyCountInTimeAsync(userId, gte, lte),
      query.getStudentSourceReplyCountInTimeAvgAsync(gte, lte),
      query.getStudentTopicReplyCountInTimeAsync(userId, gte, lte),
      query.getStudentTopicReplyCountInTimeAvgAsync(gte, lte)
    ]).spread(function(friendsCount, friendsAvg, statusCount, statusAvg, sourceReplyCount, sourceReplyAvg, topicReplyCount, topicReplyAvg) {
      console.log('friends count: '+friendsCount)
      radarChartData.data.datasets[0].data.push(friendsCount)
      radarChartData.data.datasets[0].data.push(statusCount)
      radarChartData.data.datasets[0].data.push(sourceReplyCount)
      radarChartData.data.datasets[0].data.push(topicReplyCount)
      radarChartData.data.datasets[1].data.push(friendsAvg)
      radarChartData.data.datasets[1].data.push(statusAvg)
      radarChartData.data.datasets[1].data.push(sourceReplyAvg)
      radarChartData.data.datasets[1].data.push(topicReplyAvg)
      callback(null, radarChartData)
    }).catch(function(err) {callback(err)})

  }



  /**
   *
   * @param classId
   * @param userId
   * @param callback
   */
  this.getClassStudentLineChartData = function(classId, userId, callback) {

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
        labels : ['发起讨论', '查看讨论', '下载资源', '下载ppt', '下载资源'],
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

    Promise.all([
      query.getClassStudentActionCountAsync(classId, userId, ['401']),
      query.getClassStudentActionCountAsync(classId, userId, ['402']),
      query.getClassStudentActionCountAsync(classId, userId, ['505']),
      query.getClassStudentActionCountAsync(classId, userId, ['301']),
      query.getClassStudentActionCountAsync(classId, userId, ['203'])
    ]).spread(function(initScore, checkoutScore, rscScore, pptScore, assignmentScore) {
      var initAvg, checkoutAvg, rscAvg, pptAvg, assignmentAvg;
      query.getClassActionCountAvgAsync(classId, ['401']).then(function(count) {
        initAvg = count;
        return query.getClassActionCountAvgAsync(classId, ['402'])
      }).then(function(count) {
        checkoutAvg = count;
        return query.getClassActionCountAvgAsync(classId, ['505'])
      }).then(function(count) {
        rscAvg = count;
        return  query.getClassActionCountAvgAsync(classId, ['301'])
      }).then(function(count) {
        pptAvg = count;
        return query.getClassActionCountAvgAsync(classId, ['203'])
      }).then(function(count) {
        assignmentAvg = count;
        lineChartData.data.datasets[0].data.push(initScore)
        lineChartData.data.datasets[0].data.push(checkoutScore)
        lineChartData.data.datasets[0].data.push(rscScore)
        lineChartData.data.datasets[0].data.push(pptScore)
        lineChartData.data.datasets[0].data.push(assignmentScore)
        lineChartData.data.datasets[1].data.push(initAvg)
        lineChartData.data.datasets[1].data.push(checkoutAvg)
        lineChartData.data.datasets[1].data.push(rscAvg)
        lineChartData.data.datasets[1].data.push(pptAvg)
        lineChartData.data.datasets[1].data.push(assignmentAvg)

        callback(null, lineChartData)
      })

    })



  }

  this.getClassStudentSocialGraph = function(classId, userId, callback) {
    reference.getTimeForClass(classId, function(err, time) {
      var gte = time.gte;
      var lte = time.lte;
      var radarChartData = {
        type: 'radar',
        data: {
          labels: ['Friends', 'Status', 'Source Reply', 'Topic Reply'],
          datasets: [
            {
              label: 'Mine',
              backgroundColor : 'rgba(207,220,229,0.5)',
              borderColor : 'rgba(160,185,204,1)',
              pointBackgroundColor: 'rgba(160,185,204,1)',
              pointBorderColor : 'rgba(255,255,255,1)',
              data: []
            },
            {
              label: 'Average',
              backgroundColor : 'rgba(247,223,229,0.5)',
              borderColor : 'rgba(226,97,128,1)',
              pointBackgroundColor: 'rgba(226,97,128,1)',
              pointBorderColor : 'rgba(255,255,255,1)',
              data: []
            }
          ]
        }
      };


      console.log('getting chart social for: '+userId)

      Promise.all([
        query.getStudentFriendsCountAsync(userId),
        query.getStudentFriendsCountAvgAsync(),
        query.getStudentStatusCountInTimeAsync(userId, gte, lte),
        query.getStudentStatusCountInTimeAvgAsync(gte, lte),
        query.getStudentSourceReplyCountInTimeAsync(userId, gte, lte),
        query.getStudentSourceReplyCountInTimeAvgAsync(gte, lte),
        query.getStudentTopicReplyCountInTimeAsync(userId, gte, lte),
        query.getStudentTopicReplyCountInTimeAvgAsync(gte, lte)
      ]).spread(function(friendsCount, friendsAvg, statusCount, statusAvg, sourceReplyCount, sourceReplyAvg, topicReplyCount, topicReplyAvg) {
        console.log('friends count: '+friendsCount)
        radarChartData.data.datasets[0].data.push(friendsCount)
        radarChartData.data.datasets[0].data.push(statusCount)
        radarChartData.data.datasets[0].data.push(sourceReplyCount)
        radarChartData.data.datasets[0].data.push(topicReplyCount)
        radarChartData.data.datasets[1].data.push(friendsAvg)
        radarChartData.data.datasets[1].data.push(statusAvg)
        radarChartData.data.datasets[1].data.push(sourceReplyAvg)
        radarChartData.data.datasets[1].data.push(topicReplyAvg)
        callback(null, radarChartData)
      }).catch(function(err) {callback(err)})
    })


  }

}



module.exports = new Graph();
