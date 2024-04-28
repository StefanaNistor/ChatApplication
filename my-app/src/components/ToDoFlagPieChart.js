import React from "react";
import { useState, useEffect } from "react";
import {Pie} from 'react-chartjs-2';
import axios from "axios";

function ToDoFlagPieChart(data){

    const [toDoItems, setToDoItems] = useState([]);
    const [flags, setFlags] = useState([]);


    useEffect(() => {
        getToDoItems();
        getFlags();
    }
    , []);

    const getToDoItems = () => {
    }

    const getFlags = () => {
    }

    const chartData = {
        labels: flags,
        datasets: [
            {
                label: 'Number of To-Do Items',
                data: data,
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(75, 192, 192, 0.3)'],
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
            
            <Pie data={chartData} />
        </div>
    );

}

export default ToDoFlagPieChart;