# Redirect Rule: Self-Service Active Directory Password Reset Policy

## Introduction

The Auth0 AD/LDAP Connector allows users to authenticate to any type of application (mobile, cloud, ...) using their existing AD/LDAP credentials. But very often these account are subject to specific policies like password reset policies.

In a traditional environment where customers are working on a domain joined machine within the corporate network these policies are easy to enforce: the next time users try to sign-in to their machine they'll be prompted to renew their password.

But in modern environments where users are working remote or not even using a Windows machine or even a desktop machine it becomes harder to enforce these policies. 

This is where redirect rules can be of great value. These rules can be used to enforce policies after the user has logged in and before they get to access any of your applications. You can use this for custom MFA but also to enforce password policies for example.

The following sample will show how to interrupt the login flow for users that haven't changed their password in the last 30 days. They will be prompted to change their password after which the flow will continue and they'll be able to access enterprise applications.

## Password Change Date in Active Directory

To get started you need a way for AD to expose the last password change date to Auth0. This value is stored in the `pwdLastSet` field in Active Directory as an LDAP timestamp.

The profile mapper in the Auth0 AD/LDAP Connector allows you to choose which information is exposed to Auth0 and for this scenario the `pwdLastSet` field will be added to the outgoing profile (line 29):

![Profile Mapper](https://cdn.auth0.com/docs/img/redirect-rule-ad-pwd-profilemapper.png)

Every time users signs in the `last_pwd_change` attribute will be available in Auth0 (in the rules, in the profile, ...).

## Creating a Redirect Rule

The following step is to enforce this logic. For every login Auth0 needs to check the last password change date. If it's more than 30 days ago the login flow needs to be interrupted and the users should be redirect to an external application which allows them to change their password.

Once their password has been changed they'll be redirected back to Auth0. Both of these redirects need to happen in a secure way:

 - When redirecting the user to the external application, it needs to know which user is currently logged in
 - When the application redirects back to Auth0, it's important to verify that the redirect originated from the application and the user really changed their password

Both of these redirects can easily be secured using JWTs. When redirecting the user to the external application a JWT is generated which contains some information about the user (like their AD username). The application will verify this JWT before allowing the users to change their password. And once the password has been changed, a new JWT is generated to redirect the users back to Auth0. This makes both redirects "tamper free".

The password change tool is also an application in Auth0 with its own client_id and client_secret:

![Password Change Application](https://cdn.auth0.com/docs/img/redirect-rule-ad-pwd-app.png)

And the following rule contains all of the logic to redirect the user when their password is too old (using a secure token in the querystring) and to validate the redirect after the users changed their password.

```js
function (user, context, callback) {
  if (context.connection !== 'FabrikamAD') {
    return callback(null, user, context);
  }

  var ISSUER = 'https://DOMAIN.auth0.com/';
  var CLIENT_ID = 'CLIENT_ID';
  var CLIENT_SECRET = 'CLIENT_SECRET';
  var REDIRECT_TO = 'https://yourcompany.com/tools/pwdreset?token=';
  var MAX_PASSWORD_AGE = 30;

  if (context.protocol !== 'redirect-callback') {
    
    // Require a password change every X days.
    var last_change_date = getLastPasswordChange(user);
    console.log('Last password change: ' + user.last_pwd_change);
    console.log('Last password change: ' + last_change_date);
    if (dayDiff(last_change_date, new Date()) <= MAX_PASSWORD_AGE) {
      return callback(null, user, context);
    }
    
    // Create token for the external site.
    var token = createToken(CLIENT_ID, CLIENT_SECRET, ISSUER, {
      sub: user.user_id,
      email: user.email,
      sAMAccountName: user.sAMAccountName,
      ip: context.request.ip
    });

    // Redirect to the external site.
    context.redirect = {
      url: REDIRECT_TO + token
    };
    
    console.log('Redirecting to: ' +context.redirect.url);
    return callback(null, user, context);
  }
  else 
  {
    console.log('User redirected back after password change. Token: ' +  
      context.request.query.token);
    
    // Verify the incoming token.
    verifyToken(CLIENT_ID, CLIENT_SECRET, ISSUER, context.request.query.token, 
      function(err, decoded) {
        if (err) {
          console.log('Token error: ' + JSON.stringify(err));
          return callback(new UnauthorizedError('Password change failed.'));  
        } else if (decoded.sub !== user.user_id) {
          return callback(
            new UnauthorizedError('Token does not match the current user.')); 
        } else if (!decoded.pwd_change) {
          return callback(
            new UnauthorizedError('Invalid token.')); 
        }
        else {
          console.log('Decoded token: ' + JSON.stringify(decoded));
          return callback(null, user, context);
        }
      });
  }
  
  // Get the last password change from AD.
  function getLastPasswordChange(user) {
    var last_change = user.last_pwd_change || 0;
    return new Date((last_change/10000) - 11644473600000);
  }
  
  // Calculate the days between 2 days.
  function dayDiff(first, second) {
    return (second-first)/(1000*60*60*24);
  }
  
  // Generate a JWT.
  function createToken(client_id, client_secret, issuer, user) {
    var options = {
      expiresInMinutes: 5,
      audience: client_id,
      issuer: issuer
    };

    var token = jwt.sign(user, 
      new Buffer(client_secret, 'base64'), options);
    return token;
  }
  
  // Verify a JWT.
  function verifyToken(client_id, client_secret, issuer, token, cb) {
    var secret = new Buffer(client_secret, 'base64').toString('binary');
    var token_description = { audience: client_id, issuer: issuer };
    
    jwt.verify(token, secret, token_description, cb);
  }
}
```

Note: this rule requires the `CLIENT_ID` and `CLIENT_SECRET` of the password change tool in order to create a token for the application and validate it afterwards.

### Password Change Tool

The password change tool itself is a very lightweight application that will:

 1. Authenticate the current user based on the token received in the querystring
 2. Allow users to change their password
 3. Redirect the user back to Auth0 with a new token

This tool needs to have access to your AD to allow password changes, so make sure you deploy this in a part of your network that allows connecting to AD.

```cs
[Route("")]
public ActionResult Index(string token)
{
    try
    {
        var validationParameters = new TokenValidationParameters
        {
            IssuerSigningToken = new BinarySecretSecurityToken(
                    TextEncodings.Base64Url.Decode(ConfigurationManager.AppSettings["auth0:ClientSecret"])),
            ValidIssuer = ConfigurationManager.AppSettings["auth0:Domain"],
            ValidAudience = ConfigurationManager.AppSettings["auth0:ClientId"]
        };

        var handler = new JwtSecurityTokenHandler();
        SecurityToken securityToken;
        ClaimsPrincipal principal = 
            handler.ValidateToken(token, validationParameters, 
                out securityToken);
        ClaimsIdentity identity = principal.Identity as ClaimsIdentity;
        identity.AddClaim(
            new Claim("http://schemas.microsoft.com/accesscontrolservice/2010/07/claims/identityprovider", "Auth0"));
        identity.AddClaim(new Claim(ClaimTypes.Name, 
            identity.FindFirst(ClaimTypes.Email).Value));

        var sessionToken = new SessionSecurityToken(principal, 
            TimeSpan.FromMinutes(15));
        FederatedAuthentication.SessionAuthenticationModule.WriteSessionTokenToCookie(sessionToken);

        return RedirectToAction("Change");
    }
    catch (Exception ex)
    {
        return RedirectToAction("Unauthorized");
    }
}

[Authorize]
[Route("change")]
public ActionResult Change()
{
    var claim = ClaimsPrincipal.Current.FindFirst("SAMAccountName");
    if (claim == null || String.IsNullOrEmpty(claim.Value))
    {
        ModelState.AddModelError("", "The SAMAccountName is not available.");
    }

    if (String.IsNullOrEmpty(User.Identity.Name))
    {
        ModelState.AddModelError("", "The name of the user is not available.");
    }

    return View(new PasswordChangeModel());
}

[Authorize]
[Route("change/submit")]
public ActionResult ChangeSubmit(PasswordChangeModel model)
{
    var claim = ClaimsPrincipal.Current.FindFirst("SAMAccountName");
    if (claim == null || String.IsNullOrEmpty(claim.Value))
    {
        ModelState.AddModelError("", "The SAMAccountName is not available.");
    }

    if (String.IsNullOrEmpty(User.Identity.Name))
    {
        ModelState.AddModelError("", "The name of the user is not available.");
    }

    if (!ModelState.IsValid)
    {
        return View("Change");
    }

    try
    {
        // Update password.
        using (var context = new PrincipalContext(ContextType.Domain, 
            ConfigurationManager.AppSettings["AdDomain"], 
            ConfigurationManager.AppSettings["AdBase"], 
            ClaimsPrincipal.Current.FindFirst("SAMAccountName").Value, 
            model.OldPassword))
        {
            using (var user = UserPrincipal.FindByIdentity(context,    
                IdentityType.SamAccountName, 
                ClaimsPrincipal.Current.FindFirst("SAMAccountName").Value))
            {
                user.ChangePassword(model.OldPassword, model.NewPassword);
            }
        }

        // Generate a JWT for the redirect rule.
        var now = DateTime.UtcNow;
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] { 
                new Claim("sub", 
                    ClaimsPrincipal.Current
                        .FindFirst(ClaimTypes.NameIdentifier).Value),
                new Claim("aud", 
                    ConfigurationManager.AppSettings["auth0:ClientId"]),
                new Claim("pwd_change", "true")
            }),
            TokenIssuerName = ConfigurationManager.AppSettings["auth0:Domain"],
            Lifetime = new Lifetime(now, now.AddMinutes(10)),
            SigningCredentials = new SigningCredentials(
              new InMemorySymmetricSecurityKey(
               TextEncodings.Base64Url.Decode(
                ConfigurationManager.AppSettings["auth0:ClientSecret"])),
                "http://www.w3.org/2001/04/xmldsig-more#hmac-sha256",
                "http://www.w3.org/2001/04/xmlenc#sha256"),
        };

        // Redirect back to Auth0.
        var handler = new JwtSecurityTokenHandler();
        var securityToken = handler.CreateToken(tokenDescriptor);
        return Redirect(ConfigurationManager.AppSettings["auth0:Domain"] 
            + "continue?token=" + handler.WriteToken(securityToken));
    }
    catch (Exception ex)
    {
        ModelState.AddModelError("", ex.Message);
        return View("Change");
    }
}
```

The sample application is available in the `/src` folder.

## Result

As always the users will start with the Auth0 login screen:

![Login Page](https://cdn.auth0.com/docs/img/redirect-rule-ad-pwd-login.png)

Users with an expired password will be redirect to the self-service password reset page to change their password.

![Change Password](https://cdn.auth0.com/docs/img/redirect-rule-ad-pwd-change.png)

After changing their password they will be redirected back to Auth0 and the login flow continues.

Note: *The Resource Owner endpoint does not support redirect rules. To avoid users from bypassing the logic you have in your redirect rules [you can disable the Resource Owner endpoint](https://github.com/auth0/rules/blob/master/rules/disable-resource-owner.md).*
