import React from "react";
import { useState, useEffect } from "react";
import {Bar} from 'react-chartjs-2';
import axios from "axios";


function DepartmentBarChart(data)  {

    const [groups, setGroups] = useState([]);

    useEffect(() => {
        getGroups();
    }, []);

    const getGroups = () => {
        axios
        .get(`http://localhost:7979/groupChat/`, {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        })
        .then((res) => {
            setGroups(res.data);
            console.log("BAR CHART GR:", res.data);
        })
        .catch((err) => {
          console.log("An error occurred while getting group chats!");
        });
      };

    const chartData = {
        labels: groups.map(group => group.groupname),
        datasets: [
            {
                label: 'Number of users',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderWidth: 1
            }
        ]
    }

    return (
        <div
        style={{
            width: '50%',
            height: '50%',
            margin: 'auto',
            marginTop: '10vh',
            marginBottom: '10vh'
        
        }}
        >
            <Bar data={chartData} />
        </div>
    )


}

export default DepartmentBarChart;