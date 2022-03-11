"use strict";

// 名前空間設定
var LIFEPLAN = LIFEPLAN || {
	db: {
		LifePlanDB: {}
	},
	calc: {
		BaseCalc: {},
		Calc: {},
		Logic01: {},
		Logic02: {},
		Logic03: {},
		Logic04: {},
		Logic05: {},
		Logic06: {},
		Logic07: {},
		Logic08: {},
		Logic09: {}
	},
	util: {
		Util: {}
	},
	module: {},
	conf: {},
	graph: {
		Graph: {},
		GraphSimulation1: {},
		GraphSimulation2: {},
		GraphEvent: {},
		GraphInsurance: {},
		GraphNenkin: {}
	},
	app: {
		InputValueCheck: {}
	}
};

// 共通モジュールの定義
LIFEPLAN.module = (function() {

	var inherits = function(childCtor, parentCtor) {
		Object.setPrototypeOf = Object.setPrototypeOf || function(obj, proto) {
			obj.__proto__ = proto;
			return obj;
		}
		Object.setPrototypeOf(childCtor.prototype, parentCtor.prototype);
	};

	var toMoneyManNum = function(d) {
		var data = d;
		while (data.match(/[^0-9]+/)) {
			data = data.replace(/[^0-9]+/, '');
		}
		return commafy(data);
	};

	var toFilteredNum = function(d) {
		var data = d;
		while (data.match(/[^0-9.]+/)) {
			data = data.replace(/[^0-9.]+/, '');
		}
		return Number(data);
	};

	var getModelClass = function(id_modelcase) {
		var className;
		if (id_modelcase === 0) {
			className = "";
		} else if (id_modelcase === 1) {
			className = "single";
		} else if (id_modelcase === 2) {
			className = "child-rearing";
		} else if (id_modelcase === 3) {
			className = "senior";
		} else if (id_modelcase === 4) {
			className = "retirement";
		}
		return className;
	};

	var setYear = function(y, mValue) {
		return y * 10000 + mValue % 10000;
	};
	var setMon = function(m, mValue) {
		return Math.floor(mValue / 10000) * 10000 + m * 100 + mValue % 100;
	};
	var setDay = function(d, mValue) {
		return d + Math.floor(mValue / 100) * 100;
	};

	var listAddUnselected = function(list) {
		var listNew = list;
		var misettei = new LIFEPLAN.db.LifePlanDB().Wording.MISENTAKU;
		listNew.unshift(misettei);
		return listNew;
	};
	
	var commafy = function (n) {
		var parts = n.toString().split('.');
		parts[0] = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
		return parts.join('.');
	};

	return {
		inherits: inherits,
		toMoneyManNum: toMoneyManNum,
		toFilteredNum: toFilteredNum,
		getModelClass: getModelClass,
		setYear: setYear,
		setMon: setMon,
		setDay: setDay,
		listAddUnselected: listAddUnselected,
		commafy: commafy
	};

})();

// 共通設定
LIFEPLAN.conf = {
	storage: sessionStorage
};
