const aws = require('aws-sdk');
const rules = require('./rules.json');
require('dotenv').config();

(function () {
  if (!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET || !process.env.S3_REGION || !process.env.S3_BUCKET) {
    console.log('AWS S3 settings missing. S3_ACCESS_KEY, S3_SECRET, S3_REGION and S3_BUCKET settings are required.');
    process.exit(1);
  }

  console.log(`Deploying rules.json into ${process.env.S3_BUCKET} bucket...`);

  const S3 = new aws.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET,
    sessionToken: process.env.S3_SESSION_TOKEN,
    region: process.env.S3_REGION,
    params: {
      Bucket: process.env.S3_BUCKET
    }
  });

  const params = {
    Body: JSON.stringify(rules),
    Key: 'rules/rules.json',
    ContentType: 'application/json'
  };

  return S3.putObject(params, function(err) {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    console.log('rules.json deployed successfully.');
    process.exit();
  });
})();
