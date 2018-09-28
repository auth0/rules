'use strict';

const jwt = require('jsonwebtoken');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'jwt';

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

  it('should add idToken to the context', (done) => {
    const user = {
      user_id: 'uid1',
      email: 'duck.t@example.com',
      name: 'Terrified Duck'
    };

    rule(user, context, (err, u, c) => {
      expect(c.idToken).toBeDefined();
      const secret = Buffer.from('TARGET_API_CLIENT_SECRET', 'base64');
      const decoded = jwt.verify(c.idToken['https://example.com/id_token'], secret);

      expect(decoded.user_id).toEqual('uid1');
      expect(decoded.email).toEqual('duck.t@example.com');
      expect(decoded.name).toEqual('Terrified Duck');
      expect(decoded.aud).toEqual('TARGET_API_CLIENT_ID');
      expect(decoded.iss).toEqual('https://{your auth0 account}.auth0.com');
      expect(decoded.sub).toEqual('uid1');

      done();
    });
  });
});
