# Storm ArgoCD

Per-environment GitOps. Bootstrap installs ArgoCD itself, then the `root`
Application below points at `infra/argocd/dev/` and self-syncs everything.

```
infra/argocd/
├── bootstrap/
│   ├── argocd-install.yaml      # Helm release (server-side apply)
│   ├── root-app.yaml            # App-of-apps root
│   └── repo-credentials.yaml    # private repo creds template
└── dev/
    ├── platform/                # Linkerd, kube-prom-stack, Loki, Tempo,
    │                              external-secrets, OTel Collector, Kong
    ├── services/                # one Application per storm service
    └── external-secrets/        # ExternalSecret resources
```

Promotion = PR bumping an image tag in `dev/services/<svc>.yaml`.
