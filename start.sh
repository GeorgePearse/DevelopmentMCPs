#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to load environment variables
load_env() {
    # Check for .env file in script directory
    if [ -f "$SCRIPT_DIR/.env" ]; then
        echo "Loading environment variables from $SCRIPT_DIR/.env"
        set -a
        source "$SCRIPT_DIR/.env"
        set +a
    # Check for .env file in mem0-mcp directory
    elif [ -f "$SCRIPT_DIR/mem0-mcp/.env" ]; then
        echo "Loading environment variables from $SCRIPT_DIR/mem0-mcp/.env"
        set -a
        source "$SCRIPT_DIR/mem0-mcp/.env"
        set +a
    fi
}

# Load environment variables
load_env

# Check if MEM0_API_KEY is set
if [ -z "$MEM0_API_KEY" ]; then
    echo "Error: MEM0_API_KEY environment variable is not set!"
    echo "Please set it in one of the following ways:"
    echo "1. Export it: export MEM0_API_KEY=your-api-key"
    echo "2. Create a .env file in $SCRIPT_DIR or $SCRIPT_DIR/mem0-mcp/"
    echo "3. Run: MEM0_API_KEY=your-api-key ./start.sh"
    exit 1
fi

echo "Adding mem0 MCP server to Claude Desktop with API key..."

# Create a temporary config file with the MCP server configuration
CONFIG_FILE=$(mktemp)
cat > "$CONFIG_FILE" <<EOF
{
  "mcpServers": {
    "mem0-local": {
      "command": "node",
      "args": ["$SCRIPT_DIR/mem0-mcp/node/mem0/dist/index.js"],
      "env": {
        "MEM0_API_KEY": "$MEM0_API_KEY"
      }
    }
  }
}
EOF

echo "Configuration file created at: $CONFIG_FILE"

# Try to add the MCP server using the command line
# Note: The exact syntax for passing env vars via CLI may vary
echo "Attempting to add mem0 MCP server..."

# First attempt: Try with environment variable in the command
MEM0_API_KEY="$MEM0_API_KEY" claude mcp add mem0-local -s user node "$SCRIPT_DIR/mem0-mcp/node/mem0/dist/index.js"

# If the above doesn't work, provide instructions for manual configuration
echo ""
echo "If the automatic setup didn't work, you can manually configure the MCP server by:"
echo "1. Opening Claude Desktop settings"
echo "2. Adding the following configuration:"
echo ""
cat "$CONFIG_FILE"
echo ""
echo "Or copy the configuration from: $CONFIG_FILE"

# Clean up temp file after a delay
(sleep 60 && rm -f "$CONFIG_FILE") &
