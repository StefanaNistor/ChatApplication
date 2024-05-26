import React, { useState } from "react";
import StatisticsActivity from "./StatisticsActivity";
import StatisticsProductivity from "./StatisticsProductivity";
import StatisticsMessages from "./StatisticsMessages";
import StatisticsUsers from "./StatisticsUsers";
import NavBar from "./NavBar";
import "../components-style/Statistics.css";

function MainStatistics() {
  const [activeStat, setActiveStat] = useState("");

  const handleOpenStat = (statType) => {
    setActiveStat(statType);
  };

  const handleCloseStat = () => {
    setActiveStat("");
  };

  return (
    <div>
      <NavBar />
      <div className="statistics-main-container" style={{ marginTop: "12vh" }}>
        {activeStat === "activity" && (
          <StatisticsActivity onClose={handleCloseStat} />
        )}
        {activeStat === "productivity" && (
          <StatisticsProductivity onClose={handleCloseStat} />
        )}
        {activeStat === "messages" && (
          <StatisticsMessages onClose={handleCloseStat} />
        )}
        {activeStat === "users" && (
          <StatisticsUsers onClose={handleCloseStat} />
        )}
        {!activeStat && (
          <div
            className="statistics-main"
            style={{ overflowY: "scroll", height: "90vh" }}
          >
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
                onClick={() => handleOpenStat("activity")}
                style={{
                  margin: "10px",
                  width: "12vw",
                }}
              >
                Activity Statistics
              </button>
              <button
                onClick={() => handleOpenStat("productivity")}
                style={{
                  margin: "10px",
                  width: "12vw",
                }}
              >
                Productivity Statistics
              </button>
              <button
                onClick={() => handleOpenStat("messages")}
                style={{
                  margin: "10px",
                  width: "12vw",
                }}
              >
                Message Statistics
              </button>
              <button
                onClick={() => handleOpenStat("users")}
                style={{
                  margin: "10px",
                  width: "12vw",
                }}
              >
                User Statistics
              </button>
            </div>

            <h2 id="info-header">Information About the Statistics Categories</h2>

            <div
              className="statistics-main-text"
              id="statistics-main-txt"
              style={{
                width: "90%",
                maxWidth: "90%",
                margin: "auto",
              }}
            >
              <div className="stat-description">
                <h3>Activity Statistics</h3>
                <p>
                  This section offers a comprehensive overview of user activity
                  within the chat application. It highlights peak chat times for
                  both group and private conversations, providing insights into
                  the most active hours of the day. Additionally, it details the
                  message volume across different departments and identifies the
                  top users based on their message count.
                </p>
                <button onClick={() => handleOpenStat("activity")}>
                  Explore Activity Statistics
                </button>
              </div>

              <div className="stat-description">
                <h3>Productivity Statistics</h3>
                <p>
                  This section offers insights into user productivity within the
                  chat application. It displays the number of tasks assigned to
                  each user, along with the count of completed tasks for each
                  individual. Additionally, it provides an overview of the
                  distribution of flags for the tasks assigned to each user.
                </p>
                <button onClick={() => handleOpenStat("productivity")}>
                  Explore Productivity Statistics
                </button>
              </div>

              <div className="stat-description">
                <h3>Message Statistics</h3>
                <p>
                  The message statistics illustrate the distribution of
                  different message types, including text-only messages,
                  messages containing images, and those with attached files.
                  Additionally, this section examines the average length of sent
                  messages across various departments.
                </p>
                <button onClick={() => handleOpenStat("messages")}>
                  Explore Message Statistics
                </button>
              </div>

              <div className="stat-description">
                <h3>User Statistics</h3>
                <p>
                  The user statistics reveal the peak chat activity for each
                  user, identifying the times of day when they are most active.
                  Additionally, this section includes a user sentiment analysis,
                  which indicates the overall tone of the messages sent by
                  users, providing insights into their general attitude towards
                  colleagues.
                </p>
                <button onClick={() => handleOpenStat("users")}>
                  Explore User Statistics
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainStatistics;
