'use strict';

var jwt = require('jsonwebtoken');

const User = require('./models').User;
const Jobs = require('./models').Jobs;
const Results = require('./models').Results;


module.exports.hello = async (event) => {
  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    statusCode: 200,
    body: JSON.stringify("Hello, I'm protected!")
  }
}
module.exports.user = async (event, context) => {
  var userName = event.requestContext.authorizer.principalId
  const user = await User.findOne({ where: { username: userName } })

  console.log(event)
  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    statusCode: 200,
    body: JSON.stringify({ 'data': { 'user': { 'id': user.id, 'username': user.username } } })

  }

}
module.exports.getJobByID = async (event, context) => {
  var id = event.pathParameters.id;
  console.log(id);
  const job = await Jobs.findOne({ where: { id: id }})

  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    statusCode: 200,
    body: JSON.stringify({ 'data': { 'job': job } })

  }

}
module.exports.getJobs = async (event, context) => {
  var userName = event.requestContext.authorizer.principalId
  const user = await User.findOne({ where: { username: userName }, include: 'jobs' })


  console.log(user.jobs)
  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    statusCode: 200,
    body: JSON.stringify({ 'data': { 'user': { 'id': user.id, 'jobs': user.jobs } } })

  }

}
module.exports.submitJob = async (event, context) => {
  try {
    var userName = event.requestContext.authorizer.principalId
    const user = await User.findOne({ where: { username: userName } })
    var body = JSON.parse(event.body)
    const job = await Jobs.create({
      location: body.location,
      location_id: body.location_id,
      status: 0,
      user_id: user.id
    })
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 200,
      body: JSON.stringify(job)
    }
  } catch (err) {

    console.log(err)
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 500,
      body: JSON.stringify(
        {
          error: 'error creating job.'
        },
        null,
        2
      ),
    };

  }
}
module.exports.register = async (event) => {
  try {
    const user = await User.create(JSON.parse(event.body))
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 200,
      body: JSON.stringify(user)
    }
  } catch (err) {
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 500,
      body: JSON.stringify(
        {
          error: 'error registering account'
        },
        null,
        2
      ),
    };

  }
}


module.exports.login = async (event) => {
  try {
    let request = JSON.parse(event.body)

    const user = await User.findOne({ where: { username: request.username } })

    // Check if user exists
    if (!user) {
      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        statusCode: 404,
        body: JSON.stringify({
          error: 'user not found'
        })
      }
    }

    if (!user.comparePassword(request.password)) {
      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        statusCode: 403,
        body: JSON.stringify({
          error: 'Invalid password.'
        })
      }

    }

    var token = jwt.sign({
      user
    }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION_TIME });

    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 200,
      body: JSON.stringify({
        data: {
          'token': token
        }
      })
    }
  } catch (err) {
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 500,
      body: JSON.stringify(
        {
          error: 'error logging in'
        },
        null,
        2
      ),
    };

  }
}


// Policy helper function
// https://github.com/serverless/examples/blob/master/aws-node-auth0-custom-authorizers-api/handler.js
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

module.exports.authorize = (event, context, callback) => {
  const token = event.authorizationToken;

  if (!token) {
    return callback('Unauthorized');
  }
  const tokenParts = token.split(' ');

  const tokenValue = tokenParts[1];

  if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
    // no auth token!
    return callback('Unauthorized');
  }

  try {
    // Verify JWT
    jwt.verify(tokenValue, process.env.JWT_SECRET, (verifyError, decoded) => {
      if (verifyError) {
        console.log('verifyError', verifyError);
        // 401 Unauthorizeds
        console.log(`Token invalid. ${verifyError}`);
        return callback('Unauthorized');
      }
      return callback(null, generatePolicy(decoded.user.username, 'Allow', '*'));
    });

  } catch (e) {
    callback('Unauthorized');
  }
};

