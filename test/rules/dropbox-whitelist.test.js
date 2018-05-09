'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'dropbox-whitelist';
describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;

  beforeEach(() => {
    globals = {
      UnauthorizedError: function() {},
      request: {
        get: jest
          .fn()
          .mockImplementation((opt, cb) => {
            cb(null, { statusCode: 200 }, dropboxUsersFileFixture);
          })
      }
    };

    context = new ContextBuilder().build();

    rule = loadRule(ruleName, globals);
  });

  describe('when user email is in dropbox', () => {
    beforeEach(() => {
      user = new UserBuilder()
        .withEmail('user1@domain.com')
        .build();
    });

    it('should authorize the user', (done) => {      
      rule(user, context, (err, user, ctx) => {
        expect(err).toBeNull();

        done();
      });
    });
  });

  describe('when user email is not in dropbox', () => {
    beforeEach(() => {
      user = new UserBuilder()
        .withEmail('non-existent@domain.com')
        .build();
    });

    it('should not authorize the user', (done) => {      
      rule(user, context, (err, user, ctx) => {
        expect(err).toBeInstanceOf(globals.UnauthorizedError);

        done();
      });
    });
  });
});

const dropboxUsersFileFixture = 
`user1@domain.com
user2@domain.com
user3@domain.com`;
