/**
 * Created by zhoucheng on 3/22/17.
 */
// fetch data with jQuery

$(document).ready(function() {
  fetchData();
  $('.analysis-selector ul li a').on('click', function() {
    var eleId = $(this).attr('id')+ '-section';
    $('.analysis-selector ul li a').removeClass('active')
    $(this).addClass('active')
    $('#analysis-sections .analysis-section').addClass('hidden')
    $('#'+eleId).removeClass('hidden')
  })
})

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

  var studentId = window.location.href.split('/')[window.location.href.split('/').length - 1];

  $.ajax({
    type: 'GET',
    contentType: 'application/json; charset=utf-8',
    url: '/analysis/activity-line-chart-data/'+studentId
  }).done(function(data){
    activityChartData = data;
    var lineChart = new Chart(activityChart, activityChartData);
  });

  $.ajax({
    type: 'GET',
    contentType: 'application/json; charset=utf-8',
    url: '/analysis/dorm-bar-chart-data/'+studentId
  }).done(function(data){
    dormChartData = data;
    var barChart = new Chart(dormChart, dormChartData);
  });


  $.ajax({
    type: 'GET',
    contentType: 'application/json; charset=utf-8',
    url: '/analysis/social-radar-chart-data/'+studentId
  }).done(function(data){
    socialChartData = data;
    var radarChart = new Chart(socialChart, socialChartData);
  });

  $.ajax({
    type: 'GET',
    contentType: 'application/json; charset=utf-8',
    url: '/analysis/homework-html-data/'+studentId
  }).done(function(data){
    $('#homework-html').html(data);
  });
}


