import { Outlet } from "react-router-dom";
import { getProfiles } from "../Profiles";
import { getCities } from "../Cities";
import MainBanner from "../MainBanner";
import Footer from "../Footer";
import { useLoaderData } from "react-router-dom";


export async function loader({request}) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const profiles = await getProfiles(q);
    const cities = await getCities(q);
    return { profiles, cities}
}

export default function Root() {
  const { cities, profiles } = useLoaderData();

    return (
      <>
        <div id="detail">

            <MainBanner 
              cities={cities}
              profiles={profiles} />
            <div id="content">
              <Outlet />
            </div>
            <Footer />
        </div>
      </>
    );
  }