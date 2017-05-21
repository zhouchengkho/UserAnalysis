/**
 * Created by zhoucheng on 5/21/17.
 */
var query = require('./query');
var statistics = {
  /**
   *
   * @param callback
   *
   * {
   *  "status": 200,
   *  "data":
   *  [
                          {
                            name: '用户',
                            count: userCount
                          },
                          {
                            name: '课程',
                            count: courseCount
                          },
                          {
                            name: '主题',
                            count: topicCount
                          },
                          {
                            name: '资源',
                            count: sourceCount
                          },
                          {
                            name: '作业',
                            count: assignmentCount
                          }
                        ]
   *
   *
   * }
   */
  getSummary: function(callback) {
    query.getUserCount(function(err, userCount) {
      if(err) {
        return callback(err)
      } else {
        query.getCourseCount(function(err, courseCount) {
          if(err) {
            return callback(err)
          } else {
            query.getTopicCount(function(err, topicCount) {
              if(err) {
                return callback(err)
              } else {
                query.getSourceCount(function(err, sourceCount) {
                  if(err) {
                    return callback(err)
                  } else {
                    query.getAssignmentCount(function(err, assignmentCount) {
                      if(err) {
                        return callback(err)
                      } else {
                        return callback(null, [
                          {
                            name: '用户',
                            count: userCount
                          },
                          {
                            name: '课程',
                            count: courseCount
                          },
                          {
                            name: '主题',
                            count: topicCount
                          },
                          {
                            name: '资源',
                            count: sourceCount
                          },
                          {
                            name: '作业',
                            count: assignmentCount
                          }
                        ]
                        )
                      }
                    })
                  }
                })
              }
            })
          }
        })
      }
    })
  },
  /**
   *
   * @param callback
   *
   * {
   *  "status": 200,
   *  "data": {
   *    "single": [
   *      {
   *        "userId": "",
   *        "nickName": "",
   *        "courseName": ""
   *        "activity": ""
   *      },
   *      {
   *        "userId": "",
   *        "nickName": "",
   *        "activity": ""
   *      },
   *      ...
   *    ],
   *    "overall": [
   *      {
   *        "userId": "",
   *        "nickName": "",
   *        "experience": ""
   *      },
   *      {
   *        ...
   *      }
   *    ]
   *  }
   * }
   */
  getRank: function(callback) {
    var limit = 5;
    query.getOverallStudentRank(limit, function(err, overallRank) {
      if(err) {
        return callback(err)
      } else {
         query.getSingleStudentsRank(limit, function(err, singleRank) {
           if(err) {
             return callback(err)
           } else {
             callback(null, {
               single: singleRank,
               overall: overallRank
             })
           }
         })
        }
    })

  }
}



module.exports = statistics;
