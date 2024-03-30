import React from "react";
import NavBar from "./NavBar";
import { useState, useEffect } from "react";
import axios from "axios";

function Calendar() {
  const [date, setDate] = useState(new Date());
  const [toDoList, setToDoList] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    getToDoListItems();
  }, []);

  const getToDoListItems = () => {
    const userID = user.id;
    axios
      .get(`http://localhost:7979/toDoList/${userID}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((res) => {
        const items = res.data.map((item) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          flagID: item.flag_id,
          start_date: item.start_date,
          end_date: item.end_date,
        }));
        setToDoList(items);
        console.log("ToDoList:", toDoList);
      })
      .catch((err) => {
        console.log("ERROR TODO FRONTEND!");
      });
  };

  const generateColorForToDo = (flagID) => {
    switch (flagID) {
      case 0:
        return "#f21d1d";
      case 1:
        return "#ffa500";
      case 2:
        return "#ffd700";
      case 3:
        return "#6495ed";
      case 4:
        return "#32cd32";
      case 5:
        return "#b02ea3";
      default:
        return "#000000";
    }
  };

  const daysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getMonthData = () => {
    // BIG TO DO: for whatever reason, the first day of my to-do items is off by one day
    // ALKSFS

    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Adjusted here
    const totalDays = daysInMonth(year, month);
    const monthData = [];
  
    let day = 1;
  
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          week.push("");
        } else if (day > totalDays) {
          break;
        } else {
          const toDoItems = toDoList.filter((item) => {
            const startDate = new Date(item.start_date);
            const endDate = new Date(item.end_date);
            return (
              startDate.getFullYear() === year &&
              startDate.getMonth() === month &&
              startDate.getDate() <= day &&
              endDate.getFullYear() === year &&
              endDate.getMonth() === month &&
              endDate.getDate() >= day
            );
          });
          week.push({ day, toDoItems });
          day++;
        }
      }
      monthData.push(week);
    }
  
    return monthData;
  };

  const prevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1));
  };

  const nextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1));
  };

  return (
    <div>
      <NavBar />
      <h1>Calendar</h1>
      <h2>
        {date.toLocaleString("default", { month: "long", year: "numeric" })}
      </h2>
      <button onClick={prevMonth}>Previous</button>
      <button onClick={nextMonth}>Next</button>
      <table>
        <thead>
          <tr>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
            <th>Sun</th>
          </tr>
        </thead>
        <tbody>
          {getMonthData().map((week, index) => (
            <tr key={index}>
              {week.map((dayData, idx) => (
                <td key={idx}>
                  {dayData.day}
                  {dayData.toDoItems &&
                    dayData.toDoItems.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: generateColorForToDo(
                            item.flagID - 1
                          ),
                          width: "100%",
                          height: "20px",
                        }}
                      >
                        {item.title}
                      </div>
                    ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default Calendar;
