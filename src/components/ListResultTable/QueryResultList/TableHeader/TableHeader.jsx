import { Link, TableCell, TableHead, TableRow } from "@mui/material";
import React from "react";
import { useListContext } from "react-admin";
import "./TableHeader.css";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import LinkIcon from "@mui/icons-material/Link";

function TableHeader({ children, config }) {
  const { sort, setSort, resource } = useListContext();
  const { variableOntology } = config.queries.filter(
    (query) => query.id === resource
  )[0];
  function handleHeaderClick(target) {
    const newSort = { field: target, order: "DESC" };
    if (sort) {
      if (sort.order === "ASC") {
        newSort.order = "DESC";
      } else {
        newSort.order = "ASC";
      }
    }
    setSort(newSort);
  }

  return (
    <TableHead>
      <TableRow>
        <TableCell> </TableCell>
        {React.Children.map(children, (child) => (
          <>
            <TableCell
              key={child.props.source}
              sx={{ height: "100%", "& > *": { verticalAlign: "middle" } }}
            >
              <span
                variant="span"
                role="button"
                className="header-button"
                onClick={() => handleHeaderClick(child.props.source)}
              >
                {child.props.label}
              </span>
              {variableOntology[child.props.source] && (
                <Link
                  target="_blank"
                  href={variableOntology[child.props.source]}
                  sx={{ height: "100%", margin: "0 5px", "& > *": { verticalAlign: "middle" } }}
                >
                  <LinkIcon
                    fontSize="small"
                    sx={{ height: "100%", color: "gray" }}
                  />
                </Link>
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

export default TableHeader;
