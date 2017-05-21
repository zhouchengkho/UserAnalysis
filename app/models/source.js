/**
 * Created by zhoucheng on 5/21/17.
 */
module.exports = function (sequelize, DataTypes) {

  return sequelize.define('Source', {
      sourceId: { type: DataTypes.INTEGER, primaryKey: true, notNull: true, autoIncrement: true },
      classId: { type: DataTypes.STRING(20), notNull: true },
      userId: { type: DataTypes.STRING(12), notNull: true },
      title: { type: DataTypes.STRING(150), notNull: true },
      filePath: { type: DataTypes.STRING(150), notNull: true },
      time: { type: DataTypes.DATE, notNull: true},
      kickCount: {type: DataTypes.INTEGER , notNull: true},
      downloadCount: {type: DataTypes.INTEGER , notNull: true},
      type: { type: DataTypes.INTEGER, notNull: true},
      description: { type: DataTypes.STRING(255), notNull: true }
    },
    {
      classMethods: {
        associate: function (models) {
          // example on how to add relations
        }
      },
      freezeTableName: true,
      tableName: 'source'
    });

};
