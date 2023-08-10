import { QueryEngine } from "@comunica/query-sparql";
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";

export default {
  login: async function login({ idpOrWebId }) {
    const { session } = getDefaultSession();
    try {
      idpOrWebId = await queryIDPfromWebId(idpOrWebId);
    } catch (error) {
      // Nothing to do here, the IDP is already set
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
};

/**
 * Looks up the IDP of a WebID by querying the WebID .
 * @param {URL} webId the WebID to query the IDP from
 * @returns {Promise<URL>} the first IDP of the WebID
 */
async function queryIDPfromWebId(webId) {
  let queryEngine = new QueryEngine();
  let bindings = await queryEngine.queryBindings(
    `SELECT ?idp WHERE { <${webId}> <http://www.w3.org/ns/solid/terms#oidcIssuer> ?idp }`,
    { sources: [webId] }
  );
  let firstIdp = await bindings.toArray();
  if (!firstIdp) {
    throw new Error("No Identity Provider found");
  }
  return firstIdp[0].get("idp").value;
}
