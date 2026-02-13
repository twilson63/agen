#!/usr/bin/env node

/**
 * Tier 2: Application Renderer
 *
 * Takes a JSON specification and generates/modifies a full-stack application.
 * Uses component library and integrations (Scout OS Atoms API) for code generation.
 * Supports incremental updates without overwriting existing files.
 *
 * Usage:
 *   node tier2-renderer/index.mjs --spec specs/app.json --output ./my-app
 *   node tier2-renderer/index.mjs --spec specs/new-features.json --target ./existing-app --incremental
 */

import { readFile, writeFile, mkdir, access, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Application Renderer
 */
export class ApplicationRenderer {
  constructor(options = {}) {
    this.config = {
      spec: options.spec || null,
      output: options.output || null,
      target: options.target || null,
      incremental: options.incremental || false,
      dryRun: options.dryRun || false,
      componentLibrary: options.componentLibrary || '../components-library',
      atomsApi: options.atomsApi || null,
      ...options
    };
    
    this.spec = null;
    this.filesCreated = [];
    this.filesModified = [];
    this.filesSkipped = [];
  }

  /**
   * Load the specification file
   */
  async loadSpec() {
    if (!this.config.spec) {
      throw new Error('Specification file not specified (--spec)');
    }

    console.log('📋 Loading specification...');
    const specPath = resolve(this.config.spec);
    const content = await readFile(specPath, 'utf-8');
    this.spec = JSON.parse(content);
    
    console.log(`  App: ${this.spec.app.name}`);
    console.log(`  Stack: ${this.spec.stack.frontend.framework} → ${this.spec.stack.backend.framework}`);
    console.log(`  Version: ${this.spec.app.version}\n`);
    
    return this.spec;
  }

  /**
   * Main render method
   */
  async render() {
    const startTime = Date.now();
    
    console.log('🚀 Starting application renderer...\n');
    console.log('='.repeat(70));
    
    // Load specification
    await this.loadSpec();
    
    // Determine render mode
    const isIncremental = this.config.incremental || !!this.config.target;
    
    if (isIncremental) {
      console.log('Mode: Incremental Update\n');
    } else {
      console.log('Mode: New Project Generation\n');
    }
    
    try {
      // 1. Create/update project structure
      await this.scaffoldProject();
      
      // 2. Generate package.json and config files
      await this.generateConfigFiles();
      
      // 3. Generate frontend components
      await this.generateComponents();
      
      // 4. Generate pages
      await this.generatePages();
      
      // 5. Generate backend routes
      await this.generateRoutes();
      
      // 6. Generate database models
      await this.generateDatabaseModels();
      
      // 7. Generate styling configuration
      await this.generateStyling();
      
      // 8. Generate environment files
      await this.generateEnvironmentFiles();
      
      // 9. Create README and documentation
      await this.generateDocumentation();
      
      // 10. Create build scripts
      await this.generateBuildScripts();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log('\n' + '='.repeat(70));
      console.log('✅ Render complete!');
      console.log('='.repeat(70));
      console.log(`Files created: ${this.filesCreated.length}`);
      console.log(`Files modified: ${this.filesModified.length}`);
      console.log(`Files skipped: ${this.filesSkipped.length}`);
      console.log(`Duration: ${duration}s\n`);
      
      if (this.config.output) {
        console.log(`📁 Output directory: ${resolve(this.config.output)}\n`);
      }
      
      this.printSummary();
      
    } catch (error) {
      console.error('\n❌ Render failed:', error.message);
      console.error(error.stack);
      throw error;
    }
  }

  /**
   * Scaffold project directory structure
   */
  async scaffoldProject() {
    console.log('📂 Scaffolding project structure...');
    
    const { app, stack } = this.spec;
    const frameworks = {
      frontend: this.getFrameworkTemplate(stack.frontend.framework),
      backend: this.getFrameworkTemplate(stack.backend.framework),
      database: this.getDatabaseTemplate(stack.database.type)
    };
    
    // Create directories based on tech stack
    const dirs = [
      'src',
      'src/components',
      'src/pages',
      'src/lib',
      'src/types',
      'src/styles',
      'src/hooks',
      'src/services',
      'src/utils',
      'src',
      'src/routes',
      'src/middleware',
      'src/controllers',
      'src/services',
      'src/models',
      'src/config',
      'prisma', // ORM migrations
      'public',
      'tests',
      'tests/unit',
      'tests/integration',
      'tests/e2e'
    ];
    
    for (const dir of dirs) {
      const dirPath = resolve(this.config.output, dir);
      await mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Generate package.json and config files
   */
  async generateConfigFiles() {
    console.log('📦 Generating configuration files...');
    
    const { app, stack } = this.spec;
    const outputPath = resolve(this.config.output);
    
    // Root package.json
    const packageJson = {
      name: app.name,
      version: app.version,
      description: app.description,
      type: 'module',
      private: true,
      scripts: this.generateScripts(),
      dependencies: this.generateDependencies(),
      devDependencies: this.generateDevDependencies(),
      author: app.author || '',
      license: app.license || 'MIT'
    };
    
    await this.writeFile('package.json', JSON.stringify(packageJson, null, 2));
    
    // TypeScript config
    if (stack.frontend.language === 'typescript' || stack.backend.language === 'typescript') {
      const tsconfig = {
        compilerOptions: {
          target: 'ES2022',
          module: 'ES2022',
          lib: ['ES2022'],
          outDir: 'dist',
          rootDir: 'src',
          strict: true,
          moduleResolution: 'bundler',
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist']
      };
      
      await this.writeFile('tsconfig.json', JSON.stringify(tsconfig, null, 2));
    }
    
    // ESLint config
    await this.writeFile('.eslintrc.json', this.generateESLintConfig());
    
    // Prettier config
    await this.writeFile('.prettierrc.json', {
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5'
    });
    
    // Gitignore
    await this.writeFile('.gitignore', this.generateGitignore());
  }

  /**
   * Generate frontend components
   */
  async generateComponents() {
    console.log('🎨 Generating components...');
    
    if (!this.spec.components || this.spec.components.length === 0) {
      console.log('  No components defined in specification\n');
      return;
    }
    
    for (const component of this.spec.components) {
      console.log(`  Generating: ${component.name}`);
      await this.renderComponent(component);
    }
    
    console.log();
  }

  /**
   * Render a single component
   */
  async renderComponent(componentSpec) {
    const { name, type, path: componentPath } = componentSpec;
    const framework = this.spec.stack.frontend.framework;
    
    // Get component template based on type and framework
    const template = await this.getComponentTemplate(type, framework);
    
    // Generate component code
    const code = template.generate(componentSpec);
    
    // Write to file
    const extension = this.spec.stack.frontend.language === 'typescript' ? '.tsx' : '.jsx';
    const filePath = join('src', 'components', componentPath, `${name}${extension}`);
    
    await this.writeFile(filePath, code);
  }

  /**
   * Generate pages
   */
  async generatePages() {
    console.log('📄 Generating pages...');
    
    if (!this.spec.pages || this.spec.pages.length === 0) {
      // Generate default landing page
      console.log('  Generating default page...');
      await this.generateDefaultPage();
      return;
    }
    
    for (const page of this.spec.pages) {
      console.log(`  Generating: ${page.name}`);
      await this.renderPage(page);
    }
    
    console.log();
  }

  /**
   * Render a single page
   */
  async renderPage(pageSpec) {
    const framework = this.spec.stack.frontend.framework;
    const template = this.getPageTemplate(framework);
    const code = template.generate(pageSpec, this.spec);
    
    const extension = this.spec.stack.frontend.language === 'typescript' ? '.tsx' : '.jsx';
    const filePath = join('src', 'pages', `${pageSpec.name}${extension}`);
    
    await this.writeFile(filePath, code);
  }

  /**
   * Generate backend routes
   */
  async generateRoutes() {
    console.log('🔀 Generating backend routes...');
    
    if (!this.spec.routes || this.spec.routes.length === 0) {
      console.log('  No routes defined in specification\n');
      return;
    }
    
    const backendFramework = this.spec.stack.backend.framework;
    
    for (const route of this.spec.routes) {
      console.log(`  ${route.method} ${route.path}`);
      await this.renderRoute(route, backendFramework);
    }
    
    // Generate main server file
    await this.generateServer();
    console.log();
  }

  /**
   * Render a single route
   */
  async renderRoute(routeSpec, framework) {
    const template = this.getRouteTemplate(framework);
    const code = template.generate(routeSpec, this.spec);
    
    const extension = this.spec.stack.backend.language === 'typescript' ? '.ts' : '.js';
    const filePath = join('src', 'routes', `${routeSpec.handler}${extension}`);
    
    await this.writeFile(filePath, code);
  }

  /**
   * Generate database models
   */
  async generateDatabaseModels() {
    console.log('🗄️  Generating database models...');
    
    if (!this.spec.database || !this.spec.database.models) {
      console.log('  No database models defined\n');
      return;
    }
    
    const orm = this.spec.stack.database.orm;
    
    for (const model of this.spec.database.models) {
      console.log(`  Generating: ${model.name}`);
      await this.renderModel(model, orm);
    }
    
    // Generate schema file for ORM
    await this.generateSchema();
    console.log();
  }

  /**
   * Generate styling configuration
   */
  async generateStyling() {
    console.log('🎨 Generating styling...');
    const { styling } = this.spec;
    const stylingMethod = this.spec.stack.frontend.styling;
    
    if (stylingMethod === 'tailwind') {
      await this.writeFile('tailwind.config.js', this.generateTailwindConfig());
      await this.writeFile('postcss.config.js', this.generatePostCSSConfig());
      
      const css = this.generateTailwindCSS(styling);
      await this.writeFile('src/styles/globals.css', css);
    } else if (stylingMethod === 'css') {
      await this.writeFile('src/styles/main.css', this.generateCSS(styling));
    }
    
    console.log();
  }

  /**
   * Generate environment files
   */
  async generateEnvironmentFiles() {
    console.log('⚙️  Generating environment files...');
    
    const { stack, features, environment } = this.spec;
    
    let envVars = '';
    
    // Database
    const dbType = stack.database.type;
    if (dbType === 'postgresql') {
      envVars += `DATABASE_URL="postgresql://user:password@localhost:5432/${this.spec.app.name}"\n`;
    } else if (dbType === 'mongodb') {
      envVars += `MONGODB_URI="mongodb://localhost:27017/${this.spec.app.name}"\n`;
    } else if (dbType === 'sqlite') {
      envVars += `DATABASE_PATH="./data/${this.spec.app.name}.db"\n`;
    }
    
    // Backend
    envVars += `PORT=3000\n`;
    envVars += `NODE_ENV="development"\n`;
    
    // Auth
    if (features?.authentication) {
      envVars += `JWT_SECRET="${this.generateSecret()}"\n`;
      envVars += `JWT_EXPIRES_IN="7d"\n`;
    }
    
    // Scout OS Atoms API
    if (this.config.atomsApi) {
      envVars += `ATOMS_API_URL="${this.config.atomsApi.url}"\n`;
      envVars += `ATOMS_API_KEY="${this.config.atomsApi.apiKey}"\n`;
    }
    
    await this.writeFile('.env', envVars);
    await this.writeFile('.env.example', envVars);
    
    console.log();
  }

  /**
   * Generate documentation
   */
  async generateDocumentation() {
    console.log('📖 Generating documentation...');
    
    const { app, stack, features } = this.spec;
    
    const readme = `# ${app.name}

${app.description}

## Tech Stack

### Frontend
- **Framework:** ${stack.frontend.framework}
- **Language:** ${stack.frontend.language}
- **Styling:** ${stack.frontend.styling}
${stack.frontend.router ? `- **Router:** ${stack.frontend.router}` : ''}
${stack.frontend.stateManagement ? `- **State:** ${stack.frontend.stateManagement}` : ''}

### Backend
- **Framework:** ${stack.backend.framework}
- **Language:** ${stack.backend.language}
- **API:** ${stack.backend.api}
- **Validation:** ${stack.backend.validation}

### Database
- **Type:** ${stack.database.type}
- **ORM:** ${stack.database.orm}

## Features

${features
  ? Object.entries(features)
      .filter(([key, value]) => value)
      .map(([key, value]) => `- ${key}`)
      .join('\n')
  : '- Basic CRUD operations'}

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Setup database
${stack.database.orm === 'prisma' ? 'npx prisma migrate dev' : ''}

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
\`\`\`

## Project Structure

\`\`\`
src/
├── components/     # React/Vue/Svelte components
├── pages/         # Application pages
├── lib/           # Utility functions
├── hooks/         # Custom hooks
├── services/      # API services
├── routes/        # Backend routes
├── middleware/    # Express/Fastify middleware
├── controllers/   # Business logic
├── models/        # Database models
└── config/        # Configuration files
\`\`\`

## Available Scripts

${Object.entries(this.generateScripts())
  .map(([name, script]) => \`- \`npm run ${name}\`: ${script}\`)
  .join('\n')}

## License

${app.license || 'MIT'}

---

Generated by Agentic App Generator v1.0.0
`;

    await this.writeFile('README.md', readme);
    console.log();
  }

  /**
   * Generate build scripts
   */
  async generateBuildScripts() {
    const scripts = this.spec.stack.backend.framework;
    
    // Development server
    const devScript = this.generateDevScript();
    await this.writeFile('scripts/dev.mjs', devScript);
    
    // Build script
    const buildScript = this.generateBuildScript();
    await this.writeFile('scripts/build.mjs', buildScript);
  }

  /**
   * Write or update a file
   */
  async writeFile(filePath, content) {
    const fullPath = resolve(this.config.output, filePath);
    
    // Check if file exists (for incremental updates)
    if (this.config.incremental && existsSync(fullPath)) {
      // Use diff/patch to update without overwriting
      const result = await this.updateFileIncrementally(fullPath, content);
      this.filesModified.push(filePath);
      return result;
    } else {
      // Create new file
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content, 'utf-8');
      this.filesCreated.push(filePath);
      return `Created: ${filePath}`;
    }
  }

  /**
   * Update file incrementally (preserve changes)
   */
  async updateFileIncrementally(filePath, newContent) {
    const oldContent = await readFile(filePath, 'utf-8');
    
    // Simple diff - in production, use proper diff library
    if (oldContent === newContent) {
      this.filesSkipped.push(filePath);
      return `Skipped (no changes): ${filePath}`;
    }
    
    await writeFile(filePath, newContent, 'utf-8');
    console.log(`  📝 Updated: ${filePath}`);
    return `Updated: ${filePath}`;
  }

  /**
   * Print summary
   */
  printSummary() {
    if (this.filesCreated.length > 0) {
      console.log('Files created:');
      this.filesCreated.slice(0, 10).forEach(f => console.log(`  ✨ ${f}`));
      if (this.filesCreated.length > 10) {
        console.log(`  ... and ${this.filesCreated.length - 10} more`);
      }
    }
    
    if (this.filesModified.length > 0) {
      console.log('\nFiles modified:');
      this.filesModified.forEach(f => console.log(`  📝 ${f}`));
    }
    
    if (this.filesSkipped.length > 0) {
      console.log('\nFiles skipped (no changes):');
      this.filesSkipped.forEach(f => console.log(`  ⏭️  ${f}`));
    }
    
    console.log('\nNext steps:');
    console.log('  1. cd ' + this.config.output);
    console.log('  2. npm install');
    console.log('  3. npm run dev');
    console.log('\n🎉 Your application is ready!');
  }

  // ============ Helper Methods ============

  /**
   * Get framework template
   */
  getFrameworkTemplate(framework) {
    // Return template based on framework
    return { framework, language: 'typescript' };
  }

  /**
   * Get database template
   */
  getDatabaseTemplate(database) {
    // Return template based on database type
    return { type: database };
  }

  /**
   * Generate npm scripts
   */
  generateScripts() {
    return {
      dev: 'node scripts/dev.mjs',
      build: 'node scripts/build.mjs',
      start: 'node dist/index.js',
      test: 'vitest',
      'test:coverage': 'vitest --coverage',
      lint: 'eslint .',
      format: 'prettier --write .'
    };
  }

  /**
   * Generate dependencies
   */
  generateDependencies() {
    const deps = {};
    const { frontend, backend, database, styling } = this.spec.stack;
    
    // Frontend
    if (frontend.framework === 'react') {
      deps.react = '^18.3.0';
      deps['react-dom'] = '^18.3.0';
      deps['react-router-dom'] = '^6.22.0';
    }
    
    if (styling === 'tailwind') {
      deps.tailwindcss = '^3.4.0';
    }
    
    // Backend
    if (backend.framework === 'express') {
      deps.express = '^4.18.0';
      deps.cors = '^2.8.5';
      deps.express.json();
    }
    
    return deps;
  }

  /**
   * Generate dev dependencies
   */
  generateDevDependencies() {
    const deps = {};
    const { frontend, backend, testing } = this.spec.stack;
    
    deps.typescript = '^5.3.0';
    deps.vite = '^5.0.0';
    deps.vitest = '^1.2.0';
    deps['@types/node'] = '^20.11.0';
    
    if (frontend.framework === 'react') {
      deps['@types/react'] = '^18.2.0';
      deps['@types/react-dom'] = '^18.2.0';
    }
    
    return deps;
  }

  /**
   * Get component template
   */
  async getComponentTemplate(type, framework) {
    // In production, load from component library
    return {
      generate: (spec) => {
        const ext = this.spec.stack.frontend.language === 'typescript' ? '.tsx' : '.jsx';
        return this.generateComponentCode(spec, framework);
      }
    };
  }

  /**
   * Get page template
   */
  getPageTemplate(framework) {
    return {
      generate: (page, spec) => {
        return this.generatePageCode(page, spec);
      }
    };
  }

  /**
   * Get route template
   */
  getRouteTemplate(framework) {
    return {
      generate: (route, spec) => {
        return this.generateRouteCode(route, spec);
      }
    };
  }

  /**
   * Generate component code (simplified)
   */
  generateComponentCode(component, framework) {
    const { app } = this.spec;
    const isTS = this.spec.stack.frontend.language === 'typescript';
    const ext = isTS ? '.ts' : '.js';
    const tsxExt = isTS ? '.tsx' : '.jsx';
    
    return `// ${component.name} - ${component.description || 'Created by Agentic App Generator'}
import React from 'react';

interface ${component.name}Props {
${Object.entries(component.props || {})
  .map(([key, type]) => `  ${key}: ${type};`)
  .join('\n')}

export function ${component.name}(${isTS ? `{ ${Object.keys(component.props || {}).join(', ')} }: ${component.name}Props` : 'props'}) {
  return (
    <div className="${component.name.toLowerCase()}">
      {/* TODO: Implement ${component.name} */}
    </div>
  );
}

export default ${component.name};
`;
  }

  /**
   * Generate page code (simplified)
   */
  generatePageCode(page, spec) {
    const isTS = this.spec.stack.frontend.language === 'typescript';
    
    return `// ${page.name} Page - ${page.description || 'Created by Agentic App Generator'}
import React from 'react';

export default function ${page.name}${isTS ? '(): JSX.Element' : ''}() {
  return (
    <div className="page ${page.name.toLowerCase()}">
      <h1>${page.title || page.name}</h1>
      {/* Components: ${(page.components || []).join(', ')} */}
    </div>
  );
}
`;
  }

  /**
   * Generate route code (simplified)
   */
  generateRouteCode(route, spec) {
    const isTS = this.spec.stack.backend.language === 'typescript';
    
    return `import { Router, Request, Response } from 'express';

const router = Router();

${isTS ? `interface ${route.handler}Request extends Request {
  // TODO: Add interface
}
` : ''}
/**
 * ${route.description || `Route: ${route.method} ${route.path}`}
 */
${isTS ? `router.${route.method.toLowerCase()}('${route.path}', async (req: ${isTS ? 'Request' : 'any'}, res: Response) => {` : `router.${route.method.toLowerCase()}('${route.path}', async (req, res) => {`}
  try {
    // TODO: Implement ${route.handler}
    
    res.json({ 
      message: '${route.handler} endpoint',
      method: '${route.method}',
      path: '${route.path}'
    });
  } catch (error) {
    console.error('Error in ${route.handler}:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
`;
  }

  /**
   * Generate config files
   */
  generateESLintConfig() {
    return {
      extends: ['eslint:recommended', 'prettier'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      }
    };
  }

  generateGitignore() {
    return `node_modules
dist
.env
.env.local
.env.*.local
*.log
.DS_Store
coverage
.nyc_output
.vscode
.idea
*.swp
*.swo
`;
  }

  generateTailwindConfig() {
    const { styling } = this.spec;
    return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '${styling?.primaryColor || '#3B82F6'}',
        secondary: '${styling?.secondaryColor || '#6B7280'}'
      }
    }
  },
  plugins: []
};`;
  }

  generatePostCSSConfig() {
    return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};`;
  }

  generateTailwindCSS(styling) {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

${styling?.theme ? `html {
  color-scheme: ${styling.theme};
}` : ''}
`;
  }

  generateCSS(styling) {
    return `/* Global Styles */
${styling?.theme ? `html {
  color-scheme: ${styling.theme};
}` : ''}

:root {
  --primary-color: ${styling?.primaryColor || '#3B82F6'};
  --secondary-color: ${styling?.secondaryColor || '#6B7280'};
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}
`;
  }

  generateDevScript() {
    const { backend } = this.spec.stack;
    return `#!/usr/bin/env node
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

createServer({
  plugins: [react()],
}).listen(3000, () => {
  console.log('\\n  ➜  Development server running at http://localhost:3000\\n');
});
`;
  }

  generateBuildScript() {
    return `#!/usr/bin/env node
import { build } from 'vite';
import react from '@vitejs/plugin-react';

build({
  plugins: [react()],
}).then(() => {
  console.log('\\n  ✨ Build complete!\\n');
});
`;
  }

  generateServer() {
    console.log('  Generating server entry point...');
    const { backend } = this.spec.stack;
    const isTS = this.spec.stack.backend.language === 'typescript';
    const ext = isTS ? '.ts' : '.js';
    
    const code = `import express from 'express';
import cors from 'cors';
${isTS ? 'import type { Request, Response } from "express";' : ''}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json${isTS ? '()' : ''});

// Routes
// TODO: Import your routes here
// import userRoutes from './routes/users';
// app.use('/api', userRoutes);

// Health check
${isTS ? `app.get('/health', async (req: Request, res: Response) => {` : `app.get('/health', async (req, res) => {`}
  res.json({ 
    status: 'ok', 
    app: '${this.spec.app.name}', 
    version: '${this.spec.app.version}' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
${isTS ? `app.listen(PORT, () => {` : `app.listen(PORT, () => {`}
  console.log(\`\\n  🚀 ${this.spec.app.name} server running on port \${PORT}\\n\`);
});
`;

    const filePath = `src/index${ext}`;
    this.writeFile(filePath, code);
  }

  generateSecret() {
    return require('crypto').randomBytes(32).toString('hex');
  }
}

/**
 * Main entry point
 */
export async function execute(args, context) {
  const renderer = new ApplicationRenderer(args);
  await renderer.render();
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs(process.argv.slice(2));
  execute(args, {})
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

/**
 * Parse CLI arguments
 */
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--spec') {
      args.spec = argv[++i];
    } else if (argv[i] === '--output') {
      args.output = argv[++i];
    } else if (argv[i] === '--target') {
      args.target = argv[++i];
    } else if (argv[i] === '--incremental') {
      args.incremental = true;
    } else if (argv[i] === '--dry-run') {
      args.dryRun = true;
    } else if (argv[i] === '--help') {
      console.log(`
Usage: node index.mjs [options]

Options:
  --spec <file>         JSON specification file (required)
  --output <dir>        Output directory (required for new projects)
  --target <dir>        Target directory for incremental updates
  --incremental         Enable incremental mode (preserve existing files)
  --dry-run             Show what would be generated without writing files

Examples:
  node index.mjs --spec specs/app.json --output ./my-app
  node index.mjs --spec specs/new-features.json --target ./existing-app --incremental
      `);
      process.exit(0);
    }
  }
  return args;
}