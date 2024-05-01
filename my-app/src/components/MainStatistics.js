import React from "react";
import { useState, useEffect } from "react";

import axios from "axios";
import StatisticsActivity from "./StatisticsActivity";
import StatisticsProductivity from "./StatisticsProductivity";
import StatisticsMessages from "./StatisticsMessages";
import NavBar from "./NavBar";
import "../components-style/Statistics.css";

function MainStatistics() {
  const [activityStat, setActivityStat] = useState(false);
  const [productivityStat, setProductivityStat] = useState(false);
  const [messageStat, setMessageStat] = useState(false);

  return (
    <div>
      <NavBar />
      <div
        className="statistics-main-container"
        style={{
          marginTop: "12vh",
        }}
      >
        {activityStat ? (
          <StatisticsActivity onClose={setActivityStat} />
        ) : productivityStat ? (
          <StatisticsProductivity onClose={setProductivityStat} />
        ) : messageStat ? (
          <StatisticsMessages onClose={setMessageStat} />
        ) :
        (
          <div className="statistics-main">
            <h1>General Statistics</h1>
            <button
              onClick={() => setActivityStat(true)}
              style={{
                margin: "10px",
                width: "12vw",
              }}
            >
              Activity Statistics
            </button>
            <button
              onClick={() => setProductivityStat(true)}
              style={{
                margin: "10px",
                width: "12vw",
              }}
            >
              Productivity Statistics
            </button>
            <button
              onClick={() => setMessageStat(true)}
              style={{
                margin: "10px",
                width: "12vw",
              }}
            >
              Message Statistics
            </button>
            
          </div>
        )}
      </div>
    </div>
  );
}

export default MainStatistics;
