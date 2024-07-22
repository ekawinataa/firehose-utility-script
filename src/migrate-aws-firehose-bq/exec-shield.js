const ODIN_URL = "http://odin.gtfdata.io";
const FIREHOSE_URL = `${ODIN_URL}/firehoses`;
const axios = require('axios');
const PROJECT_ID_NAME = "gopay-global-aws-staging";
const TEMP_FIREHOSE_REGEX = "gopay-global-aws-staging-temp.*";
const ORG_ID = '4fcdc187-7cd4-4458-bb79-3948424bd192';
const USER_ID = 'ea64963b-db16-4bad-b11f-9fc740b001b1';
const PROJECT_ID = '327e4781-b23a-4fcb-8a58-340beb88c351';
const GROUP_ID = 'eab991e9-c29b-4581-9b5f-47b7fa626871';
const NAMESPACE_ID = 'odin_firehose';

const SHIELD_HEADER = {
    "X-Auth-Email": "eka.winata@gopay.co.id"
}


const execute = async () => {
    const firehoses = await axios.get(FIREHOSE_URL, {
        params: {
            projectID: PROJECT_ID_NAME
        }
    });
    console.log(firehoses.data.firehose);
    firehoses.data.firehose
        .filter(firehose => firehose.name.match(TEMP_FIREHOSE_REGEX))
        .forEach(firehose => axios.post("http://shield.gtfdata.io/admin/v1beta1/resources",
            buildShieldPayload(firehose.name),
            {headers: SHIELD_HEADER}));
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

execute()
