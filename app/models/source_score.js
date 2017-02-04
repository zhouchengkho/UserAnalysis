/**
 * Created by zhoucheng on 2/4/17.
 */
module.exports = function (sequelize, DataTypes) {

  var SourceScore = sequelize.define('SourceScore', {
      sourceId: { type: DataTypes.INTEGER, primaryKey: true, notNull: true },
      userId: { type: DataTypes.STRING, primaryKey: true, notNull: true },
      score: { type: DataTypes.INTEGER, notNull: true}
    },
    {
      classMethods: {
        associate: function (models) {
          // example on how to add relations
        }
      },
      freezeTableName: true,
      tableName: 'source_score'
    });

  return SourceScore;
};
