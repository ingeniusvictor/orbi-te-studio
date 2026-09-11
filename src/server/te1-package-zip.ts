import type { PackageArtifactInput } from "./te1-package-index.js";

export interface TE1ZipArtifact {
  filename: string;
  mimeType: "application/zip";
  bytes: Uint8Array;
}

interface ZipEntry {
  path: string;
  bytes: Buffer;
}

export function buildTE1PackageZip(
  projectId: string,
  artifacts: PackageArtifactInput[],
  generatedAt = new Date()
): TE1ZipArtifact {
  const entries: ZipEntry[] = artifacts.map((artifact) => ({
    path: packagePathForArtifact(artifact.filename),
    bytes:
      artifact.encoding === "base64"
        ? Buffer.from(artifact.content, "base64")
        : Buffer.from(artifact.content, "utf8")
  }));

  const bytes = buildStoreOnlyZip(entries, generatedAt);

  return {
    filename: `${safeName(projectId)}_TE1_package.zip`,
    mimeType: "application/zip",
    bytes: new Uint8Array(bytes)
  };
}

export function packagePathForArtifact(filename: string): string {
  const lower = filename.toLowerCase();

  if (
    lower.endsWith("_te1_a2.pdf") ||
    lower.endsWith("_te1_a2.svg")
  ) {
    return `01_Planos/${filename}`;
  }

  if (
    lower.includes("evidence_report") ||
    lower.includes("informe_fotografico")
  ) {
    return `02_Informes/${filename}`;
  }

  if (lower.includes("evidence_manifest")) {
    return `03_Evidencia/${filename}`;
  }

  if (
    lower.includes("server_verification_manifest") ||
    lower.includes("package_index")
  ) {
    return `04_Integridad/${filename}`;
  }

  return `00_Proyecto/${filename}`;
}

function buildStoreOnlyZip(
  entries: ZipEntry[],
  generatedAt: Date
): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  const { dosDate, dosTime } = toDosDateTime(generatedAt);

  for (const entry of entries) {
    const name = Buffer.from(entry.path, "utf8");
    const crc = crc32(entry.bytes);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(entry.bytes.length, 18);
    local.writeUInt32LE(entry.bytes.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);

    localParts.push(local, name, entry.bytes);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(dosTime, 12);
    central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(entry.bytes.length, 20);
    central.writeUInt32LE(entry.bytes.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);

    centralParts.push(central, name);
    offset += local.length + name.length + entry.bytes.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

function crc32(bytes: Buffer): number {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function toDosDateTime(date: Date): {
  dosDate: number;
  dosTime: number;
} {
  const year = Math.max(1980, Math.min(2107, date.getUTCFullYear()));
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = Math.floor(date.getUTCSeconds() / 2);

  return {
    dosDate: ((year - 1980) << 9) | (month << 5) | day,
    dosTime: (hours << 11) | (minutes << 5) | seconds
  };
}

function safeName(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 70) || "TE1"
  );
}
