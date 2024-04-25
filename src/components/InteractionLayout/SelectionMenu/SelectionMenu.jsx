import { useResourceDefinitions } from "ra-core";
import { DashboardMenuItem } from "ra-ui-materialui";
import { Menu } from "react-admin";
import { ThemeProvider, createTheme } from "@mui/material";
import { Component } from "react";

/**
 * A custom menu as defined in React Admin for selecting the query the user whishes to execute.
 * @returns {Component} the selection menu component
 */
function SelectionMenu() {
  const resources = useResourceDefinitions();
  return (
    <ThemeProvider theme={menuItemTheme}>
       <div style={{ height: '100%', overflowY: 'auto'}}>
      <Menu>
        <DashboardMenuItem />
        {Object.keys(resources).map((id) => (
          <Menu.ResourceItem key={id} name={id} />
        ))}
      </Menu>
      </div>
    </ThemeProvider>
  );
}

const menuItemTheme = createTheme({
  components: {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          display: "inline-block",
          overflow: "hidden",
          textOverflow: "ellipsis",
          position: "relative",
          maxWidth: "240px",
          minWidth: "0",
          "& > *": {
            verticalAlign: "middle",
          },
          "&:hover": {
            display: "inline-flex",
            overflow: "visible",
            whiteSpace: "normal" ,
            minWidth: "fit-content",
          }
        },
      },
    }
  },
});

export default SelectionMenu;
