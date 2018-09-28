'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'saml-configuration';

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

    it('if it isn`t correct client', (done) => {
      rule({}, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(c.samlConfiguration).toEqual({});

        done();
      });
    });
  });

  describe('should set samlConfiguration', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();

      context.clientID = '{YOUR_SAMLP_OR_WSFED_CLIENT_ID}';
    });

    it('if it is correct client', (done) => {
      const expectedConfig = {
        audience: 'urn:foo',
        recipient: 'http://foo',
        destination: 'http://foo',
        lifetimeInSeconds: 3600
      };
      
      rule({}, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(c.samlConfiguration).toEqual(expectedConfig);

        done();
      });
    });
  });
});
