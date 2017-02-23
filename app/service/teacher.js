/**
 * Created by zhoucheng on 2/19/17.
 */
var db = require('../models/index');
var async = require('async');
var scoreGetter = require('./scoregetter');
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
    var filter = [];
    var badScores = [];
    // getClassStudents(teacherId, classId, function(err, result) {
    //   for(var i in result[0]) {
    //   }
    // })
    // getClassStudents(teacherId, classId, function(err, students) {
    //   console.log('filter')
    //   async.eachSeries(students, function(student, done) {
    //     var userId = student.User.userId;
    //     score.getClassScore(userId, classId, function(err, result) {
    //       console.log('err');
    //       console.log(err)
    //       console.log(result);
    //       if(err)
    //         return callback(err)
    //       filter.push({userId: userId, score: result.overallScore, userName: student.User.userName})
    //       done()
    //     })
    //   }, function done() {
    //     // if class has more than 20 students, filter bad scorers
    //     if (filter.length > 20) {
    //       console.log('filter 3')
    //       sortScoreFilter(filter)
    //       callback(null, [filter[0], filter[1], filter[2]])
    //     } else {
    //       callback(null, [])
    //     }
    //   })
    // });

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
            console.log('what the fuck is goin on')
            filterBadScores(aClass.classId, function(err, filter) {
              console.log('????')
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
          console.log('fuck shut up bitch')
          console.log(JSON.stringify(data));
          callback(null, {classCount: data.length, data: JSON.parse(JSON.stringify(data))})
        })
      }
    })
  }


}

module.exports = new Teacher();
