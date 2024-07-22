const fs = require('fs');
const path = require('path');
const axios = require('axios');
const {
    ODIN_URL,
    SHIELD_URL,
    SHIELD_HEADER,
    GROUP_ID,
    PROJECT_ID,
    ORG_ID,
    NAMESPACE_ID,
    USER_ID
} = require("./constant");

const STREAM_NAME = 'p-go-gp-aws-central-kraft-globalstream';
const resourceFolderPath = path.join(`./production-resource`);

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
            const firehosePayload = buildTemporaryFirehosePayload(existingFirehoseJson);
            await axios.post(`${ODIN_URL}/firehoses`, firehosePayload)
                .then(async ({data: {firehose: {name}}}) => {
                    console.log(`Success creating firehose: ${name}`)
                    await createShieldResource(firehosePayload);
                })
                .catch(error => console.log(`Error creating firehose: ${error}`));
            console.log(`Successfully migrated ${existingFirehoseJson.title}`);
        });
    });
}

const createShieldResource = async (firehosePayload) => {
    const shieldPayload = buildShieldPayload(firehosePayload.name);
    await axios.post(SHIELD_URL, shieldPayload, {headers: SHIELD_HEADER})
        .catch(error => console.log(`Error creating shield: ${error}`))
}

const buildEnvMap = (env) => {
    return env
        .map(({name, value}) => ({[name]: value}))
        .reduce((acc, curr) => ({...acc, ...curr}), {});
}

const buildTemporaryFirehosePayload = (firehose) => {
    const {metadata: {name}, spec: {template: {spec: {containers}}}} = firehose;
    const envAsMap = buildEnvMap(containers[0].env);
    const firehosePayload = {
        title: name.replace(`gopay-gl-aws-prod-globalstream`, `temp-gopay-gl-aws-prod-globalstream`),
        team: 'gopay-de-app',
        stream_name: STREAM_NAME,
        topic_name: envAsMap['SOURCE_KAFKA_TOPIC'],
        configuration: {
            SINK_TYPE: "bigquery",
            SOURCE_KAFKA_TOPIC: envAsMap['SOURCE_KAFKA_TOPIC'],
            INPUT_SCHEMA_PROTO_CLASS: envAsMap['INPUT_SCHEMA_PROTO_CLASS'],
            SINK_BIGQUERY_TABLE_PARTITION_EXPIRY_MS: -86400000,
            SOURCE_KAFKA_CONSUMER_CONFIG_AUTO_OFFSET_RESET: "latest",
            SOURCE_KAFKA_CONSUMER_CONFIG_MAX_POLL_RECORDS: 500,
            ERROR_TYPES_FOR_FAILING: "UNKNOWN_FIELDS_ERROR,DESERIALIZATION_ERROR",
            SCHEMA_REGISTRY_STENCIL_URLS: envAsMap['SCHEMA_REGISTRY_STENCIL_URLS'],
            SINK_BIGQUERY_TABLE_PARTITIONING_ENABLED: 'true',
            SINK_BIGQUERY_TABLE_PARTITION_KEY: 'event_timestamp'
        },
        projectID: "gopay-global-aws-production",
        replicas: 1,
        autoscale_min: 0,
        autoscale_enabled: false,
        entity: "gopay",
        orgID: ORG_ID,
        group_id: GROUP_ID,
        autoscale_scaling_threshold: "300",
        autoscale_cooldown_period: 300,
        autoscale_hpa_scaledown_period_secs: 120,
        autoscale_hpa_scaleup_period_secs: 5,
        autoscale_hpa_scaleup_percent: 300,
        autoscale_hpa_scaledown_percent: 10,
        autoscale_hpa_scaledown_stabilization_window_secs: 300,
        created_by: USERNAME
    }
    console.log(firehosePayload);
    return firehosePayload;
}

const buildShieldPayload = (name) => {
    const payload = {
        name,
        groupId: GROUP_ID,
        projectId: PROJECT_ID,
        organizationId: ORG_ID,
        namespaceId: NAMESPACE_ID,
        userId: USER_ID
    }
    console.log(payload);
    return payload;
}

execute();