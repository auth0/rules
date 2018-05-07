'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'check-domains-against-connection-aliases';
describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;
  const connectionResponse = [{
    name: 'test-connection',
    options: {
    }
  }];

  beforeEach(() => {
    globals = {
      _: require('lodash'),
      request: {
        get: jest.fn()
      },
      configuration: {
        AUTH0_API_TOKEN: 'some token'
      }
    };
  });

  describe('when no tenant_domain', () => {
    beforeEach(() => {
      globals.request.get = jest
        .fn()
        .mockImplementation((obj, cb) => {
          cb(null, { statusCode: 200 }, connectionResponse)
        });

      context = new ContextBuilder()
        .withConnection(connectionResponse[0].name)
        .build();

      user = new UserBuilder()
        .build();

      rule = loadRule(ruleName, globals);
    });

    it('should allow access', (done) => {      
      rule(user, context, (e, u, c) => {
        expect(e).toBeNull();

        done();
      });
    });
  });

  describe('when email domain matches a domain alias', () => {
    beforeEach(() => {
      connectionResponse[0].options.tenant_domain = 'test.com';
      connectionResponse[0].options.domain_aliases = ['test.com'];

      globals.request.get = jest
        .fn()
        .mockImplementation((obj, cb) => {
          cb(null, { statusCode: 200 }, connectionResponse)
        });

      context = new ContextBuilder()
        .withConnection(connectionResponse[0].name)
        .build();

      user = new UserBuilder()
        .withEmail('me@test.com')
        .build();

      rule = loadRule(ruleName, globals);
    });
    it('should allow access', (done) => {      
      rule(user, context, (e, u, c) => {
        expect(e).toBeNull();

        done();
      });
    });
  });

  describe('when no tenant_domain or email matching domain alias exists', () => {
    beforeEach(() => {
      connectionResponse[0].options.tenant_domain = 'test.com';
      connectionResponse[0].options.domain_aliases = ['test.com'];

      globals.request.get = jest
        .fn()
        .mockImplementation((obj, cb) => {
          cb(null, { statusCode: 200 }, connectionResponse)
        });

      context = new ContextBuilder()
        .withConnection(connectionResponse[0].name)
        .build();

      user = new UserBuilder()
        .withEmail('me@otherdomain.com')
        .build();


      rule = loadRule(ruleName, globals);
    });
    it('should not allow access', (done) => {      
      rule(user, context, (e, u, c) => {
        expect(e).toBe('Access denied');

        done();
      });
    });
  });
});
