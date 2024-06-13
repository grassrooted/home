function Header() {
  const headerStyle = {
    fontSize: "72px",
  }

  return (
    <div className="section">
        <h1 style={headerStyle}>
            Dallas Elections Watch
        </h1>
        <p>Data Source: <a href="https://campfin.dallascityhall.com/">Dallas City Hall</a></p>
        <p>Find My District: <a href="https://www.arcgis.com/apps/View/index.html?appid=060ca78d086f4b5e91cc8ec866fdbe55"> District Map </a></p>
    </div>
  );
}

export default Header;


