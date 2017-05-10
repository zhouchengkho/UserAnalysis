var auth = {
  isAuthenticated: function(req, res, next) {
    if(req.session.login)
      return next()
    else
      return res.redirect('/login')
  },
  isCounsellor: function(req, res, next) {
    if(req.session.login.character == 'counsellor')
      return next();
    else {
      return res.end({
        status: 401,
        message: 'user not counsellor'
      })
    }
  }
}


module.exports = auth;
