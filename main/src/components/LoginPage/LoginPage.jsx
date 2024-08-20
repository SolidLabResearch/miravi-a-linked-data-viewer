import "./LoginPage.css";
import { useLogin, useNotify } from "react-admin";
import { Component, useState } from "react";

import configManager from "../../configManager/configManager";

/**
 * @returns {Component} a login form for logging into your Identity Provider.
 */
function SolidLoginForm() {
  const login = useLogin();
  const notify = useNotify();

  /**
   * Handling what should happen when the user is trying to log in by pressing the log in button.
   * @param {Event} event - the event calling the EventListener
   */
  async function handleLogin(event) {
    event.preventDefault();
    try {
      await login({ value: event.target[0].value });
    } catch (error) {
      notify(error.message);
    }
  }

  const config = configManager.getConfig();

  return (
    <form onSubmit={handleLogin} className="login-form">
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
