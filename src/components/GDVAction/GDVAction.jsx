import { Component, useEffect, useState } from "react";
import { ExportButton, TopToolbar, useListContext } from "react-admin";
import Time from "./Time";
import config from "../../config";
import "./GDVAction.css";

/**
 * 
 * @returns {Component} custom action bar as defined by react-admin
 */
function GDVAction() {
  const { total, isLoading, perPage } = useListContext();
  const [time, setTime] = useState(0);

  useEffect(() => {
    if(isLoading){
      setTime(0)
    }
  }, [isLoading])

  useEffect(() => {
    let intervalId;
    if (isLoading) {
      intervalId = setInterval(() => setTime(time + 1), 10);
    }
    return () => clearInterval(intervalId);
  }, [time, isLoading]);

  const resultCount = total <= perPage ? total : perPage;

  return (
    <TopToolbar style={{ width: "100%" }}>
      <div style={{ flex: "1" }}></div>
      <div className="query-information">
        <div className="information-box">
          {isLoading && <strong>Loading: </strong>}
          {!isLoading && <strong>Loaded: </strong>}
          <span>{resultCount} results</span>
        </div>
        <div className="information-box">
          {isLoading && <strong>Runtime: </strong>}
          {!isLoading && <strong>Finished in: </strong>}
          <Time time={time} showMilliseconds={config.showMilliseconds} />
        </div>
      </div>
      <div className="action-box">
        <ExportButton
          disabled={total === 0 || isLoading}
        />
      </div>
    </TopToolbar>
  );
}

export default GDVAction;
