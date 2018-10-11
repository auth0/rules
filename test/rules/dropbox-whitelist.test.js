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

  describe('when the rule is executed', () => {
    beforeEach(() => {
      user = new UserBuilder()
        .build();

      context = new ContextBuilder()
        .build();
    });

    it('should do nothing if the user has no email', (done) => {
      user.email = '';
      rule(user, context, (e) => {
        expect(e).toBeFalsy();
        done();
      });
    });

    it('should do nothing if user`s email isn`t verified', (done) => {
      user.email_verified = false;
      rule(user, context, (e) => {
        expect(e).toBeFalsy();
        done();
      });
    });
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
