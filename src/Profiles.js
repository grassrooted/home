import yaml from 'js-yaml';
import axios from 'axios';
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";

export async function getProfiles(query) {
  try {
    const response = await fetch('/profiles.yml');
    const yamlText = await response.text();
    let profiles = yaml.loadAll(yamlText);
    if (!profiles) profiles = [];
    if (query) {
      profiles = matchSorter(profiles, query, { keys: ["name", "city", "district"] });
    }
  return profiles.sort(sortBy("city", "district"));
  } catch (error) {
    console.error('Error fetching or parsing YAML file:', error);
  }  
}

export async function getProfile(id) {
    const profiles = await getProfiles()
    let profile = profiles.find(profile => profile.id === id);
    let data = null
    let res = null
    try {
        const jsonFilePath = profile.path_to_contributions_data;

        const jsonResponse = await axios.get(jsonFilePath);
        data = jsonResponse.data;
        res = Array.from(new Set(data.map(JSON.stringify)))
               .map(JSON.parse);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    return res
}

// ERROR BC WE AREN'T LOADING PROFILE DATA CORRECTLY ****NEED TO AWAIT THE GETPROFILE COMPLETION****

export async function getProfilesForComparison() {
  const profiles = await getProfiles()
  const bulk_data = await Promise.all(
    profiles.map(async (profile) => {
      try {
        return await getProfile(profile.id)
      } catch (error) {
        console.error(`Failed to load data for ${profile.name}`)
        return null
      }
    })
  ).then(results => results.filter(result => result !== null));

  return bulk_data
}