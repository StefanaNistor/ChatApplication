import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';

function MessageTypePieChart() {

    const [chartData, setChartData] = useState({});
    const [loadingData, setLoadingData] = useState(true);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        getMessages();
    }, []);

    const getMessages = () => {
        const allMessages = [];

        axios.get("http://localhost:7979/privateMessages", {
            headers: {
                "x-access-token": localStorage.getItem("token"),
            },
        })
            .then((res) => {
                allMessages.push(...res.data);
                return axios.get("http://localhost:7979/groupMessages", {
                    headers: {
                        "x-access-token": localStorage.getItem("token"),
                    },
                });
            })
            .then((res) => {
                allMessages.push(...res.data);
                setMessages(allMessages);
            })
            .catch((error) => {
                console.error("Error fetching messages", error);
            });
    };

    useEffect(() => {
        const messageTypeData = messages.reduce((acc, message) => {
            if (message.imageName && !message.fileName) {
                acc.push({ type: "image", message });
            } else if (!message.imageName && message.fileName) {
                acc.push({ type: "file", message });
            } else {
                acc.push({ type: "text", message });
            }
            return acc;
        }, []);

        const chartData = {
            labels: ["Text", "Image", "File"],
            datasets: [
                {
                    label: "Message Type",
                    data: [
                        messageTypeData.filter((item) => item.type === "text").length,
                        messageTypeData.filter((item) => item.type === "image").length,
                        messageTypeData.filter((item) => item.type === "file").length,
                    ],
                    backgroundColor: [
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(54, 162, 235, 0.6)",
                        "rgba(255, 206, 86, 0.6)",
                    ],
                },
            ],
        };

        setChartData(chartData);

        if (messageTypeData.length > 0) {
            setLoadingData(false);
        }
    }, [messages]);

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
                        plugins: {
                            datalabels: {
                                formatter: (value, context) => {
                                    const dataset = context.chart.data.datasets[0];
                                    const total = dataset.data.reduce((acc, curr) => acc + curr, 0);
                                    const percentage = ((value / total) * 100).toFixed(2) + '%';
                                    return percentage;
                                },
                                color: '#fff',
                                anchor: 'end',
                                align: 'start',
                                offset: -10,
                                borderRadius: 4,
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                padding: 4,
                            }
                        }
                    }}
                    plugins={[ChartDataLabels]}
                />
            )}
        </div>
    );
}

export default MessageTypePieChart;
