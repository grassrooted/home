import yaml from 'js-yaml';
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";

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

