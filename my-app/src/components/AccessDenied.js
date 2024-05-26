import React from 'react';
import { useNavigate } from 'react-router-dom';

function AccessDenied() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/'); // Redirect to the home page or any other page you prefer
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Access Denied</h1>
      <p style={styles.paragraph}>Sorry, you don't have permission to view this page.</p>
      <button style={styles.button} onClick={handleGoBack}>
        Go Back to Home
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  header: {
    fontSize: '3em',
    marginBottom: '20px',
  },
  paragraph: {
    fontSize: '1.5em',
    marginBottom: '30px',
  },
  button: {
    backgroundColor: '#f5c6cb',
    color: '#721c24',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 20px',
    fontSize: '1em',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default AccessDenied;
