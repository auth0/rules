Integrating SecZetta and Auth0 provides real-time risk-based access policy to be leveraged when non-employee users attempt to log in to a protected resource. Auth0 can apply SecZetta risk score(s) to an authentication decision to determine the level of authentication needed. This allows for context-based access decisions to extend to all non-employees.

## Prerequisites

1. An Auth0 account and tenant. [Sign up for free here](https://auth0.com/signup). 
2. An active SecZetta account and tenant where you have administrative privileges. To set up a new SecZetta account, please reach out to [SecZetta Support](mailto:info@seczetta.com)

## Setup in SecZetta

To configure the integration with SecZetta, the only thing required is an understanding of how users map to SecZetta profiles. SecZetta stores user data as 'profiles' and in order to look up a users risk score, the Auth0 rule needs to be able to pull the profile information for the user logging in. This is done typically by using the username field and mapping that to an attribute in SecZetta

### Using Advanced Search API

The Advanced Search API is what will be used to pull the profile data based on the user logging in. You can find detailed information on this api [here](https://seczetta.nonemployee.com/api/v1/neprofile.html#advanced-search). This integration uses the following request body to find the user profile. 

There are a few variables in that body that are required (see below for configuration details)
1. profileTypeId - this is the id of the profile type 
2. attributeId - this is the id of the attribute that will be used to look the user up (i.e. `email`)
3. uid - the value of this attribute (i.e. `john.doe@company.com`)

```json
{
	advanced_search: {
    	label: "All Contractors",
        condition_rules_attributes: [
          {
          	"type": "ProfileTypeRule",
          	"comparison_operator": "==",
          	"value": profileTypeId
          },
          {
          	"type": "ProfileAttributeRule",
          	"condition_object_id": attributeId,
          	"object_type": "NeAttribute",
          	"comparison_operator": "==",
          	"value": uid
          }
        ]
	}
}
```

### Get Risk Score
Once you get the profile from the API above we need to execute one more API to grab the overall risk score for that profile.

 

Request URL:
  `https://taylordemo.mynonemployee.com/api/risk_scores?object_id=${objectId}`
  
  Example Response: 
  ```json
  {
    "risk_scores": [
      {
        "id": "14118693-983e-462f-a330-f3b34d29f281",
        "uid": "036e7e2a3d0c41938609cdc6029d5b11",
        "object_id": "633b5e71-090c-4a47-a1a3-d0b8338df872",
        "object_type": "Profile",
        "overall_score": 3.5,
        "overall_risk_level_id": "29fc4382-2c60-4c6d-891b-15102cdc9e01",
        "impact_score": 7.0,
        "impact_risk_level_id": "29fc4382-2c60-4c6d-891b-15102cdc9e01",
        "probability_score": 0.0,
        "probability_risk_level_id": "c1f10e76-44c0-4bda-b344-8ae2a256d6c4"
      }
    ]
  }
  ```
 > notice in the response that the risk score still comes back as an array of 1

## Add the Auth0 Rule

 **Please note:** Clicking any of the 3 buttons on the Edit Rule screen will save and activate the Rule. When initially installed, the Rule will be skipped until the required configuration (explained below) is added.

1. Click **Add Integration** at the top of this page   ​
2. Click **Save Changes** to activate this integration

For information on testing and debugging Rules, please [see our documentation](https://auth0.com/docs/rules/debug-rules).

## Add the Auth0 Rule Configuration

 **Please note:** Once marked the required configuration below is added, all logins for your tenant will be processed by this Rule. Please make sure all components have been configured correctly and verified on a [test tenant](https://auth0.com/docs/dev-lifecycle/set-up-multiple-environments) before activating the integration in production.

1. Go to **Rules** (or **Auth Pipeline > Rules**) in the [Auth0 dashboard](https://manage.auth0.com/#/rules).
2. Check the tenant name on the top right of your screen (see warning in the next section)
3. Scroll down to the **Settings** section.
4. Add the following keys ([more about Rules configuration here](https://auth0.com/docs/rules/configuration)):

**Required configuration**

- `SECZETTA_API_KEY`: API Token from your SecZetta tennant
- `SECZETTA_BASE_URL`: URL for your SecZetta tennant
- `SECZETTA_ATTRIBUTE_ID` the id of the SecZetta attribute you are searching on (i.e personal_email, user_name, etc.)
- `SECZETTA_PROFILE_TYPE_ID`: the id of the profile type this user's profile in SecZetta
- `SECZETTA_ALLOWABLE_RISK`: Set to a risk score integer value above which MFA is required
- `SECZETTA_MAXIMUM_ALLOWED_RISK`: Set to a maximum risk score integer value above which login fails.

>Please note, `SECZETTA_MAXIMUM_ALLOWED_RISK` should be greater than `SECZETTA_ALLOWABLE_RISK`. A good starting point is to use `5` for allowable risk and `7.5` for maximum risk

>SECZETTA_ATTRIBUTE_ID and SECZETTA_PROFILE_TYPE_ID will be in the UUIDv4 format. (i.e. `7cffa07d-ad6d-4398-ba07-b3d1e5f9ee9f`)

**Optional configuration:**

- `SECZETTA_AUTHENTICATE_ON_ERROR` Choose whether or not the rule continues to authenticate on error, by default this is `false`
- `SECZETTA_RISK_KEY` The attribute name on the account where the users risk score is stored, if not set, it will now store the risk score on the Auth0 record


## Results

[[TODO: Explain what the customer should expect when the Rule is active and configured properly]]
This rule (when configured properly) will run right before Authentication time. The rule itself controls the authentication flow and will require MFA or deny access completely if the risk score is too high.


If a user's risk score is too high, an error will occur with the following message:
`A 8.25 Risk score is too high. Maximum acceptable risk is 7.5`
This message can be adjusted in the rule itself




## Troubleshooting

For any issues regarding this integration please access the SecZetta support team via your portal located [here](https://seczetta-communities.force.com/support/s/login/)








