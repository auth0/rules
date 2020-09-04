/**
 * @title ID DataWeb Verification Workflow
 * @overview Verify your user's identity in 180+ countries with ID DataWeb's adaptive Verification Workflows.
 * @gallery true
 * @category marketplace
 *
 * This configuration allows you to add an ID DataWeb verification workflow to the user’s first time login experience. This will allow your organization to ensure the user is really who they claim to be, aligning with KYC/AML requirements, and mitigating fraud attempts.
 *
 */

function iddatawebVerificationWorkflow(user, context, callback) {
  const { Auth0RedirectRuleUtilities } = require("@auth0/rule-utilities@0.1.0");

  const ruleUtils = new Auth0RedirectRuleUtilities(
    user,
    context,
    configuration
  );

  const {
    IDDATAWEB_BASE_URL,
    IDDATAWEB_CLIENT_ID,
    IDDATAWEB_CLIENT_SECRET,
    IDDATAWEB_LOG_JWT
  } = configuration;

  // initialize app metadata
  user.app_metadata = user.app_metadata || {};
  user.app_metadata.iddataweb = user.app_metadata.iddataweb || {};

  // if coming back from redirect - get token, make policy decision, and update user metadata.
  if (ruleUtils.isRedirectCallback) {
    console.log("code from IDW: " + ruleUtils.queryParams.code);

    let options = {
      method: "POST",
      url: IDDATAWEB_BASE_URL + "/axn/oauth2/token",
      headers: {
        "Cache-Control": "no-cache",
        Authorization:
          "Basic " +
          Buffer.from(
            IDDATAWEB_CLIENT_ID +
              ":" +
              IDDATAWEB_CLIENT_SECRET
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      form: {
        grant_type: "authorization_code",
        code: ruleUtils.queryParams.code,
        redirect_uri: "https://" + context.request.hostname + "/continue",
      },
    };

    request(options, function (error, response, body) {
      if (error) return callback(err);

      let jsonData = JSON.parse(body);
      let decodedToken = jwt.decode(jsonData.id_token);
      console.log("policy decision: " + decodedToken.policyDecision);
      console.log("score: " + decodedToken.idwTrustScore);
      if (IDDATAWEB_LOG_JWT === "on") {
        console.log(JSON.stringify(decodedToken));
      }

      //if IDW verification was successful - update user's metadata in Auth0.
      //this could be used for downstream application authorization,
      //or mapping access to levels of assurance.
      if (decodedToken.policyDecision === "approve") {
        user.app_metadata.iddataweb.verificationResult = "verified";
        auth0.users
          .updateAppMetadata(user.user_id, user.app_metadata)
          .then(function () {
            return callback(null, user, context);
          })
          .catch(function (err) {
            return callback(err);
          });
      }
    });

    return callback(null, user, context);
  } else {
    //if coming in for first time - redirect to IDW for verification.
    if (
      user.app_metadata.iddataweb.verificationResult === "verified" &&
      IDDATAWEB_ALWAYS_VERIFY === "off"
    ) {
      console.log("user " + user.user_id + " has been previously verified.");
      return callback(null, user, context);
      //if not previously verified, redirect
    } else {
      //if "prefill attributes" is on, build and sign JWT, and include in /auth request to ID DataWeb.
      if (IDDATAWEB_PREFILL_ATTRIBUTES === "on") {
        let prefillToken = jwt.sign(
          {
            sub: user.email,
            credential: user.email,
            email: user.email,
            fname: user.given_name,
            lname: user.family_name,
            phone: user.phone_number,
          },
          IDDATAWEB_CLIENT_SECRET,
          { expiresIn: "1h" }
        );

        context.redirect = {
          url:
            IDDATAWEB_BASE_URL +
            "/axn/oauth2/authorize?client_id=" +
            IDDATAWEB_CLIENT_ID +
            "&redirect_uri=https://" +
            context.request.hostname +
            "/continue&scope=openid+country.US&response_type=code&login_hint=" +
            prefillToken,
        };
        return callback(null, user, context);
        //if "prefill attributes" is not on, redirect without Auth0 prefill.
      } else {
        context.redirect = {
          url:
            IDDATAWEB_BASE_URL +
            "/axn/oauth2/authorize?client_id=" +
            IDDATAWEB_CLIENT_ID +
            "&redirect_uri=https://" +
            context.request.hostname +
            "/continue&scope=openid+country.US&response_type=code",
        };
        return callback(null, user, context);
      }
    }
  }
}
