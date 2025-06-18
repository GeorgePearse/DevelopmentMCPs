# Setting up mem0 MCP Server for Claude Desktop

This guide explains how to configure the mem0 MCP server from this repository to work with Claude Desktop.

## Prerequisites

1. Ensure you have built the server:
   ```bash
   cd node/mem0
   npm install
   npm run build
   ```

2. Make sure you have a MEM0_API_KEY in your `.env` file

## Configuration

### Option 1: Using the Claude CLI (Recommended)

From the root of this repository, run:

```bash
# Get the full path to this directory
REPO_DIR=$(pwd)

# Add the mem0 MCP server to Claude Desktop
claude mcp add mem0-local -s user node "$REPO_DIR/mem0-mcp/node/mem0/dist/index.js"
```

### Option 2: Manual Configuration

Add the following to your Claude Desktop configuration file:

**Location**: `~/.config/Claude/claude_desktop_config.json` (Linux/macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "mem0-local": {
      "command": "node",
      "args": [
        "FULL_PATH_TO_REPO/mem0-mcp/node/mem0/dist/index.js"
      ],
      "env": {
        "MEM0_API_KEY": "YOUR_MEM0_API_KEY_HERE"
      }
    }
  }
}
```

To get the full path, run this from the repository root:
```bash
echo "$(pwd)/mem0-mcp/node/mem0/dist/index.js"
```

Replace:
- `FULL_PATH_TO_REPO` with the actual path from the command above
- `YOUR_MEM0_API_KEY_HERE` with your actual MEM0 API key

## Usage

After configuring, restart Claude Desktop. You should now have access to two tools:

1. **add-memory**: Store information, code snippets, and insights
   - Arguments: `content` (string), `userId` (string)
   
2. **search-memories**: Search through stored memories
   - Arguments: `query` (string), `userId` (string)

## Example Usage in Claude Desktop

```
"Please remember that I prefer using TypeScript with strict mode enabled for all my projects"

"What do you remember about my coding preferences?"
```

## Troubleshooting

1. If the server doesn't appear in Claude Desktop:
   - Check that the path to `index.js` is correct
   - Ensure the file is executable: `chmod +x node/mem0/dist/index.js`
   - Check Claude Desktop logs for errors

2. If memories aren't being stored:
   - Verify your MEM0_API_KEY is correct
   - Check that you have internet connectivity (mem0 is a cloud service)

## Development

To run the server standalone for testing:
```bash
./run_mem0_server.sh
```

This will start the server on stdio, allowing you to see any error messages.