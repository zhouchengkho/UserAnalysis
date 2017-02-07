/**
 * Created by zhoucheng on 2/6/17.
 */


$(document).ready(function() {
  getSettings();

  $('#from').datetimepicker({format: 'yyyy-mm-dd mm:ss'});

  $('#to').datetimepicker({format: 'yyyy-mm-dd mm:ss'});

  $('#ok').on('click', function() {
    updateSettings();
  })

  $('#last-semester').on('click', function() {
    setTimeAjax('/settings/time/get-last-semester');
  })

  $('#college-career').on('click', function() {
    setTimeAjax('/settings/time/get-college-career');
  })



})


var updateSettings = function() {
  var from = $('#from').val();
  var to = $('#to').val();

  $.ajax({
    type: 'POST',
    contentType: 'application/json; charset=utf-8',
    url: '/settings/change-settings',
    data: JSON.stringify({time: {gte: from, lte: to}}),
    dataType: 'json'
  }).done(function(res){
    if(res.status === 1)
      location.replace('/')
    else {
      alert('setting change failed')
    }
  });
}

var getSettings = function() {
  setTimeAjax('/settings/get-settings');
}

var setTimeAjax = function(url) {
  $.ajax({
    type: 'GET',
    contentType: 'application/json; charset=utf-8',
    url: url,
    dataType: 'json'
  }).done(function(data){
    $('#from').val(data.time.gte)
    $('#to').val(data.time.lte)
  });
}
