import { Outlet } from "react-router-dom";
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
    return (
      <>
        <div id="detail">
            <Outlet />
        </div>
      </>
    );
  }