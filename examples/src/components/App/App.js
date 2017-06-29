import React, { Component } from 'react';
import { Link, Route } from 'react-router-dom';
import Basic from '../Basic';
import Pagination from '../Pagination';
import Combined from '../Combined';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <nav>
          <Link to="/basic">Basic</Link>
          <Link to="/pagination">Pagination</Link>
          <Link to="/combined">Combined</Link>
        </nav>
        <Route path="/basic" component={Basic} />
        <Route path="/pagination" component={Pagination} />
        <Route path="/combined" component={Combined} />
      </div>
    );
  }
}

export default App;
