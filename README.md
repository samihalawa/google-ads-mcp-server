# Google Ads MCP Server (Node.js)

A Model Context Protocol (MCP) server for managing Google Ads campaigns programmatically, built with Node.js.

## Features

### Campaign Management
- ✅ Fetch campaign performance data
- ✅ Get detailed campaign information
- ✅ Pause/enable campaigns
- ✅ Update campaign budgets

### Analytics & Reporting
- ✅ Performance summaries
- ✅ Top performer analysis
- ✅ Export to CSV/JSON
- ✅ Custom date ranges

### Real-time Data
- ✅ Live API integration
- ✅ Up-to-date metrics
- ✅ Conversion tracking
- ✅ Budget monitoring

## Installation

### 1. Install Dependencies

```bash
pnpm install
```

Or with npm:

```bash
npm install
```

### 2. Configure Google Ads API

Create a `google-ads.yaml` file in the same directory:

```yaml
developer_token: YOUR_DEVELOPER_TOKEN
client_id: YOUR_CLIENT_ID
client_secret: YOUR_CLIENT_SECRET
refresh_token: YOUR_REFRESH_TOKEN
login_customer_id: YOUR_MANAGER_CUSTOMER_ID
use_proto_plus: True
```

### 3. Set Environment Variables (Optional)

```bash
export GOOGLE_ADS_CONFIG="/path/to/google-ads.yaml"
export GOOGLE_ADS_CUSTOMER_ID="1234567890"
```

## Usage

### Running the Server

```bash
node server.js
```

Or with pnpm:

```bash
pnpm start
```

### Using with MCP Clients

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "google-ads": {
      "command": "node",
      "args": ["/path/to/google-ads-mcp-node/server.js"],
      "env": {
        "GOOGLE_ADS_CONFIG": "/path/to/google-ads.yaml",
        "GOOGLE_ADS_CUSTOMER_ID": "1234567890"
      }
    }
  }
}
```

### Using with manus-mcp-cli

```bash
# List available tools
manus-mcp-cli tool list --server google-ads

# Get campaigns
manus-mcp-cli tool call get_campaigns --server google-ads --input '{"days": 30}'

# Get performance summary
manus-mcp-cli tool call get_performance_summary --server google-ads --input '{"days": 7}'

# Pause a campaign
manus-mcp-cli tool call pause_campaign --server google-ads --input '{"campaign_id": "23207843655"}'
```

## Available Tools

### 1. get_campaigns
Fetch all campaigns with performance metrics.

**Parameters:**
- `days` (number, optional): Number of days to look back (default: 30)
- `status` (string, optional): Filter by status - ENABLED, PAUSED, REMOVED, or ALL (default: ENABLED)

**Example:**
```json
{
  "days": 30,
  "status": "ENABLED"
}
```

### 2. get_campaign_details
Get detailed information about a specific campaign.

**Parameters:**
- `campaign_id` (string, required): The campaign ID
- `days` (number, optional): Number of days to look back (default: 30)

**Example:**
```json
{
  "campaign_id": "23207843655",
  "days": 30
}
```

### 3. get_performance_summary
Get overall account performance summary.

**Parameters:**
- `days` (number, optional): Number of days to look back (default: 30)

**Example:**
```json
{
  "days": 7
}
```

### 4. get_top_performers
Get top performing campaigns by specified metric.

**Parameters:**
- `metric` (string, optional): Metric to rank by - ctr, conversions, cost, clicks, impressions (default: ctr)
- `limit` (number, optional): Number of top campaigns to return (default: 5)
- `days` (number, optional): Number of days to look back (default: 30)

**Example:**
```json
{
  "metric": "ctr",
  "limit": 5,
  "days": 30
}
```

### 5. pause_campaign
Pause a specific campaign.

**Parameters:**
- `campaign_id` (string, required): The campaign ID to pause

**Example:**
```json
{
  "campaign_id": "23207843655"
}
```

### 6. enable_campaign
Enable/resume a paused campaign.

**Parameters:**
- `campaign_id` (string, required): The campaign ID to enable

**Example:**
```json
{
  "campaign_id": "23207843655"
}
```

### 7. update_campaign_budget
Update the daily budget for a campaign.

**Parameters:**
- `campaign_id` (string, required): The campaign ID
- `budget_euros` (number, required): New daily budget in euros

**Example:**
```json
{
  "campaign_id": "23207843655",
  "budget_euros": 20.00
}
```

### 8. export_report
Export campaign data to CSV or JSON format.

**Parameters:**
- `format` (string, required): Export format - csv or json
- `days` (number, optional): Number of days to look back (default: 30)

**Example:**
```json
{
  "format": "csv",
  "days": 30
}
```

## Example Workflows

### Daily Campaign Monitoring

```bash
# Get performance summary
manus-mcp-cli tool call get_performance_summary --server google-ads --input '{"days": 1}'

# Check top performers
manus-mcp-cli tool call get_top_performers --server google-ads --input '{"metric": "conversions", "limit": 3, "days": 7}'
```

### Campaign Optimization

```bash
# Get campaign details
manus-mcp-cli tool call get_campaign_details --server google-ads --input '{"campaign_id": "23207843655", "days": 30}'

# Update budget if performing well
manus-mcp-cli tool call update_campaign_budget --server google-ads --input '{"campaign_id": "23207843655", "budget_euros": 25.00}'

# Pause if underperforming
manus-mcp-cli tool call pause_campaign --server google-ads --input '{"campaign_id": "23207843655"}'
```

### Reporting

```bash
# Export to CSV
manus-mcp-cli tool call export_report --server google-ads --input '{"format": "csv", "days": 30}'

# Export to JSON
manus-mcp-cli tool call export_report --server google-ads --input '{"format": "json", "days": 7}'
```

## Configuration for Your Account

Based on your current setup:

```yaml
# google-ads.yaml
developer_token: i525AeFTAacFOtQtWBjY6g
client_id: 963208150325-mmhibhl91g39ma9jsvrgacpleraq4nfu.apps.googleusercontent.com
client_secret: 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
refresh_token: 1//04OmKZJ58yhQaCgYIARAAGAQSNwF-L9IrfyrhE7W2zk00iStBE8dCRazdeUgXiMVxH-WIr9PEh6W3_RvjRKSZx-FH3l3Dun5vWOc
login_customer_id: 4850172260
use_proto_plus: True
```

```bash
# Environment variables
export GOOGLE_ADS_CUSTOMER_ID="1248495560"
```

## Troubleshooting

### "Failed to initialize Google Ads client"
- Check that `google-ads.yaml` exists and is properly formatted
- Verify all credentials are correct
- Ensure refresh token is still valid

### "Campaign not found"
- Verify the campaign ID is correct
- Check that you have access to the campaign
- Ensure the campaign hasn't been removed

### "Unauthorized" errors
- Refresh token may have expired - generate a new one
- Check that the developer token is approved
- Verify OAuth credentials are correct

## API Rate Limits

Google Ads API has rate limits:
- **Basic access:** 15,000 operations per day
- **Standard access:** 40,000 operations per day

The MCP server automatically handles rate limiting and retries.

## Security

- Never commit `google-ads.yaml` to version control
- Store credentials securely
- Use environment variables for sensitive data
- Rotate refresh tokens regularly

## Support

For issues or questions:
1. Check the [Google Ads API documentation](https://developers.google.com/google-ads/api/docs/start)
2. Review the [MCP specification](https://modelcontextprotocol.io/)
3. Check server logs for error messages

## License

MIT License - See LICENSE file for details

## Version History

### 1.0.0 (2025-11-24)
- Initial Node.js release
- 8 core tools for campaign management
- Real-time API integration
- CSV/JSON export support
- Complete documentation
