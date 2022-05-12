
'use strict';

const nock = require('nock');
const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const RequestBuilder = require('../utils/requestBuilder');

const ruleName = 'scaled-access-relationships-claim';

const sandbox = {
    module: {},
    require: require,
    console: console,
    global: {},
    configuration: {
        SCALED_ACCESS_BASEURL: "https://api.int.scaledaccess.com/privategroups-v2",
        SCALED_ACCESS_TENANT: "tenant",
        SCALED_ACCESS_CUSTOMCLAIM: "https://tenant.com/relationships",
        SCALED_ACCESS_AUDIENCE: "https://tenant.com/relationships",
        SCALED_ACCESS_CLIENTID: "__test_clientid__",
        SCALED_ACCESS_CLIENTSECRET: "__test_clientsecret__",
    }
};

describe(ruleName, () => {
    let context;
    let rule;
    let user;

    beforeEach(() => {
        rule = loadRule(ruleName, sandbox, {});
        nock(`https://some-tenant.eu.auth0.com`).post("/oauth/token")
            .reply(200, {
                access_token: "some access token",
                expires_in: 86400
            });
    });

    afterEach(() => {
        nock.cleanAll();
        delete sandbox.global.scaledAccessM2mToken;
    })

    describe("When the user already exists", () => {
        beforeEach(() => {
            const request = new RequestBuilder().build();
            request.hostname = "some-tenant.eu.auth0.com";
            context = new ContextBuilder()
                .withRequest(request)
                .build();
        });

        beforeEach(() => {
            user = {
                "user_id": "existing_user_id"
            };
        });

        describe("and they have no relationships", () => {
            beforeEach(() => {
                givenTheUserHasRelationships([]);
            });

            it("should have an empty array claim", (done) => {
                rule(user, context, (err, u, c) => {
                    expect(err).toBeFalsy();
                    expect(c).toEqual(context);
                    expect(context.accessToken["https://tenant.com/relationships"]).toBeDefined();
                    expect(context.accessToken["https://tenant.com/relationships"]).toEqual([]);
                    done();
                });
            });
        });

        describe("and they have relationships", () => {
            beforeEach(() => {
                givenTheUserHasRelationships([
                    {
                        type: "is_sports_member_of",
                        id: "123"
                    },
                    {
                        type: "is_admin_of",
                        id: "456"
                    }]);
            });

            it("should have a tenants claim", (done) => {
                rule(user, context, (err, u, c) => {
                    expect(err).toBeFalsy();
                    expect(c).toEqual(context);
                    expect(context.accessToken["https://tenant.com/relationships"]).toBeDefined();
                    expect(context.accessToken["https://tenant.com/relationships"]).toContainEqual(
                        {
                            "relationshipType": "is_admin_of",
                            "to": {
                                "id": "456",
                                "type": "subscription"
                            }
                        }
                    );
                    expect(context.accessToken["https://tenant.com/relationships"]).toContainEqual(
                        {
                            "relationshipType": "is_sports_member_of",
                            "to": {
                                "id": "123",
                                "type": "subscription"
                            }
                        }
                    );
                    done();
                });
            });
        })
    });
});

function givenTheUserHasRelationships(relationships) {
    const response = relationships.map((rel) => {
        return {
            "relationshipType": rel.type,
            "to": {
                "id": rel.id,
                "type": "subscription"
            }
        };
    });
    nock("https://api.int.scaledaccess.com")
        .get("/privategroups-v2/tenant/actors/user/existing_user_id/relationships")
        .reply(200, response);
}