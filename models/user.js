'use strict';
var bcrypt = require('bcryptjs');


module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {});
  User.beforeSave((user, options) => {
    if (user.changed('password')) {
      user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    }
  });
  User.prototype.comparePassword = function (pass) {
    return bcrypt.compareSync(pass, this.password);
  };
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Jobs, {as: 'jobs', foreignKey: 'user_id'})
  };
  return User;
};