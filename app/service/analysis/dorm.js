/**
 * Created by zhoucheng on 1/20/17.
 */

var query = require('../query');
function Dorm() {

  this.getClassStudentExp = function(classId, userId, callback) {
    callback(null, Math.random() * 10);
  }




}

module.exports = new Dorm();
