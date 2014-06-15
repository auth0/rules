# Notify users if login happens from a different IP and machine

This rule checks if the user has changed device or location since last login and sends him an SMS if that happened. Location & device are computed as a hash of the `userAgent` and the `IP address`. SMS are sent through [Twilio](http://www.twilio.com).

```
function (user, context, callback) {
  var currentFingerprint = clientFingerprint();
  
  user.persistent.lastDeviceFingerPrint = currentFingerprint;
  
  if( !user.lastDeviceFingerPrint || user.lastDeviceFingerPrint === currentFingerprint ) {
          return callback(null, user, context);
        }
  
  notifyUser(function(e){
                        return callback(e,user,context);                    
                       });

  //Computes user device fingerprint with userAgent + IP address
  function clientFingerprint()
  {
    var shasum = crypto.createHash('sha1');
    shasum.update(context.request.userAgent);
    shasum.update(context.request.ip);
    return shasum.digest('hex');      
  }
  
  //Sends user SMS via Twilio
  function notifyUser(done){
    
    var twilioAccount = 'YOUR TWILIO ACCOUNT';
    var twilioAuthToken = 'YOUR TWILIO AUTH TOKEN';

    request.post( {
      url: 'https://api.twilio.com/2010-04-01/Accounts/' + twilioAccount + '/Messages.json',
      auth: {
        'user': twilioAccount,
        'pass': twilioAuthToken,
      },
      form: {
        'Body': 'You\'ve logged in from a different device or location.',
        'To': user.phone,
        'From': '+18668132884'
      }
    }, function(e,r,b) {
      if (e) return done(e);
      if (r.statusCode !== 201) return done(new Error(r.statusCode));
      return done(null);
    });
 }
}
```
