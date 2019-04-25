'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'migrate-root-attributes';
describe(ruleName, () => {
  let rule;
  let context;
  let globals;
  let stubs;

  beforeEach(() => {
    context = new ContextBuilder()
      .build();

    globals = {
      auth0: {
        domain: 'mydomain.auth0.com',
        token: 'myToken'
      }
    };

    stubs = {
      'auth0@2.9.1': {
        ManagementClient: function (data) {
          return {
            updateUser: function (id, payload, cb) {
              cb(null, payload);
            }
          }
        }
      }
    };

    rule = loadRule(ruleName, globals, stubs);
  });

  describe('when all the mapped fields are in user_metadata', () => {
    it('should update all the fields', (done) => {
      let user = new UserBuilder().withUserMetadata({given_name: 'John', family_name: 'Doe', name: 'John Doe', nickname: 'John', picture: 'http://localhost/johndoe.png'}).build();

      rule(user, context, (e, u, c) => {
        expect(u.given_name).toBe("John");
        expect(u.family_name).toBe("Doe");
        expect(u.name).toBe("John Doe");
        expect(u.nickname).toBe("John");
        expect(u.picture).toBe("http://localhost/johndoe.png");

        expect(u.user_metadata.given_name).toBeUndefined();
        expect(u.user_metadata.family_name).toBeUndefined();
        expect(u.user_metadata.name).toBeUndefined();
        expect(u.user_metadata.nickname).toBeUndefined();
        expect(u.user_metadata.picture).toBeUndefined();

        done();
      });
    });

    it('should update only the mapped fields', (done) => {
      let user = new UserBuilder().withUserMetadata({given_name: 'John', family_name: 'Doe', name: 'John Doe', nickname: 'John', picture: 'http://localhost/johndoe.png', age: 31}).build();

      rule(user, context, (e, u, c) => {
        expect(u.given_name).toBe("John");
        expect(u.family_name).toBe("Doe");
        expect(u.name).toBe("John Doe");
        expect(u.nickname).toBe("John");
        expect(u.picture).toBe("http://localhost/johndoe.png");

        expect(u.user_metadata.age).toBe(31);
        expect(u.user_metadata.given_name).toBeUndefined();
        expect(u.user_metadata.family_name).toBeUndefined();
        expect(u.user_metadata.name).toBeUndefined();
        expect(u.user_metadata.nickname).toBeUndefined();
        expect(u.user_metadata.picture).toBeUndefined();

        done();
      });
    });
  });

  describe('when one mapped field is in user_metadata', () => {
    it('should update the given_name', (done) => {
      let user = new UserBuilder().withUserMetadata({given_name: 'John'}).build();

      rule(user, context, (e, u, c) => {
        expect(u.given_name).toBe("John");
        expect(u.family_name).toBeUndefined();
        expect(u.name).toBe("Super User");
        expect(u.nickname).toBe("Super User");
        expect(u.picture).toBe("http://localhost/photo.png");

        expect(u.user_metadata.given_name).toBeUndefined();

        done();
      });
    });

    it('should update only the given_name', (done) => {
      let user = new UserBuilder().withUserMetadata({given_name: 'John', age: 31}).build();

      rule(user, context, (e, u, c) => {
        expect(u.given_name).toBe("John");
        expect(u.family_name).toBeUndefined();
        expect(u.name).toBe("Super User");
        expect(u.nickname).toBe("Super User");
        expect(u.picture).toBe("http://localhost/photo.png");

        expect(u.user_metadata.age).toBe(31);
        expect(u.user_metadata.given_name).toBeUndefined();

        done();
      });
    });
  });

  describe('when there is no mapped field is in user_metadata', () => {
    it('should not update the given_name', (done) => {
      let user = new UserBuilder().withUserMetadata({age: 31}).build();

      rule(user, context, (e, u, c) => {
        expect(u.given_name).toBeUndefined();
        expect(u.family_name).toBeUndefined();
        expect(u.name).toBe("Super User");
        expect(u.nickname).toBe("Super User");
        expect(u.picture).toBe("http://localhost/photo.png");

        expect(u.user_metadata.given_name).toBeUndefined();

        done();
      });
    });
  });
});
