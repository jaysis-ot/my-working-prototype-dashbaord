const fs = require('fs');
const path = require('path');
const util = require('util');

// Convert fs functions to promise-based for cleaner async/await usage
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

// Configuration options
const config = {
  rootDir: process.argv[2] || 'src',
  sortBy: process.argv[3] || 'size', // 'size', 'date', 'path'
  format: process.argv[4] || 'table', // 'table', 'json', 'csv'
  minSize: 0, // Minimum file size in bytes to include
  excludeDirs: ['node_modules', '.git', 'build', 'dist'],
  excludeExts: [] // Extensions to exclude, e.g. ['.map', '.lock']
};

// Format file size to human-readable format
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

// Format date to readable format
function formatDate(date) {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

// Recursively scan directory and collect file info
async function scanDirectory(dir) {
  const files = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip excluded directories
        if (config.excludeDirs.includes(entry.name)) continue;
        
        // Recursively scan subdirectories
        const subDirFiles = await scanDirectory(fullPath);
        files.push(...subDirFiles);
      } else {
        // Skip excluded extensions
        const ext = path.extname(entry.name).toLowerCase();
        if (config.excludeExts.includes(ext)) continue;
        
        try {
          const stats = await stat(fullPath);
          
          // Skip files smaller than minSize
          if (stats.size < config.minSize) continue;
          
          files.push({
            path: fullPath,
            size: stats.size,
            formattedSize: formatSize(stats.size),
            modified: stats.mtime,
            formattedDate: formatDate(stats.mtime),
            extension: ext
          });
        } catch (err) {
          console.error(`Error reading file stats for ${fullPath}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }
  
  return files;
}

// Sort files based on config
function sortFiles(files) {
  switch (config.sortBy) {
    case 'size':
      return files.sort((a, b) => b.size - a.size);
    case 'date':
      return files.sort((a, b) => b.modified - a.modified);
    case 'path':
      return files.sort((a, b) => a.path.localeCompare(b.path));
    default:
      return files;
  }
}

// Output files in the specified format
function outputFiles(files) {
  switch (config.format) {
    case 'json':
      console.log(JSON.stringify(files, null, 2));
      break;
    case 'csv':
      console.log('Path,Size,Size (bytes),Last Modified');
      files.forEach(file => {
        console.log(`"${file.path}","${file.formattedSize}",${file.size},"${file.formattedDate}"`);
      });
      break;
    case 'table':
    default:
      console.log('\nFile Listing for', path.resolve(config.rootDir));
      console.log('='.repeat(80));
      console.log('Size'.padEnd(12), 'Modified'.padEnd(20), 'Path');
      console.log('-'.repeat(80));
      
      files.forEach(file => {
        console.log(
          file.formattedSize.padEnd(12),
          file.formattedDate.padEnd(20),
          file.path
        );
      });
      
      // Summary
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      console.log('='.repeat(80));
      console.log(`Total: ${files.length} files, ${formatSize(totalSize)}`);
      
      // Extension summary
      const extSummary = files.reduce((acc, file) => {
        const ext = file.extension || '(no extension)';
        if (!acc[ext]) {
          acc[ext] = { count: 0, size: 0 };
        }
        acc[ext].count++;
        acc[ext].size += file.size;
        return acc;
      }, {});
      
      console.log('\nFile Types:');
      console.log('Extension'.padEnd(15), 'Count'.padEnd(8), 'Total Size');
      console.log('-'.repeat(50));
      
      Object.entries(extSummary)
        .sort((a, b) => b[1].size - a[1].size)
        .forEach(([ext, { count, size }]) => {
          console.log(
            ext.padEnd(15),
            count.toString().padEnd(8),
            formatSize(size)
          );
        });
      break;
  }
}

// Main function
async function main() {
  try {
    console.log(`Scanning directory: ${config.rootDir}`);
    console.log(`Sorting by: ${config.sortBy}`);
    
    const startTime = Date.now();
    const files = await scanDirectory(config.rootDir);
    const sortedFiles = sortFiles(files);
    
    console.log(`Found ${files.length} files in ${(Date.now() - startTime) / 1000} seconds`);
    outputFiles(sortedFiles);
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// Run the script
main();
