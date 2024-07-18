///IMPORTS
const fs = require('fs');
const path = require('path');
const resourceFolderPath = path.join(__dirname, 'src/migrate-aws-firehose-bq/resource');
const axios = require('axios');

///CONSTANTS
const ODIN_URL = "http://odin.gtfdata.io";
const FIREHOSE_URL = `${ODIN_URL}/firehose`;
const SHIELD_URL = "http://shield.gtfdata.io/admin/v1beta1/resources";

///IDS (will provide this)
const ORG_ID = '';
const USER_ID = '';
const PROJECT_ID = '';
const GROUP_ID = '';
const NAMESPACE_ID = '';

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
            const shieldPayload = buildShieldPayload(existingFirehoseJson);
            await axios.post(FIREHOSE_URL, firehosePayload)
                .then(async response => await axios.post(SHIELD_URL, shieldPayload));
            setTimeout(() => console.log(`Successfully migrated ${existingFirehoseJson.title}`), 1000);
        });
    });
}

const buildTemporaryFirehosePayload = (firehose) => {
    const {title, team, stream_name, spec: {template: {spec: {containers}}}} = firehose;
    const envAsMap = containers[0].env.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    });
    return {
        title: title.replace("gopay-gl-aws-prod-globalstream", "temp-gopay-gl-aws-prod-globalstream"),
        team: 'gopay-de-app',
        stream_name: 'p-go-gp-aws-central-kraft-globalstream',
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
        created_by: "mayank.rai@gojek.com"
    }
}

const buildShieldPayload = ({title}) => ({
    name: title,
    groupId: GROUP_ID,
    projectId: PROJECT_ID,
    organizationId: ORG_ID,
    namespaceId: NAMESPACE_ID,
    userId: USER_ID
})

export default execute;