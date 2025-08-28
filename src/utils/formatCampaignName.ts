export const formatCampaignName = (text: string) => {
	return text.trim().replaceAll(/[^a-zA-Z0-9-]/g, "-");
};
