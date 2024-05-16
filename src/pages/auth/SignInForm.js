import React, { useState } from "react";
import axios from "axios";

import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

import { useHistory } from "react-router-dom";

import styles from "../../styles/SignInUpForm.module.css";
import btnStyles from "../../styles/Button.module.css";
import appStyles from "../../App.module.css";
import { useSetCurrentUser } from "../../contexts/CurrentUserContext";

// SignInForm component allows users to sign in using their username and password
function SignInForm() {
  const setCurrentUser = useSetCurrentUser();

  const [signInData, setSignInData] = useState({
    username: "",
    password: "",
  });
  const { username, password } = signInData;

  const [errors, setErrors] = useState({});

  const history = useHistory();

  // handleSubmit handles form submission by making an API call to sign in the user
  // and storing the received token in localStorage, then setting the current user
  // and redirecting to the homepage
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const { data } = await axios.post("/dj-rest-auth/login/", signInData);
      // Store the token in localStorage or any other preferred storage
      localStorage.setItem("authToken", data.key);
  
      setCurrentUser(data.user);
      history.push("/");
    } catch (err) {
      setErrors(err.response?.data);
    }
  };
  
  // handleChange updates the signInData state when the user inputs data in the form fields
  const handleChange = (event) => {
    setSignInData({
      ...signInData,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-5">
      <Container
        className={`${appStyles.Content} p-4 ${styles.SignInForm}`}
        style={{ width: "500px" }}
      >
        <h1 className={`${styles.Header} mb-4`}>Sign in</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="username">
            <Form.Label className="d-none">Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Username"
              name="username"
              className={styles.Input}
              value={username}
              onChange={handleChange}
            />
          </Form.Group>
          {errors.username?.map((message, idx) => (
            <Alert key={idx} variant="warning">
              {message}
            </Alert>
          ))}

          <Form.Group controlId="password">
            <Form.Label className="d-none">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              name="password"
              className={styles.Input}
              value={password}
              onChange={handleChange}
            />
          </Form.Group>
          {errors.password?.map((message, idx) => (
            <Alert key={idx} variant="warning">
              {message}
            </Alert>
          ))}
          <Button
            className={`${btnStyles.Button} ${btnStyles.Wide} ${btnStyles.Bright}`}
            type="submit"
            style={{ paddingTop: "10px" }}
          >
            Sign in
          </Button>
          {errors.non_field_errors?.map((message, idx) => (
            <Alert key={idx} variant="warning" className="mt-3">
              {message}
            </Alert>
          ))}
        </Form>
      </Container>
    </div>
  );
}

export default SignInForm;