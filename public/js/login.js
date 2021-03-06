/**
 * Created by zhoucheng on 1/3/17.
 */

$(document).ready(function() {

  $('#login-btn').on('click', function() {
    loginAjax();
  })

  // $('#password').on('keydown', function(e) {
  //   if(e.which == 13) {
  //     // enter
  //     alert('key down')
  //     loginAjax();
  //   }
  // })
})


function loginAjax() {
  var userId = $('#userId').val();
  var psd = $('#password').val();
  var url = '/login';
  $.ajax({
    type: 'POST',
    contentType: 'application/json; charset=utf-8',
    url: url,
    data: JSON.stringify({userId: userId, psd: psd}),
    dataType: 'json'
  }).done(function(res){
    if(res.status === 200)
      location.reload()
    else {
      $.toaster({priority: 'danger', title: 'Error', message: res.message});
    }
  });
}
