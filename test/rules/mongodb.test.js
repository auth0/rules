'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'mongodb';

describe(ruleName, () => {
  let context;
  let rule;

  const mongo = (connString, callback) => {
    expect(connString).toEqual('mongodb://user:password@server:port/db');

    const users = {
      findOne: (options, cb) => {
        if (options.email === 'broken@example.com') {
          return cb(new Error('db error'));
        }

        if (options.email === 'empty@example.com') {
          return cb();
        }

        expect(options.email).toEqual('duck.t@example.com');
        return cb(null, { foo: 'bar' });
      }
    };

    const collection = (collName) => {
      expect(collName).toEqual('users');
      return users;
    };

    callback({ collection });
  };

  beforeEach(() => {
    rule = loadRule(ruleName, { mongo });

    const request = new RequestBuilder().build();
    context = new ContextBuilder()
      .withRequest(request)
      .build();
  });

  describe('should extract user data', () => {
    it('and attach it to the context.idToken', (done) => {
      rule({ email: 'duck.t@example.com' }, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(c.idToken['https://example.com/foo']).toEqual('bar');
        done();
      });
    });
  });

  describe('should do nothing', () => {
    it('if there is no such user in the database', (done) => {
      rule({ email: 'empty@example.com' }, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(c.idToken['https://example.com/foo']).toBeFalsy();
        done();
      });
    });
  });

  describe('should throw error', () => {
    it('if db error occurs', (done) => {
      rule({ email: 'broken@example.com' }, context, (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('db error');
        done();
      });
    });
  });
});
