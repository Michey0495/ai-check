/**
 * Minimal ZIP file builder (no dependencies).
 * Creates a valid ZIP archive in the browser using Uint8Array.
 * Supports only Store (no compression) which is fine for small text files.
 */

interface ZipEntry {
  name: string;
  content: string;
}

function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16LE(val: number): Uint8Array {
  return new Uint8Array([val & 0xff, (val >> 8) & 0xff]);
}

function writeUint32LE(val: number): Uint8Array {
  return new Uint8Array([val & 0xff, (val >> 8) & 0xff, (val >> 16) & 0xff, (val >> 24) & 0xff]);
}

export function createZip(entries: ZipEntry[]): Blob {
  const parts: Uint8Array[] = [];
  const centralDir: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = stringToBytes(entry.name);
    const contentBytes = stringToBytes(entry.content);
    const crc = crc32(contentBytes);

    // Local file header
    const localHeader = new Uint8Array([
      ...Array.from(writeUint32LE(0x04034b50)), // signature
      ...Array.from(writeUint16LE(20)),          // version needed
      ...Array.from(writeUint16LE(0)),           // flags
      ...Array.from(writeUint16LE(0)),           // compression (store)
      ...Array.from(writeUint16LE(0)),           // mod time
      ...Array.from(writeUint16LE(0)),           // mod date
      ...Array.from(writeUint32LE(crc)),         // crc32
      ...Array.from(writeUint32LE(contentBytes.length)), // compressed size
      ...Array.from(writeUint32LE(contentBytes.length)), // uncompressed size
      ...Array.from(writeUint16LE(nameBytes.length)),    // name length
      ...Array.from(writeUint16LE(0)),                   // extra length
    ]);

    parts.push(localHeader, nameBytes, contentBytes);

    // Central directory entry
    const cdEntry = new Uint8Array([
      ...Array.from(writeUint32LE(0x02014b50)), // signature
      ...Array.from(writeUint16LE(20)),          // version made by
      ...Array.from(writeUint16LE(20)),          // version needed
      ...Array.from(writeUint16LE(0)),           // flags
      ...Array.from(writeUint16LE(0)),           // compression
      ...Array.from(writeUint16LE(0)),           // mod time
      ...Array.from(writeUint16LE(0)),           // mod date
      ...Array.from(writeUint32LE(crc)),
      ...Array.from(writeUint32LE(contentBytes.length)),
      ...Array.from(writeUint32LE(contentBytes.length)),
      ...Array.from(writeUint16LE(nameBytes.length)),
      ...Array.from(writeUint16LE(0)),           // extra length
      ...Array.from(writeUint16LE(0)),           // comment length
      ...Array.from(writeUint16LE(0)),           // disk start
      ...Array.from(writeUint16LE(0)),           // internal attrs
      ...Array.from(writeUint32LE(0)),           // external attrs
      ...Array.from(writeUint32LE(offset)),      // local header offset
    ]);
    centralDir.push(cdEntry, nameBytes);

    offset += localHeader.length + nameBytes.length + contentBytes.length;
  }

  const cdOffset = offset;
  let cdSize = 0;
  for (const cd of centralDir) cdSize += cd.length;

  // End of central directory
  const eocd = new Uint8Array([
    ...Array.from(writeUint32LE(0x06054b50)),     // signature
    ...Array.from(writeUint16LE(0)),               // disk number
    ...Array.from(writeUint16LE(0)),               // cd start disk
    ...Array.from(writeUint16LE(entries.length)),   // cd entries on disk
    ...Array.from(writeUint16LE(entries.length)),   // total cd entries
    ...Array.from(writeUint32LE(cdSize)),           // cd size
    ...Array.from(writeUint32LE(cdOffset)),         // cd offset
    ...Array.from(writeUint16LE(0)),               // comment length
  ]);

  const allParts = [...parts, ...centralDir, eocd];
  return new Blob(allParts.map(u => u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength) as ArrayBuffer), { type: "application/zip" });
}
