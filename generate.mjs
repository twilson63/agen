#!/usr/bin/env node

/**
 * Generate a two-tier agentic application architecture
 */

import { DailyCodingAgent } from '../.opencode/skills/daily-coding-agent/index.mjs';
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

async function generateProject() {
  console.log('🏗️  Generating Agentic Application Generator Project...\n');
  console.log('='.repeat(70));
  
  const agent = new DailyCodingAgent({
    model: 'llama3',
    debug: false
  });
  
  const prompts = [
    {
      name: 'JSON Schema Design',
      file: 'config-schemas/app-specification.schema.md',
      prompt: `Design a comprehensive JSON schema for declarative full-stack application specifications. The schema should describe:

1. Application metadata (name, description, version)
2. Tech stack (frontend framework, backend framework, database, api layer)
3. Frontend components (pages, routes, components with props and state)
4. Backend routes (endpoints, methods, handlers)
5. Database schema (tables/queries, relationships, indexes)
6. API contracts (request/response schemas, validation rules)
7. Styling (theme, palette, responsive breakpoints)
8. Deployment config (hosting, environment variables, build settings)

The schema should be valid and include:
- Required vs optional fields
- Nested objects for complex structures
- Arrays for listings (components, routes, etc.)
- Type definitions for each field
- Examples for all key sections

Output as a markdown document with:
- Overview of schema purpose
- Complete JSON schema example
- Field descriptions
- Usage examples`
    },
    {
      name: 'Tier 1 Skill Implementation',
      file: 'tier1-spec-generator/index.mjs',
      prompt: `Create an OpenCode skill implementation for Tier 1 (Specification Generator). This skill:

- Takes natural language requirements as input
- Intelligently designs the application architecture
- Generates a complete JSON specification document
- Uses LLM (Ollama/Claude) to make architectural decisions
- Validates the output against the JSON schema
- Supports iterative refinement

Features needed:
1. Main skill class with execute() method
2. LLM client for generating specifications
3. JSON schema validator
4. Prompt templates for consistency
5. Support for "refine" - improving an existing spec
6. Component library awareness
7. Tech stack recommendations

Implementation should:
- Use ES modules
- Be well-documented
- Handle errors gracefully
- Include logging/debug modes
- Have comprehensive JSDoc comments
- Support both Ollama and Claude APIs`
    },
    {
      name: 'Tier 2 Renderer Implementation',
      file: 'tier2-renderer/index.mjs',
      prompt: `Create the Tier 2 (Application Renderer) implementation. This script:

- Takes the JSON spec from Tier 1
- Executes the actual application generation
- Generates/modifies files (component files, routes, configs)
- Integrates with generative UI APIs (Scout OS Adams API)
- Uses a component library to instantiate components
- Creates a working full-stack application

Features needed:
1. Main renderer class
2. File system operations (create/update files)
3. Component instantiation from library
4. API integration layer (Adams API on Scout OS)
5. Scaffold generator (new project vs. modify existing)
6. Dependency installation commands
7. Build configuration generation
8. Route and page generators
9. Database migration generators
10. Progress tracking and reporting

Key requirements:
- Handle incremental updates (don't overwrite everything)
- Preserve existing code when possible
- Use code diff/patch for updates
- Support multiple frontend frameworks (React, Vue, Svelte)
- Support multiple backend frameworks (Express, Fastify, NestJS)
- Generate TypeScript definitions
- Create test files
- Generate documentation
- Include error recovery and rollback

Output as ES module with:
- ES modules
- Async/await throughout
- Comprehensive error handling
- Progress callbacks
- Logging at appropriate levels
- JSDoc documentation`
    },
    {
      name: 'Component Library',
      file: 'components-library/README.md',
      prompt: `Design a component library framework for the generated applications. The library should include:

1. Core UI Components:
   - Layout (Container, Grid, Flex, Card)
   - Form components (Input, Button, Select, Form)
   - Navigation (Navbar, Sidebar, Breadcrumb)
   - Data display (Table, List, Badge, Tag)
   - Feedback (Modal, Toast, Alert)

2. Feature Components:
   - Auth components (LoginForm, RegisterForm, ResetPassword)
   - User profile (ProfileCard, UserMenu, Avatar)
   - Dashboard (Stats, Charts, Activity Feed)
   - CRUD (DataGrid, FormBuilder, FilterBar)
   - Search (SearchBar, ResultList, Pagination)

3. Page Templates:
   - Landing page
   - Dashboard home
   - Auth pages (login, register)
   - CRUD list page
   - CRUD detail page
   - Settings page
   - Profile page

4. Backend Components:
   - Route handlers (CRUD endpoints)
   - Middleware (auth, error handling, validation)
   - Services (database, external APIs)
   - Models (database schemas, ORM models)
   - Controllers (business logic)

Each component should have:
- Metadata (name, description, category, props)
- Default implementation (React/Vue/Svelte templates)
- Variations (sizes, styles, states)

Output as markdown describing:
- Library structure
- Component categories
- Component metadata format
- Example component definitions
- Integration approach with Tier 2 renderer
`
    },
    {
      name: 'Adams API Integration',
      file: 'tier2-renderer/adams-api-client.mjs',
      prompt: `Create a client library for integrating with Scout OS Adams API for generative UI. The client should:

1. Connect to Adams API endpoints
2. Send application specifications
3. Receive generated UI components
4. Handle authentication
5. Manage rate limiting
6. Parse and process responses
7. Error handling and retry logic
8. Stream support for large generations
9. Cache generated components
10. Version compatibility

API integration should support:
- Generate component from spec
- Generate page from layout spec
- Generate application from full spec
- Validate generated code
- Preview generated code
- Apply design systems/themes

Implementation should:
- Use fetch API with proper headers
- Support webhook callbacks
- Handle streaming responses
- Include request/response interceptors
- Have configurable timeouts
- Support mocked/testing mode
- Include comprehensive error types
- Type definitions for all API responses

Output as ES module with:
- Client class
- Method calls for each API operation
- Type definitions
- Error classes
- Configuration options
- JSDoc documentation
- Example usage`
    },
    {
      name: 'Project README',
      file: 'README.md',
      prompt: `Create a comprehensive README for the Agentic Application Generator project. Include:

1. Project Overview
   - What it is
   - Two-tier architecture explanation
   - Problem it solves
   - Use cases

2. Architecture
   - Tier 1: Specification Generator
   - Tier 2: Application Renderer
   - Component Library
   - Data flow diagram

3. Features
   - Natural language to full-stack app
   - Multi-framework support
   - Incremental updates
   - Component library integration
   - Scout OS Adams API integration

4. Installation & Setup
   - Prerequisites
   - Installation steps
   - Configuration

5. Usage
   - Quick start example
   - Advanced usage
   - CLI commands
   - API usage

6. Development
   - Project structure
   - Adding new components
   - Extending frameworks
   - Testing

7. Configuration
   - LLM settings
   - Framework choices
   - Component library paths
   - API keys

8. Examples
   - Generate a simple todo app
   - Generate a full-stack CRM
   - Modify existing application

9. Troubleshooting
10. Roadmap
11. License

Include diagrams using ASCII art or mermaid where helpful.

Write in clear, developer-friendly language.`
    }
  ];

  console.log('📋 Generating project files using Daily Coding Agent...\n');
  
  for (const { name, file, prompt } of prompts) {
    console.log(`\n📁 ${name}`);
    console.log('─'.repeat(70));
    
    try {
      const result = await agent.execute({ prompt }, {});
      
      // Ensure directory exists
      await mkdir(dirname(file), { recursive: true });
      
      // Write to file
      await writeFile(file, result.response, 'utf-8');
      
      console.log(`✅ Generated: ${file}`);
      console.log(`   Duration: ${result.duration}s`);
      console.log(`   Model: ${result.model}`);
    } catch (error) {
      console.error(`❌ Error generating ${name}:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('🎉 Project generation complete!');
  console.log('='.repeat(70));
}

generateProject().catch(console.error);