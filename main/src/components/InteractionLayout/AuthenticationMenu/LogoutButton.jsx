import { forwardRef, useState, useEffect } from "react";
import { useLogout, useRedirect } from "react-admin";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { MenuItem } from "@mui/material";
//import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import { getDefaultAuth } from "trustflows-client";
import { Ref } from "react";

/**
 * A component that renders a logout button in the UserMenu in case the user is logged in or a login button in case the user isn't logged in.
 * @param {object} props - The props passed into the component.
 * @param {Ref} ref - The ref passed into the component.
 */
const LogoutButton = forwardRef((props, ref) => {
  const logout = useLogout();
  const auth = getDefaultAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const redirect = useRedirect();

  useEffect(() => {
    auth.isLoggedIn().then((status) => {
      setIsLoggedIn(status);
    });
  }, [auth]);

  /**
   * An EventListener that handles what should happen when the user is trying to log out by pressing the log out button.
   * @param {MouseEvent} event - the event that triggered the EventListener
   */
  function handleLogout(event) {
    event.preventDefault();
    if (isLoggedIn) {
      redirect("/");
      logout();

    } else {
      redirect("/login");
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
