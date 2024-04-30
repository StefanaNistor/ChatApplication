import React from "react";
import { useState, useEffect } from "react";

import axios from "axios";
import StatisticsActivity from "./StatisticsActivity";
import NavBar from "./NavBar";

function MainStatistics() {

    const [activityStat, setActivityStat] = useState(false);

    return (
        <div>
            <NavBar />
            <div className='statistics-main-container'
            style={{
                marginTop:'12vh'
            }}> 

           {activityStat ? <StatisticsActivity onClose={setActivityStat} /> : 
           <div className="statistics-container">
           <h1>View Statistics</h1>
              <button onClick={() => setActivityStat(true)}>Activity Statistics</button>
            </div>}

        </div>
        </div>
    );
}   

export default MainStatistics;

