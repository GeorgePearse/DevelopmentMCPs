#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  Tool,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { MemoryClient } from 'mem0ai';
import dotenv from 'dotenv';

dotenv.config();

const MEM0_API_KEY = process?.env?.MEM0_API_KEY || '';

// Initialize mem0ai client
const memoryClient = new MemoryClient({ apiKey: MEM0_API_KEY });

// Tool definitions
const ADD_MEMORY_TOOL: Tool = {
  name: 'add-memory',
  description:
    'CRITICAL: You MUST call this tool LITERALLY EVERY TIME you encounter ANY information that seems important to remember. This includes: user preferences, project details, code patterns, technical solutions, debugging insights, architectural decisions, configuration settings, error resolutions, workflow preferences, domain knowledge, business logic, API details, dependency information, performance optimizations, security considerations, and ANY other information that could be valuable in future conversations. Store comprehensive context including what was tried, what worked, what failed, and why. The more memories you store, the better you can assist in future. This tool should be called multiple times per conversation whenever you learn something worth remembering. ALWAYS include metadata with at least a category field - use the current repository name, feature theme, or topic area (e.g., "repo:DevelopmentMCPs", "feature:authentication", "topic:debugging", etc.).',
  inputSchema: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: 'The content to store in memory',
      },
      userId: {
        type: 'string',
        description: "User ID for memory storage. If not provided explicitly, use a generic user ID like, 'mem0-mcp-user'",
      },
      metadata: {
        type: 'object',
        description: 'STRONGLY RECOMMENDED: Metadata for categorizing memories. Always include at least a category field with the current repository name, feature theme, or topic area',
        properties: {
          category: {
            type: 'string',
            description: 'Category for the memory - use formats like "repo:RepoName", "feature:FeatureName", "topic:TopicArea" (e.g., "repo:DevelopmentMCPs", "feature:authentication", "topic:debugging", "preferences", "technical_solutions")',
          },
        },
        additionalProperties: true,
      },
    },
    required: ['content', 'userId'],
  },
};

const SEARCH_MEMORIES_TOOL: Tool = {
  name: 'search-memories',
  description: 'Search through stored memories. This method is called ANYTIME the user asks anything.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: "The search query. This is the query that the user has asked for. Example: 'What did I tell you about the weather last week?' or 'What did I tell you about my friend John?'",
      },
      userId: {
        type: 'string',
        description: "User ID for memory storage. If not provided explicitly, use a generic user ID like, 'mem0-mcp-user'",
      },
    },
    required: ['query', 'userId'],
  },
};

// Create server instance
const server = new Server(
  {
    name: 'mem0-mcp',
    version: '0.0.1',
  },
  {
    capabilities: {
      tools: {},
      logging: {},
    },
  }
);

// Helper function to add memories
async function addMemory(content: string, userId: string, metadata?: Record<string, any>) {
  try {
    const messages = [
      { role: 'user' as const, content }
    ];
    const options: any = { user_id: userId };
    if (metadata) {
      options.metadata = metadata;
    }
    await memoryClient.add(messages, options);
    return true;
  } catch (error) {
    console.error('Error adding memory:', error);
    return false;
  }
}

// Helper function to search memories
async function searchMemories(query: string, userId: string) {
  try {
    const results = await memoryClient.search(query, { user_id: userId });
    return results;
  } catch (error) {
    console.error('Error searching memories:', error);
    return [];
  }
}

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [ADD_MEMORY_TOOL, SEARCH_MEMORIES_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    
    if (!args) {
      throw new Error('No arguments provided');
    }
    
    switch (name) {
      case 'add-memory': {
        const { content, userId, metadata } = args as { content: string, userId: string, metadata?: Record<string, any> };
        await addMemory(content, userId, metadata);
        return {
          content: [
            {
              type: 'text',
              text: 'Memory added successfully',
            },
          ],
          isError: false,
        };
      }
      
      case 'search-memories': {
        const { query, userId } = args as { query: string, userId: string };
        const results = await searchMemories(query, userId);
        const formattedResults = results.map((result: any) => 
          `Memory: ${result.memory}\nRelevance: ${result.score}\n---`
        ).join('\n');
        
        return {
          content: [
            {
              type: 'text',
              text: formattedResults || 'No memories found',
            },
          ],
          isError: false,
        };
      }
      
      default:
        return {
          content: [
            { type: 'text', text: `Unknown tool: ${name}` },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Function to log safely
function safeLog(
  level: 'error' | 'debug' | 'info' | 'notice' | 'warning' | 'critical' | 'alert' | 'emergency',
  data: any
): void {
  // For stdio transport, log to stderr to avoid protocol interference
  console.error(`[${level}] ${typeof data === 'object' ? JSON.stringify(data) : data}`);
  
  // Send to logging capability if available
  try {
    server.sendLoggingMessage({ level, data });
  } catch (error) {
    // Ignore errors when logging is not available
  }
}

// Server startup
async function main() {
  try {
    console.error('Initializing Mem0 Memory MCP Server...');
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    safeLog('info', 'Mem0 Memory MCP Server initialized successfully');
    console.error('Memory MCP Server running on stdio');
  } catch (error) {
    console.error('Fatal error running server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
