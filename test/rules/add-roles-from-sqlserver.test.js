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
  let tedious;
  let tediousConnectOnEventMock;

  beforeEach(() => {
    globals = {
      configuration: {
        SQL_DATABASE_USERNAME: '<user_name>',
        SQL_DATABASE_PASSWORD: '<password>',
        SQL_DATABASE_HOSTNAME: '<db_server_name>',
        SQL_DATABASE_NAME: '<db_name>'
      }
    };

    tediousConnectOnEventMock = jest.fn(() => {
      return {
        on: tediousConnectOnEventMock,
        execSql: jest.fn()
      };
    });


    tedious = {
      Connection: jest.fn((config) => {
        return {
          on: tediousConnectOnEventMock
        };
      }),
      Request: jest.fn((query, cb) => {
        return {
          addParameter: jest.fn()
        };
      }),
      TYPES: {
        VarChar: 'VarChar'
      }
    };

    rule = loadRule(ruleName, globals, { 'tedious@6.6.2': tedious });
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

  describe('when database returns roles', () => {
    beforeEach(() => {
      user = new UserBuilder()
        .build();

      context = new ContextBuilder()
        .build();
    });

    it('should update the idToken on the context with the roles', (done) => {
      const expectedRoles = ['admin', 'collaborator'];

      rule(user, context, (e, u, c) => {
        const roles = c.idToken['https://example.com/roles'];
        expect(roles).toContain(expectedRoles[0]);
        expect(roles).toContain(expectedRoles[1]);
        done();
      });

      tediousConnectOnEventMock.mock.calls[1][1](null);
      const sqlReturnedRows = expectedRoles.map((r) => [user.email, {value: r}]);
      tedious.Request.mock.calls[0][1](null, expectedRoles.length, sqlReturnedRows);
    });
  });
});
