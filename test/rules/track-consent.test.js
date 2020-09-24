'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder')

const ruleName = 'track-consent';
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
      .withUserMetadata({consentGiven: true})
      .build();
    context = new ContextBuilder().build();

    rule = loadRule(ruleName, globals);
  });

  it('should add consentGiven attribute to true for the user', (done) => {
    const updateUserMetadataMock = globals.auth0.users.updateUserMetadata;
    updateUserMetadataMock.mockReturnValue(Promise.resolve());

    rule(user, context, (e, u, c) => {
      expect(u.user_metadata.consentGiven).toBe(true);
      done();
    });

  });
});

