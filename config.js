/*
*Create and export configuration variables
*/

//Container for all the environments
var environments = {
  'staging' : {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'staging'
  },
  'production' : {
    'httpPort': 5000,
    'httpsPort' : 5001,
    'envName' : 'production'
  }
};

//Staging default environment
//
// environments.staging = {
//   'httpPort' : 3000,
//   'httpsPort' : 3001,
//   'envName' : 'staging'
// };
//
// //Production environment
// environments.production = {
//   'httpPort': 5000,
//   'httpsPort' : 5001,
//   'envName' : 'production'
// };

//Determine which environment was passed as a command line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
//Check if current environment is defined,if not default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;
module.exports = environmentToExport;
