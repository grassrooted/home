import { Outlet, NavLink, useLoaderData, Form } from "react-router-dom";
import { getProfiles } from "../Profiles";
import { getCities } from "../Cities";

export async function loader({request}) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const profiles = await getProfiles(q);
    const cities = await getCities(q);
    return { profiles, cities}
}

export default function Root() {
    const { profiles } = useLoaderData();
    return (
      <>
        <div id="sidebar">
          <h1>Texas Campaign Finance Directory</h1>
          <div>
            <Form id="search-form" role="search">
              <input
                id="q"
                aria-label="Search profiles"
                placeholder="Search"
                type="search"
                name="q"
              />
              <div
                id="search-spinner"
                aria-hidden
                hidden={true}
              />
              <div
                className="sr-only"
                aria-live="polite"
              ></div>
            </Form>
            <NavLink to={``} className='home-button'>
              <img alt="home icon" className="home-button-icon" src="org-icon.png"></img>
            </NavLink>
          </div>
          <nav>
            {profiles.length ? (
                <ul>
                {profiles.map((profile) => (
                    <li key={profile.id}>
                      <NavLink 
                        to={`profiles/${profile.id}`}
                        className={({ isActive, isPending }) =>
                          isActive
                            ? "active"
                            : isPending
                            ? "pending"
                            : ""
                        } 
                      >
                          {profile.name ? (
                          <>
                              <div className="nav-name-container">
                                <strong>{profile.name}</strong>
                              </div> {profile.city} - District {profile.district}
                          </>
                          ) : (
                          <i>Incorrectly Configured Council Profile</i>
                          )}
                      </NavLink>
                    </li>
                ))}
                </ul>
            ) : (
                <p>
                <i>No profiles</i>
                </p>
            )}
          </nav>
        </div>
        <div id="detail">
            <Outlet />
        </div>
      </>
    );
  }