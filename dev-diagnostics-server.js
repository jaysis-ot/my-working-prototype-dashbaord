const express = require('express');
const chokidar = require('chokidar');
const path = require('path');
const { exec } = require('child_process');
const open = require('open');
const fs = require('fs');

const PORT = 5000;
const STRUCTURE_SCRIPT = path.resolve(__dirname, 'analyzeStructure.js');
const STRUCTURE_REPORT_PATH = path.resolve(__dirname, 'structure-report.json');
const PUBLIC_DIR = path.resolve(__dirname, 'public');

if (!fs.existsSync(STRUCTURE_SCRIPT)) {
  console.error(`❌ Cannot find analyzeStructure.js at ${STRUCTURE_SCRIPT}`);
  process.exit(1);
}

const app = express();
app.use(express.static(PUBLIC_DIR));

app.get('/structure', (req, res) => {
  try {
    const data = fs.readFileSync(STRUCTURE_REPORT_PATH, 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (e) {
    res.status(500).send({ error: 'No structure report available.' });
  }
});

function runAnalysis() {
  exec(`node ${STRUCTURE_SCRIPT}`, (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Error running analyzeStructure.js');
      console.error(stderr);
    } else {
      console.log('✅ Structure updated');
    }
  });
}

app.listen(PORT, () => {
  console.log(`📊 Dev diagnostics running at http://localhost:${PORT}/diagnostic-viewer.html`);
  runAnalysis();
  open(`http://localhost:${PORT}/diagnostic-viewer.html`);
});

const watcher = chokidar.watch(path.join(__dirname, 'src'), {
  ignored: /node_modules/,
  ignoreInitial: true,
});

watcher.on('all', (event, filePath) => {
  console.log(`🔄 Change detected in: ${filePath}`);
  runAnalysis();
});
