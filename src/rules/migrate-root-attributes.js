/**
 * @title Move user_metadata attributes to profile root attributes.
 * @overview Moves select data from user_metadata to profile root attributes (family_name, given_name, name, nickname and picture).
 * @gallery true
 * @category enrich profile
 *
 * This rule moves select data from user_metadata to profile root attributes (family_name, given_name, name, nickname and picture).
 * Verify the field mapping before enabling this rule.
 * The rule will determine if there is a mapped field on the user_metadata before the update.
 * Important:
 *
 * 1- The rule updates the profile root attribute with the mapped field from user_metadata.
 * 2- The mapped fields from user_metadata will be removed following the update.
 * 3- This rule will be executed on each login event. For signup scenarios, you should only consider using this rule if you currently use a custom signup form or Authentication Signup API, as these signup methods do not support setting the root attributes.
 */
function (user, context, cb) {
  // Field Mapping, the property is the root attribute and the value is the field name on user_metadata.
  // You can change the value in case you don't have the same name on user_metadata.
  var fieldMapping = {
    family_name: 'family_name',
    given_name: 'given_name',
    name: 'name',
    nickname: 'nickname',
    picture: 'picture'
  };

  if (needMigration(user)) {
    var ManagementClient = require('auth0@2.9.1').ManagementClient;
    var management = new ManagementClient({
      domain: auth0.domain,
      token: auth0.accessToken
    });

    management.updateUser(
      { id: user.user_id }, generateUserPayload(user), function (err, updatedUser) {
        if ( err ) {
          cb(err);
        } else {
          updateRuleUser(user, updatedUser);
          cb(null, user, context);
        }
      }
    );
  } else {
    cb(null, user, context);
  }

  function needMigration(user) {
    if (user.user_metadata) {
      for (var key in fieldMapping) {
        if (typeof user.user_metadata[fieldMapping[key]] === 'string') {
          return true;
        }
      }
    }

    return false;
  }

  function generateUserPayload(user) {
    var payload = { user_metadata: {}};
    var userMetadata = user.user_metadata;

    for (var key in fieldMapping) {
      generateUserPayloadField(userMetadata, payload, key, fieldMapping[key]);
    }

    return payload;
  }

  function updateRuleUser(user, updatedUser) {
    for (var key in fieldMapping) {
      if (typeof user.user_metadata[fieldMapping[key]] === 'string') {
        user[key] = updatedUser[key];
        delete user.user_metadata[fieldMapping[key]];
      }
    }
  }

  function generateUserPayloadField(userMetadata, payload, rootField, metadataField) {
    if (typeof userMetadata[metadataField] === 'string') {
      payload[rootField] = userMetadata[metadataField];
      payload.user_metadata[metadataField] = null;
    }
  }
}
