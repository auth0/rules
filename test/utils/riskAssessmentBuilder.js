'use strict';

class RiskAssessmentBuilder {
  constructor() {
    this.riskAssessment = {
      confidence: 'high',
      version: '1',
      assessments: {
        UntrustedIP: {
          confidence: 'high',
          code: 'not_found_on_deny_list'
        },
        NewDevice: {
          confidence: 'high',
          code: 'match',
          details: {
            device: 'known',
            useragent: 'known',
          }
        },
        ImpossibleTravel: {
          confidence: 'high',
          code: 'minimal_travel_from_last_login'
        }
      }
    }
  }
  withConfidence(confidence) {
    this.riskAssessment.confidence = confidence;
    return this;
  }
  withAssessmentConfidence(assessmentKey, confidence) {
    this.riskAssessment.assessments[assessmentKey].confidence = confidence;
    return this;
  }
  build() {
    return this.riskAssessment;
  }
}

module.exports = RiskAssessmentBuilder;
