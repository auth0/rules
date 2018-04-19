const loadRule = require('../utils/load-rule');

describe('access-on-weekdays-only-for-an-app', () => {
  let user;
  let context;
  let rule;

  beforeEach(() => {
    context = {
      clientName: 'TheAppToCheckAccessTo'
    };
    global.UnauthorizedError = function() {};

    rule = loadRule('access-on-weekdays-only-for-an-app.js');
  });

  describe('when day is weekend', () => {
    beforeEach(() => {
      global.Date.getDay = jest.genMockFunction().mockReturnValue(6);
    })
    it('should return UnauthorizedError', (done) => {
      rule(user, context, (err, user, context) => {
        expect(err).toBeInstanceOf(global.UnauthorizedError);
        done();
      });
    });
  })
  describe('when day is week day', () => {
    beforeEach(() => {
      global.Date.getDay = jest.genMockFunction().mockReturnValue(3);
    })
    it('should return no error', (done) => {
      rule(user, context, (err, cbUser, cbContext) => {
        expect(err).toBeNull();
        expect(user).toBe(user);
        expect(context).toBe(context);
        done();
      });
    });
  })
});
