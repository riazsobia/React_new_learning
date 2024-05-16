import React, { useState } from 'react';
import Swal from "sweetalert2";
import styles from '../../styles/AdminCreateUser.module.css';
import axios from 'axios';

// AdminCreateUser component allows administrators to create new user accounts
const AdminCreateUser = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');

  // validatePassword checks if the given password meets the required criteria
  const validatePassword = (password) => {
    // At least 8 characters long
    const minLength = 8;
    // At least one uppercase letter
    const hasUppercase = /[A-Z]/.test(password);
    // At least one lowercase letter
    const hasLowercase = /[a-z]/.test(password);
    // At least one digit
    const hasDigit = /\d/.test(password);
    // At least one special character
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
    return (
      password.length >= minLength &&
      hasUppercase &&
      hasLowercase &&
      hasDigit &&
      hasSpecialChar
    );
  };

  // validateForm checks if all required fields in the form are filled
  const validateForm = () => {
    return email && password && firstName && lastName && username;
  };

  // createUser handles the form submission, validating the input data,
  // making an API call to create a new user, and displaying success/error messages
  const createUser = async () => {
    if (!validateForm()) {
      Swal.fire({
        title: 'Error!',
        text: 'All fields are required.',
        icon: 'error',
        confirmButtonColor: '#222635',
        confirmButtonText: 'OK',
      });
      return;
    }
  
    if (!validatePassword(password)) {
      Swal.fire({
        title: 'Error!',
        text: 'Password does not meet the requirements. It should be at least 8 characters long, have at least one uppercase letter, one lowercase letter, one digit, and one special character.',
        icon: 'error',
        confirmButtonColor: '#222635',
        confirmButtonText: 'OK',
      });
      return;
    }
    try {
      const response = await axios.post('https://rest-api-project5.herokuapp.com/todo/users/create/', {
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName
      });
      console.log(response.data);
      // Display success message
      Swal.fire({
        title: 'User created successfully!',
        icon: 'success',
        confirmButtonColor: '#222635',
        confirmButtonText: 'OK',
      });
  
      // Clear the form fields
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setUsername('');
    } catch (error) {
      console.error(error);
      const errorDetails = error.response.data;
  
      let errorMessage = '';
      if (error.response.status === 403) {
        errorMessage = 'You do not have permission to create a user.';
      } else {
        for (const key in errorDetails) {
          errorMessage += `${key}: ${errorDetails[key].join(', ')}\n`;
        }
      }
  
      Swal.fire({
        title: 'Error!',
        text: `An error occurred while creating the user. Details:\n${errorMessage}`,
        icon: 'error',
        confirmButtonColor: '#222635',
        confirmButtonText: 'OK',
      });
    }
  };
  
  
  
  

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create a new user</h1>
      
      <label htmlFor="username" className={styles.label}>Username</label>
      <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className={styles.input} />
      
      <label htmlFor="email" className={styles.label}>Email</label>
      <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} />
      
      <label htmlFor="firstName" className={styles.label}>First Name</label>
      <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={styles.input} />
      
      <label htmlFor="lastName" className={styles.label}>Last Name</label>
      <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className={styles.input} />

      <label htmlFor="password" className={styles.label}>Password</label>
      <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} />
      
      <button onClick={createUser} className={styles.button}>Create User</button>
    </div>
  );  
};

export default AdminCreateUser;