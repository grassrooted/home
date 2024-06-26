import React from 'react';
import "./Header.css";

function Header() {
  return (
    <div className="section">
        <h1>
            Texas Campaign Finance Directory
        </h1>
        <button><a href="https://campfin.dallascityhall.com/">Data Source</a></button>
        <button><a href="https://www.arcgis.com/apps/View/index.html?appid=060ca78d086f4b5e91cc8ec866fdbe55"> Find My District  </a></button>
    </div>
  );
}

export default Header;


