# Google Ads MCP Server (Node.js) - Quick Start

Get up and running in 5 minutes!

## Prerequisites

✅ Node.js 18+ (you have v22.13.0)  
✅ pnpm (installed)  
✅ Google Ads API credentials (configured)

## Step 1: Install Dependencies (30 seconds)

```bash
cd /home/ubuntu/google-ads-mcp-node
pnpm install
```

## Step 2: Verify Configuration (Already Done!)

The `google-ads.yaml` file is already configured:

```yaml
developer_token: i525AeFTAacFOtQtWBjY6g
client_id: 963208150325-mmhibhl91g39ma9jsvrgacpleraq4nfu.apps.googleusercontent.com
client_secret: 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
refresh_token: 1//04OmKZJ58yhQaCgYIARAAGAQSNwF-L9IrfyrhE7W2zk00iStBE8dCRazdeUgXiMVxH-WIr9PEh6W3_RvjRKSZx-FH3l3Dun5vWOc
login_customer_id: 4850172260
```

✅ **Ready to use!**

## Step 3: Start the Server (10 seconds)

```bash
node server.js
```

Expected output: `Google Ads MCP Server (Node.js) running on stdio`

## Step 4: Use with manus-mcp-cli (2 minutes)

### List available tools:

```bash
manus-mcp-cli tool list --server google-ads
```

### Get your campaigns:

```bash
manus-mcp-cli tool call get_campaigns --server google-ads --input '{"days": 30}'
```

### Get performance summary:

```bash
manus-mcp-cli tool call get_performance_summary --server google-ads --input '{"days": 7}'
```

### Get top performers:

```bash
manus-mcp-cli tool call get_top_performers --server google-ads --input '{"metric": "ctr", "limit": 3}'
```

## Your Current Campaigns

### Campaign #1 (ID: 23207843655)
- Status: ENABLED
- Budget: €4.00/day
- Performance: ⚠️ Underperforming (High CPC: €0.589)

**Recommended action:**
```bash
manus-mcp-cli tool call pause_campaign --server google-ads --input '{"campaign_id": "23207843655"}'
```

### Black Friday 2025 (ID: 23270379040)
- Status: ENABLED
- Budget: €15.00/day
- Performance: ✅ Excellent (Low CPC: €0.029)

**Recommended action:**
```bash
manus-mcp-cli tool call update_campaign_budget --server google-ads --input '{"campaign_id": "23270379040", "budget_euros": 25.0}'
```

## Common Operations

### Check Campaign Performance

```bash
# Get all campaigns
manus-mcp-cli tool call get_campaigns --server google-ads --input '{}'

# Get specific campaign details
manus-mcp-cli tool call get_campaign_details --server google-ads --input '{"campaign_id": "23207843655"}'
```

### Manage Campaigns

```bash
# Pause underperforming campaign
manus-mcp-cli tool call pause_campaign --server google-ads --input '{"campaign_id": "23207843655"}'

# Enable campaign
manus-mcp-cli tool call enable_campaign --server google-ads --input '{"campaign_id": "23270379040"}'

# Update budget
manus-mcp-cli tool call update_campaign_budget --server google-ads --input '{"campaign_id": "23270379040", "budget_euros": 20.0}'
```

### Generate Reports

```bash
# Export to CSV
manus-mcp-cli tool call export_report --server google-ads --input '{"format": "csv", "days": 30}'

# Export to JSON
manus-mcp-cli tool call export_report --server google-ads --input '{"format": "json", "days": 7}'
```

## Troubleshooting

### "Failed to initialize Google Ads client"

**Solution:** Check that `google-ads.yaml` exists:
```bash
ls -la google-ads.yaml
chmod 600 google-ads.yaml
```

### "Campaign not found"

**Solution:** Verify the campaign ID:
```bash
manus-mcp-cli tool call get_campaigns --server google-ads --input '{}'
```

### "Unauthorized" error

**Solution:** Refresh token may have expired. Generate a new one using OAuth Playground.

## Next Steps

1. ✅ **Set up conversion tracking** on AutoTinder.ai
2. ✅ **Pause Campaign #1** (wasting budget)
3. ✅ **Scale Black Friday campaign** (performing well)
4. ✅ **Schedule daily reports** using the MCP server
5. ✅ **Integrate with automation tools**

## Quick Reference

| Tool | Purpose | Example |
|------|---------|---------|
| `get_campaigns` | List all campaigns | `{"days": 30}` |
| `get_campaign_details` | Campaign details | `{"campaign_id": "123"}` |
| `get_performance_summary` | Account summary | `{"days": 7}` |
| `get_top_performers` | Top campaigns | `{"metric": "ctr", "limit": 5}` |
| `pause_campaign` | Pause campaign | `{"campaign_id": "123"}` |
| `enable_campaign` | Enable campaign | `{"campaign_id": "123"}` |
| `update_campaign_budget` | Update budget | `{"campaign_id": "123", "budget_euros": 20}` |
| `export_report` | Export data | `{"format": "csv"}` |

---

**You're all set!** 🎉

Your Node.js Google Ads MCP server is ready to use!
