import { useState } from 'react';
import '../App.css';

const API_BASE = 'http://localhost:3000/api';
//const API_BASE = 'http://192.168.0.4:3000/api';


function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isSignup ? '/auth/register' : '/auth/login';

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      // Success - pass user to parent
      if (isSignup) {
        // After signup, log them in
        setIsSignup(false);
        setError('Account created! Please log in.');
      } else {
        onLogin(data.user);
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
    setLoading(false);
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        <h2>{isSignup ? 'Sign Up' : 'Log In'}</h2>
        
        <form onSubmit={handleSubmit}>
          <input
            type="username"
            placeholder="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && <div className="errorMsg">{error}</div>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isSignup ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <p className="switchAuth">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;