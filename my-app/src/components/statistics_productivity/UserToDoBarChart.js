import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";


function UserToDoBarChart() {

    const [users, setUsers] = useState([]);
    const [todos, setTodos] = useState([]);
   
   

    function generateARandomColor() { 
        return `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.6)`;
    }


    useEffect(() => {
        getUsers();
        getToDos();
       
    }, []);

    const getUsers = () => {
        axios.get(`http://localhost:7979/users/all`, {
            headers: {
                "x-access-token": localStorage.getItem("token"),
            },
        }).then((res) => {
            //console.log(res.data);
            setUsers(res.data);
        }).catch((err) => {
            console.log("An error occurred while getting users!");
        });
    };

    const getToDos = () => {
        axios.get(`http://localhost:7979/toDoList/`, {
            headers: {
                "x-access-token": localStorage.getItem("token"),
            },
        }).then((res) => {
            //console.log(res.data);
            setTodos(res.data);
        }
        ).catch((err) => {
            console.log("todo bar chart err !");
        });

    }

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
          }}>

         
                 <Bar
                 data={{
                     labels: users.map((user) => user.username),
                     datasets: [
                         {
                             label: "Number of todo items per user",
                             data: users.map((user) => todos.filter((todo)=> todo.user_id === user.id).length),
                             backgroundColor: users.map(() => generateARandomColor()),
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
          
        </div>
    );

}


export default UserToDoBarChart;