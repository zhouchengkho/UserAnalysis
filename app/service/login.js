/**
 * Created by zhoucheng on 1/3/17.
 */

var db = require('../models');
var refer = require('./reference');
function Login() {
  /**
   * login
   * check session first
   * if has session
   *  jump to index
   * else
   *  check login form valid
   *  if valid
   *    store session send success msg
   *  else
   *    send fail msg
   * @param req
   * @param callback
   */
  this.login = function(req, callback) {
    if(req.session.login)
      callback(true)

    db.User.findAll({
      where: {
        userId: req.body.userId,
        psd: getEncryptPassword(req.body.psd)
      }
    }).then(function(users) {
      if(users) {
        // console.log(JSON.stringify(users));
        req.session.login = {
          userId: users[0].userId,
          userName: users[0].userName,
          settings: {
            time: refer.isInSpringSemester ? refer.springSemester : refer.fallSemester
          }
        };

        req.session.save();
        callback(null, true)
      }
      else
        callback(null, false)
    }).catch(function(err) {
      callback(err)
    })
  };

  /**
   * should encrypt password here
   *
   * @param password
   * @returns {*}
   */
  function getEncryptPassword(password) {
    return password;
  }

}




module.exports = new Login();
