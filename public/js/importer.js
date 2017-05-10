/**
 * Created by zhoucheng on 5/10/17.
 */
$(document).ready(function() {

  var csvData = null;
  function read(evt) {
    var files = evt.target.files; // FileList object
    var file = files[0];
    upload(file);

    }
  function upload(file) {
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function (event) {
      var csv = event.target.result;
      cleanData($.csv.toObjects(csv), function(err, data) {
        if(err) {
          $.toaster({priority: 'danger', title: 'Error', message: err.message});
        } else {
          csvData = data;
          $.toaster({priority: 'success', title: 'Success', message: '点击导入开始上传'});
        }
        // if(err) {
        //   alert(err.message)
        // } else {
        //   // ajax upload here
        //   ajaxUpload(data);
        // }
      });

    }

    reader.onerror = function () {
      alert('Unable to read ' + file.fileName);
    };
  }

  function cleanData(data, callback) {
    var heads = data[0];
    if(!heads['入学年份'])
      return callback(new Error('请加入入学年份'))
    if(!heads['学号'])
      return callback(new Error('请加入学号'))
    if(!heads['宿舍号'])
      return callback(new Error('请加入宿舍号'))

    var result = [];
    for(var i in data) {
      if(data[i]['学号']) {
        var temp = {
          userId: data[i]['学号'],
          dormId: getFormattedDorm(data[i]['宿舍号']),
          enrollYear: data[i]['入学年份']
        }
        result.push(temp);
      }
    }
    callback(null, result);
  }

  function ajaxUpload(data) {
    var options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      url: '/analysis/import-dorm-data',
      data: JSON.stringify(data)
    }
    $.ajax(options).done(function(res){
      console.log(res)
    });
  }

  /**
   *
   * @param dorm {string}
   */
  function getFormattedDorm(dorm) {
    // remove dash
    dorm = dorm.replace('-', '');
    // append 0
    if(dorm[0] != '1' && dorm[0] != '0')
      dorm = '0' + dorm
    return dorm;
  }

  $('#dorm-file').bind('change', read);

  $('#import').on('click', function() {
    if(!csvData) {
      $.toaster({priority: 'danger', title: 'Error', message: '请先选择文件'});
    } else {
      alert(csvData)
      ajaxUpload(csvData);
    }
  })
})
