import React, { useEffect, useState } from 'react';
import yaml from 'js-yaml';
import ProfileSnapshot from './ProfileSnapshot';
import Header from './Header';

function App() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const fetchYamlData = async () => {
      try {
        const response = await fetch('/profiles.yml');
        const yamlText = await response.text();
        const docs = yaml.loadAll(yamlText);
        setProfiles(docs);
      } catch (error) {
        console.error('Error fetching or parsing YAML file:', error);
      }
    };

    fetchYamlData();
  }, []);

  return (
    <div className="App">
      <Header />

      {profiles.map((profile, index) => (
        <ProfileSnapshot
          key={index}
          name={profile.name}
          firstElection={profile.first_election}
          nextElection={profile.next_election}
          district={profile.district}
          city={profile.city}
          headshotPath={profile.path_to_headshot_photo}
        />
      ))}
    </div>
  );
}

export default App;
