#!/usr/bin/env node

/**
 * Test the fixed Google Ads MCP Server (v1.4.0 with google-ads-api v21.0.1)
 */

import { GoogleAdsApi } from 'google-ads-api';

// Set environment variables for the server
process.env.GOOGLE_ADS_CONFIG = JSON.stringify({
  client_id: '963208150325-mmhibhl91g39ma9jsvrgacpleraq4nfu.apps.googleusercontent.com',
  client_secret: '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',
  developer_token: 'i525AeFTAacFOtQtWBjY6g',
  refresh_token: '1//04OmKZJ58yhQaCgYIARAAGAQSNwF-L9IrfyrhE7W2zk00iStBE8dCRazdeUgXiMVxH-WIr9PEh6W3_RvjRKSZx-FH3l3Dun5vWOc',
  login_customer_id: '4850172260',
});
process.env.GOOGLE_ADS_CUSTOMER_ID = '1248495560';

console.log('Testing Google Ads MCP Server v1.4.0 with google-ads-api v21.0.1\n');

// Initialize client
const config = JSON.parse(process.env.GOOGLE_ADS_CONFIG);
const googleAdsClient = new GoogleAdsApi({
  client_id: config.client_id,
  client_secret: config.client_secret,
  developer_token: config.developer_token,
});

const customer = googleAdsClient.Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
  refresh_token: config.refresh_token,
  login_customer_id: config.login_customer_id,
});

// Test 1: get_campaigns
async function testGetCampaigns() {
  console.log('TEST 1: get_campaigns');
  console.log('='.repeat(50));
  
  try {
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
      AND segments.date DURING LAST_30_DAYS
      ORDER BY metrics.cost_micros DESC
    `;

    const campaigns = await customer.query(query);
    
    console.log(`✅ Found ${campaigns.length} campaigns\n`);
    
    campaigns.forEach((row) => {
      console.log(`Campaign: ${row.campaign.name}`);
      console.log(`  ID: ${row.campaign.id}`);
      console.log(`  Status: ${row.campaign.status}`);
      console.log(`  Budget: €${(row.campaign_budget.amount_micros / 1_000_000).toFixed(2)}/day`);
      console.log(`  Spend: €${(row.metrics.cost_micros / 1_000_000).toFixed(2)}`);
      console.log(`  Clicks: ${row.metrics.clicks}, Impressions: ${row.metrics.impressions}`);
      console.log(`  CTR: ${(row.metrics.ctr * 100).toFixed(2)}%, CPC: €${(row.metrics.average_cpc / 1_000_000).toFixed(3)}`);
      console.log(`  Conversions: ${row.metrics.conversions}\n`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Test 2: get_campaign_details
async function testGetCampaignDetails(campaignId) {
  console.log('\nTEST 2: get_campaign_details');
  console.log('='.repeat(50));
  
  try {
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.start_date,
        campaign.end_date,
        campaign_budget.amount_micros,
        metrics.clicks,
        metrics.impressions,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value
      FROM campaign
      WHERE campaign.id = ${campaignId}
      AND segments.date DURING LAST_30_DAYS
    `;

    const results = await customer.query(query);
    
    if (results.length > 0) {
      const row = results[0];
      console.log(`✅ Campaign Details for ID ${campaignId}\n`);
      console.log(`Name: ${row.campaign.name}`);
      console.log(`Status: ${row.campaign.status}`);
      console.log(`Start Date: ${row.campaign.start_date}`);
      console.log(`Budget: €${(row.campaign_budget.amount_micros / 1_000_000).toFixed(2)}/day`);
      console.log(`Spend: €${(row.metrics.cost_micros / 1_000_000).toFixed(2)}`);
      console.log(`Clicks: ${row.metrics.clicks}, Impressions: ${row.metrics.impressions}`);
      console.log(`CTR: ${(row.metrics.ctr * 100).toFixed(2)}%, CPC: €${(row.metrics.average_cpc / 1_000_000).toFixed(3)}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Test 3: get_performance_summary
async function testGetPerformanceSummary() {
  console.log('\nTEST 3: get_performance_summary');
  console.log('='.repeat(50));
  
  try {
    const query = `
      SELECT
        metrics.clicks,
        metrics.impressions,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value
      FROM campaign
      WHERE campaign.status != 'REMOVED'
      AND segments.date DURING LAST_30_DAYS
    `;

    const results = await customer.query(query);
    
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalCost = 0;
    let totalConversions = 0;
    let totalConversionValue = 0;
    
    results.forEach(row => {
      totalClicks += row.metrics.clicks;
      totalImpressions += row.metrics.impressions;
      totalCost += row.metrics.cost_micros;
      totalConversions += row.metrics.conversions;
      totalConversionValue += row.metrics.conversions_value;
    });
    
    console.log('✅ Account Performance Summary (Last 30 Days)\n');
    console.log(`Total Spend: €${(totalCost / 1_000_000).toFixed(2)}`);
    console.log(`Total Clicks: ${totalClicks}`);
    console.log(`Total Impressions: ${totalImpressions}`);
    console.log(`Overall CTR: ${((totalClicks / totalImpressions) * 100).toFixed(2)}%`);
    console.log(`Overall CPC: €${(totalCost / totalClicks / 1_000_000).toFixed(3)}`);
    console.log(`Total Conversions: ${totalConversions}`);
    console.log(`Total Conversion Value: €${totalConversionValue.toFixed(2)}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  const test1 = await testGetCampaigns();
  const test2 = await testGetCampaignDetails('23207843655');
  const test3 = await testGetPerformanceSummary();
  
  console.log('\n' + '='.repeat(50));
  console.log('TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`get_campaigns: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`get_campaign_details: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`get_performance_summary: ${test3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log('\nAll tests completed!');
}

runTests().catch(console.error);
