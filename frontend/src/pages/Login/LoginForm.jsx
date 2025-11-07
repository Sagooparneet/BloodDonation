import { useState } from "react";
import "./LoginForm.css";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import API_BASE_URL from "../../config/api";

export default function LoginForm() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = credentials;

    if (!email || !password) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        if (data.user.usertype === "Admin") {
          toast.error("Please log in through the Admin Login page.");
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("usertype", data.user.usertype);
        localStorage.setItem("user", JSON.stringify(data.user));

        switch (data.user.usertype) {
          case "Donor":
            navigate("/donor-dashboard");
            break;
          case "Recipient":
            navigate("/recipient");
            break;
          case "Healthcare Provider":
            navigate("/healthcare-dashboard");
            break;
          default:
            toast.error("Unknown user type");
            return;
        }

        toast.success("Logged in successfully");
      } else {
        toast.warning(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred during login. Please try again later.");
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.warning("Enter your email to reset password");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Recovery email sent!");
        setShowForgot(false);
        setForgotEmail("");
      } else {
        toast.error(data.message || "Failed to send reset email");
      }
    } catch (err) {
      toast.error("Error sending reset email");
    }
  };

  return (
    <div className="login-container">
      <h2>Log In to Your Account</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={credentials.email}
          onChange={(e) =>
            setCredentials({ ...credentials, email: e.target.value })
          }
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={credentials.password}
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
          required
        />

        <button type="submit" className="login-btn">
          Log In
        </button>
      </form>

      <p className="forgot-password" onClick={() => setShowForgot(true)}>
        Forgot Password?
      </p>

      {showForgot && (
        <div className="modal">
          <div className="modal-content">
            <h3>Password Recovery</h3>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
            <button onClick={handleForgotPassword}>Send Reset Email</button>
            <button onClick={() => setShowForgot(false)}>Cancel</button>
          </div>
        </div>
      )}

      <p className="signup-redirect">
        Don’t have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
