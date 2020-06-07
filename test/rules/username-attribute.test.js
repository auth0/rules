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
            updateUserMetadata: jest.fn()
          }
        }
      };
  
      user = new UserBuilder()
        .build();
      context = new ContextBuilder().build();
  
      rule = loadRule(ruleName, globals);
    });
  
    it('should add username to user app metada', (done) => {
      const updateUserMetadataMock = globals.auth0.users.updateUserMetadata;
      updateUserMetadataMock.mockReturnValue(Promise.resolve());
      
      rule(user, context, (e, u, c) => {
        expect(u.app_metadata.username).toBe(superuser);
        done();
      });
    });
  });
