import React from 'react';
import todolistImage from '.././../assets/todolist.jpg';
import styles from '../../styles/HomePage.module.css';

function Home() {
  return (
    <div className={styles.home}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Welcome to Task Manager</h1>
        <p className={styles.text}>Manage your tasks and projects with ease</p>
        <p className={styles.text}>Please login top right to get access</p>
      </div>
      <div className={styles.imageContainer}>
        <img src={todolistImage} alt="todolistImage" className={styles.image} />
      </div>
        <p className={styles.text}>This taskmanager is restricted to example-company users only</p>
    </div>
  );
}

export default Home;