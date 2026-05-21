# Storm — Infra Setup (the ~40% you do)

Everything in `storm/` and `infra/` is code-ready (Terraform validates, K8s
manifests render, Sentry/OTel wired). This is the manual one-time work to
turn it into a live AWS dev environment.

Tools needed locally: `awscli`, `terraform 1.6+`, `kubectl`, `helm`, `argocd`,
`cosign`, `step` (smallstep), `docker`.

## 1. AWS account + IAM

1. Create / pick a dev AWS account.
2. Create the GitHub OIDC provider in IAM and a role `github-actions-cd` that
   trusts `repo:storm/storm:ref:refs/heads/main`, with permissions to push to
   ECR + describe EKS. ARN goes into `.github/workflows/cd.yml` (replace the
   `000000000000` account placeholder).
3. Create your local admin IAM identity and `aws configure --profile storm-dev`.

## 2. Terraform state bucket + lock table (one-shot)

```bash
aws s3api create-bucket \
  --bucket storm-tfstate \
  --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1
aws s3api put-bucket-versioning --bucket storm-tfstate \
  --versioning-configuration Status=Enabled
aws dynamodb create-table --table-name storm-tflock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST --region ap-south-1
```

## 3. DNS

1. Register `storm.dev.example` (or your real domain) in your registrar.
2. After step 4, take `terraform output route53_name_servers` and paste them
   into your registrar as NS records for the subdomain. Wait for propagation.
3. ACM cert validation is DNS-based — Route 53 records are created
   automatically once the zone is delegated.

## 4. Terraform apply

```bash
cd storm/infra/terraform/envs/dev
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

This stands up: VPC + 3-AZ subnets, EKS (3 node groups), 7 Aurora-Postgres
clusters, DocumentDB, ElastiCache, MSK, OpenSearch, S3 buckets (KMS-encrypted),
WAF, ALB, CloudFront, Route 53 zone, ACM certs, Secrets Manager placeholders,
IRSA roles.

## 5. Populate Secrets Manager

```bash
aws secretsmanager put-secret-value --secret-id storm/dev/identity/jwt \
  --secret-string '{"JWT_PRIVATE_KEY":"...","JWT_PUBLIC_KEY":"..."}'
# Repeat for: payment/razorpay, notification/smtp, notification/twilio,
# sentry/dsn, grafana/admin, identity/google-oauth, plus per-service DSNs
# (database URL, Redis URL, Kafka brokers — values come from `terraform output`).
```

## 6. ECR repos + first image push

```bash
for s in identity catalog cart inventory search order payment wishlist \
         notification recommendation media web-bff admin-bff web admin; do
  aws ecr create-repository --repository-name storm/$s --region ap-south-1
done
aws ecr get-login-password --region ap-south-1 | docker login --username AWS \
  --password-stdin 000000000000.dkr.ecr.ap-south-1.amazonaws.com
# Push the first image manually so ArgoCD has something to pull on bootstrap.
```

## 7. kubeconfig

```bash
aws eks update-kubeconfig --name storm-dev --region ap-south-1
kubectl get nodes        # expect 5 nodes (2 system + 3 general)
```

## 8. Linkerd identity bootstrap

```bash
step certificate create root.linkerd.cluster.local ca.crt ca.key \
  --profile root-ca --no-password --insecure --not-after=87600h
step certificate create identity.linkerd.cluster.local \
  issuer.crt issuer.key --profile intermediate-ca --not-after=8760h \
  --no-password --insecure --ca ca.crt --ca-key ca.key
kubectl create namespace linkerd
kubectl create secret tls linkerd-trust-anchor \
  --cert=ca.crt --key=ca.key -n linkerd
kubectl create secret tls linkerd-identity-issuer \
  --cert=issuer.crt --key=issuer.key -n linkerd
```

## 9. ArgoCD bootstrap

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f \
  https://raw.githubusercontent.com/argoproj/argo-cd/v2.12.4/manifests/install.yaml

# Get the initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Connect ArgoCD to this repo (needs a deploy key or PAT secret)
kubectl apply -f storm/infra/argocd/bootstrap/root-app.yaml
```

After ~10 minutes ArgoCD has installed: Linkerd CRDs + control plane,
kube-prometheus-stack (Prom/Grafana/Alertmanager), Loki, Tempo, OTel
Collector, External Secrets Operator, Cosign policy controller, Kong, and
all Storm services.

## 10. Annotate IRSA roles

The Terraform output `irsa_role_arns` maps each ServiceAccount to its role.
Patch the relevant SAs with the annotation:

```bash
kubectl annotate sa external-secrets -n external-secrets \
  eks.amazonaws.com/role-arn=$(terraform -chdir=storm/infra/terraform/envs/dev \
  output -raw irsa_role_arns | jq -r .external_secrets) --overwrite
# Repeat for media-service, notification-service, loki, tempo (storm + observability namespaces).
```

## 11. Sanity checks (Day 10 DoD)

```bash
kubectl get pods -A | grep -v Running       # only Completed / Running expected
linkerd check
linkerd viz dashboard &                     # mTLS should show 100%
argocd app list                             # all "Synced" + "Healthy"
curl -I https://web.storm.dev.example       # security headers visible
```

Then run the e2e smoke against AWS:

```bash
cd storm/e2e
E2E_WEB_URL=https://web.storm.dev.example \
E2E_ADMIN_URL=https://admin.storm.dev.example \
pnpm test:smoke
```

## 12. Razorpay test mode

1. In the Razorpay dashboard, set the webhook URL to
   `https://api.storm.dev.example/webhooks/razorpay`.
2. Add the webhook secret to `storm/dev/payment/razorpay` in Secrets Manager;
   External Secrets will roll it into the pod automatically.

That's it. Subsequent deploys are PRs to `main` — CI builds, Cosign signs,
pushes to ECR, bumps the image tag in `infra/argocd/dev/services/`, and
ArgoCD rolls the pods.
