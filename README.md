Auth0 Rule Templates
=====

[![CircleCI](https://circleci.com/gh/auth0/rules.svg?style=svg)](https://circleci.com/gh/auth0/rules)

This repo contains Rule templates that appear in the Auth0 Dashboard when you create a new Rule.

## Table of Contents

- [Documentation](#documentation)
- [Contributing](#contributing)
- [Support + Feedback](#support--feedback)
- [Vulnerability Reporting](#vulnerability-reporting)
- [What is Auth0](#what-is-auth0)
- [License](#license)

## Documentation

- [Rule basics](https://auth0.com/docs/rules)
- [Rule best practices](https://auth0.com/docs/best-practices/rules-best-practices)
- [Using Rule configuration for secrets and other values](https://auth0.com/docs/rules/configuration)
- [Working with metadata in Rules](https://auth0.com/docs/rules/metadata)
- The [`user` object](https://auth0.com/docs/rules/user-object-in-rules) and [`context` object](https://auth0.com/docs/rules/context-object)
- [Redirect users from witihin Rules](https://auth0.com/docs/rules/redirect-users)
- [Debugging Rules](https://auth0.com/docs/rules/debug-rules)
- [NPM modules available in all Rules](https://auth0-extensions.github.io/canirequire/)
- [Rules utility library](https://github.com/auth0/rule-utilities/)

## Contributing

We appreciate feedback and contribution to this repo! Before you get started, please see the following:

- [Auth0's general contribution guidelines](https://github.com/auth0/.github/blob/master/CONTRIBUTING.md)
- [Auth0's code of conduct guidelines](https://github.com/auth0/open-source-template/blob/master/CODE-OF-CONDUCT.md)

If you're considering developing a new Rule template, please submit an [Issue](https://github.com/auth0/rules/issues) to discuss with our team. If you'd like to write an integration for the [Auth0 Marketplace](https://marketplace.auth0.com/), [see our Partners page](https://auth0.com/partners) to get started.

0. Read the [Contributing guidelines above](#contributing) before getting started
1. Make your changes in the the `src/rules/*.js` files, including the metadata at the top:
  - `@title` 3-5 word title of the rule
  - `@overview` brief, one-sentence description of the rule.
  - `@gallery` set to `true`
  - `@category` use "access control", "enrich profile", "multifactor", "guardian", "debugging", "saml", or "default"
  - A detailed, multi-line, Markdown-enabled description of the rule, including any required configuration keys
3. Ensure tests run in both Node v8 and Node v12 using a tool like `nvm`
4. Make sure to test your Rule in Auth0 directly to make sure it can be saved without errors and that it does what you expect during login
5. Submit your PR following the "fork and pull" workflow [described here](https://github.com/auth0/.github/blob/master/CONTRIBUTING.md#submitting-pull-requests)
6. Fill out the PR template completely and our team will review as soon as we're able

## Support + Feedback

- Use the [Support Center](https://support.auth0.com/) for questions on implementation and issues with a Rule installed in your tenant
- Use [Issues](https://github.com/auth0/rules/issues) here for code-level support and bug reports within the templates

## Vulnerability Reporting

Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## What is Auth0?

Auth0 helps you to easily:

- implement authentication with multiple identity providers, including social (e.g., Google, Facebook, Microsoft, LinkedIn, GitHub, Twitter, etc), or enterprise (e.g., Windows Azure AD, Google Apps, Active Directory, ADFS, SAML, etc.)
- log in users with username/password databases, passwordless, or multi-factor authentication
- link multiple user accounts together
- generate signed JSON Web Tokens to authorize your API calls and flow the user identity securely
- access demographics and analytics detailing how, when, and where users are logging in
- enrich user profiles from other data sources using customizable JavaScript rules

[Why Auth0?](https://auth0.com/why-auth0)

## License

The Auth0-PHP SDK is licensed under MIT - [LICENSE](LICENSE)
