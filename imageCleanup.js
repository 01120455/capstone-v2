const { readdir, rmdir, stat } = require('fs/promises');
const { join } = require('path');
const fs = require('fs');

async function removeEmptyFolders(directory) {
  try {
    const files = await readdir(directory);

    if (files.length === 0) {
      await rmdir(directory);
      // console.log(`Removed empty folder: ${directory}`);
      return;
    }

    for (const file of files) {
      const fullPath = join(directory, file);
      const fileStat = await stat(fullPath);

      if (fileStat.isDirectory()) {
        await removeEmptyFolders(fullPath);
      }
    }

    const remainingFiles = await readdir(directory);
    if (remainingFiles.length === 0) {
      await rmdir(directory);
      // console.log(`Removed empty folder: ${directory}`);
    }
  } catch (error) {
    // console.error(`Error removing folder ${directory}:`, error);
  }
}

async function main() {
  const productImageDir = join(process.cwd(), 'public', 'uploads', 'product_image');

  if (fs.existsSync(productImageDir)) {
    await removeEmptyFolders(productImageDir);
    // console.log('Folder cleanup completed.');
  } else {
    // console.log(`Directory ${productImageDir} does not exist.`);
  }
}

main().catch((error) => console.error('Error during folder cleanup:', error));
