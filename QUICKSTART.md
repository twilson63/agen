# 🚀 Quick Start Guide

Get your first full-stack application up and running in 5 minutes!

## Prerequisites

```bash
# Node.js 18+ required
node --version  # Should be v18.0.0 or higher

# Ollama recommended (for LLM-based spec generation)
ollama list

# Pull a model (if not already installed)
ollama pull phi3    # Fast
ollama pull llama3  # Better
```

## Step 1: Generate a Specification (Tier 1)

Use natural language to describe your application:

```bash
# From the project root
cd agentic-app-generator

# Generate a specification
node tier1-spec-generator/index.mjs \
  --prompt "Create a task management application with authentication, user profiles, and a dashboard showing statistics" \
  --output specs/taskmanager.json \
  --model phi3
```

This will:
- ✅ Analyze your requirements
- ✅ Choose appropriate tech stack
- ✅ Design database schema
- ✅ Define components and routes
- ✅ Generate JSON specification

## Step 2: Render the Application (Tier 2)

Take the specification and generate the actual code:

```bash
# Render the application
node tier2-renderer/index.mjs \
  --spec specs/taskmanager.json \
  --output ./taskmanager-app
```

This will:
- ✅ Create project structure
- ✅ Generate all source files
- ✅ Set up dependencies
- ✅ Create configuration files
- ✅ Generate documentation

## Step 3: Install Dependencies

```bash
cd taskmanager-app
npm install
```

## Step 4: Run the Application

```bash
# Start development server
npm run dev

# Or in separate terminal, start backend
npm start
```

Visit `http://localhost:3000` to see your application!

## Advanced Usage

### Specify Tech Stack

```bash
node tier1-spec-generator/index.mjs \
  --prompt "Create a blog platform" \
  --stack react,vue,postgresql \
  --output specs/blog.json
```

### Refine Existing Specification

```bash
# Add features to existing spec
node tier1-spec-generator/index.mjs \
  --spec specs/taskmanager.json \
  --refine "Add file upload functionality and user avatars" \
  --output specs/taskmanager-v2.json
```

### Incremental Updates (Don't Overwrite!)

```bash
# Update existing application
node tier2-renderer/index.mjs \
  --spec specs/taskmanager-v2.json \
  --target ./taskmanager-app \
  --incremental
```

## Example Workflow

Complete workflow for a CRM application:

```bash
# 1. Generate initial spec
node tier1-spec-generator/index.mjs \
  --prompt "Create a CRM with customer management, lead tracking, and sales reports. Include user authentication and role-based access." \
  --stack react,express,postgresql \
  --features authentication,userManagement,roleBasedAccess \
  --output specs/crm.json

# 2. Review the spec
cat specs/crm.json

# 3. Generate the application
node tier2-renderer/index.mjs \
  --spec specs/crm.json \
  --output ./crm-app

# 4. Install and run
cd crm-app
npm install
npm run dev

# 5. Later, add new features
cd ..
node tier1-spec-generator/index.mjs \
  --spec specs/crm.json \
  --refine "Add email notification system and task scheduling" \
  --output specs/crm-v2.json

# 6. Update existing app (incremental - won't overwrite your changes!)
node tier2-renderer/index.mjs \
  --spec specs/crm-v2.json \
  --target ./crm-app \
  --incremental
```

## Configuration

### Create `config/settings.json`

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
  "adamsApi": {
    "enabled": true,
    "url": "https://api.scout-os.com/adams",
    "apiKey": "your-api-key"
  }
}
```

## Troubleshooting

### LLM Not Responding

```bash
# Check Ollama is running
ollama list
ollama serve
```

### Port Already in Use

```bash
# Change port in .env
PORT=3001

# Or kill existing process
lsof -ti:3000 | xargs kill
```

### Module Not Found

```bash
# Install dependencies again
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- 📖 Read the [full README](../README.md)
- 🔧 Customize the generated code
- ⚡ Add more features to the spec
- 🎨 Use the component library
- 🚀 Deploy your application

## Support

- Documentation: See README.md in each tier directory
- Examples: Check `examples/` directory
- Issues: Report on GitHub

---

**Turn ideas into applications in minutes! 🎉**