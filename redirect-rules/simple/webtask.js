var util = require('util');

module.exports = function (context, req, res) {
  if (req.method !== 'GET') {
    res.writeHead(405);
    return res.end('Method not allowed');
  }

  var action = util.format('https://%s/continue?state=%s',
    context.data.auth0_domain,
    // return whatever state value was passed from the rule
    context.data.state || '');

  res.writeHead(200, { 'Content-Type': 'text/html '});
  res.end(
    '<html>' +
    '<head><title>Sample Consent Form</title></head>' +
    '<body>' +
    '<h1>Sample Consent Form</h1>' +
    '<p>To continue, please accept this consent form.</p>' +
    '<form action="' + action + '" method="post">' +
    '<input type="checkbox" name="confirm" value="yes"> I agree<br>' +
    '<br>' +
    '<input type="submit" value="Submit">' +
    '</form>' +
    '</body>' +
    '</html>'
  );
};
