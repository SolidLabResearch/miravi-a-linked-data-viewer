import { UserMenu, useGetIdentity } from "react-admin";
import LogoutButton from "./LogoutButton";
import { useEffect } from "react";
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import { Component } from "react";

/**
 * 
 * @returns {Component} a custom UserMenu as defined by react-admin, containing the custom LogoutButton
 */
function AuthenticationMenu() {
  const {refetch} = useGetIdentity();
  const session = getDefaultSession()

  useEffect(() => {
    if(refetch){
      refetch()
    }
  }, [session.tokenRequestInProgress, refetch])
  return (
    <UserMenu>
      <LogoutButton />
    </UserMenu>
  );
}

export default AuthenticationMenu;
