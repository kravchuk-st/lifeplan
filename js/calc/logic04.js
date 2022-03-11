/* global LIFEPLAN */

/**
 * （4）税金・社会保険料推計

 * 【計算】依存関係：（3）老齢年金受給額推計
 */
"use strict";

// public class Logic04 extends BaseCalc
LIFEPLAN.calc.Logic04 = (function() {

	var self;
	var G_syokugyo = new LIFEPLAN.db.LifePlanDB().G_syokugyo;
	var LPdate = new LIFEPLAN.db.LifePlanDB().LPdate;
	var Util = new LIFEPLAN.util.Util();

	var Logic04 = function(db) {
		self = this;
		LIFEPLAN.calc.BaseCalc.call(self, db);
		//出力値
		//本人
		self.vSyotokuKoujyo_hon = [];	//所得税控除額
		self.vJyuminKoujyo_hon = [];		//住民税控除額
		self.vKyuyoukoujyo_hon = [];		//給与所得控除額
		self.vNenkinkoujyo_hon = [];		//公的年金等控除額
		self.vNenkinkoujyo2_hon = [];	//公的年金等控除額2
		self.vSyoSeihokoujyo_hon = [];	//所得税生命保険料控除
		self.vSyoNenhokoujyo_hon = [];	//所得税個人年金保険料控除
		// 2021/02/26 生命保険料控除制度改正対応（生命保険料控除制度の対象が、従前の一般生命保険料控除、個人年金保険料控除に、介護医療保険料控除が加えられた対応）
		self.vSyoIryhokoujyo_hon = [];	//所得税介護医療保険料控除
		self.vKazeiSyotoku_hon = [];	//所得課税所得
		self.vLoanGenzei_hon = [];	//住宅ローン所得税減税額
		self.vSyotokuzei_hon = [];		//所得税
		self.vJyuSeihokoujyo_hon = [];		//住民税生命保険料控除
		self.vJyuNenhokoujyo_hon = [];	//住民税個人年金保険料控除
		// 2021/02/26 生命保険料控除制度改正対応（生命保険料控除制度の対象が、従前の一般生命保険料控除、個人年金保険料控除に、介護医療保険料控除が加えられた対応）
		self.vJyuIryhokoujyo_hon = [];	//住民税介護医療保険料控除
		self.vJyuKazeiSyotoku_hon = [];	//住民課税所得
		self.vJyuminzei_hon = [];		//住民税
		self.vNenkinhoken_hon = [];			//年金保険料
		self.vKenkohoken_hon = [];		//健康保険料
		self.vKoyouhoken_hon = [];		//雇用保険料
		self.vKaigohoken_hon = [];		//介護保険料
		self.vShakaihoken_hon = [];	//社会保険料

		//配偶者
		self.vSyotokuKoujyo_hai = [];	//所得税控除額
		self.vJyuminKoujyo_hai = [];		//住民税控除額
		self.vKyuyoukoujyo_hai = [];		//給与所得控除額
		self.vNenkinkoujyo_hai = [];		//公的年金等控除額
		self.vNenkinkoujyo2_hai = [];	//公的年金等控除額2
		self.vSyoSeihokoujyo_hai = [];	//所得税生命保険料控除
		self.vSyoNenhokoujyo_hai = [];	//所得税個人年金保険料控除
		// 2021/02/26 生命保険料控除制度改正対応（生命保険料控除制度の対象が、従前の一般生命保険料控除、個人年金保険料控除に、介護医療保険料控除が加えられた対応）
		self.vSyoIryhokoujyo_hai = [];	//所得税介護医療保険料控除
		self.vKazeiSyotoku_hai = [];	//課税所得
		self.vSyotokuzei_hai = [];		//所得税
		self.vJyuSeihokoujyo_hai = [];		//住民税生命保険料控除
		self.vJyuNenhokoujyo_hai = [];	//住民税個人年金保険料控除
		// 2021/02/26 生命保険料控除制度改正対応（生命保険料控除制度の対象が、従前の一般生命保険料控除、個人年金保険料控除に、介護医療保険料控除が加えられた対応）
		self.vJyuIryhokoujyo_hai = [];	//住民税介護医療保険料控除
		self.vJyuKazeiSyotoku_hai = [];	//住民課税所得
		self.vJyuminzei_hai = [];		//住民税
		self.vNenkinhoken_hai = [];			//年金保険料
		self.vKenkohoken_hai = [];		//健康保険料
		self.vKoyouhoken_hai = [];		//雇用保険料
		self.vKaigohoken_hai = [];		//介護保険料
		self.vShakaihoken_hai = [];	//社会保険料

		self.L1;
		self.L2;
		self.L3;
		self.L4;
		self.L5;
		self.L9;
	};

	LIFEPLAN.module.inherits(Logic04, LIFEPLAN.calc.BaseCalc);

	var p = Logic04.prototype;

//	@Override
	p.setupData = function() {
		LIFEPLAN.calc.BaseCalc.prototype.setupData.call();
		if (self.mDataLength === 0) {
			return;
		}
		self.vSyotokuKoujyo_hon = self.makeArrayBuffer();
		self.vJyuminKoujyo_hon = self.makeArrayBuffer();
		self.vKyuyoukoujyo_hon = self.makeArrayBuffer();
		self.vNenkinkoujyo_hon = self.makeArrayBuffer();
		self.vNenkinkoujyo2_hon = self.makeArrayBuffer();
		self.vSyoSeihokoujyo_hon = self.makeArrayBuffer();
		self.vSyoNenhokoujyo_hon = self.makeArrayBuffer();
		self.vSyoIryhokoujyo_hon = self.makeArrayBuffer();
		self.vKazeiSyotoku_hon = self.makeArrayBuffer();
		self.vLoanGenzei_hon = self.makeArrayBuffer();
		self.vSyotokuzei_hon = self.makeArrayBuffer();
		self.vJyuSeihokoujyo_hon = self.makeArrayBuffer();
		self.vJyuNenhokoujyo_hon = self.makeArrayBuffer();
		self.vJyuIryhokoujyo_hon = self.makeArrayBuffer();
		self.vJyuKazeiSyotoku_hon = self.makeArrayBuffer();
		self.vJyuminzei_hon = self.makeArrayBuffer();
		self.vNenkinhoken_hon = self.makeArrayBuffer();
		self.vKenkohoken_hon = self.makeArrayBuffer();
		self.vKoyouhoken_hon = self.makeArrayBuffer();
		self.vKaigohoken_hon = self.makeArrayBuffer();
		self.vShakaihoken_hon = self.makeArrayBuffer();
		//配偶者

		self.vSyotokuKoujyo_hai = self.makeArrayBuffer();
		self.vJyuminKoujyo_hai = self.makeArrayBuffer();
		self.vKyuyoukoujyo_hai = self.makeArrayBuffer();
		self.vNenkinkoujyo_hai = self.makeArrayBuffer();
		self.vNenkinkoujyo2_hai = self.makeArrayBuffer();
		self.vSyoSeihokoujyo_hai = self.makeArrayBuffer();
		self.vSyoNenhokoujyo_hai = self.makeArrayBuffer();
		self.vSyoIryhokoujyo_hai = self.makeArrayBuffer();
		self.vKazeiSyotoku_hai = self.makeArrayBuffer();
		self.vSyotokuzei_hai = self.makeArrayBuffer();
		self.vJyuSeihokoujyo_hai = self.makeArrayBuffer();
		self.vJyuNenhokoujyo_hai = self.makeArrayBuffer();
		self.vJyuIryhokoujyo_hai = self.makeArrayBuffer();
		self.vJyuKazeiSyotoku_hai = self.makeArrayBuffer();
		self.vJyuminzei_hai = self.makeArrayBuffer();
		self.vNenkinhoken_hai = self.makeArrayBuffer();
		self.vKenkohoken_hai = self.makeArrayBuffer();
		self.vKoyouhoken_hai = self.makeArrayBuffer();
		self.vKaigohoken_hai = self.makeArrayBuffer();
		self.vShakaihoken_hai = self.makeArrayBuffer();
	};

	p.logic04_Go = function() {
		self.Calc18_Nenkinhoken(false);
		self.Calc19_Shakaihoken(false);
		self.Calc16_Syotokuzei(false);
		self.Calc17_Jyuminzei(false);

		if (self.MC.is_kekkon()) {
			self.Calc18_Nenkinhoken(true);
			self.Calc19_Shakaihoken(true);
			self.Calc16_Syotokuzei(true);
			self.Calc17_Jyuminzei(true);
		}
	};

	// （１１）所得税控除額(年齢)
	p.Calc11_Syotokukoujyo = function(is_hai, age, dGoukeiSyotoku) {
		var iAgeGap;
		var iAgeGapChd;
		var lSyotokukoujyo;
		var vNenkin_hai = [];
		var index = self.getIndex(is_hai);

		lSyotokukoujyo = self.DB.get_cmninfo().sm_kisokojo_syotoku;

		if (self.MC.is_kekkon()) {
			if (is_hai) {
				iAgeGap = LPdate.calcAge(self.MC.st_birthday_hai, self.MC.st_birthday_hon);
				vNenkin_hai = self.L3.vNenkin_hon;
			} else {
				iAgeGap = LPdate.calcAge(self.MC.st_birthday_hon, self.MC.st_birthday_hai);
				vNenkin_hai = self.L3.vNenkin_hai;
			}
			var syokugyo = self.MC.get_id_syokugyo(!is_hai);
			// 2021/03/05 配偶者退職後の年金受給額の上限を条件に追加。
//			if (syokugyo === G_syokugyo.MUSYOKU ||
//					syokugyo === G_syokugyo.TAI_KAISYAIN || syokugyo === G_syokugyo.TAI_KOMUIN ||
//					((syokugyo === G_syokugyo.KAISYAIN ||
//							syokugyo === G_syokugyo.YAKUIN ||
//							syokugyo === G_syokugyo.JIEIGYO ||
//							syokugyo === G_syokugyo.KOMUIN) &&
//							age - iAgeGap >= self.MC.get_age_taisyoku(!is_hai))) {
			if (syokugyo === G_syokugyo.MUSYOKU ||
					syokugyo === G_syokugyo.TAI_KAISYAIN ||
					syokugyo === G_syokugyo.TAI_KOMUIN ||
					((syokugyo === G_syokugyo.KAISYAIN ||
						syokugyo === G_syokugyo.YAKUIN ||
						syokugyo === G_syokugyo.JIEIGYO ||
						syokugyo === G_syokugyo.KOMUIN) &&
						(age - iAgeGap >= self.MC.get_age_taisyoku(!is_hai) &&
						 vNenkin_hai[age + index] <= 1580000)
					)
				 ) {
				// 2021/03/05 配偶者控除超過累進税率化
				if (dGoukeiSyotoku <= 9000000) {
					if (age - iAgeGap >= 70) {
						lSyotokukoujyo = lSyotokukoujyo + self.DB.get_cmninfo().sm_koreihaikojo_syotoku;
					} else {
						lSyotokukoujyo = lSyotokukoujyo + self.DB.get_cmninfo().sm_haikojo_syotoku;
					}
				} else if (dGoukeiSyotoku <= 9500000) {
					if (age - iAgeGap >= 70) {
						lSyotokukoujyo = lSyotokukoujyo + 320000;
					} else {
						lSyotokukoujyo = lSyotokukoujyo + 260000;
					}
				} else if (dGoukeiSyotoku <= 10000000) {
					if (age - iAgeGap >= 70) {
						lSyotokukoujyo = lSyotokukoujyo + 160000;
					} else {
						lSyotokukoujyo = lSyotokukoujyo + 130000;
					}
				}
			}
		}
		for (var i = 1; i <= self.MC.get_child_count(); i++) {
			var kyouiku = self.MC.get_kyouiku(i);
			if (kyouiku === null) {
				break;
			}
			iAgeGapChd = LPdate.calcAge(self.MC.get_st_birthday(false), kyouiku.ymd_child);

			// 2021/03/31 既に生まれている子どもの扶養控除。age - iAgeGapChd < 16 → age - iAgeGapChd >= 0 && age - iAgeGapChd < 16
			//if (age - iAgeGapChd < 16) {
			if (age - iAgeGapChd >= 0 && age - iAgeGapChd < 16) {
				lSyotokukoujyo = lSyotokukoujyo + 0;
			} else if (age - iAgeGapChd < 19) {
				lSyotokukoujyo = lSyotokukoujyo + self.DB.get_cmninfo().sm_huyokojo_syotoku_un16;
			} else if (age - iAgeGapChd < 23) {
				lSyotokukoujyo = lSyotokukoujyo + self.DB.get_cmninfo().sm_huyokojo_syotoku_un23;
			}
		}
		return lSyotokukoujyo;
	};

	// （１２）住民税控除額（年齢）

	p.Calc12_Jyuminkoujyo = function(is_hai, age, dGoukeiSyotoku) {
		var iAgeGap;
		var iAgeGapChd;
		var lJyuminkoujyo;
		var vNenkin_hai = [];
		var index = self.getIndex(is_hai);
		var tyPinHai = self.DB.get_mc_calc(!is_hai);

		lJyuminkoujyo = self.DB.get_cmninfo().sm_kisokojo_jyu;
		if (self.MC.is_kekkon()) {
			if (is_hai) {
				iAgeGap = LPdate.calcAge(self.MC.st_birthday_hai, self.MC.st_birthday_hon);
				vNenkin_hai = self.L3.vNenkin_hon;
			} else {
				iAgeGap = LPdate.calcAge(self.MC.st_birthday_hon, self.MC.st_birthday_hai);
				vNenkin_hai = self.L3.vNenkin_hai;
			}

			var syokugyo = self.MC.get_id_syokugyo(!is_hai);
			// 2021/03/05 配偶者の加入月数判定削除。配偶者退職後の年金受給額の上限を条件に追加。
//			if (syokugyo === G_syokugyo.MUSYOKU ||
//					((syokugyo === G_syokugyo.KAISYAIN ||
//							syokugyo === G_syokugyo.YAKUIN ||
//							syokugyo === G_syokugyo.KOMUIN) &&
//							age - iAgeGap >= self.MC.get_age_taisyoku(!is_hai)) ||
//					((syokugyo === G_syokugyo.TAI_KAISYAIN ||
//							syokugyo === G_syokugyo.TAI_KOMUIN)) &&
//					tyPinHai.KanyuTsukisu2 <= 240) {
			if (syokugyo === G_syokugyo.MUSYOKU ||
					syokugyo === G_syokugyo.TAI_KAISYAIN ||
					syokugyo === G_syokugyo.TAI_KOMUIN ||
					((syokugyo === G_syokugyo.KAISYAIN ||
						syokugyo === G_syokugyo.YAKUIN ||
						syokugyo === G_syokugyo.JIEIGYO ||
						syokugyo === G_syokugyo.KOMUIN) &&
						(age - iAgeGap >= self.MC.get_age_taisyoku(!is_hai) &&
						 vNenkin_hai[age + index] <= 1580000)
					)
				 ) {
				// 2021/03/05 配偶者控除超過累進税率化
				if (dGoukeiSyotoku <= 9000000) {
					if (age - iAgeGap >= 70) {
						lJyuminkoujyo = lJyuminkoujyo + self.DB.get_cmninfo().sm_koreihaikojo_jyu;
					} else {
						lJyuminkoujyo = lJyuminkoujyo + self.DB.get_cmninfo().sm_haikojo_jyu;
					}
				} else if (dGoukeiSyotoku <= 9500000) {
					if (age - iAgeGap >= 70) {
						lJyuminkoujyo = lJyuminkoujyo + 260000;
					} else {
						lJyuminkoujyo = lJyuminkoujyo + 220000;
					}
				} else if (dGoukeiSyotoku <= 10000000) {
					if (age - iAgeGap >= 70) {
						lJyuminkoujyo = lJyuminkoujyo + 130000;
					} else {
						lJyuminkoujyo = lJyuminkoujyo + 110000;
					}
				}
			}
		}
		for (var i = 1; i <= self.MC.get_child_count(); i++) {
			var kyouiku = self.MC.get_kyouiku(i);
			if (kyouiku === null) {
				break;
			}
			iAgeGapChd = LPdate.calcAge(self.MC.get_st_birthday(false), kyouiku.ymd_child);

			// 2021/03/31 既に生まれている子どもの扶養控除。age - iAgeGapChd < 16 → age - iAgeGapChd >= 0 && age - iAgeGapChd < 16
			//if (age - iAgeGapChd < 16) {
			if (age - iAgeGapChd >= 0 && age - iAgeGapChd < 16) {
				lJyuminkoujyo = lJyuminkoujyo + 0;
			} else if (age - iAgeGapChd < 19) {
				lJyuminkoujyo = lJyuminkoujyo + self.DB.get_cmninfo().sm_huyokojo_jyu_un16;
			} else if (age - iAgeGapChd < 23) {
				lJyuminkoujyo = lJyuminkoujyo + self.DB.get_cmninfo().sm_huyokojo_jyu_un23;
			}
		}
		return lJyuminkoujyo;
	};

	// （１３）給与所得控除額（年収額）
	p.Calc13_Kyuyoukoujyo = function(nensyu) {
		var kojo = 0;

		// 2021/03/05 乗率、加算額を最新化。2013年分～2015年分→2020年分以降
		if (nensyu > 8500000 ) {
			kojo = 1950000;
		} else if (nensyu > 6600000) {
			kojo = (nensyu * 0.1 + 1100000);
		} else if (nensyu > 3600000) {
			kojo = (nensyu * 0.2 + 440000);
		} else if (nensyu > 1800000) {
			kojo = (nensyu * 0.3 + 80000);
		} else if (nensyu > 1625000) {
			kojo = (nensyu * 0.4 - 100000);
		} else {
			kojo = 550000;
		}

		var result = Math.ceil(kojo);
		return result;
	};

	// （１４）公的年金等控除額（年金額）
	p.Calc14_Nenkinkoujyo = function(nenkin) {
		var kojo = 0.0;

		// 2021/03/05 乗率、加算額を最新化。2005年分～2019年分→2020年分以降
		if (nenkin >= 10000000) {
			kojo = 1955000;
		} else if (nenkin >= 7700000) {
			kojo = nenkin * 0.05 + 1455000;
		} else if (nenkin >= 4100000) {
			kojo = nenkin * 0.15 + 685000;
		} else if (nenkin >= 1300000) {
			kojo = nenkin * 0.25 + 275000;
		} else if (nenkin > 600000) {
			kojo = 600000;
		} else {
			kojo = nenkin;
		}

		var result = Math.ceil(kojo);
		return result;
	};

	//（15）公的年金等控除額2
	p.Calc15_Nenkinkoujyo2 = function(nenkin) {
		var kojo = 0;

		// 2021/03/05 乗率、加算額を最新化。2005年分～2019年分→2020年分以降
		if (nenkin >= 10000000) {
			kojo = 1955000;
		} else if (nenkin >= 7700000) {
			kojo = nenkin * 0.05 + 1455000;
		} else if (nenkin >= 4100000) {
			kojo = nenkin * 0.15 + 685000;
		} else if (nenkin >= 3300000) {
			kojo = nenkin * 0.25 + 275000;
		} else if (nenkin > 1100000) {
			kojo = 1100000;
		} else {
			kojo = nenkin;
		}

		var result = Math.ceil(kojo);
		return result;
	};

	//（16）所得税
	p.Calc16_Syotokuzei = function(is_hai) {
		var vShikyuteishi = [];
		var vNensyu = [];
		var vNenkin = [];
		var vNenkinhoken = [];
		var vShakaihoken = [];
		var tyPin = self.DB.get_mc_calc(is_hai);
		var Age = LPdate.calcAge(self.MC.get_st_birthday(is_hai));

		var vKyuyoukoujyo = [];
		var vSyotokuKoujyo = [];
		var vNenkinkoujyo = [];
		var vNenkinkoujyo2 = [];
		var vSyoSeihokoujyo = [];
		var vSyoNenhokoujyo = [];
		var vSyoIryhokoujyo = [];
		var vSyotokuzei = [];
		var vKazeiSyotoku = [];

		for (var i = 0; i < self.mDataLength; i++) {
			self.vLoanGenzei_hon[i] = self.L5.vLoanGenzei[i];
		}

		if (false === is_hai) {
			vNensyu = self.L1.vNensyu_hon;
			vShikyuteishi = self.L3.vShikyuteishi_hon;
			vNenkin = self.L3.vNenkin_hon;
			vNenkinhoken = self.L4.vNenkinhoken_hon;
			vShakaihoken = self.L4.vShakaihoken_hon;

			vKyuyoukoujyo = self.vKyuyoukoujyo_hon;
			vNenkinkoujyo = self.vNenkinkoujyo_hon;
			vNenkinkoujyo2 = self.vNenkinkoujyo2_hon;
			vSyotokuKoujyo = self.vSyotokuKoujyo_hon;
			vSyoSeihokoujyo = self.vSyoSeihokoujyo_hon;
			vSyoNenhokoujyo = self.vSyoNenhokoujyo_hon;
			vSyoIryhokoujyo = self.vSyoIryhokoujyo_hon;
			vSyotokuzei = self.vSyotokuzei_hon;
			vKazeiSyotoku = self.vKazeiSyotoku_hon;
		} else {
			vNensyu = self.L1.vNensyu_hai;
			vShikyuteishi = self.L3.vShikyuteishi_hai;
			vNenkin = self.L3.vNenkin_hai;
			vNenkinhoken = self.L4.vNenkinhoken_hai;
			vShakaihoken = self.L4.vShakaihoken_hai;

			vKyuyoukoujyo = self.vKyuyoukoujyo_hai;
			vNenkinkoujyo = self.vNenkinkoujyo_hai;
			vNenkinkoujyo2 = self.vNenkinkoujyo2_hai;
			vSyotokuKoujyo = self.vSyotokuKoujyo_hai;
			vSyoSeihokoujyo = self.vSyoSeihokoujyo_hai;
			vSyoNenhokoujyo = self.vSyoNenhokoujyo_hai;
			vSyoIryhokoujyo = self.vSyoIryhokoujyo_hai;
			vSyotokuzei = self.vSyotokuzei_hai;
			vKazeiSyotoku = self.vKazeiSyotoku_hai;
		}
		var dKazeiSyotoku;
		var index = self.getIndex(is_hai);
		var age_taisyoku = self.MC.get_age_taisyoku(is_hai);
		for (var i = Age; i < 100; i++) {

			// 2021/03/18 給与所得控除に条件を追加。　再就職時には給与所得控除を入れていない。自営業同様に費用を引いた再就職収入額を画面で入力すること
//			dKazeiSyotoku = Util.excelMax(vNensyu[i + index] - self.Calc13_Kyuyoukoujyo(vNensyu[i + index]), 0);
//
//			// 【設定】出力のための計算結果
//			vKyuyoukoujyo[i + index] = self.Calc13_Kyuyoukoujyo(vNensyu[i + index]);
			var syokugyo = self.MC.get_id_syokugyo(is_hai);
			if (  (syokugyo === G_syokugyo.KAISYAIN ||
					   syokugyo === G_syokugyo.YAKUIN ||
					   syokugyo === G_syokugyo.KOMUIN)
					&& (i <= age_taisyoku -1) ) {
				vKyuyoukoujyo[i + index] = self.Calc13_Kyuyoukoujyo(vNensyu[i + index]);
			}

			dKazeiSyotoku = Util.excelMax(vNensyu[i + index] - vKyuyoukoujyo[i + index], 0);

			if (i >= 65) {
				dKazeiSyotoku = dKazeiSyotoku
						+ Util.excelMax(vNenkin[i + index] - vShikyuteishi[i + index] -
								self.Calc15_Nenkinkoujyo2(vNenkin[i + index] - vShikyuteishi[i + index]),
								0);

				// 【設定】出力のための計算結果
				vNenkinkoujyo2[i + index] = self.Calc15_Nenkinkoujyo2(vNenkin[i + index] - vShikyuteishi[i + index]);
			} else if (i >= tyPin.BubunStAge) {
				dKazeiSyotoku = dKazeiSyotoku
						+ Util.excelMax(vNenkin[i + index] - vShikyuteishi[i + index] -
								self.Calc14_Nenkinkoujyo(vNenkin[i + index] - vShikyuteishi[i + index]),
								0);

				// 【設定】出力のための計算結果
				vNenkinkoujyo[i + index] = self.Calc14_Nenkinkoujyo(vNenkin[i + index] - vShikyuteishi[i + index]);
			}

			// 2021/02/26 生命保険料控除制度改正対応
//			var _Calc48a = self.L9.Calc48a_SyoSeihokoujyo(is_hai, i);
//			var _Calc49a = self.L9.Calc49a_SyoNenhokoujyo(is_hai, i);
//
//			if (dKazeiSyotoku > 0) {
//				dKazeiSyotoku = dKazeiSyotoku
//						- self.Calc11_Syotokukoujyo(is_hai, i)
//						- vNenkinhoken[i + index]
//						- vShakaihoken[i + index]
//						- _Calc48a
//						- _Calc49a;
//
//				// 【設定】出力のための計算結果
//				vSyotokuKoujyo[i + index] = self.Calc11_Syotokukoujyo(is_hai, i);
//				vSyoSeihokoujyo[i + index] = _Calc48a;
//				vSyoNenhokoujyo[i + index] = _Calc49a;
			var dGoukeiSyotoku = vNensyu[i + index] - vKyuyoukoujyo[i + index];
			vSyotokuKoujyo[i + index] = self.Calc11_Syotokukoujyo(is_hai, i, dGoukeiSyotoku);
			vSyoSeihokoujyo[i + index] = self.L9.Calc48a_SyoSeihokoujyo(is_hai, i);
			vSyoNenhokoujyo[i + index] = self.L9.Calc48b_SyoNenhokoujyo(is_hai, i);
			vSyoIryhokoujyo[i + index] = self.L9.Calc48c_SyoIryhokoujyo(is_hai, i);
			var _SeihoKojo = Math.min(vSyoSeihokoujyo[i + index] + vSyoNenhokoujyo[i + index] + vSyoIryhokoujyo[i + index], 120000);

			if (dKazeiSyotoku > 0) {
				dKazeiSyotoku = dKazeiSyotoku
						- vSyotokuKoujyo[i + index]
						- vNenkinhoken[i + index]
						- vShakaihoken[i + index]
						- _SeihoKojo;

				// 2021/03/05 乗率、加算額を最新化。2006年分～2014年分→2015年分以降
				if (dKazeiSyotoku >= 40000000) {
					vSyotokuzei[i + index] = (dKazeiSyotoku * 0.45 - 4796000);
				} else if (dKazeiSyotoku >= 18000000) {
					vSyotokuzei[i + index] = (dKazeiSyotoku * 0.4 - 2796000);
				} else if (dKazeiSyotoku >= 9000000) {
					vSyotokuzei[i + index] = (dKazeiSyotoku * 0.33 - 1536000);
				} else if (dKazeiSyotoku >= 6950000) {
					vSyotokuzei[i + index] = (dKazeiSyotoku * 0.23 - 636000);
				} else if (dKazeiSyotoku >= 3300000) {
					vSyotokuzei[i + index] = (dKazeiSyotoku * 0.2 - 427500);
				} else if (dKazeiSyotoku >= 1950000) {
					vSyotokuzei[i + index] = (dKazeiSyotoku * 0.1 - 97500);
				} else if (dKazeiSyotoku >= 1000) {
					vSyotokuzei[i + index] = (dKazeiSyotoku * 0.05 - 0);
				} else {
					vSyotokuzei[i + index] = 0;
				}

				// 2021/03/05 復興所得税計算の前に住宅ローン減税を行う
				vSyotokuzei[i + index] = Util.excelMax(vSyotokuzei[i + index] - self.vLoanGenzei_hon[i + index], 0);

				// 復興増税期間
				if (i - self.MC.get_age(is_hai) + LPdate.getCurYear(self.MC.get_st_birthday(false)) <= 2037) {
					vSyotokuzei[i + index] = (vSyotokuzei[i + index] * (1 + self.DB.get_cmninfo().ra_hukkousyotoku));
				}

				// 2021/03/05 復興所得税計算の前に住宅ローン減税を行う
				//vSyotokuzei[i + index] = Util.excelMax(vSyotokuzei[i + index] - self.vLoanGenzei_hon[i + index], 0);
			} else {
				vSyotokuzei[i + index] = 0;
			}
			vKazeiSyotoku[i + index] = dKazeiSyotoku;
		}
	};

	//（17）住民税

	p.Calc17_Jyuminzei = function(is_hai) {
		var tyPin = self.DB.get_mc_calc(is_hai);
		var dKazeiSyotoku;
		var vNensyu = [];
		var vNenkin = [];
		var vNenkinhoken = [];
		var vShakaihoken = [];
		var vShikyuteishi = [];
		var vKyuyoukoujyo = [];
		var index = self.getIndex(is_hai);
		var vJyuminzei = [];
		var vSyotokuzei = [];
		var vJyuKazeiSyotoku = [];
		var vJyuminKoujyo = [];
		var vJyuSeihokoujyo = [];
		var vJyuNenhokoujyo = [];
		var vJyuIryhokoujyo = [];
		var dJyuKoujyoRate;
		var dJyuGendo;

		dJyuKoujyoRate = self.L5.GetIfLoanJyuKoujyoRate();
		dJyuGendo = self.L5.GetIfLoanJyuGendo();

		var Age = LPdate.calcAge(self.MC.get_st_birthday(is_hai));

		for (var i = 0; i < self.mDataLength; i++) {
			self.vLoanGenzei_hon[i] = self.L5.vLoanGenzei[i];
		}

		if (false === is_hai) {
			vNensyu = self.L1.vNensyu_hon;
			vNenkin = self.L3.vNenkin_hon;
			vNenkinhoken = self.L4.vNenkinhoken_hon;
			vShakaihoken = self.L4.vShakaihoken_hon;

			vShikyuteishi = self.L3.vShikyuteishi_hon;
			vKyuyoukoujyo = self.vKyuyoukoujyo_hon;
			vJyuminzei = self.vJyuminzei_hon;
			vSyotokuzei = self.vSyotokuzei_hon;
			vJyuminKoujyo = self.vJyuminKoujyo_hon;
			vJyuSeihokoujyo = self.vJyuSeihokoujyo_hon;
			vJyuNenhokoujyo = self.vJyuNenhokoujyo_hon;
			vJyuIryhokoujyo = self.vJyuIryhokoujyo_hon;
			vJyuKazeiSyotoku = self.vJyuKazeiSyotoku_hon;
		} else {
			vNensyu = self.L1.vNensyu_hai;
			vNenkin = self.L3.vNenkin_hai;
			vNenkinhoken = self.L4.vNenkinhoken_hai;
			vShakaihoken = self.L4.vShakaihoken_hai;

			vShikyuteishi = self.L3.vShikyuteishi_hai;
			vKyuyoukoujyo = self.vKyuyoukoujyo_hai;
			vJyuminzei = self.vJyuminzei_hai;
			vSyotokuzei = self.vSyotokuzei_hai;
			vJyuminKoujyo = self.vJyuminKoujyo_hai;
			vJyuSeihokoujyo = self.vJyuSeihokoujyo_hai;
			vJyuNenhokoujyo = self.vJyuNenhokoujyo_hai;
			vJyuIryhokoujyo = self.vJyuIryhokoujyo_hai;
			vJyuKazeiSyotoku = self.vJyuKazeiSyotoku_hai;
		}

		for (var i = Age; i < 100; i++) {
			// 課税所得 ＝ 年収 －　給与所得控除　　　…　給与所得控除は所得税計算時に計算。職業、年齢も考慮済
			dKazeiSyotoku = Util.excelMax(vNensyu[i + index] - vKyuyoukoujyo[i + index], 0);

			// 2021/03/08  在職支給停止額 - vShikyuteishi[i + index] を追加
			if (i >= 65) {
				dKazeiSyotoku = (dKazeiSyotoku + Util.excelMax(vNenkin[i + index] - self.Calc15_Nenkinkoujyo2(vNenkin[i + index]) - vShikyuteishi[i + index], 0));
			} else if (i >= tyPin.BubunStAge) {
				dKazeiSyotoku = (dKazeiSyotoku + Util.excelMax(vNenkin[i + index] - self.Calc14_Nenkinkoujyo(vNenkin[i + index]) - vShikyuteishi[i + index], 0));
			}

			// 2021/03/08 生命保険料控除制度改正対応
//			dKazeiSyotoku = dKazeiSyotoku
//					- self.Calc12_Jyuminkoujyo(is_hai, i)
//					- vNenkinhoken[i + index]
//					- vShakaihoken[i + index]
//					- self.L9.Calc48b_JyuSeihokoujyo(is_hai, i)
//					- self.L9.Calc49b_JyuNenhokoujyo(is_hai, i);
//					- self.L9.Calc4Ab_JyuIryhokoujyo(is_hai, i);
			var dGoukeiSyotoku = vNensyu[i + index] - vKyuyoukoujyo[i + index];
			vJyuminKoujyo[i + index] = self.Calc12_Jyuminkoujyo(is_hai, i, dGoukeiSyotoku);
			vJyuSeihokoujyo[i + index] = self.L9.Calc49a_JyuSeihokoujyo(is_hai, i);
			vJyuNenhokoujyo[i + index] = self.L9.Calc49b_JyuNenhokoujyo(is_hai, i);
			vJyuIryhokoujyo[i + index] = self.L9.Calc49c_JyuIryhokoujyo(is_hai, i);
			var _SeihoKojo = Math.min(vJyuSeihokoujyo[i + index] + vJyuNenhokoujyo[i + index] + vJyuIryhokoujyo[i + index], 70000);

			dKazeiSyotoku = dKazeiSyotoku
					- vJyuminKoujyo[i + index]
					- vNenkinhoken[i + index]
					- vShakaihoken[i + index]
					- _SeihoKojo;

			vJyuKazeiSyotoku[i + index] = dKazeiSyotoku;

			if (vJyuKazeiSyotoku[i + index] > 0) {
				// 2021/03/05 復興所得税計算の前に住宅ローン減税を行う
//				// 復興増税期間
//				if (i - self.MC.get_age(is_hai) + LPdate.getCurYear(self.MC.get_st_birthday(false)) <= 2023) {
//					vJyuminzei[i + index] = (dKazeiSyotoku * 0.1 + 5000);
//				} else {
//					vJyuminzei[i + index] = (dKazeiSyotoku * 0.1 + 4000);
//				}
//				if (self.vLoanGenzei_hon[i + index] - vSyotokuzei[i + index] > 0) {
//					vJyuminzei[i + index] = (vJyuminzei[i + index] -
//							Util.excelMin(self.vLoanGenzei_hon[i + index] - vSyotokuzei[i + index],
//									Util.excelMin(dKazeiSyotoku * dJyuKoujyoRate, dJyuGendo)));
//				}
				// 住民税率を掛ける
				vJyuminzei[i + index] = vJyuKazeiSyotoku[i + index] * 0.1;

				// 住宅ローン減税
				if (self.vLoanGenzei_hon[i + index] - vSyotokuzei[i + index] > 0) {
					vJyuminzei[i + index] = (vJyuminzei[i + index] -
							Util.excelMin(self.vLoanGenzei_hon[i + index] - vSyotokuzei[i + index],
									Util.excelMin(vJyuKazeiSyotoku[i + index] * dJyuKoujyoRate, dJyuGendo)));
				}

				// 復興増税期間
				if (i - self.MC.get_age(is_hai) + LPdate.getCurYear(self.MC.get_st_birthday(false)) <= 2023) {
					vJyuminzei[i + index] = vJyuminzei[i + index] + 5000;
				} else {
					vJyuminzei[i + index] = vJyuminzei[i + index] + 4000;
				}

			} else {
				vJyuminzei[i + index] = 0;
			}

		}
	};

	//（18）年金保険料

	p.Calc18_Nenkinhoken = function(is_hai) {
		var syokugyo = self.MC.get_id_syokugyo(is_hai);
		var syokugyo_hai = self.MC.get_id_syokugyo(!is_hai);
		var Age = LPdate.calcAge(self.MC.get_st_birthday(is_hai));
		var vKounenHousyu;
		var vNenkinhoken;
		var index = self.getIndex(is_hai);
		var iAgeGap;
		var age_taisyoku;

		if (is_hai) {
			vKounenHousyu = self.L2.vKoseiHousyu_hai;
			vNenkinhoken = self.vNenkinhoken_hai;
			iAgeGap = LPdate.calcAge(self.MC.st_birthday_hai, self.MC.st_birthday_hon);
			age_taisyoku = self.MC.age_taisyoku_hai;
		} else {
			vKounenHousyu = self.L2.vKoseiHousyu_hon;
			vNenkinhoken = self.vNenkinhoken_hon;
			iAgeGap = LPdate.calcAge(self.MC.st_birthday_hon, self.MC.st_birthday_hai);
			age_taisyoku = self.MC.age_taisyoku_hon;
		}

		//第２号被保険者（会社員、公務員）

		if (syokugyo === G_syokugyo.KAISYAIN || syokugyo === G_syokugyo.YAKUIN || syokugyo === G_syokugyo.KOMUIN) {
			// 2021/03/24 退職年齢は本人、配偶者それぞれの退職年齢
			//var max_range = (self.MC.age_taisyoku_hon < 65 ? self.MC.age_taisyoku_hon : 65);
			var max_range = (age_taisyoku < 65 ? age_taisyoku : 65);
			for (var i = Age; i < max_range; i++) {
				vNenkinhoken[i + index] = (vKounenHousyu[i + index] * self.DB.get_cmninfo().ra_kousei * 12);
			}
		} else {
			// 【Lifeplan_問題管理票_社内.xls】No.075 対応

			for (var i = Age; i < 100; i++) {
				vNenkinhoken[i + index] = 0;

				if (i < 60) {
					//第１号被保険者（自営業、無職
					if (!self.MC.is_kekkon()) {
						vNenkinhoken[i + index] = self.DB.get_cmninfo().sm_nenkinhoken;
					} else {
						//第３号被保険者（第２号被保険者の配偶者）

						// 相手が退職する前までは、第３号被保険者になる

						if (syokugyo_hai === G_syokugyo.KAISYAIN || syokugyo_hai === G_syokugyo.YAKUIN || syokugyo_hai === G_syokugyo.KOMUIN &&
								i - iAgeGap >= Util.excelMin(self.MC.get_age_taisyoku(!is_hai), 65)) {
							vNenkinhoken[i + index] = 0;
						} else {
							vNenkinhoken[i + index] = self.DB.get_cmninfo().sm_nenkinhoken;
							//相手が退職した後からは、第１号被保険者に切り替わる。

						}
					}
				}
			}
		}
	};

	//（19）社会保険料

	p.Calc19_Shakaihoken = function(is_hai) {
		var syokugyo = self.MC.get_id_syokugyo(is_hai);
		var syokugyo_hai = self.MC.get_id_syokugyo(!is_hai);
		var Age = LPdate.calcAge(self.MC.get_st_birthday(is_hai));
		var g_Ci = self.DB.get_cmninfo();
		var index = self.getIndex(is_hai);
		var iAgeGap;
		var vKenkohoken = [];
		var vKoyouhoken = [];
		var vKaigohoken = [];
		var vShakaihoken = [];
		var vNenkin = [];
		var vNensyu = [];
		var vKenpoHousyu = [];
		var lKokuminhoken;

		if (is_hai) {
			iAgeGap = LPdate.calcAge(self.MC.st_birthday_hai, self.MC.st_birthday_hon);
			vKenkohoken = self.vKenkohoken_hai;
			vKoyouhoken = self.vKoyouhoken_hai;
			vKaigohoken = self.vKaigohoken_hai;
			vShakaihoken = self.vShakaihoken_hai;
			vNenkin = self.L3.vNenkin_hai;
			vNensyu = self.L1.vNensyu_hai;
			lKokuminhoken = g_Ci.sm_kokuhoken_hai;
			vKenpoHousyu = self.L2.vKenpoHousyu_hai;
		} else {
			iAgeGap = LPdate.calcAge(self.MC.st_birthday_hon, self.MC.st_birthday_hai);
			vKenkohoken = self.vKenkohoken_hon;
			vKoyouhoken = self.vKoyouhoken_hon;
			vKaigohoken = self.vKaigohoken_hon;
			vShakaihoken = self.vShakaihoken_hon;
			vNenkin = self.L3.vNenkin_hon;
			vNensyu = self.L1.vNensyu_hon;
			lKokuminhoken = g_Ci.sm_kokuminhoken_hon;
			vKenpoHousyu = self.L2.vKenpoHousyu_hon;
		}

		for (var i = Age; i < 100; i++) {
			if (i < 75) {
				if (syokugyo === G_syokugyo.KAISYAIN || syokugyo === G_syokugyo.YAKUIN || syokugyo === G_syokugyo.KOMUIN) {
					if (i < self.MC.get_age_taisyoku(is_hai)) {
						vKenkohoken[i + index] = (vKenpoHousyu[i + index] * g_Ci.ra_kenpo * 12);
						// 2021/04/09 会社役員の雇用保険料をゼロに修正
						//vKoyouhoken[i + index] = (vNensyu[i + index] * g_Ci.ra_koyou);
						if (syokugyo !== G_syokugyo.YAKUIN) {
							vKoyouhoken[i + index] = (vNensyu[i + index] * g_Ci.ra_koyou);
						} else {
							vKoyouhoken[i + index] = 0;
						}

						if (i >= 40) {
							if (i < 65) {
								vKaigohoken[i + index] = (vKenpoHousyu[i + index] * g_Ci.ra_kaigo2);
							} else {
								// 2021/04/09 65歳以降の介護保険料を定額に修正
								//vKaigohoken[i + index] = (vNensyu[i + index] * g_Ci.ra_kaigo1);
								vKaigohoken[i + index] = g_Ci.ra_kaigo1;
							}
						} else {
							vKaigohoken[i + index] = 0;
						}
					} else {
						// 【Web版LifePlan_課題管理.xml】No.3 対応 START
//						if (self.MC.is_kekkon() && syokugyo_hai === G_syokugyo.KAISYAIN || syokugyo_hai === G_syokugyo.YAKUIN ||
//								(syokugyo_hai === G_syokugyo.KOMUIN && i - iAgeGap >= self.MC.get_age_taisyoku(!is_hai))) {
						if (self.MC.is_kekkon()
								&& (syokugyo_hai === G_syokugyo.KAISYAIN || syokugyo_hai === G_syokugyo.YAKUIN || syokugyo_hai === G_syokugyo.KOMUIN)
								&& (i - iAgeGap < self.MC.get_age_taisyoku(!is_hai))) {
                        // 【Web版LifePlan_課題管理.xml】No.3 対応 END
							vKenkohoken[i + index] = 0;
							vKaigohoken[i + index] = 0;
						} else {
							// 2021/04/09 退職後、配偶者の被扶養者でない場合、健康保険料を定額に修正
							//vKenkohoken[i + index] = ((vNensyu[i + index] + vNenkin[i + index]) * g_Ci.ra_kokuminhoken + lKokuminhoken);
							vKenkohoken[i + index] = lKokuminhoken;

							if (i >= 65) {
								// 2021/04/09 65歳以降の介護保険料を定額に修正
								//vKaigohoken[i + index] = (vNenkin[i + index] * g_Ci.ra_kaigo1);
								vKaigohoken[i + index] = g_Ci.ra_kaigo1;
							// 2021/04/09 退職後、配偶者の被扶養者でなく、40歳～64歳の介護保険料をゼロに修正（退職した40歳～64歳条件簡略化）
							//} else if (i >= 40) {
							//	vKaigohoken[i + index] = ((vNensyu[i + index] + vNenkin[i + index]) * g_Ci.ra_kaigo2);
							} else {
								vKaigohoken[i + index] = 0;
							}
						}

						vKoyouhoken[i + index] = 0;
					}
					// 自営業の場合

				// 【Web版LifePlan_課題管理.xml】No.4 対応 START
//				} else if (syokugyo_hai === G_syokugyo.JIEIGYO) {
				} else if (syokugyo === G_syokugyo.JIEIGYO) {
				// 【Web版LifePlan_課題管理.xml】No.4 対応 END
					if (i < self.MC.get_age_taisyoku(is_hai)) {
						vKenkohoken[i + index] = (vNensyu[i + index] * g_Ci.ra_kokuminhoken + lKokuminhoken);

						if (i >= 40) {
							if (i < 65) {
								vKaigohoken[i + index] = (vNensyu[i + index] * g_Ci.ra_kaigo2);
							} else {
								// 2021/04/09 65歳以降の介護保険料を定額に修正
								//vKaigohoken[i + index] = (vNensyu[i + index] * g_Ci.ra_kaigo1);
								vKaigohoken[i + index] = g_Ci.ra_kaigo1;
							}
						} else {
							vKaigohoken[i + index] = 0;
						}
						// 自営業退職後

					} else {
						// 【Web版LifePlan_課題管理.xml】No.3 対応 START
//						if (self.MC.is_kekkon() && syokugyo_hai === G_syokugyo.KAISYAIN || syokugyo_hai === G_syokugyo.YAKUIN ||
//								(syokugyo_hai === G_syokugyo.KOMUIN && i - iAgeGap >= self.MC.get_age_taisyoku(!is_hai))) {
						if (self.MC.is_kekkon()
								&& (syokugyo_hai === G_syokugyo.KAISYAIN || syokugyo_hai === G_syokugyo.YAKUIN || syokugyo_hai === G_syokugyo.KOMUIN)
								&& (i - iAgeGap < self.MC.get_age_taisyoku(!is_hai))) {
						// 【Web版LifePlan_課題管理.xml】No.3 対応 END
							vKenkohoken[i + index] = 0;
							vKaigohoken[i + index] = 0;
						} else {
							// 2021/04/09 退職後、配偶者の被扶養者でない場合、健康保険料を定額に修正
							//vKenkohoken[i + index] = (vNenkin[i + index] * g_Ci.ra_kokuminhoken + lKokuminhoken);
							vKenkohoken[i + index] = lKokuminhoken;

							if (i >= 65) {
								// 2021/04/09 65歳以降の介護保険料を定額に修正
								//vKaigohoken[i + index] = (vNenkin[i + index] * g_Ci.ra_kaigo1);
								vKaigohoken[i + index] = g_Ci.ra_kaigo1;
							// 2021/04/09 退職後、配偶者の被扶養者でなく、40歳～64歳の介護保険料をゼロに修正（退職した40歳～64歳条件簡略化）
							//} else if (i >= 40) {
							//	vKaigohoken[i + index] = (vNenkin[i + index] * g_Ci.ra_kaigo2);
							} else {
								vKaigohoken[i + index] = 0;
							}
						}
					}

					vKoyouhoken[i + index] = 0;
					// 無職、退職者の場合

				} else {
					// 【Web版LifePlan_課題管理.xml】No.3 対応 START
//					if (self.MC.is_kekkon() && syokugyo_hai === G_syokugyo.KAISYAIN || syokugyo_hai === G_syokugyo.YAKUIN ||
//							(syokugyo_hai === G_syokugyo.KOMUIN && i - iAgeGap >= self.MC.get_age_taisyoku(!is_hai))) {
					if (self.MC.is_kekkon()
							&& (syokugyo_hai === G_syokugyo.KAISYAIN || syokugyo_hai === G_syokugyo.YAKUIN || syokugyo_hai === G_syokugyo.KOMUIN)
							&& (i - iAgeGap < self.MC.get_age_taisyoku(!is_hai))) {
						// 【Web版LifePlan_課題管理.xml】No.3 対応 END
						// 配偶者の被扶養者（第三号被保険者）になる。

						vKenkohoken[i + index] = 0;
						vKaigohoken[i + index] = 0;
					} else {
						// 2021/04/09 無職、退職者で、配偶者の被扶養者でない場合、健康保険料を定額に修正
						//vKenkohoken[i + index] = (vNenkin[i + index] * g_Ci.ra_kokuminhoken + lKokuminhoken);
						vKenkohoken[i + index] = lKokuminhoken;

						if (i >= 65) {
							// 2021/04/09 65歳以降の介護保険料を定額に修正
							//vKaigohoken[i + index] = (vNenkin[i + index] * g_Ci.ra_kaigo1);
							vKaigohoken[i + index] = g_Ci.ra_kaigo1;
						// 2021/04/09 無職、退職者で、、配偶者の被扶養者でなく、40歳～64歳の介護保険料をゼロに修正（退職した40歳～64歳条件簡略化）
						//} else if (i >= 40) {
						//	vKaigohoken[i + index] = (vNenkin[i + index] * g_Ci.ra_kaigo2);
						} else {
							vKaigohoken[i + index] = 0;
						}
					}

					vKoyouhoken[i + index] = 0;
				}
			} else {
				vKenkohoken[i + index] = g_Ci.sm_koreihoken;

				// 2021/03/08 第2号被保険者保険料率→第1号被保険者保険料率
				//vKaigohoken[i + index] = (vNenkin[i + index] * g_Ci.ra_kaigo2);
				// 2021/04/09 65歳以降の介護保険料を定額に修正
				//vKaigohoken[i + index] = (vNenkin[i + index] * g_Ci.ra_kaigo1);
				vKaigohoken[i + index] = g_Ci.ra_kaigo1;
				vKoyouhoken[i + index] = 0;
			}

			vShakaihoken[i + index] = vKenkohoken[i + index] + vKoyouhoken[i + index] + vKaigohoken[i + index];
//			console.log('本人職業：' + syokugyo + ',退職年齢：' + self.MC.get_age_taisyoku(is_hai) + ',i(年齢カウント）：' + i + ',結婚フラグ：' + self.MC.is_kekkon() + ',職業配偶者：' + syokugyo_hai + ',配偶者退職年齢：' + self.MC.get_age_taisyoku(!is_hai) + ',配偶者年齢：' + (i - iAgeGap));
//			console.log('社会保険：' + vShakaihoken[i + index]);
//			console.log('健康保険：' + vKenkohoken[i + index]);
//			console.log('雇用保険：' + vKoyouhoken[i + index]);
//			console.log('介護保険：' + vKaigohoken[i + index]);
		}

	};
	p.dump = function(context, is_hai) {
		var result;
		var p = 0;
		if (!is_hai) {
			result = [];
			result[p++] = "4:ご本人様:所得税控除額\t";
			result[p++] = "4:ご本人様:住民税控除額\t";
			result[p++] = "4:ご本人様:給与所得控除額\t";
			result[p++] = "4:ご本人様:公的年金等控除額\t";
			result[p++] = "4:ご本人様:公的年金等控除額2\t";
			result[p++] = "4:ご本人様:所得税生命保険料控除\t";
			result[p++] = "4:ご本人様:所得税個人年金保険料控除\t";
			result[p++] = "4:ご本人様:所得税介護医療保険料控除\t";
			result[p++] = "4:ご本人様:所得課税所得\t";
			result[p++] = "4:ご本人様:住宅ローン所得税減税額\t";
			result[p++] = "4:ご本人様:所得税\t";
			result[p++] = "4:ご本人様:住民税生命保険料控除\t";
			result[p++] = "4:ご本人様:住民税個人年金保険料控除\t";
			result[p++] = "4:ご本人様:住民税介護医療保険料控除\t";
			result[p++] = "4:ご本人様:住民課税所得\t";
			result[p++] = "4:ご本人様:住民税\t";
			result[p++] = "4:ご本人様:年金保険料\t";
			result[p++] = "4:ご本人様:健康保険料\t";
			result[p++] = "4:ご本人様:雇用保険料\t";
			result[p++] = "4:ご本人様:介護保険料\t";
			result[p++] = "4:ご本人様:社会保険料\t";
		} else {
			result = [];
			result[p++] = "4:配偶者様:所得税控除額\t";
			result[p++] = "4:配偶者様:住民税控除額\t";
			result[p++] = "4:配偶者様:給与所得控除額\t";
			result[p++] = "4:配偶者様:公的年金等控除額\t";
			result[p++] = "4:配偶者様:公的年金等控除額2\t";
			result[p++] = "4:配偶者様:所得税生命保険料控除\t";
			result[p++] = "4:配偶者様:所得税個人年金保険料控除\t";
			result[p++] = "4:配偶者様:所得税介護医療保険料控除\t";
			result[p++] = "4:配偶者様:所得課税所得\t";
			result[p++] = "4:配偶者様:所得税\t";
			result[p++] = "4:配偶者様:住民税生命保険料控除\t";
			result[p++] = "4:配偶者様:住民税個人年金保険料控除\t";
			result[p++] = "4:配偶者様:住民税介護医療保険料控除\t";
			result[p++] = "4:配偶者様:住民課税所得\t";
			result[p++] = "4:配偶者様:住民税\t";
			result[p++] = "4:配偶者様:年金保険料\t";
			result[p++] = "4:配偶者様:健康保険料\t";
			result[p++] = "4:配偶者様:雇用保険料\t";
			result[p++] = "4:配偶者様:介護保険料\t";
			result[p++] = "4:配偶者様:社会保険料\t";
		}
		for (var i = 0; i < self.mDataLength; i++) {
			p = 0;
			if (!is_hai) {
				result[p++] += (self.vSyotokuKoujyo_hon[i]) + "\t";
				result[p++] += (self.vJyuminKoujyo_hon[i]) + "\t";
				result[p++] += (self.vKyuyoukoujyo_hon[i]) + "\t";
				result[p++] += (self.vNenkinkoujyo_hon[i]) + "\t";
				result[p++] += (self.vNenkinkoujyo2_hon[i]) + "\t";
				result[p++] += (self.vSyoSeihokoujyo_hon[i]) + "\t";
				result[p++] += (self.vSyoNenhokoujyo_hon[i]) + "\t";
				result[p++] += (self.vSyoIryhokoujyo_hon[i]) + "\t";
				result[p++] += (self.vKazeiSyotoku_hon[i]) + "\t";
				result[p++] += (self.vLoanGenzei_hon[i]) + "\t";
				result[p++] += (self.vSyotokuzei_hon[i]) + "\t";
				result[p++] += (self.vJyuSeihokoujyo_hon[i]) + "\t";
				result[p++] += (self.vJyuNenhokoujyo_hon[i]) + "\t";
				result[p++] += (self.vJyuIryhokoujyo_hon[i]) + "\t";
				result[p++] += (self.vJyuKazeiSyotoku_hon[i]) + "\t";
				result[p++] += (self.vJyuminzei_hon[i]) + "\t";
				result[p++] += (self.vNenkinhoken_hon[i]) + "\t";
				result[p++] += (self.vKenkohoken_hon[i]) + "\t";
				result[p++] += (self.vKoyouhoken_hon[i]) + "\t";
				result[p++] += (self.vKaigohoken_hon[i]) + "\t";
				result[p++] += (self.vShakaihoken_hon[i]) + "\t";
			} else {
				result[p++] += (self.vSyotokuKoujyo_hai[i]) + "\t";
				result[p++] += (self.vJyuminKoujyo_hai[i]) + "\t";
				result[p++] += (self.vKyuyoukoujyo_hai[i]) + "\t";
				result[p++] += (self.vNenkinkoujyo_hai[i]) + "\t";
				result[p++] += (self.vNenkinkoujyo2_hai[i]) + "\t";
				result[p++] += (self.vSyoSeihokoujyo_hai[i]) + "\t";
				result[p++] += (self.vSyoNenhokoujyo_hai[i]) + "\t";
				result[p++] += (self.vSyoIryhokoujyo_hai[i]) + "\t";
				result[p++] += (self.vKazeiSyotoku_hai[i]) + "\t";
				result[p++] += (self.vSyotokuzei_hai[i]) + "\t";
				result[p++] += (self.vJyuSeihokoujyo_hai[i]) + "\t";
				result[p++] += (self.vJyuNenhokoujyo_hai[i]) + "\t";
				result[p++] += (self.vJyuIryhokoujyo_hai[i]) + "\t";
				result[p++] += (self.vJyuKazeiSyotoku_hai[i]) + "\t";
				result[p++] += (self.vJyuminzei_hai[i]) + "\t";
				result[p++] += (self.vNenkinhoken_hai[i]) + "\t";
				result[p++] += (self.vKenkohoken_hai[i]) + "\t";
				result[p++] += (self.vKoyouhoken_hai[i]) + "\t";
				result[p++] += (self.vKaigohoken_hai[i]) + "\t";
				result[p++] += (self.vShakaihoken_hai[i]) + "\t";
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

		data.vSyotokuKoujyo_hon = self.vSyotokuKoujyo_hon;
		data.vJyuminKoujyo_hon = self.vJyuminKoujyo_hon;
		data.vKyuyoukoujyo_hon = self.vKyuyoukoujyo_hon;
		data.vNenkinkoujyo_hon = self.vNenkinkoujyo_hon;
		data.vNenkinkoujyo2_hon = self.vNenkinkoujyo2_hon;
		data.vSyoSeihokoujyo_hon = self.vSyoSeihokoujyo_hon;
		data.vSyoNenhokoujyo_hon = self.vSyoNenhokoujyo_hon;
		data.vSyoIryhokoujyo_hon = self.vSyoIryhokoujyo_hon;
		data.vKazeiSyotoku_hon = self.vKazeiSyotoku_hon;
		data.vLoanGenzei_hon = self.vLoanGenzei_hon;
		data.vSyotokuzei_hon = self.vSyotokuzei_hon;
		data.vJyuSeihokoujyo_hon = self.vJyuSeihokoujyo_hon;
		data.vJyuNenhokoujyo_hon = self.vJyuNenhokoujyo_hon;
		data.vJyuIryhokoujyo_hon = self.vJyuIryhokoujyo_hon;
		data.vJyuKazeiSyotoku_hon = self.vJyuKazeiSyotoku_hon;
		data.vJyuminzei_hon = self.vJyuminzei_hon;
		data.vNenkinhoken_hon = self.vNenkinhoken_hon;
		data.vKenkohoken_hon = self.vKenkohoken_hon;
		data.vKoyouhoken_hon = self.vKoyouhoken_hon;
		data.vKaigohoken_hon = self.vKaigohoken_hon;
		data.vShakaihoken_hon = self.vShakaihoken_hon;

		data.vSyotokuKoujyo_hai = self.vSyotokuKoujyo_hai;
		data.vJyuminKoujyo_hai = self.vJyuminKoujyo_hai;
		data.vKyuyoukoujyo_hai = self.vKyuyoukoujyo_hai;
		data.vNenkinkoujyo_hai = self.vNenkinkoujyo_hai;
		data.vNenkinkoujyo2_hai = self.vNenkinkoujyo2_hai;
		data.vSyoSeihokoujyo_hai = self.vSyoSeihokoujyo_hai;
		data.vSyoNenhokoujyo_hai = self.vSyoNenhokoujyo_hai;
		data.vSyoIryhokoujyo_hai = self.vSyoIryhokoujyo_hai;
		data.vKazeiSyotoku_hai = self.vKazeiSyotoku_hai;
		data.vSyotokuzei_hai = self.vSyotokuzei_hai;
		data.vJyuSeihokoujyo_hai = self.vJyuSeihokoujyo_hai;
		data.vJyuNenhokoujyo_hai = self.vJyuNenhokoujyo_hai;
		data.vJyuIryhokoujyo_hai = self.vJyuIryhokoujyo_hai;
		data.vJyuKazeiSyotoku_hai = self.vJyuKazeiSyotoku_hai;
		data.vJyuminzei_hai = self.vJyuminzei_hai;
		data.vNenkinhoken_hai = self.vNenkinhoken_hai;
		data.vKenkohoken_hai = self.vKenkohoken_hai;
		data.vKoyouhoken_hai = self.vKoyouhoken_hai;
		data.vKaigohoken_hai = self.vKaigohoken_hai;
		data.vShakaihoken_hai = self.vShakaihoken_hai;

		LIFEPLAN.conf.storage.setItem("Logic04", JSON.stringify(data));
	};

	return Logic04;
})();