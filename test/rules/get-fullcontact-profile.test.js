'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'get-fullcontact-profile';

describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;
  let stubs = {};

  beforeEach(() => {
    globals = {
      auth0: {
        users: {
          updateUserMetadata: jest.fn()
        }
      },
      configuration: {
        FULLCONTACT_KEY: 'YOUR FULLCONTACT API KEY',
      }
    };

    stubs.request = {
      post: jest
        .fn()
        .mockImplementationOnce((url, obj, cb) => {
          cb(null, { statusCode: 200 }, fullContactData);
        })
    };

    user = new UserBuilder().build();

    context = new ContextBuilder().build();

    rule = loadRule(ruleName, globals, stubs);
  });

  it('should update user metadata and context idToken with full contact data', (done) => {
    const updateUserMetadataMock = globals.auth0.users.updateUserMetadata;
    updateUserMetadataMock.mockReturnValue(Promise.resolve());

    rule(user, context, (e, u, c) => {
      const call = updateUserMetadataMock.mock.calls[0];
      expect(call[0]).toBe(user.user_id);
      expect(call[1].fullcontact).toBe(fullContactData);

      expect(c.idToken['https://example.com/fullcontact']).toBe(fullContactData);
      done();
    });
  });
});

const fullContactData = `{
  "test": "test",
  "test3": {
    "test1": "test",
    "test2": "test"
  }
}`
