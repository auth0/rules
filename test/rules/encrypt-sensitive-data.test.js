'use strict';

const loadRule = require('../utils/load-rule');
const crypto = require('crypto');

const ruleName = 'encrypt-sensitive-data';

describe(ruleName, () => {
  let globals;
  let rule;
  let user;

  beforeEach(() => {
    globals = {
      configuration: {
        ENCRYPT_PASSWORD: 'S0me,Password!è§',
        ENCRYPT_IV: 'abcjfiekdpaifjfd'
      },
      crypto
    };

    rule = loadRule(ruleName, globals);
  });

  it('should add encrypted metadata to context', (done) => {
    rule(user, { idToken: {} }, (err, user, context) => {
      const cipherText = context.idToken['https://example.com/private_data'];

      const iv = Buffer.from(globals.configuration.ENCRYPT_IV, 'utf8');
      const encodeKey = crypto.createHash('sha256')
        .update(globals.configuration.ENCRYPT_PASSWORD, 'utf8').digest();
      const cipher = crypto.createDecipheriv('aes-256-cbc', encodeKey, iv);
      const plainText = cipher.update(cipherText, 'base64', 'utf8') + cipher.final('utf8');
      const result = JSON.parse(plainText);

      expect(result).toHaveProperty('license_key', '1234567');
      expect(result).toHaveProperty('social_security_number', '56789');

      done();
    });
  });
});
