// fetch data with jQuery
fetchData();

/**
 * fetch data for graphs
 */
function fetchData() {
  var activityChart = $('#activity-chart');
  var socialChart = $('#social-chart');
  var dormChart = $('#dorm-chart');
  var activityChartData = {};
  var socialChartData = {};
  var dormChartData = {};

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
    url: '/analysis/activity-html-data'
  }).done(function(data){
    $('#activity-html').html(data.html);
  });

  $.ajax({
    type: 'GET',
    contentType: 'application/json; charset=utf-8',
    url: '/analysis/dorm-bar-chart-data'
  }).done(function(data){
    dormChartData = data;
    var barChart = new Chart(dormChart, dormChartData);
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

$('.analysis-selector ul li a').on('click', function() {
  var eleId = $(this).attr('id')+ '-section';
  $('.analysis-selector ul li a').removeClass('active')
  $(this).addClass('active')
  $('#analysis-sections .analysis-section').addClass('hidden')
  $('#'+eleId).removeClass('hidden')
})
