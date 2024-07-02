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
import { Pie } from "react-chartjs-2";
import { useState, useEffect } from "react";
import axios from "axios";
import ChartDataLabels from "chartjs-plugin-datalabels";

function UserActivityTypeOfUser() {
  const [users, setUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [simpleUsers, setSimpleUsers] = useState([]);

  const getUsers = () => {
    axios
      .get(`http://localhost:7979/users/all`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((res) => {
        console.log(res.data);
        setUsers(res.data);
      })
      .catch((err) => {
        console.log("An error occurred while getting users!");
      });
  };

  const splitUsers = () => {
    //split by isAdmin
    const adminUsers = users.filter((user) => user.isadmin === true);
    const simpleUsers = users.filter((user) => user.isadmin === false);
    setAdminUsers(adminUsers);
    setSimpleUsers(simpleUsers);
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    splitUsers();
    console.log("Users: ", users);
    console.log("Admin users: ", adminUsers);
    console.log("Simple users: ", simpleUsers);
  }, [users]);

  const generateColorForUser = (isAdmin) => {
    if (isAdmin === true) {
      return "#32cd32";
    } else {
      return "#b02ea3";
    }
  };

  const userTypeDistribData = {
    labels: ["Admin", "Simple User"],
    datasets: [
      {
        data: [adminUsers.length, simpleUsers.length],
        backgroundColor: [
          generateColorForUser(true),
          generateColorForUser(false),
        ],
      },
    ],
  };

  const optionsU = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        formatter: (value, context) => {
          const dataset = context.chart.data.datasets[0];
          const total = dataset.data.reduce((acc, curr) => acc + curr, 0);
          const percentage = ((value / total) * 100).toFixed(2) + "%";
          return percentage;
        },
        color: "#fff",
        anchor: "end",
        align: "start",
        offset: -10,
        borderRadius: 4,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        padding: 4,
      },
    },
    title: {
      display: true,
      text: "User Type Distribution",
      fontSize: 20,
    },
    legend: {
      display: true,
      position: "right",
    },
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
        borderRadius: "25px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
        alignContent: "center",
      }}
    >
      <Pie
        data={userTypeDistribData}
        options={optionsU}
        plugins={[ChartDataLabels]}
      />
    </div>
  );
}

export default UserActivityTypeOfUser;
