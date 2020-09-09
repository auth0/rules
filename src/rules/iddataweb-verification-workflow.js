/**
 * @title ID DataWeb Verification Workflow
 * @overview Verify your user's identity in 180+ countries with ID DataWeb's adaptive Verification Workflows.
 * @gallery true
 * @category marketplace
 *
 * This configuration allows you to add an ID DataWeb verification workflow to the user’s first time login experience. This will allow your organization to ensure the user is really who they claim to be, aligning with KYC/AML requirements, and mitigating fraud attempts.
 *
 */

async function iddatawebVerificationWorkflow(user, context, callback) {
  const { Auth0RedirectRuleUtilities } = require("@auth0/rule-utilities@0.1.0");
  const axiosClient = require("axios@0.19.2");
  const url = require("url");

  const ruleUtils = new Auth0RedirectRuleUtilities(
    user,
    context,
    configuration
  );

  const {
    IDDATAWEB_BASE_URL,
    IDDATAWEB_CLIENT_ID,
    IDDATAWEB_CLIENT_SECRET,
    IDDATAWEB_LOG_JWT,
    IDDATAWEB_ALWAYS_VERIFY,
    IDDATAWEB_PREFILL_ATTRIBUTES,
  } = configuration;

  const idwBasicAuth = Buffer.from(
    IDDATAWEB_CLIENT_ID + ":" + IDDATAWEB_CLIENT_SECRET
  ).toString("base64");

  const idwTokenNamepsace = "https://iddataweb.com/";
  const idwTokenEndpoint = `${IDDATAWEB_BASE_URL}/axn/oauth2/token`;
  const idwAuthorizeEndpoint = `${IDDATAWEB_BASE_URL}/axn/oauth2/authorize`;
  const auth0ContinueUrl = `https://${context.request.hostname}/continue`;

  // initialize app metadata
  user.app_metadata = user.app_metadata || {};
  user.app_metadata.iddataweb = user.app_metadata.iddataweb || {};

  // if the user is already verified and we don't need to check, exit
  if (
    user.app_metadata.iddataweb.verificationResult === "verified" &&
    IDDATAWEB_ALWAYS_VERIFY === "off"
  ) {
    console.log("user " + user.user_id + " has been previously verified.");
    return callback(null, user, context);
  }

  // if coming back from redirect - get token, make policy decision, and update user metadata.
  if (ruleUtils.isRedirectCallback) {
    console.log("code from IDW: " + ruleUtils.queryParams.code);

    const formParams = new url.URLSearchParams({
      grant_type: "authorization_code",
      code: ruleUtils.queryParams.code,
      redirect_uri: auth0ContinueUrl,
    });

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
      Authorization: `Basic ${idwBasicAuth}`,
    };

    let decodedToken;
    try {
      const tokenResponse = await axiosClient.post(
        idwTokenEndpoint,
        formParams.toString(),
        { headers }
      );

      if (tokenResponse.data.error) {
        throw new Error(tokenResponse.data.error_description);
      }

      decodedToken = jwt.decode(tokenResponse.data.id_token);
    } catch (error) {
      return callback(error);
    }

    if (IDDATAWEB_LOG_JWT === "on") {
      console.log(JSON.stringify(decodedToken));
    }

    //check issuer, audience and experiation of ID DataWeb Token
    if (
      decodedToken.iss !== IDDATAWEB_BASE_URL ||
      decodedToken.aud !== IDDATAWEB_CLIENT_ID
    ) {
      return callback(new Error("ID token invalid."));
    }

    console.log("policy decision: " + decodedToken.policyDecision);
    console.log("score: " + decodedToken.idwTrustScore);
    console.log("IDW transaction ID: " + decodedToken.jti);

    // once verification is complete, update user's metadata in Auth0.
    //this could be used for downstream application authorization,
    //or mapping access to levels of assurance.
    user.app_metadata.iddataweb.verificationResult = {
      policyDecision: decodedToken.policyDecision,
      transactionid: decodedToken.jti,
      iat: decodedToken.iat,
    };

    try {
      auth0.users.updateAppMetadata(user.user_id, user.app_metadata);
    } catch (error) {
      return callback(error);
    }

    //include ID DataWeb results in Auth0 ID Token
    context.idToken[idwTokenNamepsace + "policyDecision"] =
      decodedToken.policyDecision;
    context.idToken[idwTokenNamepsace + "transactionId"] = decodedToken.jti;
    context.idToken[idwTokenNamepsace + "iat"] = decodedToken.iat;

    return callback(null, user, context);
  }

  // ... otherwise, redirect for verification.

  let idwRedirectUrl =
    idwAuthorizeEndpoint +
    "?client_id=" +
    IDDATAWEB_CLIENT_ID +
    "&redirect_uri=" +
    auth0ContinueUrl +
    "&scope=openid+country.US&response_type=code";

  // build and sign JWT and include in /auth request to ID DataWeb.
  if (IDDATAWEB_PREFILL_ATTRIBUTES === "on") {
    const prefillToken = jwt.sign(
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

    idwRedirectUrl += `&login_hint=${prefillToken}`;
  }

  if (ruleUtils.canRedirect) {
    context.redirect = {
      url: idwRedirectUrl,
    };
  }

  return callback(null, user, context);
}
