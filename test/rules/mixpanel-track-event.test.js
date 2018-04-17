'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const loadRule = require('./util/load-rule.js');

describe('mixpanel-track-event', () => {
  let request;
  let rule;

  beforeEach(() => {
    request = {
      get: sinon.stub()
    };

    const globals = {
      request
    };

    rule = loadRule('mixpanel-track-event', globals);
  });

  it('should send mixpanel request', (done) => {
    const user = {
      user_id: '1234'
    };

    const context = {
      clientName: 'asdf'
    };

    request.get.callsArg(1);

    rule(user, context, (err, user, context) => {
      const call = request.get.getCall(0);
      const options = call.args[0];
      const data = JSON.parse(Buffer.from(options.qs.data, 'base64').toString('utf8'));

      expect(options).to.have.property('url', 'http://api.mixpanel.com/track/');
      expect(data).to.deep.equal({
        event: 'Sign In',
        properties: {
          distinct_id: '1234',
          token: '{REPLACE_WITH_YOUR_MIXPANEL_TOKEN}',
          application: 'asdf'
        }
      });

      done();
    });
  });
});


