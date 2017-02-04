/**
 * Created by zhoucheng on 1/31/17.
 */
module.exports = function (sequelize, DataTypes) {

  var TopicReply = sequelize.define('TopicReply', {
      replyId: { type: DataTypes.INTEGER, primaryKey: true, notNull: true, autoIncrement: true },
      topicId: { type: DataTypes.INTEGER, notNull: true },
      fromId: { type: DataTypes.STRING(12), notNull: true },
      toId: { type: DataTypes.STRING(12), notNull: true },
      content: { type: DataTypes.TEXT, notNull: true},
      time: { type: DataTypes.DATE, notNull: true}
    },
    {
      classMethods: {
        associate: function (models) {
          // example on how to add relations
        }
      },
      freezeTableName: true,
      tableName: 'topicreply'
    });

  return TopicReply;
};

