/**
 * Created by zhoucheng on 1/4/17.
 */
module.exports = function (sequelize, DataTypes) {

  var Friend = sequelize.define('Friend', {
      userId: { type: DataTypes.STRING, primaryKey: true },
      friendId: { type: DataTypes.STRING, primaryKey: true }
    },
    {
      classMethods: {
        associate: function (models) {
          // example on how to add relations
          Friend.belongsTo(models.User, {foreignKey: 'friendId'});
        }
      },
      freezeTableName: true,
      tableName: 'friend'
    });

  return Friend;
};

