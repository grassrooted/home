import "../main.css";
import { useLoaderData, NavLink } from "react-router-dom";
import CityCard from '../CityCard';
import MainBanner from '../MainBanner';
import Footer from '../Footer';

export default function Main() {
  const { cities } = useLoaderData();
  return (
      <div className="main-container">
        <MainBanner />

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
        <Footer />
      </div>
  );
  }