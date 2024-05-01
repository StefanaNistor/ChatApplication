import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';

function ToDoFlagPieChart() {
    const [toDoItems, setToDoItems] = useState([]);
    const [flags, setFlags] = useState([]);
    const [chartData, setChartData] = useState({});
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        getToDoItems();
        getFlags();
    }, []);

    const generateColorForToDo = (flagID) => {
        switch (flagID) {
          case 1:
            return "#f21d1d";
          case 2:
            return "#ffa500";
          case 3:
            return "#ffd700";
          case 4:
            return "#6495ed";
          case 5:
            return "#32cd32";
          case 6:
            return "#b02ea3";
          default:
            return "#000000";
        }
      };


    useEffect(() => {

        const flagData = flags.map(flag => {
            return {
                label: flag.name,
                data: toDoItems.filter(item => item.flag_id === flag.id).length,
                backgroundColor: generateColorForToDo(flag.id),
            };
        });

        //console.log(flagData);

        const chartData = {
            labels: flagData.map(data => data.label),
            datasets: [
                {
                    data: flagData.map(data => data.data),
                    backgroundColor: flagData.map(data => data.backgroundColor),
                },
            ],
        };

        //console.log(chartData);
        setChartData(chartData);

        if(toDoItems.length > 0 && flags.length > 0) {
            setLoadingData(false);
        }


    }, [toDoItems, flags]);


    
    const getToDoItems = () => {
        axios
            .get("http://localhost:7979/toDoList/", {
                headers: {
                    "x-access-token": localStorage.getItem("token"),
                },
            })
            .then((res) => {
                setToDoItems(res.data);
            })
            .catch((err) => {
                console.log("ERROR TODO FRONTEND!");
            });
    };

    const getFlags = () => {
        axios
            .get("http://localhost:7979/flags/allFlags", {
                headers: {
                    "x-access-token": localStorage.getItem("token"),
                },
            })
            .then((res) => {
                setFlags(res.data);
            })
            .catch((err) => {
                console.log("ERROR FLAGS FRONTEND!");
            });
    };

    return (
        <div
            style={{
                width: "50%",
                height: "55vh",
                margin: "auto",
                marginTop: "2vh",
                marginBottom: "2vh",
                backgroundColor: "white",
                padding: "20px",
                borderRadius: '25px',
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
            }}
        >
            {loadingData ? (
                <div>Loading data...</div>
            ) : (
                <Pie
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                    }}
                />
            )}
        </div>
    );
}

export default ToDoFlagPieChart;

