'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'remove-attributes';

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

  it('should remove users attribute', (done) => {
    const user = {
      id: 'uid1',
      some_attribute: 1
    };

    rule(user, context, (err, u) => {
      expect(err).toBeFalsy();
      expect(u.id).toEqual(user.id);
      expect(u.some_attribute).toBeUndefined();

      done();
    });
  });
});
