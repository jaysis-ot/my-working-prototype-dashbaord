const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const SRC_DIR = path.join(__dirname, 'src');
const COMPONENT_TYPES = ['atoms', 'molecules', 'organisms', 'pages'];
const ROUTE_KEYWORDS = ['Route', 'Routes', 'createBrowserRouter', 'createRoutesFromElements'];

const getFilesRecursively = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const res = path.resolve(dir, entry.name);
    return entry.isDirectory() ? getFilesRecursively(res) : res;
  });
};

const isJSXFile = file => /\.(js|jsx|ts|tsx)$/.test(file);

const parseFile = (filePath) => {
  const code = fs.readFileSync(filePath, 'utf-8');
  try {
    return parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
  } catch (e) {
    console.error(`❌ Failed to parse ${filePath}: ${e.message}`);
    return null;
  }
};

const analyzeImports = (ast) => {
  const usedComponents = [];
  traverse(ast, {
    ImportDeclaration({ node }) {
      const source = node.source.value;
      const imported = node.specifiers.map(s => s.local.name);
      usedComponents.push({ importPath: source, imported });
    }
  });
  return usedComponents;
};

const categorizeComponent = (filePath) => {
  const type = COMPONENT_TYPES.find(t => filePath.includes(`${path.sep}${t}${path.sep}`));
  return type || 'unknown';
};

const findRouteFiles = (files) => {
  return files.filter(file => {
    const content = fs.readFileSync(file, 'utf8');
    return ROUTE_KEYWORDS.some(keyword => content.includes(keyword));
  });
};

const extractRoutedPages = (routeFiles, pageIdentifiers) => {
  const routed = {};

  routeFiles.forEach(file => {
    const ast = parseFile(file);
    if (!ast) return;

    // Detect classic Route: <Route element={<Page />} />
    traverse(ast, {
      JSXOpeningElement({ node }) {
        if (node.name.name === 'Route') {
          const elementAttr = node.attributes.find(attr => attr.name?.name === 'element');
          const identifier = elementAttr?.value?.expression?.name;
          if (identifier && pageIdentifiers.includes(identifier)) {
            routed[identifier] = { from: file, lazy: false };
          }
        }
      }
    });

    // Detect lazy loaded pages
    traverse(ast, {
      VariableDeclarator({ node }) {
        if (
          node.init &&
          node.init.callee?.object?.name === 'React' &&
          node.init.callee?.property?.name === 'lazy'
        ) {
          const pageName = node.id.name;
          const importArg = node.init.arguments[0]?.body?.argument?.value;
          if (pageIdentifiers.includes(pageName)) {
            routed[pageName] = {
              from: file,
              lazy: true,
              importPath: importArg || 'unknown'
            };
          }
        }
      }
    });
  });

  return routed;
};

const analyzeProject = () => {
  const allFiles = getFilesRecursively(SRC_DIR).filter(isJSXFile);
  const report = {
    components: {},
    pages: {},
    issues: [],
    routeFiles: [],
    routedPageIdentifiers: {}
  };

  for (const file of allFiles) {
    const category = categorizeComponent(file);
    const ast = parseFile(file);
    if (!ast) continue;

    const imports = analyzeImports(ast);

    if (category === 'pages') {
      const identifier = path.basename(file).replace(/\.[jt]sx?$/, '');
      report.pages[file] = {
        identifier,
        filePath: file,
        imports,
        routed: false,
        routedFrom: null,
        lazy: false
      };
    } else {
      if (!report.components[category]) report.components[category] = [];
      report.components[category].push({
        file,
        usedIn: [],
        imports
      });
    }
  }

  const routeFiles = findRouteFiles(allFiles);
  report.routeFiles = routeFiles;

  const pageIdentifiers = Object.values(report.pages).map(p => p.identifier);
  const routed = extractRoutedPages(routeFiles, pageIdentifiers);

  for (const [pagePath, pageData] of Object.entries(report.pages)) {
    const routeInfo = routed[pageData.identifier];
    if (routeInfo) {
      pageData.routed = true;
      pageData.routedFrom = routeInfo.from;
      pageData.lazy = !!routeInfo.lazy;
    } else {
      report.issues.push(`🚫 Page "${pageData.identifier}" is NOT routed.`);
    }
  }

  for (const [pagePath, pageData] of Object.entries(report.pages)) {
    const imports = pageData.imports;
    imports.forEach(imp => {
      for (const type of COMPONENT_TYPES) {
        const list = report.components[type] || [];
        list.forEach(comp => {
          const match = imp.importPath.includes(path.basename(comp.file).replace(/\.[jt]sx?$/, ''));
          if (match && !comp.usedIn.includes(pagePath)) {
            comp.usedIn.push(pagePath);
          }
        });
      }
    });
  }

  return report;
};

const run = () => {
  console.log('🔍 Analyzing project structure...');
  const result = analyzeProject();

  fs.writeFileSync('structure-report.json', JSON.stringify(result, null, 2));
  console.log('✅ structure-report.json created');

  console.log('\n📄 Pages:');
  for (const [path, info] of Object.entries(result.pages)) {
    const label = info.routed ? (info.lazy ? '✅ Routed (lazy)' : '✅ Routed') : '❌ Not routed';
    console.log(`- ${info.identifier}: ${label}`);
  }

  console.log('\n📦 Unused Components:');
  for (const [type, comps] of Object.entries(result.components)) {
    comps.forEach(comp => {
      if (comp.usedIn.length === 0) {
        console.log(`- [${type}] ${comp.file}`);
      }
    });
  }
};

run();
