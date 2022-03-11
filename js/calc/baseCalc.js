/* global LIFEPLAN */

"use strict";

LIFEPLAN.calc.BaseCalc = (function() {

	var self;
	var LPdate = new LIFEPLAN.db.LifePlanDB().LPdate;

	var BaseCalc = function(db) {
		self = this;
		self.DB = db;
		self.MC = this.DB.getMC();
		self.mDataLength;
		self.mYYYYStart;
		self.mYYYYEnd;
	};

	var p = BaseCalc.prototype;

	p.isValid = function() {
		if (LPdate.getYear(self.MC.st_birthday_hon) === 0) {
			return false;
		}
		self.MC.age_hon = LPdate.calcAge(self.MC.st_birthday_hon);
		if (self.MC.is_kekkon()) {
			if (LPdate.getYear(self.MC.st_birthday_hai) === 0) {
				return false;
			}
			self.MC.age_hai = LPdate.calcAge(self.MC.st_birthday_hai);
		}

		return true;
	};
	p.getIndex = function(is_hai) {
		var res = 0;

		if (!self.MC.is_kekkon() && self.MC.age_hai > 0) {
			res = LPdate.getYear(self.MC.get_st_birthday(false)) - self.mYYYYStart;
			if (res * -1 > self.MC.age_hai) {
				res = self.MC.age_hai * -1;
			}
		} else {
			res = LPdate.getYear(self.MC.get_st_birthday(is_hai)) - self.mYYYYStart;
		}

		return res;
	};
	p.makeArrayBuffer = function() {
		var ret = new Array(self.mDataLength);

		for (var i = 0; i < self.mDataLength; i++) {
			ret[i] = 0;
		}

		return ret;
	};
	p.makebooleanBuffer = function() {
		var ret = {};

		return ret;
	};
	//計算結果バッファの作成
	//本人/配偶者の20歳時～100歳（保険計算の総額計算で100歳を使用）までを
	//含む長さに調整される

	p.setupData = function() {
		self.mDataLength = 0;
		if (!self.isValid()) {
			return;
		}
		if (self.MC.is_kekkon()) {
			self.mYYYYStart = LPdate.getYear(self.MC.st_birthday_hon) + 20;
			self.mYYYYEnd = LPdate.getYear(self.MC.st_birthday_hon) + 100;
			var s = LPdate.getYear(self.MC.st_birthday_hai) + 20;
			if (s < self.mYYYYStart) {
				self.mYYYYStart = s;
			}
			var e = LPdate.getYear(self.MC.st_birthday_hai) + 100;
			if (e > self.mYYYYEnd) {
				self.mYYYYEnd = e;
			}
		} else {
			self.mYYYYStart = LPdate.getYear(self.MC.st_birthday_hon) + 20;
			self.mYYYYEnd = LPdate.getYear(self.MC.st_birthday_hon) + 100;
		}
		self.mDataLength = self.mYYYYEnd - self.mYYYYStart + 1;
	};

	return BaseCalc;
})();