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
    setActive('#last-semester');
    setTimeAjax('/settings/time/get-last-semester');
  })

  $('#college-career').on('click', function() {
    setActive('#college-career');
    setTimeAjax('/settings/time/get-college-career');
  })

  $('#this-semester').on('click', function() {
    setActive('#this-semester');
    setTimeAjax('/settings/time/get-this-semester');
  })

  $('#academic-year').on('click', function() {
    setActive('#academic-year');
    setTimeAjax('/settings/time/get-academic-year');
  })




})

function setActive(cssSelector) {
  var elements = ['#last-semester', '#this-semester', '#academic-year', '#college-career'];
  elements.forEach(function(ele) {
    $(ele).removeClass('active');
  });
  $(cssSelector).addClass('active');
}

function updateSettings() {
  var from = $('#from').val();
  var to = $('#to').val();

  var timePeriod = $('.btn.btn-default.active').attr('id');

  $.ajax({
    type: 'POST',
    contentType: 'application/json; charset=utf-8',
    url: '/settings/change-settings',
    data: JSON.stringify({timePeriod: timePeriod}),
    dataType: 'json'
  }).done(function(res){
    if(res.status === 1)
      location.replace('/')
    else {
      alert('setting change failed')
    }
  });
}

function getSettings() {
  setTimeAjax('/settings/get-settings');
}

function setTimeAjax(url) {
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
