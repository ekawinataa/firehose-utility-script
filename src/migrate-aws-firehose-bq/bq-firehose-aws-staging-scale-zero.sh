#!/bin/bash
kubectl config set-context main-goku-eks-staging-01
kubectl config set-context --current --namespace=firehose
deployments=($(kubectl get deployment | grep '^gopay-global-aws-staging-temp-.*' | awk '{print $1}'))

for deployment in "${deployments[@]}"; do
  deployment_name=$(kubectl get deployment $deployment -o json | jq '.metadata.name' | tr -d '"')
  echo $deployment_name
#  curl -X PUT "http://odin.gtfdata.io/firehoses/$deployment_name/scale" -H "accept: application/json" -H "Content-Type: application/json" -d "{ \"replicas\": 0}"
#  echo "Shield for $deployment_name has been created"
done