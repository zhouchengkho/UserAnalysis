/**
 * Created by zhoucheng on 5/21/17.
 */
module.exports = function (sequelize, DataTypes) {

  return sequelize.define('Topic', {
      topicId: { type: DataTypes.INTEGER, primaryKey: true, notNull: true, autoIncrement: true },
      userId: { type: DataTypes.STRING(12), notNull: true },
      classId: { type: DataTypes.STRING(20), notNull: true },
      title: { type: DataTypes.STRING(100), notNull: true },
      content: { type: DataTypes.TEXT, notNull: true},
      releaseTime: { type: DataTypes.DATE, notNull: true},
      solveTime: { type: DataTypes.DATE, defaultValue: null },
      kickCount: {type: DataTypes.INTEGER },
      isSolved: {type: DataTypes.BOOLEAN, notNull: true},
      type: { type: DataTypes.INTEGER, notNull: true}
    },
    {
      classMethods: {
        associate: function (models) {
          // example on how to add relations
        }
      },
      freezeTableName: true,
      tableName: 'topic'
    });

};
