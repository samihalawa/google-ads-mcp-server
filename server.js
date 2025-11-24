#!/usr/bin/env node

/**
 * Google Ads MCP Server (Node.js)
 * Model Context Protocol server for managing Google Ads campaigns
 * 
 * Configuration via environment variables (no YAML file needed):
 * - GOOGLE_ADS_CONFIG: JSON string with all credentials
 * - GOOGLE_ADS_CUSTOMER_ID: Customer ID to query
 * 
 * Features:
 * - Campaign management (pause, enable, budget updates)
 * - Performance analytics and reporting
 * - Real-time Google Ads API integration
 * - Export to CSV/JSON
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { GoogleAdsApi } from 'google-ads-api';

let googleAdsClient = null;

/**
 * Initialize Google Ads client from environment variables
 */
function initializeGoogleAdsClient() {
  if (googleAdsClient) {
    return googleAdsClient;
  }

  try {
    // Parse configuration from environment variable
    const configJson = process.env.GOOGLE_ADS_CONFIG;
    if (!configJson) {
      throw new Error('GOOGLE_ADS_CONFIG environment variable is required');
    }

    const config = JSON.parse(configJson);
    
    // Validate required fields
    const requiredFields = ['client_id', 'client_secret', 'developer_token', 'refresh_token', 'login_customer_id'];
    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Get customer ID from environment
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID || config.customer_id;
    if (!customerId) {
      throw new Error('GOOGLE_ADS_CUSTOMER_ID environment variable is required');
    }

    // Initialize Google Ads API client
    googleAdsClient = new GoogleAdsApi({
      client_id: config.client_id,
      client_secret: config.client_secret,
      developer_token: config.developer_token,
    });

    const customer = googleAdsClient.Customer({
      customer_id: customerId,
      refresh_token: config.refresh_token,
      login_customer_id: config.login_customer_id,
    });

    return customer;
  } catch (error) {
    throw new Error(`Failed to initialize Google Ads client: ${error.message}`);
  }
}

/**
 * Format campaign data for display
 */
function formatCampaignData(campaign) {
  return [
    `**${campaign.name}** (ID: ${campaign.id})`,
    `Status: ${campaign.status} | Type: ${campaign.type}`,
    `Budget: €${campaign.budget_euros.toFixed(2)}/day`,
    `Spend: €${campaign.cost_euros.toFixed(2)} | Clicks: ${campaign.clicks.toLocaleString()}`,
    `Impressions: ${campaign.impressions.toLocaleString()} | CTR: ${campaign.ctr.toFixed(2)}%`,
    `CPC: €${campaign.cpc_euros.toFixed(3)} | Conversions: ${campaign.conversions.toFixed(1)}`,
  ].join('\n');
}

/**
 * Create MCP server
 */
const server = new Server(
  {
    name: 'google-ads-mcp',
    version: '1.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_campaigns',
        description: 'Fetch Google Ads campaign performance data',
        inputSchema: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              description: 'Number of days to look back (default: 30)',
              default: 30,
            },
            status: {
              type: 'string',
              description: 'Filter by campaign status (ENABLED, PAUSED, REMOVED, or ALL)',
              enum: ['ENABLED', 'PAUSED', 'REMOVED', 'ALL'],
              default: 'ENABLED',
            },
          },
        },
      },
      {
        name: 'get_campaign_details',
        description: 'Get detailed information about a specific campaign',
        inputSchema: {
          type: 'object',
          properties: {
            campaign_id: {
              type: 'string',
              description: 'The campaign ID',
            },
            days: {
              type: 'number',
              description: 'Number of days to look back (default: 30)',
              default: 30,
            },
          },
          required: ['campaign_id'],
        },
      },
      {
        name: 'get_performance_summary',
        description: 'Get overall account performance summary',
        inputSchema: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              description: 'Number of days to look back (default: 30)',
              default: 30,
            },
          },
        },
      },
      {
        name: 'get_top_performers',
        description: 'Get top performing campaigns by specified metric',
        inputSchema: {
          type: 'object',
          properties: {
            metric: {
              type: 'string',
              description: 'Metric to rank by',
              enum: ['ctr', 'conversions', 'cost', 'clicks', 'impressions'],
              default: 'ctr',
            },
            limit: {
              type: 'number',
              description: 'Number of top campaigns to return (default: 5)',
              default: 5,
            },
            days: {
              type: 'number',
              description: 'Number of days to look back (default: 30)',
              default: 30,
            },
          },
        },
      },
      {
        name: 'pause_campaign',
        description: 'Pause a specific campaign',
        inputSchema: {
          type: 'object',
          properties: {
            campaign_id: {
              type: 'string',
              description: 'The campaign ID to pause',
            },
          },
          required: ['campaign_id'],
        },
      },
      {
        name: 'enable_campaign',
        description: 'Enable/resume a paused campaign',
        inputSchema: {
          type: 'object',
          properties: {
            campaign_id: {
              type: 'string',
              description: 'The campaign ID to enable',
            },
          },
          required: ['campaign_id'],
        },
      },
      {
        name: 'update_campaign_budget',
        description: 'Update the daily budget for a campaign',
        inputSchema: {
          type: 'object',
          properties: {
            campaign_id: {
              type: 'string',
              description: 'The campaign ID',
            },
            budget_euros: {
              type: 'number',
              description: 'New daily budget in euros',
            },
          },
          required: ['campaign_id', 'budget_euros'],
        },
      },
	      {
	        name: 'create_responsive_display_ad',
	        description: 'Create a Responsive Display Ad with Ad Controls (e.g., enable video creation)',
	        inputSchema: {
	          type: 'object',
	          properties: {
	            ad_group_id: {
	              type: 'string',
	              description: 'The Ad Group ID where the ad will be created',
	            },
	            headlines: {
	              type: 'array',
	              description: 'Array of headlines (max 5)',
	              items: { type: 'string' },
	            },
	            descriptions: {
	              type: 'array',
	              description: 'Array of descriptions (max 5)',
	              items: { type: 'string' },
	            },
	            enable_video_creation: {
	              type: 'boolean',
	              description: 'Set to true to enable video creation for the ad (default: false)',
	              default: false,
	            },
	          },
	          required: ['ad_group_id', 'headlines', 'descriptions'],
	        },
	      },
	      {
	        name: 'create_conversion_action',
	        description: 'Create a new Conversion Action (e.g., for website, phone calls)',
	        inputSchema: {
	          type: 'object',
	          properties: {
	            name: {
	              type: 'string',
	              description: 'The name of the new conversion action',
	            },
	            type: {
	              type: 'string',
	              description: 'The type of conversion action (e.g., UPLOAD_CLICKS, WEBSITE, CLICK_TO_CALL)',
	              enum: ['UPLOAD_CLICKS', 'WEBSITE', 'CLICK_TO_CALL', 'WEBSITE_CALL'],
	            },
	            category: {
	              type: 'string',
	              description: 'The category of the conversion (e.g., PURCHASE, LEAD, PAGE_VIEW)',
	              enum: ['PURCHASE', 'LEAD', 'PAGE_VIEW', 'SIGNUP', 'OTHER'],
	            },
	            value: {
	              type: 'number',
	              description: 'Default value in Euros for the conversion (default: 0)',
	              default: 0,
	            },
	          },
	          required: ['name', 'type', 'category'],
	        },
	      },
	      {
	        name: 'get_conversion_actions',
	        description: 'List all Conversion Actions for the account',
	        inputSchema: {
	          type: 'object',
	          properties: {},
	        },
	      },
	      {
	        name: 'export_report',
        description: 'Export campaign data to CSV or JSON format',
        inputSchema: {
          type: 'object',
          properties: {
            format: {
              type: 'string',
              description: 'Export format',
              enum: ['csv', 'json'],
              default: 'csv',
            },
            days: {
              type: 'number',
              description: 'Number of days to look back (default: 30)',
              default: 30,
            },
          },
          required: ['format'],
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const customer = initializeGoogleAdsClient();
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID || JSON.parse(process.env.GOOGLE_ADS_CONFIG).customer_id;

    switch (name) {
      case 'get_campaigns': {
        const days = args.days || 30;
        const statusFilter = args.status || 'ENABLED';

        const statusCondition =
          statusFilter === 'ALL' ? '' : `AND campaign.status = '${statusFilter}'`;

        const query = `
          SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            campaign.advertising_channel_type,
            campaign_budget.amount_micros,
            metrics.clicks,
            metrics.impressions,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value
          FROM campaign
          WHERE campaign.status != 'REMOVED'
          ${statusCondition}
          AND segments.date DURING LAST_${days}_DAYS
          ORDER BY metrics.cost_micros DESC
        `;

        const campaigns = await customer.query(query);

        const formattedCampaigns = campaigns.map((row) => ({
          id: row.campaign.id,
          name: row.campaign.name,
          status: row.campaign.status,
          type: row.campaign.advertising_channel_type,
          budget_euros: row.campaign_budget.amount_micros / 1_000_000,
          clicks: row.metrics.clicks,
          impressions: row.metrics.impressions,
          ctr: (row.metrics.ctr * 100).toFixed(2),
          cost_euros: (row.metrics.cost_micros / 1_000_000).toFixed(2),
          cpc_euros: (row.metrics.average_cpc / 1_000_000).toFixed(3),
          conversions: row.metrics.conversions,
          conversion_value: row.metrics.conversions_value,
        }));

        if (formattedCampaigns.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No campaigns found matching the criteria.',
              },
            ],
          };
        }

        const output = [
          `# Google Ads Campaigns (Last ${days} Days)\n`,
          `**Total Campaigns:** ${formattedCampaigns.length}\n`,
        ];

        formattedCampaigns.forEach((camp) => {
          output.push('\n---\n');
          output.push(formatCampaignData(camp));
        });

        return {
          content: [
            {
              type: 'text',
              text: output.join(''),
            },
          ],
        };
      }

	      case 'create_responsive_display_ad': {
	        const { ad_group_id, headlines, descriptions, enable_video_creation } = args;
	
	        const ad = {
	          adGroupId: ad_group_id,
	          type: 'RESPONSIVE_DISPLAY_AD',
	          responsiveDisplayAd: {
	            headlines: headlines.map(text => ({ text })),
	            descriptions: descriptions.map(text => ({ text })),
	            // Placeholder for required assets - simplified for MCP
	            marketingImages: [{ asset: 'customers/CUSTOMER_ID/assets/ASSET_ID_1' }],
	            squareMarketingImages: [{ asset: 'customers/CUSTOMER_ID/assets/ASSET_ID_2' }],
	            longHeadline: { text: 'A very long headline for the ad' },
	            businessName: 'AutoTinder AI',
	            controlSpec: {
	              enable_video_creation: enable_video_creation || false,
	            },
	          },
	          status: 'ENABLED',
	        };
	
	        const response = await customer.adGroupAds.create({
	          ad_group_ad: ad,
	        });
	
	        return {
	          content: [
	            {
	              type: 'text',
	              text: `✅ Responsive Display Ad created successfully in Ad Group ${ad_group_id}. Resource Name: ${response.results[0].adGroupAd.resourceName}`,
	            },
	          ],
	        };
	      }
	
	      case 'get_campaign_details': {
        const campaignId = args.campaign_id;
        const days = args.days || 30;

        const query = `
          SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            campaign.advertising_channel_type,
            campaign.start_date,
            campaign.end_date,
            campaign_budget.amount_micros,
            metrics.clicks,
            metrics.impressions,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value,
            metrics.cost_per_conversion
          FROM campaign
          WHERE campaign.id = ${campaignId}
          AND segments.date DURING LAST_${days}_DAYS
        `;

        const results = await customer.query(query);

        if (results.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `Campaign ${campaignId} not found.`,
              },
            ],
          };
        }

        const row = results[0];
        const details = {
          id: row.campaign.id,
          name: row.campaign.name,
          status: row.campaign.status,
          type: row.campaign.advertising_channel_type,
          start_date: row.campaign.start_date || 'N/A',
          end_date: row.campaign.end_date || 'N/A',
          budget_euros: (row.campaign_budget.amount_micros / 1_000_000).toFixed(2),
          clicks: row.metrics.clicks,
          impressions: row.metrics.impressions,
          ctr: (row.metrics.ctr * 100).toFixed(2),
          cost_euros: (row.metrics.cost_micros / 1_000_000).toFixed(2),
          cpc_euros: (row.metrics.average_cpc / 1_000_000).toFixed(3),
          conversions: row.metrics.conversions.toFixed(1),
          conversion_value: row.metrics.conversions_value.toFixed(2),
          cost_per_conversion:
            row.metrics.cost_per_conversion > 0
              ? (row.metrics.cost_per_conversion / 1_000_000).toFixed(2)
              : '0.00',
        };

        const output = [
          `# Campaign Details: ${details.name}\n`,
          `**ID:** ${details.id}`,
          `**Status:** ${details.status}`,
          `**Type:** ${details.type}`,
          `**Start Date:** ${details.start_date}`,
          `**End Date:** ${details.end_date}`,
          `\n## Budget`,
          `Daily Budget: €${details.budget_euros}`,
          `\n## Performance (Last ${days} Days)`,
          `- **Spend:** €${details.cost_euros}`,
          `- **Clicks:** ${details.clicks.toLocaleString()}`,
          `- **Impressions:** ${details.impressions.toLocaleString()}`,
          `- **CTR:** ${details.ctr}%`,
          `- **CPC:** €${details.cpc_euros}`,
          `- **Conversions:** ${details.conversions}`,
          `- **Conversion Value:** €${details.conversion_value}`,
        ];

        if (parseFloat(details.cost_per_conversion) > 0) {
          output.push(`- **Cost per Conversion:** €${details.cost_per_conversion}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: output.join('\n'),
            },
          ],
        };
      }

      case 'get_performance_summary': {
        const days = args.days || 30;

        const query = `
          SELECT
            metrics.clicks,
            metrics.impressions,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value
          FROM campaign
          WHERE campaign.status != 'REMOVED'
          AND segments.date DURING LAST_${days}_DAYS
        `;

        const results = await customer.query(query);

        let totalCost = 0;
        let totalClicks = 0;
        let totalImpressions = 0;
        let totalConversions = 0;
        let totalConvValue = 0;

        results.forEach((row) => {
          totalCost += row.metrics.cost_micros / 1_000_000;
          totalClicks += row.metrics.clicks;
          totalImpressions += row.metrics.impressions;
          totalConversions += row.metrics.conversions;
          totalConvValue += row.metrics.conversions_value;
        });

        const overallCtr =
          totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;
        const overallCpc = totalClicks > 0 ? (totalCost / totalClicks).toFixed(3) : 0;
        const costPerConv =
          totalConversions > 0 ? (totalCost / totalConversions).toFixed(2) : 0;

        const output = [
          `# Account Performance Summary (Last ${days} Days)\n`,
          `**Active Campaigns:** ${results.length}`,
          `\n## Overall Metrics`,
          `- **Total Spend:** €${totalCost.toFixed(2)}`,
          `- **Total Clicks:** ${totalClicks.toLocaleString()}`,
          `- **Total Impressions:** ${totalImpressions.toLocaleString()}`,
          `- **Overall CTR:** ${overallCtr}%`,
          `- **Average CPC:** €${overallCpc}`,
          `- **Total Conversions:** ${totalConversions.toFixed(1)}`,
          `- **Total Conversion Value:** €${totalConvValue.toFixed(2)}`,
        ];

        if (parseFloat(costPerConv) > 0) {
          output.push(`- **Cost per Conversion:** €${costPerConv}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: output.join('\n'),
            },
          ],
        };
      }

      case 'get_top_performers': {
        const metric = args.metric || 'ctr';
        const limit = args.limit || 5;
        const days = args.days || 30;

        const metricMap = {
          ctr: 'metrics.ctr',
          conversions: 'metrics.conversions',
          cost: 'metrics.cost_micros',
          clicks: 'metrics.clicks',
          impressions: 'metrics.impressions',
        };

        const orderBy = metricMap[metric] || 'metrics.ctr';

        const query = `
          SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            metrics.clicks,
            metrics.impressions,
            metrics.ctr,
            metrics.cost_micros,
            metrics.conversions
          FROM campaign
          WHERE campaign.status = 'ENABLED'
          AND segments.date DURING LAST_${days}_DAYS
          ORDER BY ${orderBy} DESC
          LIMIT ${limit}
        `;

        const results = await customer.query(query);

        const output = [`# Top ${limit} Performers by ${metric.toUpperCase()} (Last ${days} Days)\n`];

        results.forEach((row, index) => {
          output.push(`\n## ${index + 1}. ${row.campaign.name}`);
          output.push(`- **CTR:** ${(row.metrics.ctr * 100).toFixed(2)}%`);
          output.push(`- **Clicks:** ${row.metrics.clicks.toLocaleString()}`);
          output.push(`- **Impressions:** ${row.metrics.impressions.toLocaleString()}`);
          output.push(`- **Spend:** €${(row.metrics.cost_micros / 1_000_000).toFixed(2)}`);
          output.push(`- **Conversions:** ${row.metrics.conversions.toFixed(1)}`);
        });

        return {
          content: [
            {
              type: 'text',
              text: output.join('\n'),
            },
          ],
        };
      }

      case 'pause_campaign': {
        const campaignId = args.campaign_id;

        await customer.campaigns.update({
          campaign: {
            resource_name: `customers/${customerId}/campaigns/${campaignId}`,
            status: 'PAUSED',
          },
          update_mask: { paths: ['status'] },
        });

        return {
          content: [
            {
              type: 'text',
              text: `✅ Campaign ${campaignId} has been paused successfully.`,
            },
          ],
        };
      }

      case 'enable_campaign': {
        const campaignId = args.campaign_id;

        await customer.campaigns.update({
          campaign: {
            resource_name: `customers/${customerId}/campaigns/${campaignId}`,
            status: 'ENABLED',
          },
          update_mask: { paths: ['status'] },
        });

        return {
          content: [
            {
              type: 'text',
              text: `✅ Campaign ${campaignId} has been enabled successfully.`,
            },
          ],
        };
      }

      case 'update_campaign_budget': {
        const campaignId = args.campaign_id;
        const budgetEuros = args.budget_euros;

        // Get campaign budget ID
        const query = `
          SELECT
            campaign.id,
            campaign.name,
            campaign_budget.id,
            campaign_budget.resource_name
          FROM campaign
          WHERE campaign.id = ${campaignId}
        `;

        const results = await customer.query(query);

        if (results.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `Campaign ${campaignId} not found.`,
              },
            ],
          };
        }

        const budgetId = results[0].campaign_budget.id;

        // Update budget
        await customer.campaignBudgets.update({
          campaign_budget: {
            resource_name: `customers/${customerId}/campaignBudgets/${budgetId}`,
            amount_micros: Math.round(budgetEuros * 1_000_000),
          },
          update_mask: { paths: ['amount_micros'] },
        });

        return {
          content: [
            {
              type: 'text',
              text: `✅ Campaign ${campaignId} budget updated to €${budgetEuros.toFixed(2)}/day successfully.`,
            },
          ],
        };
      }

	      case 'create_conversion_action': {
	        const { name, type, category, value } = args;
	
	        const conversionAction = {
	          name: name,
	          type: type,
	          category: category,
	          status: 'ENABLED',
	          valueSettings: {
	            default_value: value || 0,
	            default_currency_code: 'EUR',
	          },
	        };
	
	        const response = await customer.conversionActions.create({
	          conversion_action: conversionAction,
	        });
	
	        return {
	          content: [
	            {
	              type: 'text',
	              text: `✅ Conversion Action '${name}' created successfully. Resource Name: ${response.results[0].conversionAction.resourceName}`,
	            },
	          ],
	        };
	      }
	
	      case 'get_conversion_actions': {
	        const query = `
	          SELECT
	            conversion_action.id,
	            conversion_action.name,
	            conversion_action.status,
	            conversion_action.type,
	            conversion_action.category
	          FROM conversion_action
	          WHERE conversion_action.status != 'REMOVED'
	        `;
	
	        const results = await customer.query(query);
	
	        const output = ['# Google Ads Conversion Actions\n'];
	
	        results.forEach((row) => {
	          output.push(`---`);
	          output.push(`**Name:** ${row.conversion_action.name}`);
	          output.push(`**ID:** ${row.conversion_action.id}`);
	          output.push(`**Status:** ${row.conversion_action.status}`);
	          output.push(`**Type:** ${row.conversion_action.type}`);
	          output.push(`**Category:** ${row.conversion_action.category}`);
	        });
	
	        return {
	          content: [
	            {
	              type: 'text',
	              text: output.join('\n'),
	            },
	          ],
	        };
	      }
	
	      case 'export_report': {
        const format = args.format;
        const days = args.days || 30;

        const query = `
          SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            campaign.advertising_channel_type,
            campaign_budget.amount_micros,
            metrics.clicks,
            metrics.impressions,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value
          FROM campaign
          WHERE campaign.status != 'REMOVED'
          AND segments.date DURING LAST_${days}_DAYS
          ORDER BY metrics.cost_micros DESC
        `;

        const results = await customer.query(query);

        const campaigns = results.map((row) => ({
          id: row.campaign.id.toString(),
          name: row.campaign.name,
          status: row.campaign.status,
          type: row.campaign.advertising_channel_type,
          budget_euros: (row.campaign_budget.amount_micros / 1_000_000).toFixed(2),
          clicks: row.metrics.clicks,
          impressions: row.metrics.impressions,
          ctr: (row.metrics.ctr * 100).toFixed(2),
          cost_euros: (row.metrics.cost_micros / 1_000_000).toFixed(2),
          cpc_euros: (row.metrics.average_cpc / 1_000_000).toFixed(3),
          conversions: row.metrics.conversions.toFixed(1),
          conversion_value: row.metrics.conversions_value.toFixed(2),
        }));

        if (format === 'json') {
          const report = {
            timestamp: new Date().toISOString(),
            period_days: days,
            campaigns,
          };

          return {
            content: [
              {
                type: 'text',
                text: `\`\`\`json\n${JSON.stringify(report, null, 2)}\n\`\`\``,
              },
            ],
          };
        } else {
          // CSV format
          const headers = Object.keys(campaigns[0] || {}).join(',');
          const rows = campaigns.map((c) => Object.values(c).join(','));
          const csv = [headers, ...rows].join('\n');

          return {
            content: [
              {
                type: 'text',
                text: `\`\`\`csv\n${csv}\n\`\`\``,
              },
            ],
          };
        }
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Google Ads MCP Server (Node.js) running on stdio');

}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
