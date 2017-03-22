var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'useranalysis'
    },
    port: 4000,
    // db: 'mysql://root:123456@localhost/useranalysis-development?user=root&password=123456',
    db: {
      database: 'useranalysis-development',
      username: 'root',
      password: '123456',
      options: {
        host: 'localhost',
        dialect: 'mysql',
        pool: {
          max: 5,
          min: 0,
          idle: 10000
        },
        define: {
          timestamps: false // education db doesn't use timestamps
        },
        timezone: '+8:00',
        logging: true
      }
    },
    prefix: 'https://www.mynereus.com'
  },

  test: {
    root: rootPath,
    app: {
      name: 'useranalysis'
    },
    port: process.env.PORT || 3000,
    db: 'mysql://localhost/useranalysis-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'useranalysis'
    },
    port: process.env.PORT || 3000,
    db: 'mysql://localhost/useranalysis-production'
  }
};

module.exports = config[env];
