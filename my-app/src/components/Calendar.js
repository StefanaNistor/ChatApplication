import React from "react";
import NavBar from "./NavBar";
import { useState, useEffect } from "react";
import axios from "axios";
import "../components-style/Calendar.css";

function Calendar({todayDate}) {
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
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
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
            const startDate = new Date(new Date(item.start_date).getTime());
            const endDate = new Date(new Date(item.end_date).getTime());
            const itemYear = startDate.getFullYear();
            const itemMonth = startDate.getMonth();
            const itemDay = startDate.getDate();
            const itemEndYear = endDate.getFullYear();
            const itemEndMonth = endDate.getMonth();
            const itemEndDay = endDate.getDate();
  
          
            return (
              new Date(year, month, day) >= startDate &&
              new Date(year, month, day) <= endDate
            );
          });
          week.push({ day, month, year, toDoItems });
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
      <div className='calendar-container'>
      <h2>
        {date.toLocaleString("default", { month: "long", year: "numeric" })}
      </h2>
      <div className="calendar-buttons">
      <button onClick={prevMonth}>Previous</button>
      <button onClick={nextMonth}>Next</button>
      </div>
      <div className="calendar">
      <table id='calendarTable'>
        <thead id='calendarHeader'>
          <tr>
            <th>Monday</th>
            <th>Tuesday</th>
            <th>Wednesday</th>
            <th>Thursday</th>
            <th>Friday</th>
            <th>Saturday</th>
            <th>Sunday</th>
          </tr>
        </thead>
        <tbody id='calendarBody'>
          {getMonthData().map((week, index) => (
            <tr key={index}>
              {week.map((dayData, idx) => (
                <td key={idx}
                style={{
                  color: dayData.day === todayDate.getDate() && dayData.month === todayDate.getMonth() && dayData.year === todayDate.getFullYear() ? "red" : "black",
                  padding: "10px",
                 
                }}
                >
                  {dayData.day}
                  {dayData.day === todayDate?.getDate() && dayData.month === todayDate?.getMonth() && dayData.year === todayDate?.getFullYear() ? <div style={{color: "red"}}>You're here! :)</div> : null}
                  {dayData.toDoItems &&
                    dayData.toDoItems.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: generateColorForToDo(
                            item.flagID - 1
                          ),
                          
                          borderRadius: "5px",
                          margin: "2px",
                          color: "white",
                          textAlign: "center",
                          fontSize: "12px",
                          cursor: "pointer",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          opacity: "1",

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
      </div>
    </div>
  );
}
export default Calendar;
