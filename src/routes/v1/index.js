const customerRouter = require("./customerRoute");

module.exports = {
	catalogRouter: require("./catalog.route"),
	campaignRouter: require("./campaign.route"),
	catalogCampaignRouter: require("./catalog-campaign.route"),
	customerRouter: require("./customerRoute"),
	productRouter: require("./product.route"),
	orderRouter: require("./order.route"),
};
