var query = require('./query');
var exp = require('./exp');
var helper = require('./helper');
function Summary() {

  /**
   * getSummary
   * replace certain words & generate a summary
   * @param userId
   * @param callback
   */
  this.getSummary = function(userId, callback) {
    callback(null, 'You are doing great');
  }

  /**
   *
   * @param classId
   * @param userId
   * @param callback
   *
   * 你本门课的经验值是{{2.86}}，全班排名{{30%}}\n
   * 活跃度经验值{{}}，贡献{{}}\n
   * 社交经验值{{}}，贡献{{}}\n
   * 作业经验值{{}}，贡献{{}}
   */
  this.getClassStudentSummary = function(classId, userId, callback) {
    var summary = '<p>本门课的经验值是';
    exp.getComputedClassStudentExp(classId, userId, function(err, expData) {
      query.getClassStudentRanking(classId, userId, function(err, rankData) {
        summary += expData.exp;
        summary = summary + '，全班排名第' + rankData.rank + '</p>';
        var activityContribution = helper.fixToTwo((expData.activityExp / expData.exp)  * 100 / 3);
        var homeworkConttribution = helper.fixToTwo((expData.homeworkExp / expData.exp ) * 100 / 3);
        var socialContribution = helper.fixToTwo((expData.socialExp / expData.exp) * 100 / 3);
        summary += '<p>活跃度经验值' + expData.activityExp + '，贡献' + activityContribution + '%</p>';
        summary += '<p>社交经验值' + expData.socialExp + '，贡献' + socialContribution + '%</p>';
        summary += '<p>作业经验值' + expData.homeworkExp + '，贡献' + homeworkConttribution + '%</p>';
        callback(err, summary)
      })
    })

    // callback(null, 'this is class student summary');
  }

  /**
   *
   * @param userId
   * @param callback
   *
   * 你上了 {{total}} 门课\n
   * {{courseName}} 经验值 {{exp}}
   *
   */
  this.getStudentSummary = function(userId, callback) {
    query.getStudentClassesDetail(userId, function(err, result) {
    })
    callback(null, 'This is student overall summary');
  }
}

module.exports = new Summary();


