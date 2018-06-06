'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'facebook-custom-picture';

describe(ruleName, () => {
  let user;
  let context;
  let globals;
  let rule;

  beforeEach(() => {
    globals = {
      _: require('lodash')
    };

    rule = loadRule(ruleName, globals);

    user = new UserBuilder()
      .withIdentities([
        {
          connection: 'facebook',
          user_id: '1234'
        }
      ])
      .build();

    context = new ContextBuilder()
      .withConnection('facebook')
      .build();
  });

  it('should add the facebook picture to the idToken on the context', (done) => {
    rule(user, context, (err, u, context) => {
      expect(context.idToken.picture).toBe(`https://graph.facebook.com/v2.5/1234/picture?type=large`);

      done();
    });
  });
});
