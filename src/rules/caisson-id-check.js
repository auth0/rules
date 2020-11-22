/**
 * @title Caisson ID Check
 * @overview Validate US driver's licenses and international passports in real time.
 * @gallery true
 * @category marketplace
 *
 * Please see the [Caisson integration](https://marketplace.auth0.com/integrations/caisson-id-check) for more information and detailed installation instructions.
 *
 * **Required configuration** (this Rule will be skipped if any of the below are not defined):
 *
 *    - `CAISSON_PUBLIC_KEY` Found on the Caisson Developer tab above
 *    - `CAISSON_PRIVATE_KEY` Found on the Caisson Developer tab above
 *    - `CAISSON_LOGIN_FREQUENCY_DAYS` Set to "-1" to check ID on registration only, "0" to check on all logins, and another positive integer for a minimum number of days between ID checks
 *
 * **Optional configuration:**
 *
 *    - `CAISSON_DEBUG` Set to "true" to log errors in the console
 */

async function caissonIDCheck(user, context, callback) {
  if (
    !configuration.CAISSON_PUBLIC_KEY ||
    !configuration.CAISSON_PRIVATE_KEY ||
    !configuration.CAISSON_LOGIN_FREQUENCY_DAYS
  ) {
    console.log('Missing required configuration. Skipping.');
    return callback(null, user, context);
  }

  const { Auth0RedirectRuleUtilities } = require('@auth0/rule-utilities@0.1.0');

  //copy off the config obj so we can use our own private key for session token signing.
  let caissonConf = JSON.parse(JSON.stringify(configuration));
  caissonConf.SESSION_TOKEN_SECRET = configuration.CAISSON_PRIVATE_KEY;

  const manager = {
    creds: {
      public_key: caissonConf.CAISSON_PUBLIC_KEY,
      private_key: caissonConf.CAISSON_PRIVATE_KEY
    },
    /* prettier-ignore */
    debug: caissonConf.CAISSON_DEBUG && caissonConf.CAISSON_DEBUG.toLowerCase() === "true" ? true : false,
    idCheckFlags: {
      login_frequency_days: parseInt(
        caissonConf.CAISSON_LOGIN_FREQUENCY_DAYS,
        10
      )
    },
    caissonHosts: {
      idcheck: 'https://id.caisson.com',
      api: 'https://api.caisson.com',
      dashboard: 'https://www.caisson.com'
    },
    axios: require('axios@0.19.2'),
    util: new Auth0RedirectRuleUtilities(user, context, caissonConf)
  };

  user.app_metadata = user.app_metadata || {};
  user.app_metadata.caisson = user.app_metadata.caisson || {};
  const caisson = user.app_metadata.caisson;

  /**
   * Toggleable logger.  Set CAISSON_DEBUG in the Auth0 configuration to enable.
   *
   * @param {error} err
   */
  function dLog(err) {
    if (manager.debug) {
      console.log(err);
    }
  }

  /**
   * Helper function for converting milliseconds to days. Results rounded down.
   * @param {int} mils
   */
  function millisToDays(mils) {
    return Math.floor(mils / 1000 / 60 / 60 / 24);
  }

  /**
   * Creates Caisson specific session token and sets redirect url.
   */
  function setIDCheckRedirect() {
    const token = manager.util.createSessionToken({
      public_key: manager.creds.public_key,
      host: context.request.hostname
    });

    //throws if redirects aren't allowed here.
    manager.util.doRedirect(`${manager.caissonHosts.idcheck}/auth0`, token); //throws
  }

  /**
   * Swaps the temp Caisson exchange token for an ID Check key.
   * https://www.caisson.com/docs/reference/api/#exchange-check-token-for-check-id
   * @param {string} t
   */
  async function exchangeToken() {
    try {
      let resp = await manager.axios.post(
        manager.caissonHosts.api + '/v1/idcheck/exchangetoken',
        { check_exchange_token: manager.util.queryParams.t },
        {
          headers: {
            Authorization: `Caisson ${manager.creds.private_key}`
          }
        }
      );

      return resp.data.check_id;
    } catch (error) {
      let err = error;
      if (err.response && err.response.status === 401) {
        err = new UnauthorizedError(
          'Invalid private key.  See your API credentials at https://www.caisson.com/developer .'
        );
      }
      throw err;
    }
  }

  /**
   * Fetches and validates ID Check results.
   * https://www.caisson.com/docs/reference/api/#get-an-id-check-result
   * @param {string} check_id
   */
  async function idCheckResults(check_id) {
    try {
      let resp = await manager.axios.get(
        manager.caissonHosts.api + '/v1/idcheck',
        {
          headers: {
            Authorization: `Caisson ${manager.creds.private_key}`,
            'X-Caisson-CheckID': check_id
          }
        }
      );

      if (resp.data.error) {
        throw new Error(
          'Error in Caisson ID Check: ' + JSON.stringify(resp.data)
        );
      }

      let results = {
        check_id: resp.data.check_id,
        auth0_id: resp.data.customer_id,
        timestamp: resp.data.checked_on,
        /* prettier-ignore */
        status: resp.data.confidence.document === "high" && resp.data.confidence.face === "high" ? "passed" : "flagged"
      };

      validateIDCheck(results); //throws if invalid

      return results;
    } catch (error) {
      let err = error;
      if (err.response && err.response.status === 401) {
        err = new UnauthorizedError(
          'Invalid private key.  See your API credentials at https://www.caisson.com/developer .'
        );
      }

      throw err;
    }
  }

  /**
   * Validates Caisson ID Check results, ensuring the data is usable.
   * @param {object} results
   */
  function validateIDCheck(results) {
    const IDCheckTTL = 20 * 60 * 1000; //20 mins
    if (
      results.auth0_id !==
      user.user_id + '__' + manager.util.queryParams.state
    ) {
      throw new UnauthorizedError(
        'ID mismatch. Caisson: %o, Auth0: %o',
        results.auth0_id,
        user.user_id
      );
    } else if (Date.now() - Date.parse(results.timestamp) > IDCheckTTL) {
      throw new UnauthorizedError('ID Check too old.');
    }
  }

  /**
   * Updates Caisson values on the Auth0 user object's app_metadata object.
   * @param {object} results
   */
  async function updateUser(results) {
    caisson.idcheck_url =
      manager.caissonHosts.dashboard + '/request/' + results.check_id;
    caisson.status = results.status;
    caisson.last_check = Date.now();
    caisson.count = caisson.count ? caisson.count + 1 : 1;

    try {
      await auth0.users.updateAppMetadata(user.user_id, { caisson });
    } catch (err) {
      throw err;
    }
  }

  /**
   * ID Check is done, handle results.
   */
  if (manager.util.isRedirectCallback) {
    //is it our redirect?

    if (
      !manager.util.queryParams.caisson_flow ||
      parseInt(manager.util.queryParams.caisson_flow, 10) !== 1
    ) {
      //no, end it.
      return callback(null, user, context);
    }

    try {
      if (!manager.util.queryParams.t) {
        throw new Error('Missing Caisson exchange key');
      }

      const check_id = await exchangeToken();
      const results = await idCheckResults(check_id);
      await updateUser(results);

      //deny the login if the ID Check is flagged
      if (results.status === 'flagged') {
        throw new UnauthorizedError('ID Check flagged.');
      }
    } catch (err) {
      dLog(err);
      return callback(err);
    }

    return callback(null, user, context);
  }

  /**
   * Else we're in the initial auth flow.
   * Perform ID Checks when appropriate.
   */

  try {
    if (isNaN(manager.idCheckFlags.login_frequency_days)) {
      //Do nothing.  Skip if no preference is set.
    } else if (!caisson.last_check || caisson.status !== 'passed') {
      //Always perform the first ID Check or if the
      //last ID Check didn't pass.
      setIDCheckRedirect();
    } else if (
      manager.idCheckFlags.login_frequency_days >= 0 &&
      millisToDays(Date.now() - caisson.last_check) >=
        manager.idCheckFlags.login_frequency_days
    ) {
      //ID Check if the requisite number of days have passed since the last check.
      //Skip if we're only supposed to check once (login_frequency_days < -1).
      setIDCheckRedirect();
    }
  } catch (err) {
    dLog(err);
    return callback(err);
  }

  return callback(null, user, context);
}
