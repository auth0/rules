'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'querystring';

describe(ruleName, () => {
  let context;
  let rule;

  beforeEach(() => {
    rule = loadRule(ruleName);
  });

  describe('should do nothing', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();
    });

    it('if querystring does not match', (done) => {
      rule({}, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(c.idToken['https://example.com/new_attribute']).toBeFalsy();

        done();
      });
    });
  });

  describe('should add attribute to the idToken', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();
      context.request.query.some_querystring = 'whatever';
    });

    it('if querystring does match', (done) => {
      rule({}, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(c.idToken['https://example.com/new_attribute']).toEqual('foo');

        done();
      });
    });
  });
});
