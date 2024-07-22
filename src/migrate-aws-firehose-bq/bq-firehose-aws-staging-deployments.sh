#!/bin/bash
kubectl config set-context main-goku-eks-staging-01
kubectl config set-context --current --namespace=firehose
deployments=($(kubectl get deployment | grep '^gopay-gl-.*-bigquery-.*' | awk '{print $1}'))
rm -rf ./staging-resource
mkdir ./staging-resource
for deployment in "${deployments[@]}"; do
   kubectl get deployment $deployment -o json > ./staging-resource/$deployment.json;
done