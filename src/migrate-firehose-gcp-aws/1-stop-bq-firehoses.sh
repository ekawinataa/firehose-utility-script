#!/bin/bash
kubectl config set-context main-goku-eks-production-01
kubectl config set-context --current --namespace=firehose
deployments=($(kubectl get deployment | grep '^gopay-gl-.*-bigquery-firehose' | awk '{print $1}'))
for deployment in "${deployments[@]}"; do
  k patch deployment $deployment -p '{"spec": {"replicas":0}}'
done
