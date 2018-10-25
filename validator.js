const _ = require('lodash');
const Ajv = require('ajv');
const yargs = require('yargs');

const argv = yargs
  .option('schema', {
    alias: 's',
    default: __dirname + '/schema.json'
  })
  .option('file', {
    alias: 'f',
    default: __dirname + '/rules.json'
  })
  .argv;

const schema = require(argv.schema);
const data = require(argv.file);

const ajv = new Ajv();
const validate = ajv.compile(schema);
const valid = validate(data);

const errors = validate.errors || [];

console.log(`Validating ${argv.file} ...`);

if (!valid) {
  console.log(errors);
  process.exit(errors.length);
}

_.each(data, (category) => {
  _.each(category.templates, (template, index) => {
    let templateFunction, error = 'not a function';
    try {
      templateFunction = eval(`(${template.code})`);
    }
    catch (e) {
      error = e.message || e;
    }

    if (typeof templateFunction !== 'function') errors.push(`${category.name}(${index}) - ${template.id}: broken code - ${error}`);
    if (template.categories.indexOf(category.name) < 0) errors.push(`${category.name}(${index}) - ${template.id}: category mismatch.`);
  });
});

if (errors.length) console.log(errors);
else console.log('Success!');

process.exit(errors.length);
