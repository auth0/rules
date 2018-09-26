'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'ip-address-whitelist';

describe(ruleName, () => {
  let context;
  let rule;

  beforeEach(() => {
    rule = loadRule(ruleName);
  });

  describe('should return error', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();
    });

    it('if ip isn`t in the whitelist', (done) => {
      rule({}, context, (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('Access denied from this IP address.');
        done();
      });
    });
  });

  describe('should proceed if ip is in the list', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      request.ip = '1.2.3.4';
      context = new ContextBuilder()
        .withRequest(request)
        .build();
    });

    it('if ip isn`t in the whitelist', (done) => {
      rule({}, context, (err, u, c) => {
        expect(c.request.ip).toEqual('1.2.3.4');
        done();
      });
    });
  });
});
