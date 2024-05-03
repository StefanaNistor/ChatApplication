import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useState, useEffect } from "react";
import axios from "axios";

function UserActivityLineChart() {

    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [messagesData, setMessagesData] = useState([]);


    const getUsers = () => {
        axios.get(`http://localhost:7979/users/all`, {
            headers: {
                "x-access-token": localStorage.getItem("token"),
            },
        }).then((res) => {
            console.log(res.data);
            setUsers(res.data);
        }).catch((err) => {
            console.log("An error occurred while getting users!");
        });
    };

    const getMessages = () => {
        const allMessages = [];
    
        axios.get("http://localhost:7979/privateMessages", {
            headers: {
                "x-access-token": localStorage.getItem("token"),
            },
        })
        .then((res) => {
            //console.log(res.data);
            allMessages.push(...res.data);
                return axios.get("http://localhost:7979/groupMessages", {
                headers: {
                    "x-access-token": localStorage.getItem("token"),
                },
            });
        })
        .then((res) => {
            //console.log(res.data);
            allMessages.push(...res.data);
            console.log(allMessages);
            setMessages(allMessages);
        })
        .catch((error) => {
            console.error("Eroare mesage user barchart", error);
        });
    };

    function generateARandomColor() { 
        return `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.6)`;
    }



  function manipulateMessageData(messages) {
    let data = new Array(24).fill(0);
    messages.forEach((message) => {
      let date = new Date(message.timestamp);
      data[date.getHours()]++;
    
    });
    return data;
  }

    useEffect(() => {
        getUsers();
        getMessages();
    }, []);

    useEffect(() => {
        setMessagesData(manipulateMessageData(messages));
    }, [messages]);


const userDatasets = users.map((user, index) => {
    let msg = manipulateMessageData(messages.filter((message) => message.user_id === user.id));
    return {
        label: user.username,
        data: msg,
        fill: false,
        borderColor: generateARandomColor(),
        tension: 0.1,
    };
});


  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Chart.js Line Chart",
      },
    },
  };

  const chartData = {
    labels: [
      "00:00",
      "01:00",
      "02:00",
      "03:00",
      "04:00",
      "05:00",
      "06:00",
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "22:00",
      "23:00",
    ],
    datasets: userDatasets,

  };

  return (
    <div
      style={{
        width: "50%",
        height: "50%",
        margin: "auto",
        marginTop: "2vh",
        marginBottom: "2vh",
        backgroundColor: "white",
        padding: "20px",
        borderRadius: '25px',
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Line options={options} data={chartData} />
    </div>
  );
}

export default UserActivityLineChart;
