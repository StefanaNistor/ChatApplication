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
import ToDoFlagPieChart from "./statistics_productivity/ToDoFlagPieChart";
import NavBar from "./NavBar";
import UserToDoBarChart from "./statistics_productivity/UserToDoBarChart";
import CompletedToDoHorizontalBarChart from "./statistics_productivity/CompletedToDoHorizontalBarChart";
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

function StatisticsProductivity({onClose }) {

    return (
        <div>
            <NavBar />
            <div className="statistics-activity-container"
            style={{
                marginTop:'8vh',
                overflowY: 'scroll',
                height: '90vh'
            }}>
            <h1>General Productivity Statistics</h1>
            <button style={{
                margin: '10px',
                width: '12vw'
            }} onClick={() => onClose (false)}>Back</button>
            <div className="statistics-container">


            <div className = "bar-chart-staistic">
                <h2>Engagement level for tasks by User</h2>
                <div className="container-for-charts">
                <UserToDoBarChart />
                <div className="label-statistic-text">
                <p>
                    The bar chart above shows the engagement level for tasks by user. The x-axis represents the users and the y-axis represents the number of tasks. 
                    Thus, the chart shows the number of tasks assigned to each user. Every user will appear, even if they have no tasks assigned to them.
                    Used to determine the workload of each user, and to ensure that tasks are evenly distributed among users.
                </p>
            </div>
                </div>
                
            </div>

            <div className = "bar-chart-staistic">
                
                <h2>Productivity Level by User</h2>
                <div className="container-for-charts">
                <CompletedToDoHorizontalBarChart />
                <div className="label-statistic-text">
                <p>
                    The bar chart above shows the productivity level by user. The x-axis represents the users and the y-axis represents the number of tasks. 
                    Thus, the chart shows the number of tasks completed by each user. Every user will appear, even if they have not completed any tasks.
                    Used to determine the productivity of each user, and to ensure that tasks are being completed in a timely manner.
                </p>
                </div>
                </div>
                
            </div>
            
            <div className="pie-chart-staistic">    
                <h2>Distribution of flags for user tasks</h2>
                < div className = "container-for-charts" >
                <ToDoFlagPieChart />
                <div className="label-statistic-text">
                <p>
                    The pie chart above shows the distribution of flags for user tasks. Each color represents a different flag, and the size of the slice represents the number of tasks with that flag.
                    Used to determine the distribution of flags among user tasks, and to ensure that tasks are being flagged appropriately.
                </p>
                </div>
                </div>
            </div>


            </div>

        </div>

        </div>
    );
}

export default StatisticsProductivity;
