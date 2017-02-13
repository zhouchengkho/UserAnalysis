/**
 * Created by zhoucheng on 2/13/17.
 */
module.exports = function (sequelize, DataTypes) {

  var Course =  sequelize.define('Course', {
      courseId: { type: DataTypes.STRING(16), primaryKey: true, notNull: true },
      courseName: { type: DataTypes.STRING(30), notNull: true },
      courseCredit: { type: DataTypes.DOUBLE, notNull: true },
      courseWeekTime: { type: DataTypes.DOUBLE, notNull: true},
      courseStatus: { type: DataTypes.INTEGER, notNull: true}
    },
    {
      classMethods: {
        associate: function (models) {
          // example on how to add relations
          Course.hasMany(models.Class, {foreignKey: 'courseId'})
        }
      },
      freezeTableName: true,
      tableName: 'course'
    });

  return Course;

};

