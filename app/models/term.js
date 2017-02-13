/**
 * Created by zhoucheng on 2/4/17.
 */
module.exports = function (sequelize, DataTypes) {

  var Term =  sequelize.define('Term', {
      termId: { type: DataTypes.INTEGER(2), primaryKey: true, notNull: true },
      termName: { type: DataTypes.STRING(20), notNull: true }
    },
    {
      classMethods: {
        associate: function (models) {
          // example on how to add relations
          Term.hasMany(models.Class, {foreignKey: 'termId'})
        }
      },
      freezeTableName: true,
      tableName: 'term'
    });

  return Term;

};

