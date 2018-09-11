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
  const connectionOptions = {
    tenant_domain: 'contoso.com',
    domain_aliases: ['contoso.com']
  };

  beforeEach(() => {
    globals = {
      _: require('lodash'),
      request: {
        get: jest.fn()
      }
    };
  });

  describe('when no tenant_domain and no domain_aliases exist', () => {
    beforeEach(() => {
      context = new ContextBuilder()
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

  describe('when email domain matches a domain alias exactly', () => {
    beforeEach(() => {
      context = new ContextBuilder()
        .withConnectionOptions(connectionOptions)
        .build();

      user = new UserBuilder()
        .withEmail('me@contoso.com')
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

  describe('when email domain is not an exact match (partial match)', () => {
    beforeEach(() => {
      context = new ContextBuilder()
        .withConnectionOptions(connectionOptions)
        .build();

      user = new UserBuilder()
        .withEmail('me@notcontoso.com')
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

  describe('when no tenant_domain or email matching domain alias exists', () => {
    beforeEach(() => {
      context = new ContextBuilder()
        .withConnectionOptions(connectionOptions)
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

  describe('matching tenant_domain exists but no domain_aliases exist', () => {
    beforeEach(() => {
      context = new ContextBuilder()
        .withConnectionOptions({
          tenant_domain: 'contoso.com'
        })
        .build();

      user = new UserBuilder()
        .withEmail('me@contoso.com')
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

  describe('no tenant_domain exists but domain_aliases is not empty', () => {
    beforeEach(() => {
      context = new ContextBuilder()
        .withConnectionOptions({
          domain_aliases: ['contoso.com']
        })
        .build();

      user = new UserBuilder()
        .withEmail('me@contoso.com')
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
