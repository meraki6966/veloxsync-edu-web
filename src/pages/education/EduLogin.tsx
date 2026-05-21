import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../api';

const LOGIN_CSS = `
.edu-login-page {
  min-height: 100vh;
  background: #FAF7F2;
  font-family: 'Open Sans', sans-serif;
  color: #1C1812;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.edu-login-card {
  width: 100%;
  max-width: 440px;
  background: #FFFFFF;
  border: 1px solid rgba(28,24,18,0.1);
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 4px 32px rgba(28,24,18,0.06);
}
.edu-login-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #3D6B4F;
  margin-bottom: 14px;
  text-align: center;
}
.edu-login-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 40px;
  font-weight: 400;
  line-height: 1.1;
  color: #1C1812;
  text-align: center;
  margin-bottom: 8px;
}
.edu-login-title em { font-style: italic; color: #3D6B4F; }
.edu-login-sub {
  font-size: 14px;
  font-weight: 300;
  color: rgba(28,24,18,0.6);
  text-align: center;
  margin-bottom: 32px;
}
.edu-login-field { margin-bottom: 18px; }
.edu-login-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(28,24,18,0.6);
  margin-bottom: 8px;
}
.edu-login-input {
  width: 100%;
  background: #FAF7F2;
  border: 1px solid rgba(28,24,18,0.1);
  border-radius: 8px;
  padding: 13px 16px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #1C1812;
  transition: border-color 0.2s;
}
.edu-login-input:focus {
  outline: none;
  border-color: #3D6B4F;
}
.edu-login-input::placeholder { color: rgba(28,24,18,0.35); }
.edu-login-error {
  background: rgba(229,62,62,0.08);
  border: 1px solid rgba(229,62,62,0.25);
  color: #B23A3A;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 18px;
}
.edu-login-button {
  width: 100%;
  font-family: 'Open Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF;
  background: #3D6B4F;
  border: none;
  cursor: pointer;
  padding: 14px;
  border-radius: 100px;
  transition: background 0.2s, opacity 0.2s;
}
.edu-login-button:hover { background: #5A8F6A; }
.edu-login-button:disabled { opacity: 0.55; cursor: not-allowed; }
.edu-login-footer {
  text-align: center;
  margin-top: 22px;
  font-size: 12px;
  color: rgba(28,24,18,0.45);
}
.edu-login-footer a {
  color: #3D6B4F;
  text-decoration: none;
  font-weight: 600;
}
.edu-login-footer a:hover { text-decoration: underline; }
`;

export default function EduLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-edu-login', 'true');
    styleEl.textContent = LOGIN_CSS;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await auth.login({ email, password });
      const token = res.data?.token ?? res.data?.accessToken;
      if (!token) {
        setError('Unexpected response from server. Please try again.');
        setLoading(false);
        return;
      }
      localStorage.setItem('edu_token', token);
      navigate('/education/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; error?: string } } };
      setError(e?.response?.data?.message ?? e?.response?.data?.error ?? 'Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <div className="edu-login-page">
      <div className="edu-login-card">
        <div className="edu-login-eyebrow">VeloxSync for Education</div>
        <h1 className="edu-login-title">Welcome <em>back.</em></h1>
        <p className="edu-login-sub">Sign in to continue with your learning family.</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="edu-login-error">{error}</div>}

          <div className="edu-login-field">
            <label className="edu-login-label" htmlFor="edu-login-email">Email</label>
            <input
              id="edu-login-email"
              className="edu-login-input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="edu-login-field">
            <label className="edu-login-label" htmlFor="edu-login-password">Password</label>
            <input
              id="edu-login-password"
              className="edu-login-input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
          </div>

          <button type="submit" className="edu-login-button" disabled={loading || !email || !password}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="edu-login-footer">
          New here? <a href="/education/checkout">Start your free trial →</a>
        </div>
      </div>
    </div>
  );
}
