/**
 * Created by zhoucheng on 2/6/17.
 */
var ref = require('./reference');
var moment = require('moment');
function Settings() {

  /**
   *
   * @param req
   * @param callback
   */
  this.changeSettings = function(req, callback) {
    try {
      req.session.login.settings.time = req.body.time;
      callback(null, true)
    } catch(err) {
      callback(err)
    }
  }

  /**
   *
   * @param callback
   */
  this.getLastSemesterTime = function(callback) {
    callback(null, {time: ref.isInSpringSemester ? ref.springSemester : ref.fallSemester})
  }

  this.getCollegeCareerTime = function(req, callback) {
    try {
      var enrollYear = '20' + req.session.login.userId.substring(2, 4);
      var gradYear = (Number(enrollYear) + 4).toString();
      enrollYear = moment().format(enrollYear + '-09-01 00:00:00');
      gradYear = moment().format(gradYear + '-06-30 24:00:00');
      callback(null, {time: {gte: enrollYear, lte: gradYear}});
    } catch(err) {
      callback(err)
    }

  }
}




module.exports = new Settings();
