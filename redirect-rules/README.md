# Redirect Protocol Rules

The Auth0 `redirect` protocol enables many advanced authentication scenarios, specifically ones that require additional user interaction beyond the standard login form. It's most commonly used to do [custom MFA (multifactor authentication)](https://auth0.com/docs/multifactor-authentication) in Auth0, but it can serve many other purposes, like:
* Custom privacy policy acceptance, terms of service, and data disclosure forms
* Securely performing a one-time collection of additional required profile data
* Allowing remote Active Directory users to change their password ([see example](active-directory-pwd-reset-policy))

This directory contains examples of using the `redirect` protocol in various ways, including MFA. And if you'd just like a simple example that you can easily run within your Auth0 account, check out the [Simple Example with a Webtask](simple) rule.
