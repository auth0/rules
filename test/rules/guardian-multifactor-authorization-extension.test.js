'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'guardian-multifactor-authorization-extension';

describe(ruleName, () => {
  let context;
  let rule;

  beforeEach(() => {
    rule = loadRule(ruleName);

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });


  it('should do nothing if there are no groups', (done) => {
    rule({}, context, (err, u, c) => {
      expect(c.multifactor).toBeFalsy();

      done();
    });
  });

  it('should do nothing if users group is not in the list', (done) => {
    const user = {
      app_metadata: {
        authorization: {
          groups: [ 'tester' ]
        }
      }
    };

    rule(user, context, (err, u, c) => {
      expect(c.multifactor).toBeFalsy();

      done();
    });
  });

  it('should set multifactor provider if users group is in the list', (done) => {
    const user = {
      app_metadata: {
        authorization: {
          groups: [ 'admins' ]
        }
      }
    };

    rule(user, context, (err, u, c) => {
      expect(c.multifactor.provider).toBe('guardian');
      expect(c.multifactor.allowRememberBrowser).toBe(false);

      done();
    });
  });
});
