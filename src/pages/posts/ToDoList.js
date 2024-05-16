import React, { useState, useEffect, useCallback } from 'react';
import useDebounce from '../../contexts/useDebounce';
import styles from '../../styles/ToDoList.module.css';
import btnStyles from "../../styles/Button.module.css";
import { useDownloadAttachment, CATEGORIES_DICT } from '../../hooks/hooks';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';
import axios from 'axios';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { Select } from 'antd';
import DatePicker from 'antd/lib/date-picker';
import moment from 'moment';
const { Option } = Select;


const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState({});
  const [priorityFilter, setPriorityFilter] = useState(0); // default to no filter
  const [sortOrder, setSortOrder] = useState('asc'); // default to ascending order
  const [sortField, setSortField] = useState('priority'); // default to sorting by priority
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState(-1);
  const downloadAttachment = useDownloadAttachment();
  // eslint-disable-next-line
  const [dueDate, setDueDate] = useState('');
  
  // Add a 300ms delay in search
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Add a 300ms delay in search

  // Reset the current page to the first page
  const resetPageToFirst = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Determine if a task is overdue
  const isTaskOverdue = (task) => {
    if (task.completed) {
      return false;
    }

    const today = new Date();
    const taskDueDate = new Date(task.due_date);
    return taskDueDate < today;
  };

  // Change the current page
  const changePage = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);
  

// Update tasks

  const updateTask = useCallback(async (taskId, completedPercentage, category) => {
    try {
      completedPercentage = Math.max(0, Math.min(100, completedPercentage)); // Constrain completedPercentage to between 0 and 100
      const completed = completedPercentage === 100 ? true : false; // Set completed to true if completedPercentage is 100, otherwise false
      const response = await axios.put(
        `https://rest-api-project5.herokuapp.com/todo/task-update/${taskId}/`,
        { completed_percentage: completedPercentage, completed: completed, category: category }
      );

      // Update the tasks state with the updated task
      setTasks(tasks => tasks.map(task => task.id === taskId ? response.data : task));
    } catch (error) {
      console.error(error);
      setError('Could not update task');
    }
  }, []);

  // Update the assignedTo field of a task
  const updateAssignedTo = useCallback(async (taskId, assignedTo) => {
    try {
      const response = await axios.put(
        `https://rest-api-project5.herokuapp.com/todo/task-update/${taskId}/`,
        { assigned_to: assignedTo }
      );
      // Update the tasks state with the updated task
      setTasks(tasks => tasks.map(task => task.id === taskId ? response.data : task));
    } catch (error) {
      console.error(error);
      setError('Could not update task');
    }
  }, []);

  // Update priority of the task
  const updatePriority = useCallback(async (taskId, priority) => {
    try {
      const response = await axios.put(
        `https://rest-api-project5.herokuapp.com/todo/task-update/${taskId}/`,
        { priority: priority }
      );
      // Update the tasks state with the updated task
      setTasks(tasks => tasks.map(task => task.id === taskId ? response.data : task));
    } catch (error) {
      console.error(error);
      setError('Could not update task');
    }
  }, []);


  // Delete task
  const deleteTask = useCallback(async (taskId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#222635',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `https://rest-api-project5.herokuapp.com/todo/task-delete/${taskId}/`
          );
  
          // Remove the deleted task from the tasks state
          setTasks(tasks => tasks.filter(task => task.id !== taskId));
  
          Swal.fire(
            'Deleted!',
            'Your task has been deleted.',
            'success'
          );
        } catch (error) {
          console.error(error);
          setError('Could not delete task');
        }
      }
    });
  }, []);


  // Update category state
  const updateCategory = useCallback(async (taskId, category) => {
    updateTask(taskId, null, category);
  }, [updateTask]);

  // Update due date
  const updateDueDate = useCallback(async (taskId, dueDate) => {
    try {
      const response = await axios.put(
        `https://rest-api-project5.herokuapp.com/todo/task-update/${taskId}/`,
        { due_date: dueDate }
      );
      // Update the tasks state with the updated task
      setTasks(tasks => tasks.map(task => task.id === taskId ? response.data : task));
    } catch (error) {
      console.error(error);
      setError('Could not update task');
    }
  }, []);

  const onDueDateChange = (taskId, date, dateString) => {
    setDueDate(dateString);
    updateDueDate(taskId, dateString);
  };
  

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

    if (currentUser) {
      //Fetch tasks from the API and update the tasks state.
      const getTasks = async () => {
        try {
          
          const response = await axios.get(`https://rest-api-project5.herokuapp.com/todo/task-list/?assigned_to=${currentUser.pk}&page=${currentPage}&search=${debouncedSearchTerm}`);
          setTasks(response.data.results);
          setTotalPages(Math.ceil(response.data.count / 100));
        } catch (error) {
          console.error(error);
          setError('Could not fetch tasks');
        }
      };

      getTasks();
    }
  }, [currentUser, currentPage, debouncedSearchTerm]);

  if (error) return <p>{error}</p>;

  const completedTasks = showCompletedTasks ? tasks : tasks.filter(task => !task.completed);

  // Function to get the attachment name from the URL
  const getAttachmentNameFromUrl = (url) => {
    if (!url) return null;
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
  };

  // apply priority filter if set
  const filteredTasks = priorityFilter > 0
    ? completedTasks.filter(task => task.priority === priorityFilter)
    : completedTasks;

  const filteredTasksByCategory = categoryFilter > -1
    ? filteredTasks.filter(task => task.category === categoryFilter)
    : filteredTasks;

  // apply search term filter
  const filteredTasksByTitle = filteredTasksByCategory
  .filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase()))
  .sort((a, b) => {
    const sortOrderMultiplier = sortOrder === 'asc' ? 1 : -1;

    if (sortField === 'priority') {
      return sortOrderMultiplier * (a.priority - b.priority);
    } else if (sortField === 'due_date') {
      return sortOrderMultiplier * (new Date(a.due_date) - new Date(b.due_date));
    }

    return 0;
  });

  return (
    <div>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={event => setSearchTerm(event.target.value)}
        />
      </div>
      <div className={styles.filtersContainer}>
        <div className={styles.priorityFilter}>
          <label>Priority filter:</label>
              <select
            value={priorityFilter}
            onChange={event => {
              setPriorityFilter(parseInt(event.target.value));
              resetPageToFirst();
            }}
          >
            <option value={0}>No filter</option>
            {[1, 2, 3, 4, 5].map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
        <div className={styles.sortOrder}>
          <label>Sort by:</label>
          <select
          value={sortField}
          onChange={event => {
            setSortField(event.target.value);
            resetPageToFirst();
          }}
        >
            <option value="priority">Priority</option>
            <option value="due_date">Due date</option>
          </select>
        </div>
        <div className={styles.sortOrder}>
          <label>Sort:</label>
          <select
            value={sortOrder}
            onChange={event => {
              setSortOrder(event.target.value);
              resetPageToFirst();
            }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div className={styles.categoryFilter}>
          <label>Category filter:</label>
          <select
              value={categoryFilter}
              onChange={event => {
                setCategoryFilter(parseInt(event.target.value));
                resetPageToFirst();
              }}
            >
            <option value={-1}>No filter</option>
            {Object.keys(CATEGORIES_DICT).map(categoryId => (
              <option key={categoryId} value={parseInt(categoryId)}>
                {CATEGORIES_DICT[categoryId]}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filter}>
          <label htmlFor="showCompletedTasks">Show completed tasks:</label>
          <input
              type="checkbox"
              id="showCompletedTasks"
              checked={showCompletedTasks}
              onChange={event => {
                setShowCompletedTasks(event.target.checked);
                resetPageToFirst();
              }}
            />
        </div>
      </div>
      <p>Total tasks: {filteredTasksByTitle.length}</p>
      <div className={styles.paginationControls}>
        <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
      <ul className={styles.taskList}>
        {filteredTasksByTitle.length > 0 ? (
          filteredTasksByTitle.map(task => (
            <li
              key={task.id}
              className={`${styles.task} ${isTaskOverdue(task) ? styles.overdue : ''}`}
            >
              <h3 className={styles.taskTitle}>{task.title}</h3>
              <p className={styles.taskContent}>{task.content}</p>
              <p className={styles.taskDueDate}>
                <strong>Due Date:</strong>
                <br />
                {task.due_date}
              </p>
              {isTaskOverdue(task) && (
                <p className={styles.overdueText}>Task is overdue!</p>
              )}
              <label>Change Due Date:</label>
              <DatePicker
                  onChange={(date, dateString) => onDueDateChange(task.id, date, dateString)}
                  disabledDate={(current) => {
                    return current && current < moment().startOf('day');
                  }}
                  required
                />


              <div className={styles.taskAssignedTo}>
                <label><strong>Assigned to:</strong></label>
                <Select
                  value={task.assigned_to}
                  onChange={newAssignedTo => updateAssignedTo(task.id, newAssignedTo)}
                >
                  {Object.values(users).map(user => (
                    <Option key={user.id} value={user.id}>{user.username}</Option>
                  ))}
                </Select>
              </div>
              <div className={styles.taskCategory}>
              <label><strong>Category:</strong></label>
              <Select
                value={task.category}
                onChange={newCategory => updateCategory(task.id, newCategory)}
              >
                {Object.keys(CATEGORIES_DICT).map(categoryId => (
                  <Option key={categoryId} value={parseInt(categoryId)}>
                    {CATEGORIES_DICT[categoryId]}
                  </Option>
                ))}
              </Select>
            </div>
              <div className={styles.taskPriority}>
                <label><strong>Priority:</strong></label>
                <Select
                  value={task.priority}
                  onChange={newPriority => updatePriority(task.id, newPriority)}
                >
                  {[1, 2, 3, 4, 5].map(value => (
                    <Option key={value} value={value}>{value}</Option>
                  ))}
                </Select>
              </div>
              <div className={styles.taskAttachment}> <p><strong>Attachments:<br /></strong></p>
                {task.attachments ? (
                  <div className={styles.taskAttachment}>
                    <p>{getAttachmentNameFromUrl(task.attachments) || 'No name'}</p>
                    <a href={task.attachments} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                    <br />
                    <button
                    onClick={() => downloadAttachment(task.attachments, getAttachmentNameFromUrl(task.attachments))}
                    className={btnStyles.downloadButton}
                  >
                    Download
                  </button>
                  </div>
                ) : (
                  <p>No attachment</p>
                )}
              </div>
              <div className={styles.taskProgress}>
                <div className={styles.taskProgressLabel}><strong>Percent completed:</strong></div>
                <div className={styles.taskProgressBarContainer}>
                  <div
                    className={styles.taskProgressBar}
                    style={{ width: `${Math.max(task.completed_percentage, 5)}%` }}
                  />
                  <div className={styles.taskProgressValue}>{task.completed_percentage}%</div>
                  <button className={btnStyles.taskProgressButton} onClick={() => updateTask(task.id, task.completed_percentage - 10)}>
                    -10%
                  </button>
                  <button className={btnStyles.taskProgressButton} onClick={() => updateTask(task.id, task.completed_percentage + 10)}>
                    +10%
                  </button>
                </div>
              </div>
              <p className={styles.taskCompleted}><strong>Completed:</strong><br />{task.completed ? 'Yes' : 'No'}</p>
              <button className={btnStyles.taskDeleteButton} onClick={() => deleteTask(task.id)}>
              Delete Task
            </button>
            </li>
          ))
        ) : (
          <p>No tasks to show</p>
        )}
      </ul>
      <div className={styles.paginationControls}>
        <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default TodoList;