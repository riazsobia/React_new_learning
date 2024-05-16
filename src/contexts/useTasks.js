import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCurrentUser } from '../contexts/CurrentUserContext';

const useTasks = (searchTerm) => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const currentUser = useCurrentUser();

  useEffect(() => {
    const getUsers = async () => {
      const response = await axios.get('https://rest-api-project5.herokuapp.com/todo/users/');
      const usersData = response.data.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
      setUsers(usersData);
    };
    getUsers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const getTasks = async () => {
        try {
          const url = `https://rest-api-project5.herokuapp.com/todo/task-list/?search=${searchTerm}&page=${currentPage}`;
          const res = await axios.get(url);
          const results = res.data.results;
          setTotalPages(Math.ceil(res.data.count / 100));
          setTasks(results);
        } catch (error) {
          setError('Could not fetch tasks');
        }
      };

      getTasks();
    }
  }, [currentUser, searchTerm, currentPage]);

  const changePage = (newPage) => {
    setCurrentPage(newPage);
  };

  return { tasks, error, users, totalPages, currentPage, changePage };
};

export default useTasks;