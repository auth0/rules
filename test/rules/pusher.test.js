'use strict';

const crypto = require('crypto');

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'pusher';

describe(ruleName, () => {
  let context;
  let rule;

  beforeEach(() => {
    rule = loadRule(ruleName, { crypto });
  });

  describe('should do nothing', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();
    });

    it('if no context.request.query.channel', (done) => {
      rule({}, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(c.idToken['https://example.com/pusherAuth']).toBeFalsy();
        done();
      });
    });
  });

  describe('should add pusher key', () => {
    beforeEach(() => {
      const request = new RequestBuilder().build();
      context = new ContextBuilder()
        .withRequest(request)
        .build();

      context.request.query.channel = 'pusher-test-channel';
      context.request.query.socket_id = 'pusher-test-socket_id';
    });

    it('if possible', (done) => {
      rule({}, context, (err, u, c) => {
        expect(err).toBeFalsy();
        expect(c.idToken['https://example.com/pusherAuth']).toEqual('YOUR PUSHER KEY:025e78e3e3daef9432d74ae135deac03cf7cdfa9b537523e6898cffe80d96e92');
        done();
      });
    });
  });
});
