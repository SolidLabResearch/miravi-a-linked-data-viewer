import { UserMenu, useGetIdentity } from "react-admin";
import LogoutButton from "./LogoutButton";
import { useEffect } from "react";
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";

function GDVUserMenu() {
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

export default GDVUserMenu;
