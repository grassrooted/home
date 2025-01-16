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
        profile.contributions = res;
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    return profile
}