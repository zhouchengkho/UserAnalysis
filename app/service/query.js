/**
 * Created by zhoucheng on 2/4/17.
 */
function Query() {
  /**
   * Traverse val to fill where clause
   * main purpose is to remove null key
   * @param val JSON
   */
  this.genWhereQuery = function(val) {
    var result = {where: {}};
    for(var key in val) {
      if(val[key])
        result.where[key] = val[key]
    }
    return result;
  }

  /**
   *
   * @param userId
   * @param callback
   * result format: Array
   * ['classId', 'classId' ...]
   */
  this.getStudentClasses = function(userId) {
    return new Promise(function(resolve, reject) {
      db.StudentClass.findAll({where: {userId: userId}}).then(function(result) {
        var data = [];
        for(var index in result)
          data.push(result[index].classId)
        resolve(data)
      }).catch(function(err) {reject(err)})
    })
  }

  /**
   * according to current date, get formatted text like '2016-2017学年第一学期'
   * then find correspondent termId
   * if not find, return latest two terms
   */
  this.getCurrentTerm = function() {

  }
}

module.exports = new Query();
