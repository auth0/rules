'use strict';
const loadRule = require('../utils/load-rule');

const ruleName = 'add-income';
describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let getCallback;
  let globals;

  beforeEach(() => {
    globals = {
      global: {},
      request: {
        get: jest.fn((uri, cb) => {
          getCallback = cb;
        })
      },
      auth0: {
        users: {
          updateUserMetadata: jest.fn()
        }
      }
    };

    user = {
      user_id: 'id',
      user_metadata: {}
    }

    context = {
      idToken: {},
      request: {
        geoip: {
          country_code: 'US',
          postal_code: 10001
        }
      }
    }
  });

  describe('when incomeData exists', () => {
    beforeEach(() => {
      globals.global = {
        incomeData: incomeDataSample
      }
  
      rule = loadRule(ruleName, globals);
    });
    it('should set the income data on user metadata', (done) => {
      const updateUserMetadataMock = globals.auth0.users.updateUserMetadata;
      updateUserMetadataMock.mockReturnValue(Promise.resolve());
      
      rule(user, context, (e, u, c) => {
        const call = updateUserMetadataMock.mock.calls[0];
        expect(call[0]).toBe(user.user_id);
        expect(call[1].zipcode_income).toBe(incomeDataSample[context.request.geoip.postal_code]);

        done();
      });
    });
  });

  describe('when incomeData does not exist', () => {
    beforeEach(() => {
      globals.global = {
        incomeData: undefined
      };
  
      rule = loadRule(ruleName, globals);
    });

    it('should retreive and set the income data', (done) => {
      const updateUserMetadataMock = globals.auth0.users.updateUserMetadata;
      updateUserMetadataMock.mockReturnValue(Promise.resolve());
      
      rule(user, context, (e, u, c) => {
        const call = updateUserMetadataMock.mock.calls[0];
        expect(call[0]).toBe(user.user_id);
        expect(call[1].zipcode_income).toBe(incomeDataSample[context.request.geoip.postal_code]);

        done();
      });

      getCallback(null, { statusCode: 200 }, JSON.stringify(incomeDataSample));
    });

  });
});

const incomeDataSample = {
  [10001]: 81671,
  [10002]: 33218
}