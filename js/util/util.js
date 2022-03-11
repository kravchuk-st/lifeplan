/* global LIFEPLAN */

/**
 * lifeplan 汎用ファイル関連ユーティリティクラス
 */
"use strict";

LIFEPLAN.util.Util = (function() {
	var self;
	var m_basepath = "";

	var Util = function() {
		self = this;
	};
	var p = Util.prototype;

	p.calcDaysOfMonth = function(year, month) {
		var cal = new Date(year, month, 0);
		return cal.getDate();
	};
	p.num2ManRound = function(val) {
		var d100 = Math.floor(val / 100 % 10);
		var kuriage = 0;
		if (d100 > 4) {
			kuriage = 1;
		}
		var d1000 = Math.floor(val / 1000);
		d1000 += kuriage;
		var l, r;
		l = Math.floor(d1000 / 10);
		r = Math.floor(d1000 % 10);
		return String(l) + "." + String(r);
	};
	p.formatMoney = function(val, keta) {
		var roundedVal = self.excelRound(val, keta);
		return this.commafy(roundedVal) + "円";
	};
	p.formatMoneyMan = function(val, keta) {
		if (keta >= 2) {
			val /= 10000.000;
			var roundedVal = self.excelRound(val, keta);
			roundedVal = parseFloat(roundedVal).toFixed(keta);
			return this.commafy(roundedVal) + "万円";
		} else if (keta === 1) {
			val /= 10000.00;
			var roundedVal = self.excelRound(val, keta);
			roundedVal = parseFloat(roundedVal).toFixed(keta);
			return this.commafy(roundedVal) + "万円";
		} else {
			val /= 10000.0;
			var roundedVal = self.excelRound(val, keta);
			return this.commafy(roundedVal) + "万円";
		}
	};
	p.formatMoneyManNum = function(val, keta) {
		if (keta >= 2) {
			val /= 10000.000;
			var roundedVal = self.excelRound(val, keta);
			roundedVal = parseFloat(roundedVal).toFixed(keta);
			return this.commafy(roundedVal);
		} else if (keta === 1) {
			val /= 10000.00;
			var roundedVal = self.excelRound(val, keta);
			roundedVal = parseFloat(roundedVal).toFixed(keta);
			return this.commafy(roundedVal);
		} else {
			val /= 10000.0;
			var roundedVal = self.excelRound(val, keta);
			return this.commafy(roundedVal);
		}
	};
	p.num2RoundN = function(val, keta) {
		var before = val;
		return String(before.toFixed(keta));
	};

//	/**
//	 * @category excel
//	 */
	p.excelMin = function(a, b) {
		if (a < b) {
			return a;
		}
		return b;
	};
	p.excelMax = function(a, b) {
		if (a > b) {
			return a;
		}
		return b;
	};
	p.excelRoundUp = function(d, a_digit) {
		d = isNaN(d) ? 0 : d;
		var _pow = Math.pow(10, a_digit);
		return Math.ceil(d * _pow) / _pow;
	};
	p.excelRoundDown = function(d, a_digit) {
		d = isNaN(d) ? 0 : d;
		var _pow = Math.pow(10, a_digit);
		return Math.floor(d * _pow) / _pow;
	};
	p.excelRound = function(d, a_digit) {
		d = isNaN(d) ? 0 : d;
		var _pow = Math.pow(10, a_digit);
		return Math.round(d * _pow) / _pow;
	};
	p.commafy = function (n) {
		var parts = n.toString().split('.');
		parts[0] = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
		return parts.join('.');
	};

	return Util;
})();