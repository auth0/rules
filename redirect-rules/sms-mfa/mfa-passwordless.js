var Express = require('express');
var Webtask = require('webtask-tools');
var jwt = require('jsonwebtoken');

var app = Express();

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

var Promise = require("bluebird");
var request = Promise.promisify(require("request"));

app.get('/', function (req, res) {

  var callback_url = "https://webtask.it.auth0.com/api/run/"+req.x_wt.container+"/"+req.x_wt.jtn+"/widget-callback";

  var token = req.query.token;

  jwt.verify(token, new Buffer(req.webtaskContext.data.client_secret,'base64'), function(err, decoded) {

    if (err) {
      res.end('error');
      return;
    }

    decoded.token = token;
    if (decoded.sms_identity === null) {
      res.end('error');
      return;
    } else {

      sendCodeAndShowPasswordlessSecondStep(res, callback_url, req.webtaskContext, decoded);
    }
  });

});

app.post('/', function (req, res) {
  var token = req.body.token;

  jwt.verify(token, new Buffer(req.webtaskContext.data.client_secret,'base64'), function(err, decoded) {

    if (err) {
      res.end('error on callback token verification');
      return;
    }

    request({
      method: 'POST',
      url: "https://" + req.webtaskContext.data.auth0_domain + "/passwordless/verify",
      json: {
        connection: "sms",
        phone_number: decoded.sms_identity.profileData.phone_number,
        verification_code: req.body.code
      }
    }).then(function(response){
      redirectBack(res, req.webtaskContext, decoded, response[0].statusCode === 200);
    }).catch(function(e){
      console.log('ERROR VERIFYING', e);
       //A client error like 400 Bad Request happened
    });

  });
});

function redirectBack(res, webtaskContext, decoded, success) {
  var token = jwt.sign({
      status: success ? 'ok' : 'fail'
    }, 
    new Buffer(webtaskContext.data.client_secret, 'base64'),
    {
      subject: decoded.sub,
      expiresInMinutes: 1,
      audience: decoded.aud,
      issuer: 'urn:auth0:sms:mfa'
    });

  res.writeHead(301, {Location: 'https://'+ webtaskContext.data.auth0_domain + "/continue" + "?id_token=" + token});
  res.end();
}

function sendCodeAndShowPasswordlessSecondStep(res, callback_url, webtaskContext, decoded_token) {
  request({
    method: 'POST',
    url: "https://" + webtaskContext.data.auth0_domain + "/passwordless/start",
    json: {
      client_id: decoded_token.aud,
      connection: "sms",
      phone_number: decoded_token.sms_identity.profileData.phone_number
    }
  }).then(function(response){

    showPasswordlessSecondStep(res, callback_url, webtaskContext, decoded_token);

  }).catch(function(e){
    console.log('ERROR SENDING SMS', e);
     //A client error like 400 Bad Request happened
  });
}

function showPasswordlessSecondStep(res, callback_url, webtaskContext, decoded_token){
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });

  res.end(require('ejs').render(passwordlessSecondStepForm.stringify(), {
      token: decoded_token.token,
      phone_number: decoded_token.sms_identity.profileData.phone_number
    }
  ));
}

function passwordlessSecondStepForm() {
/*
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="https://cdn.auth0.com/styleguide/1.0.0/img/badge.png">
    <meta charset="UTF-8">
    <title>Auth0 - SMS multifactor authentication</title>
    <style>html{box-sizing:border-box}*,*:before,*:after{box-sizing:inherit}@font-face{font-family:'avenir roman';src:url("https://cdn.auth0.com/fonts/avenir/avenir-roman.eot");src:url("https://cdn.auth0.com/fonts/avenir/avenir-roman.eot?#iefix") format('embedded-opentype'),url("https://cdn.auth0.com/fonts/avenir/avenir-roman.woff") format('woff'),url("https://cdn.auth0.com/fonts/avenir/avenir-roman.ttf") format('truetype');font-weight:500;font-style:normal}@font-face{font-family:'avenir medium';src:url("https://cdn.auth0.com/fonts/avenir/avenir-medium.eot");src:url("https://cdn.auth0.com/fonts/avenir/avenir-medium.eot?#iefix") format('embedded-opentype'),url("https://cdn.auth0.com/fonts/avenir/avenir-medium.woff") format('woff'),url("https://cdn.auth0.com/fonts/avenir/avenir-medium.ttf") format('truetype');font-weight:500;font-style:normal}@font-face{font-family:'avenir book';src:url("https://cdn.auth0.com/fonts/avenir/avenir-book.eot");src:url("https://cdn.auth0.com/fonts/avenir/avenir-book.eot?#iefix") format('embedded-opentype'),url("https://cdn.auth0.com/fonts/avenir/avenir-book.woff") format('woff'),url("https://cdn.auth0.com/fonts/avenir/avenir-book.ttf") format('truetype');font-weight:normal;font-style:normal}@font-face{font-family:'ProximaNova Regular';src:url("https://cdn.auth0.com/fonts/proxima-nova/proximanova-regular-webfont-webfont.eot");src:url("https://cdn.auth0.com/fonts/proxima-nova/proximanova-regular-webfont-webfont.eot?#iefix") format('embedded-opentype'),url("https://cdn.auth0.com/fonts/proxima-nova/proximanova-regular-webfont-webfont.woff") format('woff');font-weight:normal;font-style:normal}@font-face{font-family:"budicon-font";src:url("https://cdn.auth0.com/fonts/budicons/fonts/budicon-font.eot");src:url("https://cdn.auth0.com/fonts/budicons/fonts/budicon-font.eot?#iefix") format("embedded-opentype"),url("https://cdn.auth0.com/fonts/budicons/fonts/budicon-font.woff") format("woff"),url("https://cdn.auth0.com/fonts/budicons/fonts/budicon-font.ttf") format("truetype"),url("https://cdn.auth0.com/fonts/budicons/fonts/budicon-font.svg#budicon-font") format("svg");font-weight:normal;font-style:normal}html,body{height:100%;margin:0;padding:0;font-size:62.5%;min-height:100%;width:100%;background-color:#222228;z-index:1}.modal-wrapper{width:100%;height:100%;display:table;background-color:rgba(0,0,0,0.15);z-index:2;-webkit-animation:fadein 1s;-moz-animation:fadein 1s;-ms-animation:fadein 1s;-o-animation:fadein 1s;animation:fadein 1s}.modal-centrix{padding:0;vertical-align:middle;display:table-cell;margin:0}.modal{width:100%;max-width:300px;z-index:3;border-radius:0;box-shadow:0 2px 4px rgba(0,0,0,0.5);margin:auto;}@media (min-width:414px){.modal{border-radius:5px;top:calc(50% + 40px)}}.modal .head{background:#efefef;background:-moz-linear-gradient(left,#efefef 0%,#fefefe 50%,#efefef 100%);background:-webkit-gradient(linear,left top,right top,color-stop(0%,#efefef),color-stop(50%,#fefefe),color-stop(100%,#efefef));background:-webkit-linear-gradient(left,#efefef 0%,#fefefe 50%,#efefef 100%);background:-o-linear-gradient(left,#efefef 0%,#fefefe 50%,#efefef 100%);background:-ms-linear-gradient(left,#efefef 0%,#fefefe 50%,#efefef 100%);background:linear-gradient(to right,#efefef 0%,#fefefe 50%,#efefef 100%);text-align:center;height:132px;}@media (min-width:414px){.modal .head{border-radius:5px 5px 0 0}}.modal .head .logo{display:inline-block;margin:14px auto 0 auto;width:53px}.modal .head .first-line{display:block;line-height:30px;height:30px;margin:15px 0 0 0;font-family:'Avenir Roman';font-weight:normal;font-size:2.2rem;color:#000;}@media (min-width:414px){.modal .head .first-line{margin:9px 0 0 0}}.modal .head .second-line{display:block;line-height:16px;height:16px;margin:3px 0 21px 0;font-family:'Avenir Medium';font-weight:normal;font-size:1.2rem;color:#000;text-transform:uppercase}.modal .errors{text-align:center;background-color:#f04848;color:#fff;line-height:2;font-size:12px;font-family:'Avenir';font-weight:normal;padding:6px 20px;}.modal .errors.hidden{display:none}.modal .body{background-color:#fff;padding:30px 40px;overflow:hidden;}.modal .body .description{display:block;max-width:290px;margin:10px auto;font-family:'Avenir Book';font-weight:normal;font-size:13px;line-height:1.8;color:#666;text-align:center;}@media (min-width:414px){.modal .body .description{max-width:348px}}.modal .body .description span{color:rgba(0,0,0,0.8)}.modal .body .auth0-lock.auth0-lock .auth0-lock-input-wrap{border-radius:3px;border:1px solid #f1f1f1;position:relative;background:#f1f1f1;padding-left:40px;-webkit-transition:border-color .8s;transition:border-color .8s}.modal .body .auth0-lock-input-wrap{border-radius:3px;border:1px solid #f1f1f1;position:relative;background:#f1f1f1;padding-left:40px;-webkit-transition:border-color .8s;transition:border-color .8s}.modal .body .auth0-lock-input-wrap .auth0-lock-icon.auth0-lock-icon-box{width:12px;height:14px;top:13px;left:14px;position:absolute;font-size:12px}.modal .body .auth0-lock-input-wrap .auth0-lock-input{border:0;padding:0 14px;right:0;height:40px;font-size:13px;width:100%;border-radius:0 2px 2px 0;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:relative;color:#727578}.modal .body input[type=text]{border:none;border-bottom:1px solid #ddd;height:21px;margin-right:2px;font-family:'Avenir Book';font-weight:normal;font-size:1.6rem;outline:none;width:315px}.modal .ok-cancel{display:block;width:100%;overflow:hidden;}.modal .ok-cancel button{height:75px;vertical-align:middle;width:50%;float:left;border:0;padding:5px 0 0 0;text-align:center;cursor:pointer;}.modal .ok-cancel button .icon{color:#fff;font-size:35px}.modal .ok-cancel button.ok{background-color:#ea5323;}.modal .ok-cancel button.ok:hover{background-color:#ac3610}.modal .ok-cancel button.ok.full-width{width:100%}@media (min-width:414px){.modal .ok-cancel button.ok{border-radius:0 0 5px 0}.modal .ok-cancel button.ok.full-width{border-radius:0 0 5px 5px}}.modal .ok-cancel button.cancel{background-color:#5c666f;}@media (min-width:414px){.modal .ok-cancel button.cancel{border-radius:0 0 0 5px}}[data-icon]:before{font-family:"budicon-font" !important;content:attr(data-icon);font-style:normal !important;font-weight:normal !important;font-variant:normal !important;text-transform:none !important;speak:none;line-height:1;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}[class^="icon-"]:before,[class*=" icon-"]:before{font-family:"budicon-font" !important;font-style:normal !important;font-weight:normal !important;font-variant:normal !important;text-transform:none !important;speak:none;line-height:1;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.icon-budicon-377:before{content:""}.icon-budicon-509:before{content:""}.icon-budicon-460:before{content:""}.custom-select{display:inline-block;vertical-align:top;position:relative;border-radius:3px;height:32px;line-height:32px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;font-size:1.6rem;padding-right:28px;}.custom-select:hover{color:#333}.custom-select i{font-size:12px;position:absolute;top:3px;right:9px;opacity:.7;animation:none}.custom-select span{color:#000;border-bottom:1px solid #6b6b6b;padding-bottom:1px;text-transform:uppercase}.custom-select select{position:absolute;top:0;left:0;width:100%;height:100%;opacity:0}@-moz-keyframes fadein{from{opacity:0}to{opacity:1}}@-webkit-keyframes fadein{from{opacity:0}to{opacity:1}}@-ms-keyframes fadein{from{opacity:0}to{opacity:1}}@-o-keyframes fadein{from{opacity:0}to{opacity:1}}.auth0-spinner{position:relative;}.auth0-spinner:before{content:"";display:block;background:url("data:image/png;base64,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");height:30px;width:30px;background-position:center center;background-repeat:no-repeat;background-size:contain;display:inline-block;top:50%;left:50%;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%);position:absolute}.auth0-spinner .icon{display:none}.auth0-spinner .spinner{margin:0 auto;font-size:8px;top:-4px;position:relative;text-indent:-9999em;border-top:.6em solid rgba(255,255,255,0.2);border-right:.6em solid rgba(255,255,255,0.2);border-bottom:.6em solid rgba(255,255,255,0.2);border-left:.6em solid #fff;-webkit-animation:loaderAnim .8s infinite linear;animation:loaderAnim .8s infinite linear;}.auth0-spinner .spinner,.auth0-spinner .spinner:after{border-radius:50%;width:60px;height:60px}@-webkit-keyframes loaderAnim{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes fadeIn{0%{opacity:0}100%{opacity:1}}@-moz-keyframes fadein{from{opacity:0}to{opacity:1}}@-webkit-keyframes fadein{from{opacity:0}to{opacity:1}}@-o-keyframes fadein{from{opacity:0}to{opacity:1}}@keyframes fadein{from{opacity:0}to{opacity:1}}@-moz-keyframes loaderAnim{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes loaderAnim{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-o-keyframes loaderAnim{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes loaderAnim{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-moz-keyframes fadeIn{0%{opacity:0}100%{opacity:1}}@-webkit-keyframes fadeIn{0%{opacity:0}100%{opacity:1}}@-o-keyframes fadeIn{0%{opacity:0}100%{opacity:1}}@keyframes fadeIn{0%{opacity:0}100%{opacity:1}}</style>
  </head>
  <body>
    <div class="modal-wrapper">
      <div class="modal-centrix">
        <div class="modal">
          <form onsubmit="showSpinner();" action="" method="POST" enctype="application/x-www-form-urlencoded">
            <input type="hidden" name="token" value="<%- token %>" />
            <div class="head"><img src="https://cdn.auth0.com/styleguide/2.0.9/lib/logos/img/badge.png" class="logo auth0"><span class="first-line">Auth0</span></div>
            <div class="body"><span class="description">An SMS with the code has been sent to <%- phone_number %>.</span>
              <div class="auth0-lock-input-wrap"><span>
                  <svg width="12px" height="14px" viewBox="0 0 12 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" class="auth0-lock-icon auth0-lock-icon-box">
                    <g stroke="none" stroke-width="1" fill="none" fill- rule="evenodd" sketch:type="MSPage">
                      <g transform="translate(-964.000000, -3509.000000)" fill="#888888">
                        <g transform="translate(915.000000, 3207.000000)">
                          <g transform="translate(35.000000,289.000000)">
                            <path id="Fill-42" d="M25.0523108,22.8115806 L20.455448,26.0692401 L20.455448,20.6336024 L25.0523108,17.6924012 L25.0523108,22.8115806 L25.0523108,22.8115806 Z M20.1658456,19.763342 C20.1060864,19.786611 20.050924,19.8145338 19.9957617,19.8471103 C19.9451962,19.8191876 19.8946307,19.786611 19.8394683,19.7679958 L14.9392126,16.7616414 L19.986568,13.8949009 L25.0523108,16.7616414 L25.043117,16.7662952 L20.1658456,19.763342 L20.1658456,19.763342 Z M19.5360754,20.6336024 L19.5360754,26.0692401 L14.9392126,22.8115806 L14.9392126,17.6924012 L19.5360754,20.6336024 L19.5360754,20.6336024 Z M25.9716833,17.6924012 C25.9716833,17.5574411 25.9395053,17.4317885 25.8889398,17.3154435 C26.0728143,16.9664085 26.0314425,16.5242976 25.7418402,16.2311082 L20.4002856,13.2340614 C19.7980966,12.9408721 20.2393954,12.9036417 19.5590597,13.2340614 L14.2634738,16.2311082 C13.9692745,16.5242976 13.9279028,16.9571009 14.1071804,17.3107897 C14.0520181,17.4271347 14.01984,17.5527873 14.01984,17.6924012 L14.01984,22.8115806 C14.01984,23.3234985 14.4335577,23.7423404 14.9392126,23.7423404 L19.5360754,27 C19.7061593,27 19.8578558,26.9395006 19.9957617,26.8557322 C20.1336676,26.9395006 20.285364,27 20.455448,27 L25.511997,23.7423404 C26.017652,23.7423404 25.9716833,23.3234985 25.9716833,22.8115806 L25.9716833,17.6924012 L25.9716833,17.6924012 Z"></path>
                          </g>
                        </g>
                      </g>
                    </g>
                  </svg></span>
                <input type="tel" name="code" autocomplete="off" autocapitalize="off" value="" placeholder="Your code" tabindex="101" class="auth0-lock-input auth0-lock-input-code">
              </div>
            </div>
            <div id="ok-button" class="ok-cancel">
              <button class="ok full-width">
                <div class="icon icon-budicon-509"></div>
                <div class="spinner"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
      <script>
        function showSpinner() {
          document.getElementById('ok-button').className += " auth0-spinner";
        }
      </script>
    </div>
  </body>
</html>
*/
}

module.exports = Webtask.fromExpress(app);