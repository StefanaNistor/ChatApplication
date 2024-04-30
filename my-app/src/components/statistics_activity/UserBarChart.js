import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";


function DepartmentBarChart() {

    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [getData, setData] = useState(false);

    useEffect(() => {
        getUsers();
        getMessages();
        console.log('ACtivity per user',users);
        console.log('ACtivity per user',messages);
        if(users.length > 0 && messages.length > 0){
            setData(true);
        }
    }, []);

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
            console.log(res.data);
            allMessages.push(...res.data);
                return axios.get("http://localhost:7979/groupMessages", {
                headers: {
                    "x-access-token": localStorage.getItem("token"),
                },
            });
        })
        .then((res) => {
            console.log(res.data);
            allMessages.push(...res.data);
            setMessages(allMessages);
            setData(true); 
        })
        .catch((error) => {
            console.error("Eroare mesage user barchart", error);
        });
    };

    return (
        <div
        style={{
            width: "50%",
            height: "50%",
            margin: "auto",
            marginTop: "10vh",
            marginBottom: "10vh",
          }}>

            {getData ? (
                 <Bar
                 data={{
                     labels: users.map((user) => user.username),
                     datasets: [
                         {
                             label: "Number of messages per user",
                             data: users.map((user) => messages.filter((message) => message.user_id === user.id).length),
                             backgroundColor: "rgba(75, 192, 192, 0.6)",
                             borderWidth: 1,
                         },
                     ],
                 }}
                 height={400}
                 width={600}
                 options={{
                     maintainAspectRatio: false,
                     scales: {
                         y: {
                             beginAtZero: true,
                         },
                     },
                 }}
             /> 
            ) : (
                <p>Loading data...</p>
            )}
        </div>
    );

}


export default DepartmentBarChart;