'use strict';
module.exports = (sequelize, DataTypes) => {
  const Jobs = sequelize.define('Jobs', {
    location: DataTypes.STRING,
    location_id: DataTypes.INTEGER,
    result_url: DataTypes.STRING,
    status: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {});
  Jobs.associate = function(models) {
    Jobs.hasMany(models.Results, {as: 'results'})
  };
  return Jobs;
};