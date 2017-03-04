/**
 * Created by zhoucheng on 3/2/17.
 */
module.exports = function (sequelize, DataTypes) {

  var Dorm = sequelize.define('Dorm', {
      userId: { type: DataTypes.STRING, primaryKey: true, noNull: true },
      dormId: { type: DataTypes.STRING, primaryKey: true, notNull: true },
      enrollYear: { type: DataTypes.STRING(4)}
    },
    {
      classMethods: {
        associate: function (models) {
          // example on how to add relations
          Dorm.hasMany(models.User, {foreignKey: 'userId'})
        }
      },
      freezeTableName: true,
      tableName: 'dorm'
    });

  return Dorm;
};

