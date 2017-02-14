var db = require('../../models/index');
var reference = require('./../reference');
var query = require('./../query');
function Social() {

  /**
   * getFriends
   * get a certain user's friends according his user id
   * @param userId
   * @param callback
   */
  this.getFriends = function(userId, callback) {
    db.Friend.findAll({where: {userId: userId}, include: [db.User]}).then(function (friends) {
      callback(null, friends);
    });
  }
  /**
   *
   * @param userId
   * @param callback
   */
  this.getScore = function(userId, callback) {
    callback(null, 6);
  }
  /**
   * getRadarData
   * get data for the radar chart
   * @param userId
   * @param timePeriod: [optional] 'last-semester' 'this-semester' 'academic-year'
   * @param callback
   */
  this.getRadarChartData = function(userId, timePeriod, callback) {
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
    var userCount = 0;

    db.sequelize.transaction(function(t) {
      return db.User.count({}, {transaction: t}).then(function(count) {
        userCount = count;
        return db.Friend.count(query.genWhereQuery({userId: userId}), {transaction: t})
      }).then(function(count) {
        radarChartData.data.datasets[0].data.push(count)
        return db.Status.count(query.genWhereQuery({userId: userId, time: reference.getTimePeriod(timePeriod, userId)}), {transaction: t})
      }).then(function(count) {
        radarChartData.data.datasets[0].data.push(count)
        return db.SourceReply.count(query.genWhereQuery({replyId: userId, time: reference.getTimePeriod(timePeriod, userId)}), {transaction: t})
      }).then(function(count) {
        radarChartData.data.datasets[0].data.push(count)
        return db.TopicReply.count(query.genWhereQuery({replyId: userId, time: reference.getTimePeriod(timePeriod, userId)}), {transaction: t})
      }).then(function(count) {
        radarChartData.data.datasets[0].data.push(count)
        return db.Friend.count(query.genWhereQuery({userId: null}), {transaction: t})
      }).then(function(count) {
        radarChartData.data.datasets[1].data.push(count / userCount)
        return db.Status.count(query.genWhereQuery({userId: null, time: reference.getTimePeriod(timePeriod, userId)}), {transaction: t})
      }).then(function(count) {
        radarChartData.data.datasets[1].data.push(count / userCount)
        return db.SourceReply.count(query.genWhereQuery({time: reference.getTimePeriod(timePeriod, userId)}), {transaction: t})
      }).then(function(count) {
        radarChartData.data.datasets[1].data.push(count / userCount)
        return db.TopicReply.count(query.genWhereQuery({time: reference.getTimePeriod(timePeriod, userId)}), {transaction: t})
      }).then(function(count) {
        radarChartData.data.datasets[1].data.push(count / userCount)
        callback(null, radarChartData)
      })
    }).catch(function(err) {
      callback(err)
    });
  }
}




module.exports = new Social();



