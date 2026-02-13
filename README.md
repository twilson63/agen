# Agentic Application Generator

## Project Overview

A two-tier AI-powered full-stack application generator that uses natural language input to create working applications.

### The Problem

Developing full-stack applications requires:
- Understanding requirements
- Choosing tech stack
- Setting up frontend
- Setting up backend  
- Designing database
- Creating API routes
- Wiring everything together

This is repetitive and time-consuming.

### The Solution

An AI-powered system that:
1. **Interprets** natural language requirements
2. **Architects** the application
3. **Generates** a specification (JSON)
4. **Renders** the actual code
5. **Iterates** with user feedback

## Two-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER REQUEST                             │
│          "Create a CRM with user management and dashboard"       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TIER 1: SPEC GENERATOR                        │
│    • Analyze requirements                                        │
│    • Choose tech stack                                           │
│    • Design database                                             │
│    • Define API routes                                           │
│    • Specify components                                          │
│    • Generate JSON specification                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼ JSON Spec
┌─────────────────────────────────────────────────────────────────┐
│                      JSON SPECIFICATION                        │
│  {                                                            │
│    "app": { "name": "CRM", "version": "1.0.0" },             │
│    "stack": {                                                  │
│      "frontend": "React + TypeScript",                         │
│      "backend": "Express + TypeScript",                       │
│      "database": "PostgreSQL"                                  │
│    },                                                         │
│    "components": [...],                                        │
│    "routes": [...],                                           │
│    "database": {...}                                          │
│  }                                                            │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   TIER 2: APPLICATION RENDERER                   │
│   • Parse JSON spec                                          │
│   • Scaffold project                                          │
│   • Generate files                                            │
│   • Install components                                         │
│   • Configure routes                                           │
│   • Set up database                                            │
│   • Create working application                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   WORKING APPLICATION                           │
│    📁 Full React frontend                                      │
│    📁 Express backend API                                      │
│    📁 PostgreSQL database                                      │
│    ✅ Ready to run                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### Tier 1: Specification Generator
- ✅ Natural language understanding
- ✅ Tech stack recommendations
- ✅ Database schema design
- ✅ API route definition
- ✅ Component specification
- ✅ Validation against schema
- ✅ Iterative refinement
- ✅ Multiple LLM support (Ollama, Claude)

### Tier 2: Application Renderer
- ✅ Project scaffolding
- ✅ File generation/editing
- ✅ Component instantiation
- ✅ Scout OS Atoms API integration
- ✅ Multi-framework support (React, Vue, Svelte)
- ✅ Backend support (Express, Fastify, NestJS)
- ✅ Database support (PostgreSQL, MongoDB, SQLite)
- ✅ Incremental updates (don't overwrite)
- ✅ Diff/patch for modifications
- ✅ Rollback support

### Component Library
- ✅ UI components (forms, tables, navigation)
- ✅ Feature components (auth, dashboard, CRUD)
- ✅ Page templates (landing, dashboard, settings)
- ✅ Backend components (routes, middleware, services)

## Installation

```bash
# Clone project
git clone https://github.com/twilson63/agentic-app-generator

cd agentic-app-generator

# Install dependencies
npm install

# Configure models
# Edit config/skills.json to set your LLM preferences
```

## Configuration

Create `config/settings.json`:

```json
{
  "llm": {
    "provider": "ollama",
    "model": "llama3",
    "apiUrl": "http://localhost:11434/api/generate"
  },
  "renderer": {
    "framework": "react",
    "backend": "express",
    "database": "postgresql",
    "typescript": true
  },
  "atomsApi": {
    "enabled": true,
    "url": "https://api.scoutos.com/api/atoms",
    "apiKey": "your-api-key"
  }
}
```

## Usage

### Quick Start

Generate a simple todo app:

```bash
node tier1-spec-generator/index.mjs \
  --prompt "Create a simple todo app with login" \
  --output specs/todo-app.json

node tier2-renderer/index.mjs \
  --spec specs/todo-app.json \
  --output my-todo-app
```

### Advanced Usage

```bash
# Generate with specific tech stack
node tier1-spec-generator/index.mjs \
  --prompt "Create a CRM with user management" \
  --stack "react,express,postgresql" \
  --output specs/crm.json

# Refine existing spec
node tier1-spec-generator/index.mjs \
  --spec specs/crm.json \
  --refine "Add user dashboard with analytics" \
  --output specs/crm-v2.json

# Render with custom components
node tier2-renderer/index.mjs \
  --spec specs/crm-v2.json \
  --components ./my-components \
  --output crm-app

# Modify existing app (incremental update)
node tier2-renderer/index.mjs \
  --spec new-features.json \
  --target existing-app-dir \
  --incremental
```

## Project Structure

```
agentic-app-generator/
├── tier1-spec-generator/       # Specification generator
│   ├── index.mjs              # Main skill
│   ├── llm-client.mjs         # LLM integration
│   ├── schema-validator.mjs   # JSON schema validation
│   └── prompts/               # Prompt templates
├── tier2-renderer/            # Application renderer
│   ├── index.mjs              # Main renderer
│   ├── scaffold.mjs          # Project scaffolding
│   ├── file-generator.mjs    # File creation/update
│   ├── component-instantiator.mjs  # Component handling
│   ├── atoms-api-client.mjs  # Scout OS integration
│   └── diffs/                # Diff/patch utilities
├── components-library/        # Component library
│   ├── ui/                   # UI components
│   ├── features/             # Feature components
│   ├── pages/                # Page templates
│   └── backend/              # Backend templates
├── config-schemas/           # JSON schemas
│   ├── app-specification.json
│   ├── component-definition.json
│   └── route-definition.json
├── specs/                    # Generated specs
├── examples/                 # Example applications
└── README.md                 # This file
```

## Architecture Details

### JSON Specification Schema

The JSON specification follows this structure:

```json
{
  "app": {
    "name": "string",
    "description": "string",
    "version": "string"
  },
  "stack": {
    "frontend": {
      "framework": "react|vue|svelte",
      "language": "typescript|javascript",
      "styling": "tailwind|css|styled-components"
    },
    "backend": {
      "framework": "express|fastify|nestjs",
      "language": "typescript|javascript",
      "api": "rest|graphql"
    },
    "database": {
      "type": "postgresql|mongodb|sqlite",
      "orm": "prisma|sequelize|mongoose"
    }
  },
  "components": [
    {
      "name": "string",
      "type": "ui|feature|page",
      "path": "string",
      "props": {},
      "variant": "string"
    }
  ],
  "routes": [
    {
      "path": "string",
      "method": "get|post|put|delete",
      "handler": "string",
      "auth": "boolean",
      "validation": {}
    }
  ],
  "database": {
    "models": [
      {
        "name": "string",
        "fields": [
          { "name": "string", "type": "string", "required": "boolean" }
        ]
      }
    ]
  },
  "styling": {
    "theme": {},
    "palette": {}
  }
}
```

### Data Flow

1. **Input**: Natural language request
2. **Tier 1**:
   - Parse request
   - Generate spec using LLM
   - Validate spec
   - Return JSON
3. **Tier 2**:
   - Parse JSON spec
   - Parse existing code (if modifying)
   - Generate/update files
   - Use component library
   - Call Atoms API for complex components
   - Validate generated code
4. **Output**: Working application

## Examples

See `examples/` directory for:
- Simple todo app
- Full CRM application
- Blog platform
- E-commerce store

## Scout OS Atoms API Integration

The renderer uses Atoms API for:
- Complex component generation
- Design system application
- Responsive layout generation
- Component optimization

Configuration:

```javascript
import { AtomsAPIClient } from './tier2-renderer/atoms-api-client.mjs';

const client = new AtomsAPIClient({
  apiKey: process.env.ATOMS_API_KEY,
  baseUrl: 'https://api.scoutos.com/api/atoms'
});

// Generate page
const page = await client.generatePage({
  spec: {...},
  theme: 'minimal'
});

// Generate component
const component = await client.generateComponent({
  name: 'UserDashboard',
  features: ['analytics', 'settings']
});
```

## Development

### Adding New Framework Support

1. Add framework templates to `components-library/backend/` or `/ui/`
2. Implement scaffolding logic in `tier2-renderer/scaffold.mjs`
3. Update `config-schemas/app-specification.json`

### Adding New Components

1. Create component definition
2. Add to `components-library/`
3. Update component registry
4. Test generation

### Testing

```bash
# Run all tests
npm test

# Test Tier 1 only
npm run test:tier1

# Test Tier 2 only
npm run test:tier2

# Test with example
npm run test:example todo-app
```

## Troubleshooting

### LLM Not Responding

Check Ollama is running:
```bash
ollama list
ollama serve
```

### Atoms API Errors

Check API key and quota in config

### Generation Failed

- Check specification validity
- Review logs in `.logs/`
- Use `--debug` flag for verbose output
- Check component library exists

## Roadmap

- [ ] Support for more frameworks (Next.js, Angular, Laravel)
- [ ] Advanced AI features (auto-test generation, performance optimization)
- [ ] Visual spec editor
- [ ] Real-time preview
- [ ] Team collaboration
- [ ] Cloud deployment integration
- [ ] Database migrations
- [ ] CI/CD pipeline generation

## License

MIT

## Contributing

Contributions welcome! Please see `CONTRIBUTING.md`

## Contact

Author: twilson63

---

**Transform ideas into working applications with AI** 🚀