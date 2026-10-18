import React, { useState, useEffect } from "react";
import { auth } from "../src/Firebase";
import "./App.css";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 1. Capture the user credential result from the login promise
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const loggedInUser = userCredential.user;

      setEmail("");
      setPassword("");
      setError("");

      alert("You have been signed in!!");

      // 2. Use 'loggedInUser' instead of 'user' state, and use 'email' or 'displayName'
      console.log("Logged in user email:", loggedInUser.email);
      console.log("Logged in user display name:", loggedInUser.displayName); // Will be null unless set during signup
    } catch (error) {
      setError(error.message);
      alert(error.message);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="Auth-Div">
      <form onSubmit={handleLogin} className="Login-form">
        <label style={{ backgroundColor: "transparent" }} htmlFor="nameField">
          Email
        </label>
        <input
          type="email" /* Changed to type="email" for proper validation */
          name="nameField"
          id="nameField"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label
          style={{ backgroundColor: "transparent" }}
          htmlFor="passwordField"
        >
          Password
        </label>
        <input
          type="password" /* Changed to type="password" so the text is hidden while typing */
          name="passwordField"
          id="passwordField"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p role="error">{error}</p>}
    </div>
  );
}

export default Auth;
