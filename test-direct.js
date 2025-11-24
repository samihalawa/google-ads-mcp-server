import { GoogleAdsApi } from 'google-ads-api';

const config = {
  client_id: '963208150325-mmhibhl91g39ma9jsvrgacpleraq4nfu.apps.googleusercontent.com',
  client_secret: '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',
  developer_token: 'i525AeFTAacFOtQtWBjY6g',
};

const client = new GoogleAdsApi(config);

const customer = client.Customer({
  customer_id: '1248495560',
  refresh_token: '1//04OmKZJ58yhQaCgYIARAAGAQSNwF-L9IrfyrhE7W2zk00iStBE8dCRazdeUgXiMVxH-WIr9PEh6W3_RvjRKSZx-FH3l3Dun5vWOc',
  login_customer_id: '4850172260',
});

try {
  console.log('Testing Google Ads API connection...');
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status
    FROM campaign
    WHERE campaign.status != 'REMOVED'
    LIMIT 5
  `;
  
  const campaigns = await customer.query(query);
  console.log('✅ Success! Found campaigns:', campaigns.length);
  campaigns.forEach(row => {
    console.log(`  - ${row.campaign.name} (ID: ${row.campaign.id}, Status: ${row.campaign.status})`);
  });
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Full error:', error);
}
