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

  beforeEach(() => {
    globals = {
      request: {
        post: jest.fn()
      },
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
    stubs['slack-notify'] = jest.fn()

    user = new UserBuilder()
      .build();

    context = new ContextBuilder()
      .build();

    rule = loadRule(ruleName, globals, stubs);
  });

  it('should record user as lead and set app metadata', (done) => {
    const expectedAccessToken = 'some_token';
    const updateAppMetadataMock = globals.auth0.users.updateAppMetadata;
    updateAppMetadataMock.mockReturnValue(Promise.resolve());
    
    
    rule(user, context, () => { });

    // First POST is to get the access token
    globals.request.post.mock.calls[0][1](null, null,
      JSON.stringify({
        instance_url: 'some_url',
        access_token: expectedAccessToken
      })
    );

    // Second POST is to create the lead
    const createLeadPostOptions = globals.request.post.mock.calls[1][0];
    expect(createLeadPostOptions.json.LastName).toBe(user.name);
    expect(createLeadPostOptions.headers.Authorization).toContain(expectedAccessToken);

    globals.request.post.mock.calls[1][1](null, null,
      {
        id: 'dummy create lead response id'
      }
    );
    const updateAppMetadataCall = updateAppMetadataMock.mock.calls[0];
    expect(updateAppMetadataCall[0]).toBe(user.user_id);
    expect(updateAppMetadataCall[1].recordedAsLead).toBe(true);

    done();
  });
});