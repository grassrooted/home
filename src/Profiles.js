import yaml from 'js-yaml';
import axios from 'axios'

export async function getProfiles() {
    // Loop through all yaml docs and store each as a 'profile' object in a list of profiles and then return it
    try {
        const response = await fetch('/profiles.yml');
        const yamlText = await response.text();
        const docs = yaml.loadAll(yamlText);
        return docs
      } catch (error) {
        console.error('Error fetching or parsing YAML file:', error);
      }
    // then follow this process here >> https://reactrouter.com/en/main/start/tutorial#creating-contacts
}

export async function getProfile(id) {
    //read all yaml docs until we find the given ID
        // Figure out how to handle what an 'ID' is
    //return the singluar contact
    //then follwo this process here >> https://reactrouter.com/en/main/start/tutorial#url-params-in-loaders
    const profiles = await getProfiles()
    let profile = profiles.find(profile => profile.id === id);
    let data = null
    try {
        // Extract the path to the JSON file
        const jsonFilePath = profile.path_to_contributions_data;

        // Fetch the JSON file
        const jsonResponse = await axios.get(jsonFilePath);
        data = jsonResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    return data
}