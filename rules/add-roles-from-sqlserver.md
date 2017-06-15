---
gallery: true
short_description: Query a SQL server database on each login and add a roles array to the user.
categories:
- enrich profile
---
## Add user roles from a SQL Server database

This rule will query a SQL server database on each login and add a `roles` array to the user.

> Note: you can store the connection string securely on Auth0 encrypted configuration. Also make sure when you call an external endpoint to open your firewall/ports to our IP address which you can find it in the rules editor. This happens when you query SQL Azure for example.

```js
function (user, context, callback) {
  getRoles(user.email, function(err, roles) {
    if (err) return callback(err);

    context.idToken['https://example.com/roles'] = roles;

    callback(null, user, context);
  });

  // Queries a table by e-mail and returns associated 'Roles'
  function getRoles(email, done) {
    var connection = sqlserver.connect({
      userName:  '<user_name>',
      password:  '<password>',
      server:    '<db_server_name>',
      options: {
        database: '<db_name>',
        encrypt:  true,
        rowCollectionOnRequestCompletion: true
      }
    }).on('errorMessage', function (error) {
      console.log(error.message);
    });

    var query = "SELECT Email, Role " +
                "FROM dbo.Role WHERE Email = @email";

    connection.on('connect', function (err) {
      if (err) return done(new Error(err));

      var request = new sqlserver.Request(query, function (err, rowCount, rows) {
        if (err) return done(new Error(err));

        var roles = rows.map(function (row) {
          return row[1].value;
        });

        done(null, roles);
      });

      request.addParameter('email', sqlserver.Types.VarChar, email);

      connection.execSql(request);
    });
  }
}
```
