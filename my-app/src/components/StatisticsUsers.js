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

          


            </div>

        </div>

        </div>
    );
}

export default StatisticsUsers;
