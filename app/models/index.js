var fs = require('fs'),
  path = require('path'),
  Sequelize = require('sequelize'),
  config = require('../../config/config'),
  db = {};

var sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, config.db.options);

fs.readdirSync(__dirname).filter(function (file) {
  return (file.indexOf('.') !== 0) && (file !== 'index.js');
}).forEach(function (file) {
  var model = sequelize['import'](path.join(__dirname, file));
  db[model.name] = model;
});

Object.keys(db).forEach(function (modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

/**
 * Define upsert yourself
 */
Sequelize.Model.prototype.findCreateUpdate = function(findWhere, newValues) {
  var self = this;
  return self.findAll({
    where: findWhere
  }).then(function(result) {
    console.log(result)
    if(result[0]) {
      // do update
      return this.update(newValues, {where: findWhere})
    } else {
      // do create
      return this.create(newValues)
    }
  });
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
