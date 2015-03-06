# Notify users if login happens from a different IP or machine

This rule checks if the user has logged in with the current device and/or location before.  If not, so long as the user has a phone property a SMS message will be sent to the user informing them they've logged in from a new device/location.  Location & device are computed as a hash of the `userAgent` and the `IP address`. SMS are sent through [Twilio](http://www.twilio.com) and uses the `user.phone` property.

If `user.phone` is not available, then everything is ignored; but signature is computed.


```
function (user, context, callback) {
  //Check for phone property on user object
  if(!user.phone)
  {
    console.log("No phone, exiting");
    return callback(null, user, context);    
  }

  //Check for fingerprint property on user object
  if( !user.lastDeviceFingerPrint )
  {
    console.log("Need to add fingerprint property");
    //User object did not have property, so create it with a blank entry.
    user.persistent.lastDeviceFingerPrint = "";   
    user.lastDeviceFingerPrint = "";
  }
  
  //Split the last device fingerprint string into an array of fingerprints
  var fingerPrints = user.lastDeviceFingerPrint.split(",");    
  var currentFingerprint = clientFingerprint();
  
  //Check the array object to see if the current fingerprint is there or not
  if( fingerPrints.indexOf(currentFingerprint) <= -1)
  {
    console.log("send SMS");
    user.persistent.lastDeviceFingerPrint = user.lastDeviceFingerPrint + "," + currentFingerprint;
    notifyUser(function(e){
      return callback(e,user,context);                    
    }); 
  }
  else
  {
    console.log("out");
    return callback(null, user, context);
  }                             
 
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
        'From': '+14256543697'
      }
    }, function(e,r,b) {
      if (e) return done(e);
      if (r.statusCode !== 201) return done(new Error(r.statusCode));
      return done(null);
    });
 }
}
```
