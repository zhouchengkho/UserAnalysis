/**
 * Created by zhoucheng on 2/19/17.
 */
var db = require('../models/index');
var async = require('async');
var query = require('./query');
var exp = require('./exp');
// var prefix = require('../../config/config').prefix;
function Teacher() {

  /**
   *
   * @param teacherId
   * @param callback
   *
   * {
   *  "classCount": "7",
   *  "teacherInfo":
   *    {
   *      "userName": "wang li ping",
   *      "faceIcon": ""
   *    },
   *    "data":
   *      [
   *        {
   *          "studentCount": 50,
   *          "classInfo":
   *            {
   *             "classId": "",
   *             "courseId": "",
   *             "userId": "",
   *             "termId": "",
   *              "Term": {
   *                "termName": ""
   *              },
   *             "classStatus": "",
   *             "Course":
   *                {
   *                  "courseId": "",
   *                  "courseName": "",
   *                  "courseCredit": "",
   *                  "courseWeekTime": "",
   *                  "courseStatus": ""
   *                }
   *             }
   *         }
   *       ]
   * }
   */
  this.getData = function(teacherId, callback) {
    var teacherInfo = {};
    var data = [];
    // get teacherInfo
    query.getUserInfo(teacherId, function(err, result) {
      teacherInfo = result;
      // teacherInfo.faceIcon = prefix + result.faceIcon;
      // get classes
      query.getTeacherClasses(teacherId, function(err, classes) {
        if(err)
          return callback(err)
        // every class, get students

        async.eachSeries(classes, function(aClass, done) {
          db.Class.findAll({where: {classId: aClass.classId}, include: [db.Course, db.Term], order: 'Term.termId asc'}).then(function(result) {
            data.push(result[0])
            done()
          }).catch(function(err) {callback(err)})
          // db.StudentClass.findAll({where: {classId: aClass.classId}, include:
          //   [
          //     {
          //       model: db.Class,
          //       include: [db.Term]
          //     }]}).then(function(result) {
          //   var classInfo = {};
          //   classInfo.studentCount = result.length;
          //   classInfo.classInfo = aClass;
          //   // students data in this class
          //   classInfo.data = result;
          //   data.push(classInfo)
          //   done();
          //
          //
          // }).catch(function(err) {
          //   console.log(err)
          //   callback(err)
          // })
        }, function done() {
          // console.log(JSON.stringify(data));
          callback(null, {classCount: data.length, teacherInfo: teacherInfo, data: JSON.parse(JSON.stringify(data))})
        })
      })

    })
  }

  this.getClassExpData = function(classId, callback) {
    query.getClassStudentsExp(classId, function(err, result) {
      if(err)
        return callback(err)
      if(!result[0].activity) {
        exp.computeAndFillClassExp(classId, function(err) {
          if(err)
            return callback(err)
          else {
            query.getClassStudentsExp(classId, function(err, result) {
              callback(null, result)
            })
          }
        })
      } else {
        return callback(null, result)
      }
    })
  }

  this.getClassExpNoPPTData = function(classId, callback) {
    query.getClassStudentsExp(classId, function(err, result) {
      if(err)
        return callback(err)
      if(!result[0].activity) {
        exp.computeAndFillClassExp(classId, function(err) {
          if(err)
            return callback(err)
          else {
            query.getClassStudentsNoPPTExp(classId, function(err, result) {
              callback(err, result)
            })
          }
        })
      } else {
        query.getClassStudentsNoPPTExp(classId, function(err, result) {
          callback(err, result)
        })      }
    })
  }

  /**
   *
   * @param classId
   * @param callback
   */
  this.getClassNeedMoreEnergyStudents = function(classId, callback) {
    function filter(result, avg1, avg2) {
      var data = [];
      for(var i in result) {

        var count = 0 + Number(result[i].homeworkCount) + Number(result[i].pptCount);
        var avg = 0 + Number(avg1) + Number(avg2);
        console.log(count)
        console.log(avg)
        if(count < 0.7 * avg) {
          data.push(result[i])
        }
      }
      console.log(data)
      return data;
    }
    query.getClassStudentsExp(classId, function(err, result) {
      if(err)
        return callback(err)
      if(!result[0].activity) {
        exp.computeAndFillClassExp(classId, function(err) {
          if(err)
            return callback(err)
          else {
            query.getClassStudentsHomeworkAndPPTGroup(classId, function(err, result) {
              query.getClassActionCountAvg(classId, [201, 202, 203], function(err, homeworkAvg) {
                query.getClassActionCountAvg(classId, [301], function(err, pptAvg) {

                  callback(err, filter(result, homeworkAvg, pptAvg))
                })
              })
            })
          }
        })
      } else {
        query.getClassStudentsHomeworkAndPPTGroup(classId, function(err, result) {
          query.getClassActionCountAvg(classId, [201, 202, 203], function(err, homeworkAvg) {
            query.getClassActionCountAvg(classId, [301], function(err, pptAvg) {
              callback(err, filter(result, homeworkAvg, pptAvg))
            })
          })
        })

      }
    })
  }



}

module.exports = new Teacher();
