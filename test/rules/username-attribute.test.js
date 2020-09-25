'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');
const UserBuilder = require ('../utils/userBuilder');
const ruleName = 'username-attribute';

describe(ruleName, () => {
    let rule;
    let context;
    let user;
    let globals;
  
    beforeEach(() => {
      globals = {
        global: {},
        auth0: {
          users: {
            updateAppMetadata: jest.fn()
          }
        }
      };
  
      user = new UserBuilder().build();
      context = new ContextBuilder().build();
  
      rule = loadRule(ruleName, globals);
    });
  
    it('should add username attribute superuser for the user', (done) => {
      const updateAppMetadataMock = globals.auth0.users.updateAppMetadata;
      updateAppMetadataMock.mockReturnValue(Promise.resolve());
      
      rule(user, context, (e, u, c) => {
        expect(user.app_metadata.username).toBe('superuser');
        done();
      });
    });
  });
