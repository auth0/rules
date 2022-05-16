/**
 *
 * This rule will query mongodb and add a property to the user.
 *
 * @title Query mongodb and enrich profile
 * @overview Query mongoDB and add a property to the user.
 * @category database
 */

function enrichProfileWithMongo(user, context, callback) {
  const MongoClient = require('mongodb@3.1.4').MongoClient;
  const mongoUrl = configuration.MONGO_CONNECTION_STRING;

  MongoClient.connect(
    mongoUrl,
    { useNewUrlParser: true },
    function (err, client) {
      if (err) return callback(err);

      const db = client.db('YOUR_MONGO_DATABASE_NAME');
      const users = db.collection('users');

      users.findOne({ email: user.email }, function (err, mongoUser) {
        if (err) return callback(err);
        if (!mongoUser) return callback(null, user, context);

        context.idToken['https://example.com/foo'] = mongoUser.foo;
        callback(null, user, context);
      });
    }
  );
}
