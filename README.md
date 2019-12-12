Auth0 Rules Repository
=====

[![CircleCI](https://circleci.com/gh/auth0/rules.svg?style=svg)](https://circleci.com/gh/auth0/rules)

Rules are code snippets written in JavaScript that are executed as part of the authentication pipeline in [Auth0](https://www.auth0.com). This happens every time a user authenticates to an application. __Rules__ enable very powerful customizations and extensions to be easily added to Auth0.

![](https://docs.google.com/drawings/d/16W_hTS_u2CeDFXkD2PlfituFl7b74EQ6HE_XYn3TdD0/pub?w=891&h=283)

An App initiates an authentication request to Auth0 (__Step 1__), Auth0 routes the request to an Identity Provider through a configured connection (__Step 2__). The user authenticates successfully (__Step3__), the `user` object that represents the logged in user is then passed through the rules pipeline and returned to the app (__Step 4__).

A rule will run on Step 4 and this is the information each rule will get:

* `user`: user object as it comes from the identity provider. It has the following properties:
  * `app_metadata`: custom fields that store info about a user that influences the user's access, such as support plan, security roles, or access control groups. 
  * `created_at`: timestamp indicating when the user profile was first created
  * `email`: (unique) user's email address
  * `email_verified`: indicates whether the user has verified their email address
  * `family_name`: user's family name
  * `given_name`: users's given name
  * `identities`: Contains info retrieved from the identity provider with which the user originally authenticates. Users may also link their profile to multiple identity providers; those identities will then also appear in this array. In some cases, it will also include an API Access Token to be used with the provider. The contents of an individual identity provider object varies by provider, but it will typically include the following:
    * `connection`: name of the Auth0 connection used to authenticate the user
    * `isSocial`: indicates whether the connection is a social one
    * `provider`: name of the entity that is authenticating the user, such as Facebook, Google, etc.
    * `user_id`: user's unique identifier for this connection/provider
    * `profileData`: user information associated with the connection. When profiles are linked, it is populated with the associated user info for secondary accounts.
  * `last_password_reset`: timestamp indicating the last time the user's password was reset/changed. At user creation, this field does not exist.
  * `multifactor`: array/list of MFA providers with which the user is enrolled. This array is updated when the user logs in with MFA successfully for the first time, and is not updated when enrollment is completed or when an administrator resets a user's MFA.
  * `name`: user's full name
  * `nickname`: user's nickname
  * `permissions`: permissions assigned to the user's ID token
  * `phone_number`: user's phone number. Only valid for users with SMS connections.
  * `phone_verified`: indicates whether the user has verified their phone number. Only valid for users with SMS connections.
  * `picture`: URL pointing to the user's profile picture
  * `updated_at`: timestamp indicating when the user's profile was last updated/modified. Changes to `last_login` are considered updates, so most of the time, `updated_at` will match `last_login`.
  * `user_id`: (unique) The user's unique identifier
  * `user_metadata`: custom fields that store information about a user that does not impact what they can or cannot access, such as work address, home address, or user preferences
  * `username`: (unique) user's username
* `context`: object containing contextual information of the current authentication transaction. It has the following properties:
  * `tenant`: string containing the name of the tenant
  * `clientID`: client id of the application the user is logging in to
  * `clientName`: name of the application (as defined on the dashboard)
  * `client_metadata`: object for holding other application properties that are key/value strings
  * `connection`: name of the connection used to authenticate the user (e.g.: `twitter` or `some-google-apps-domain`)
  * `connectionID`: string containing the connection's unique identifier
  * `connectionStrategy`: type of connection. For social connection `connectionStrategy` === `connection`. For enterprise connections, the strategy will be `waad` (Windows Azure AD), `ad` (Active Directory/LDAP), `auth0` (database connections), etc.
  * `connectionOptions`: object representing the options defined on the connection. `connectionOptions.tenant_domain` is a string containing the domain being used for authentication when using an Enterprise connection. `connectionOptions.domain_aliases` is an array containing the optional domains registered as aliases in addition to the primary domain (specified in the `connectionOptions.tenant_domain` property).
  * `connectionMetadata`: object representing metadata defined on the connection that are key/value strings
  * `protocol`: authentication protocol. Possible values: `oidc-basic-profile` (most used, web-based login), `oidc-implicit-profile` (used on mobile devices and single page apps), `oauth2-resource-owner` (user/password login typically used on database connections), `samlp` (SAML protocol used on SaaS apps), `wsfed` (Ws-Federation used on Microsoft products like Office365), `wstrust-usernamemixed` (Ws-trust user/password login used on CRM and Office365)), `delegation` (during the exchange for a delegation token).
  * `stats`: object containing specific user stats, like `stats.loginsCount`. Note that any of the counter variables returned as part of the `stats` object do not increase during silent authentication (as when `prompt=none`). There are also scenarios where the counter variables might increase yet a rule or set of rules do not execute, as in the case of a successful cross-origin authentication followed by a failed token request.
  * `sso`: this object will contain information about the Single Sign-on (SSO) transaction (if available). It has the following properties:
    * `with_auth0`: when a user signs in with SSO to an application where the `Use Auth0 instead of the IdP to do Single Sign-On`
    * `with_dbconn`: SSO login for a user that logged in through a database connection
    * `current_clients`: client IDs using SSO
  * `accessToken`: object representing the options defined on the Access Token. You can use this object to add custom namespaced claims to the Access Token. `context.accessToken.scope` can be used to change the Access Token's returned scopes.  When provided, it is an array containing permissions in string format.
  * `idToken`: object representing the options defined on the ID Token. Used to add custom namespaced claims to the ID Token
  * `original_protocol`: After a redirect rule has executed and the authentication transaction is resumed, this property will be populated with the original protocol used to initiate the transaction
  * `multifactor`: object representing the multifactor settings used in implementing contextual MFA
  * `redirect`: object used to implement the redirection of a user from a rule
  * `sessionID`: internal identification for the authentication session. Value is kept only if `prompt=none` is used in the authorization request. Note that the session ID can change **after** rule execution on other flows, so the value available in `context.sessionID` might not match the new session ID that the user will receive. This makes this value only meaningful when `prompt=none` is used.
  * `request`: object containing useful information of the request. It has the following properties:
    * `query`: querystring properties of the login transaction sent by the application
    * `body`: body of the POST request on login transactions used on `oauth2-resource-owner` or `wstrust-usernamemixed` protocols.
    * `userAgent`: user-agent of the client that is trying to log in
    * `ip`: originating IP address of the user trying to log in
    * `hostname`: hostname that is being used for the authentication flow
    * `geoip`: an object containing geographic IP information. It has the following properties: 
      * `country_code`: two-character code for the country associated with the IP address
      * `country_code3`: three-character code for the country associated with the IP address
      * `country_name`: country name associated with the IP address
      * `city_name`: city or town name associated with the IP address
      * `latitude`: latitude associated with the IP address
      * `longitude`: longitude associated with the IP address
      * `time_zone`: timezone associated with the IP address
      * `continent_code`: two-character code for the continent associated with the IP address
  * `primaryUser`: unique user id of the primary account for the user. Used to link user accounts from various identity providers
  * `authentication`: object containing information related to the authentication transaction with the following properties:
    * `methods`: an array of objects containing the authentication methods a user has completed during their session. This opbject contains the following properties:
      * `name`: a string representing the name of the authentication method that has been completed. It can be one of the following values:
        * `federated`: social or enterprise connection was used to authenticate the user
        * `pwd`: database connection was used to authenticate the user
        * `sms`: SMS connection was used to authenticate the user
        * `email`: Passwordless Email connection was used to authenticate the user
        * `mfa`: the user completed a mulifactor authentication
      * `timestamp`: an integer indicating the time in seconds at which the authentication method took place in Unix Epoch time. You can see a sample use case of the `context.authentication.methods` property in the [Require MFA once per session Rule](https://github.com/auth0/rules/blob/master/src/rules/require-mfa-once-per-session.js). 
  * `authorization`: object containing information related to the authorization transaction with the following properties:
    * `roles`: an array of strings containing the names of a user's assigned roles. You can see a sample use case using the `context.authorization.roles` property to add roles to tokens in [Sample Use Cases: Rules with Authorization](https://auth0.com/docs/authorization/concepts/sample-use-cases-rules#add-user-roles-to-tokens).
  * `samlConfiguration`: an object that controls the behavior of the SAML and WS-Fed endpoints. Useful for advanced claims mapping and token enrichment (only available for `samlp` and `wsfed` protocol).

Note that rules will also have access to several modules defined globally, including `auth0`, referring to https://github.com/auth0/node-auth0. Other modules available within rules are defined at https://auth0.com/docs/appliance/modules (relevant to both appliance and cloud)

This is the rules editor inside Auth0:

![](http://cdn.auth0.com/docs/img/rules-editor.png)

---
### Available Modules

* [Webtask modules](https://tehsis.github.io/webtaskio-canirequire/)
* [Additional modules](https://auth0.com/docs/appliance/modules)

---
### Release Notes

1. Update the markdown files to update the rule and commit your changes
2. Update the version by executing:

 ```bash
 npm version [patch|minor|major]
 ```

 > There is a `preversion` script in the `package.json` file that executes the following command:  `./build && git add rules.json && git commit -m 'update rules.json`

3. Push your changes to master including the tags

 ```bash
 git push origin master --tags
 ```


---

### Highlighted Rules

* Send events to MixPanel [Docs](https://auth0.com/rules/mixpanel-track-event) | [Rule]( https://github.com/auth0/rules/blob/master/src/rules/mixpanel-track-event.js)
* Query User Profile in FullContact [Docs](https://auth0.com/rules/get-FullContact-profile) | [Rule](https://github.com/auth0/rules/blob/master/src/rules/get-fullcontact-profile.js)
* Add a Lead in Salesforce [Docs](https://auth0.com/rules/creates-lead-salesforce) | [Rule](https://github.com/auth0/rules/blob/master/src/rules/creates-lead-salesforce.js)
* Get an Appery Session Token [Rule](https://github.com/auth0/rules/blob/master/src/rules/appery.js)

[More information about them here](https://docs.auth0.com/rules).

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
