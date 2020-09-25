/**
 * @title Test all non-global requires 
 * @overview Used to exercise all non global requires. Purely for testing templates
 * @gallery false
 * @category test
 *
 *
 */

function testGlobals(user, context, callback) {
  require('auth0').ManagementClient;
  require('crypto');
  require('ipaddr.js');
  require('jsonwebtoken');
  require('lodash');
  require('moment-timezone');
  require('oauth-sign');
  require('querystring');
  require('request');
  require('slack-notify')('MY_SLACK_WEBHOOK_URL');
  require('slack-notify')('SLACK_HOOK');
  require('url');
  require('uuid');
  require('xmldom');
  require('xpath');
  callback(null, user, context);
}
