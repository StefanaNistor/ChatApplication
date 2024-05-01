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
import MessageTypePieChart from "./statistics_message_content/MessageTypePieChart";
import MessageLengthHorizontalBarChart from "./statistics_message_content/MessageLengthHorizontalBarChart";

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

function StatisticsMessages({onClose }) {

    return (
        <div>
            <NavBar />
            <div className="statistics-activity-container"
            style={{
                marginTop:'8vh',
                overflowY: 'scroll',
                height: '90vh'
            }}>
            <h1>General Message Statistics</h1>
            <button style={{
                margin: '10px',
                width: '12vw'
            }} onClick={() => onClose (false)}>Back</button>
            <div className="statistics-container">

            <div className="pie-chart-statistic">
                <h2>Distribution of message types</h2>
                <MessageTypePieChart />
            </div>

            <div className="bar-chart-staistic">
                <h2> Average length of message per Department </h2>
                <MessageLengthHorizontalBarChart />

            </div>

            </div>

        </div>

        </div>
    );
}

export default StatisticsMessages;
