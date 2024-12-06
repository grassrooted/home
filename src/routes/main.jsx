import "../main.css";
import { useLoaderData, NavLink } from "react-router-dom";
import CityCard from '../CityCard';


export default function Index() {
  const { cities } = useLoaderData();
  console.log(cities)
  return (
      <div className="main-container">
        <div className="main-banner">
          <img alt="home icon" id="home-icon" src="org-icon.png"></img>
          <h1>Texas Campaign Finance Directory</h1>
        </div>

        <div id="city-stream">
        {cities.length ? (
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
                          <>
                              <div>
                                <strong>{city.name}</strong>
                                <CityCard name={city.name}  coverPhoto={city.cover_photo}/>
                              </div>
                          </>
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