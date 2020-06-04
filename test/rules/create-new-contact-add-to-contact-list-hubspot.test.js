'use strict';

const loadRule = require('../utils/load-rule');
const ContextBuilder = require('../utils/contextBuilder');
const UserBuilder = require('../utils/userBuilder');

const ruleName = 'create-new-contact-add-to-contact-list-hubspot';
describe(ruleName + ' - sunny path', () => {
    let rule;
    let context;
    let user;
    let globals;
    let stubs = {};
  
    const newHubSpotContactId = 123;
  
    beforeEach(() => {
      globals = {
        auth0: {
          users: {
            updateAppMetadata: jest.fn()
          }
        },
        configuration: {
            HUBSPOT_API_KEY: 'API_KEY',
            HUBSPOT_NEW_MEMBER_LIST_ID: '1',
        }
      };
    
    stubs['request'] = jest.fn().mockImplementationOnce((obj, cb) => {
        cb(null, { statusCode: 200 }, JSON.stringify({ vid: newHubSpotContactId }));
      })
      .mockImplementationOnce((obj, cb) => {
        cb(null, { statusCode: 200 }, {
            "updated": [
                newHubSpotContactId
            ],
            "discarded": [],
            "invalidVids": [],
            "invalidEmails": []
        });
      });

      user = new UserBuilder().build();
      user.given_name = "Given";
      user.family_name = "Family";
  
      context = new ContextBuilder().build();
      rule = loadRule(ruleName, globals, stubs);
    });
  
    it('should create a hubspot contact, add to a contact list and set app metadata', (done) => {
        rule(user, context, () => { });
  
        // First POST is to get the access token
        const newTokenPostOptions = stubs.request.mock.calls[0][0];
        const newTokenPostBody = JSON.parse(newTokenPostOptions.body);
        expect(newTokenPostOptions.url).toBe('https://api.hubapi.com/contacts/v1/contact/?hapikey=' + globals.configuration.HUBSPOT_API_KEY);
        expect(newTokenPostBody.properties[0].value).toBe(user.email);
        expect(newTokenPostBody.properties[1].value).toBe(user.given_name);
        expect(newTokenPostBody.properties[2].value).toBe(user.family_name);

        // Second POST is to create the lead
        const addContactToListPostOptions = stubs.request.mock.calls[1][0];
        const addContactToListPostBody = JSON.parse(addContactToListPostOptions.body);
        expect(addContactToListPostOptions.url).toBe('https://api.hubapi.com/contacts/v1/lists/' + globals.configuration.HUBSPOT_NEW_MEMBER_LIST_ID + '/add?hapikey=' + globals.configuration.HUBSPOT_API_KEY);
        expect(addContactToListPostBody.vids[0]).toBe(newHubSpotContactId);

        const updateAppMetadataCall = globals.auth0.users.updateAppMetadata.mock.calls[0];
        expect(updateAppMetadataCall[0]).toBe(user.user_id);
        expect(updateAppMetadataCall[1].hubSpotContactCreated).toBe(true);
        expect(updateAppMetadataCall[1].hubSpotContactId).toBe(newHubSpotContactId);
        expect(updateAppMetadataCall[1].hubSpotContactAddedToList).toBe(true);
  
        done();
    });

    describe('fail to create a contact', () => {
        beforeEach(() => {
        
        stubs['request'] = jest.fn().mockImplementationOnce((obj, cb) => {
            cb(null, { statusCode: 500 }, null);
          })
          .mockImplementationOnce((obj, cb) => {
            cb(null, { statusCode: 500 },  null);
          });
        });
      
        it('should fail create a hubspot contact', (done) => {
            rule(user, context, () => { });
      
            const updateAppMetadataCall = globals.auth0.users.updateAppMetadata.mock.calls[0];
            expect(updateAppMetadataCall[0]).toBe(user.user_id);
            expect(updateAppMetadataCall[1].hubSpotContactCreated).toBe(false);
      
            done();
        });
      });

    
    describe('fail to add the contact to a list', () => {
        beforeEach(() => {
        
        stubs['request'] = jest.fn().mockImplementationOnce((obj, cb) => {
            cb(null, { statusCode: 200 }, JSON.stringify({ vid: newHubSpotContactId }));
          })
          .mockImplementationOnce((obj, cb) => {
            cb(null, { statusCode: 500 },  null);
          });
        });
      
        it('should fail create a hubspot contact', (done) => {
            rule(user, context, () => { });
      
            const updateAppMetadataCall = globals.auth0.users.updateAppMetadata.mock.calls[0];
            expect(updateAppMetadataCall[0]).toBe(user.user_id);
            expect(updateAppMetadataCall[1].hubSpotContactCreated).toBe(true);
            expect(updateAppMetadataCall[1].hubSpotContactId).toBe(newHubSpotContactId);
            expect(updateAppMetadataCall[1].hubSpotContactAddedToList).toBe(false);
      
            done();
        });
      });
  });
  