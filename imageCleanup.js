const { readdir, rmdir, stat } = require('fs/promises');
const { join } = require('path');
const fs = require('fs');

async function removeEmptyFolders(directory) {
  try {
    const files = await readdir(directory);

    if (files.length === 0) {
      // Directory is empty, remove it
      await rmdir(directory);
      console.log(`Removed empty folder: ${directory}`);
      return;
    }

    // Check each file/folder inside the current directory
    for (const file of files) {
      const fullPath = join(directory, file);
      const fileStat = await stat(fullPath);

      if (fileStat.isDirectory()) {
        // Recursively check subdirectories
        await removeEmptyFolders(fullPath);
      }
    }

    // After checking all subdirectories, check if the current directory is empty
    const remainingFiles = await readdir(directory);
    if (remainingFiles.length === 0) {
      await rmdir(directory);
      console.log(`Removed empty folder: ${directory}`);
    }
  } catch (error) {
    console.error(`Error removing folder ${directory}:`, error);
  }
}

async function main() {
  // Path to the product_image directory
  const productImageDir = join(process.cwd(), 'public', 'uploads', 'product_image');

  // Check if the directory exists
  if (fs.existsSync(productImageDir)) {
    // Start the removal process
    await removeEmptyFolders(productImageDir);
    console.log('Folder cleanup completed.');
  } else {
    console.log(`Directory ${productImageDir} does not exist.`);
  }
}

main().catch((error) => console.error('Error during folder cleanup:', error));
