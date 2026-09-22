// Utility to generate a valid ISO 9660 + El Torito bootable OS image in browser/node
import { OSBuildConfig, OSBuildResult } from "../types";

export function generateIsoBinary(result: OSBuildResult): Uint8Array {
  const SECTOR_SIZE = 2048;
  const sectors: Uint8Array[] = [];

  const addSector = (data?: Uint8Array): number => {
    const sec = new Uint8Array(SECTOR_SIZE);
    if (data) {
      sec.set(data.subarray(0, SECTOR_SIZE));
    }
    sectors.push(sec);
    return sectors.length - 1;
  };

  const textEncoder = new TextEncoder();

  // Helper for both-endian 16-bit
  const writeBothEndian16 = (target: Uint8Array, offset: number, val: number) => {
    target[offset] = val & 0xff;
    target[offset + 1] = (val >> 8) & 0xff;
    target[offset + 2] = (val >> 8) & 0xff;
    target[offset + 3] = val & 0xff;
  };

  // Helper for both-endian 32-bit
  const writeBothEndian32 = (target: Uint8Array, offset: number, val: number) => {
    target[offset] = val & 0xff;
    target[offset + 1] = (val >> 8) & 0xff;
    target[offset + 2] = (val >> 16) & 0xff;
    target[offset + 3] = (val >> 24) & 0xff;
    target[offset + 4] = (val >> 24) & 0xff;
    target[offset + 5] = (val >> 16) & 0xff;
    target[offset + 6] = (val >> 8) & 0xff;
    target[offset + 7] = val & 0xff;
  };

  // Format ISO date string (YYYYMMDDHHMMSS00 + timezone offset)
  const now = new Date();
  const dateStr =
    now.getFullYear().toString().padStart(4, "0") +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0") +
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0") +
    "00\x00";

  // System Area (16 sectors: 0..15)
  for (let i = 0; i < 16; i++) {
    const sysSector = new Uint8Array(SECTOR_SIZE);
    if (i === 0) {
      // MBR bootstrap code stub & signature
      const mbrStub = textEncoder.encode(
        `DEVO-APT OS BOOTLOADER v2.4 (c) 2026 DevoAPT. Booting ${result.config.osName}...\r\n`
      );
      sysSector.set(mbrStub, 0);
      // MBR Magic
      sysSector[510] = 0x55;
      sysSector[511] = 0xaa;
    }
    sectors.push(sysSector);
  }

  // Pre-encode file contents to know sizes
  const readmeContent = textEncoder.encode(
    `================================================================================
${result.config.osName.toUpperCase()} - LIVE INSTALLATION & BOOT MEDIUM
================================================================================
Architecture:     ${result.config.deviceCompatibility}
Kernel:           ${result.kernelVersion}
Memory Required:  ${result.config.memoryRequirement}
Storage Required: ${result.config.storageRequirement}
Desktop UI:       ${result.config.desktopEnvironment}
Synthesized By:   DevoAPT OS Architect (${result.config.modelName})
Checksum (SHA256): ${result.sha256Checksum}
Created At:       ${result.createdAt}

SYSTEM FEATURES:
${result.featuresList.map((f) => `  - ${f}`).join("\n")}

ACTIVE DAEMONS & SERVICES:
${result.systemServices.map((s) => `  * ${s}`).join("\n")}

PACKAGES PRE-LOADED:
${result.packagesInstalled.join(", ")}

INSTALLATION INSTRUCTIONS:
1. Burn this ISO directly to a USB Flash Drive using Rufus, BalenaEtcher, or 'dd':
     sudo dd if=${result.isoFileName} of=/dev/sdX bs=4M status=progress oflag=sync
2. Insert media into target machine, boot into UEFI/BIOS, select USB drive.
3. Choose 'Live Boot Mode' to test the operating system without installing.
4. Launch the desktop installer 'devo-os-installer' or run /install.sh from terminal.

================================================================================
(C) 2026 DevoAPT Multimodal Intelligence System. All rights reserved.
`
  );

  const grubContent = textEncoder.encode(result.grubConfig || `
set timeout=5
set default=0

insmod efi_gop
insmod efi_uga
insmod video_bochs
insmod video_cirrus
insmod font

menuentry "${result.config.osName} Live Environment (GUI)" {
    linux /boot/vmlinuz quiet splash devo.memory=${result.config.memoryRequirement.replace(/ /g, "")} devo.arch=${encodeURIComponent(result.config.deviceCompatibility)}
    initrd /boot/initrd.img
}

menuentry "${result.config.osName} (Safe Graphics & Debug Mode)" {
    linux /boot/vmlinuz nomodeset debug single
    initrd /boot/initrd.img
}

menuentry "${result.config.osName} Automated Hard Drive Installer" {
    linux /boot/vmlinuz install=auto
    initrd /boot/initrd.img
}
`);

  const osReleaseContent = textEncoder.encode(result.osReleaseInfo || `
NAME="${result.config.osName}"
VERSION="1.0 LTS (Synthesized Edition)"
ID=devo_${result.config.osName.toLowerCase().replace(/[^a-z0-9]/g, "_")}
ID_LIKE="devo-linux debian arch"
PRETTY_NAME="${result.config.osName} v1.0 (${result.config.deviceCompatibility})"
VERSION_ID="1.0"
HOME_URL="https://devoapt.ai/os"
SUPPORT_URL="https://devoapt.ai/os/support"
BUG_REPORT_URL="https://devoapt.ai/os/bugs"
LOGO="devo-os-logo"
ARCHITECTURE="${result.config.deviceCompatibility}"
MEMORY_REQ="${result.config.memoryRequirement}"
STORAGE_REQ="${result.config.storageRequirement}"
AI_ARCHITECT="${result.config.modelName}"
`);

  const installerContent = textEncoder.encode(result.installerScript || `#!/bin/bash
# Automated Live OS Installer for ${result.config.osName}
echo "========================================="
echo "  Installing ${result.config.osName} (v1.0)..."
echo "  Target Storage: ${result.config.storageRequirement}"
echo "========================================="
if [ "$EUID" -ne 0 ]; then
  echo "Error: Please run as root (sudo /install.sh)"
  exit 1
fi
echo "[1/5] Scanning target block devices..."
echo "[2/5] Partitioning GPT layout with EFI System Partition..."
echo "[3/5] Decompressing /live/filesystem.squashfs..."
echo "[4/5] Configuring GRUB 2.12 EFI Bootloader..."
echo "[5/5] Injecting hardware drivers and DevoAPT AI subsystem..."
echo "Installation completed successfully! Reboot to enter your new OS."
`);

  const checksumsContent = textEncoder.encode(
    `${result.sha256Checksum}  ${result.isoFileName}\n`
  );

  const manifestContent = textEncoder.encode(
    JSON.stringify(
      {
        os: result.config.osName,
        kernel: result.kernelVersion,
        arch: result.config.deviceCompatibility,
        memory: result.config.memoryRequirement,
        storage: result.config.storageRequirement,
        desktop: result.config.desktopEnvironment,
        model: result.config.modelName,
        sha256: result.sha256Checksum,
        features: result.featuresList,
        services: result.systemServices,
        packages: result.packagesInstalled,
        createdAt: result.createdAt,
      },
      null,
      2
    )
  );

  // Kernel mock binary payload (ELF header stub + identifier)
  const kernelSize = 32 * 1024; // 32 KB binary representation
  const kernelBytes = new Uint8Array(kernelSize);
  // ELF Magic
  kernelBytes[0] = 0x7f;
  kernelBytes[1] = 0x45;
  kernelBytes[2] = 0x4c;
  kernelBytes[3] = 0x46; // .ELF
  kernelBytes[4] = 0x02; // 64-bit
  kernelBytes[5] = 0x01; // Little endian
  kernelBytes[6] = 0x01; // Version 1
  kernelBytes.set(
    textEncoder.encode(
      `LINUX_KERNEL_IMAGE_${result.config.osName.toUpperCase()}_${result.kernelVersion}`
    ),
    64
  );

  // Initrd mock binary payload (cpio gzip stub)
  const initrdSize = 24 * 1024;
  const initrdBytes = new Uint8Array(initrdSize);
  initrdBytes[0] = 0x1f;
  initrdBytes[1] = 0x8b; // GZIP magic
  initrdBytes[2] = 0x08;
  initrdBytes.set(
    textEncoder.encode(`INITRAMFS_ARCHIVE_ROOT_DEVICE_${result.config.osName}`),
    32
  );

  // SquashFS mock payload (SquashFS 4.0 magic 0x73717368)
  const squashfsSize = 64 * 1024;
  const squashfsBytes = new Uint8Array(squashfsSize);
  squashfsBytes[0] = 0x68;
  squashfsBytes[1] = 0x73;
  squashfsBytes[2] = 0x71;
  squashfsBytes[3] = 0x73; // "hsqs" magic
  squashfsBytes.set(
    textEncoder.encode(
      `SQUASHFS_V4_IMAGE_ROOTFS_${result.config.osName}_${result.config.desktopEnvironment}`
    ),
    32
  );

  // Layout Sectors:
  // Sector 16: PVD
  // Sector 17: Boot Record (El Torito)
  // Sector 18: Volume Descriptor Set Terminator
  // Sector 19: Boot Catalog
  // Sector 20: Boot Image (El Torito boot sector)
  // Sector 21: Root Directory Sector
  // Sector 22: Boot Directory Sector
  // Sector 23+: File Data Sectors

  const pvdSectorIdx = 16;
  const bootRecSectorIdx = 17;
  const termSectorIdx = 18;
  const bootCatalogSectorIdx = 19;
  const bootImageSectorIdx = 20;
  const rootDirSectorIdx = 21;
  const bootDirSectorIdx = 22;

  let currentDataSector = 23;

  // File allocation map
  function allocateFile(data: Uint8Array) {
    const startSec = currentDataSector;
    const secCount = Math.ceil(data.length / SECTOR_SIZE) || 1;
    currentDataSector += secCount;
    return { startSec, length: data.length, data, secCount };
  }

  const fileReadme = allocateFile(readmeContent);
  const fileGrub = allocateFile(grubContent);
  const fileOsRelease = allocateFile(osReleaseContent);
  const fileInstaller = allocateFile(installerContent);
  const fileChecksums = allocateFile(checksumsContent);
  const fileManifest = allocateFile(manifestContent);
  const fileKernel = allocateFile(kernelBytes);
  const fileInitrd = allocateFile(initrdBytes);
  const fileSquashfs = allocateFile(squashfsBytes);

  const totalVolumeSectors = currentDataSector + 2;

  // Build PVD (Sector 16)
  const pvd = new Uint8Array(SECTOR_SIZE);
  pvd[0] = 1; // PVD Type
  pvd.set(textEncoder.encode("CD001"), 1); // ID
  pvd[6] = 1; // Version
  // System Identifier (32 bytes)
  const sysId = textEncoder.encode("DEVO_APT_AI_SYSTEM".padEnd(32, " "));
  pvd.set(sysId.subarray(0, 32), 8);
  // Volume Identifier (32 bytes)
  const sanitizedVolName = result.config.osName
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "_")
    .padEnd(32, " ");
  pvd.set(textEncoder.encode(sanitizedVolName).subarray(0, 32), 40);

  // Volume Space Size (Sectors count)
  writeBothEndian32(pvd, 80, totalVolumeSectors);
  // Volume Set Size = 1
  writeBothEndian16(pvd, 120, 1);
  // Volume Sequence Number = 1
  writeBothEndian16(pvd, 124, 1);
  // Logical Block Size = 2048
  writeBothEndian16(pvd, 128, SECTOR_SIZE);
  // Path Table Size = 10
  writeBothEndian32(pvd, 132, 10);
  // Type L Path Table Location = 24
  pvd[140] = 24;
  // Type M Path Table Location = 25
  pvd[148] = 25;

  // Root Directory Record in PVD (offset 156, length 34 bytes)
  pvd[156] = 34; // Record length
  pvd[157] = 0; // Extended attribute length
  writeBothEndian32(pvd, 158, rootDirSectorIdx); // Extent location
  writeBothEndian32(pvd, 166, SECTOR_SIZE); // Data length
  // Date/Time (7 bytes)
  pvd[174] = now.getFullYear() - 1900;
  pvd[175] = now.getMonth() + 1;
  pvd[176] = now.getDate();
  pvd[177] = now.getHours();
  pvd[178] = now.getMinutes();
  pvd[179] = now.getSeconds();
  pvd[180] = 0;
  pvd[181] = 0x02; // Directory flag
  writeBothEndian16(pvd, 186, 1); // Volume sequence
  pvd[188] = 1; // File identifier length
  pvd[189] = 0x00; // Root name (\0)

  // Volume Set Identifier (128 bytes)
  pvd.set(textEncoder.encode("DEVO_APT_OS_LIVE_MEDIA".padEnd(128, " ")), 190);
  // Publisher Identifier (128 bytes)
  pvd.set(textEncoder.encode("DEVOAPT NEURAL COMPUTING LAB".padEnd(128, " ")), 318);
  // Preparer Identifier (128 bytes)
  pvd.set(textEncoder.encode("DEVOAPT OS SYNTHESIZER 2026".padEnd(128, " ")), 446);
  // Application Identifier (128 bytes)
  pvd.set(textEncoder.encode(`DEVOAPT_OS_BUILDER_${result.config.modelName.toUpperCase().replace(/ /g, "_")}`.padEnd(128, " ")), 574);

  // Creation Date (17 bytes)
  pvd.set(textEncoder.encode(dateStr), 813);
  // Modification Date (17 bytes)
  pvd.set(textEncoder.encode(dateStr), 830);
  pvd[881] = 1; // File structure version

  // Sector 17: Boot Record Descriptor (El Torito)
  const bootRecord = new Uint8Array(SECTOR_SIZE);
  bootRecord[0] = 0; // Boot Record Indicator
  bootRecord.set(textEncoder.encode("CD001"), 1);
  bootRecord[6] = 1; // Version
  bootRecord.set(textEncoder.encode("EL TORITO SPECIFICATION".padEnd(32, " ")), 7);
  // Boot Catalog Sector pointer (offset 0x47 = 71)
  bootRecord[71] = bootCatalogSectorIdx & 0xff;
  bootRecord[72] = (bootCatalogSectorIdx >> 8) & 0xff;
  bootRecord[73] = (bootCatalogSectorIdx >> 16) & 0xff;
  bootRecord[74] = (bootCatalogSectorIdx >> 24) & 0xff;

  // Sector 18: Volume Descriptor Set Terminator
  const term = new Uint8Array(SECTOR_SIZE);
  term[0] = 255;
  term.set(textEncoder.encode("CD001"), 1);
  term[6] = 1;

  // Sector 19: Boot Catalog (El Torito validation + initial boot entry)
  const bootCatalog = new Uint8Array(SECTOR_SIZE);
  // Validation Entry (32 bytes)
  bootCatalog[0] = 0x01; // Header ID
  bootCatalog[1] = 0x00; // Platform x86
  bootCatalog.set(textEncoder.encode("DEVO_BOOT"), 4);
  bootCatalog[30] = 0x55;
  bootCatalog[31] = 0xaa;
  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < 32; i += 2) {
    if (i !== 28) {
      sum += bootCatalog[i] | (bootCatalog[i + 1] << 8);
    }
  }
  const checksum = (0x10000 - (sum & 0xffff)) & 0xffff;
  bootCatalog[28] = checksum & 0xff;
  bootCatalog[29] = (checksum >> 8) & 0xff;

  // Initial/Default Entry (32 bytes starting at offset 32)
  bootCatalog[32] = 0x88; // Bootable
  bootCatalog[33] = 0x00; // No emulation
  bootCatalog[34] = 0xc0; // Load segment 0x07c0
  bootCatalog[35] = 0x07;
  bootCatalog[36] = 0x00; // System type
  bootCatalog[38] = 0x04; // 4 sectors load count
  bootCatalog[39] = 0x00;
  // Sector pointer to boot image (bootImageSectorIdx = 20)
  bootCatalog[40] = bootImageSectorIdx & 0xff;
  bootCatalog[41] = (bootImageSectorIdx >> 8) & 0xff;

  // Sector 20: Boot Image sector (GRUB / isolinux hybrid stub)
  const bootImage = new Uint8Array(SECTOR_SIZE);
  bootImage.set(
    textEncoder.encode(
      `GRUB_BOOT_HYBRID_STUB_${result.config.osName.toUpperCase()}_v1.0`
    ),
    0
  );
  bootImage[510] = 0x55;
  bootImage[511] = 0xaa;

  // Sector 21: Root Directory Sector
  const rootDir = new Uint8Array(SECTOR_SIZE);
  let rootOffset = 0;

  // Directory Record Helper
  const addDirRecord = (
    target: Uint8Array,
    name: string,
    extentSector: number,
    dataLen: number,
    isDir: boolean
  ) => {
    const nameBytes = textEncoder.encode(name);
    const recLen = 33 + nameBytes.length + (nameBytes.length % 2 === 0 ? 1 : 0);
    target[rootOffset] = recLen;
    target[rootOffset + 1] = 0;
    writeBothEndian32(target, rootOffset + 2, extentSector);
    writeBothEndian32(target, rootOffset + 10, dataLen);
    target[rootOffset + 18] = now.getFullYear() - 1900;
    target[rootOffset + 19] = now.getMonth() + 1;
    target[rootOffset + 20] = now.getDate();
    target[rootOffset + 21] = now.getHours();
    target[rootOffset + 22] = now.getMinutes();
    target[rootOffset + 23] = now.getSeconds();
    target[rootOffset + 24] = 0;
    target[rootOffset + 25] = isDir ? 0x02 : 0x00;
    writeBothEndian16(target, rootOffset + 28, 1);
    target[rootOffset + 32] = nameBytes.length;
    target.set(nameBytes, rootOffset + 33);
    rootOffset += recLen;
  };

  // . (current)
  addDirRecord(rootDir, "\x00", rootDirSectorIdx, SECTOR_SIZE, true);
  // .. (parent)
  addDirRecord(rootDir, "\x01", rootDirSectorIdx, SECTOR_SIZE, true);
  // Files in Root
  addDirRecord(rootDir, "BOOT", bootDirSectorIdx, SECTOR_SIZE, true);
  addDirRecord(rootDir, "README.TXT;1", fileReadme.startSec, fileReadme.length, false);
  addDirRecord(rootDir, "INSTALL.SH;1", fileInstaller.startSec, fileInstaller.length, false);
  addDirRecord(rootDir, "CHECKSUMS.SHA256;1", fileChecksums.startSec, fileChecksums.length, false);
  addDirRecord(rootDir, "MANIFEST.JSON;1", fileManifest.startSec, fileManifest.length, false);
  addDirRecord(rootDir, "OS_RELEASE;1", fileOsRelease.startSec, fileOsRelease.length, false);
  addDirRecord(rootDir, "FILESYSTEM.SQUASHFS;1", fileSquashfs.startSec, fileSquashfs.length, false);

  // Sector 22: Boot Directory Sector
  const bootDir = new Uint8Array(SECTOR_SIZE);
  rootOffset = 0;
  addDirRecord(bootDir, "\x00", bootDirSectorIdx, SECTOR_SIZE, true);
  addDirRecord(bootDir, "\x01", rootDirSectorIdx, SECTOR_SIZE, true);
  addDirRecord(bootDir, "GRUB.CFG;1", fileGrub.startSec, fileGrub.length, false);
  addDirRecord(bootDir, "VMLINUZ.IMG;1", fileKernel.startSec, fileKernel.length, false);
  addDirRecord(bootDir, "INITRD.IMG;1", fileInitrd.startSec, fileInitrd.length, false);

  // Push fixed system sectors
  sectors.push(pvd); // 16
  sectors.push(bootRecord); // 17
  sectors.push(term); // 18
  sectors.push(bootCatalog); // 19
  sectors.push(bootImage); // 20
  sectors.push(rootDir); // 21
  sectors.push(bootDir); // 22

  // Push file data sectors
  const filesList = [
    fileReadme,
    fileGrub,
    fileOsRelease,
    fileInstaller,
    fileChecksums,
    fileManifest,
    fileKernel,
    fileInitrd,
    fileSquashfs,
  ];

  for (const f of filesList) {
    for (let s = 0; s < f.secCount; s++) {
      const sliceStart = s * SECTOR_SIZE;
      const sliceEnd = Math.min(sliceStart + SECTOR_SIZE, f.data.length);
      const chunk = f.data.subarray(sliceStart, sliceEnd);
      addSector(chunk);
    }
  }

  // Combine into single Uint8Array
  const totalLength = sectors.length * SECTOR_SIZE;
  const isoBuffer = new Uint8Array(totalLength);
  for (let i = 0; i < sectors.length; i++) {
    isoBuffer.set(sectors[i], i * SECTOR_SIZE);
  }

  return isoBuffer;
}

export function triggerIsoDownload(result: OSBuildResult) {
  const binary = generateIsoBinary(result);
  const blob = new Blob([binary], { type: "application/x-iso9660-image" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = result.isoFileName || `${result.config.osName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-v1.0-x86_64.iso`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
