/**
 * Created by zhoucheng on 2/27/17.
 */



$(document).on('click', '.class-detail', function()
{
  var self = $(this);

  // var data = {
  //   badScoreFilter: [
  //     {
  //       userId: '1011111',
  //       userName: 'zhou',
  //       score: 1.22
  //     },
  //     {
  //       userId: '312312312',
  //       userName: 'hou',
  //       score: 111.1
  //     },
  //     {
  //       userId: '11111',
  //       userName: 'ye',
  //       score: 3.44
  //     }
  //   ]



  var href = self.attr('href');
  var id = href.substr(1, href.length - 1)
  // not collapsed
  if (!$('#'+id).hasClass('in')) {
    $.ajax({
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      url: '/analysis/get-class-detail/'+id,
      dataType: 'json'
    }).done(function(res){
      if(res.status === 200) {
        var html = Handlebars.templates["class_detail"](res.data);
        $('#'+id+' .panel-body').html(html)
      }
    });
  }
  // var html = Handlebars.templates["class_detail"](data);
  // $('#'+id).html(html)

})
