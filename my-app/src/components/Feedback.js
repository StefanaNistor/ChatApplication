import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import "../components-style/Feedback.css";
import NavBar from './NavBar';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState({
    title: '',
    content: '',
    rating: 0,
  });

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.isAdmin;

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get('http://localhost:7979/feedback', {
        headers: {
          "x-access-token": localStorage.getItem('token')
        }
      });
      const filteredFeedbacks = response.data.filter(feedback => {
        const feedbackDate = new Date(feedback.date);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return feedbackDate >= sixMonthsAgo;
      });
      setFeedbacks(filteredFeedbacks);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFeedback({
      ...newFeedback,
      [name]: value,
    });
  };

  const handleRatingChange = (rating) => {
    setNewFeedback({
      ...newFeedback,
      rating,
    });
  };

  const handleAddFeedback = async () => {
    if (!newFeedback.title || !newFeedback.content || !newFeedback.rating) {
      alert("All fields are required!");
      return;
    }

    try {
      const response = await axios.post('http://localhost:7979/feedback/add', newFeedback, {
        headers: {
          "x-access-token": localStorage.getItem('token')
        }
      });
      setFeedbacks([...feedbacks, response.data]);
      setNewFeedback({ title: '', content: '', rating: 0 });
    } catch (error) {
      console.error("Error adding feedback:", error);
    }
  };

  const handleDeleteFeedback = async (id) => {
    try {
      await axios.delete(`http://localhost:7979/feedback/delete/${id}`, {
        headers: {
          "x-access-token": localStorage.getItem('token')
        }
      });
      setFeedbacks(feedbacks.filter(feedback => feedback._id !== id));
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  const calculateAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const totalRating = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    return totalRating / feedbacks.length;
  };

  const averageRating = calculateAverageRating();

  return (
    <div className="feedback-container">
      <NavBar />
      <div className="feedback-content">
        <div
        style={{
          width:'50%'
        }}
        >
        <div className="overall-score">
          <h3>Overall Rating Score:</h3>
          <div className="rating">
            {[...Array(5)].map((_, index) => {
              const fullStarThreshold = index + 1;
              const halfStarThreshold = index + 0.5;
              return (
                <span key={index}>
                  {averageRating >= fullStarThreshold ? (
                    <FaStar className="star-icon active" />
                  ) : averageRating >= halfStarThreshold ? (
                    <FaStarHalfAlt className="star-icon active" />
                  ) : (
                    <FaStar className="star-icon" />
                  )}
                </span>
              );
            })}
            <span>({averageRating.toFixed(1)})</span>
          </div>
        </div>
        <div className="feedback-list">
          <p>Feedback from the last 6 months:</p>
          {feedbacks.map(feedback => (
            <div className="feedback-card" key={feedback._id}>
              <h3 className="feedback-title">{feedback.title}</h3>
              <p className="feedback-content">{feedback.content}</p>
              <p className="feedback-date">{new Date(feedback.date).toLocaleDateString()}</p>
              <div className="rating">
                {[...Array(5)].map((_, index) => (
                  <FaStar key={index} className={`star-icon ${index < feedback.rating ? 'active' : ''}`} />
                ))}
              </div>
              {isAdmin && <button onClick={() => handleDeleteFeedback(feedback._id)}>Delete</button>}
            </div>
          ))}
        </div>
        </div>
        <p style={{ width: '200px' }}> Add your feedback here: </p>
        <div className="feedback-form">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newFeedback.title}
            onChange={handleInputChange}
          />
          <textarea
            name="content"
            id="feedback-content"
            placeholder="Content"
            value={newFeedback.content}
            onChange={handleInputChange}
          />
          <div className="rating">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={`star-icon ${index < newFeedback.rating ? 'active' : ''}`}
                onClick={() => handleRatingChange(index + 1)}
              />
            ))}
          </div>
          <button className="add-feedback-button" onClick={handleAddFeedback}>Add Feedback</button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
