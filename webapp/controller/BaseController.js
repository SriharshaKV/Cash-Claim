sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller, History) {
	"use strict";
	return Controller.extend("wcm.ycashclaim.controller.BaseController", {

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		}

	});

});