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
                <div className="container-for-charts">
                <MessageTypePieChart />
                <div className="label-statistic-text">
                <p>
                    The pie chart above shows the distribution of message types. The chart shows the percentage of each message type in the total number of messages.
                    The message types are: <br />
                    - TEXT: only text is present in the message <br />
                    - IMAGE: an immage is attached, text may be present or not <br />
                    - FILE: a file is attached, text may be present or not <br />
                    Used to understand the type of content shared in the chat.
                </p>
                </div>
                </div>
            </div>

            <div className="bar-chart-staistic">
                <h2> Average length of message per Department </h2>
                <div className="container-for-charts">
                <MessageLengthHorizontalBarChart />
                <div className="label-statistic-text">
                <p>
                    The bar chart above shows the average length of messages per department. The x-axis represents the departments and the y-axis represents the average length of messages.
                    Used to understand the average length of messages sent by each department.
                </p>
                    </div>
                </div>

            </div>

            </div>

        </div>

        </div>
    );
}

export default StatisticsMessages;
