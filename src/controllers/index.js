module.exports = {
	getAllCatalogs: require("./catalogController").getAllCatalogs,
	getCatalogById: require("./catalogController").getCatalogById,
	createCatalog: require("./catalogController").createCatalog,
	updateCatalog: require("./catalogController").updateCatalog,
	deleteCatalog: require("./catalogController").deleteCatalog,

	getAllCampaigns: require("./campaignController").getAllCampaigns,
	getCampaignById: require("./campaignController").getCampaignById,
	getCampaignById: require("./campaignController").getCampaignById,
	createCampaign: require("./campaignController").createCampaign,
	updateCampaign: require("./campaignController").updateCampaign,
	deleteCampaign: require("./campaignController").deleteCampaign,

	getAllCampaignCatalogs: require("./catalogCampaignController")
		.getAllCampaignCatalogs,
	getCampaignCatalogById: require("./catalogCampaignController")
		.getCampaignCatalogById,
	createCampaignCatalog: require("./catalogCampaignController")
		.createCampaignCatalog,
	updateCampaignCatalog: require("./catalogCampaignController")
		.updateCampaignCatalog,
	deleteCampaignCatalog: require("./catalogCampaignController")
		.deleteCampaignCatalog,

	getAllProducts: require("./productController").getAllProducts,
	getProductById: require("./productController").getProductById,
	createProduct: require("./productController").createProduct,
	updateProduct: require("./productController").updateProduct,
	deleteProduct: require("./productController").deleteProduct,

	getAllOrders: require("./orderController").getAllOrders,
	getOrderById: require("./orderController").getOrderById,
	createOrder: require("./orderController").createOrder,
	createNewOrder: require("./orderController").createNewOrder,
	updateOrder: require("./orderController").updateOrder,
	deleteOrder: require("./orderController").deleteOrder,
};
