/**
 * Created by zhoucheng on 2/13/17.
 */
module.exports = function (sequelize, DataTypes) {

  var Assignment = sequelize.define('Assignment', {
      assignmentId: { type: DataTypes.INTEGER, primaryKey: true, notNull: true },
      classId: { type: DataTypes.STRING(20), notNull: true},
      title: { type: DataTypes.STRING(100), notNull: true },
      content: { type: DataTypes.TEXT, notNull: true },
      startDate: { type: DataTypes.DATE, notNull: true},
      endDate: { type: DataTypes.DATE, notNull: true},
      needSubmit: { type: DataTypes.INTEGER, notNull: true},
      submitCount: { type: DataTypes.INTEGER(3), notNull: true},
      answer: { type: DataTypes.STRING(100), notNull: true}
    },
    {
      classMethods: {
        associate: function (models) {
          // example on how to add relations
          Assignment.hasMany(models.StudentAssignment, {foreignKey: 'assignmentId'})

        }
      },
      freezeTableName: true,
      tableName: 'assignment'
    });

  return Assignment;
};

