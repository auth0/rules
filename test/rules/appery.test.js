'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'appery';
describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;
  let stubs;

  const expectedGetBody = {
    sessionToken: 'someToken',
    _id: 'someId'
  };

  const configuration = {
    APPERYIO_DATABASE_ID: '<APPERYIO_DATABASE_ID>',
    APPERYIO_PASSWORD_SECRET: 'A REALLY LONG PASSWORD'
  };

  beforeEach(() => {
    user = new UserBuilder()
      .build();

    context = new ContextBuilder()
      .build();

    rule = loadRule(ruleName, globals);
  });

  describe('when user is found', () => {
    beforeEach(() => {
      globals = {
        global: {},
      };
      globals.configuration = configuration;

      stubs = {
        request: {
          get: jest
            .fn()
            .mockImplementation((url, cb) => {
              cb(null, { statusCode: 200 }, expectedGetBody)
            })
        },
      };

      rule = loadRule(ruleName, globals, stubs);
    });

    it('should set the appery data on idToken', (done) => {
      rule(user, context, (e, u, c) => {
        expect(c.idToken['https://example.com/apperyio_session_token']).toBe(expectedGetBody.sessionToken);
        expect(c.idToken['https://example.com/apperyio_user_id']).toBe(expectedGetBody._id);

        const getArgs = stubs.request.get.mock.calls[0][0];
        expect(getArgs.qs.username).toBe(user.email);

        done();
      });
    });
  });

  describe('when user is not found', () => {
    beforeEach(() => {
      globals = {
        configuration,
        global: {},
      };

      stubs = {
        request: {
          get: jest
            .fn()
            .mockImplementation((url, cb) => {
              cb(null, { statusCode: 404 }, null);
            }),
          post: jest
            .fn()
            .mockImplementation((url, cb) => {
              cb(null, { statusCode: 200 }, expectedGetBody);
            })
        },
      };

      rule = loadRule(ruleName, globals, stubs);
    });

    it('should create the appery user and set the data on idToken', (done) => {
      rule(user, context, (e, u, c) => {
        expect(c.idToken['https://example.com/apperyio_session_token']).toBe(expectedGetBody.sessionToken);
        expect(c.idToken['https://example.com/apperyio_user_id']).toBe(expectedGetBody._id);

        const postArgs = stubs.request.post.mock.calls[0][0];
        expect(postArgs.json.username).toBe(user.email);

        done();
      });
    });
  });
});
