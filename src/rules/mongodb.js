/**
 * @overview Query mongoDB and add a property to the user
 * @gallery true
 * @category database
 *
 * Query mongodb and enrich profile
 *
 * This rule will query mongodb and add a property to the user.
 */

function (user, context, callback) {
  const connection_string = configuration.MONGO_CONNECTION_STRING;
  mongo(connection_string, function (db) {
    const users = db.collection('users');
    users.findOne({email: user.email}, function (err, mongoUser) {
      if (err) return callback(err);
      if (!mongoUser) return callback(null, user, context);

      context.idToken['https://example.com/foo'] = mongoUser.foo;
      callback(null, user, context);
    });
  });
}
