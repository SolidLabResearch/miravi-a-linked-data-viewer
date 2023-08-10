import { forwardRef } from "react";
import { useLogout, useRedirect } from "react-admin";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { MenuItem } from "@mui/material";
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";

const LogoutButton = forwardRef((props, ref) => {
  const logout = useLogout();
  const isLoggedIn = getDefaultSession().info.isLoggedIn;
  const redirect = useRedirect();
  function handleLogout(event) {
    event.preventDefault();
    if (isLoggedIn) {
      logout();
    }
    else{
        redirect("/login")
    }
  }
  return (
    <MenuItem ref={ref} onClick={handleLogout} {...props}>
      {isLoggedIn && (
        <>
          <LogoutIcon />
          Logout
        </>
      )}
      {!isLoggedIn && (
        <>
          <LoginIcon />
          Login
        </>
      )}
    </MenuItem>
  );
});

LogoutButton.displayName = "LogoutButton";

export default LogoutButton;
