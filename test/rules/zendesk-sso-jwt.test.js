'use strict';

const jwt = require('jsonwebtoken');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'zendesk-sso-jwt';

describe(ruleName, () => {
  let context;
  let rule;
  const user = {
    user_id: 'uid1',
    email: 'duck.t@example.com',
    name: 'Terrified Duck'
  };

  const uuid = () => 'random-uuid';

  const configuration = {
    ZENDESK_JWT_SECRET: 'secret'
  };

  beforeEach(() => {
    rule = loadRule(ruleName, { configuration }, { uuid });

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  it('should generate zendesk jwt url and add it to idToken', (done) => {
    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c.idToken['https://example.com/zendesk_jwt_url']).toContain('https://auth0sso.zendesk.com/access');
      const token = c.idToken['https://example.com/zendesk_jwt_url'].split('jwt?jwt=')[1];
      const decoded = jwt.decode(token);

      expect(decoded.jti).toEqual('random-uuid');
      expect(decoded.email).toEqual(user.email);
      expect(decoded.name).toEqual(user.name);
      expect(decoded.external_id).toEqual(user.user_id);

      done();
    });
  });
});
