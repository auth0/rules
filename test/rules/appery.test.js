'use strict';
const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'appery';
describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;

  beforeEach(() => {
    globals = {
      global: {},
      request: {
        get: jest.fn(),
        post: jest.fn()
      },
    };

    user = new UserBuilder()
      .build();

    context = new ContextBuilder()
      .build();

    rule = loadRule(ruleName, globals);
  });

  describe('when user is found', () => {
    it('should set the appery data on idToken', (done) => {
      const expectedBody = {
        sessionToken: 'someToken',
        _id: 'someId'
      };
      rule(user, context, (e, u, c) => {
        expect(c.idToken['https://example.com/apperyio_session_token']).toBe(expectedBody.sessionToken);
        expect(c.idToken['https://example.com/apperyio_user_id']).toBe(expectedBody._id);

        const getArgs = globals.request.get.mock.calls[0][0];
        expect(getArgs.qs.username).toBe(user.email);

        done();
      });

      globals.request.get.mock.calls[0][1](null, { statusCode: 200 }, expectedBody);
    });
  });

  describe('when user is not found', () => {
    it('should create the appery user and set the data on idToken', (done) => {
      const expectedBody = {
        sessionToken: 'someToken',
        _id: 'someId'
      };
      rule(user, context, (e, u, c) => {
        expect(c.idToken['https://example.com/apperyio_session_token']).toBe(expectedBody.sessionToken);
        expect(c.idToken['https://example.com/apperyio_user_id']).toBe(expectedBody._id);

        const postArgs = globals.request.post.mock.calls[0][0];
        expect(postArgs.json.username).toBe(user.email);
        
        done();
      });

      globals.request.get.mock.calls[0][1](null, { statusCode: 404 }, null);
      globals.request.post.mock.calls[0][1](null, { statusCode: 200 }, expectedBody);
    });
  });
});

const incomeDataSample = {
  [10001]: 81671,
  [10002]: 33218
}