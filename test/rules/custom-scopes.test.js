'use strict';

const loadRule = require('../utils/load-rule');
const UserBuilder = require('../utils/userBuilder');
const ContextBuilder = require('../utils/contextBuilder');

const ruleName = 'custom-scopes';
describe(ruleName, () => {
  let globals;
  let rule;
  let user;
  let context;

  beforeEach(() => {
    user = new UserBuilder()
      .build();
    
    context = new ContextBuilder()
      .withJwtConfiguration({})
      .build();

    rule = loadRule(ruleName);
  });

  it('should set the scope on jwt configuration of the context', (done) => {
    rule(user, context, (err, user, context) => {
      expect(context.jwtConfiguration.scopes.contactInfo).toContain('name');
      expect(context.jwtConfiguration.scopes.contactInfo).toContain('email');
      expect(context.jwtConfiguration.scopes.contactInfo).toContain('company');

      expect(context.jwtConfiguration.scopes.publicInfo).toContain('public_repos');
      expect(context.jwtConfiguration.scopes.publicInfo).toContain('public_gists');

      done();
    });
  });
});
