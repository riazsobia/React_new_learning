import React, { useState } from 'react';
import useDebounce from '../../contexts/useDebounce';
import useTasks from '../../contexts/useTasks';
import styles from '../../styles/SearchToDoList.module.css';
import btnStyles from "../../styles/Button.module.css";

import { CATEGORIES_DICT, useDownloadAttachment } from '../../hooks/hooks';


// SearchToDoList component: Allows users to search, filter, and sort a list of tasks for all users
const SearchToDoList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [priorityFilter, setPriorityFilter] = useState(0);
  const [assignedToFilter, setAssignedToFilter] = useState(0);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortField, setSortField] = useState('priority');
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(0);
  const downloadAttachment = useDownloadAttachment();


  // Hooks to fetch tasks, error, users, totalPages, and currentPage
  const { tasks, error, users, totalPages, currentPage, changePage } = useTasks(debouncedSearchTerm);


  // Function to filter and sort tasks based on user-selected criteria
  const filterAndSortTasks = (taskList) => {
    let filteredTasks = showCompletedTasks ? taskList : taskList.filter(task => !task.completed);
  
    if (priorityFilter > 0) {
      filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }
  
    if (assignedToFilter > 0) {
      filteredTasks = filteredTasks.filter(task => task.assigned_to === assignedToFilter);
    }
  
    if (categoryFilter > 0) {
      filteredTasks = filteredTasks.filter(task => task.category === categoryFilter);
    }
  
    const sortedTasks = filteredTasks.sort((a, b) => {
      const fieldToSortBy = sortField === 'category'
        ? task => CATEGORIES_DICT[task.category]
        : task => task[sortField];
  
      const valA = fieldToSortBy(a);
      const valB = fieldToSortBy(b);
  
      if (valA > valB) {
        return sortOrder === 'asc' ? 1 : -1;
      } else if (valB > valA) {
        return sortOrder === 'asc' ? -1 : 1;
      } else {
        return 0;
      }
    });
  
    return sortedTasks.map(task => ({
      ...task,
      is_overdue: isTaskOverdue(task),
    }));
  };
  
  // Function to check if a task is overdue
  const isTaskOverdue = (task) => {
    if (task.completed) {
      return false;
    }
  
    const today = new Date();
    const taskDueDate = new Date(task.due_date);
    return taskDueDate < today;
  };
  
  // Function to get the attachment name from the URL
  const getAttachmentNameFromUrl = (url) => {
    if (!url) return null;
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
  };

  // Get sorted tasks based on filter and sort criteria
  const sortedTasks = filterAndSortTasks(tasks);

  // Return error message if there's an error fetching tasks
  if (error) return <p>{error}</p>;

    return (
      
      <div className={styles.todoList}>
        <h1>Users Task List</h1>
        <div className={styles.filters}>
          <div className={styles.filter}>
            <label htmlFor="search">Search:</label>
            <input type="text" id="search" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} />
          </div>
          <div className={styles.filter}>
            <label htmlFor="priority">Priority:</label>
            <select id="priority" value={priorityFilter} onChange={event => setPriorityFilter(Number(event.target.value))}>
              <option value="0">No filter</option>
              {[1, 2, 3, 4, 5].map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
          <div className={styles.filter}>
            <label htmlFor="assignedTo">Assigned to:</label>
            <select id="assignedTo" value={assignedToFilter} onChange={event => setAssignedToFilter(Number(event.target.value))}>
              <option value="0">No filter</option>
              {Object.values(users).map(user => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </select>
          </div>
          <div className={styles.filter}>
            <label htmlFor="sortField">Sort by:</label>
            <select id="sortField" value={sortField} onChange={event => setSortField(event.target.value)}>
              <option value="priority">Priority</option>
              <option value="due_date">Due Date</option>
              <option value="category">Category</option>
              <option value="assigned_to">Assigned To</option>
            </select>
          </div>
          <div className={styles.filter}>
            <label htmlFor="sortOrder">Sort order:</label>
            <select id="sortOrder" value={sortOrder} onChange={event => setSortOrder(event.target.value)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <div className={styles.filter}>
            <label htmlFor="category">Category:</label>
            <select id="category" value={categoryFilter} onChange={event => setCategoryFilter(Number(event.target.value))}>
              <option value="0">No filter</option>
              {Object.entries(CATEGORIES_DICT).map(([categoryId, categoryName]) => (
                <option key={categoryId} value={categoryId}>{categoryName}</option>
              ))}
            </select>
          </div>
          <div className={styles.filter}>
            <label htmlFor="showCompletedTasks">Show completed tasks:</label>
            <input type="checkbox" id="showCompletedTasks" checked={showCompletedTasks} onChange={event => setShowCompletedTasks(event.target.checked)} />
          </div>
        </div>
        <div className={styles.paginationControls}>
          <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.id}>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Priority</th>
              <th className={`${styles.dueDate} ${styles.dueDateHeader}`}>Due Date</th>
              <th>Category</th>
              <th>Assigned To</th>
              <th>Attachments</th>
              <th>Completed Percentage</th>
              <th>Task Completed</th>
            </tr>
          </thead>
        <tbody>
              {sortedTasks
                .filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(task => (
                  <tr key={task.id}>
                    <td className={styles.id}>{task.id}</td>
                    <td className={styles.title}>{task.title}</td>
                    <td className={styles.content}>{task.content}</td>
                    <td className={styles.priority}>{task.priority}</td>
                    <td className={`${styles.dueDate} ${task.is_overdue ? styles.overdue : ''}`}>{task.due_date}</td>
                    <td className={styles.category}>{CATEGORIES_DICT[task.category]}</td>
                    <td className={styles.assignedTo}>{users[task.assigned_to]?.username || 'Unassigned'}</td>
                    <td className={styles.taskAttachment}>
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
                  </td>
                    <td className={styles.completedPercentage}>{task.completed_percentage}%</td>
                    <td className={styles.completed}>{task.completed ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
            </tbody>
      </table>
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
export default SearchToDoList;