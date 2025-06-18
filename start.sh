#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Add the mem0 MCP server to Claude Desktop
claude mcp add mem0-local -s user node "$SCRIPT_DIR/mem0-mcp/node/mem0/dist/index.js"
