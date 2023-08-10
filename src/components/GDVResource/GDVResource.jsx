import {
  ResourceContextProvider,
  ListContextProvider,
  useListController,
  Loading,
  ListBase,
} from "react-admin";
import PropTypes from "prop-types";
import GDVListViewer from "./GDVListViewer/GDVListViewer";


/** 
 * @returns {React.Component} custom List as defined by react-admin 
 */
function GDVResource(props) {
  const {
    debounce,
    disableAuthentication,
    disableSyncWithLocation,
    exporter,
    filter,
    filterDefaultValues,
    perPage,
    resource,
    sort,
    ...rest
  } = props;
  const { isLoading } = useListController();
  return (
    <ListBase
      debounce={debounce}
      disableAuthentication={disableAuthentication}
      disableSyncWithLocation={disableSyncWithLocation}
      exporter={exporter}
      filter={filter}
      filterDefaultValues={filterDefaultValues}
      perPage={perPage}
      queryOptions={{ keepPreviousData: false }}
      resource={resource}
      sort={sort}
    >
      {isLoading && <Loading />}
      {!isLoading && <GDVListViewer {...rest} />}
    </ListBase>
  );
}

GDVResource.propTypes = {
  debounce: PropTypes.number,
  disableAuthentication: PropTypes.bool,
  disableSyncWithLocation: PropTypes.bool,
  exporter: PropTypes.func,
  filter: PropTypes.object,
  filterDefaultValues: PropTypes.object,
  perPage: PropTypes.number,
  queryOptions: PropTypes.object,
  resource: PropTypes.string,
  sort: PropTypes.object,
};


export default GDVResource;
