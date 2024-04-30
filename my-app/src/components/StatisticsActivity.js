import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import ActivityLineChart from "./statistics_activity/ActivityLineChart";
import DepartmentBarChart from "./statistics_activity/DepartmentBarChart";
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
import ToDoFlagPieChart from "./ToDoFlagPieChart";
import NavBar from "./NavBar";
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



function StatisticsActivity({onClose }) {

    return (
        <div>
            <NavBar />
            <div className="statistics-activity-container"
            style={{
                marginTop:'8vh',
                overflowY: 'scroll',
                height: '90vh'
            }}>
            <h1>Activity Statistics</h1>
            <button onClick={() => onClose (false)}>Back</button>
            <div className="statistics-container">
            
            <div className="line-chart-staistic">
                <h2>Peak Chat Activity by Hour</h2>
                <ActivityLineChart />
            </div>

            <div className="bar-chart-statistic">
                <h2>Most Active Department by Number of Messages</h2>
                <DepartmentBarChart />
            </div>


            </div>

        </div>
        
        </div>
    );
}

export default StatisticsActivity;
