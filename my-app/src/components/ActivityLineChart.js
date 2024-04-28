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
 

function ActivityLineChart(dataPrivateGroup, dataGroupChat){

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
                data: dataPrivateGroup,
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