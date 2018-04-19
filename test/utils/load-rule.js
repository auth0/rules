const fs = require('fs');
const path = require('path');
const decomment = require('decomment');

/**
 * Loads a rule, optionally with stubs
 *
 * @param {string} ruleFileName - file name of rule to load
 * @param {object} globals - the global context the rule is executed within
 * @param {object} stubs - modules to override when required by the rule
 **/
module.exports = function (ruleFileName, globals, stubs) {
  globals = globals || {};
  stubs = stubs || {};
  
  const fileName = path.join(__dirname, '../../src/rules', ruleFileName);

  const file = fs.readFileSync(fileName, 'utf8');

  const code =  decomment(file).trim();

  return compile(code, globals, stubs);
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
