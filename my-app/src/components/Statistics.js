import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import ActivityLineChart from "./ActivityLineChart";
import DepartmentBarChart from "./DepartmentBarChart";
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



function Statistics() {


    return (
        <div>
            <h1>Statistics</h1>
            <div className="statistics-container">
            
            <div className="line-chart-staistic">
                <h2>Peak Chat Activity by Hour</h2>
                <ActivityLineChart />
            </div>

            <div className="bar-chart-statistic">
                <h2>Most Active Department by Number of Messages</h2>
                <DepartmentBarChart />
            </div>

            <div className="pie-chart-statistic">
            <h2> Distribution of flags for To-Do Items </h2>
            <ToDoFlagPieChart />
            </div>


            </div>

        </div>
    );
}

export default Statistics;
