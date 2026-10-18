import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Firebase";
import App from "./App";
import Auth from "./Auth";

function Root() {
  const [authState, setAuthState] = useState({
    loading: true,
    user: null,
    error: null,
  });

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (user) => setAuthState({ loading: false, user, error: null }),
      (error) => {
        console.error("Error checking authentication:", error);
        setAuthState({
          loading: false,
          user: null,
          error: "Could not verify your sign-in. Please refresh and try again.",
        });
      },
    );
  }, []);

  if (authState.loading) {
    return <p>Checking sign-in...</p>;
  }

  if (authState.error) {
    return <p role="alert">{authState.error}</p>;
  }

  return authState.user ? <App currentUser={authState.user} /> : <Auth />;
}

export default Root;
