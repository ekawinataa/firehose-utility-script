#!/bin/bash
kubectl config set-context main-goku-eks-staging-01
kubectl config set-context --current --namespace=firehose
deployments=($(kubectl get deployment | grep '^gopay-global-aws-staging-temp-.*' | awk '{print $1}'))

for deployment in "${deployments[@]}"; do
  deployment_name=$(kubectl get deployment $deployment -o json | jq '.metadata.name' | tr -d '"')
  echo $deployment_name
  curl --location 'http://shield.gtfdata.io/admin/v1beta1/resources' \
  --header 'X-Auth-Email: eka.winata@gopay.co.id' \
  --header 'Content-Type: application/json' \
  --data "{
      \"name\": \"$deployment_name\",
      \"groupId\": \"eab991e9-c29b-4581-9b5f-47b7fa626871\",
      \"projectId\": \"327e4781-b23a-4fcb-8a58-340beb88c351\",
      \"organizationId\": \"4fcdc187-7cd4-4458-bb79-3948424bd192\",
      \"namespaceId\": \"odin_firehose\",
      \"userId\": \"ea64963b-db16-4bad-b11f-9fc740b001b1\"
  }"
  echo "Shield for $deployment_name has been created"
done