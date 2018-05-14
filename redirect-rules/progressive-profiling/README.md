# Redirect Rule: Progressive Profiling

You can use redirect rules to collect missing information from a user's profile. There are often two types of information you want to collect:
* Core information that was missing during the actual sign-up (like first and last name)
* Additional first-party data that you'd like to collect progressively (like the user's birthday)

This sample shows how to collect both kinds of data. First, it will prompt the user for their first and last name, but only if they didn't sign up using a social provider that already provided it. Second, it will prompt for the user's birthday, but only after the third login.

The information collection form is hosted using a [Webtask](https://webtask.io/) that you can easily modify and provision and use in your version of the rule.
