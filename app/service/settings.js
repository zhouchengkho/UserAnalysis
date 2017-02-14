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
      var timePeriod = req.body.timePeriod;
      req.session.login.settings.timePeriod = timePeriod;
      req.session.login.settings.time = ref.getTimePeriod(timePeriod, req.session.login.userId);
      callback(null, true)
    } catch(err) {
      callback(err)
    }
  }

}




module.exports = new Settings();
