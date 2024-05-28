import "./LoginPage.css";
import { useLogin, useNotify } from "react-admin";
import { Component, useState } from "react";
import { useConfig  } from '../../ConfigContext/ConfigContext';

/**
 * @returns {Component} a login form for logging into your Identity Provider.
 */
function SolidLoginForm() {
  const {config} = useConfig();
  const login = useLogin();
  const notify = useNotify();
  const [isIdp, setIsIdp] = useState(true);

  /**
   * Handling what should happen when the user is trying to log in by pressing the log in button.
   * @param {Event} event - the event calling the EventListener
   */
  async function handleLogin(event) {
    event.preventDefault();
    try {
      await login({ type: isIdp ? "idp" : "webId", value: event.target[2].value });
    } catch (error) {
      notify(error.message);
    }
  }

  return (
    <form onSubmit={handleLogin} className="login-form">
      <div className="login-form-type-selection-box">
        <label className=".login-form-label">
          Identity Provider
        </label>
        <input type="radio" onChange={() => {setIsIdp(!isIdp)}} name="idpOrWebId" value="idp" defaultChecked="checked"/>
        <label className=".login-form-label">
          WebID
        </label>
        <input type="radio" onChange={() => {setIsIdp(!isIdp)}} name="idpOrWebId" value="webId" />
      </div>
      <input
        required
        name="idp"
        type="text"
        id="idp"
        placeholder="Identity Provider or WebID"
        defaultValue={config.defaultIDP}
      />
      <input type="submit" value="Login" className="login-form-button" />
    </form>
  );
}

export default SolidLoginForm;
