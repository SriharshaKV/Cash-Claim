sap.ui.define([
	"wcm/ycashclaim/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"sap/m/ColumnListItem",
	"sap/ui/core/Icon",
	"sap/m/Text",
	"sap/m/Link",
	"sap/m/Input",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessagePopover",
	"sap/m/MessageItem",
	"wcm/ycashclaim/model/formatter",
	"sap/ui/model/Sorter",
	"sap/m/Toolbar",
	"sap/m/Button",
	"sap/m/ToolbarSpacer"
], function (BaseController, Filter, MessageToast, ColumnListItem, Icon, Text, Link, Input, JSONModel, MessagePopover, MessageItem,
	formatter, Sorter, Toolbar, Button, ToolbarSpacer) {
	"use strict";
	return BaseController.extend("wcm.ycashclaim.controller.Transactions", {
		formatter: formatter,
		onInit: function () {
			this.ODModel = this.getOwnerComponent().getModel();
			this.oTable = this.byId("tableA");
			this.oTableNA = this.byId("noAction");
			var oRouter = this.getRouter();
			oRouter.getRoute("transactions").attachMatched(this._oRouteMatched, this);
			var that = this;
			this.ODModel.read("/SakoCoreSet", {
				success: function (data, response) {
					that.GLModel = new JSONModel();
					var value = data.results;
					that.GLModel.setData(value);
				},
				error: function (errors) {

				}
			});
		},
		_oRouteMatched: function (oEvent) {
			this.oJModel = sap.ui.getCore().getModel("GLOBAL");
			this.data = this.oJModel.getData();
			var aFilter = new Filter("Runid", "EQ", this.data.Runid);
			var that = this;
			this.ODModel.read("/cashTransactionSet", {
				filters: [aFilter],
				success: function (data, response) {
					var value = [];
					value = data.results;
					if (value.length > 0) {
						that.oJModelL = new JSONModel();
						that.oJModelL.setData(value);
						that.buildView();
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
			//handling pooover
			if (!this.oResponsivePopover) {
				this.oResponsivePopover = sap.ui.xmlfragment("wcm.ycashclaim.view.fragment.TablePopover", this);
				this.oResponsivePopover.setModel(this.getView().getModel());
			}
			this.oTable.addEventDelegate({
				onAfterRendering: function () {
					var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
					for (var i = 0; i < oHeader.length; i++) {
						var oID = oHeader[i].id;
						that.onTableClick(oID);
					}
				}
			}, this.oTable);
			this.oTableNA.addEventDelegate({
				onAfterRendering: function () {
					var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
					for (var i = 0; i < oHeader.length; i++) {
						var oID = oHeader[i].id;
						that.onNATableClick(oID);
					}
				}
			}, this.oTable);
		},
		onTableClick: function (oID) {
			var that = this;
			$('#' + oID).click(function (oEvent) { //Attach Table Header Element Event
				var oTarget = oEvent.currentTarget; //Get hold of Header Element
				var oLabelText = oTarget.childNodes[0].textContent; //Get Column Header text
				var oView = that.getView();
				oView.getModel().setProperty("/bindingValue", that.metadataField(oLabelText)); //Save the key value to property
				that.oResponsivePopover.openBy(oTarget);
			});
		},
		onNATableClick: function (oID) {
			var that = this;
			$('#' + oID).click(function (oEvent) { //Attach Table Header Element Event
				var oTarget = oEvent.currentTarget; //Get hold of Header Element
				var oLabelText = oTarget.childNodes[0].textContent; //Get Column Header text
				var oView = that.getView();
				oView.getModel().setProperty("/bindingValue", that.metadataField(oLabelText)); //Save the key value to property
				that.oResponsivePopover.openBy(oTarget);
			});
		},
		metadataField: function (labelText) {
			var sResult;
			switch (labelText) {
			case "Status":
				sResult = "Tlight";
				break;
			case "Line":
				sResult = "LineNumber";
				break;
			case "Posting Key":
				sResult = "ZbcRecType";
				break;
			case "Transaction Type":
				sResult = "ZbcDesc";
				break;
			case "Remark":
				sResult = "ZbcRemrk01";
				break;
			case "Amount":
				sResult = "Wrbtr";
				break;
			case "G/L Account":
				sResult = "Saknr";
				break;
			case "Fund":
				sResult = "Geber";
				break;
			case "Value Date":
				sResult = "ZbcValueDate";
				break;
			}
			return sResult;
		},

		buildView: function () {

			this.tabFilter = this.byId("ITF1");
			this.tabFilter.setText(this.data.state);
			this.tabFilter.setIcon(this.data.icon);
			this.tabFilter.setIconColor(this.data.iconColor);

			//Page heading with Date
			var oPage = this.byId("transcPage");
			oPage.setTitle("Cash Transactions for " + this.data.Filedate);
			//Set Date Value for Datepicker
			var oDateP = this.byId("tranDate1");
			oDateP.setValue(this.data.Filedate);
			this.oView.setModel(this.oJModelL);
			var oToolbar = this.byId("oftb1");

			if (this.data.state === "To Be Processed") {
				oToolbar.setVisible(true);
				this.rebindTable(this.oToBeTemplate());
				this.oTable.getColumns()[8].setVisible(false);
				this.oTable.getColumns()[9].setVisible(false);
			} else {
				oToolbar.setVisible(false);
				this.oTable.getColumns()[8].setVisible(true);
				this.oTable.getColumns()[9].setVisible(true);
				this.rebindTable(this.oPostedTemplate());
			}
		},
		rebindTable: function (oTemplate) {

			var oFilter = new Filter("NoAction", "EQ", "");
			this.oTable.bindItems({
				path: "/",
				template: oTemplate
			});
			var oTableBinding = this.oTable.getBinding("items");
			oTableBinding.filter(oFilter);
			var that = this;
			oTableBinding.attachChange(function (evt) {
				that.onTableChange(evt);
			});
			this.oTable.attachUpdateFinished(function () {
				if (that.data.state === "To Be Processed") {
					this.getItems().forEach(function (row) {
						var obj = row.getBindingContext().getObject();
						if (obj.CellColor == "27") {
							row.addStyleClass("autoDetermined");
						}
					});
				}
			}.bind(this.oTable));

			var oFilterNA = new Filter("NoAction", "EQ", "X");
			var oTNABinding = this.oTableNA.getBinding("items");
			oTNABinding.filter(oFilterNA);

			//Setting to Tabs
			var oTabFilter2 = this.byId("ITF2");
			this.tabFilter.setCount(oTableBinding.iLength); //Tab1
			oTabFilter2.setCount(oTNABinding.iLength); //Tab2
		},
		onTableChange: function (oEvent) {

		},

		oToBeTemplate: function () {
			var self = this;
			var oToBeTemplate = new ColumnListItem({
				cells: [
					new Icon({
						src: {
							path: "Tlight",
							formatter: self.formatter.statusIcon
						},
						color: "#ff8000"
					}),
					new Text({
						text: "{=parseFloat(${LineNumber})}"
					}),
					new Text({
						text: {
							path: "ZbcRecType",
							formatter: self.formatter.postingKey
						}
					}),
					new Text({
						text: "{ZbcDesc}"
					}),
					new Link({
						emphasized: true,
						text: "{ZbcRemrk01}",
						tooltip: "{ZbcRemrk01}",
						press: [this.onRemarkPress, this]
					}),
					new Text({
						text: "{Wrbtr}"
					}),
					new Input({
						type: "Text",
						showSuggestion: true,
						showValueHelp: true,
						valueHelpRequest: [this.onSAKNRF4, this],
						value: "{Saknr}"
					}).addStyleClass("sapUiNoMargin"),
					new Input({
						type: "Text",
						value: "{Geber}"
					}).addStyleClass("sapUiNoMargin")
				]
			});
			return oToBeTemplate;
		},
		oPostedTemplate: function () {
			var self = this;
			var oPostedTemplate = new ColumnListItem({
				cells: [
					new Icon({
						src: {
							path: "Tlight",
							formatter: self.formatter.statusIcon
						},
						color: "#009933"
					}),
					new Text({
						text: "{=parseFloat(${LineNumber})}"
					}),
					new Text({
						text: {
							path: "ZbcRecType",
							formatter: self.formatter.postingKey
						}
					}),
					new Text({
						text: "{ZbcDesc}"
					}),
					new Link({
						text: "{ZbcRemrk01}",
						press: [this.onRemarkPress, this]
					}),
					new Text({
						text: "{Wrbtr}"
					}),
					new Text({
						text: "{Saknr}"
					}),
					new Text({
						text: "{Geber}"
					}),
					new Text({
						text: "{Belnr}"
					}),
					new Text({
						text: "{Buzei}"
					})
				]
			});
			return oPostedTemplate;
		},
		onSAKNRF4: function (oEvent) {

			var sInputValue = oEvent.getSource().getValue();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"wcm.ycashclaim.view.fragment.valueHelpDialog",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}
			this._valueHelpDialog.setModel(this.GLModel);
			this._valueHelpDialog.open(sInputValue);

		},
		_handleValueHelpSearch: function(){},
		_handleValueHelpClose: function(oEvent){
			
		},
		
		onRemarkPress: function (oEvent) {
			this.selRow = oEvent.getSource().getBindingContext().getObject();
			var runId = this.selRow.Runid;
			var lineNum = this.selRow.LineNumber;

			//  var pKey = this.byId("pKey");
			// pKey.setText(oEvent.getSource().getBindingContext().getObject().ZbcRecType);
			var fRunId = new Filter("Runid", "EQ", runId);
			var flineNum = new Filter("LineNumber", "EQ", lineNum);
			var aFilters = [];
			aFilters.push(fRunId);
			aFilters.push(flineNum);
			var that = this;
			this.ODModel.read("/remarksSet", {
				filters: aFilters,
				success: function (data, response) {
					that.Remarks = [];
					that.Remarks = data.results;
					if (that.Remarks.length > 0) {
						that.jModel2 = new JSONModel();
						that.jModel2.setData(that.Remarks);
						that.getView().setModel(that.jModel2, "Remarks");
						that.callRemarkDialog();
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
		callRemarkDialog: function () {
			if (!this.oDialogFragment) {
				this.oDialogFragment = sap.ui.xmlfragment("wcm.ycashclaim.view.fragment.Remarks", this);
				this.getView().addDependent(this.oDialogFragment);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oDialogFragment);

				var pKey = sap.ui.getCore().byId("pKey"); //posting key
				var recType;
				if (this.selRow.ZbcRecType === "C") {
					recType = "Credit";
				} else {
					recType = "Debit";
				}
				pKey.setText(recType);
			}
			var transType = sap.ui.getCore().byId("tType"); //Transaction Type
			transType.setText(this.selRow.ZbcTranType);
			var custRefer = sap.ui.getCore().byId("cRefer"); //Customer Refer
			custRefer.setText(this.selRow.ZbcCustRef);
			var bankRefer = sap.ui.getCore().byId("Brefer"); //Bank Refer
			bankRefer.setText(this.selRow.ZbcBankRef);
			var docGroup = sap.ui.getCore().byId("docgT"); //Document Group

			var iconTBar = this.byId("ICTBAR");
			var docgL = sap.ui.getCore().byId("docgL");
			var docgT = sap.ui.getCore().byId("docgT");
			if (iconTBar.getSelectedKey() === "NoAction") {
				docgL.setVisible(false);
				docgT.setVisible(false);
			} else {
				docgL.setVisible(true);
				docgT.setVisible(true);
				docGroup.setText(this.selRow.ZbcDocgrp);
			}
			this.oDialogFragment.open();
		},
		onCloseDialog: function () {
			this.oDialogFragment.close();
		},
		createPopover: function () {

		},
		onSave: function () {
			var tableData = this.oJModelL.getData();
			var i = 0;
			var len = tableData.length;
			var that = this;
			that.saveErrors = [];
			this.ODModel.setDeferredGroups(["sav"]);
			var mParameters = {
				groupId: "sav",
				success: function (resp) {
					// console.log(resp);
				},
				error: function (resp) {
					that.saveErrors.push(resp);
				}
			};
			this.ODModel.setUseBatch(true);
			for (; i < len; i++) {
				this.ODModel.update("/cashTransactionSet(Runid='" +
					tableData[i].Runid + "',LineNumber='" + tableData[i].LineNumber + "')", tableData[i], mParameters);
			}
			this.ODModel.submitChanges(mParameters);
			this.ODModel.setUseBatch(false);
			if (this.saveErrors.length == 0) {
				MessageToast.show("Data Saved Successfully");
			}
		},
		onSimulate: function (oEvent) {
			// this.onSave();
			var date = this.byId("tranDate1").getValue();
			date = formatter.SAPFormatDate(date);
			var that = this;
			this.ODModel.read("/actionSet(Runid='" + this.data.Runid + "',Budat='" + date + "',Action='S')", {
				success: function (data, response) {
					var sMsg = "Successful";
					MessageToast.show(sMsg);
				},
				error: function (errors) {
					that.messageHandling(errors);
				}
			});
		},

		onPost: function (oEvent) {
			this.onSave();
			var that = this;
			var date = this.byId("tranDate1").getValue();
			date = formatter.SAPFormatDate(date);
			this.ODModel.read("/actionSet(Runid='" + this.data.Runid + "',Budat='" + date + "',Action='P')", {
				success: function (data, response) {
					var sMsg = "Successful";
					MessageToast.show(sMsg);
				},
				error: function (errors) {
					that.messageHandling(errors);
				}
			});
		},
		messageHandling: function (errors) {
			var oerJSON = JSON.parse(errors.responseText);
			var oerrors = oerJSON.error.innererror.errordetails;
			this.oToolbar = this.byId("msgTBar");
			this.btnPopover = this.byId("messagePopoverBtn");
			this.oToolbar.setVisible(true);
			if (!this.oMP) {
				this.oMP = new MessagePopover();
			}
			var i = 0;
			var len = oerrors.length;
			this.btnPopover.setText(len);
			for (; i < len; i++) {
				var type, slashIndex, groupName;
				if (oerrors[i].code == "/IWBEP/CX_MGW_BUSI_EXCEPTION") {
					continue;
				}
				if (oerrors[i].severity == "success") {
					type = "Success";
				} else if (oerrors[i].severity == "error") {
					type = "Error";
				} else if (oerrors[i].severity == "warning") {
					type = "Warning";
				} else {
					continue;
				}
				slashIndex = oerrors[i].code.indexOf('/');
				groupName = oerrors[i].code.slice(0, slashIndex);
				var oMessageitem = new MessageItem({
					type: type,
					title: oerrors[i].message,
					groupName: groupName
				});
				this.oMP.addItem(oMessageitem);
			}
			this.oMP._oMessageView.setGroupItems(true);
			this.btnPopover.addDependent(this.oMP);
			setTimeout(function () {
				this.oMP.openBy(this.btnPopover);
			}.bind(this), 100);
		},
		buildFToolbar: function () {

			this.btnPopover = new Button({
				id: "messagePopoverBtn",
				icon: "sap-icon://message-popup",
				type: "Emphasized",
				press: "handleMessagePopoverPress"
			});
			this.TBS = new ToolbarSpacer();
			this.btn2 = new Button({
				text: "Cancel",
				press: "onToolbarCancel"
			});
			this.oToolbar = new Toolbar("msgBar");
			this.oToolbar.addContent(this.btnPopover, this.TBS, this.btn2);
		},
		handleMessagePopoverPress: function (oEvent) {
			this.oMP.toggle(oEvent.getSource());
		},
		onToolbarCancel: function (oEvent) {
			this.oToolbar.setVisible(false);
			var oPage = this.byId("transcPage");
			oPage.destroyFooter();
		},
		onExportmenu: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			if (oItem.getText() == "Export Screen") {

			} else if (oItem.getText() == "Export File") {

			}
		},
		onFilterMenu: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			var oTableBinding = this.oTable.getBinding("items");
			var oFilter, aFilter;
			aFilter = new Filter("NoAction", "EQ", "");
			if (oItem.getText() === "All Values") {
				oTableBinding.aFilters = null;
				oTableBinding.filter(aFilter);
			} else if (oItem.getText() === "Default Values") {
				oFilter = new Filter("CellColor", "EQ", "27");
				oTableBinding.filter([aFilter, oFilter], true);
			} else {
				oFilter = new Filter("CellColor", "NE", "27");
				oTableBinding.filter([aFilter, oFilter], true);
			}
		},
		onNavBack: function () {
			// this.getRouter().getTargets().display("home");
			history.go(-1);
			return;
		},
		onAscending: function () {
			var oItems = this.oTable.getBinding("items");
			var oBindingPath = this.getView().getModel().getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath);
			oItems.sort(oSorter);
			this.oResponsivePopover.close();
		},
		onDescending: function () {
			var oItems = this.oTable.getBinding("items");
			var oBindingPath = this.getView().getModel().getProperty("/bindingValue");
			var oSorter = new Sorter(oBindingPath, true);
			oItems.sort(oSorter);
			this.oResponsivePopover.close();
		}
	});
});