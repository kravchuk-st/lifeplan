/* global LIFEPLAN */

/**
 * (1) 将来年収推計

 */
"use strict";


var GSKArr = []; //追加 20200826 参考値ロジック応急対応 


// public class Logic01 extends BaseCalc
LIFEPLAN.calc.Logic01 = (function() {

	var self;
	var G_syokugyo = new LIFEPLAN.db.LifePlanDB().G_syokugyo;
	var Lp_incomestatistics = new LIFEPLAN.db.LifePlanDB().Lp_incomestatistics;
	var LPdate = new LIFEPLAN.db.LifePlanDB().LPdate;

	var Logic01 = function(db) {
		self = this;
		LIFEPLAN.calc.BaseCalc.call(self, db);
		//出力値
		self.vAvgIncome_hon = [];		//ご本人様:年収統計値
		self.vHoseikai_hon = [];	//ご本人様:補正乖離率
		self.vBase_hon = [];		//ご本人様:Base
		self.vNensyu_hon = [];		//ご本人様:将来年収額

		self.vAvgIncome_hai = [];		//配偶者様:年収統計値
		self.vHoseikai_hai = [];	//配偶者様:補正乖離率
		self.vBase_hai = [];		//配偶者様:Base
		self.vNensyu_hai = [];		//配偶者様:将来年収額
	};

	LIFEPLAN.module.inherits(Logic01, LIFEPLAN.calc.BaseCalc);

	var p = Logic01.prototype;

//	@Override
	p.setupData = function() {
		LIFEPLAN.calc.BaseCalc.prototype.setupData.call();
		if (self.mDataLength === 0) {
			return;
		}
		self.vAvgIncome_hon = self.makeArrayBuffer();
		self.vHoseikai_hon = self.makeArrayBuffer();
		self.vBase_hon = self.makeArrayBuffer();
		self.vNensyu_hon = self.makeArrayBuffer();

		self.vAvgIncome_hai = self.makeArrayBuffer();
		self.vHoseikai_hai = self.makeArrayBuffer();
		self.vBase_hai = self.makeArrayBuffer();
		self.vNensyu_hai = self.makeArrayBuffer();
	};

	// '-------------------------------------------------------------------------------
	// ' （1）将来年収推計ロジック
	// '-------------------------------------------------------------------------------
	p.logic01_Go = function() {
		if (!(self.MC.id_syokugyo_hon === G_syokugyo.MUSYOKU && self.MC.id_kinmu_hon === 0)) {
			self.SetAvgIncome(false, GSKArr); //変更 20200826 参考値ロジック応急対応 
			self.Calc01_Nensyu(false);
		}
		if (self.MC.is_kekkon()) {
			if (!(self.MC.id_syokugyo_hai === G_syokugyo.MUSYOKU && self.MC.id_kinmu_hai === 0)) {
				self.SetAvgIncome(true, GSKArr); //変更 20200826 参考値ロジック応急対応 
				self.Calc01_Nensyu(true);
			}
		}
	};

	// ' IF定義書から年収統計値を取得して設定する
	p.SetAvgIncome = function(is_hai, arr) { //変更 20200826 参考値ロジック応急対応 
		var row = [];
		if (!is_hai) {
			row = self.vAvgIncome_hon;
		} else {
			row = self.vAvgIncome_hai;
		}
		var _Gyosyu = self.MC.get_id_gyosyu(is_hai);
		var _Syokusyu = self.MC.get_id_syokusyu(is_hai);
		var _Kibo = self.MC.get_id_kibo(is_hai);


		/* 追加 20200826 参考値ロジック応急対応 ここから */
		if (arr.length > 0 && arr[0] >= 0) {
			_Gyosyu = arr[0];
		}
		if (arr.length > 1 && arr[1] >= 0) {
			_Syokusyu = arr[1];
		}
		if (arr.length > 2 && arr[2] >= 0) {
			_Kibo = arr[2];
		}
		/* 追加 20200826 参考値ロジック応急対応 ここまで */


		if (_Kibo === 0) {
			_Kibo = 1;
		}

		if (self.MC.get_id_syokugyo(is_hai) === G_syokugyo.KOMUIN ||
				self.MC.get_id_syokugyo(is_hai) === G_syokugyo.TAI_KOMUIN) {
			_Gyosyu = 0;
			_Syokusyu = 0;
			_Kibo = 2;
		} else if (self.MC.get_id_syokugyo(is_hai) === G_syokugyo.JIEIGYO) {
			_Gyosyu = 0;
			_Syokusyu = 0;
			_Kibo = 1;
		}

		var index = self.getIndex(is_hai);

		for (var i = 20; i <= 64; i++) {
			var _LpIncome = self.DB.get_incomestatistics(_Gyosyu, _Syokusyu, i);
			if (_LpIncome !== null) {
				if (_Kibo === 1) {
					row[i + index] = _LpIncome.sm_income1;
				} else if (_Kibo === 2) {
					row[i + index] = _LpIncome.sm_income2;
				} else if (_Kibo === 3) {
					row[i + index] = _LpIncome.sm_income3;
				}
			}
		}
	};

	// ' 計算式（1）将来年収額推計
	p.Calc01_Nensyu = function(is_hai) {
		var index = self.getIndex(is_hai);

		var vAvgIncome;
		var dKairi;
		var dHoseikai = 0;
		var dBase;
		var vHoseikai;
		var vBase;
		var vNensyu;

		if (!is_hai) {
			vAvgIncome = self.vAvgIncome_hon;
			vBase = self.vBase_hon;
			vHoseikai = self.vHoseikai_hon;
			vNensyu = self.vNensyu_hon;

		} else {
			vAvgIncome = self.vAvgIncome_hai;
			vBase = self.vBase_hai;
			vHoseikai = self.vHoseikai_hai;
			vNensyu = self.vNensyu_hai;
		}

		var _Syokugyo = self.MC.get_id_syokugyo(is_hai);
		var _Age = LPdate.calcAge(self.MC.get_st_birthday(is_hai));
		var _Nensyu = self.MC.get_sm_nensyu(is_hai);
		var _TaisyokuAge = self.MC.get_age_taisyoku(is_hai);
		var _SaisyusyokuStAge = self.MC.get_age_saisyusyoku_st(is_hai);
		var _SaisyusyokuEdAge = self.MC.get_age_saisyusyoku_end(is_hai);
		var _SaisyuIncome = self.MC.get_sm_saisyu_income(is_hai);
		var _SyugyoAge = LPdate.calcAge(self.MC.get_st_birthday(is_hai), self.MC.get_ym_syugyo(is_hai));
		var _TaisyokuNensyu = self.MC.get_sm_tai_nensyu(is_hai);
		var _KakoTaiAge = self.MC.get_age_kakotaisyoku(is_hai);
		var _NensyuRate = self.MC.get_ra_nensyu(is_hai);
		var _Kinmu = self.MC.get_id_kinmu(is_hai);
		var _KakoSyuAge = self.MC.get_age_kakosyugyo(is_hai);

		var _BaseupKako;
		_BaseupKako = self.DB.get_banksetupinfo().ra_baseup_kako;

		if (_Syokugyo === G_syokugyo.KAISYAIN
				|| _Syokugyo === G_syokugyo.YAKUIN
				|| _Syokugyo === G_syokugyo.KOMUIN) {

			if (_Age < 65 && vAvgIncome[_Age + index] !== 0) {
				dKairi = (_Nensyu - vAvgIncome[_Age + index]) / vAvgIncome[_Age + index];
			} else {
				dKairi = 0;
			}

			dBase = 1;
			dHoseikai = dKairi;

			for (var i = (_Age - 1); i >= _SyugyoAge && i >= 20; i--) {
				if (dHoseikai >= 0) {
					dHoseikai = Math.max(dHoseikai - 0.01, 0);
				} else {
					dHoseikai = Math.min(dHoseikai + 0.01, 0);
				}
				dBase = dBase * (_BaseupKako + 1);
				vNensyu[i + index] = vAvgIncome[i + index] * (dHoseikai + 1.0) / dBase;
				// ' 【設定】出力のための計算結果
				vHoseikai[i + index] = dHoseikai;
				vBase[i + index] = dBase;
			}

			dBase = 1;

			var _BaseupFu = self.DB.get_banksetupinfo().ra_baseup_fu;
			for (var i = _Age; i <= (_TaisyokuAge - 1); i++) {
				if (i === _Age) {
					dHoseikai = dKairi;
				} else {
					if (i < 50) {
						if (dHoseikai >= 0) {
							dHoseikai = Math.max(dHoseikai - Math.min(0.01, dHoseikai / (50 - i)), 0);
						} else {
							dHoseikai = Math.min(dHoseikai - Math.max(-0.01, dHoseikai / (50 - i)), 0);
						}
					}
				}

				vNensyu[i + index] = vAvgIncome[i + index] * (dHoseikai + 1) * dBase;
				dBase = (dBase * (_BaseupFu + 1));
				// ' 【設定】出力のための計算結果
				vHoseikai[i + index] = dHoseikai;
				vBase[i + index] = dBase;
			}

			if (_SaisyusyokuStAge > 0) {
				for (var i = _SaisyusyokuStAge; i < _SaisyusyokuEdAge; i++) {
					vNensyu[i + index] = _SaisyuIncome * dBase;
					dBase = dBase * (_BaseupFu + 1);
					vBase[i + index] = dBase;
				}
			}
		} else if (_Syokugyo === G_syokugyo.TAI_KAISYAIN
				|| _Syokugyo === G_syokugyo.TAI_KOMUIN) {
			if (_Age < 65 && vAvgIncome[_TaisyokuAge + index] !== 0) {
				// 2021/03/23 退職会社員・退職公務員の退職時の乖離率の退職直前の年齢を修正 _TaisyokuAge → _TaisyokuAge -1
				//dKairi = (_TaisyokuNensyu - vAvgIncome[_TaisyokuAge + index]) / vAvgIncome[_TaisyokuAge + index];
				dKairi = (_TaisyokuNensyu - vAvgIncome[_TaisyokuAge -1 + index]) / vAvgIncome[_TaisyokuAge -1 + index];
			} else {
				dKairi = 0;
			}

			dBase = 1;

			for (var i = (_TaisyokuAge - 1); i >= _SyugyoAge && i >= 20; i--) {
				if (i === _TaisyokuAge - 1) {
					dHoseikai = dKairi;
				} else {
					if (dHoseikai >= 0) {
						dHoseikai = Math.max(dHoseikai - 0.01, 0);
					} else {
						dHoseikai = Math.min(dHoseikai + 0.01, 0);
					}
				}

				vNensyu[i + index] = vAvgIncome[i + index] * (dHoseikai + 1) / dBase;
				dBase = (dBase * (_BaseupKako + 1));
				vBase[i + index] = dBase;
				vHoseikai[i + index] = dHoseikai;
			}

			if (_SaisyusyokuStAge > 0) {
				for (var i = _SaisyusyokuStAge; i < _SaisyusyokuEdAge; i++) {
					vNensyu[i + index] = _SaisyuIncome;
				}
			}
		} else {
			if (_KakoTaiAge > 20 && _Age < 65 && vAvgIncome[_KakoTaiAge + index] !== 0) {
				dKairi = (_TaisyokuNensyu - vAvgIncome[_KakoTaiAge + index]) / vAvgIncome[_KakoTaiAge + index];
			} else {
				dKairi = 0;
			}

			if (_Syokugyo === G_syokugyo.JIEIGYO) {
				dBase = 1;
				for (var i = _Age; i <= (_TaisyokuAge - 1); i++) {
					vNensyu[i + index] = _Nensyu * dBase;
					dBase = (dBase * ((_NensyuRate / 100)+ 1));
					vBase[i + index] = dBase;
				}
			}

			if (_Kinmu > 0) {
				dBase = 1;
				for (var i = (_KakoTaiAge - 1); i >= _KakoSyuAge; i--) {
					if (i < 20 || i > 99) {
						continue;
					}
					if (i === (_KakoTaiAge - 1)) {
						dHoseikai = dKairi;
					} else {
						if (dHoseikai >= 0) {
							dHoseikai = Math.max(dHoseikai - 0.01, 0);
						} else {
							dHoseikai = Math.min(dHoseikai + 0.01, 0);
						}
					}

					vNensyu[i + index] = vAvgIncome[i + index] * (dHoseikai + 1) / dBase;
					dBase = dBase * (_BaseupKako + 1);
					// ' 【設定】出力のための計算結果
					vHoseikai[i + index] = dHoseikai;
					vBase[i + index] = dBase;
				}
			}
		}
	};

	p.dump = function(context, is_hai) {
		var result = [];
		var p = 0;
		if (!is_hai) {
			result[p++] = "1:ご本人様:年収統計値\t";
			result[p++] = "1:ご本人様:補正乖離率\t";
			result[p++] = "1:ご本人様:Base\t";
			result[p++] = "1:ご本人様:将来年収額\t";
		} else {
			result[p++] = "1:配偶者様:年収統計値\t";
			result[p++] = "1:配偶者様:補正乖離率\t";
			result[p++] = "1:配偶者様:Base\t";
			result[p++] = "1:配偶者様:将来年収額\t";
		}
		for (var i = 0; i < self.mDataLength; i++) {
			p = 0;
			if (!is_hai) {
				result[p++] += (self.vAvgIncome_hon[i]) + "\t";
				result[p++] += (self.vHoseikai_hon[i]) + "\t";
				result[p++] += (self.vBase_hon[i]) + "\t";
				result[p++] += (self.vNensyu_hon[i]) + "\t";
			} else {
				result[p++] += (self.vAvgIncome_hai[i]) + "\t";
				result[p++] += (self.vHoseikai_hai[i]) + "\t";
				result[p++] += (self.vBase_hai[i]) + "\t";
				result[p++] += (self.vNensyu_hai[i]) + "\t";
			}
		}
		var mLog = "";
		for (var i = 0; i < result.length; i++) {
			mLog += result[i] + "\n";
		}
		return mLog;
	};

	p.setStorage = function() {
		var data = {};

		data.vAvgIncome_hon = self.vAvgIncome_hon;
		data.vHoseikai_hon = self.vHoseikai_hon;
		data.vBase_hon = self.vBase_hon;
		data.vNensyu_hon = self.vNensyu_hon;

		data.vAvgIncome_hai = self.vAvgIncome_hai;
		data.vHoseikai_hai = self.vHoseikai_hai;
		data.vBase_hai = self.vBase_hai;
		data.vNensyu_hai = self.vNensyu_hai;

		LIFEPLAN.conf.storage.setItem("Logic01", JSON.stringify(data));
	};

	return Logic01;
})();