/**
 * Created by zhoucheng on 3/4/17.
 */
var exp = require('./exp');
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

}



module.exports = new Graph();
