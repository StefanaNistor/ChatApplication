import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import ActivityLineChart from "./statistics_activity/ActivityLineChart";
import DepartmentBarChart from "./statistics_activity/DepartmentBarChart";
import UserBarChart from "./statistics_activity/UserBarChart";
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
            <h1>General Activity Statistics</h1>
            <button   
            style={{
                margin: '10px',
                width: '12vw'
            }}
            onClick={() => onClose (false)
            }>Back</button>
            <div className="statistics-container">
            
            <div className="line-chart-staistic">
                <h2>Peak Chat Activity by Hour</h2>
                <div className="container-for-charts">
                <ActivityLineChart />
                < div className = "label-statistic-text">
                    <p>
                        The line chart above shows the peak chat activity by hour. It splits the messages by private and group messages.
                        It analyises the most active hours of the day, overall not just for a specific date (such as the last 7 days or last month).
                        This is useful for determining when the most messages are sent and received, to help with scheduling and planning.
                    </p>
                </div>
                </div>
              
            </div>

            <div className="bar-chart-statistic">
                <h2>Most Active Department by Number of Messages</h2>
                <div className="container-for-charts">
                <DepartmentBarChart />
                <div className="label-statistic-text">
                    <p>
                        The bar chart above shows the most active department by number of messages. It splits the messages by department.
                        It analyises the most overall active departments in the company, which can be an indicator of the most active and productive teams.
                        If the department, or group (could be a temporary team, it will still show up on the graph) doesn't show up, it means that therese have been no messages sent.
                    </p>
                </div>
                </div>
            </div>

            <div className="bar-chart-statistic">
            <h2>Most Active User by Number of Messages</h2>
            <div className="container-for-charts">
            <UserBarChart />
            <div className="label-statistic-text">
                <p>
                    The bar chart above shows the most active user by number of messages. It splits the messages by user.
                    It analyises the most overall active users in the company, which can be an indicator of the most active and productive employees.
                    All users are displayed, even if they have sent no messages.
                </p>
            </div>
            </div>
            </div>

            </div>

        </div>

        </div>
    );
}

export default StatisticsActivity;
