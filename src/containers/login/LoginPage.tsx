import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./LoginPage.module.css";

function LoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  let navigate = useNavigate();

  const handleLogin = async () => {
    let isValid = true;
    if (!name.trim()) {
      setNameError("Name is required");
      isValid = false;
    } else {
      setNameError("");
    }

    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!isValid) return;

    try {
      const response = await axios.post(
        "https://frontend-take-home-service.fetch.com/auth/login",
        {
          name: name,
          email: email,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        navigate("/home");
      }
    } catch (error) {
      console.error("Failed to login:", error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.title}>Fetch</h2>
      <h2 className={styles.subHeader}>Dog Adoption</h2>
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.inputField}
          />
          {nameError && <div className={styles.error}>{nameError}</div>}
        </div>
        <div className={styles.inputWrapper}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.inputField}
          />
          {emailError && <div className={styles.error}>{emailError}</div>}
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <button onClick={handleLogin} className={styles.loginButton}>
          Login
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
