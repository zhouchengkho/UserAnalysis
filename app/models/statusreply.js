/**
 * Created by zhoucheng on 3/11/17.
 */
module.exports = function (sequelize, DataTypes) {

  var StatusReply = sequelize.define('StatusReply', {
      replyId: { type: DataTypes.INTEGER, primaryKey: true, notNull: true, autoIncrement: true },
      statusId: { type: DataTypes.INTEGER, notNull: true },
      fromId: { type: DataTypes.STRING, notNull: true },
      toId: { type: DataTypes.STRING, notNull: true},
      content: { type: DataTypes.STRING, notNull: true},
      time: { type: DataTypes.DATE, notNull: true}
    },
    {
      classMethods: {
        associate: function (models) {
          // example on how to add relations
          StatusReply.belongsTo(models.Status, {foreignKey: 'statusId', targetKey: 'statusId'})
        }
      },
      freezeTableName: true,
      tableName: 'statusreply'
    });

  return StatusReply;
};
