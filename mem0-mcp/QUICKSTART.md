# mem0 MCP Quick Start Guide

This guide helps you set up the mem0 MCP server quickly, regardless of your directory location or username.

## Prerequisites

- Node.js (v16 or higher)
- npm
- A mem0 API key (get one from [mem0.ai](https://mem0.ai))

## One-Command Setup

From the repository root, run:

```bash
cd mem0-mcp && ./setup_mem0_mcp.sh
```

This script will:
1. Build the Node.js server
2. Create a `.env` file (if needed)
3. Make all scripts executable
4. Display the command to add the server to Claude Desktop

## Manual Setup Steps

If you prefer to set up manually:

### 1. Build the Server

```bash
cd mem0-mcp/node/mem0
npm install
npm run build
```

### 2. Create Environment File

Create a `.env` file in the `mem0-mcp` directory:

```bash
echo "MEM0_API_KEY=your_actual_api_key_here" > mem0-mcp/.env
```

### 3. Add to Claude Desktop

From the repository root, run:

```bash
./start.sh
```

Or manually run:

```bash
claude mcp add mem0-local -s user node "$(pwd)/mem0-mcp/node/mem0/dist/index.js"
```

## Verifying Setup

1. Restart Claude Desktop
2. In Claude, you should see two new tools:
   - `mcp__mem0-local__add-memory`
   - `mcp__mem0-local__search-memories`

## Testing

To test the server standalone:

```bash
cd mem0-mcp
./run_mem0_server.sh
```

## Troubleshooting

### Node.js not found
- Install Node.js from [nodejs.org](https://nodejs.org)
- Or use nvm: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash`

### Server not appearing in Claude
- Ensure you've restarted Claude Desktop
- Check that the path in the config is absolute
- Verify your MEM0_API_KEY is set correctly

### Permission denied
- Make scripts executable: `chmod +x mem0-mcp/*.sh`