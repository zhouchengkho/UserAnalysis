/**
 * Created by zhoucheng on 1/3/17.
 */

var db = require('../models');
var refer = require('./reference');
var query = require('./query');
var md5 = require('md5');
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
    query.login(req.body.userId, function(err, user) {
      console.log(err)
      console.log(user)
      if(err) {
        callback(err, {
          status: 500,
          message: 'Database Connection Error'
        })
      }
      else if(user) {
        if(user.psd == getEncryptPassword(req.body.psd)) {
          // console.log(JSON.stringify(users));
          var character;
          switch (user.isTeacher) {
            case 0 || '0':
              character = 'student';
              break;
            case 1 || '1':
              character = 'teacher';
              break;
            case 2 || '2':
              character = 'counsellor';
              break;
            default:
              character = 'student';
              break;
          }
          req.session.login = {
            userId: user.userId,
            userName: user.userName,
            character: character,
            settings: {
              // time: refer.getTimePeriod('academic-year'),
              timePeriod: 'academic-year'
              // terms: terms
            }
          };
          console.log(req.session)
          req.session.save();
          callback(null, {
            status: 200,
            message: 'success'
          })
        } else {
          callback(null, {
            status: 401,
            message: 'Wrong Password'
          })
        }
      }
      else {
        callback(null, {
          status: 401,
          message: 'User not exist'
        })
      }
    })

    // db.User.findAll({
    //   where: {
    //     userId: req.body.userId
    //   },
    //   raw: true
    // }).then(function(users) {
    //   if(users && users[0].psd == getEncryptPassword(req.body.psd)) {
    //     // console.log(JSON.stringify(users));
    //     var character;
    //     switch (users[0].isTeacher) {
    //       case 0 || '0':
    //         character = 'student';
    //             break;
    //       case 1 || '1':
    //         character = 'teacher';
    //             break;
    //       case 2 || '2':
    //         character = 'counsellor';
    //             break;
    //       default:
    //         character = 'student';
    //             break;
    //     }
    //     req.session.login = {
    //       userId: users[0].userId,
    //       userName: users[0].userName,
    //       character: character,
    //       settings: {
    //         // time: refer.getTimePeriod('academic-year'),
    //         timePeriod: 'academic-year'
    //         // terms: terms
    //       }
    //     };
    //     console.log(req.session)
    //     req.session.save();
    //     callback(null, true)
    //   }
    //   else
    //     callback(null, false)
    // }).catch(function(err) {
    //   callback(err)
    // })
  };

  /**
   * should encrypt password here
   *
   * @param password
   * @returns {*}
   */
  function getEncryptPassword(password) {

    return md5(password);
  }

}




module.exports = new Login();
