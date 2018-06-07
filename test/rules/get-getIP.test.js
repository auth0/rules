'use strict';
const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'get-getIP';
describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;

  beforeEach(() => {
    globals = {
      auth0: {
        users: {
          updateUserMetadata: jest.fn()
        }
      }
    };

    user = new UserBuilder().build();

    const request = new RequestBuilder()
      .withGeoIp({
        country_code: 'US',
        postal_code: 10001
      })
      .build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();    

    rule = loadRule(ruleName, globals);
  });

  it('should set the geoip of the request on the context', (done) => {
    const updateUserMetadataMock = globals.auth0.users.updateUserMetadata;
    updateUserMetadataMock.mockReturnValue(Promise.resolve());
    
    rule(user, context, (e, u, c) => {
      const call = updateUserMetadataMock.mock.calls[0];
      expect(call[0]).toBe(user.user_id);

      expect(c.idToken['https://example.com/geoip']).toBe(context.request.geoip);

      done();
    });
  });
});
