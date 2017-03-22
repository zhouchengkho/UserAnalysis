module.exports = function (sequelize, DataTypes) {

  var Action = sequelize.define('Action', {
    actionId: { type: DataTypes.INTEGER, primaryKey: true, notNull: true, autoIncrement: true },
      userId: { type: DataTypes.STRING, notNull: true },
      userName: { type: DataTypes.STRING, notNull: true },
    time: { type: DataTypes.DATE, notNull: true},
    actionCode: { type: DataTypes.STRING(3), notNull: true},
    actionName: { type: DataTypes.STRING(10), notNull: true},
    objName: { type: DataTypes.STRING, notNull: true},
    classId: { type: DataTypes.STRING(20), notNull: true}
    },
    {
      classMethods: {
        associate: function (models) {
          // example on how to add relations
          Action.belongsTo(models.Class, {foreignKey: 'classId'});
          Action.belongsTo(models.StudentClass, {foreignKey: 'userId', targetKey: 'userId'})
          Action.belongsTo(models.User, {foreignKey: 'userId'})
        }
      },
      freezeTableName: true,
      tableName: 'action'
    });

  return Action;
};

