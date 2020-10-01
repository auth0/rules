/**
 * @title Remove attributes from a user
 * @overview Remove attributes from a user
 * @gallery true
 * @category enrich profile
 *
 * Sometimes you don't need every attribute from the user. You can use a rule to delete attributes.
 *
 */

function removeUserAttribute(user, context, callback) {
  const blacklist = ['some_attribute'];

  Object.keys(user).forEach(function (key) {
    if (blacklist.indexOf(key) > -1) {
      delete user[key];
    }
  });

  callback(null, user, context);
}
