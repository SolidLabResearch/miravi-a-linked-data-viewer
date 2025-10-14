import { Link, TableCell, TableHead, TableRow, Tooltip } from "@mui/material";
import React from "react";
import { useListContext } from "react-admin";
import "./TableHeader.css";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import LinkIcon from "@mui/icons-material/Link";
import PropTypes from "prop-types";
import { Component } from "react";

import configManager from "../../../../configManager/configManager";

/**
 * 
 * @param {object} props - the props passed down to the component
 * @param {Array<Component>} props.children - the children of the component 
 * @returns {Component} the header of the table containing the column names, the sort icons and ontology links
 */
function TableHeader({ children }) {
  const { sort, setSort, resource } = useListContext();
  
  /**
   * Handles the click on a header and sets the sort state accordingly
   * @param {string} target - the source of the column that was clicked 
   */
  function handleHeaderClick(target) {
    const newSort = { field: target, order: "ASC" };
    if (sort && sort.field == target) {
      if (sort.order === "ASC") {
        newSort.order = "DESC";
      } else {
        newSort.order = "ASC";
      }
    }
    setSort(newSort);
  }

  const query = configManager.getQueryWorkingCopyById(resource);
  const variableOntology = query.variableOntology;
  const sortingAllowed = query?.queryText?.startsWith("# Custom sorting is allowed.");
  
  return (
    <TableHead>
      <TableRow>
        {React.Children.map(children, (child) => (
          <>
            <TableCell
              key={child.props.source}
              sx={{ height: "100%", fontWeight: "bold", "& > *": { verticalAlign: "middle" } }}
            >
              {sortingAllowed ? <span
                role="button"
                className="header-button"
                onClick={() => handleHeaderClick(child.props.source)}
              >
                {child.props.label}
              </span> : <Tooltip title="Custom sorting is disabled for queries containing an ORDER clause.">
                <span>
                  {child.props.label}
                </span>
              </Tooltip>}
              {!!variableOntology && variableOntology[child.props.source] && (
                variableOntology[child.props.source].map((link) => (
                  <Link
                    target="_blank"
                    href={link}
                    key={link}
                    sx={{ height: "100%", margin: "0 0 0 5px", "& > *": { verticalAlign: "middle" } }}
                  >
                    <LinkIcon
                      fontSize="small"
                      sx={{ height: "100%", color: "gray" }}
                    />
                  </Link>
                ))
              )}
              {sort.field === child.props.source && (
                <>
                  {sort && sort.order === "DESC" && (
                    <NorthIcon
                      fontSize="small"
                      sx={{ height: "100%", color: "gray" }}
                    />
                  )}
                  {sort && sort.order === "ASC" && (
                    <SouthIcon
                      fontSize="small"
                      sx={{ height: "100%", color: "gray" }}
                    />
                  )}
                </>
              )}
            </TableCell>
          </>
        ))}
      </TableRow>
    </TableHead>
  );
}

TableHeader.propTypes = {
  children: PropTypes.node
}
export default TableHeader;
