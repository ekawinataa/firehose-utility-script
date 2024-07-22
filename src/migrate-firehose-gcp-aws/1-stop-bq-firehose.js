import {ODIN_URL, PROJECT_ID_NAME} from "./constant";
import axios from "axios";

const BQ_FIREHOSE_REGEX = "gopay-global-aws-prod-.*-bigquery-firehose$";

const execute = async () => {
    console.log('Stopping BigQuery Firehose')

    const {data: {firehose}} = await axios.get(`${ODIN_URL}/firehoses`, {params : {projectID: PROJECT_ID_NAME}})
    const bigQueryFirehoses = firehose.filter(fh => fh.name.match(BQ_FIREHOSE_REGEX));

    bigQueryFirehoses.forEach(bqFh => {
        console.log(`Stopping BigQuery Firehose: ${bqFh.name}`)
        axios.post(`${ODIN_URL}/firehoses/${bqFh.name}/stop`)
    })
}

execute()