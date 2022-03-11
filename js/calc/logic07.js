/* global LIFEPLAN */

/**
 * （7）遺族年金受給額推計
 * 【計算】依存関係：（6） 資金収支＆資金残高推計
 *
 */
"use strict";

// public class Logic07 extends BaseCalc
LIFEPLAN.calc.Logic07 = (function() {

	var self;
	var G_syokugyo = new LIFEPLAN.db.LifePlanDB().G_syokugyo;
	var LPdate = new LIFEPLAN.db.LifePlanDB().LPdate;
	var Util = new LIFEPLAN.util.Util();

	var Logic07 = function(db) {
		self = this;
		LIFEPLAN.calc.BaseCalc.call(self, db);
		//出力値
		self.vIzokuKiso_hon = [];			//ご本人様：遺族基礎年金（合計）
		self.vIzokuKouseiS_hon = [];			//ご本人様：遺族厚生年金（合計）
		self.vIzokuKousei_kafu_hon = [];		//ご本人様：遺族厚生年金_寡婦加算（合計）
		self.vIzokuKousei_sibo_hon = [];		//ご本人様：遺族厚生年金_死亡時標準報酬額（合計）
		self.vIzokuKyousaiS_hon = [];		//ご本人様：遺族共済年金（合計）
		self.vIzokuKyousai_kafu_hon = [];	//ご本人様：遺族共済年金_寡婦加算（合計）
		self.vIzokuKyousai_sibo_hon = [];	//ご本人様：遺族共済年金_死亡時標準報酬額（合計）
		self.vKafunenkin_hon = [];			//ご本人様：寡婦年金（合計）

		self.vIzokuKiso_hai = [];			//配偶者様：遺族基礎年金（合計）
		self.vIzokuKouseiS_hai = [];			//配偶者様：遺族厚生年金（合計）
		self.vIzokuKousei_kafu_hai = [];		//配偶者様：遺族厚生年金_寡婦加算（合計）
		self.vIzokuKousei_sibo_hai = [];		//配偶者様：遺族厚生年金_死亡時標準報酬額（合計）
		self.vIzokuKyousaiS_hai = [];		//配偶者様：遺族共済年金（合計）
		self.vIzokuKyousai_kafu_hai = [];	//配偶者様：遺族共済年金_寡婦加算（合計）
		self.vIzokuKyousai_sibo_hai = [];	//配偶者様：遺族共済年金_死亡時標準報酬額（合計）
		self.vKafunenkin_hai = [];			//配偶者様：寡婦年金（合計）

		self.vIzokuKiso_y_hon = [];			//ご本人様：遺族基礎年金（年額）
		self.vIzokuKiso_y_hai = [];			//配偶者様：遺族基礎年金（年額）

		self.L1;
		self.L3;
		self.L6;

		self.g_PinHon = self.DB.get_mc_calc(false);
	};

	LIFEPLAN.module.inherits(Logic07, LIFEPLAN.calc.BaseCalc);

	var p = Logic07.prototype;

//	@Override
	p.setupData = function() {
		LIFEPLAN.calc.BaseCalc.prototype.setupData.call();
		if (self.mDataLength === 0) {
			return;
		}
		self.vIzokuKiso_hon = self.makeArrayBuffer();
		self.vIzokuKiso_y_hon = self.makeArrayBuffer();
		self.vIzokuKouseiS_hon = self.makeArrayBuffer();
		self.vIzokuKousei_kafu_hon = self.makeArrayBuffer();
		self.vIzokuKousei_sibo_hon = self.makeArrayBuffer();
		self.vIzokuKyousaiS_hon = self.makeArrayBuffer();
		self.vIzokuKyousai_kafu_hon = self.makeArrayBuffer();
		self.vIzokuKyousai_sibo_hon = self.makeArrayBuffer();
		self.vKafunenkin_hon = self.makeArrayBuffer();

		self.vIzokuKiso_hai = self.makeArrayBuffer();
		self.vIzokuKiso_y_hai = self.makeArrayBuffer();
		self.vIzokuKouseiS_hai = self.makeArrayBuffer();
		self.vIzokuKousei_kafu_hai = self.makeArrayBuffer();
		self.vIzokuKousei_sibo_hai = self.makeArrayBuffer();
		self.vIzokuKyousaiS_hai = self.makeArrayBuffer();
		self.vIzokuKyousai_kafu_hai = self.makeArrayBuffer();
		self.vIzokuKyousai_sibo_hai = self.makeArrayBuffer();
		self.vKafunenkin_hai = self.makeArrayBuffer();
	};

	p.logic07_Go = function() {
		if (self.MC.is_kekkon()) {
			self.Calc38_IzokuKiso(false);
			self.Calc39_IzokuKousei(false);
			self.Calc40_IzokuKyousai(false);
			self.Calc42_Kafunenkin(false);

			self.Calc38_IzokuKiso(true);
			self.Calc39_IzokuKousei(true);
			self.Calc40_IzokuKyousai(true);
			self.Calc42_Kafunenkin(true);
		}
	};

	// 計算式（38）遺族基礎年金

	p.Calc38_IzokuKiso = function(is_hai) {
		var iAgeGap = 0;
		// 【Web版LifePlan_課題管理.xml】No.8 対応 START
		var AgeGap=0;
	    // 【Web版LifePlan_課題管理.xml】No.8 対応 END
		var iShikyuNinzu;
		var Age = self.MC.get_age(is_hai);
		var index = self.getIndex(is_hai);
		var iLifespanHai;
		var sex = self.MC.id_sex_hon;
		if (self.MC.is_kekkon()) {
			iAgeGap = LPdate.calcAge(self.MC.st_birthday_hon, self.MC.st_birthday_hai);
		}

		var vIzokuKiso = self.vIzokuKiso_hon;
		var vIzokuKiso_y = self.vIzokuKiso_y_hon;
		if (is_hai) {
			iAgeGap = -iAgeGap;
			vIzokuKiso = self.vIzokuKiso_hai;
			vIzokuKiso_y = self.vIzokuKiso_y_hai;
			sex = 3 - sex;
		}
		if (sex === 1) {
			iLifespanHai = self.DB.get_banksetupinfo().age_life_w;
		} else {
			iLifespanHai = self.DB.get_banksetupinfo().age_life_m;
		}
		// 2021/03/17 遺族基礎年金ロジックの大幅変更のため元のロジックを削除
//		/*****2014/01/20 "遺族基礎年金算出ロジックの修正（父子家庭の場合を考慮）" start****/
////		if (sex === 1 && self.MC.is_kekkon() && self.MC.get_child_count() > 0){
//		if (self.MC.is_kekkon() && self.MC.get_child_count() > 0) {
//			/*****2014/01/20 "遺族基礎年金算出ロジックの修正（父子家庭の場合を考慮）" end****/
//			// 【Lifeplan_問題管理票_社内.xls】No.062 対応
//
//			for (var i = Age; i <= Age + 35; i++) {
//				if (i >= 100) {
//					break;
//				}
//				for (var j = i; j <= iLifespanHai + iAgeGap; j++) {
//					if (j >= 100) {
//						break;
//					}
//					iShikyuNinzu = 0;
//
//					for (var k = 1; k <= self.MC.get_child_count(); k++) {
//						var g_EduPi = self.MC.get_kyouiku(k);
//						if (g_EduPi === null) {
//							break;
//						}
//						// 【Web版LifePlan_課題管理.xml】No.8 対応 START
////						var AgeGap = LPdate.calcAge(self.MC.st_birthday_hon, g_EduPi.ymd_child);
//						if (is_hai) {
//							AgeGap = LPdate.calcAge(self.MC.st_birthday_hai, g_EduPi.ymd_child);
//						} else {
//							AgeGap = LPdate.calcAge(self.MC.st_birthday_hon, g_EduPi.ymd_child);
//						}
//						// 【Web版LifePlan_課題管理.xml】No.8 対応 END
//
//						if (0 <= j - AgeGap && j - AgeGap <= 18) {
//							if (iShikyuNinzu < 1) {
//								vIzokuKiso[i + index] += self.DB.get_cmninfo().sm_roureikiso + self.DB.get_cmninfo().sm_kakyunenkin;
//							} else if (iShikyuNinzu < 2) {
//								vIzokuKiso[i + index] += self.DB.get_cmninfo().sm_kakyunenkin;
//							} else {
//								vIzokuKiso[i + index] += self.DB.get_cmninfo().sm_kakyunenkin3;
//							}
//
//							iShikyuNinzu++;
//						}
//					}
//				}
//			}
//		}
		if (self.MC.get_child_count() == 0) {
			return ;
		}
		// 遺族基礎年金（年額）
		for (var i = Age; i <= Age + 35; i++) {
			if (i >= 100) {
				break;
			}
			iShikyuNinzu = 0;
			for (var k = 1; k <= self.MC.get_child_count(); k++) {
				var g_EduPi = self.MC.get_kyouiku(k);
				if (g_EduPi === null) {
					break;
				}
				if (is_hai) {
					AgeGap = LPdate.calcAge(self.MC.st_birthday_hai, g_EduPi.ymd_child);
				} else {
					AgeGap = LPdate.calcAge(self.MC.st_birthday_hon, g_EduPi.ymd_child);
				}
				if (0 <= i - AgeGap && i - AgeGap <= 18) {
					if (iShikyuNinzu < 1) {
						if (self.MC.is_kekkon()) {
							vIzokuKiso_y[i + index] += self.DB.get_cmninfo().sm_roureikiso + self.DB.get_cmninfo().sm_kakyunenkin;
						} else {
							vIzokuKiso_y[i + index] += self.DB.get_cmninfo().sm_roureikiso;
						}
					} else if (iShikyuNinzu < 2) {
						vIzokuKiso_y[i + index] += self.DB.get_cmninfo().sm_kakyunenkin;
					} else {
						vIzokuKiso_y[i + index] += self.DB.get_cmninfo().sm_kakyunenkin3;
					}
					iShikyuNinzu++;
				}
			}
		}
		// 遺族基礎年金（合計）
		for (var i = Age; i <= Age + 35; i++) {
			for (var j = i; j <= Age + 35; j++) {
				vIzokuKiso[i + index] += vIzokuKiso_y[j + index];
			}
		}
	};

	// 計算式（39）遺族厚生年金

	p.Calc39_IzokuKousei = function(is_hai) {
		//var iShikyuKigen;
		// 末子との年齢差を算出
		var g_EduPi;
		var AgeGap;
		if (self.MC.get_child_count() > 0){
			g_EduPi = self.MC.get_kyouiku(self.MC.get_child_count());
			if (is_hai) {
				AgeGap = LPdate.calcAge(self.MC.st_birthday_hai, g_EduPi.ymd_child);
			} else {
				AgeGap = LPdate.calcAge(self.MC.st_birthday_hon, g_EduPi.ymd_child);
			}
		}
		var iShibouAge;
		var iKanyuTsukisu;
		var dIzokuKousei;
		var g_Ci = self.DB.get_cmninfo();
		var index = self.getIndex(is_hai);
		var index_hai = self.getIndex(!is_hai);
		var iAgeGap = 0;
		var iLifespanHai;
		var sex = self.MC.id_sex_hon;

		if (self.MC.is_kekkon()) {
			iAgeGap = LPdate.calcAge(self.MC.st_birthday_hon, self.MC.st_birthday_hai);
		}

		var vIzokuKouseiS = self.vIzokuKouseiS_hon;
		var vIzokuKousei_kafu = self.vIzokuKousei_kafu_hon;
		var vIzokuKousei_sibo = self.vIzokuKousei_sibo_hon;
		//var dIzokuKouseiS = [];
		// 【取得】老齢基礎年金、老齢厚生年金、老齢厚生年金・部分
		var vKisoHai = self.L3.vKiso_hai;
		var vKouseiHon = self.L3.vKousei_hon;
		var vKouseiBuHon = self.L3.vKouseiBu_hon;
		var vKouseiHai = self.L3.vKousei_hai;
		if (is_hai) {
			iAgeGap = -iAgeGap;
			vIzokuKouseiS = self.vIzokuKouseiS_hai;
			vIzokuKousei_kafu = self.vIzokuKousei_kafu_hai;
			vIzokuKousei_sibo = self.vIzokuKousei_sibo_hai;
			// 【取得】老齢基礎年金、老齢厚生年金、老齢厚生年金・部分

			vKisoHai = self.L3.vKiso_hon;
			vKouseiHon = self.L3.vKousei_hai;
			vKouseiBuHon = self.L3.vKouseiBu_hai;
			vKouseiHai = self.L3.vKousei_hon;
			sex = 3 - sex;
		}

		var iBirthM = LPdate.getMon(self.MC.get_st_birthday(is_hai));
		var iSyugyouM = LPdate.getMon(self.MC.get_ym_syugyo(is_hai));

		iShibouAge = self.GetShibouAge();
		var Age = self.MC.get_age(is_hai);

		if (sex === 1) {
			iLifespanHai = self.DB.get_banksetupinfo().age_life_w;
		} else {
			iLifespanHai = self.DB.get_banksetupinfo().age_life_m;
		}
		if (self.MC.get_id_syokugyo(is_hai) === G_syokugyo.KAISYAIN ||
				self.MC.get_id_syokugyo(is_hai) === G_syokugyo.YAKUIN ||
				self.MC.get_id_syokugyo(is_hai) === G_syokugyo.TAI_KAISYAIN ||
				(self.MC.get_id_syokugyo(is_hai) === G_syokugyo.JIEIGYO && self.MC.get_id_kinmu(is_hai) === 1) ||
				(self.MC.get_id_syokugyo(is_hai) === G_syokugyo.MUSYOKU && self.MC.get_id_kinmu(is_hai) === 1)) {
			if (sex === 1) {
				// 【Lifeplan_問題管理票_社内.xls】No.062 対応

				for (var i = Age; i <= Age + 35; i++) {
					if (i >= 100) {
						break;
					}
					if (i >= 65) {
						dIzokuKousei = vKouseiHon[i + index] * 3.0 / 4.0;
					} else if (i >= self.g_PinHon.BubunStAge) {
						dIzokuKousei = vKouseiBuHon[i + index] * 3.0 / 4.0;
					} else {
						if (self.MC.get_id_syokugyo(is_hai) === G_syokugyo.KAISYAIN || self.MC.get_id_syokugyo(is_hai) === G_syokugyo.YAKUIN) {
							iKanyuTsukisu = (i - self.MC.get_age_syugyo(is_hai)) * 12 - (iBirthM > iSyugyouM ? 11 + iSyugyouM - iBirthM : iSyugyouM - iBirthM - 1);

							if (iKanyuTsukisu > 300) {
								dIzokuKousei = self.Calc41_ShibouHyouhou(is_hai, i) * 3.0 / 4.0 * iKanyuTsukisu * g_Ci.ra_sibokousei / 1000.0;

								// 【設定】出力のための計算結果
								vIzokuKousei_sibo[i + index] = self.Calc41_ShibouHyouhou(is_hai, i);
							} else { // 短期要件
								dIzokuKousei = self.Calc41_ShibouHyouhou(is_hai, i);
								dIzokuKousei = dIzokuKousei * 3.0 / 4.0 * 300.0 * g_Ci.ra_sibokousei / 1000.0;

								// 【設定】出力のための計算結果
								vIzokuKousei_sibo[i + index] = self.Calc41_ShibouHyouhou(is_hai, i);
							}
						} else {
							dIzokuKousei = 0;
						}
					}

					// 2021/03/18 支給年数の算出方法を変更
//					if (i - iAgeGap < 30) {
//						if (self.MC.get_child_count() === 0) {
//							iShikyuKigen = i + 4;
//						} else {
//							iShikyuKigen = iLifespanHai + iAgeGap;
//						}
//					} else {
//						iShikyuKigen = iLifespanHai + iAgeGap;
//					}
//
//					dIzokuKouseiS[i + index] = 0;
//
//					for (var j = i; j <= iShikyuKigen; j++) {
//						dIzokuKouseiS[i + index] += dIzokuKousei;
//					}
					var iShikyuNensu = 0;
					if (self.MC.is_kekkon()) {
						if (i - iAgeGap < 30) {
							if (self.MC.get_child_count() === 0){
								iShikyuNensu = 5;
							} else {
								iShikyuNensu = iLifespanHai - (i - iAgeGap);
							}
						} else {
							iShikyuNensu = iLifespanHai - (i - iAgeGap);
						}
					} else if (self.MC.get_child_count() > 0){
						iShikyuNensu = Math.max(19 - (i- AgeGap), 0);
					}

					vIzokuKouseiS[i + index] = dIzokuKousei * iShikyuNensu;

					// 2021/03/18 中高年寡婦加算のロジックを変更。経過的寡婦加算を追加。
//					var dTemp = 0;
//					// 中高年寡婦加算
//
//					if (dIzokuKousei > 0) {
//						dTemp = dIzokuKouseiS[i + index];
//						if (i - iAgeGap >= 40 && i - iAgeGap < 65) {
//							for (var j = i; j <= 64 + iAgeGap; j++) {
//								dIzokuKouseiS[i + index] += g_Ci.sm_kahukasan;
//								//【設定】出力のための計算結果
//								vIzokuKouseiS[i + index] = dIzokuKouseiS[i + index];
//							}
//
//							/* 2014.03.25 コメントアウト
//
//							 // 経過的寡婦加算
//							 if (i - iAgeGap < 100){
//							 if (g_Ci.sm_kahukasan > vKisoHai[i - iAgeGap + index_hai]){
//							 for (var j = 65 - iAgeGap; j <= iLifespanHai + iAgeGap;j++){
//							 dIzokuKouseiS[i + index] += g_Ci.sm_kahukasan - vKisoHai[i - iAgeGap + index_hai];
//							 //【設定】出力のための計算結果
//							 vIzokuKouseiS[i + index] = dIzokuKouseiS[i + index];
//							 }
//							 }
//							 }
//							 */
//						} else {
//							if (self.MC.get_child_count() > 0) {
//								var g_EduPi = self.MC.get_kyouiku(self.MC.get_child_count());
//								var AgeGap = LPdate.calcAge(self.MC.st_birthday_hon, g_EduPi.ymd_child);
//
//								if (AgeGap - iAgeGap > 21) {
//									for (var j = 18 + AgeGap; j <= 64 + iAgeGap; j++) {
//										dIzokuKouseiS[i + index] += g_Ci.sm_kahukasan;
//										//【設定】出力のための計算結果
//										vIzokuKouseiS[i + index] = dIzokuKouseiS[i + index];
//									}
//
//									/* 2014.03.25 コメントアウト
//
//									 // 経過的寡婦加算
//									 if (i - iAgeGap < 100){
//									 if (g_Ci.sm_kahukasan > vKisoHai[i - iAgeGap + index_hai]){
//									 for (var j = 65 - iAgeGap;j <= iLifespanHai + iAgeGap;j++){
//									 dIzokuKouseiS[i + index] += g_Ci.sm_kahukasan - vKisoHai[i - iAgeGap + index_hai];
//									 //【設定】出力のための計算結果
//									 vIzokuKouseiS[i + index] = dIzokuKouseiS[i + index];
//									 }
//									 }
//									 }
//									 */
//								}
//							}
//						}
//
//						/*
//						 // 併給調整
//						 if (self.MC.get_id_syokugyo(!is_hai) === G_syokugyo.KAISYAIN || self.MC.get_id_syokugyo(!is_hai) === G_syokugyo.YAKUIN || self.MC.get_id_syokugyo(!is_hai) === G_syokugyo.TAI_KAISYAIN){
//						 if (dIzokuKousei / 3.0 > vKouseiHai[i - iAgeGap + index_hai] / 2){
//						 for (var j = 65 - iAgeGap;j <= iLifespanHai + iAgeGap;j++){
//						 dIzokuKouseiS[i + index] += - vKouseiHai[i - iAgeGap + index_hai];
//						 //【設定】出力のための計算結果
//						 vIzokuKouseiS[i + index] = dIzokuKouseiS[i + index];
//						 }
//						 }else{
//						 for (var j = 65 - iAgeGap;j <= iLifespanHai + iAgeGap;j++){
//						 dIzokuKouseiS[i + index] += - (dIzokuKousei / 3.0 + vKouseiHai[i - iAgeGap + index_hai] / 2.0);
//						 //【設定】出力のための計算結果
//						 vIzokuKouseiS[i + index] = dIzokuKouseiS[i + index];
//						 }
//						 }
//						 }
//						 */
//						// 【Web版LifePlan_課題管理.xml】No.9 対応 START
//						//vIzokuKousei_kafu[i + index] = vIzokuKouseiS[i + index] - dTemp;
//						 vIzokuKousei_kafu[i + index] = dIzokuKouseiS[i + index] - dTemp;
//						// 【Web版LifePlan_課題管理.xml】No.9 対応 END
//
//					}

					// 中高年寡婦加算
					//   配偶者が40歳～64歳、子供が高校卒業相当
					if (dIzokuKousei > 0) {
						for (var p = 0; p <= 64 - (i- iAgeGap); p++) {
							if (i - AgeGap + p > 18 &&
							    i - iAgeGap + p >= 40) {
								vIzokuKousei_kafu[i + index] += g_Ci.sm_kahukasan;
							}
						}
					}

					// 経過的寡婦加算
					//   配偶者が65歳以上。配偶者の生年月日 <= 19560401
					var birthday_hai = 99991231;
					if ( self.MC.is_kekkon() ){
						birthday_hai = is_hai ? self.MC.st_birthday_hai : self.MC.st_birthday_hon;
					}
					if (dIzokuKousei > 0) {
						if (g_Ci.sm_kahukasan > vKisoHai[i - iAgeGap + index_hai] && birthday_hai <= 19560401){
							for (var j = Math.max(65, i - iAgeGap );j <= iLifespanHai;j++){
								vIzokuKousei_kafu[i + index] += g_Ci.sm_kahukasan - vKisoHai[i - iAgeGap + index_hai];
							}
						}
					}

					vIzokuKouseiS[i + index] += vIzokuKousei_kafu[i + index];

				}
			}
		}
	};

	// 計算式（40）遺族共済年金

	p.Calc40_IzokuKyousai = function(is_hai) {
		// 末子との年齢差を算出
		var g_EduPi;
		var AgeGap;
		if (self.MC.get_child_count() > 0){
			g_EduPi = self.MC.get_kyouiku(self.MC.get_child_count());
			if (is_hai) {
				AgeGap = LPdate.calcAge(self.MC.st_birthday_hai, g_EduPi.ymd_child);
			} else {
				AgeGap = LPdate.calcAge(self.MC.st_birthday_hon, g_EduPi.ymd_child);
			}
		}
		var g_Ci = self.DB.get_cmninfo();
		var g_Bsi = self.DB.get_banksetupinfo();

		var iBirthM = LPdate.getMon(self.MC.get_st_birthday(is_hai));
		var iSyugyouM = LPdate.getMon(self.MC.get_ym_syugyo(is_hai));
		var iAgeGap = LPdate.calcAge(self.MC.st_birthday_hon, self.MC.st_birthday_hai);

		var iShibouAge = self.GetShibouAge();
		var Age = self.MC.get_age(is_hai);
		var index = self.getIndex(is_hai);
		var index_hai = self.getIndex(!is_hai);
		var dIzokuKyousai;
		var iKanyuTsukisu;
		//var iShikyuKigen;
		var iLifespanHai;
		var sex = self.MC.id_sex_hon;

		var vIzokuKyousaiS = self.vIzokuKyousaiS_hon;
		var vIzokuKyousai_kafu = self.vIzokuKyousai_kafu_hon;
		var vIzokuKyousai_sibo = self.vIzokuKyousai_sibo_hon;
		// 【取得】老齢基礎年金、老齢厚生年金、老齢厚生年金・部分

		var vKisoHai = self.L3.vKiso_hai;
		var vKyousaiHon = self.L3.vKyousai_hon;
		var vKyousaiBuHon = self.L3.vKyousaiBu_hon;
		if (is_hai) {
			iAgeGap = -iAgeGap;
			vIzokuKyousaiS = self.vIzokuKyousaiS_hai;
			vIzokuKyousai_kafu = self.vIzokuKyousai_kafu_hai;
			vIzokuKyousai_sibo = self.vIzokuKyousai_sibo_hai;
			// 【取得】老齢基礎年金、老齢厚生年金、老齢厚生年金・部分

			vKisoHai = self.L3.vKiso_hon;
			vKyousaiHon = self.L3.vKyousai_hai;
			vKyousaiBuHon = self.L3.vKyousaiBu_hai;
			sex = 3 - sex;
		}

		if (sex === 1) {
			iLifespanHai = self.DB.get_banksetupinfo().age_life_w;
		} else {
			iLifespanHai = self.DB.get_banksetupinfo().age_life_m;
		}
		if (self.MC.get_id_syokugyo(is_hai) === G_syokugyo.KOMUIN
				|| self.MC.get_id_syokugyo(is_hai) === G_syokugyo.TAI_KOMUIN
				|| (self.MC.get_id_syokugyo(is_hai) === G_syokugyo.JIEIGYO && self.MC.get_id_kinmu(is_hai) === 2)
				|| (self.MC.get_id_syokugyo(is_hai) === G_syokugyo.MUSYOKU && self.MC.get_id_kinmu(is_hai) === 2)) {
			if (sex === 1) {
				// 【Lifeplan_問題管理票_社内.xls】No.062 対応

				for (var i = Age; i < Age + 35; i++) {
					if (i >= 100) {
						break;
					}

					if (i >= 65) {
						dIzokuKyousai = vKyousaiHon[i + index] * 3.0 / 4.0;
					} else if (i >= self.g_PinHon.BubunStAge) {
						dIzokuKyousai = vKyousaiBuHon[i + index] * 3.0 / 4.0;
					} else {
						// 2021/03/17 KAISYAIN, YAKUIN -> KOMUIN
						//if (self.MC.get_id_syokugyo(is_hai) === G_syokugyo.KAISYAIN || self.MC.get_id_syokugyo(is_hai) === G_syokugyo.YAKUIN) {
						if (self.MC.get_id_syokugyo(is_hai) === G_syokugyo.KOMUIN) {
							iKanyuTsukisu = (i - self.MC.get_age_syugyo(is_hai)) * 12 - (iBirthM > iSyugyouM ? 11 + iSyugyouM - iBirthM : iSyugyouM - iBirthM - 1);

							if (iKanyuTsukisu > 300) {
								dIzokuKyousai = self.Calc41_ShibouHyouhou(is_hai, i) * 3.0 / 4.0 * iKanyuTsukisu * (g_Ci.ra_sibokousei + g_Ci.ra_sibokyousai) / 1000.0;

								// 【設定】出力のための計算結果
								vIzokuKyousai_sibo[i + index] = self.Calc41_ShibouHyouhou(is_hai, i);
							} else { // 短期要件
								if (iKanyuTsukisu >= 240) {
									dIzokuKyousai = self.Calc41_ShibouHyouhou(is_hai, i) * 3.0 / 4.0 * 300.0 * (g_Ci.ra_sibokousei + g_Ci.ra_sibokyousai) / 1000.0;

									// 【設定】出力のための計算結果
									vIzokuKyousai_sibo[i + index] = self.Calc41_ShibouHyouhou(is_hai, i);
								} else {
									dIzokuKyousai = self.Calc41_ShibouHyouhou(is_hai, i) * 3.0 / 4.0 * 300.0 * (g_Ci.ra_sibokousei + g_Ci.ra_sibokyousai_tanki) / 1000.0;

									// 【設定】出力のための計算結果
									vIzokuKyousai_sibo[i + index] = self.Calc41_ShibouHyouhou(is_hai, i);
								}
							}
						} else {
							dIzokuKyousai = 0;
						}
					}

					// 2021/03/18 支給年数の算出方法を変更
//					if (i - iAgeGap < 30) {
//						if (self.MC.get_child_count() === 0) {
//							iShikyuKigen = i + 4;     //5年間の有期支給
//						} else {
//							iShikyuKigen = iLifespanHai + iAgeGap;
//						}
//					} else {
//						iShikyuKigen = iLifespanHai + iAgeGap;
//					}
//
//					vIzokuKyousaiS[i + index] = 0;
//					for (var j = i; j <= iShikyuKigen; j++) {
//						vIzokuKyousaiS[i + index] += dIzokuKyousai;
//					}
					var iShikyuNensu = 0;
					if (self.MC.is_kekkon()) {
						if (i - iAgeGap < 30) {
							if (self.MC.get_child_count() === 0){
								iShikyuNensu = 5;
							} else {
								iShikyuNensu = iLifespanHai - (i - iAgeGap);
							}
						} else {
							iShikyuNensu = iLifespanHai - (i - iAgeGap);
						}
					} else if (self.MC.get_child_count() > 0){
						iShikyuNensu = Math.max(19 - (i- AgeGap), 0);
					}

					vIzokuKyousaiS[i + index] = dIzokuKyousai * iShikyuNensu;

					// 2021/03/18 中高年寡婦加算のロジックを変更。経過的寡婦加算を追加。
//					var dTemp = 0;
//					// 中高年寡婦加算
//
//					if (dIzokuKyousai > 0) {
//						dTemp = vIzokuKyousaiS[i + index];
//						if (i - iAgeGap >= 40 && i - iAgeGap < 65) {
//							for (var j = i; j < 64 + iAgeGap; j++) {
//								vIzokuKyousaiS[i + index] += g_Ci.sm_kahukasan;
//							}
//
//							/* 2014.03.25
//							 // 経過的寡婦加算
//							 if (i - iAgeGap < 100){
//							 if (g_Ci.sm_kahukasan > vKisoHai[i - iAgeGap + index_hai]){
//							 for (var j = 65 - iAgeGap;j < iLifespanHai + iAgeGap;j++){
//							 vIzokuKyousaiS[i + index] += g_Ci.sm_kahukasan - vKisoHai[i - iAgeGap + index_hai];
//							 }
//							 }
//							 }
//							 */
//						} else {
//							if (self.MC.get_child_count() > 0) {
//								var g_EduPi = self.MC.get_kyouiku(self.MC.get_child_count());
//								var AgeGap = LPdate.calcAge(self.MC.st_birthday_hon, g_EduPi.ymd_child);
//
//								if (AgeGap - iAgeGap > 21) {
//									for (var j = 18 + AgeGap; j < 64 + iAgeGap; j++) {
//										vIzokuKyousaiS[i + index] += g_Ci.sm_kahukasan;
//									}
//
//									/* 2014.03.25
//									 // 経過的寡婦加算
//									 if (i - iAgeGap < 100){
//									 if (g_Ci.sm_kahukasan > vKisoHai[i - iAgeGap + index_hai]){
//									 for (var j = 65 - iAgeGap;j < iLifespanHai + iAgeGap;j++){
//									 vIzokuKyousaiS[i + index] += g_Ci.sm_kahukasan - vKisoHai[i - iAgeGap + index_hai];
//									 }
//									 }
//									 }
//									 */
//
//								}
//							}
//						}
//					}
//					vIzokuKyousai_kafu[i + index] = vIzokuKyousaiS[i + index] - dTemp;

					// 中高年寡婦加算
					//   配偶者が40歳～64歳、子供が高校卒業相当
					if (dIzokuKyousai > 0) {
						for (var p = 0; p <= 64 - (i- iAgeGap); p++) {
							if (i - AgeGap + p > 18 &&
							    i - iAgeGap + p >= 40) {
								vIzokuKyousai_kafu[i + index] += g_Ci.sm_kahukasan;
							}
						}
					}

					// 経過的寡婦加算
					//   配偶者が65歳以上。配偶者の生年月日 <= 19560401
					var birthday_hai = 99991231;
					if ( self.MC.is_kekkon() ){
						birthday_hai = is_hai ? self.MC.st_birthday_hai : self.MC.st_birthday_hon;
					}
					if (dIzokuKyousai > 0) {
						if (g_Ci.sm_kahukasan > vKisoHai[i - iAgeGap + index_hai] && birthday_hai <= 19560401) {
							for (var j = Math.max(65, i - iAgeGap );j <= iLifespanHai;j++) {
								vIzokuKyousai_kafu[i + index] += g_Ci.sm_kahukasan - vKisoHai[i - iAgeGap + index_hai];
							}
						}
					}

					vIzokuKyousaiS[i + index] += vIzokuKyousai_kafu[i + index];

				}
			}
		}
	};

	// 計算式（41）死亡時標準報酬額

	p.Calc41_ShibouHyouhou = function(is_hai, pShibouAge) {
		var vNensyu = [];
		var iKinzoku;
		var dSumHousyu;
		var dShibouHyouhou;
		var index = self.getIndex(is_hai);
		var g_Ci = self.DB.get_cmninfo();

		// 【取得】将来年収額

		vNensyu = self.L1.vNensyu_hon;
		if (is_hai) {
			vNensyu = self.L1.vNensyu_hai;
		}

		iKinzoku = 0;
		dSumHousyu = 0;

		for (var i = self.MC.get_age_syugyo(is_hai); i < pShibouAge; i++) {
			if (i < 20) {
				continue;
			}
			if (vNensyu[i + index] > 0) {
				if (vNensyu[i + index] / 12 >= g_Ci.sm_koseihyoho_upper) {
					dSumHousyu = dSumHousyu + g_Ci.sm_koseihyoho_upper;
				} else if (vNensyu[i + index] / 12 < g_Ci.sm_koseihyoho_lower) {
					dSumHousyu = dSumHousyu + g_Ci.sm_koseihyoho_lower;
				} else {
					// 2021/03/25 年収を単純に12で割るように仕様変更
					//dSumHousyu = dSumHousyu + Util.excelMin(vNensyu[i + index] / 15.6, g_Ci.sm_koseihyoho_upper) * 1.3;
					dSumHousyu = dSumHousyu + vNensyu[i + index] / 12;
				}

				iKinzoku = iKinzoku + 1;
			}
		}
		// 20160517_Web版lifeplan対応_結合-027_start
		//dShibouHyouhou = dSumHousyu / iKinzoku;
		if (iKinzoku !== 0) {
			dShibouHyouhou = dSumHousyu / iKinzoku;
		} else {
			dShibouHyouhou = 0;
		}
		// 20160517_Web版lifeplan対応_結合-027_end

		return dShibouHyouhou;
	};

	// 計算式（42）寡婦年金

	p.Calc42_Kafunenkin = function(is_hai) {
		var iAgeGap = LPdate.calcAge(self.MC.st_birthday_hon, self.MC.st_birthday_hai);
		var Age = self.MC.get_age(is_hai);
		var index = self.getIndex(is_hai);
		var g_Ci = self.DB.get_cmninfo();
		var vIzokuKiso = self.vIzokuKiso_hon;
		var vIzokuKouseiS = self.vIzokuKouseiS_hon;
		var vIzokuKyousaiS = self.vIzokuKyousaiS_hon;
		var vKafunenkin = self.vKafunenkin_hon;
		var sex = self.MC.id_sex_hon;

		if (is_hai) {
			vIzokuKiso = self.vIzokuKiso_hai;
			vIzokuKouseiS = self.vIzokuKouseiS_hai;
			vIzokuKyousaiS = self.vIzokuKyousaiS_hai;
			vKafunenkin = self.vKafunenkin_hai;
			sex = 3 - sex;
		}

		if (sex === 1 && self.MC.is_kekkon()) {
			// 【Lifeplan_問題管理票_社内.xls】No.062 対応

			for (var i = Age; i <= Age + 35; i++) {
				if (i >= 100) {
					break;
				}
				vKafunenkin[i + index] = 0;

				if (vIzokuKiso[i + index] + vIzokuKouseiS[i + index] + vIzokuKyousaiS[i + index] === 0) {
					if (i - iAgeGap >= 60 && i - iAgeGap < 65) {
						for (var j = i + iAgeGap; j <= 64 + iAgeGap; j++) {
							vKafunenkin[i + index] += g_Ci.sm_roureikiso * 3.0 / 4.0;
						}
					}
				}
			}
		}
	};

	// 死亡年齢を取得する

	p.GetShibouAge = function() {
		var dShisyutsuMax;
		var dShibouAge;
		var index = self.getIndex(false);

		var vShisyutsu = self.L6.vShisyutsu;

		dShisyutsuMax = 0;
		dShibouAge = 0;

		for (var i = 20; i < 100; i++) {
			if (dShisyutsuMax < vShisyutsu[i + index]) {
				dShisyutsuMax = vShisyutsu[i + index];
				dShibouAge = i;
			}
		}

		return dShibouAge;
	};

//	// 遺族基礎年金を取得する
//
//	p.GetIzokuKiso(is_hai){
//		return is_hai ? self.vIzokuKiso_hai : self.vIzokuKiso_hon;
//	}
//
//	// 遺族厚生年金を取得する
//
//	p.GetIzokuKousei(is_hai){
//	    return is_hai ? self.vIzokuKouseiS_hai : self.vIzokuKouseiS_hon;
//	}
//
//	// 遺族共済年金を取得する
//
//	p.GetIzokuKyousai(is_hai){
//		return is_hai ? self.vIzokuKyousaiS_hai : self.vIzokuKyousaiS_hon;
//	}
//
//	// 寡婦年金を取得する
//
//	public double[] GetKafu(is_hai){
//		return is_hai ? self.vKafunenkin_hai : self.vKafunenkin_hon;
//	}

	p.dump = function(context, is_hai) {
		var result = [];
		if (!is_hai) {
			result[0] = "7:ご本人様：遺族基礎年金\t";
			result[1] = "7:ご本人様：遺族厚生年金\t";
			result[2] = "7:ご本人様：遺族厚生年金_寡婦加算\t";
			result[3] = "7:ご本人様：遺族厚生年金_死亡時標準報酬額\t";
			result[4] = "7:ご本人様：遺族共済年金\t";
			result[5] = "7:ご本人様：遺族共済年金_寡婦加算\t";
			result[6] = "7:ご本人様：遺族共済年金_死亡時標準報酬額\t";
			result[7] = "7:ご本人様：寡婦年金\t";
		} else {
			result[0] = "7:配偶者様：遺族基礎年金\t";
			result[1] = "7:配偶者様：遺族厚生年金\t";
			result[2] = "7:配偶者様：遺族厚生年金_寡婦加算\t";
			result[3] = "7:配偶者様：遺族厚生年金_死亡時標準報酬額\t";
			result[4] = "7:配偶者様：遺族共済年金\t";
			result[5] = "7:配偶者様：遺族共済年金_寡婦加算\t";
			result[6] = "7:配偶者様：遺族共済年金_死亡時標準報酬額\t";
			result[7] = "7:配偶者様：寡婦年金\t";
		}

		for (var i = 0; i < self.mDataLength; i++) {
			if (!is_hai) {
				result[0] += (self.vIzokuKiso_hon[i]) + "\t";
				result[1] += (self.vIzokuKouseiS_hon[i]) + "\t";
				result[2] += (self.vIzokuKousei_kafu_hon[i]) + "\t";
				result[3] += (self.vIzokuKousei_sibo_hon[i]) + "\t";
				result[4] += (self.vIzokuKyousaiS_hon[i]) + "\t";
				result[5] += (self.vIzokuKyousai_kafu_hon[i]) + "\t";
				result[6] += (self.vIzokuKyousai_sibo_hon[i]) + "\t";
				result[7] += (self.vKafunenkin_hon[i]) + "\t";
			} else {
				result[0] += (self.vIzokuKiso_hai[i]) + "\t";
				result[1] += (self.vIzokuKouseiS_hai[i]) + "\t";
				result[2] += (self.vIzokuKousei_kafu_hai[i]) + "\t";
				result[3] += (self.vIzokuKousei_sibo_hai[i]) + "\t";
				result[4] += (self.vIzokuKyousaiS_hai[i]) + "\t";
				result[5] += (self.vIzokuKyousai_kafu_hai[i]) + "\t";
				result[6] += (self.vIzokuKyousai_sibo_hai[i]) + "\t";
				result[7] += (self.vKafunenkin_hai[i]) + "\t";
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

		data.vIzokuKiso_hon = self.vIzokuKiso_hon;
		data.vIzokuKouseiS_hon = self.vIzokuKouseiS_hon;
		data.vIzokuKousei_kafu_hon = self.vIzokuKousei_kafu_hon;
		data.vIzokuKousei_sibo_hon = self.vIzokuKousei_sibo_hon;
		data.vIzokuKyousaiS_hon = self.vIzokuKyousaiS_hon;
		data.vIzokuKyousai_kafu_hon = self.vIzokuKyousai_kafu_hon;
		data.vIzokuKyousai_sibo_hon = self.vIzokuKyousai_sibo_hon;
		data.vKafunenkin_hon = self.vKafunenkin_hon;

		data.vIzokuKiso_hai = self.vIzokuKiso_hai;
		data.vIzokuKouseiS_hai = self.vIzokuKouseiS_hai;
		data.vIzokuKousei_kafu_hai = self.vIzokuKousei_kafu_hai;
		data.vIzokuKousei_sibo_hai = self.vIzokuKousei_sibo_hai;
		data.vIzokuKyousaiS_hai = self.vIzokuKyousaiS_hai;
		data.vIzokuKyousai_kafu_hai = self.vIzokuKyousai_kafu_hai;
		data.vIzokuKyousai_sibo_hai = self.vIzokuKyousai_sibo_hai;
		data.vKafunenkin_hai = self.vKafunenkin_hai;

		LIFEPLAN.conf.storage.setItem("Logic07", JSON.stringify(data));
	};

	return Logic07;
})();