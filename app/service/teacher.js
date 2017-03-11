/**
 * Created by zhoucheng on 2/19/17.
 */
var db = require('../models/index');
var async = require('async');
var query = require('./query')
var prefix = require('../../config/config').prefix;
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
      teacherInfo.userId = result.userId;
      teacherInfo.userName = result.userName;
      teacherInfo.faceIcon = prefix + result.faceIcon;
      // get classes
      query.getTeacherClasses(teacherId, function(err, classes) {
        if(err)
          return callback(err)
        // every class, get students

        async.eachSeries(classes, function(aClass, done) {
          db.StudentClass.findAll({where: {classId: aClass.classId}, include: [db.User]}).then(function(result) {
            var classInfo = {};
            classInfo.studentCount = result.length;
            classInfo.classInfo = aClass;
            // students data in this class
            classInfo.data = result;
            data.push(classInfo)
            done();


          }).catch(function(err) {
            console.log(err)
            callback(err)
          })
        }, function done() {
          // console.log(JSON.stringify(data));
          callback(null, {classCount: data.length, teacherInfo: teacherInfo, data: JSON.parse(JSON.stringify(data))})
        })
      })

    })
  }



}

module.exports = new Teacher();
