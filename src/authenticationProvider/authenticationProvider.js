import { QueryEngine } from "@comunica/query-sparql";
import {
  getLiteral,
  getProfileAll,
  getThing,
  getUrl
} from "@inrupt/solid-client";
import { getDefaultSession, fetch } from "@inrupt/solid-client-authn-browser";
import { FOAF } from "@inrupt/vocab-common-rdf";

export default {
  login: async function login({ idpOrWebId }) {
    const session = getDefaultSession();
    try {
      idpOrWebId = await queryIDPfromWebId(idpOrWebId);
    } catch (error) {
      // Nothing to do here, the IDP is already set
    }
    
    if(!idpOrWebId){
      throw new Error("No IDP found")
    }

    try {
      await session.login({
        oidcIssuer: idpOrWebId,
        redirectUrl: new URL("/", window.location.href).toString(),
        clientName: "Generic Data Viewer",
      });
    } catch (error) {
      throw new Error("Login failed");
    }
  },
  logout: async function logout() {
    const session = getDefaultSession();
    await session.logout();
  },
  checkAuth: async function checkAuth() {
    const session = getDefaultSession();
    return session.info;
  },
  getPermissions: async function getPermissions() {
    const session = getDefaultSession();
    return { loggedIn: session.info.isLoggedIn };
  },
  checkError: async function checkError() {
    const session = getDefaultSession();
    if (session.info.isLoggedIn) {
      return true;
    } else {
      throw new Error("User is no longer logged in.");
    }
  },
  getIdentity: async function getIdentity() {
    const session = getDefaultSession();
    const webId = session.info.webId;
    const identity = {};
    if (!session.info.isLoggedIn) {
      return identity;
    }
    try {
      const dataSet = await getProfileAll(webId, { fetch: fetch });
      const profile = dataSet.webIdProfile;
      const webIdThing = getThing(profile, webId);
      identity.fullName = getName(webIdThing);
      identity.avatar = getProfilePicture(webIdThing);
    } catch (error) {
      return identity;
    }
    return identity;
  },
};

/**
 * Looks up the IDP of a WebID by querying the WebID .
 * @param {URL} webId the WebID to query the IDP from
 * @returns {?Promise<URL>} the first IDP of the WebID
 */
async function queryIDPfromWebId(webId) {
  const queryEngine = new QueryEngine();
  const bindings = await queryEngine.queryBindings(
    `SELECT ?idp WHERE { <${webId}> <http://www.w3.org/ns/solid/terms#oidcIssuer> ?idp }`,
    { sources: [webId] }
  );
  const firstIdp = await bindings.toArray();
  if(firstIdp.length === 0){
    return undefined
  }
  return firstIdp[0].get("idp").value;
}

/**
 *
 * @param {object} webIdThing the webId (actually of type ProfileAll, but importing this throws an error https://github.com/SolidLabResearch/generic-data-viewer-react-admin/issues/15) document to get the name from
 * @returns {?string} either the name or undefined if no foaf:name is found
 */
function getName(webIdThing) {
  const literalName = getLiteral(webIdThing, FOAF.name);
  if (literalName) {
    return literalName.value;
  } else {
    return undefined;
  }
}

/**
 *
 * @param {object} webIdThing the webId (actually of type ProfileAll, but importing this throws an error https://github.com/SolidLabResearch/generic-data-viewer-react-admin/issues/15) document to get the profile picture from
 * @returns {?string} either a url to the profile picture or undefined if no foaf:img is found
 */
function getProfilePicture(webIdThing) {
  return getUrl(webIdThing, FOAF.img);
}
