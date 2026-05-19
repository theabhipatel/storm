import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import type { Config } from "../config.js";

export function createS3Client(config: Config): S3Client {
  const opts: S3ClientConfig = {
    endpoint: config.s3Endpoint,
    region: config.s3Region,
    forcePathStyle: config.s3ForcePathStyle,
    credentials: {
      accessKeyId: config.s3AccessKey,
      secretAccessKey: config.s3SecretKey,
    },
  };
  return new S3Client(opts);
}

export async function presignPut(
  client: S3Client,
  config: Config,
  args: { key: string; contentType: string; contentLength: number },
): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: config.s3Bucket,
    Key: args.key,
    ContentType: args.contentType,
    ContentLength: args.contentLength,
  });
  return getSignedUrl(client, cmd, { expiresIn: config.uploadUrlTtlSeconds });
}

export async function downloadObject(
  client: S3Client,
  config: Config,
  key: string,
): Promise<Buffer> {
  const cmd = new GetObjectCommand({ Bucket: config.s3Bucket, Key: key });
  const out = await client.send(cmd);
  if (!out.Body) throw new Error(`S3 object missing body: ${key}`);
  return streamToBuffer(out.Body as NodeJS.ReadableStream);
}

export async function uploadObject(
  client: S3Client,
  config: Config,
  args: { key: string; body: Buffer; contentType: string },
): Promise<void> {
  const cmd = new PutObjectCommand({
    Bucket: config.s3Bucket,
    Key: args.key,
    Body: args.body,
    ContentType: args.contentType,
  });
  await client.send(cmd);
}

export async function deleteObject(
  client: S3Client,
  config: Config,
  key: string,
): Promise<void> {
  await client.send(new DeleteObjectCommand({ Bucket: config.s3Bucket, Key: key }));
}

export function publicUrlFor(config: Config, key: string): string {
  return `${config.s3PublicBaseUrl.replace(/\/$/, "")}/${key}`;
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer));
  }
  return Buffer.concat(chunks);
}
