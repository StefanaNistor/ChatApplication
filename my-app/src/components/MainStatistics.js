import React from "react";
import { useState, useEffect } from "react";

import axios from "axios";
import StatisticsActivity from "./StatisticsActivity";
import StatisticsProductivity from "./StatisticsProductivity";
import StatisticsMessages from "./StatisticsMessages";
import StatisticsUsers from "./StatisticsUsers";
import NavBar from "./NavBar";
import "../components-style/Statistics.css";

function MainStatistics() {
  const [activityStat, setActivityStat] = useState(false);
  const [productivityStat, setProductivityStat] = useState(false);
  const [messageStat, setMessageStat] = useState(false);
  const [userStat, setUserStat] = useState(false);

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
        ) : userStat ? (
          <StatisticsUsers onClose={setUserStat} />
        ) : (
          <div className="statistics-main"style={{
            overflowY: "scroll",
            height: "90vh",
            

          }}>
            
            <h1>General Statistics</h1>
            <div
              className="statistics-buttons"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                width: "54%",
                margin: "auto",
              }}
            >
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

              <button
                onClick={() => setUserStat(true)}
                style={{
                  margin: "10px",
                  width: "12vw",
                }}
              >
                User Statistics
              </button>
            </div>

            <h2 id="info-header"> Information About the Statistics Categories </h2>

            <div className="statistics-main-text" id="statistics-main-txt"
            style={{
              width: "90%",
            maxWidth: "90%",
            margin: "auto",
            }}
            >
             
              <div className="activity-stat-description">
                <h3>Activity Statistics</h3>
                <p>
                  This section provides information about the general activity
                  of the users in the chat application. It includes the peak
                  chat activity by hour and the chat activity by department and
                  things regarding.
                </p>
              </div>

              <div className="productivity-stat-description">
                <h3>Productivity Statistics</h3>
                <p>
                  This section provides information about the productivity of
                  the users in the chat application.
                </p>
              </div>

              <div className="message-stat-description">
                <h3>Message Statistics</h3>
                <p>
                  This section provides information about the messages sent by
                  the users in the chat application.
                </p>
              </div>

              <div className="user-stat-description">
                <h3>User Statistics</h3>
                <p>
                  This section provides information about the users in the chat
                  application.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainStatistics;
