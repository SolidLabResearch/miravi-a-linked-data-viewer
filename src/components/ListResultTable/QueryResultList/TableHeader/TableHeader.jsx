import { Button, TableCell, TableHead, TableRow } from "@mui/material";
import React from "react";
import { useListSortContext } from "react-admin";

function TableHeader({ children, sort }) {
  const { currentSort, setSort } = useListSortContext();
  console.log(currentSort)
  function handleHeaderClick(target){
    const newSort = {field: target, order: "DESC"};
    if(currentSort){
      if(currentSort.order === "ASC"){
        newSort.order = "DESC";
      }
      else{
        newSort.order = "ASC";
      }
    }
    setSort(newSort);
  }

  return (
    <TableHead>
      <TableRow>
        <TableCell></TableCell>{" "}
        {React.Children.map(children, (child) => (
          <>
            <TableCell key={child.props.source}>
                <Button variant="span" onClick={() => handleHeaderClick(child.props.source)}>{child.props.label}</Button>
            </TableCell>
          </>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default TableHeader;
