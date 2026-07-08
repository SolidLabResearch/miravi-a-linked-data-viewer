import { Component, useEffect, useState } from "react";
import { ExportButton, TopToolbar, useListContext, useNotify } from "react-admin";
import Time from "./Time";
import "./ActionBar.css";
import {
  Button,
  Checkbox,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import SourceAuthenticationIcon from "./SourceAuthenticationIcon/SourceAuthenticationIcon";
import SourceFetchStatusIcon from "./SourceFetchStatusIcon/SourceFetchStatusIcon";
import SourceVerificationIcon from "./SourceVerificationIcon/SourceVerificationIcon.jsx";
import { getDefaultAuth } from "trustflows-client";
import comunicaEngineWrapper from "../../comunicaEngineWrapper/comunicaEngineWrapper";

import configManager from "../../configManager/configManager.js";

/**
 *
 * @returns {Component} custom action bar as defined by react-admin
 */
function ActionBar() {
  const { total, isLoading, resource } = useListContext();
  const notify = useNotify();
  const auth = getDefaultAuth();
  const now = Date.now();
  const [timeStart, setTimeStart] = useState(now);
  const [timeNow, setTimeNow] = useState(now);
  const [sourceInfoOpen, setSourceInfoOpen] = useState(false);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [selectedSources, setSelectedSources] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const now = Date.now();
      setTimeStart(now);
      setTimeNow(now);
    }
  }, [isLoading]);

  useEffect(() => {
    let intervalId;
    if (isLoading) {
      intervalId = setInterval(() => setTimeNow(Date.now()), 100);
    }
    return () => clearInterval(intervalId);
  }, [timeNow, isLoading]);

  useEffect(() => {
    let cancelled = false;

    void auth.isLoggedIn().then((status) => {
      if (!cancelled) {
        setIsLoggedIn(status);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [auth, sourceInfoOpen]);

  const config = configManager.getConfig();
  const query = configManager.getQueryWorkingCopyById(resource);
  const context = query.comunicaContext;
  const sources = context?.sources || []; // in early calls, context might be undefined

  const getSourceFetchState = (source) => {
    const fetchSuccess = comunicaEngineWrapper.getFetchSuccess(source);
    if (fetchSuccess === undefined) {
      return "pending";
    }
    if (fetchSuccess === true) {
      return "success";
    }
    return "failed";
  };

  const isSourceRequestable = (source) => getSourceFetchState(source) === "failed";

  useEffect(() => {
    const initialSelection = {};
    sources.forEach((source) => {
      initialSelection[source] = isSourceRequestable(source);
    });
    setSelectedSources(initialSelection);
  }, [resource, sources.join("|"), isLoading]);

  const toggleSelectedSource = (source) => {
    setSelectedSources((prev) => ({
      ...prev,
      [source]: !prev[source],
    }));
  };

  const selectedSourceList = sources.filter((source) => selectedSources[source]);
  const requestableSelectedSources = selectedSourceList.filter((source) => isSourceRequestable(source));

  const requestAccess = async () => {
    if (!requestableSelectedSources.length) {
      return;
    }

    if (!isLoggedIn) {
      notify("You need to be logged in to request access.", { type: "warning" });
      return;
    }

    setRequestingAccess(true);
    try {
      const authFetch = auth.createAuthFetch();
      // Await request dispatch, but do not enforce response status; approval is asynchronous in Loama.
      await Promise.allSettled(
        requestableSelectedSources.map(async (source) => {
          const response = await authFetch(source, undefined, { accessRequest: true });
          console.log(`Access request sent for ${source}. Response status: ${response.status}`);
        })
      );

      notify(`Access request sent for ${requestableSelectedSources.length} source(s). Approval may take some time.`, { type: "info" });
    } catch (error) {
      notify(`Could not send an access request: ${error.message}`, { type: "warning" });
    } finally {
      setRequestingAccess(false);
    }
  };

  return (
    <Grid container direction="row" width={"100%"} rowSpacing={1}>
      <Grid item height={"fit-content"} width={"100%"}>
        <TopToolbar style={{ width: "100%", height: "fit-content" }}>
          <div style={{ flex: "1" }}></div>
          <div className="query-information">
            <div className="information-box">
              {isLoading && <strong>Runtime: </strong>}
              {!isLoading && <strong>Finished in: </strong>}
              <Time elapsedMilliseconds={timeNow - timeStart} showMilliseconds={config.showMilliseconds} />
            </div>
            <div className="information-box">
              <strong>Sources: </strong>
              <span>{sources.length}</span>
              <Tooltip title="Sources info">
                <IconButton
                  size="small"
                  sx={{ padding: "0px", marginLeft: "5px" }}
                  onClick={() => setSourceInfoOpen(!sourceInfoOpen)}
                >
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          </div>
          <div className="action-box">
            <ExportButton disabled={total === 0 || isLoading} />
          </div>
        </TopToolbar>
      </Grid>
      {sourceInfoOpen && (
        <Grid item width={"100%"}>
          <TableContainer
            sx={{ width: "100%", marginBottom: "10px", maxHeight: "200px" }}
            component={Paper}
          >
            <Table size="small" >
              <TableHead>
                <TableRow>
                  <TableCell>Source</TableCell>
                  <TableCell>Authentication needed</TableCell>
                  <TableCell>Fetch status</TableCell>
                  <TableCell>Verified</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap", width: "1%" }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={requestAccess}
                      disabled={!isLoggedIn || requestingAccess || requestableSelectedSources.length === 0}
                      title={!isLoggedIn ? "Log in to request access" : ""}
                    >
                      {requestingAccess ? "Requesting access..." : "Request access"}
                    </Button>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sources.map((source, index) => (
                  <TableRow key={index}>
                    <TableCell>{source}</TableCell>
                    <TableCell>
                      <SourceAuthenticationIcon source={source} />
                    </TableCell>
                    <TableCell>
                      <SourceFetchStatusIcon source={source} />
                    </TableCell>
                    <TableCell>
                      <SourceVerificationIcon httpProxies={query.httpProxies} source={source} />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap", width: "1%" }}>
                      <Checkbox
                        checked={!!selectedSources[source] && isSourceRequestable(source)}
                        onChange={() => toggleSelectedSource(source)}
                        disabled={!isSourceRequestable(source)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
    </Grid>
  );
}

export default ActionBar;
