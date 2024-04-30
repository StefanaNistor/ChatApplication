import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";

function DepartmentBarChart() {
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    getGroups();
    getMessages();
  }, []);

  useEffect(() => {
    if (groups.length > 0 && messages.length > 0) {
      const newData = splitDataByGroup(messages, groups);
      const newChartData = {
        labels: Object.values(newData).map((entry) => entry.groupname),
        datasets: [
          {
            label: "Number of messages per department",
            data: Object.values(newData).map((entry) => entry.messageCount),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderWidth: 1,
          },
        ],
      };
      setChartData(newChartData);
    }
  }, [groups, messages]);

  const getGroups = () => {
    axios
      .get(`http://localhost:7979/groupChat/`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((res) => {
        //console.log(res.data);
        setGroups(res.data);
      })
      .catch((err) => {
        console.log("An error occurred while getting group chats!");
      });
  };

  const getMessages = () => {
    axios
      .get(`http://localhost:7979/groupMessages`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((res) => {
        //console.log(res.data);
        setMessages(res.data);
      })
      .catch((err) => {
        console.log("An error occurred while getting group messages!");
      });
  };

  const splitDataByGroup = (messages, groups) => {
    let newData = {};
    messages.forEach((message) => {
      const groupName = groups.find(
        (group) => group.id === message.group_id
      ).groupname;
      newData[message.group_id] = {
        groupname: groupName,
        messageCount:
          (newData[message.group_id]
            ? newData[message.group_id].messageCount
            : 0) + 1,
      };
    });
    //console.log(newData);
    return newData;
  };

  if (!chartData) return null;

  return (
    <div
      style={{
        width: "50%",
        height: "50%",
        margin: "auto",
        marginTop: "10vh",
        marginBottom: "10vh",
      }}
    >
      <Bar data={chartData} />
    </div>
  );
}

export default DepartmentBarChart;
