import "../main.css";
import { useOutletContext, NavLink } from "react-router-dom";
import CityCard from '../CityCard';
import PDFBoxParser from "../PDFBoxParser";

export default function Main() {
  const { cities } = useOutletContext();

  return (
    <div className="main-container">
      <PDFBoxParser />
      <div id="city-stream">
        {cities && cities.length ? (
          <ul>
            {cities.map((city) => (
              <li className="city-item" key={city.id}>
                <NavLink
                  to={`cities/${city.id}`}
                  className={({ isActive, isPending }) =>
                    isActive
                      ? "active"
                      : isPending
                      ? "pending"
                      : ""
                  }
                >
                  {city.name ? (
                    <div>
                      <CityCard name={city.name} coverPhoto={`${process.env.PUBLIC_URL}${city.cover_photo}`} />
                    </div>
                  ) : (
                    <i>Incorrectly Configured City</i>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            <i>No cities</i>
          </p>
        )}
      </div>
    </div>
  );
}
