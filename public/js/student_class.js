/**
 * Created by zhoucheng on 2/27/17.
 */
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

  var url  = location.href;
  // alert(url);
  var pieces = url.split('/')
  var classId = pieces[pieces.length - 1]
  var userId = pieces[pieces.length - 2]
  // alert(classId + ' '+userId)
  // alert(pieces)
  $.ajax({
    type: 'GET',
    contentType: 'application/json; charset=utf-8',
    url: '/analysis/student-class-line-chart-data/' + userId + '/' + classId
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

  $.ajax({
    type: 'GET',
    contentType: 'application/json; charset=utf-8',
    url: '/analysis/homework-html-data'
  }).done(function(data){
    $('#homework-html').html(data.html);
  });
}

fetchData();
