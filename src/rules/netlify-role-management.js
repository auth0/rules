/**
 * @title Netlify Role Management
 * @overview Adds a default role if the user doesn't have any yet and attaches roles to the ID Token.
 * @gallery true
 * @category marketplace
 *
 * **Optional configuration:**
 *
 *    - `DEFAULT_ROLE_NAME` - name of the default role to be given to a user
 *    - `DEFAULT_ROLE_ID` - id of the role to be given to a user
 *    - `CUSTOM_CLAIMS_NAMESPACE` - namespace for adding custom claims to ID Token
 */

async function netlifyRoleManagement(user, context, callback) {
  const ManagementClient = require('auth0@2.27.1').ManagementClient;

  const namespace =
    configuration.CUSTOM_CLAIMS_NAMESPACE || 'https://netlify-integration.com';
  const assignedRoles = (context.authorization || {}).roles || [];
  const defaultRoleName = configuration.DEFAULT_ROLE_NAME;
  const defaultRoleId = configuration.DEFAULT_ROLE_ID;

  //give default role if the user doesn't already have any roles assigned
  if (
    (!assignedRoles || assignedRoles.length === 0) &&
    defaultRoleName &&
    defaultRoleId
  ) {
    try {
      const management = new ManagementClient({
        token: auth0.accessToken,
        domain: auth0.domain
      });
      await management.assignRolestoUser(
        { id: user.user_id },
        { roles: [defaultRoleId] }
      );
    } catch (ex) {
      console.error('Failed to add default role to user', ex);
    } finally {
      assignedRoles.push(defaultRoleName);
    }
  }

  context.idToken[namespace + '/roles'] = assignedRoles;
  return callback(null, user, context);
}
