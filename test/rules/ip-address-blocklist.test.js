'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'ip-address-blocklist';

describe(ruleName, () => {
  let context;
  let rule;
  let globals;

  beforeEach(() => {
    globals = {
      UnauthorizedError: function() {}
    };
    rule = loadRule(ruleName, globals);
  });

  describe('should return error', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      request.ip = '1.2.3.4';
      context = new ContextBuilder()
        .withRequest(request)
        .build();
    });

    it('is in the blocklist', (done) => {
      rule({}, context, (err) => {
        expect(err).toBeInstanceOf(globals.UnauthorizedError);
        done();
      });
    });
  });

  describe('should proceed if IP is not in the list', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      request.ip = '3.4.5.6';
      context = new ContextBuilder()
        .withRequest(request)
        .build();
    });

    it('is not in the whitelist', (done) => {
      rule({}, context, (err, u, c) => {
        expect(c.request.ip).toEqual('3.4.5.6');
        done();
      });
    });
  });
});
