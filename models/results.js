'use strict';
module.exports = (sequelize, DataTypes) => {
  const Results = sequelize.define('Results', {
    job_id: DataTypes.INTEGER,
    hashtag: DataTypes.STRING,
    count: DataTypes.INTEGER
  }, {});
  Results.associate = function(models) {
    // associations can be defined here
  };
  return Results;
};