# Google Ads MCP Server - Quick Start Guide

Get started with the Google Ads MCP server in under 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Google Ads API credentials (developer token, OAuth credentials)
- A Google Ads account with campaigns

## Step 1: Install

### Global Installation (Recommended)

```bash
npm install -g @samihalawa/google-ads-mcp-server
```

### Or use npx (no installation)

```bash
npx @samihalawa/google-ads-mcp-server
```

## Step 2: Configure

Create a `.env` file with your credentials as inline JSON:

```bash
# Copy the example
cp .env.example .env

# Edit with your credentials
nano .env
```

Your `.env` file should look like this:

```bash
GOOGLE_ADS_CONFIG='{"client_id":"YOUR_CLIENT_ID.apps.googleusercontent.com","client_secret":"YOUR_CLIENT_SECRET","developer_token":"YOUR_DEVELOPER_TOKEN","refresh_token":"YOUR_REFRESH_TOKEN","login_customer_id":"YOUR_MANAGER_CUSTOMER_ID"}'
GOOGLE_ADS_CUSTOMER_ID=1234567890
```

**That's it!** No separate YAML files needed.

### Real Example

```bash
GOOGLE_ADS_CONFIG='{"client_id":"963208150325-mmhibhl91g39ma9jsvrgacpleraq4nfu.apps.googleusercontent.com","client_secret":"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","developer_token":"i525AeFTAacFOtQtWBjY6g","refresh_token":"1//04OmKZJ58yhQaCgYIARAAGAQSNwF-L9IrfyrhE7W2zk00iStBE8dCRazdeUgXiMVxH-WIr9PEh6W3_RvjRKSZx-FH3l3Dun5vWOc","login_customer_id":"4850172260"}'
GOOGLE_ADS_CUSTOMER_ID=1248495560
```

## Step 3: Run

```bash
# Load .env and start server
node server.js
```

Or with npx:

```bash
npx @samihalawa/google-ads-mcp-server
```

You should see:
```
Google Ads MCP Server (Node.js) running on stdio
```

## Step 4: Test

Open a new terminal and test with manus-mcp-cli:

```bash
# Set environment variables
export GOOGLE_ADS_CONFIG='{"client_id":"...","client_secret":"...","developer_token":"...","refresh_token":"...","login_customer_id":"..."}'
export GOOGLE_ADS_CUSTOMER_ID="1234567890"

# List tools
manus-mcp-cli tool list --server google-ads

# Get campaigns
manus-mcp-cli tool call get_campaigns --server google-ads --input '{"days": 30}'
```

## Common Use Cases

### Get Your Campaigns

```bash
manus-mcp-cli tool call get_campaigns --server google-ads --input '{"days": 30, "status": "ENABLED"}'
```

### Check Performance

```bash
manus-mcp-cli tool call get_performance_summary --server google-ads --input '{"days": 7}'
```

### Find Top Performers

```bash
manus-mcp-cli tool call get_top_performers --server google-ads --input '{"metric": "ctr", "limit": 5}'
```

### Pause a Campaign

```bash
manus-mcp-cli tool call pause_campaign --server google-ads --input '{"campaign_id": "23207843655"}'
```

### Scale a Winner

```bash
manus-mcp-cli tool call update_campaign_budget --server google-ads --input '{"campaign_id": "23270379040", "budget_euros": 25.00}'
```

### Export Report

```bash
manus-mcp-cli tool call export_report --server google-ads --input '{"format": "csv", "days": 30}'
```

## Using with Claude Desktop

Add to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "google-ads": {
      "command": "npx",
      "args": ["@samihalawa/google-ads-mcp-server"],
      "env": {
        "GOOGLE_ADS_CONFIG": "{\"client_id\":\"YOUR_CLIENT_ID\",\"client_secret\":\"YOUR_SECRET\",\"developer_token\":\"YOUR_TOKEN\",\"refresh_token\":\"YOUR_REFRESH\",\"login_customer_id\":\"YOUR_MANAGER_ID\"}",
        "GOOGLE_ADS_CUSTOMER_ID": "1234567890"
      }
    }
  }
}
```

Restart Claude Desktop and you'll have Google Ads tools available!

## Troubleshooting

### "GOOGLE_ADS_CONFIG environment variable is required"

Make sure you've set the environment variable:

```bash
export GOOGLE_ADS_CONFIG='{"client_id":"...","client_secret":"...","developer_token":"...","refresh_token":"...","login_customer_id":"..."}'
```

### "Failed to initialize Google Ads client"

Check your JSON format - it must be valid JSON:

```bash
# Test if your JSON is valid
echo $GOOGLE_ADS_CONFIG | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf-8')))"
```

### "Campaign not found"

Verify the campaign ID is correct:

```bash
# List all campaigns first
manus-mcp-cli tool call get_campaigns --server google-ads --input '{"days": 30}'
```

## Next Steps

1. ✅ **Automate daily monitoring** - Create a cron job
2. ✅ **Set up alerts** - Monitor performance thresholds
3. ✅ **Build dashboards** - Export data to visualization tools
4. ✅ **Integrate with CI/CD** - Automate campaign updates

## Getting Help

- **Documentation:** See README.md for complete reference
- **API Docs:** https://developers.google.com/google-ads/api/docs/start
- **MCP Spec:** https://modelcontextprotocol.io/
- **Issues:** https://github.com/samihalawa/google-ads-mcp-server/issues

## Tips

1. **Use environment variables** - Never hardcode credentials
2. **Start with read-only tools** - Get familiar before making changes
3. **Test on small campaigns first** - Verify everything works
4. **Monitor rate limits** - Google Ads API has daily quotas
5. **Keep refresh tokens secure** - They provide long-term access

---

**You're all set!** Start managing your Google Ads campaigns programmatically! 🚀
