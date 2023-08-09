import { getDefaultSession, fetch } from "@inrupt/solid-client-authn-browser";
import { getLiteral, getProfileAll, getThing } from "@inrupt/solid-client";
import { FOAF } from "@inrupt/vocab-common-rdf";
import { useEffect, useState } from "react";
import { QueryEngine } from "@comunica/query-sparql";
import "./LoginPage.css";
import PropTypes from "prop-types";

function SolidLoginForm(props) {
  const session = getDefaultSession();
  let webId = session.info.webId;
  const [name, setName] = useState(undefined);
  const [errorMessage, setErrorMessage] = useState(undefined);

  useEffect(() => {
    let getName = async () => {
      if (webId) {
        try {
          let dataSet = await getProfileAll(webId, { fetch: fetch });
          let profile = dataSet.webIdProfile;
          const webIdThing = getThing(profile, webId);
          let literalName = getLiteral(webIdThing, FOAF.name);
          if (literalName) {
            setName(literalName.value);
          } else {
            setName(webId);
          }
        } catch {
          setName(webId);
        }
      }
    };

    getName();
  }, [webId]);

  /**
   * Handling what should happen when the user is trying to log in by pressing the log in button.
   * @param {Event} event the event calling the EventListener
   */
  async function handleLogin(event) {
    event.preventDefault();
    setErrorMessage(undefined);
    let idp = event.target[0].value;
    try {
      idp = await queryIDPfromWebId(idp);
      console.log(idp);
    } catch (error) {
      // Nothing to do here, the IDP is already set
    }

    try {
      await session.login({
        oidcIssuer: idp,
        redirectUrl: new URL("/", window.location.href).toString(),
        clientName: "Generic Data Viewer",
      });
    } catch (error) {
      setErrorMessage("Something went wrong logging in. Please try again.");
    }
  }

  /**
   * Handling what should happen when the user logs out.
   * @param {Event} event the event calling the EventListener
   */
  function handleLogout(event) {
    event.preventDefault();
    session.logout();
  }

  if (!session.info.isLoggedIn) {
    return (
      <div className="authentication-box">
        <form className="login-form" onSubmit={handleLogin}>
          <label id="idp-label" htmlFor="idp">
            Identity Provider/WebID:
          </label>
          <input
            name="idp"
            type="text"
            id="idp"
            placeholder="Identity Provider or WebID"
            defaultValue={props.defaultIDP}
          />
          <input type="submit" value="Login" className="form-button" />
        </form>
        <label className="errorLabel">{errorMessage}</label>
      </div>
    );
  } else {
    return (
      <div className="login-form">
        <label id="logged-in-label">
          <strong>Logged in as: </strong>
          {name}
        </label>
        <button className="form-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }
}

SolidLoginForm.propTypes = {
  defaultIDP: PropTypes.string
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
    throw new Error("No IDP found");
  }
  return firstIdp[0].get("idp").value;
}

export default SolidLoginForm;