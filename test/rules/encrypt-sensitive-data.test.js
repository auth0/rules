'use strict';

const expect = require('chai').expect;

const crypto = require('crypto');

const loadRule = require('./util/load-rule.js');

describe('encrypt-sensitive-data', () => {
  let globals;
  let rule;

  beforeEach(() => {
    globals = {
      configuration: {
        ENCRYPT_PASSWORD: 'S0me,Password!è§',
        ENCRYPT_IV: 'abcjfiekdpaifjfd'
      },
      crypto
    };

    rule = loadRule('encrypt-sensitive-data', globals);
  });

  it('should add encrypted metadata to context', (done) => {
    rule({}, { idToken: {} }, (err, user, context) => {
      const cipherText = context.idToken['https://example.com/private_data'];

      const iv = Buffer.from(globals.configuration.ENCRYPT_IV, 'utf8');
      const encodeKey = crypto.createHash('sha256')
        .update(globals.configuration.ENCRYPT_PASSWORD, 'utf8').digest();
      const cipher = crypto.createDecipheriv('aes-256-cbc', encodeKey, iv);
      const plainText = cipher.update(cipherText, 'base64', 'utf8') + cipher.final('utf8');
      const result = JSON.parse(plainText);

      expect(result).to.have.property('license_key', '1234567');
      expect(result).to.have.property('social_security_number', '56789');

      done();
    });
  });
});
