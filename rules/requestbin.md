---
gallery: true
short_description: Shows how to post the variables sent to your Rule to http://RequestB.in to help troubleshoot rule issues 
categories:
- debugging
---
## Dump rule variables to RequestBin

This rule shows how to post the variables sent to your Rule to http://RequestB.in to help troubleshoot issues with your Rules.

You can run this rule by itself, or paste it into an existing rule. Once the rule has posted data to RequestB.in, you can use a site like http://bodurov.com/JsonFormatter/ to more easily visualize the data.

> Note: You should deactivate this rule or comment out the code once you are finished troubleshooting.

Contributed by Robert McLaws, AdvancedREI.com

```js
function (user, context, callback) {
  request.post({
    url: 'http://requestb.in/YourBinUrl',
    json: {
      user: user,
      context: context,
    },
    timeout: 15000
  }, function(err, response, body){
    if (err) return callback(new Error(err));
    return callback(null, user, context);
  });
}
```
