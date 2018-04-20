const loadRule = require('../utils/load-rule');

describe('decrypt-sensitive-data', () => {
  let globals;
  let rule;
  let user;

  beforeEach(() => {
    globals = {
      configuration: {
        ENCRYPT_PASSWORD: 'S0me,Password!è§',
        ENCRYPT_IV: 'abcjfiekdpaifjfd'
      },
      crypto: require('crypto')
    };

    user = {
      app_metadata: {
        // '{ "license_key": "1234567" }' encrypted with ENCRYPT_PASSWORD and ENCRYPT_IV
        private_data: 'B7N0Y8um1mPwHI0PM9JzX4aXonbfz2KbzudeQXU6i04='
      }
    };

    rule = loadRule('decrypt-sensitive-data.js', globals);
  });

  it('should add admin role if license_key matches', (done) => {
    rule(user, {}, (err, user, context) => {
      expect(user.role).toBe('admin');

      done();
    });
  });

  it('should have no role if license_key does not match', (done) => {
    user.app_metadata.private_data = 'B7N0Y8um1mPwHI0PM9JzX2tPmSgxH0HnsmMe8Qou/T0=';

    rule(user, {}, (err, user, context) => {
      expect(user.role).toBeUndefined;

      done();
    });
  });

  it('should have no role if user has no app_metadata', (done) => {
    delete user.app_metadata;

    rule(user, {}, (err, user, context) => {
      expect(user.role).toBeUndefined;

      done();
    });
  });

  it('should have no role if user has no private_data', (done) => {
    delete user.app_metadata.private_data;

    rule(user, {}, (err, user, context) => {
      expect(user.role).toBeUndefined;

      done();
    });
  });

  it('should throw exception on bad password', () => {
    globals.configuration.ENCRYPT_PASSWORD = 'abc';

    return expect(() => rule(user, {}, (err, user, context) => {
      throw new Error('should not reach here');
    })).toThrow('bad decrypt');
  });
});
