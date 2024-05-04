import React, { useState, useEffect } from "react";
import axios from "axios";

function UserSentimentAnalysis() {
    const [text, setText] = useState("");
    const [users, setUsers] = useState([]);
    const [sentiment, setSentiment] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    

    //fetching data from the API
    async function fetchData() {
        const options = {
            method: "POST",
            url: "https://text-analysis12.p.rapidapi.com/sentiment-analysis/api/v1.1",
            headers: {
              "content-type": "application/json",
              "X-RapidAPI-Key": "441b81741emsh513677e04c60039p1dd0aajsnb8a0e8e071fa",
              "X-RapidAPI-Host": "text-analysis12.p.rapidapi.com",
            },
            data: {
              language: "english",
              text: text,
            },
          };
      
          try {
            const response = await axios.request(options);
            console.log(response.data);
            setSentiment(response.data.sentiment);
            setIsLoading(false);
          } catch (error) {
            console.error(error);
          }
    }


    useEffect(() => {
    getUsers();
    getMessages();
    
    }, []);

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
            //console.log(allMessages);
            setMessages(manipulateMessageData(allMessages));
            console.log('SET MESSAGE:',messages);
        })
        .catch((error) => {
            console.error("Eroare mesage user sentiment", error);
        });
    };

    const getUsers = () => {
        axios
            .get("http://localhost:7979/users/all", {
                headers: {
                    "x-access-token": localStorage.getItem("token"),
                },
            })
            .then((res) => {
                console.log('Users sentiment analyiss:',res.data);
                setUsers(res.data);
            })
            .catch((error) => {
                console.error("Eroare users", error);
            });
    
    }

    const getUserMessages = () => {
        const userId = document.querySelector("#user-sentiment-dropdown").value;
console.log('User ID:', userId);
        if (!messages || typeof messages !== 'object') {
            console.error('Not obj');
            return;
        }
        const userMessages = messages[userId];
        if (!userMessages || userMessages.length === 0) {
            console.log('No messages found for the selected user.');
            alert('No messages found for the selected user.');
            return;
        }
        const userText = userMessages.map((message) => message.content).join(" ");
        setText(userText);
        console.log('User text:', userText);
        if(userText){
            fetchData();
        }
    }

    const manipulateMessageData = (messages) => {
        //console.log('Messages:',messages);
        const userMessages = {};
        messages.forEach((message) => {
            if (!userMessages[message.user_id]) {
                userMessages[message.user_id] = [];
            }
            userMessages[message.user_id].push(message);
        });
        console.log('Messages split by id sentiment analysis',userMessages);
        return userMessages;
    }

    const handleUserChange = (event) => {
        console.log('User selected:', event.target.value);
        setSentiment("");
        setIsLoading(true);

    }

    return (
        <div>
        <h3>Select the user you want to perform sentiment analysis upon:</h3>
        <select id='user-sentiment-dropdown' onChange={handleUserChange}>
    {users.map((user) => (
        <option key={user.id} value={user.id}>{user.username}</option>
    ))}
</select>
        <button onClick={getUserMessages}>Click to Analyze Sentiment</button>
        <div className="sentiment-result"> {isLoading ? "Click to load your data analysis!" : typeof sentiment === 'undefined' ? 'Please click again :)!' : 'Overall sentiment: ' + sentiment} </div>
        </div>
    );
}

export default UserSentimentAnalysis;