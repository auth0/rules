const rule = require('./access-on-weekdays-only-for-an-app')

describe('access-on-weekdays-only-for-an-app', () => {
  let user;
  let context;
  let globals;

  beforeEach(() => {
    context = {
      clientName: 'TheAppToCheckAccessTo'
    };
    global.UnauthorizedError = function() {}
  });

  describe('when day is weekend', () => {
    beforeEach(() => {
      global.Date.getDay = jest.genMockFunction().mockReturnValue(6)
    })
    it('should return UnauthorizedError', (done) => {
      rule(user, context, (err, user, context) => {
        expect(err).toBeInstanceOf(global.UnauthorizedError);
        done();
      });
    });
  })
});
