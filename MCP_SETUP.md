# MCP Server Setup Guide

## Overview
The `start.sh` script sets up the mem0 MCP server for Claude Desktop with proper environment variable handling.

## Environment Variable Setup

The script supports multiple ways to provide the required `MEM0_API_KEY`:

### Option 1: .env File (Recommended)
Create a `.env` file in either:
- Project root: `/home/georgepearse/DevelopmentMCPs/.env`
- mem0-mcp directory: `/home/georgepearse/DevelopmentMCPs/mem0-mcp/.env`

Example `.env` content:
```
MEM0_API_KEY=your-api-key-here
```

### Option 2: Export Environment Variable
```bash
export MEM0_API_KEY=your-api-key-here
./start.sh
```

### Option 3: Inline Environment Variable
```bash
MEM0_API_KEY=your-api-key-here ./start.sh
```

## Running the Script
```bash
./start.sh
```

## What the Script Does
1. Loads environment variables from .env file (if present)
2. Validates that MEM0_API_KEY is set
3. Attempts to add the MCP server to Claude Desktop
4. Creates a JSON configuration file for manual setup if needed

## Manual Configuration
If automatic setup fails, the script will display a JSON configuration that you can manually add to Claude Desktop settings.

## Troubleshooting
- Ensure the script has execute permissions: `chmod +x start.sh`
- Check that your MEM0_API_KEY is valid
- Verify that node is installed and the mem0 server is built