/**
 * Created by zhoucheng on 2/4/17.
 */
module.exports = function (sequelize, DataTypes) {

  var StudentClass = sequelize.define('StudentClass', {
      userId: { type: DataTypes.STRING(12), primaryKey: true, notNull: true },
      classId: { type: DataTypes.STRING(20), primaryKey: true, notNull: true },
      exp: { type: DataTypes.FLOAT, defaultValue: null }
    },
    {
      classMethods: {
        associate: function (models) {
          // example on how to add relations
          StudentClass.belongsTo(models.Class, {foreignKey: 'classId'});
          StudentClass.belongsTo(models.User, {foreignKey: 'userId'});
          StudentClass.hasMany(models.Action, {foreignKey: 'userId', sourceKey: 'userId'});
        }
      },
      freezeTableName: true,
      tableName: 'student_class'
    });

  return StudentClass;
};
