'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'sso-desk-com-mutlipass';

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

  it('should generate sso url and add it to idToken', (done) => {
    const user = {
      user_id: 'uid1',
      email: 'duck.t@example.com',
      name: 'Terrified Duck'
    };

    rule(user, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c.idToken['https://example.com/desk_login_url']).toEqual('https://YOUR DESK SUBDOMAIN.desk.com/customer/authentication/multipass/callback?multipass=T3BlblNTTCBmb3IgUnVieQ%3D%3D&signature=XTpDTuvoPrB1n91I%2F2IGBI%2FdmwA%3D');
      done();
    });
  });
});
