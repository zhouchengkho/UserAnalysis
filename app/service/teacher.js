/**
 * Created by zhoucheng on 2/19/17.
 */
var db = require('../models/index');
var async = require('async');
var scoreGetter = require('./scoregetter');
var query = require('./query')

function Teacher() {
  function getMyClasses(teacherId, callback) {
    db.Class.findAll({where: {userId: teacherId}, include: [db.Course]}).then(function(result) {
      callback(null, result)
    }).catch(function(err) {
      callback(err)
    })
  }

  function getClassStudents(teacherId, classId, callback) {
    db.sequelize.transaction(function(t) {
      return db.Class.findAll({where: {userId: teacherId, classId: classId}, include: [db.Course]})
    }).then(function(result) {
      console.log('???')
      // console.log(JSON.stringify(result))
      return db.StudentClass.findAll({where: {classId: result[0].classId}, include: [db.User]})
    }).then(function(result) {
      // console.log(JSON.stringify(result))
      callback(null, result)
    }).catch(function(err) {
      callback(err)
    })
  }



  function sortScoreFilter(filter) {
    for (var i = 0; i < filter.length; i++) {
      for(var j = i + 1; j < filter.length; j++) {
        if(filter[j].overflow < filter[i].overallScore) {
          var temp = filter[i];
          filter[i] = filter[j];
          filter[j] = temp;
        }
      }
    }
  }

  function filterBadScores(classId, callback) {
    scoreGetter.getClassBadScores(classId, function(err, data) {
      callback(err, data)
    })


  }

  this.getData = function(teacherId, callback) {
    var data = [];
    // get classes
    getMyClasses(teacherId, function(err, classes) {
      if(err)
        callback(err)
      else {
          // every class, get students
        async.eachSeries(classes, function(aClass, done) {
          db.StudentClass.findAll({where: {classId: aClass.classId}, include: [db.User]}).then(function(result) {
            var classInfo = {};
            classInfo.studentCount = result.length;
            classInfo.classInfo = aClass;
            // students data in this class
            classInfo.data = result;
            // data.push(classInfo)
            // done();

            filterBadScores(aClass.classId, function(err, filter) {
              classInfo.badScoreFilter = filter;
              data.push(classInfo);
              done();
            })
          }).catch(function(err) {
            console.log('error?')
            console.log(err)
            callback(err)
          })
        }, function done() {
          // console.log(JSON.stringify(data));
          callback(null, {classCount: data.length, data: JSON.parse(JSON.stringify(data))})
        })
      }
    })
  }


  this.getClassDetail = function(classId, callback) {
    scoreGetter.getClassBadScores(classId, function(err, result) {
      callback(err, result)
    })
  }


}

module.exports = new Teacher();
