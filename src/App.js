import styles from "./App.module.css";
import NavBar from "./components/NavBar";
import Container from "react-bootstrap/Container";
import { Route, Switch } from "react-router-dom";
import './api/axiosDefault'
import SignInForm from "./pages/auth/SignInForm";
import ToDoList from "./pages/posts/ToDoList"
import CreateTask from "./pages/posts/CreateTask";
import SearchToDoList from "./pages/posts/SearchToDoList";
import HomePage from "./pages/posts/HomePage";
import AdminCreateUser from "./pages/auth/AdminCreateUser";

function App() {
  return (
    <div className={styles.App}>
      <NavBar />
      <Container className={styles.Main}>
        <Switch>
          <Route exact path="/" render={() => <HomePage />} />
          <Route exact path="/signin" render={() => <SignInForm />} />
          <Route exact path="/todolist" render={() => <ToDoList /> } />
          <Route exact path="/createtask" render={() => <CreateTask /> } />
          <Route exact path="/searchuser" render={() => <SearchToDoList />} />
          <Route exact path="/admin/create-user" render={() => <AdminCreateUser/>} />
          <Route render={() => <p>Page not found!</p>} />
        </Switch>
      </Container>
    </div>
  );
}

export default App;