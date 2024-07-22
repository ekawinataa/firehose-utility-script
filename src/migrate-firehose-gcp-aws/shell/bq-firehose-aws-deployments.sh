#!/bin/bash
kubectl config set-context main-goku-eks-production-01
kubectl config set-context --current --namespace=firehose
deployments=($(kubectl get deployment | grep '^gopay-gl-.*-bigquery-.*' | awk '{print $1}'))
rm -rf .././production-resource
mkdir .././production-resource
for deployment in "${deployments[@]}"; do
   kubectl get deployment $deployment -o json > .././production-resource/$deployment.json;
done