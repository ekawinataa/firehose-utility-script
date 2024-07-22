#!/bin/bash
kubectl config set-context main-goku-eks-production-01
kubectl config set-context --current --namespace=firehose
deployments=($(kubectl get deployment | grep '^gopay-gl-.*-bigquery-firehose' | awk '{print $1}'))
for deployment in "${deployments[@]}"; do
  ## Scale down the deployment, cannot use scale command, my role is not allowed
  k patch deployment $deployment -p '{"spec": {"replicas":0}}'
done
