const ODIN_URL = "http://odin.gtfdata.io";
const FIREHOSE_URL = `${ODIN_URL}/firehoses`;
const FIREHOSE_URL_SCALE_DOWN = (name) => `${FIREHOSE_URL}/${name}/scale`
const axios = require('axios');
const PROJECT_ID_NAME = "gopay-global-aws-staging";
const TEMP_FIREHOSE_REGEX = "gopay-global-aws-staging-temp.*";


const execute = async () => {
    const firehoses = await axios.get(FIREHOSE_URL, {
        params: {
            projectID: PROJECT_ID_NAME
        }
    });
    console.log(firehoses.data.firehose);
    firehoses.data.firehose
        .filter(firehose => firehose.name.match(TEMP_FIREHOSE_REGEX))
        .forEach(firehose => axios.put(FIREHOSE_URL_SCALE_DOWN(firehose.name), {
            "replicas": 0
        }));
}


execute()
