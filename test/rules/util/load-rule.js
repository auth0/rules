'use strict';

const rules = require('../../../rules.all.json');

/**
 * Loads a rule from a string, optionally with stubs
 *
 * @param {string} ruleId - id of rule to load
 * @param {object} globals - the global context the rule is executed within
 * @param {object} stubs - modules to override when required by the rule
 **/
module.exports = function (ruleId, globals, stubs) {
  globals = globals || {};
  stubs = stubs || {};

  const rule = findRule(ruleId);
  return compile(rule.code, globals, stubs);
}

function compile(code, globals, stubs) {
  function fakeRequire (moduleName) {
    if (stubs[moduleName]) {
      return stubs[moduleName];
    }

    return require(moduleName);
  }

  const globalObj = Object.assign({}, { require: fakeRequire }, globals);
  const params = Object.keys(globalObj);
  const paramValues = params.map(name => globalObj[name]);

  return Function.apply(null, params.concat(`return ${code}`)).apply(null, paramValues);
}

function findRule(ruleId) {
  for (const category of rules) {
    for (const rule of category.templates) {
      if (rule.id === ruleId) {
        return rule;
      }
    }
  }

  return null;
}
