'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RiskAssessmentBuilder = require('../utils/riskAssessmentBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'adaptive-mfa-custom-confidence';

describe(ruleName, () => {
  let rule;

  beforeEach(() => {
    rule = loadRule(ruleName);
  });

  const givenEnrolledUser = () => {
    return new UserBuilder().withMultifactor(['guardian']).build();
  };

  const givenNotEnrolledUser = () => {
    return new UserBuilder().withMultifactor([]).build();
  };

  describe('when confidence is high', () => {
    it('should not set multifactor', (done) => {
      const user = givenEnrolledUser();
      const riskAssessment = new RiskAssessmentBuilder()
        .withConfidence('high')
        .build();
      const context = new ContextBuilder()
        .withRiskAssessment(riskAssessment)
        .build();

      rule(user, context, (err, u, c) => {
        expect(c.multifactor).toBeUndefined();

        done();
      });
    });
  });

  describe('when confidence of ImpossibleTravel is low', () => {
    it("should set multifactor provider to 'any'", (done) => {
      const user = givenEnrolledUser();
      const riskAssessment = new RiskAssessmentBuilder()
        .withAssessmentConfidence('ImpossibleTravel', 'low')
        .build();
      const context = new ContextBuilder()
        .withRiskAssessment(riskAssessment)
        .build();

      rule(user, context, (err, u, c) => {
        expect(c.multifactor.provider).toBe('any');
        expect(c.multifactor.allowRememberBrowser).toBe(false);

        done();
      });
    });
  });

  describe('when confidence of ImpossibleTravel is low for unenrolled user', () => {
    it('should not set multifactor', (done) => {
      const user = givenNotEnrolledUser();
      const riskAssessment = new RiskAssessmentBuilder()
        .withAssessmentConfidence('ImpossibleTravel', 'low')
        .build();
      const context = new ContextBuilder()
        .withRiskAssessment(riskAssessment)
        .build();

      rule(user, context, (err, u, c) => {
        expect(c.multifactor).toBeUndefined();

        done();
      });
    });
  });
});
