# Seed scripts

One file per service: `<service>.ts`. Each exports `run(): Promise<void>`.

Day-1 ships only the registry stub. As services come online they add their seed module here and register it in `index.ts`.

Run all seeds:

```bash
pnpm seed:all
```
