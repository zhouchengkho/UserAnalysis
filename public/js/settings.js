/**
 * Created by zhoucheng on 2/6/17.
 */


$(document).ready(function() {
  // getSettings();

  // $('#from').datetimepicker({format: 'yyyy-mm-dd mm:ss'});

  // $('#to').datetimepicker({format: 'yyyy-mm-dd mm:ss'});

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


  $('#cancel').on('click', function() {
    location.href = '/';
  })

  $('.all-terms').on('click', function() {
    var self = $(this);
    $('.setting-terms[id=' + self.attr('id')+ ']').remove();
    $('.current-terms:last').append(genSettingTerm(self.attr('id'), self.text()))

    // if(self.hasClass('active')) {
    //   $('.setting-terms[id=' + self.attr('id')+ ']').remove();
    // } else {
    //   $('.current-terms:last').append(genSettingTerm(self.attr('id'), self.text()))
    // }
    // self.toggleClass('active')
  })



})

// $(document).on('click', '.setting-terms', function()
// {
//   // alert('removing')
//   $(this).remove()
// })

function genSettingTerm(id, val) {
  return '<button type="button" class="btn btn-default col-sm-6 setting-terms" id=\"' + id + '\">' + val + '</button>'
}

function setActive(cssSelector) {
  var elements = ['#last-semester', '#this-semester', '#academic-year', '#college-career'];
  elements.forEach(function(ele) {
    $(ele).removeClass('active');
  });
  $(cssSelector).addClass('active');
}

function updateSettings() {
  // var from = $('#from').val();
  // var to = $('#to').val();

  var timePeriod = $('.btn.btn-default.active').attr('id');

  $.ajax({
    type: 'POST',
    contentType: 'application/json; charset=utf-8',
    url: '/settings/change-settings',
    data: JSON.stringify({timePeriod: timePeriod, terms: getNewTerms()}),
    dataType: 'json'
  }).done(function(res){
    if(res.status === 1)
      location.replace('/')
    else {
      alert('setting change failed')
    }
  });
}

function getNewTerms() {
  var terms = []
  $('.setting-terms').each(function() {
    terms.push({termId: $(this).attr('id'), termName: $(this).text()})
  })
  return terms;
}

// function getSettings() {
//   setTimeAjax('/settings/get-settings');
// }

function setTimeAjax(url) {
  $.ajax({
    type: 'GET',
    contentType: 'application/json; charset=utf-8',
    url: url,
    dataType: 'json'
  }).done(function(result){
    // $('#from').val(data.time.gte)
    // $('#to').val(data.time.lte)
    var data = result.data;
    var currentTerms = $('.current-terms');
    currentTerms.empty();
    for(var i in data) {
      currentTerms.append(genSettingTerm(data[i].termId, data[i].termName))
    }
  });
}
