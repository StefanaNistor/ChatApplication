import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  import { Line } from 'react-chartjs-2';
    import { useState, useEffect } from "react";
    import axios from "axios";


function ActivityLineChart(){

    const [messagesPrivate, setMessagesPrivate] = useState([]);
    const [messagesGroup, setMessagesGroup] = useState([]);
    const[dataPrivateChat, setDataPrivateChat] = useState([]);
    const[dataGroupChat, setDataGroupChat] = useState([]);



    
    useEffect(() => {
        getPrivateMessages();
        getGroupMessages();
        
    }, []);


    
    const getPrivateMessages = async () => {
        try {
            const response = await axios.get("http://localhost:7979/privateMessages", {
                headers: {
                    "x-access-token": localStorage.getItem("token"),
                },
            });
            setMessagesPrivate(response.data);
            console.log("STATISTICS pr mess", response.data);
        } catch (error) {
            console.error("ERROR GETTING PRIVATE MESSAGES", error);
        }
    };
    
    const getGroupMessages = async () => {
        try {
            const response = await axios.get("http://localhost:7979/groupMessages", {
                headers: {
                    "x-access-token": localStorage.getItem("token"),
                },
            });
            setMessagesGroup(response.data);
            //console.log("STATISTICS gr mess", response.data);
        } catch (error) {
            console.error("ERROR GETTING GROUP MESSAGES", error);
        }
    };
    
    function manipulateMessageData(messages) {
        let data = new Array(24).fill(0);
        messages.forEach((message) => {
            let date = new Date(message.timestamp);
            data[date.getHours()]++;
        });
        return data;
    }
    
    useEffect(() => {
        setDataPrivateChat(manipulateMessageData(messagesPrivate));
        setDataGroupChat(manipulateMessageData(messagesGroup));
    }
    , [messagesPrivate, messagesGroup]);


    const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top' 
          },
          title: {
            display: true,
            text: 'Chart.js Line Chart',
          },
        },

      };

    const chartData = {
        labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
        datasets: [
            {
                label: 'Private Chat Activity by Hour',
                data: dataPrivateChat,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
            {
                label: 'Group Chat Activity by Hour',
                data: dataGroupChat,
                backgroundColor: 'rgba(192, 75, 192, 0.6)',
                borderColor: 'rgba(192, 75, 192, 1)',
                borderWidth: 1,
            }
        ]
    }

    return (
        <div style={{
            width: '50%',
            height: '50%',
            margin: 'auto',
            marginTop: '10vh',
            marginBottom: '10vh'
        
        }}>
            <Line options = {options} data={chartData} />
        </div>
    )
}

export default ActivityLineChart;