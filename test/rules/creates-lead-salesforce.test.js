'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'creates-lead-salesforce';
describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;
  let stubs = {};

  const salesforceAccessToken = 'some_token';
  const salesforceInstanceUrl = 'http://tenant.salesforce.com';

  beforeEach(() => {
    globals = {
      auth0: {
        users: {
          updateAppMetadata: jest.fn()
        }
      },
      configuration: {
        SALESFORCE_CLIENT_ID: 'SF_ID',
        SALESFORCE_CLIENT_SECRET: 'SF_SECRET',
        SALESFORCE_USERNAME: 'SF_USN',
        SALESFORCE_PASSWORD: 'SF_PW'
      }
    };

    stubs['slack-notify'] = jest.fn();

    stubs['request'] = {
      post: jest.fn().mockImplementationOnce((obj, cb) => {
          cb(null, null, JSON.stringify({
            instance_url: salesforceInstanceUrl,
            access_token: salesforceAccessToken
          }));
        })
        .mockImplementationOnce((obj, cb) => {
          cb(null, null, { id: 'fake create lead response id' });
        })
    };

    user = new UserBuilder().build();

    context = new ContextBuilder().build();

    rule = loadRule(ruleName, globals, stubs);
  });

  it('should record user as lead and set app metadata', (done) => {

    rule(user, context, () => { });

    // First POST is to get the access token
    const getAccessTokenPostOptions = stubs.request.post.mock.calls[0][0];
    expect(getAccessTokenPostOptions.url).toBe('https://login.salesforce.com/services/oauth2/token');
    expect(getAccessTokenPostOptions.form.grant_type).toBe('password');
    expect(getAccessTokenPostOptions.form.client_id).toBe(globals.configuration.SALESFORCE_CLIENT_ID);
    expect(getAccessTokenPostOptions.form.client_secret).toBe(globals.configuration.SALESFORCE_CLIENT_SECRET);
    expect(getAccessTokenPostOptions.form.username).toBe(globals.configuration.SALESFORCE_USERNAME);
    expect(getAccessTokenPostOptions.form.password).toBe(globals.configuration.SALESFORCE_PASSWORD);


    // Second POST is to create the lead
    const createLeadPostOptions = stubs.request.post.mock.calls[1][0];
    expect(createLeadPostOptions.url).toBe(salesforceInstanceUrl + '/services/data/v20.0/sobjects/Lead');
    expect(createLeadPostOptions.json.LastName).toBe(user.name);
    expect(createLeadPostOptions.headers.Authorization).toContain(salesforceAccessToken);

    const updateAppMetadataCall = globals.auth0.users.updateAppMetadata.mock.calls[0];
    expect(updateAppMetadataCall[0]).toBe(user.user_id);
    expect(updateAppMetadataCall[1].recordedAsLead).toBe(true);

    done();
  });
});
