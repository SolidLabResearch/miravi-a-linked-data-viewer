import { UserMenu, useGetIdentity } from "react-admin";
import LogoutButton from "./LogoutButton";
import { useEffect } from "react";
//import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import { getDefaultAuth } from "trustflows-client";
import { Component } from "react";

/**
 * 
 * @returns {Component} a custom UserMenu as defined by react-admin, containing the custom LogoutButton
 */
function AuthenticationMenu() {
  const { refetch } = useGetIdentity();
  const auth = getDefaultAuth();

  useEffect(() => {
    let cancelled = false;

    void auth.isLoggedIn().then((status) => {
      if (!cancelled && status) {
        void refetch?.();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [auth, refetch]);

  return (
    <UserMenu>
      <LogoutButton />
    </UserMenu>
  );
}

export default AuthenticationMenu;
