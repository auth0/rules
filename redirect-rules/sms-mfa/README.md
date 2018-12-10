# Auth0 - SMS Passwordless MFA

This rule and webtask will add [SMS Passwordless](https://auth0.com/passwordless) capabilities to your Auth0 account.

## Setup

> Tenants created after *July 16, 2018* will not have access to the underlying Auth0 Webtask Sandbox via the Webtask CLI. Please contact Auth0 at sales@auth0.com to request access.

1. Create the webtask
  - Follow the instructions to install the `wt-cli` tool and setup it for your [Auth0 account](https://manage.auth0.com/#/account/webtasks).
  - Capture your webtask profile:
  ```bash
  WEBTASK_PROFILE=yourdomain-default
  ```
  Where `yourdomain-default` is the webtask profile associated with your Auth0 tenant, which you should have got from the previous step.
  - Generate a secret that can be used to sign JWT tokens passed between the rule and the webtask:  
  ```bash
  TOKEN_SECRET=$(openssl rand 32 -base64)
  ```
  - Capture your Auth0 domain:
  ```bash
  AUTH0_DOMAIN=yourdomain.auth0.com
  ```
  Where `yourdomain.auth0.com` is your Auth0 tenant domain
  - Create your SMS MFA webtask:  
  ```bash
  wt create webtask.js \
    --name sms-mfa \
    --secret token_secret=$TOKEN_SECRET \
    --secret auth0_domain=$AUTH0_DOMAIN \
    --no-parse --no-merge \
    --profile $WEBTASK_PROFILE
  ```
  - Take note of the resulting webtask URL
2. Create a new rule in your Auth0 account, copy the code from [rule.js](https://github.com/auth0/auth0-sms-passwordless/blob/master/rule.js) and replace the `client_id` of the application where you want to use the SMS MFAs.  
  >Go to the Rules section in the [Auth0 Dashboard](https://manage.auth0.com/#/rules). Click on *New Rule* and select *Empty rule*. Set the name of the rule and copy the code there.

3. Set up the rules parameters in the Rules Setting section (under the rules list):
    - `SMS_MFA_URL`: The url of the webtask.
    - `SMS_MFA_TOKEN_SECRET`: The `TOKEN_SECRET` generated in step 1, which you can copy into the clipboard with this command:  
      ```bash
      echo $TOKEN_SECRET | pbcopy
      ```

4. Set up your SMS Passwordless connection [Here](https://manage.auth0.com/#/connections/passwordless).

## How it works

The rule will run on each user login and if the user has an SMS identity linked in his/her account, it will send an sms and ask for the code sent. If the code entered is the one sent, the login flow will continue.

If the user does not have an SMS identity, the rule will be skipped.

To link an sms account, you should check for the identity collection for an sms identity and if there isn't any, show the [Lock Passwordless Widget](auth0.github.io/lock-passwordless/) in order to generate and [Link](https://auth0.com/docs/link-accounts) the new SMS identity.
