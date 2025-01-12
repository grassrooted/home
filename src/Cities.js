import yaml from 'js-yaml';
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";
import { getProfile, getProfiles } from './Profiles';


export async function getCities(query) {
  try {
    const response = await fetch('/cities.yml');
    const yamlText = await response.text();
    let cities = yaml.loadAll(yamlText);
    if (!cities) cities = [];
    if (query) {
      cities = matchSorter(cities, query, { keys: ["name"] });
    }
  return cities.sort(sortBy("name"));
  } catch (error) {
    console.error('Error fetching or parsing YAML file:', error);
  }  
}


export async function getCityProfiles(cityId) {
  const profiles = await getProfiles()
  const city_profiles = profiles.filter(profile => profile.city.replace(/\s+/g, '') === cityId)
  const bulk_data = await Promise.all(
    city_profiles.map(async (profile) => {
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

