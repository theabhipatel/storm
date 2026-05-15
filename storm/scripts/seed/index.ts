/**
 * Root seed entry. Runs per-service seed scripts in dependency order.
 * Each service registers its own seed module here on its build day.
 */

interface SeedModule {
  name: string;
  run: () => Promise<void>;
}

const seeds: SeedModule[] = [
  // populated as services come online
  // { name: "identity", run: (await import("./identity.js")).run },
  // { name: "catalog", run: (await import("./catalog.js")).run },
  // ...
];

async function main(): Promise<void> {
  if (seeds.length === 0) {
    // eslint-disable-next-line no-console
    console.log("[seed] no seed modules registered yet — nothing to do.");
    return;
  }
  for (const s of seeds) {
    // eslint-disable-next-line no-console
    console.log(`[seed] running ${s.name}…`);
    await s.run();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[seed] failed", err);
  process.exit(1);
});
