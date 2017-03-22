/**
 * Created by zhoucheng on 2/27/17.
 */



$(document).on('click', '.class-detail', function()
{
  var self = $(this);
  var href = self.attr('href');
  var id = href.substr(1, href.length - 1)
  // not collapsed
  var selector = '#'+id;
  if ($(selector).attr('aria-expanded') === "true") {
    $.ajax({
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      url: '/analysis/get-class-detail/'+id
    }).done(function(res){
      $('#'+id+' .panel-body .exp-table').html(res)
    });
    $.ajax({
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      url: '/analysis/get-class-exp-distribution/'+id
    }).done(function(res){
      var graph = $('#'+id+' .panel-body .exp-graph');
      var graphData = res.data;
      console.log(graphData)
      var lineChart = new Chart(graph, graphData);
    });
  }
  // var html = Handlebars.templates["class_detail"](data);
  // $('#'+id).html(html)

})
