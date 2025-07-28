import { Outlet } from "react-router-dom";
import { getProfiles } from "../Profiles";
import { getCities } from "../Cities";
import MainBanner from "../MainBanner";
import Footer from "../Footer";
import React, { useEffect, useState } from 'react';
import '../index.css';

export default function Root() {
  const [cities, setCities] = useState(null);
  const [profiles, setProfiles] = useState(null);

  useEffect(() => {
    async function rootLoader() {
      try {
        const profiles = await getProfiles();
        const cities = await getCities();

        setProfiles(profiles);
        setCities(cities);
      } catch (error) {
        console.error("Failed to load data:", error);
      }

    }
    rootLoader();
  }, []);

  return (
    <>
      <div id="detail">
        <MainBanner cities={cities} profiles={profiles} />
        <div id="content">
          <Outlet context={{ cities, profiles }} />
        </div>
        <Footer />
      </div>
    </>
  );
}
