/**
 * Created by zhoucheng on 1/29/17.
 */
module.exports = function (sequelize, DataTypes) {

  var Status = sequelize.define('Status', {
      statusId: { type: DataTypes.INTEGER, primaryKey: true, notNull: true, autoIncrement: true },
      userId: { type: DataTypes.STRING, notNull: true },
      content: { type: DataTypes.STRING, notNull: true },
      time: { type: DataTypes.DATE, notNull: true},
      type: { type: DataTypes.STRING(3), notNull: true}
    },
    {
      classMethods: {
        associate: function (models) {
          // example on how to add relations
          Status.hasMany(models.StatusReply, {foreignKey: 'statusId', sourceKey: 'statusId'})
        }
      },
      freezeTableName: true,
      tableName: 'status'
    });

  return Status;
};

