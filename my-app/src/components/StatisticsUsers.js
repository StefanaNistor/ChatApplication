import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineController,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement,
} from 'chart.js';

import NavBar from "./NavBar";
import UserActivityLineChart from "./statistics_users/UserActivityLineChart";


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    LineController,
    ArcElement,
    Title,
    Tooltip,
    Legend,
);

function StatisticsUsers({onClose }) {

    return (
        <div>
            <NavBar />
            <div className="statistics-activity-container"
            style={{
                marginTop:'8vh',
                overflowY: 'scroll',
                height: '90vh'
            }}>
            <h1>General User Statistics</h1>
            <button style={{
                margin: '10px',
                width: '12vw'
            }} onClick={() => onClose (false)}>Back</button>
            <div className="statistics-container">

          <div className = "line-chart-staistic">
            <h2>Peak Chat Activity for each user by hour </h2>
            <div className="container-for-charts">
                <UserActivityLineChart />
                <div className="label-statistic-text">
                    <p>
                        The line chart above shows the peak chat activity for each user by hour. The x-axis represents the hour and the y-axis represents the number of messages sent.
                        Used to determine the most active hours for each user, in order to optimize the time for communication.
                        Each line represents a user and every user will appear, regardless of the number of messages sent. 
                        Each point on the line represents the number of messages sent by the user at that hour, and each line is colored differently for easy identification.
                    </p>
                    </div>
                </div>
            </div>

       

            </div>

        </div>

        </div>
    );
}

export default StatisticsUsers;
