'use strict';
const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder')

const ruleName = 'add-persistence-attribute';
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
      .withUserMetadata({color: 'red'})
      .build();
    context = new ContextBuilder().build();

    rule = loadRule(ruleName, globals);
  });

  it('should persist the attribute to user', (done) => {
    const updateUserMetadataMock = globals.auth0.users.updateUserMetadata;
    updateUserMetadataMock.mockReturnValue(Promise.resolve());
    
    rule(user, context, (e, u, c) => {
      const call = updateUserMetadataMock.mock.calls[0];
      expect(call[0]).toBe(user.user_id);
      expect(c.idToken['https://example.com/favorite_color']).toBe(user.user_metadata.color);
      expect(call[1].color).toBe(user.user_metadata.color);
      done();
    });
  });
});
