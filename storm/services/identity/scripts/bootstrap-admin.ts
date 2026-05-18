/* eslint-disable no-console */
import { uuidv7 } from "uuidv7";

import { hashPassword } from "../src/auth/password.js";
import { loadConfig } from "../src/config.js";
import { disconnectPrisma, getPrisma } from "../src/infra/prisma.js";

interface Args {
  email: string;
  password: string;
  name: string;
}

function parseArgs(argv: string[]): Args {
  const out: Partial<Args> = {};
  for (const arg of argv) {
    const m = /^--(email|password|name)=(.+)$/.exec(arg);
    if (m) (out as Record<string, string>)[m[1]!] = m[2]!;
  }
  const missing = (["email", "password", "name"] as const).filter((k) => !out[k]);
  if (missing.length > 0) {
    console.error(
      `Usage: pnpm bootstrap-admin -- --email=<x> --password=<y> --name=<z>\n` +
        `Missing: ${missing.join(", ")}`,
    );
    process.exit(2);
  }
  if (out.password!.length < 12) {
    console.error("Password must be at least 12 characters.");
    process.exit(2);
  }
  if (!/.+@.+\..+/.test(out.email!)) {
    console.error("Email looks invalid.");
    process.exit(2);
  }
  return out as Args;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const config = loadConfig();
  const prisma = getPrisma(config.databaseUrl);

  const emailLower = args.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: emailLower } });

  if (existing) {
    if (existing.role === "admin") {
      console.log(`No-op: admin already exists for ${emailLower} (id=${existing.id}).`);
      return;
    }
    console.error(
      `Refusing: ${emailLower} exists with role=${existing.role}. ` +
        `Promote manually or use a different email.`,
    );
    process.exit(3);
  }

  const passwordHash = await hashPassword(args.password);
  const user = await prisma.user.create({
    data: {
      id: uuidv7(),
      email: emailLower,
      passwordHash,
      name: args.name,
      role: "admin",
      emailVerified: true,
      mobileVerified: false,
    },
  });
  console.log(`Created admin ${emailLower} (id=${user.id}).`);
}

main()
  .catch((err) => {
    console.error("bootstrap-admin failed:", err);
    process.exit(1);
  })
  .finally(() => disconnectPrisma());
