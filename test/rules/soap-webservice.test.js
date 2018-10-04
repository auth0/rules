'use strict';

const nock = require('nock');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'soap-webservice';

describe(ruleName, () => {
  let context;
  let rule;

  const DOMParser = function() {
    return this;
  };

  DOMParser.prototype.parseFromString = function (body) {
    expect(body).toEqual('test soap body');
    return 'test doc';
  };

  const stubs = {
    xmldom: { DOMParser },
    xpath: {
      select: (template, doc) => {
        expect(template).toEqual("//*[local-name(.)='string']");
        expect(doc).toEqual('test doc');
        return [
          { textContent: 'role-1' },
          { textContent: 'role-2' }
        ];
      }
    }
  };

  beforeEach(() => {
    rule = loadRule(ruleName, {}, stubs);

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  it('should get roles from SOAP and add it to idToken', (done) => {
    nock('https://somedomain.com', { requheaders: { SOAPAction: 'http://tempuri.org/RoleService/GetRolesForCurrentUser' } })
      .post('/RoleService.svc', (body) => {
        expect(body).toEqual('<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetRolesForCurrentUser xmlns="http://tempuri.org"/></s:Body></s:Envelope>');
        return true;
      })
      .reply(200, 'test soap body');

    rule({}, context, (err, u, c) => {
      expect(err).toBeFalsy();
      expect(c.idToken['https://example.com/roles']).toEqual([ 'role-1', 'role-2' ]);
      done();
    });
  });

  it('should return error, if request fails', (done) => {
    nock('https://somedomain.com')
      .post('/RoleService.svc', () => true)
      .replyWithError(new Error('test error'));

    rule({}, context, (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual('test error');
      done();
    });
  });
});
