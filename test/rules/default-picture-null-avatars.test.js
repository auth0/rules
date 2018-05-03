'use strict';

const loadRule = require('../utils/load-rule');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'default-picture-null-avatars';
describe(ruleName, () => {
  let globals;
  let rule;
  let user;

  beforeEach(() => {

    user = new UserBuilder()
      .withPicture('https://cdn.auth0.com/test.png')
      .build();

    rule = loadRule(ruleName);
  });

  it('should set the picture on the user', (done) => {
    rule(user, {}, (err, user, context) => {
      expect(user.picture).toBe('https://cdn.auth0.com/test.png?d=URL_TO_YOUR_DEFAULT_PICTURE_HERE');

      done();
    });
  });
});
