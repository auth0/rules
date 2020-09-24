'use strict';

const nock = require('nock');
const moment = require('moment-timezone');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'intercom-user';

describe(ruleName, () => {
  let context;
  let rule;
  const currentDate = new Date();

  const configuration = {
    INTERCOM_ACCESS_TOKEN: 'YOUR INTERCOM ACCESS TOKEN'
  };

  beforeEach(() => {
    rule = loadRule(ruleName, {configuration});

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });


  it('should send user data to the intercom', (done) => {
    const user = {
      user_id: 'uid1',
      email: 'duck.t@example.com',
      name: 'Terrified Duck',
      created_at: currentDate
    };

    nock('https://api.intercom.io', { reqheaders: { 'authorization': 'Bearer YOUR INTERCOM ACCESS TOKEN' } })
      .post('/users', function(body) {
        expect(body.user_id).toEqual('uid1');
        expect(body.email).toEqual('duck.t@example.com');
        expect(body.signed_up_at).toEqual(moment(currentDate).unix());
        expect(body.last_seen_ip).toEqual('188.6.125.49');
        expect(body.update_last_request_at).toEqual(true);
        expect(body.new_session).toEqual(true);
        done();
        return true;
      })
      .reply(200);

    rule(user, context, (err, u) => {
      expect(u.user_id).toEqual('uid1');
    });
  });
});
