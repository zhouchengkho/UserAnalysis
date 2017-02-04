/**
 * Created by zhoucheng on 2/4/17.
 */
module.exports = function (sequelize, DataTypes) {

  var Class =  sequelize.define('Class', {
      classId: { type: DataTypes.STRING(20), primaryKey: true, notNull: true },
      courseId: { type: DataTypes.STRING(16), notNull: true },
      userId: { type: DataTypes.STRING(12), notNull: true },
      termId: { type: DataTypes.INTEGER(2), notNull: true },
      classStatus: { type: DataTypes.INTEGER(1), notNull: true}
    },
    {
      classMethods: {
        associate: function (models) {
          // example on how to add relations
          Class.hasMany(models.StudentClass, {foreignkey: 'classId'})
        }
      },
      freezeTableName: true,
      tableName: 'class'
    });

  return Class;

};

