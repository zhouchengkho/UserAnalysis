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
      barChartData.data.datasets[0].data.push(result.activity)
      exp.getDetailedDormExp(userId, function(err, result) {
        for(var i in result) {
          barChartData.data.labels.push(result[i].userName)
          barChartData.data.datasets[0].data.push(result[i].activity)
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
      console.log('in dorm')
      console.log(result)
      barChartData.data.labels.push(result.userName)
      barChartData.data.datasets[0].data.push(result.activity)
      exp.getDetailedClassDormExp(classId, userId, function(err, result) {
        console.log(JSON.stringify(result))
        for(var i in result) {
          barChartData.data.labels.push(result[i].userName)
          barChartData.data.datasets[0].data.push(result[i].activity)
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
        labels: ['好友', '签到', '签到回复',  '资源回复', '话题回复'],
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

    // var gte = reference.getTimePeriod(timePeriod, userId).gte;
    // var lte = reference.getTimePeriod(timePeriod, userId).lte;
    var gte = '1995-01-01 00:00:00';
    var lte = reference.getNowString();
    console.log('getting chart social for: '+userId)

    console.log(gte)
    console.log(lte)
    Promise.all([
      query.getStudentFriendsCountAsync(userId),
      query.getStudentStatusCountInTimeAsync(userId, gte, lte),
      query.getStudentStatusReplyCountInTimeAsync(userId, gte, lte),
      query.getStudentSourceReplyCountInTimeAsync(userId, gte, lte),
      query.getStudentTopicReplyCountInTimeAsync(userId, gte, lte),
    ]).spread(function(friendsCount, statusCount, statusReplyCount, sourceReplyCount, topicReplyCount) {
      Promise.all([
        query.getStudentFriendsCountAvgAsync(),
        query.getStudentStatusCountInTimeAvgAsync(gte, lte),
        query.getStudentStatusReplyCountInTimeAvgAsync(gte, lte),
        query.getStudentSourceReplyCountInTimeAvgAsync(gte, lte),
        query.getStudentTopicReplyCountInTimeAvgAsync(gte, lte)
      ]).spread(function(friendsAvg, statusAvg, statusReplyAvg, sourceReplyAvg, topicReplyAvg) {
        console.log('friends count: '+friendsCount)
        console.log(friendsAvg + ' '+ friendsCount)
        radarChartData.data.datasets[0].data.push(friendsCount)
        radarChartData.data.datasets[0].data.push(statusCount)
        radarChartData.data.datasets[0].data.push(statusReplyCount)
        radarChartData.data.datasets[0].data.push(sourceReplyCount)
        radarChartData.data.datasets[0].data.push(topicReplyCount)
        radarChartData.data.datasets[1].data.push(friendsAvg)
        radarChartData.data.datasets[1].data.push(statusAvg)
        radarChartData.data.datasets[1].data.push(statusReplyAvg)
        radarChartData.data.datasets[1].data.push(sourceReplyAvg)
        radarChartData.data.datasets[1].data.push(topicReplyAvg)
        callback(null, radarChartData)
      })

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
      type: 'bar',
      option: {
        title: {
          text: 'Visit Frequency',
          display: true
        },
        responsive: false
      },
      data: {
        labels : ['作业', '课件', '讨论', '资源'],
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
      query.getClassStudentActionCountAsync(classId, userId, ['201', '202', '203']),
      query.getClassStudentActionCountAsync(classId, userId, ['301']),
      query.getClassStudentActionCountAsync(classId, userId, ['401', '402', '403', '404', '405']),
      query.getClassStudentActionCountAsync(classId, userId, ['501', '502', '503', '504', '505', '506', '507']),
      query.getClassActionCountAvgAsync(classId, ['201', '202', '203']),
      query.getClassActionCountAvgAsync(classId, ['301']),
      query.getClassActionCountAvgAsync(classId, ['401', '402', '403', '404', '405']),
      query.getClassActionCountAvgAsync(classId, ['501', '502', '503', '504', '505', '506', '507'])
    ]).spread(function(assignmentScore, pptScore, discussionScore, rscScore, assignmentAvg, pptAvg, discussionAvg, rscAvg) {

        lineChartData.data.datasets[0].data.push(assignmentScore)
        lineChartData.data.datasets[0].data.push(pptScore)
        lineChartData.data.datasets[0].data.push(discussionScore)
        lineChartData.data.datasets[0].data.push(rscScore)
        lineChartData.data.datasets[1].data.push(assignmentAvg)
        lineChartData.data.datasets[1].data.push(pptAvg)
        lineChartData.data.datasets[1].data.push(discussionAvg)
        lineChartData.data.datasets[1].data.push(rscAvg)

        callback(null, lineChartData)

    })

  }

  this.getClassStudentSocialGraph = function(classId, userId, callback) {
    reference.getTimeForClass(classId, function(err, time) {
      var gte = time.gte;
      var lte = time.lte;
      var radarChartData = {
        type: 'radar',
        data: {
          labels: ['好友', '签到', '签到回复', ' 资源回复', '话题回复'],
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
        query.getStudentStatusCountInTimeAsync(userId, gte, lte),
        query.getStudentStatusReplyCountInTimeAsync(userId, gte, lte),
        query.getStudentSourceReplyCountInTimeAsync(userId, gte, lte),
        query.getStudentTopicReplyCountInTimeAsync(userId, gte, lte)
      ]).spread(function(friendsCount, statusCount, statusReplyCount, sourceReplyCount, topicReplyCount) {
        console.log('friends count: '+friendsCount)
        Promise.all([
          query.getClassStudentFriendsCountAvgAsync(classId),
          query.getClassStudentStatusCountInTimeAvgAsync(classId, gte, lte),
          query.getClassStudentStatusReplyCountInTimeAvgAsync(classId, gte, lte),
          query.getClassStudentSourceReplyCountInTimeAvgAsync(classId, gte, lte),
          query.getClassStudentTopicReplyCountInTimeAvgAsync(classId, gte, lte)
        ]).spread(function(friendsAvg, statusAvg, statusReplyAvg, sourceReplyAvg, topicReplyAvg) {
          console.log('friends count: '+friendsCount)
          console.log(friendsAvg + ' '+ friendsCount)
          radarChartData.data.datasets[0].data.push(friendsCount)
          radarChartData.data.datasets[0].data.push(statusCount)
          radarChartData.data.datasets[0].data.push(statusReplyCount)
          radarChartData.data.datasets[0].data.push(sourceReplyCount)
          radarChartData.data.datasets[0].data.push(topicReplyCount)
          radarChartData.data.datasets[1].data.push(friendsAvg)
          radarChartData.data.datasets[1].data.push(statusAvg)
          radarChartData.data.datasets[1].data.push(statusReplyAvg)
          radarChartData.data.datasets[1].data.push(sourceReplyAvg)
          radarChartData.data.datasets[1].data.push(topicReplyAvg)
          callback(null, radarChartData)
        })
      }).catch(function(err) {callback(err)})
    })


  }


  this.getClassExpDistribution = function(classId, callback) {

    var barChartData = {
      type: 'line',
      option: {
        title: {
          text: 'Exp Distribution',
          display: true
        },
        responsive: false
      },
      data: {
        labels : ['0-100', '100-200','200-300', '300-400', '400-500', '500-600', '600-700' , '700-800', '800-900', '900-1000'],
        datasets : [
          {
            label: 'Exp Distribution',
            backgroundColor : 'rgba(207,220,229,0.5)',
            borderColor : 'rgba(160,185,204,1)',
            pointBackgroundColor: 'rgba(160,185,204,1)',
            pointBorderColor : 'rgba(255,255,255,1)',
            data : []
          }
        ]
      }
    }

    exp.getClassExpDistribution(classId, function(err, result) {
      for(var i in result) {
        barChartData.data.datasets[0].data.push(result[i].count)
      }
      callback(err, barChartData)
    })

  }

}




module.exports = new Graph();
