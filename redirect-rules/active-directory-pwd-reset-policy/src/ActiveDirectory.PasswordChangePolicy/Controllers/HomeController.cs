using System;
using System.Web.Mvc;
using System.Configuration;
using System.DirectoryServices.AccountManagement;
using System.IdentityModel.Protocols.WSTrust;
using System.IdentityModel.Services;
using System.IdentityModel.Tokens;
using System.Security.Claims;
using System.ServiceModel.Security.Tokens;

using ActiveDirectory.PasswordChangePolicy.Models;

using Microsoft.Owin.Security.DataHandler.Encoder;

namespace ActiveDirectory.PasswordChangePolicy.Controllers
{
    public class HomeController : Controller
    {
        [Route("")]
        public ActionResult Index(string token)
        {
            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    IssuerSigningToken = new BinarySecretSecurityToken(
                            TextEncodings.Base64Url.Decode(ConfigurationManager.AppSettings["auth0:ClientSecret"])),
                    ValidIssuer = ConfigurationManager.AppSettings["auth0:Domain"],
                    ValidAudience = ConfigurationManager.AppSettings["auth0:ClientId"]
                };

                var handler = new JwtSecurityTokenHandler();
                SecurityToken securityToken;
                ClaimsPrincipal principal = handler.ValidateToken(token, validationParameters, out securityToken);
                ClaimsIdentity identity = principal.Identity as ClaimsIdentity;
                identity.AddClaim(new Claim("http://schemas.microsoft.com/accesscontrolservice/2010/07/claims/identityprovider", "Auth0"));
                identity.AddClaim(new Claim(ClaimTypes.Name, identity.FindFirst(ClaimTypes.Email).Value));

                var sessionToken = new SessionSecurityToken(principal, TimeSpan.FromMinutes(15));
                FederatedAuthentication.SessionAuthenticationModule.WriteSessionTokenToCookie(sessionToken);

                return RedirectToAction("Change");
            }
            catch (Exception ex)
            {
                return RedirectToAction("Unauthorized");
            }
        }

        [Authorize]
        [Route("change")]
        public ActionResult Change()
        {
            var claim = ClaimsPrincipal.Current.FindFirst("SAMAccountName");
            if (claim == null || String.IsNullOrEmpty(claim.Value))
            {
                ModelState.AddModelError("", "The SAMAccountName is not available.");
            }

            if (String.IsNullOrEmpty(User.Identity.Name))
            {
                ModelState.AddModelError("", "The name of the user is not available.");
            }

            return View(new PasswordChangeModel());
        }

        [Authorize]
        [Route("change/submit")]
        public ActionResult ChangeSubmit(PasswordChangeModel model)
        {
            var claim = ClaimsPrincipal.Current.FindFirst("SAMAccountName");
            if (claim == null || String.IsNullOrEmpty(claim.Value))
            {
                ModelState.AddModelError("", "The SAMAccountName is not available.");
            }

            if (String.IsNullOrEmpty(User.Identity.Name))
            {
                ModelState.AddModelError("", "The name of the user is not available.");
            }

            if (!ModelState.IsValid)
            {
                return View("Change");
            }

            try
            {
                // Update password.
                using (var context = new PrincipalContext(ContextType.Domain, ConfigurationManager.AppSettings["AdDomain"], ConfigurationManager.AppSettings["AdBase"], ClaimsPrincipal.Current.FindFirst("SAMAccountName").Value, model.OldPassword))
                {
                    using (var user = UserPrincipal.FindByIdentity(context, IdentityType.SamAccountName, ClaimsPrincipal.Current.FindFirst("SAMAccountName").Value))
                    {
                        user.ChangePassword(model.OldPassword, model.NewPassword);
                    }
                }

                // Generate a JWT for the redirect rule.
                var now = DateTime.UtcNow;
                var tokenDescriptor = new SecurityTokenDescriptor
                    {
                        Subject = new ClaimsIdentity(new[] { 
                        new Claim("sub", ClaimsPrincipal.Current.FindFirst(ClaimTypes.NameIdentifier).Value),
                        new Claim("aud", ConfigurationManager.AppSettings["auth0:ClientId"]),
                        new Claim("pwd_change", "true")
                    }),
                        TokenIssuerName = ConfigurationManager.AppSettings["auth0:Domain"],
                        Lifetime = new Lifetime(now, now.AddMinutes(10)),
                        SigningCredentials = new SigningCredentials(
                            new InMemorySymmetricSecurityKey(TextEncodings.Base64Url.Decode(ConfigurationManager.AppSettings["auth0:ClientSecret"])),
                            "http://www.w3.org/2001/04/xmldsig-more#hmac-sha256",
                            "http://www.w3.org/2001/04/xmlenc#sha256"),
                    };

                // Redirect back to Auth0.
                var handler = new JwtSecurityTokenHandler();
                var securityToken = handler.CreateToken(tokenDescriptor);
                return Redirect(ConfigurationManager.AppSettings["auth0:Domain"] + "continue?token=" + handler.WriteToken(securityToken));
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", ex.Message);
                return View("Change");
            }
        }

        [Route("unauthorized")]
        public ActionResult Unauthorized()
        {
            return View();
        }
    }
}