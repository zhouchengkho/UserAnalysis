var activityChart = $('#activity-chart');
var socialChart = $('#social-chart');
var lineChart = new Chart(activityChart, {
  type: 'line',
  data: {
    labels : ['January','February','March','April','May','June','July'],
    datasets : [
      {
        label: 'Mine',
        backgroundColor : 'rgba(207,220,229,0.5)',
        borderColor : 'rgba(160,185,204,1)',
        pointBackgroundColor: 'rgba(160,185,204,1)',
        pointBorderColor : 'rgba(255,255,255,1)',
        data : [65,59,90,81,56,55,40]
      },
      {
        label: 'Average',
        backgroundColor : 'rgba(247,223,229,0.5)',
        borderColor : 'rgba(226,97,128,1)',
        pointBackgroundColor: 'rgba(226,97,128,1)',
        pointBorderColor : 'rgba(255,255,255,1)',
        data : [28,48,40,19,96,27,100]
      }
    ]
  },
  options: {
    title: {
      text: 'Visit Frequency',
      display: true
    },
    responsive: false
  }
});

var radarChart  = new Chart(socialChart, {
  type: 'radar',
  data: {
    labels: ['Friends', 'Comments', 'Status'],
    datasets: [
      {
        label: 'Mine',
        backgroundColor : 'rgba(207,220,229,0.5)',
        borderColor : 'rgba(160,185,204,1)',
        pointBackgroundColor: 'rgba(160,185,204,1)',
        pointBorderColor : 'rgba(255,255,255,1)',
        data: [65, 59, 90]
      },
      {
        label: 'Average',
        backgroundColor : 'rgba(247,223,229,0.5)',
        borderColor : 'rgba(226,97,128,1)',
        pointBackgroundColor: 'rgba(226,97,128,1)',
        pointBorderColor : 'rgba(255,255,255,1)',
        data: [28, 48, 40]
      }
    ]
  }
})
