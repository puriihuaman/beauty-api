const formatCampaignName = (text) => {
	return text.trim().replaceAll(/[^a-zA-Z0-9-]/g, "-");
};

module.exports = { formatCampaignName };
