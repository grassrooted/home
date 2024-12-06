import '../index.css';
import { Outlet } from "react-router-dom";

function CityLayout() {

    return (
        <div>
            <Outlet />
        </div>
    );
}
  
  export default CityLayout;
  
  
  