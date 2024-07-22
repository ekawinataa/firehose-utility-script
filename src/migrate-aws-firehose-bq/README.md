1. Suspend (scale to 0) of the listed firehoses - DE (stop-bq-firehoses.sh)
2. Create new partitioned table from the existing tables (rename it with something else) - DWH
3. Drop existing tables - DWH
4. Create new firehoses with alternative name from the existing deployments, this will create new partitioned table in the process  - DE (exec.js)
5. Backfill the newly created tables with the backup - DWH

Plan :
https://go-jek.atlassian.net/wiki/spaces/GPDE/pages/3145138340/Goku+EKS+BQ+Firehose+Migration


Notes : 

