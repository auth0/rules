#Auth0 - SMS Passwordless MFA

This rule and webtask will add [SMS Passwordless](https://auth0.com/passwordless) capabilities to your Auth0 account.

##Setup

1- Create the webtask
    - Follow the instructions to install the `wt-cli` tool and setup it for your [Auth0 account](https://manage.auth0.com/#/account/webtasks) and copy the url generated (without any get param).
    - Create your SMS MFA webtask: 
```js
    wt create --name passwordless-sms-mfa \
        --secret client_secret=yourclientsecret \
        --secret auth0_domain=yourdomain.auth0.com \
        --output url mfa-passwordless.js --no-parse --no-merge
```
    Parameters:
        - *client_secret*: The secret you want to use to sign the tokens used between the rule and the webtask.
        - *auth0_domain*: Your auth0 subdomain: *domain*.auth0.com
2- Create a new rule in your Auth0 account, copy the code from [rule.js](https://github.com/auth0/auth0-sms-passwordless/blob/master/rule.js) and replace the `client_id` of the application where you want to use the SMS MFAs.
>Go to the Rules section in the [Auth0 Dashboard](https://manage.auth0.com/#/rules). Click on *New Rule* and select *Empty rule*. Set the name of the rule and copy the code there.

3- Set up the rules parameters in the Rules Setting section (under the rules list):
    - *sms_passwordless_mfa_url*: The url of the webtask.
    - *sms_passwordless_mfa_secret*: The secret you want to use to sign the tokens used between the rule and the webtask (it should be the same configured in the webtask).

4- Set up your SMS Passwordless connection [Here](https://manage.auth0.com/#/connections/passwordless).

##How it works
The rule will run on each user login and if the user has an SMS identity linked in his/her account, it will send an sms and ask for the code sent. If the code entered is the one sent, the login flow will continue.

If the user does not have an SMS identity, the rule will be skipped.

To link an sms account, you should check for the identity collection for an sms identity and if there isn't any, show the [Lock Passwordless Widget](auth0.github.io/lock-passwordless/) in order to generate and [Link](https://auth0.com/docs/link-accounts) the new SMS identity.
