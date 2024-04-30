import React from "react";
import { useState, useEffect } from "react";

import axios from "axios";
import StatisticsActivity from "./StatisticsActivity";
import StatisticsProductivity from "./StatisticsProductivity";
import NavBar from "./NavBar";

function MainStatistics() {

    const [activityStat, setActivityStat] = useState(false);
    const [productivityStat, setProductivityStat] = useState(false);

    return (
        <div>
            <NavBar />
            <div className='statistics-main-container'
            style={{
                marginTop:'12vh'
            }}> 

            {
                activityStat ? 
                <StatisticsActivity onClose={setActivityStat} /> : 
                productivityStat ? 
                <StatisticsProductivity onClose={setProductivityStat} /> :
                <div className='statistics-main'>
                    <h1>General Statistics</h1>
                    <button onClick={() => setActivityStat(true)} style={{margin:'5px'}}>Activity Statistics</button>
                    <button onClick={() => setProductivityStat(true)} style={{margin:'5px'}}>Productivity Statistics</button>
                </div>
            }



        </div>
        </div>
    );
}   

export default MainStatistics;

