'use strict';

// See: https://auth0.com/docs/user-profile/user-profile-structure
class UserBuilder {
  constructor() {
    this.user =
    {
      user_id: '12345',
      username: 'superuser',
      user_metadata: {},
      updated_at: 1524716462548,
      picture: 'http://localhost/photo.png',
      phone_verified: true,
      email: 'superuser@users.com',
      email_verified: true,
      nickname: 'Super User',
      name: 'Super User',
      blocked: false,
      logins_count: 12,
      last_login: 1524716697791,
      last_ip: '52.122.42.32',
      app_metadata: {},
      multifactor: [],
      identities: [
        {
          connection: 'conn1',
          isSocial: true,
          provider: 'Facebook',
          user_id: 'fb/12345',
        }
      ]
    }
  }
  withUserMetadata(metadata) {
    this.user.user_metadata = metadata;
    return this;
  }
  withGroups(groups) {
    this.user.groups = groups;
    return this;
  }
  withCreatedAt(createdAt) {
    this.user.created_at = createdAt;
    return this;
  }
  withLastPasswordResetDate(lastPasswordReset) {
    this.user.last_password_reset = lastPasswordReset;
    return this;
  }
  build() {
    return this.user;
  }
}

module.exports = UserBuilder;