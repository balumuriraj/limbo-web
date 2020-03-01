import React from 'react';
import { Link } from 'react-router-dom';
import "./styles.scss"

function Menu() {
  return (
    <nav>
      <ul>
        <li className="title">Limbo</li>
        <li> <Link to="/">Home</Link> </li>
        <li> <Link to="/clip">Clip</Link> </li>
      </ul>
    </nav>
  );
}

export default Menu;