import "bootstrap/dist/css/bootstrap.css";
import profileLogo from "./passport_logo.png";
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Log = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = () => {
    // In a real application, you would handle authentication here (e.g., Firebase login)
    // After successful login, navigate to the feed
    navigate('/feed');
  };

  return (
    <div className="page-container">
      <img src={profileLogo} alt="Profile logo" className="profile-image" />
      <h2>Login</h2>
      <input type="Email" placeholder="Email" />
      <input type="Password" placeholder="Password" />
      <button className="btn btn-primary" onClick={handleLogin}>Login</button> {/* Add onClick handler */}
      <p>
        Not registered yet? <a href="/reg">Register here</a>
      </p>
    </div>
  );
};

export default Log;