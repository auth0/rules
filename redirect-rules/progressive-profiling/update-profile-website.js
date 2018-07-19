'use latest';

import express from 'express';
import { fromExpress } from 'webtask-tools';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import csurf from 'csurf';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import ejs from 'ejs';
import _ from 'lodash';

const app = express();

app.use(cookieSession({
  name: 'session',
  secret: 'shhh...',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const csrfProtection = csurf();

app.get('/', verifyInputToken, csrfProtection, (req, res) => {
  // get required fields from JWT passed from Auth0 rule
  const requiredFields = req.tokenPayload[`${req.webtaskContext.secrets.TOKEN_ISSUER}/claims/required_fields`];
  // store data in session that needs to survive the POST
  req.session.subject = req.tokenPayload.sub;
  req.session.requiredFields = requiredFields;
  req.session.state = req.query.state;

  // render the profile form
  const data = { 
    subject: req.tokenPayload.sub,
    csrfToken: req.csrfToken(),
    fields: {},
    action: req.originalUrl.split('?')[0]
  };
  requiredFields.forEach((field) => {
    data.fields[field] = {};
  });

  const html = renderProfileView(data);

  res.set('Content-Type', 'text/html');
  res.status(200).send(html);
});

const parseBody = bodyParser.urlencoded({ extended: false });

app.post('/', parseBody, csrfProtection, validateForm, (req, res) => {
  if (req.invalidFields.length > 0) {
    // render the profile form again, showing validation errors
    const data = { 
      subject: req.session.subject,
      csrfToken: req.csrfToken(),
      fields: {},
      action: ''
    };
    req.session.requiredFields.forEach((field) => {
      data.fields[field] = { 
        value: req.body[field],
        invalid: req.invalidFields.includes(field)
      };
    });

    const html = renderProfileView(data);

    res.set('Content-Type', 'text/html');
    return res.status(200).send(html);
  }

  // render form that auth-posts back to Auth0 with collected data
  const formData = _.omit(req.body, '_csrf');
  const HTML = renderReturnView({
    action: `https://${req.webtaskContext.secrets.AUTH0_DOMAIN}/continue?state=${req.session.state}`,
    formData
  });

  // clear session
  req.session = null;

  res.set('Content-Type', 'text/html');
  res.status(200).send(HTML);
});

module.exports = fromExpress(app);

// middleware functions

function verifyInputToken(req, res, next) {
  const options = {
    issuer: req.webtaskContext.secrets.TOKEN_ISSUER,
    audience: req.webtaskContext.secrets.TOKEN_AUDIENCE
  }
  
  try {
    req.tokenPayload = jwt.verify(req.query.token, req.webtaskContext.secrets.TOKEN_SECRET, options);
  } catch (err) {
    return next(err);
  }
  return next();
}

function validateForm(req, res, next) {
  const requiredFields = req.session.requiredFields;

  const validation = {
    given_name: value => value && value.trim().length > 0,
    family_name: value => value && value.trim().length > 0,
    birthdate: value => value && value === moment(value).format('YYYY-MM-DD')
  }
  
  req.invalidFields = [];
  requiredFields.forEach((field) => {
    if (!validation[field](req.body[field])) {
      req.invalidFields.push(field);
    }
  });

  next();
}

// view functions

function renderProfileView(data) {
  const template = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>User Profile</title>
      <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    </head>

    <body>
      <div class="jumbotron">
        <div class="container">
          <div class="row" style="padding-top: 20px;">
            <div class="col-md-6 col-sm-offset-2">
              <p class="lead">Hello <strong><%= subject %></strong>, we just need a couple more things from you to complete your profile:</p>
            </div>
          </div>
          
          <form class="form-horizontal" method="post" action="<%= action %>">
            <input type="hidden" name="_csrf" value="<%= csrfToken %>">
          
            <% if (fields.given_name) { %>
            <div class="form-group<% if (fields.given_name.invalid) { %> has-error<% } %>">
              <label for="given_name" class="col-sm-2 control-label">First Name</label>
              <div class="col-sm-4">
                <input type="text" class="form-control" id="given_name" name="given_name" placeholder="Mary" value="<%= fields.given_name.value %>">
              </div>
            </div>
            <% } %>
    
            <% if (fields.family_name) { %>
            <div class="form-group<% if (fields.family_name.invalid) { %> has-error<% } %>">
            <label for="family_name" class="col-sm-2 control-label">Family Name</label>
              <div class="col-sm-4">
                <input type="text" class="form-control" id="family_name" name="family_name" placeholder="Smith" value="<%= fields.family_name.value %>">
              </div>
            </div>
            <% } %>
            
            <% if (fields.birthdate) { %>
            <div class="form-group<% if (fields.birthdate.invalid) { %> has-error<% } %>">
            <label for="birthdate" class="col-sm-2 control-label">Birthday</label>
              <div class="col-sm-4">
                <input type="date" class="form-control" id="birthdate" name="birthdate" value="<%= fields.birthdate.value %>">
              </div>
            </div>
            <% } %>
            
            <div class="form-group">
              <div class="col-sm-offset-2 col-sm-10">
                <button type="submit" class="btn btn-default">Submit</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return ejs.render(template, data);
}

function renderReturnView (data) {
  const template = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>

    <body>
      <form id="return_form" method="post" action="<%= action %>">
        <% Object.keys(formData).forEach((key) => { %>
        <input type="hidden" name="<%= key %>" value="<%= formData[key] %>">
        <% }); %>
      </form>
      <script>
        // automatically post the above form
        var form = document.getElementById('return_form');
        form.submit();
      </script>
    </body>
    </html>
  `;
  
  return ejs.render(template, data);  
}
