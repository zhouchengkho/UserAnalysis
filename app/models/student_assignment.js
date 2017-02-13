/**
 * Created by zhoucheng on 2/4/17.
 */
module.exports = function (sequelize, DataTypes) {

  var StudentAssignment = sequelize.define('StudentAssignment', {
      userId: { type: DataTypes.INTEGER, primaryKey: true, notNull: true },
      assignmentId: { type: DataTypes.INTEGER, primaryKey: true, notNull: true },
      time: { type: DataTypes.DATE, notNull: true},
      count: { type: DataTypes.INTEGER, notNull: true },
      filePath: { type: DataTypes.STRING(100), notNull: true }
    },
    {
      classMethods: {
        associate: function (models) {
          // example on how to add relations
          StudentAssignment.belongsTo(models.Assignment, {foreignKey: 'assignmentId'})

        }
      },
      freezeTableName: true,
      tableName: 'student_assignment'
    });

  return StudentAssignment;
};

