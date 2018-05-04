'use strict';

const loadRule = require('../utils/load-rule');
const UserBuilder = require('../utils/userBuilder');
const ContextBuilder = require('../utils/contextBuilder');

const ruleName = 'add-roles-from-sqlserver';
describe(ruleName, () => {
  let rule;
  let context;
  let user;
  let globals;

  const sqlserverConnectOnEventMock = jest.fn(() => {
    return {
      on: sqlserverConnectOnEventMock,
      execSql: jest.fn()
    };
  })

  beforeEach(() => {
    globals = {
      sqlserver: {
        connect: jest.fn((config) => {
          return {
            on: sqlserverConnectOnEventMock
          };
        }),
        Request: jest.fn((query, cb) => {
          return {
            addParameter: jest.fn()
          };
        }),
        Types: {
          VarChar: 'VarChar'
        }
      }
    };

    rule = loadRule(ruleName, globals);
  });

  describe('when database returns roles', () => {
    beforeEach(() => {      
      user = new UserBuilder()
        .build();

      context = new ContextBuilder()
        .build();
    });
    it('should update the idToken on the context with the roles', (done) => {
      const expectedRules = ['admin', 'collaborator'];
      
      rule(user, context, (e, u, c) => {
        const roles = c.idToken['https://example.com/roles'];
        expect(roles).toContain(expectedRules[0]);
        expect(roles).toContain(expectedRules[1]);
        done();
      });
      sqlserverConnectOnEventMock.mock.calls[1][1](null);
      const sqlReturnedRows = expectedRules.map((r) => [user.email, {value: r}])
      globals.sqlserver.Request.mock.calls[0][1](null, expectedRules.length, sqlReturnedRows);
    });
  });
});
