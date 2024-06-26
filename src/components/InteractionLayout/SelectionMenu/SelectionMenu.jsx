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
  const [openGroups, setOpenGroups] = useState({});

  let queryGroups = config.queryGroups || [];
  queryGroups.forEach(group => group.queries = []);
  const looseQueries = setUpQueryGroups(queryGroups, resources);

  useEffect(() => {
    const handleGroupChange = (newConfig) => {
      setConfig(newConfig);
      
      // Open the cstm group when a new custom query is created
      if(newConfig.queryGroups.find(group => group.id === 'cstm')){
        setOpenGroups(prevOpenGroups => ({
          ...prevOpenGroups,
          ['cstm']: true,
        }));
      }
    };

    configManager.on('configChanged', handleGroupChange);

    return () => {
      configManager.off('configChanged', handleGroupChange);
    };
  }, []);

  const handleGroupToggle = (groupId) => {
    setOpenGroups(prevOpenGroups => ({
      ...prevOpenGroups,
      [groupId]: !prevOpenGroups[groupId],
    }));
  };

  return (
    <ThemeProvider theme={menuItemTheme}>
      <div style={{ height: '100%', overflowY: 'auto', backgroundColor: 'white' }}>
        <Menu>
          <List>
            <DashboardMenuItem />
            <Menu.Item to="/customQuery" primaryText="Custom Query Editor" leftIcon={<IconProvider.DashboardCustomizeIcon/>}/>
            {looseQueries.map(id => (
              <Tooltip
                key={id}
                placement="right"
                title={<TooltipContent title={resources[id].options.label} description={resources[id].options.descr} />}
              >
                <div>
                  <Menu.ResourceItem name={id} />
                </div>
              </Tooltip>
            ))}
          </List>
          {queryGroups.map((group) => (
            <List key={group.id} disablePadding>
              <ListItemButton onClick={() => handleGroupToggle(group.id)}>
                <ListItemIcon>
                  {getIconComponent(group.icon)}
                </ListItemIcon>
                <ListItemText primary={group.name} />
                {openGroups[group.id] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={openGroups[group.id]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {group.queries.map((id) => (
                    <Tooltip
                      key={id}
                      placement="right"
                      title={<TooltipContent title={resources[id].options.label} description={resources[id].options.descr} />}
                    >
                      <ListItemText sx={{ overflow: 'hidden', ml: 1.5 }}>
                        <Menu.ResourceItem name={id} />
                      </ListItemText>
                    </Tooltip>
                  ))}
                </List>
              </Collapse>
            </List>
          ))}
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
          },
        },
      },
    },
  },
});

const getIconComponent = (iconKey) => {
  const IconComponent = IconProvider[iconKey];
  return IconComponent ? <IconComponent /> : <ListAltIcon />;
};

const TooltipContent = ({ title, description }) => (
  <Box sx={{ width: 'fit-content', backgroundColor: '#6d6d6d', paddingX: 1, marginX: -1 }}>
    <Typography variant="h6" component="div">{title}</Typography>
    <Typography variant="body2" component="div" sx={{ fontStyle: 'italic', marginTop: 1 }}>{description}</Typography>
  </Box>
);

const setUpQueryGroups = (queryGroups, resources) => {
  const looseQueries = [];
  Object.keys(resources).forEach((id) => {
    try {
      if (resources[id].options.queryGroupId === undefined) {
        looseQueries.push(id);
      } else {
        const queryGroup = queryGroups.find(group => group.id === resources[id].options.queryGroupId);
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
  return looseQueries;
};

export default SelectionMenu;
