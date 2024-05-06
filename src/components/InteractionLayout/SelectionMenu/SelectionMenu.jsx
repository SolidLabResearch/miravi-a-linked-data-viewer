import React, { Component, useState } from 'react';
import { useResourceDefinitions } from "ra-core";
import { DashboardMenuItem } from "ra-ui-materialui";
import { Menu } from "react-admin";
import { ThemeProvider, createTheme, Tooltip, Box, Typography } from "@mui/material";
import config from "../../../config.json";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import IconProvider from "../../../IconProvider/IconProvider";

import ViewListIcon from '@mui/icons-material/ViewList';


/**
 * A custom menu as defined in React Admin for selecting the query the user whishes to execute.
 * @returns {Component} the selection menu component
 */
function SelectionMenu() {
  const resources = useResourceDefinitions();
  const queryGroups = config.queryGroups;


  

  // adding a list to the group that will contain all the queries for said group
  queryGroups.forEach(group => group.queries = [])

  // fill in the groups, and put the ones without a group inside the looseQueries list
  const looseQueries = setUpQueryGroups(queryGroups, resources);

  return (
    <ThemeProvider theme={menuItemTheme}>
      <div style={{ height: '100%', overflowY: 'auto', backgroundColor: 'white' }}>
        <Menu>
          <List>
          <DashboardMenuItem />

            {looseQueries.map(id => (
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
          </List>
          {queryGroups.map((group) => {
            const [open, setOpen] = useState(false)
            return (
              <List key={group.id} disablePadding >
                <ListItemButton onClick={() => { setOpen(!open) }}>
                  <ListItemIcon>
                    {getIconComponent(group.icon)}
                  </ListItemIcon>
                  <ListItemText primary={group.name} />
                  {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {group.queries.map((id) => (
                      <Tooltip
                        key={id}
                        placement="right"
                        title={
                          <TooltipContent
                            title={resources[id].options.label}
                            description={resources[id].options.descr} />
                        }
                      >
                        <ListItemText sx={{ overflow: 'hidden', ml:3}} >
                          <Menu.ResourceItem name={id} />
                        </ListItemText>
                      </Tooltip>
                    ))}
                  </List>
                </Collapse>
              </List>
            )

          })}
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

const getIconComponent = (iconKey) => {
  const IconComponent = IconProvider[iconKey];
  if (IconComponent) {
    return <IconComponent />;
  }
  return <ViewListIcon />;
};

const TooltipContent = ({ title, description }) => (
  <React.Fragment>
    <Box
      sx={{
        width: 'fit-content',
        backgroundColor: '#6d6d6d',
        paddingX: 1,
        marginX: -1,
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

const setUpQueryGroups = (queryGroups, resources) => {
  const looseQueries = [];
  Object.keys(resources).forEach((id) => {
    try {
      if (resources[id].options.queryGroupId === undefined) {
        looseQueries.push(id) 
      } else {
        queryGroups.find(group => group.id === resources[id].options.queryGroupId).queries.push(id)
      }
    } catch (error) {
      throw new Error(`Error adding queries to a group: ${error.message}`);
    }
  })
  return looseQueries;
}


export default SelectionMenu;
