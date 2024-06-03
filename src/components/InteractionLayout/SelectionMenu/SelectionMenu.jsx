import React, { useState, useEffect } from 'react';
import { useResourceDefinitions } from "ra-core";
import { DashboardMenuItem } from "ra-ui-materialui";
import { Menu } from "react-admin";
import { ThemeProvider, createTheme, Tooltip, Box, Typography } from "@mui/material";
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ListAltIcon from '@mui/icons-material/ListAlt';
import IconProvider from "../../../IconProvider/IconProvider";
import configManager from '../../../configManager/configManager';

const SelectionMenu = () => {
  const resources = useResourceDefinitions();
  const [config, setConfig] = useState(configManager.getConfig());
  const [nrOfQueries, setNrOfQueries] = useState(config.queries.length);
  const [displayMenu, setDisplayMenu] = useState({
    queryGroups: config.queryGroups || [],
    looseQueries: []
  });
  useEffect(() => {
    const handleConfigChange = (newConfig) => {
      setConfig(newConfig);

      if(newConfig.queries.length > nrOfQueries){
        addCustomQuery(config.queries.at(-1))
        setNrOfQueries(newConfig.queries.length);
      }
    };

    // Listen for config changes
    configManager.on('configChanged', handleConfigChange);

    // Clean up the event listener on component unmount
    return () => {
      configManager.off('configChanged', handleConfigChange);
    };
  }, []);

  useEffect(() => {
    setUpQueryGroups(displayMenu, setDisplayMenu, resources);
  }, [resources]);

  const setUpQueryGroups = (displayMenu, setDisplayMenu, resources) => {
    const looseQueries = [];
    const updatedQueryGroups = displayMenu.queryGroups.map(group => ({
      ...group,
      queries: []
    }));

    Object.keys(resources).forEach((id) => {
      try {
        const queryGroupId = resources[id].options.queryGroupId;
        if (queryGroupId === undefined) {
          looseQueries.push(id);
        } else {
          const queryGroup = updatedQueryGroups.find(group => group.id === queryGroupId);
          if (queryGroup) {
            queryGroup.queries.push(id);
          } else {
            looseQueries.push(id);
          }
        }
      } catch (error) {
        throw new Error(`Error adding queries to a group: ${error.message}`);
      }
    });

    setDisplayMenu(prevState => ({
      ...prevState,
      queryGroups: updatedQueryGroups,
      looseQueries
    }));
  };

  const addCustomQuery = (newQuery) => {
    setDisplayMenu(prevState => {
      return({
      ...prevState,
      looseQueries: [...prevState.looseQueries, newQuery]
    })});
  };

  return (
    <ThemeProvider theme={menuItemTheme}>
      <div style={{ height: '100%', overflowY: 'auto', backgroundColor: 'white' }}>
        <Menu>
          {nrOfQueries}
          <List>
            <DashboardMenuItem />
            {displayMenu.looseQueries.map(id => (
              <Tooltip
                key={id}
                placement="right"
                title={
                  <TooltipContent
                    title={resources[id] ? resources[id].options.label : 'tabonbonbon'}
                    description={resources[id] ? resources[id].options.descr : ' no desc'} />
                }
              >
                <div>
                  <Menu.ResourceItem name={id} />
                </div>
              </Tooltip>
            ))}
          </List>
          {displayMenu.queryGroups.map((group) => {
            const [open, setOpen] = useState(false);
            return (
              <List key={group.id} disablePadding>
                <ListItemButton onClick={() => setOpen(!open)}>
                  <ListItemIcon>
                    {getIconComponent(group.icon)}
                  </ListItemIcon>
                  <ListItemText primary={group.name} />
                  {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {group.queries && group.queries.map((id) => (
                      <Tooltip
                        key={id}
                        placement="right"
                        title={
                          <TooltipContent
                            title={resources[id].options.label}
                            description={resources[id].options.descr} />
                        }
                      >
                        <ListItemText sx={{ overflow: 'hidden', ml: 1.5 }}>
                          <Menu.ResourceItem name={id} />
                        </ListItemText>
                      </Tooltip>
                    ))}
                  </List>
                </Collapse>
              </List>
            );
          })}
        </Menu>
      </div>
    </ThemeProvider>
  );
};

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
  return <ListAltIcon />;
};

const TooltipContent = ({ title, description }) => (
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
);

export default SelectionMenu;
