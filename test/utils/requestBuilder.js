
class RequestBuilder {
  constructor() {
    this.request =
    {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
      ip: '188.6.125.49',
      hostname: 'mydomain.auth0.com',
      query: 
      {
        scope: 'openid',
        response_type: 'code',
        connection: 'Username-Password-Authentication',
        sso: 'true',
        protocol: 'oauth2',
        audience: 'my-api',
        state: 'nB7rfBCL41nppFxqLQ-3cO75XO1QRFyD',
        client_id: 'q2hn...pXmTUA',
        redirect_uri: 'http://localhost/callback',
        device: 'Browser'
      },
      body: {},
      geoip:
      {
        country_code: 'GR',
        country_code3: 'GRC',
        country_name: 'Greece',
        city_name: 'Athens',
        latitude: 136.9733,
        longitude: 125.7233,
        time_zone: 'Europe/Athens',
        continent_code: 'EU'
      }
    }
  }
  withGeoIp(geoIp) {
    this.request.geoip = geoIp;
    return this;
  }
  build() {
    return this.request;
  }
}

module.exports = RequestBuilder;