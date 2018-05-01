/**
 * @overview Check the last time that a user changed his or her account password.
 * @gallery true
 * @category access control
 * 
 * Check last password reset
 * 
 * This rule will check the last time that a user changed his or her account password.
 * 
 */

function (user, context, callback) {
  function daydiff (first, second) {
    return (second-first)/(1000*60*60*24);
  }

  const last_password_change = user.last_password_reset || user.created_at;
  
  if (daydiff(new Date(last_password_change), new Date()) > 30) {
    return callback(new UnauthorizedError('please change your password'));
  }
  callback(null, user, context);
}