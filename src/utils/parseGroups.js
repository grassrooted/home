// src/utils/parseGroups.js
import fs from 'fs';
import yaml from 'yaml';

export const parseGroups = () => {
    const fileContent = fs.readFileSync('path/to/groups.yml', 'utf8');
    return yaml.parseAllDocuments(fileContent).map(doc => doc.toJSON());
};
