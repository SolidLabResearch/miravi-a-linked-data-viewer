import React, { Component } from 'react';
import { useResourceDefinitions } from "ra-core";
import { DashboardMenuItem } from "ra-ui-materialui";
import { Menu } from "react-admin";
import { ThemeProvider, createTheme, Tooltip, Box, Typography } from "@mui/material";

/**
 * A custom menu as defined in React Admin for selecting the query the user whishes to execute.
 * @returns {Component} the selection menu component
 */
function SelectionMenu() {
  const resources = useResourceDefinitions();
  return (
    <ThemeProvider theme={menuItemTheme}>
      <div style={{ height: '100%', overflowY: 'auto', backgroundColor: 'white' }}>
        <Menu>
          <DashboardMenuItem />
          {Object.keys(resources).map((id) => (
            <Tooltip
              key={id}
              placement="right"
              title={
                <TooltipContent
                  title={resources[id].options.label}
                  description={resources[id].options.descr} />
              }
            >
              <div >
                <Menu.ResourceItem name={id} />
              </div>
            </Tooltip>
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
            display: "block",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }
        },
      },
    }
  },
});


const TooltipContent = ({ title, description }) => (
  <React.Fragment>
    <Box
      sx={{
        width: 'fit-content',
        backgroundColor: '#6d6d6d',
        paddingLeft: 1,
        marginLeft: -1
      }}
    >
      <Typography variant="h6" component="div">
        {title}
      </Typography>

      <Typography variant="body2" component="div"
        sx={{
          fontStyle: 'italic',
          marginTop: 1,
        }}
      >
        {description}
      </Typography>
    </Box>
  </React.Fragment>
)


export default SelectionMenu;
