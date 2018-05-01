'use strict';

const loadRule = require('../utils/load-rule');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'check-last-password-reset';
describe(ruleName, () => {
  const ORIGINAL_DATE = Date;
  const CURRENT_DATE_TO_USE = new Date(2018, 3, 1);  
  let rule;
  let context;
  let user;
  let globals;

  beforeEach(() => {
    globals = {
      UnauthorizedError: function() {}
    };

    rule = loadRule(ruleName, globals);
  });

  afterEach(() => {
    global.Date = ORIGINAL_DATE;
  })

  describe('when user has a last password reset', () => {
    describe('when last reset has been more than 30 days', () => {
      beforeEach(() => {
        const LAST_PASSWORD_DATE = new Date(2018, 1, 1);
        
        jest.fn((s) => {
          if(s) return LAST_PASSWORD_DATE;
          return CURRENT_DATE_TO_USE;
        });

        user = new UserBuilder()
          .withLastPasswordResetDate(LAST_PASSWORD_DATE.getTime())
          .build();
      });
      it('should return an UnauthorizedError', (done) => {  
        rule(user, context, (e, u, c) => {
          expect(e).toBeInstanceOf(globals.UnauthorizedError);
          done();
        });
      });
    });
    
    describe('when last reset has been less than 30 days', () => {
      beforeEach(() => {
        const LAST_PASSWORD_DATE = new Date(2018, 2, 15);
        global.Date = jest.fn((s) => {
          if(s) return LAST_PASSWORD_DATE;
          return CURRENT_DATE_TO_USE;
        });
        
        user = new UserBuilder()
          .withLastPasswordResetDate(LAST_PASSWORD_DATE.getTime())
          .build();
      });
      it('should not return an error', (done) => {  
        rule(user, context, (e, u, c) => {
          expect(e).toBeNull();
          done();
        });
      });
    });
  });

  describe('when user did not reset their password', () => {
    describe('when user was created more than 30 days ago', () => {
      beforeEach(() => {
        const CREATED_DATE = new Date(2018, 1, 1);
        
        jest.fn((s) => {
          if(s) return CREATED_DATE;
          return CURRENT_DATE_TO_USE;
        });

        user = new UserBuilder()
          .withCreatedAt(CREATED_DATE.getTime())
          .build();
      });
      it('should return an UnauthorizedError', (done) => {  
        rule(user, context, (e, u, c) => {
          expect(e).toBeInstanceOf(globals.UnauthorizedError);
          done();
        });
      });
    });
    
    describe('when user was created less than 30 days ago', () => {
      beforeEach(() => {
        const CREATED_DATE = new Date(2018, 2, 15);
        global.Date = jest.fn((s) => {
          if(s) return CREATED_DATE;
          return CURRENT_DATE_TO_USE;
        });
        
        user = new UserBuilder()
          .withCreatedAt(CREATED_DATE.getTime())
          .build();
      });
      it('should not return an error', (done) => {  
        rule(user, context, (e, u, c) => {
          expect(e).toBeNull();
          done();
        });
      });
    });
  });
});
