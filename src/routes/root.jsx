import { Outlet, Link, useLoaderData } from "react-router-dom";
import { getProfiles } from "../Profiles";

export async function loader() {
    const profiles = await getProfiles();
    return { profiles }
}

export default function Root() {
    const { profiles } = useLoaderData();
    return (
      <>
        <div id="sidebar">
          <h1>Profiles - Dallas City Council</h1>
          <div>
            <form id="search-form" role="search">
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
            </form>
            <form method="post">
              <button type="submit">New</button>
            </form>
          </div>
          <nav>
            {profiles.length ? (
                <ul>
                {profiles.map((profile) => (
                    <li key={profile.id}>
                    <Link to={`profiles/${profile.id}`}>
                        {profile.name ? (
                        <>
                            {profile.name}
                        </>
                        ) : (
                        <i>No Name</i>
                        )}
                    </Link>
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