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

    // exp table ajax
    // $.ajax({
    //   type: 'GET',
    //   contentType: 'application/json; charset=utf-8',
    //   url: '/analysis/get-class-detail/'+id
    // }).done(function(res){
    //   $('#'+id+' .panel-body .exp-table').html(res)
    // });

    // exp graph ajax
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


    // exp graph ajax

      $('#'+id+' .panel-body #class-table').bootstrapTable({
        url: '/analysis/class-exp-data/'+id
    });

    window.actionFormatter = function(value, row, index) {
      return [
        '<a class="view" href="javascript:void(0)" title="Like">',
        '<i class="glyphicon glyphicon-eye-open"></i>',
        '</a>'
      ].join('');
    }

    window.actionEvents = {
      'click .view': function (e, value, row, index) {
        window.open('/student/class/'+row.userId+'/'+row.classId)
      }
    };

  }


  // var html = Handlebars.templates["class_detail"](data);
  // $('#'+id).html(html)

})
