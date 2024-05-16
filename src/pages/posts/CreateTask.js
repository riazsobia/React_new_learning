import React, { useState, useContext, useEffect } from 'react';
import styles from '../../styles/CreateTask.module.css';
import btnStyles from "../../styles/Button.module.css";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';

import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import Checkbox from 'antd/lib/checkbox';
import DatePicker from 'antd/lib/date-picker';

import axios from 'axios';
import { CurrentUserContext } from '../../contexts/CurrentUserContext';
import moment from 'moment';


const { Option } = Select;

// CreateTask component allows users to create a new task with various properties
const CreateTask = () => {
  const currentUser = useContext(CurrentUserContext);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    due_date: '',
    created_by: currentUser?.pk,
    assigned_to: '',
    category: '',
    priority: '',
    attachments: null, 
    completed: false,
    completed_percentage: 0,
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('https://rest-api-project5.herokuapp.com/todo/users/')
      .then(res => {
        setUsers(res.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  // onFormChange updates the formData state when the user inputs data in the form fields
  const onFormChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // onDueDateChange updates the formData state when the user selects a due date
  const onDueDateChange = (date, dateString) => {
    setFormData({
      ...formData,
      due_date: dateString,
    });
  };

  // onCategoryChange updates the formData state when the user selects a category
  const onCategoryChange = (value) => {
    setFormData({ ...formData, category: value });
  };

  // onPriorityChange updates the formData state when the user selects a priority
  const onPriorityChange = (value) => {
    setFormData({ ...formData, priority: value });
  };

  // onAssignedToChange updates the formData state when the user selects an assignee
  const onAssignedToChange = (value) => {
    setFormData({ ...formData, assigned_to: value });
  };

  // onCompletedChange updates the formData state when the user toggles the "completed" checkbox
  const onCompletedChange = (event) => {
    setFormData({ ...formData, completed: event.target.checked });
  };

  // onCompletedPercentageChange updates the formData state when the user inputs a completion percentage
  const onCompletedPercentageChange = (event) => {
    setFormData({ ...formData, completed_percentage: event.target.value });
  };

  // onAttachmentChange updates the formData state when the user selects a file to attach
  const onAttachmentChange = (event) => {
    const file = event.target.files[0];
    const fileName = file.name; 
    setFormData({ ...formData, attachments: file, fileName: fileName }); 
  };

   // Validation fields to confirm all fields are filled out 
  const validateFields = () => {
    const { title, content, assigned_to, category, priority, due_date } = formData;
  
    if (!title || !content || !assigned_to || !category || !priority || !due_date) {
      return false;
    }
  
    return true;
  };

  // onFormSubmit handles form submission by performing validation, displaying appropriate alerts,
  // and making an API call to create a new task with the provided data
  const onFormSubmit = (event) => {
    event.preventDefault();
    
    if (!validateFields()) {
      // show error message
      Swal.fire({
        title: 'Error!',
        text: 'Please fill out all the fields.',
        icon: 'error',
        confirmButtonColor: '#222635',
        confirmButtonText: 'OK',
      });
      return;
    }
  
    const form = new FormData();
    form.append('title', formData.title);
    form.append('content', formData.content);
    form.append('due_date', formData.due_date);
    form.append('created_by', currentUser?.pk);
    form.append('assigned_to', formData.assigned_to);
    form.append('category', formData.category);
    form.append('priority', formData.priority);
    form.append('completed', formData.completed);
    form.append('completed_percentage', formData.completed_percentage);
    if (formData.attachments) {
      form.append('attachments', formData.attachments, formData.fileName); // Use formData.fileName to set the filename
    }
  
    axios.post('https://rest-api-project5.herokuapp.com/todo/task-create/', form, {
      headers: {
        'Content-Type': 'multipart/form-data; boundary=<calculated when request is sent>'
      }
    })
    .then((result) => {
      Swal.fire({
        title: 'Submitted successfully!',
        icon: 'success',
        confirmButtonColor: '#222635',
        confirmButtonText: 'OK',
      });
      // reset the form data
      setFormData({
        title: '',
        content: '',
        due_date: '',
        created_by: currentUser?.pk,
        assigned_to: '',
        category: '',
        priority: '',
        attachments: null,
        completed: false,
        completed_percentage: 0,
      });
    }).catch((error) => {
      console.error('Error creating task:', error);
      // show error message
      Swal.fire({
        title: 'Error!',
        text: 'An error occurred while submitting the task. Please try again later.',
        icon: 'error',
        confirmButtonColor: '#222635',
        confirmButtonText: 'OK',
      });
    });
  };
  
  return (
    <div className={styles.formContainer}>
      <form onSubmit={onFormSubmit}>
        <label>Title:</label>
        <Input
          name="title"
          value={formData.title}
          onChange={onFormChange}
          required
        />
  
        <label>Content:</label>
        <Input.TextArea
          name="content"
          value={formData.content}
          onChange={onFormChange}
          required
        />
  
        <label>Due Date:</label>
        <DatePicker
          onChange={onDueDateChange}
          disabledDate={(current) => {
            return current && current < moment().startOf('day');
          }}
          required
        />
  
        <label>Created By:</label>
          <Input
            name="created_by"
            value={currentUser?.username}
            disabled
          />
  
          <label>Assigned To:</label>
          <Select
            name="assigned_to"
            value={formData.assigned_to}
            onChange={onAssignedToChange}
            required
          >
            {users.map(user => (
              <Option key={user.id} value={user.id}>{user.username}</Option>
            ))}
          </Select>
  
  
          <label htmlFor="attachments-input">
        Attachments: {formData.fileName && `(${formData.fileName})`}
        <button
                className={`${btnStyles.Button} ${btnStyles.Bright} ${styles.UploadButton}`}
                type="button"
                onClick={() => document.getElementById("attachments-input").click()}
              >
                Upload
              </button>
        <input
          id="attachments-input"
          name="attachments"
          type="file"
          onChange={onAttachmentChange}
          style={{ display: 'none' }}
        />
      </label>
  
          <label>Category:</label>
          <Select
            name="category"
            value={formData.category}
            onChange={onCategoryChange}
            required
          >
            <Option value="" disabled>
              -- Select a category --
            </Option>
            <Option value="0">Backend</Option>
            <Option value="1">Frontend</Option>
            <Option value="2">Database</Option>
            <Option value="3">Python</Option>
            <Option value="4">Javascript</Option>
          </Select>
  
          <label>Priority:</label>
          <Select
            name="priority"
            value={formData.priority}
            onChange={onPriorityChange}
            required
          >
            <Option value="" disabled>
              -- Select a Priority --
              </Option>
            <Option value={1}>1</Option>
            <Option value={2}>2</Option>
            <Option value={3}>3</Option>
            <Option value={4}>4</Option>
            <Option value={5}>5</Option>
          </Select>

          <label>Completed Percentage:</label>
          <Input
            name="completed_percentage"
            value={formData.completed_percentage}
            onChange={onCompletedPercentageChange}
            type="number"
            min="0"
            max="100"
          />
  
          <label>Completed:</label>
          <Checkbox
            name="completed"
            checked={formData.completed}
            onChange={onCompletedChange}
          />
  
  
          <input type="submit" value="Submit" className={`${btnStyles.Button} ${btnStyles.Wide} ${btnStyles.Bright}`} />
  
        </form>
      </div>
    );
  };
  
  export default CreateTask;