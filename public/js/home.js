// fetch data with jQuery
fetchData();

/**
 * fetch data for graphs
 */
function fetchData() {
  var activityChart = $('#activity-chart');
  var socialChart = $('#social-chart');
  var activityChartData = {};
  var socialChartData = {};
  $.ajax({
    type: 'GET',
    contentType: 'application/json; charset=utf-8',
    url: '/analysis/activity-line-chart-data'
  }).done(function(data){
    activityChartData = data;
    var lineChart = new Chart(activityChart, activityChartData);
  });

  $.ajax({
    type: 'GET',
    contentType: 'application/json; charset=utf-8',
    url: '/analysis/social-radar-chart-data'
  }).done(function(data){
    socialChartData = data;
    var radarChart = new Chart(socialChart, socialChartData);
  });
}

fetchData();
