## Creates a new Lead in Salesforce on First Login

This rule will check if this is the first user login, and in that case will call Salesforce API to record the contact as a new Lead. It is using Salesforce REST APIs and the `resource owner` flow to obtain an `access_token`. The username you use to authenticate the API will appear as the __creator__ of the lead. 

> Note: this sample implements very basic error handling.

```
function (user, context, callback) {

  if(user.recordedAsLead){
    return callback(null,user,callback);
    }

  getAccessToken(SFCOM_CLIENT_ID, SFCOM_CLIENT_SECRET, USERNAME, PASSWORD, 
  			function(e,r){
  					if( e ) return callback(e);
  
  					createLead( r.instance_url, r.access_token, function(e,result){
  						if(e) return callback(e);
              user.persistent.recordedAsLead = true;
              return callback(null,user,context);
  					});
  				});

  //See http://www.salesforce.com/us/developer/docs/api/Content/sforce_api_objects_lead.htm
  function createLead(url,access_token, callback){
  
    //Can use many more fields
    var data = {
  		LastName: user.name,
  		Company: 'Web channel signups'
  	};
  
  	request.post({
  		url: url + "/services/data/v20.0/sobjects/Lead/",
  		headers: {
  			"Authorization": "OAuth " + access_token,
  			"Content-type": "application/json"
  		},
  		body: JSON.stringify(data)
  		}, function(e,r,b){
  			if(e) return callback(e);
  			return callback(null,b);
  		});
  }

  //Obtains a SFCOM access_token with user credentials
  function getAccessToken(client_id, client_secret, username, password, callback){
  	request.post({
  		url: 'https://login.salesforce.com/services/oauth2/token',
  		form: {
  			grant_type: 'password',
  			client_id: client_id,
  			client_secret: client_secret,
  			username: username,
  			password: password
  		}}, function(e,r,b){
  			if(e) return callback(e);
  			return callback(null,JSON.parse(b));
  		});
  }
}
```
