Auth0 Rules Repository
=====

Rules are code snippets written in JavaScript that are executed as part of the authentication pipeline in Auth0. This happens every time a user authenticates to an application. __Rules__ enable very powerful customizations and extensions to be easily added to Auth0.

![](https://docs.auth0.com/img/rules-pipeline.png)

An App initiates an authentication request to Auth0 (__Step 1__), Auth0 routes the request to an Identity Provider through a configured connection (__Step 2__). The user authenticates successfuly (__Step3__), the `user` object that represents the logged in user is the passed through the rules pipeline and returned to the app (__Step 4__).
