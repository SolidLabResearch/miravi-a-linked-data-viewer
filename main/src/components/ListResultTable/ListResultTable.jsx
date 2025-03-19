import {ListBase, } from "react-admin";
import PropTypes from "prop-types";
import {Component} from "react";
import QueryResultList from "./QueryResultList/QueryResultList";

import configManager from "../../configManager/configManager";


// LOG let listResultTableCounter = 0;

/**
 * @param {object} props - the props passed down to the component
 * @returns {Component} custom List as defined by react-admin which either shows a loading indicator or the query results
 */
function ListResultTable(props) {
  // LOG console.log(`--- ListResultTable #${++listResultTableCounter}`);
  // LOG console.log(`props: ${JSON.stringify(props, null, 2)}`);

  const {
    debounce,
    disableSyncWithLocation,
    exporter,
    filter,
    filterDefaultValues,
    perPage,
    resource,
    sort,
    variables,
    ...rest
  } = props;

  // TODO delete next unless we're going to use it
  const query = configManager.getQueryWorkingCopyById(resource);

  return (
    <ListBase
      debounce={debounce}
      disableAuthentication={true} // A query can go over multiple sources, some of which he doesn't need authentication. Thus we don't know which need authentication and which do not. We still have authentication with this being true.
      disableSyncWithLocation={disableSyncWithLocation}
      exporter={exporter}
      filter={filter}
      filterDefaultValues={filterDefaultValues}
      perPage={perPage}
      queryOptions={{
        keepPreviousData: false,
        meta: {
          variables: variables
        }}}
      resource={resource}
      sort={sort}
    >
      <QueryResultList resource={resource} variables={variables} { ...rest } />
    </ListBase>
  );
}

ListResultTable.propTypes = {
  debounce: PropTypes.number,
  disableAuthentication: PropTypes.bool,
  disableSyncWithLocation: PropTypes.bool,
  exporter: PropTypes.func,
  filter: PropTypes.object,
  filterDefaultValues: PropTypes.object,
  perPage: PropTypes.number,
  resource: PropTypes.string.isRequired,
  sort: PropTypes.object,
  variables: PropTypes.object.isRequired
};

export default ListResultTable;
