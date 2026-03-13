import { QueryEngine } from "@comunica/query-sparql";
import {
  getLiteral,
  getProfileAll,
  getThing,
  getUrl,
} from "@inrupt/solid-client";
//import { getDefaultSession, fetch } from "@inrupt/solid-client-authn-browser";
import { getDefaultAuth } from "trustflows-client";
import { FOAF } from "@inrupt/vocab-common-rdf";

import comunicaEngineWrapper from "../comunicaEngineWrapper/comunicaEngineWrapper";
import configManager from "../configManager/configManager";

const queryEngine = new QueryEngine();

export default {
  login: async function login({ value }) {
    //const session = getDefaultSession();
    const auth = getDefaultAuth();

    let idp;
/*
    try {
      // assume it is a WebID
      idp = await queryIDPfromWebId(value);
    } catch (error) {
      // continue anyway, value may be an IDP
    }*/

    if (!idp) {
      // value couldn't be queried or there was no IDP returned from the query
      // value can be an IDP
      idp = value;
    }

    try {
      /*await session.login({
        oidcIssuer: idp,
        // leading dot needed to run from any path
        redirectUrl: new URL('.', window.location.href).toString(),
        clientName: "Miravi - a linked data viewer",
      });*/
      const config = configManager.getConfig();
      const clientIdUrl = config.trustflowsClientId || new URL('/app/client-id.jsonld', window.location.href).toString();
      const redirectUrl = config.redirectURL;
      await auth.login(idp, clientIdUrl, redirectUrl);
    } catch (error) {
      throw new Error("Login failed");
    }
  },
  logout: async function logout() {
    await comunicaEngineWrapper.reset();
    await queryEngine.invalidateHttpCache();
   // const session = getDefaultSession();
    // await session.logout();
    const auth = getDefaultAuth();
    const config = configManager.getConfig();
    const redirectUrl = config.redirectURL;
    await auth.logout(redirectUrl);
    window.location.reload();  
    return false;
  },
  checkAuth: async function checkAuth() {
   // const session = getDefaultSession();
   // return session.info;
    return getDefaultAuth();
  },
  getPermissions: async function getPermissions() {
    //const session = getDefaultSession();
    //return { loggedIn: session.info.isLoggedIn };
    const auth = getDefaultAuth();
    auth.isLoggedIn().then((status) => {
      return { loggedIn: status };
    });
    
  },
  checkError: async function checkError(error) {
    // const session = getDefaultSession();
    const auth = getDefaultAuth();
    if ((error.status === 401 || error.status === 403)) {
      // if(session.info.isLoggedIn){
      if (auth.isLoggedIn) {
        throw new Error("You don't have access to this resource.");
      }
      else{
        throw new Error("You don't have access to this resource. You might need to log in.");
      }
    }

  },
  getIdentity: async function getIdentity() {
    //const session = getDefaultSession();
    const auth = getDefaultAuth();
    //const webId = session.info.webId;
    const webId = auth.webId;
    const identity = {};
    /*if (!session.info.isLoggedIn) {
      return identity;
    }*/
    if (!auth.isLoggedIn) { 
      return identity;
    }
    try {
      const dataSet = await getProfileAll(webId, { fetch: fetch });
      const profile = dataSet.webIdProfile;
      const webIdThing = getThing(profile, webId);
      identity.fullName = getName(webIdThing) || webIdThing.url;
      identity.avatar = getProfilePicture(webIdThing);
    } catch (error) {
      return identity;
    }
    return identity;
  },
};

/**
 * Looks up the IDP of a WebID by querying the WebID .
 * @param {URL} webId - the WebID to query the IDP from
 * @returns {?Promise<URL>} the first IDP of the WebID or undefined if no IDP is found in the WebID document
 */
async function queryIDPfromWebId(webId) {
  let bindings;
  try {
    bindings = await queryEngine.queryBindings(
      `SELECT ?idp WHERE { <${webId}> <http://www.w3.org/ns/solid/terms#oidcIssuer> ?idp }`,
      { sources: [webId] }
    );
  } catch (error) {
    queryEngine.invalidateHttpCache(webId);
    throw new Error("Couldn't query the WebID");
  }

  const idps = await bindings.toArray();
  if (idps.length === 0) {
    return undefined;
  }
  return idps[0].get("idp").value;
}

/**
 *
 * @param {object} webIdThing - the webId (actually of type ProfileAll, but importing this throws an error https://github.com/SolidLabResearch/miravi-a-linked-data-viewer/issues/15) document to get the name from
 * @returns {?string} either the name or undefined if no foaf:name is found
 */
function getName(webIdThing) {
  const literalName = getLiteral(webIdThing, FOAF.name);
  if (literalName) {
    return literalName.value;
  }
}

/**
 *
 * @param {object} webIdThing - the webId (actually of type ProfileAll, but importing this throws an error https://github.com/SolidLabResearch/miravi-a-linked-data-viewer/issues/15) document to get the profile picture from
 * @returns {?string} either a url to the profile picture or undefined if no foaf:img is found
 */
function getProfilePicture(webIdThing) {
  return getUrl(webIdThing, FOAF.img);
}
