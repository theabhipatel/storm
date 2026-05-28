#!/usr/bin/env bash
# Delete the whole stack. Removes the namespace AND its PVC data (Postgres,
# Redis, etc.). The minikube cluster itself is left running.
set -euo pipefail
kubectl delete namespace storm-local --ignore-not-found
echo "storm-local namespace deleted (including persisted data)."
