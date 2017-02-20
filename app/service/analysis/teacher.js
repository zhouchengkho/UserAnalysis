/**
 * Created by zhoucheng on 2/19/17.
 */
var db = require('../../models/index');
var async = require('async');
var score = require('./score');
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


  this.getClassStu = function(teacherId, classId, callback) {
    db.sequelize.transaction(function(t) {
      return db.Class.findAll({where: {userId: teacherId, classId: classId}, include: [db.Course]})
    }).then(function(result) {
      return db.StudentClass.findAll({where: {classId: result[0].classId}, include: [db.User]})
    }).then(function(result) {
      callback(null, result)
    }).catch(function(err) {
      callback(err)
    })
    //   db.Class.findAll({where: {userId: teacherId, classId: classId}, include: [db.Course]}).then(function(result) {
    //   callback(null, result)
    // }).catch(function(err) {
    //   callback(err)
    // })
  }
  function replaceMin(scorer, scorerArr) {

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

  function filterBadScores(teacherId, classId, callback) {
    var filter = [];
    var badScores = [];
    // getClassStudents(teacherId, classId, function(err, result) {
    //   for(var i in result[0]) {
    //   }
    // })
    getClassStudents(teacherId, classId, function(err, students) {
      console.log('filter')
      async.eachSeries(students, function(student, done) {
        var userId = student.User.userId;
        score.getOverallScore(userId, function(result) {
          filter.push({userId: userId, score: result.overallScore, userName: student.User.userName})
          done()
        })
      }, function done() {
        // if class has more than 20 students, filter bad scorers
        if (filter.length > 20) {
          console.log('filter 3')
          sortScoreFilter(filter)
          callback(null, [filter[0], filter[1], filter[2]])
        } else {
          callback(null, [])
        }
      })
    });

  }

  this.getData = function(teacherId, callback) {
    var data = [];
    getMyClasses(teacherId, function(err, classes) {
      if(err)
        callback(err)
      else {
        async.eachSeries(classes, function(aClass, done) {
          console.log('yo')
          db.StudentClass.findAll({where: {classId: aClass.classId}, include: [db.User]}).then(function(result) {
            var classInfo = {};
            classInfo.studentCount = result.length;
            classInfo.classInfo = aClass;
            classInfo.data = result;
            console.log('aaa');
            filterBadScores(teacherId, aClass.classId, function(err, filter) {
              classInfo.badScoreFilter = filter;
              data.push(classInfo);
              console.log('aaaaaaaa')
              done();
            })
          }).catch(function(err) {
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
