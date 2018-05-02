/**
 * @overview Query a SQL server database on each login and add a roles array to the user.
 * @gallery true
 * @category enrich profile
 * 
 * Add user roles from a SQL Server database
 * 
 * This rule will query a SQL server database on each login and add a `roles` array to the user.
 * 
 * Note: you can store the connection string securely on Auth0 encrypted configuration. Also make sure when you call an external endpoint to open your firewall/ports to our IP address which you can find it in the rules editor. This happens when you query SQL Azure for example.
 * 
 */

function (user, context, callback) {
  getRoles(user.email, (err, roles) => {
    if (err) return callback(err);

    context.idToken['https://example.com/roles'] = roles;

    callback(null, user, context);
  });

  // Queries a table by e-mail and returns associated 'Roles'
  function getRoles(email, done) {
    const connection = sqlserver.connect({
      userName:  '<user_name>',
      password:  '<password>',
      server:    '<db_server_name>',
      options: {
        database: '<db_name>',
        encrypt:  true,
        rowCollectionOnRequestCompletion: true
      }
    }).on('errorMessage', (error) => {
      console.log(error.message);
    });

    const query = "SELECT Email, Role " +
                "FROM dbo.Role WHERE Email = @email";

    connection.on('connect', (err) => {
      if (err) return done(new Error(err));

      const request = new sqlserver.Request(query, (err, rowCount, rows) => {
        if (err) return done(new Error(err));

        const roles = rows.map((row) => {
          return row[1].value;
        });

        done(null, roles);
      });

      request.addParameter('email', sqlserver.Types.VarChar, email);

      connection.execSql(request);
    });
  }
}