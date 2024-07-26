const fs = require('fs');
const path = require('path');

const resourceFolderPath = path.join(`./staging-resource`);

const execute = () => {
    fs.readdir(resourceFolderPath, (err, files) => {
        if (err) {
            console.log(err);
            return;
        }
        files.forEach(async file => {
            const filePath = path.join(resourceFolderPath, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const existingFirehoseJson = JSON.parse(fileContent);
            const {metadata: {name}, spec: {template: {spec: {containers}}}} = existingFirehoseJson;
            const envAsMap = buildEnvMap(containers[0].env);
            console.log(`${name} ${envAsMap['SINK_BIGQUERY_TABLE_NAME']}`);
        });
    });
}

const buildEnvMap = (env) => {
    return env
        .map(({name, value}) => ({[name]: value}))
        .reduce((acc, curr) => ({...acc, ...curr}), {});
}

execute();