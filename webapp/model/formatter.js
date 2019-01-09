sap.ui.define([], function () {
	"use strict";
	return {
		statusIcon: function (Tlight) {
			var sResult;
			switch (Tlight) {
			case 'ICON_GREEN_LIGHT':
				sResult = 'sap-icon://status-inactive';
				break;
			case 'ICON_YELLOW_LIGHT':
				sResult = 'sap-icon://status-critical';
				break;
			case 'ICON_RED_LIGHT':
				sResult = 'sap-icon://status-negative';
				break;
			}
			return sResult;
		},
		postingKey: function (value) {
			var sResult;
			if (value === "C") {
				sResult = "Credit";
			} else {
				sResult = "Debit";
			}
			return sResult;
		},
		dateFormat: function (date) {
			var sResult;
			sResult = date.slice(5, 7) + "/" + date.slice(8, 10) + "/" + date.slice(0, 4);
			return sResult;
		},
		SAPFormatDate: function (date) {
			var sResult = date.slice(0, 4) + date.slice(5, 7) + date.slice(8, 10);
			return sResult;
		},
		enableAutoDetermined: function(value){
			var sResult;
			if(value == "X"){
				sResult = true;
			}else{
				sResult =  false;
			}
			return sResult;
		}
	};
});