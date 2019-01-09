sap.ui.define([
	"wcm/ycashclaim/controller/BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/Filter",
	"sap/ui/core/format/DateFormat",
	"sap/m/NumericContent",
	"sap/m/ObjectNumber",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/VBox",
	"sap/m/ObjectStatus",
	"sap/m/HBox",
	"sap/ui/layout/Grid",
	"wcm/ycashclaim/model/formatter"
], function (BaseController, MessageToast, JSONModel, ODataModel, Filter, DateFormat, NumericContent,
	ObjectNumber, HorizontalLayout, VBox, ObjectStatus, HBox, Grid, formatter) {
	"use strict";

	return BaseController.extend("wcm.ycashclaim.controller.Home", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf wcm.ycashclaim.view.Home
		 */
		onInit: function () {

			//Getting default model
			this.ODModel = this.getOwnerComponent().getModel();
			this.oCarousel = this.byId("carousel1");
			this.fDate = this.byId("fileDate");
			this.pDate = this.byId("pDate");
			var oDateTo = new Date();
			var oDateFr = new Date();
			this.fDate.setSecondDateValue(oDateTo);
			oDateFr.setDate(oDateTo.getDate() - 30);
			this.fDate.setDateValue(oDateFr);

		},
		onExcludeCBox: function (oEvent) {

			//Enable Processed Date input when unchecked.
			var eCheckB = oEvent.getSource();
			var pDate = this.byId("pDate");
			if (eCheckB.getSelected() === true) {
				pDate.setEnabled(false);
			} else {
				pDate.setEnabled(true);
			}
		},

		onShowFilesBtn: function () {
			var oDateFormat, fDateFrom;
			this.oCarousel.destroyPages();
			oDateFormat = DateFormat.getDateTimeInstance({
				pattern: "yyyyMMdd"
			});
			fDateFrom = oDateFormat.format(this.fDate.getDateValue());
			if (!fDateFrom) {
				//Raise error message
			}
			var aFilters, fDateTo, fDateFilter, exCheckStatus;

			aFilters = [];
			fDateTo = oDateFormat.format(this.fDate.getSecondDateValue());
			if (fDateTo === fDateFrom) {
				fDateFilter = new Filter("Filedate", "EQ", fDateFrom);
			} else {
				fDateFilter = new Filter("Filedate", "BT", fDateFrom, fDateTo);
			}
			if (fDateFilter) {
				aFilters.push(fDateFilter);
			}
			exCheckStatus = this.byId("excludeCheck").getSelected();
			var pDateFrom, pDateTo, pDateFilter;
			if (exCheckStatus === false) {
				pDateFrom = oDateFormat.format(this.pDate.getDateValue());
				pDateTo = oDateFormat.format(this.pDate.getSecondDateValue());
				if (pDateTo === pDateFrom) {
					pDateFilter = new Filter("Budat", "EQ", pDateFrom);
				} else {
					pDateFilter = new Filter("Budat", "BT", pDateFrom, pDateTo);
				}
			}
			if (pDateFilter) {
				aFilters.push(pDateFilter);
			}
			var that = this;
			this.ODModel.read("/bankFileSet", {
				filters: aFilters,
				success: function (data, response) {
					that.value = [];
					that.value = data.results;
					if (that.value.length > 0) {
						that.createTiles(that.value);
					} else {
						var sMsg = "No Data Found For The Selected Criteria";
						MessageToast.show(sMsg);
					}
				},
				error: function () {
					var sMsg = "No Data Found For The Selected Criteria";
					MessageToast.show(sMsg);
				}
			});
		},

		createTiles: function (data) {
			var i = 0;
			var iLength = data.length;
			// var oHBox = this.byId("tilesC");
			var that = this;
			for (; i < iLength; i++) {
				var oVboxMain = new VBox({
					id: "file" + data[i].Runid
				}).attachBrowserEvent("click", function (oEvent) {
					that.onFileSelect(oEvent);
				});

				var ocontentBox = new VBox();
				var fileDate = formatter.dateFormat(data[i].Filedate);
				var oFiledate = new ObjectStatus({
					title: "File Date",
					text: fileDate
				}).addStyleClass("sapUiTinyMargin");
				ocontentBox.addItem(oFiledate);
				var oNumRecords = new ObjectStatus({
					title: "Num.Of Rec",
					text: data[i].ZbcRecCnt
				}).addStyleClass("sapUiTinyMargin");
				ocontentBox.addItem(oNumRecords);
				var oTCredit = new ObjectNumber({
					number: data[i].Totcr,
					unit: "USD",
					state: "Success",
					textAlign: "Center"
				}).addStyleClass("sapUiTinyMargin");
				ocontentBox.addItem(oTCredit);
				var oTDebit = new ObjectNumber({
					number: data[i].Totdr,
					unit: "USD",
					state: "Warning",
					textAlign: "Center"
				}).addStyleClass("sapUiTinyMargin");
				ocontentBox.addItem(oTDebit);
				if (data[i].Zcreat) {
					var oProcessedOn = new ObjectStatus({
						text: data[i].Zcreat,
						icon: "sap-icon://date-time"
					}).addStyleClass("sapUiTinyMargin");
					ocontentBox.addItem(oProcessedOn);
				}

				if (data[i].Zcreby) {
					//Processed
					var oProcessedBy = new ObjectStatus({
						text: data[i].Zcreby,
						icon: "sap-icon://customer-and-contacts"
					}).addStyleClass("sapUiTinyMargin");
					ocontentBox.addItem(oProcessedBy);
					oVboxMain.addStyleClass("tileClassProcessed");
				} else {
					//Not Processed
					oVboxMain.addStyleClass("tileClassNotProcessed");
				}
				ocontentBox.addStyleClass("localBox");
				oVboxMain.addItem(ocontentBox);

				if (i === 0) {
					var oGridi = new Grid({
						defaultSpan: "XL2 L2 M4 S8"
					});
				}
				oGridi.addContent(oVboxMain);
				if (oGridi.getContent().length === 12) {
					this.oCarousel.addPage(oGridi);
					var oGridi = new Grid({
						defaultSpan: "XL2 L2 M4 S8"
					});
				}
				if (i == iLength - 1 && oGridi.getContent().length > 0) {
					this.oCarousel.addPage(oGridi);
				}
			}
		},
		findInArray: function (value, index, array) {
			if (value.Runid === this.runId) {
				var oData = {};
				if (value.Zcreby) {
					//Processed
					oData.state = "Posted";
					oData.icon = "sap-icon://stop";
					oData.iconColor = "Negative";
				} else {
					//To be Processed
					oData.state = "To Be Processed";
					oData.icon = "sap-icon://begin";
					oData.iconColor = "Positive";
				}
				oData.Filedate = value.Filedate;
				oData.Runid = value.Runid;
				var oJModel = new JSONModel();
				oJModel.setData(oData);
				sap.ui.getCore().setModel(oJModel, "GLOBAL");
			}
		},
		onFileSelect: function (oEvent) {
				//Call Transaction view..
				var fileId = oEvent.currentTarget.id;
				this.runId = fileId.slice(4);
				this.value.find(this.findInArray, this);
				this.getRouter().navTo("transactions", {
					runid: this.runId
				});
				// this.getRouter().getTargets().display("transactions");
			}
			//
	});

});