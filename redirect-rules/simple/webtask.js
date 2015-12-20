var util = require('util');
var ejs = require('ejs');

function hereDoc(f) {
  return f.toString().
    replace(/^[^\/]+\/\*!?/, '').
    replace(/\*\/[^\/]+$/, '');
}

module.exports = function (context, req, res) {
  if (req.method !== 'GET') {
    res.writeHead(405);
    return res.end('Method not allowed');
  }

  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Cache-Control': 'no-cache'
  });
  res.end(ejs.render(hereDoc(consentForm), {
    title: 'Sample Consent Form',
    action: util.format('https://%s/continue?state=%s',
      context.data.auth0_domain,
      // return whatever state value was passed from the rule
      context.data.state || '')
  }));
};

function consentForm() {
  /*
  <!DOCTYPE html>
  <html lang="en">
    <head>
    <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title><%-title %></title>

      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
      <link href="//cdn.auth0.com/styleguide/latest/lib/logos/img/favicon.png" rel="shortcut icon">

      <style>
        body { padding-top: 20px; padding-bottom: 20px; }
        .jumbotron { text-align: center; border-bottom: 1px solid #e5e5e5; }
        .jumbotron .btn { padding: 14px 24px; font-size: 21px; }
      </style>
    </head>

    <body>
      <div class="container">
        <div class="jumbotron">
          <h1><%-title %></h1>

          <p>To continue, please accept this consent form.</p>

          <form action="<%-action %>" method="get">
            <div class="checkbox">
              <label>
                <input type="checkbox" name="confirm" value="yes"> I agree
              </label>
            </div>
            <input type="submit" class="btn btn-lg btn-success" value="Submit">
          </form>
        </div>
      </div>
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
    </body
  </html>
  */
}
