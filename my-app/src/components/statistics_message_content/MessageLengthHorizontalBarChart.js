import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";

function MessageLengthHorizontalBarChart() {
    const [groups, setGroups] = useState([]);
    const [messages, setMessages] = useState([]);
    const [chartData, setChartData] = useState(null);
  
    function generateARandomColor() {
        return `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
          Math.random() * 256
        )}, ${Math.floor(Math.random() * 256)}, 0.6)`;
      }
    
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
  
    useEffect(() => {
      getGroups();
      getMessages();
    }, []);

    const splitDataByGroup = (messages, groups) => {
        let newData = {};
    
        let groupMessageStats = {};
    
        messages.forEach((message) => {
            const groupName = groups.find(
                (group) => group.id === message.group_id
            ).groupname;
    
            // check if the group ID already exists in groupMessageStats
            if (!groupMessageStats[message.group_id]) {
                groupMessageStats[message.group_id] = {
                    totalLength: 0,
                    messageCount: 0
                };
            }
    
            //updates
            groupMessageStats[message.group_id].totalLength += message.content.length;
            groupMessageStats[message.group_id].messageCount++;
        });
    
        // calculate the average message length for each group and update newData
        Object.keys(groupMessageStats).forEach((groupId) => {
            const groupName = groups.find(
                (group) => group.id === parseInt(groupId)
            ).groupname;
            const totalLength = groupMessageStats[groupId].totalLength;
            const messageCount = groupMessageStats[groupId].messageCount;
            const averageMessageLength = totalLength / messageCount;
    
            // update newdata
            newData[groupId] = {
                groupname: groupName,
                averageMessageLength: averageMessageLength
            };
        });
    
        //console.log(newData);
        return newData;
    };
    
      useEffect(() => {
        if (groups.length && messages.length) {
            const data = splitDataByGroup(messages, groups);
            const chartData = {
                labels: Object.keys(data).map((key) => data[key].groupname),
                datasets: [
                {
                    label: "Average Message Length per Department",
                    data: Object.keys(data).map((key) => data[key].averageMessageLength),
                    backgroundColor: Object.keys(data).map((key) => generateARandomColor()),
                },
                ],
            };
            setChartData(chartData);
            //console.log('ChartD', chartData)
        }
      }, [groups, messages]);

      
 
  if (!chartData) return null;


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
        borderRadius: "25px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Bar
        data={ chartData}
        height={400}
        width={600}
        options={{
          maintainAspectRatio: false,
          indexAxis: "y",
          scales: {
            x: {
              beginAtZero: true,
            },
          },
        }}
      />

    </div>
  );
}

export default MessageLengthHorizontalBarChart;
