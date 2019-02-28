'use strict';

class AuthenticationBuilder {
  constructor() {
    this.authentication = {
      methods: [
        {
          name: 'pwd',
          timestamp: 1434454643024
        }
      ]
    }
  }
  withMethods(methods) {
    this.authentication.methods = methods;
    return this;
  }
  build() {
    return this.authentication;
  }
}

module.exports = AuthenticationBuilder;
