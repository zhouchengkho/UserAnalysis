/**
 * Created by zhoucheng on 1/3/17.
 */
module.exports = function (sequelize, DataTypes) {

  var User = sequelize.define('User', {
    userId: { type: DataTypes.INTEGER, primaryKey: true },
    userName: DataTypes.STRING,
    nickName: DataTypes.STRING,
    psd: DataTypes.STRING,
    isTeacher: DataTypes.INTEGER,
    gender: DataTypes.INTEGER,
    departId: DataTypes.INTEGER,
    faceIcon: DataTypes.STRING,
    homelandP: DataTypes.INTEGER,
    homelandC: DataTypes.INTEGER,
    birthday: DataTypes.DATE,
    telephone: DataTypes.STRING,
    homepage: DataTypes.STRING,
    hobbies: DataTypes.STRING,
    motto: DataTypes.STRING,
    email: DataTypes.STRING
  },
    {
    classMethods: {
      associate: function (models) {
        // example on how to add relations
        User.hasMany(models.Friend, {foreignKey: 'userId'});
        User.hasMany(models.StudentClass, {foreignKey: 'userId'});
        User.belongsTo(models.Dorm, {foreignKey: 'userId'})
      }
    },
      freezeTableName: true,
      tableName: 'user'
  });

  return User;
};

