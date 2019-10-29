'use strict';

const User = require('./models').User;


module.exports.hello = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!'
      },
      null,
      2
    ),
  };

};

module.exports.register = async (event) => {
  try {
    const user = await User.create(JSON.parse(event.body))
    return {
      statusCode: 200,
      body: JSON.stringify(user)
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          error: 'error creating account',
          e : err
        },
        null,
        2
      ),
    };
  
  }
}

function HTTPError (statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}
