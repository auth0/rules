'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'aspnet-webapi';
describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;

  beforeEach(() => {
    globals = {
      request: {
        post: jest.fn()
      },
      auth0: {
        users: {
          updateAppMetadata: jest.fn()
        }
      }
    };

    user = new UserBuilder()
      .build();

    context = new ContextBuilder()
      .build();

    rule = loadRule(ruleName, globals);
  });

  describe('when aspnet post request is successful', () => {
    it('should update the user metadata and set idToken', (done) => {
      const expectedCustomId = 'testId';
      const updateAppMetadataMock = globals.auth0.users.updateAppMetadata;
      updateAppMetadataMock.mockReturnValue(Promise.resolve());
      
      rule(user, context, (e, u, c) => {
        const call = updateAppMetadataMock.mock.calls[0];
        expect(call[0]).toBe(user.user_id);
        expect(call[1].customId).toBe(expectedCustomId);

        expect(context.idToken['https://example.com/custom_id']).toBe(expectedCustomId);
        expect(user.app_metadata.customId).toBe(expectedCustomId);

        done();
      });

      globals.request.post.mock.calls[0][1](null, null, { customId: expectedCustomId });
    });
  });
});
