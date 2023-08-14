import "./LoginPage.css";
import config from "../../config";
import { useLogin, useNotify } from "react-admin";
import { Component } from "react";

/**
 * @returns {Component} a login form for logging into your solid pod. 
 */
function SolidLoginForm() {
  const login = useLogin();
  const notify = useNotify();

  /**
   * Handling what should happen when the user is trying to log in by pressing the log in button.
   * @param {Event} event the event calling the EventListener
   */
  async function handleLogin(event) {
    event.preventDefault();
    try {
      login({ idpOrWebId: event.target[0].value });
    } catch (error) {
      notify(error.message);
    }
  }

  return (
    <form onSubmit={handleLogin} className="login-form">
      <label id="idp-label" htmlFor="idp">
        Identity Provider/WebID:
      </label>
      <input
        required
        name="idp"
        type="text"
        id="idp"
        placeholder="Identity Provider or WebID"
        defaultValue={config.defaultIDP}
      />
      <input type="submit" value="Login" className="form-button" />
    </form>
  );
}

export default SolidLoginForm;
