import yaml from 'js-yaml';
import axios from 'axios';
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";

export async function getProfil() {
    // Loop through all yaml docs and store each as a 'profile' object in a list of profiles and then return it
    
    // then follow this process here >> https://reactrouter.com/en/main/start/tutorial#creating-contacts
}

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
    //read all yaml docs until we find the given ID
        // Figure out how to handle what an 'ID' is
    //return the singluar contact
    //then follwo this process here >> https://reactrouter.com/en/main/start/tutorial#url-params-in-loaders
    const profiles = await getProfiles()
    let profile = profiles.find(profile => profile.id === id);
    let data = null
    let res = null
    try {
        // Extract the path to the JSON file
        const jsonFilePath = profile.path_to_contributions_data;

        // Fetch the JSON file
        const jsonResponse = await axios.get(jsonFilePath);
        data = jsonResponse.data;
        res = Array.from(new Set(data.map(JSON.stringify)))
               .map(JSON.parse);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    return res
}