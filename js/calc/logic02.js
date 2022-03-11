/* global LIFEPLAN */

/**
 * （2）標準報酬額推計

 * 【計算】依存関係：（1）将来年収推計

 */
"use strict";

// public class Logic02 extends BaseCalc
LIFEPLAN.calc.Logic02 = (function() {

	var self;
	var G_syokugyo = new LIFEPLAN.db.LifePlanDB().G_syokugyo;
	var LPdate = new LIFEPLAN.db.LifePlanDB().LPdate;

	var Logic02 = function(db) {
		self = this;
		LIFEPLAN.calc.BaseCalc.call(self, db);
		//出力値
		self.vGesyu_hon = [];			//ご本人様:月収
		self.vAvgHousyu1_hon = [];		//ご本人様:平均標準報酬額1
		self.vAvgHousyu2_hon = [];		//ご本人様:平均標準報酬額2
		self.vKoseiHousyu_hon = [];		//ご本人様:将来厚年報酬額
		self.vKenpoHousyu_hon = [];		//ご本人様:将来健保報酬額

		self.vGesyu_hai = [];			//配偶者様:月収
		self.vAvgHousyu1_hai = [];		//配偶者様:平均標準報酬額1
		self.vAvgHousyu2_hai = [];		//配偶者様:平均標準報酬額2
		self.vKoseiHousyu_hai = [];	//配偶者様:将来厚年報酬額
		self.vKenpoHousyu_hai = [];		//配偶者様:将来健保報酬額

		self.L1;
	};

	LIFEPLAN.module.inherits(Logic02, LIFEPLAN.calc.BaseCalc);

	var p = Logic02.prototype;

//	@Override
	p.setupData = function() {
		LIFEPLAN.calc.BaseCalc.prototype.setupData.call();
		if (self.mDataLength === 0) {
			return;
		}
		self.vGesyu_hon = self.makeArrayBuffer();
		self.vAvgHousyu1_hon = self.makeArrayBuffer();
		self.vAvgHousyu2_hon = self.makeArrayBuffer();
		self.vKoseiHousyu_hon = self.makeArrayBuffer();
		self.vKenpoHousyu_hon = self.makeArrayBuffer();

		self.vGesyu_hai = self.makeArrayBuffer();
		self.vAvgHousyu1_hai = self.makeArrayBuffer();
		self.vAvgHousyu2_hai = self.makeArrayBuffer();
		self.vKoseiHousyu_hai = self.makeArrayBuffer();
		self.vKenpoHousyu_hai = self.makeArrayBuffer();
	};

	p.logic02_Go = function() {
		//' 【計算】計算式（2）標準報酬額推計
		self.Calc02_Hyouhou(false);
		if (self.MC.is_kekkon()) {
			self.Calc02_Hyouhou(true);
		}
	};
	p.Calc02_Hyouhou = function(is_hai) {
		var iKinzoku, i;
		var dSumHousyu;
		var dAvgHousyu;
		var dAvgHousyu1 = 0;
		var dAvgHousyu2 = 0;

		var vNensyu;
		var vGesyu;
		var vAvgHousyu1;
		var vAvgHousyu2;
		var vKoseiHousyu;
		var vKenpoHousyu;

		if (is_hai) {
			vGesyu = self.vGesyu_hai;
			vAvgHousyu1 = self.vAvgHousyu1_hai;
			vAvgHousyu2 = self.vAvgHousyu2_hai;
			vKoseiHousyu = self.vKoseiHousyu_hai;
			vKenpoHousyu = self.vKenpoHousyu_hai;
			vNensyu = self.L1.vNensyu_hai;
		} else {
			vGesyu = self.vGesyu_hon;
			vAvgHousyu1 = self.vAvgHousyu1_hon;
			vAvgHousyu2 = self.vAvgHousyu2_hon;
			vKoseiHousyu = self.vKoseiHousyu_hon;
			vKenpoHousyu = self.vKenpoHousyu_hon;
			vNensyu = self.L1.vNensyu_hon;
		}

		var _TaisyokuNensyu = self.MC.get_sm_tai_nensyu(is_hai);
		var _Kinmu = self.MC.get_id_kinmu(is_hai);
		var _KakoTaiAge = self.MC.get_age_kakotaisyoku(is_hai);
		var _KakoSyuAge = self.MC.get_age_kakosyugyo(is_hai);
		var _Age = LPdate.calcAge(self.MC.get_st_birthday(is_hai));
		var _syugyoage = LPdate.calcAge(self.MC.get_st_birthday(is_hai), self.MC.get_ym_syugyo(is_hai));
		var _taisyokuage = self.MC.get_age_taisyoku(is_hai);
		var _saisyu_ed_age = self.MC.get_age_saisyusyoku_end(is_hai);
		var _syokugyo = self.MC.get_id_syokugyo(is_hai);
		var ed;

		if (_Kinmu > 0) {
			if (_KakoTaiAge === 0 || _KakoSyuAge === 0) {
				return;
			}
		}

		var index = self.getIndex(is_hai);

		if (_syokugyo === G_syokugyo.KAISYAIN ||
				_syokugyo === G_syokugyo.YAKUIN ||
				_syokugyo === G_syokugyo.KOMUIN ||
				_syokugyo === G_syokugyo.TAI_KAISYAIN ||
				_syokugyo === G_syokugyo.TAI_KOMUIN) {
			iKinzoku = 0;
			dSumHousyu = 0;
			dAvgHousyu = 0;
			dAvgHousyu1 = 0;
			dAvgHousyu2 = 0;
			ed = Math.max(_taisyokuage - 1, _saisyu_ed_age);
			for (i = _syugyoage; i <= ed; i++) {
				if (i < 20) {
					continue;
				}
				vKoseiHousyu[i + index] = 0;
				vKenpoHousyu[i + index] = 0;
				if (vNensyu[i + index] > 0) {
					if (vNensyu[i + index] / 12 >= self.DB.get_cmninfo().sm_koseihyoho_upper) {
						if (i >= _Age) {
							vKoseiHousyu[i + index] = self.DB.get_cmninfo().sm_koseihyoho_upper;
							vKenpoHousyu[i + index] = Math.min(vNensyu[i + index] / 12, self.DB.get_cmninfo().sm_kenpohyoho_upper);
						}

						dSumHousyu = dSumHousyu + self.DB.get_cmninfo().sm_koseihyoho_upper;
					} else if (vNensyu[i + index] / 12 < self.DB.get_cmninfo().sm_koseihyoho_lower) {
						if (i >= _Age) {
							vKoseiHousyu[i + index] = self.DB.get_cmninfo().sm_koseihyoho_lower;
							vKenpoHousyu[i + index] = Math.max(vNensyu[i + index] / 12, self.DB.get_cmninfo().sm_kenpohyoho_lower);
						}

						dSumHousyu = dSumHousyu + self.DB.get_cmninfo().sm_koseihyoho_lower;
					} else {
						if (i >= _Age) {
							// 2021/03/01 年収を単純に12で割るように仕様変更
							//vKoseiHousyu[i + index] = Math.min(vNensyu[i + index] / 15.6, self.DB.get_cmninfo().sm_koseihyoho_upper) * 1.3;
							//vKenpoHousyu[i + index] = Math.max(vNensyu[i + index] / 12, self.DB.get_cmninfo().sm_kenpohyoho_lower);
							vKoseiHousyu[i + index] = vNensyu[i + index] / 12;
							vKenpoHousyu[i + index] = vNensyu[i + index] / 12;
						}
						// 2021/03/01 年収を単純に12で割るように仕様変更
						//dSumHousyu = (dSumHousyu + Math.min(vNensyu[i + index] / 15.6, self.DB.get_cmninfo().sm_koseihyoho_upper) * 1.3);
						dSumHousyu = dSumHousyu + vNensyu[i + index] / 12;
					}

					iKinzoku = iKinzoku + 1;
					dAvgHousyu = dSumHousyu / iKinzoku;
				}
				//' 【Lifeplan_問題管理票_社内.xls】No.070 対応

				if (i < 60) {
					dAvgHousyu1 = dAvgHousyu;
				} else if (i < 65) {
					dAvgHousyu2 = dAvgHousyu;
				}

				//' 【設定】出力のための計算結果
				vGesyu[i + index] = vNensyu[i + index] / 12;
			}

			//' 【修正】退職年齢が60歳で再就職しない場合、dAvgHousyu2が0になってしまう問題

			if (dAvgHousyu2 === 0) {
				dAvgHousyu2 = dAvgHousyu1;
			}
		} else {
			if (_Kinmu > 0) {
				iKinzoku = 0;
				dSumHousyu = 0;

				for (i = _KakoTaiAge - 1; i >= _KakoSyuAge; i--) {
					if (i < 20 || i > 99) {
						continue;
					}
					if (vNensyu[i + index] > 0) {
						if (vNensyu[i + index] / 12 < self.DB.get_cmninfo().sm_koseihyoho_lower) {
							dSumHousyu = dSumHousyu + self.DB.get_cmninfo().sm_koseihyoho_lower;
						} else {
							var t = _TaisyokuNensyu;
							// 2021/03/01 仕様変更
							//dSumHousyu = (dSumHousyu + Math.min(t / 15.6, self.DB.get_cmninfo().sm_koseihyoho_upper) * 1.3);
							dSumHousyu = (dSumHousyu + Math.min(t / 12, self.DB.get_cmninfo().sm_koseihyoho_upper));
						}

						_TaisyokuNensyu = _TaisyokuNensyu / (1.0 + self.DB.get_banksetupinfo().ra_baseup_kako);
						iKinzoku = iKinzoku + 1;
					}

					//' 【設定】出力のための計算結果
					vGesyu[i + index] = vNensyu[i + index] / 12;
				}

				if (iKinzoku !== 0) {
					dAvgHousyu1 = dSumHousyu / iKinzoku;
					dAvgHousyu2 = dAvgHousyu1;
				}
			}
		}
		self.DB.get_mc_calc(is_hai).AvgHousyu1 = dAvgHousyu1;
		self.DB.get_mc_calc(is_hai).AvgHousyu2 = dAvgHousyu2;

		if (_Kinmu > 0) {
			if (_KakoTaiAge > 20) {
				vAvgHousyu1[_KakoTaiAge - 1 + index] = dAvgHousyu1;
			}
		} else {
			vAvgHousyu1[59 + index] = dAvgHousyu1;
		}
		vAvgHousyu2[64 + index] = dAvgHousyu2;
	};

	p.dump = function(context, is_hai) {
		var result = [];
		var p = 0;

		if (!is_hai) {
			result[p++] = "2:ご本人様:月収\t";
			result[p++] = "2:ご本人様:平均標準報酬額1\t";
			result[p++] = "2:ご本人様:平均標準報酬額2\t";
			result[p++] = "2:ご本人様:将来厚年報酬額\t";
			result[p++] = "2:ご本人様:将来健保報酬額\t";
		} else {
			result[p++] = "2:配偶者様:月収\t";
			result[p++] = "2:配偶者様:平均標準報酬額1\t";
			result[p++] = "2:配偶者様:平均標準報酬額2\t";
			result[p++] = "2:配偶者様:将来厚年報酬額\t";
			result[p++] = "2:配偶者様:将来健保報酬額\t";
		}
		for (var i = 0; i < self.mDataLength; i++) {
			p = 0;
			if (!is_hai) {
				result[p++] += (self.vGesyu_hon[i]) + "\t";
				result[p++] += (self.vAvgHousyu1_hon[i]) + "\t";
				result[p++] += (self.vAvgHousyu2_hon[i]) + "\t";
				result[p++] += (self.vKoseiHousyu_hon[i]) + "\t";
				result[p++] += (self.vKenpoHousyu_hon[i]) + "\t";
			} else {
				result[p++] += (self.vGesyu_hai[i]) + "\t";
				result[p++] += (self.vAvgHousyu1_hai[i]) + "\t";
				result[p++] += (self.vAvgHousyu2_hai[i]) + "\t";
				result[p++] += (self.vKoseiHousyu_hai[i]) + "\t";
				result[p++] += (self.vKenpoHousyu_hai[i]) + "\t";
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

		data.vGesyu_hon = self.vGesyu_hon;
		data.vAvgHousyu1_hon = self.vAvgHousyu1_hon;
		data.vAvgHousyu2_hon = self.vAvgHousyu2_hon;
		data.vKoseiHousyu_hon = self.vKoseiHousyu_hon;
		data.vKenpoHousyu_hon = self.vKenpoHousyu_hon;

		data.vGesyu_hai = self.vGesyu_hai;
		data.vAvgHousyu1_hai = self.vAvgHousyu1_hai;
		data.vAvgHousyu2_hai = self.vAvgHousyu2_hai;
		data.vKoseiHousyu_hai = self.vKoseiHousyu_hai;
		data.vKenpoHousyu_hai = self.vKenpoHousyu_hai;

		LIFEPLAN.conf.storage.setItem("Logic02", JSON.stringify(data));
	};

	return Logic02;
})();