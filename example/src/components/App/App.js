import React, { Component } from 'react';
import { Link, Route } from 'react-router-dom';
import Posts from '../Posts';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <nav>
          <Link to="/posts">Posts</Link>
        </nav>
        <Route path="/posts" component={Posts} />
      </div>
    );
  }
}

export default App;
