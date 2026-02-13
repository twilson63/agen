#!/usr/bin/env node

/**
 * Tier 1: Specification Generator
 * 
 * An OpenCode skill that takes natural language requirements
 * and generates a JSON declarative specification for a full-stack application.
 * 
 * Usage:
 *   use spec generator to create a CRM with user authentication
 *   use spec generator with spec specs/crm.json to add dashboard
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default configuration
const CONFIG = {
  llmProvider: 'ollama', // 'ollama' | 'anthropic' | 'openai'
  model: 'llama3',
  outputPath: './specs',
  schemaPath: './config-schemas/app-specification.schema.md',
  maxTokens: 8000,
  temperature: 0.7
};

/**
 * Specification Generator
 */
export class SpecificationGenerator {
  constructor(options = {}) {
    this.config = { ...CONFIG, ...options };
    this.schema = null;
  }

  /**
   * Load the JSON schema for validation
   */
  async loadSchema() {
    if (this.schema) return this.schema;

    try {
      const schemaPath = resolve(__dirname, '../config-schemas/app-specification.schema.md');
      const content = await readFile(schemaPath, 'utf-8');
      this.schema = content;
      return this.schema;
    } catch (error) {
      console.warn('Warning: Could not load schema, validation will be skipped');
      return null;
    }
  }

  /**
   * Generate specification from natural language prompt
   */
  async generate(prompt, options = {}) {
    const {
      refine = null,
      stack = null,
      features = [],
      model = this.config.model
    } = options;

    console.log('📋 Generating specification...');
    console.log('─'.repeat(70));
    console.log(`Prompt: ${prompt.substring(0, 100)}...`);

    // Load schema for context
    await this.loadSchema();

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt({
      refine,
      stack,
      features
    });

    // Build user prompt
    const userPrompt = this.buildUserPrompt(prompt, refine);

    // Call LLM
    const response = await this.callLLM(systemPrompt, userPrompt, { model });

    // Parse JSON from response
    const specification = this.parseJSON(response);

    // Validate (if schema loaded)
    if (specification) {
      this.logSpecification(specification);
    }

    return specification;
  }

  /**
   * Build system prompt with schema context
   */
  buildSystemPrompt(options) {
    const { refine, stack, features } = options;

    let prompt = `You are an expert software architect and full-stack application designer.
Your task is to generate a comprehensive JSON specification for a full-stack application.

`;

    // Add schema overview
    if (this.schema) {
      prompt += `IMPORTANT: The JSON specification must follow this schema structure:

{
  "app": { "name", "description", "version", "author", "license" },
  "stack": {
    "frontend": { "framework", "language", "styling", "router", "stateManagement" },
    "backend": { "framework", "language", "api", "validation" },
    "database": { "type", "orm", "migrationTool" },
    "testing": { "unit", "e2e" },
    "deployment": { "hosting", "container" }
  },
  "components": [ { "name", "type", "path", "description", "props" } ],
  "pages": [ { "name", "path", "components", "auth" } ],
  "routes": [ { "path", "method", "handler", "auth" } ],
  "database": { "models": [ { "name", "fields" } ] },
  "styling": { "theme", "primaryColor" },
  "features": { "authentication", "logging", "apiDocs" }
}

`;
    }

    // Add refinement context
    if (refine) {
      prompt += `
MODE: Refinement
You are modifying an existing specification. Keep all existing structure and only update/add what's needed to incorporate the new requirements.
`;
    }

    // Add tech stack constraint
    if (stack) {
      prompt += `
TECH STACK CONSTRAINTS:
Frameworks to use: ${stack.map(s => s.trim()).join(', ')}
`;
    }

    // Add features
    if (features.length > 0) {
      prompt += `
REQUIRED FEATURES:
${features.map(f => `- ${f}`).join('\n')}
`;
    }

    prompt += `
GUIDELINES:
1. Use kebab-case for app names (e.g., "todo-app")
2. Use PascalCase for component names
3. Start all routes with "/"
4. Include only necessary fields (don't add fields just for completeness)
5. Be pragmatic - choose appropriate tech stack based on requirements
6. Include authentication routes only if features.authentication is true
7. Generate realistic and useful components
8. Design database models with proper field types and relationships
9. Include at least one example for each major section

Respond with ONLY valid JSON. No markdown, no explanation, just the JSON object.
`;

    return prompt;
  }

  /**
   * Build user prompt from input
   */
  buildUserPrompt(prompt, existingSpec) {
    if (existingSpec) {
      return `
EXISTING SPECIFICATION:
${JSON.stringify(existingSpec, null, 2)}

NEW REQUIREMENT:
${prompt}

Generate the updated JSON specification incorporating the new requirement while preserving existing structure.
`;
    }

    return `
REQUIREMENT:
${prompt}

Generate a complete JSON specification for this application following the schema and guidelines provided.
`;
  }

  /**
   * Call LLM (Ollama, Anthropic, or OpenAI)
   */
  async callLLM(systemPrompt, userPrompt, options = {}) {
    const { model = this.config.model } = options;

    console.log(`🤖 Calling LLM (${model})...`);

    if (this.config.llmProvider === 'ollama') {
      return await this.callOllama(systemPrompt, userPrompt, model);
    } else if (this.config.llmProvider === 'anthropic') {
      return await this.callAnthropic(systemPrompt, userPrompt);
    } else if (this.config.llmProvider === 'openai') {
      return await this.callOpenAI(systemPrompt, userPrompt);
    } else {
      throw new Error(`Unsupported LLM provider: ${this.config.llmProvider}`);
    }
  }

  /**
   * Call Ollama
   */
  async callOllama(systemPrompt, userPrompt, model) {
    const { spawn } = await import('child_process');

    return new Promise((resolve, reject) => {
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      
      const child = spawn('ollama', ['run', '--system', systemPrompt, model], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      child.stdin.write(userPrompt);
      child.stdin.end();

      let output = '';
      let error = '';

      child.stdout.on('data', (chunk) => {
        output += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        error += chunk.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Ollama error: ${error}`));
        }
      });

      child.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Call Anthropic Claude
   */
  async callAnthropic(systemPrompt, userPrompt) {
    // Placeholder for Anthropic integration
    throw new Error('Anthropic integration not yet implemented');
  }

  /**
   * Call OpenAI
   */
  async callOpenAI(systemPrompt, userPrompt) {
    // Placeholder for OpenAI integration
    throw new Error('OpenAI integration not yet implemented');
  }

  /**
   * Parse JSON from LLM response
   */
  parseJSON(response) {
    // Try to find JSON in response
    const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      throw new Error('No JSON found in LLM response');
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      // Try to clean up JSON
      const cleaned = this.cleanJSON(jsonMatch[0]);
      try {
        return JSON.parse(cleaned);
      } catch (error2) {
        throw new Error(`Failed to parse JSON: ${error2.message}`);
      }
    }
  }

  /**
   * Clean up JSON string
   */
  cleanJSON(str) {
    return str
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/\/\/.*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();
  }

  /**
   * Log specification summary
   */
  logSpecification(spec) {
    if (!spec) return;

    console.log('\n' + '='.repeat(70));
    console.log('✅ Specification Generated');
    console.log('='.repeat(70));
    console.log(`App: ${spec.app?.name || 'Unknown'} (v${spec.app?.version || '1.0.0'})`);
    console.log(`Stack: ${spec.stack?.frontend?.framework || 'N/A'} → ${spec.stack?.backend?.framework || 'N/A'} → ${spec.stack?.database?.type || 'N/A'}`);
    console.log(`Components: ${spec.components?.length || 0}`);
    console.log(`Pages: ${spec.pages?.length || 0}`);
    console.log(`Routes: ${spec.routes?.length || 0}`);
    console.log(`Database Models: ${spec.database?.models?.length || 0}`);
    console.log('='.repeat(70));
  }

  /**
   * Save specification to file
   */
  async saveToFile(specification, filename) {
    const outputPath = resolve(this.config.outputPath, filename);
    await mkdir(dirname(outputPath), { recursive: true });
    
    const content = JSON.stringify(specification, null, 2);
    await writeFile(outputPath, content, 'utf-8');

    console.log(`💾 Saved specification to: ${outputPath}`);
    return outputPath;
  }

  /**
   * Load specification from file
   */
  async loadFromFile(filename) {
    const specPath = resolve(this.config.outputPath, filename);
    const content = await readFile(specPath, 'utf-8');
    return JSON.parse(content);
  }
}

/**
 * Main entry point (when used directly)
 */
export async function execute(args, context) {
  const specGen = new SpecificationGenerator();

  try {
    // Parse arguments
    const {
      prompt,
      spec,
      refine,
      stack,
      features,
      output,
      model
    } = args;

    // Handle different modes
    if (refine) {
      // Mode: Refine existing spec
      console.log('🔄 Refining specification...');
      const existingSpec = await specGen.loadFromFile(spec);
      const newSpec = await specGen.generate(refine, { refine: existingSpec, stack, features, model });
      
      if (output) {
        await specGen.saveToFile(newSpec, output);
      }
      
      return newSpec;
    } else if (prompt) {
      // Mode: Generate from scratch
      const specification = await specGen.generate(prompt, { stack, features, model });
      
      if (output) {
        const defaultFilename = `${specification.app?.name || 'app'}-spec.json`;
        await specGen.saveToFile(specification, output || defaultFilename);
      }
      
      return specification;
    } else {
      throw new Error('Either --prompt or --refine must be specified');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
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
    if (argv[i] === '--prompt') {
      args.prompt = argv[++i];
    } else if (argv[i] === '--spec') {
      args.spec = argv[++i];
    } else if (argv[i] === '--refine') {
      args.refine = argv[++i];
    } else if (argv[i] === '--stack') {
      args.stack = argv[++i].split(',');
    } else if (argv[i] === '--features') {
      args.features = argv[++i].split(',');
    } else if (argv[i] === '--model') {
      args.model = argv[++i];
    } else if (argv[i] === '--output') {
      args.output = argv[++i];
    } else if (argv[i] === '--help') {
      console.log(`
Usage: node index.mjs [options]

Options:
  --prompt <text>       Generate spec from natural language
  --spec <file>         Existing spec to refine
  --refine <text>       Refinement requirements
  --stack <frameworks>   Comma-separated tech stack
  --features <features> Comma-separated features
  --model <model>       LLM model to use
  --output <file>       Output file path
  --help                Show this help

Examples:
  node index.mjs --prompt "Create a CRM with authentication" --output crm.json
  node index.mjs --spec crm.json --refine "Add analytics dashboard" --output crm-v2.json
  node index.mjs --prompt "Todo app" --stack react,express,postgresql --output todo.json
      `);
      process.exit(0);
    }
  }
  return args;
}