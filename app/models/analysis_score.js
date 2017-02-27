/**
 * Created by zhoucheng on 2/20/17.
 */
module.exports = function (sequelize, DataTypes) {

  var AnalysisScore = sequelize.define('AnalysisScore', {
      userId: { type: DataTypes.STRING, primaryKey: true, notNull: true },
      classId: {type: DataTypes.STRING, primaryKey: true, notNull: true},
      overallScore: { type: DataTypes.DOUBLE, notNull: true },
      activityScore: { type: DataTypes.DOUBLE, notNull: true },
      socialScore: { type: DataTypes.DOUBLE, notNull: true },
      homeworkScore: { type: DataTypes.DOUBLE, notNull: true },
      dormScore: { type: DataTypes.DOUBLE, notNull: true },
      summary: { type: DataTypes.TEXT, notNull: true }
      // updatedAt: { type: DataTypes.TIMESTAMP, notNull: true }
    },
    {
      classMethods: {
        associate: function (models) {
          // example on how to add relations
          AnalysisScore.belongsTo(models.User, {foreignKey: 'userId'})
          AnalysisScore.belongsTo(models.Class, {foreignKey: 'classId'})
        }
      },
      freezeTableName: true,
      tableName: 'analysis_score'
    });

  return AnalysisScore;
};

