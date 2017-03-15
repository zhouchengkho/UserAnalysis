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
    console.log('huh?')
    $.ajax({
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      url: '/analysis/get-class-detail/'+id
    }).done(function(res){
      $('#'+id+' .panel-body').html(res)
    });
  }
  // var html = Handlebars.templates["class_detail"](data);
  // $('#'+id).html(html)

})
