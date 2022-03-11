/* global LIFEPLAN */

/**
 * (5) 将来生活費推計

 * 【計算】依存関係：（6） 資金収支＆資金残高推計ロジック
 */
"use strict";

// public class Logic05 extends BaseCalc
LIFEPLAN.calc.Logic05 = (function() {

	var self;
	var G_syokugyo = new LIFEPLAN.db.LifePlanDB().G_syokugyo;
	var LPdate = new LIFEPLAN.db.LifePlanDB().LPdate;
	var Util = new LIFEPLAN.util.Util();

	var Logic05 = function(db) {
		self = this;
		LIFEPLAN.calc.BaseCalc.call(self, db);
		//出力値
//		self.vSyunyu = [];					//年間収入
//		self.vZeibikiTaikin_hon = [];		//ご本人様_税引後退職金
//		self.vZeibikiTaikin_hai = [];		//配偶者様_税引後退職金
		self.dSyunyu = [];					//手取り収入額（月額）
		self.dJyutaku = [];					//住宅費月額
		self.dKyouiku = [];					//教育費月額
		self.dSaving = [];					//毎月の貯蓄・積立額
		self.dSeikatsu = [];				//基本生活費（月額）
//		self.dTaiSeikatsu = [];				//退職後生活費  配列変数 dTaiSeikatsu[] は削除し、既存の dSeikatsu[] で代用する。
		self.dInsfee = [];				//生命・損保保険料（月額）
		self.vCpi = [];					//CPI
		self.vSeikatsuFu = [];				//将来生活費
		self.vKyouikuCpi = [];			//教育CPI
		self.vKyouiku = [];					//将来教育費
		self.vSyohiyo = [];					//諸費用・初期値
		self.vJikoshikin = [];				//自己資金
		self.vLA = [];						//借入残高
		self.vYR = [];						//年返済額
		self.vLoanGenzei = [];				//住宅ローン所得税減税額
		self.vChikaCpi = [];				//地価CPI
		self.vJyutaku = [];					//将来住宅費
		self.vEvent = [];					//将来イベント費用
		self._KansaiAge = 0;  				//完済年齢

		self.vMR = [];  				//月返済額
		self.mTR = 0;  				//返済総額
		self.mSogakuhi = 0;  				//総額比
		self.AR = 0;  				//繰上返済額
		self.B = 0;  				//賞与時加算額

		self.school = [];  				//教育イベント出力
		self.innerSchool = {};  				//教育イベント出力用

		self.L6;
		// 2021/03/26 logic09 の変数を参照する。calc.js の中で参照できるように設定する。
		self.L9;
	};

	LIFEPLAN.module.inherits(Logic05, LIFEPLAN.calc.BaseCalc);

	var p = Logic05.prototype;

//	@Override
	p.setupData = function() {
		LIFEPLAN.calc.BaseCalc.prototype.setupData.call();

		if (self.mDataLength === 0) {
			return;
		}
//		self.vSyunyu = self.makeArrayBuffer();
//		self.vZeibikiTaikin_hon = self.makeArrayBuffer();
//		self.vZeibikiTaikin_hai = self.makeArrayBuffer();
		self.dSyunyu = self.makeArrayBuffer();
		self.dJyutaku = self.makeArrayBuffer();
		self.dKyouiku = self.makeArrayBuffer();
		self.dSaving = self.makeArrayBuffer();
		self.dInsfee = self.makeArrayBuffer();
		self.dSeikatsu = self.makeArrayBuffer();
//		self.dTaiSeikatsu = self.makeArrayBuffer();
		self.vCpi = self.makeArrayBuffer();
		self.vSeikatsuFu = self.makeArrayBuffer();
		self.vKyouikuCpi = self.makeArrayBuffer();
		self.vKyouiku = self.makeArrayBuffer();
		self.vSyohiyo = self.makeArrayBuffer();
		self.vJikoshikin = self.makeArrayBuffer();
		self.vLA = self.makeArrayBuffer();
		self.vYR = self.makeArrayBuffer();
		self.vLoanGenzei = self.makeArrayBuffer();
		self.vChikaCpi = self.makeArrayBuffer();
		self.vJyutaku = self.makeArrayBuffer();
		self.vEvent = self.makeArrayBuffer();
		self.vMR = self.makeArrayBuffer();
	};

	p.logic05_Go = function() {
		self.Calc28_Jyutaku();
		self.Calc23_Kyouiku();
		// 2021/03/26 基本生活費（月額）」画面で使用する項目をCalc20_Seikatsu()の中から削除し、
		//   新たにCalc_Seikatsu_Month()を定義し、その中で計算するように修正
		// self.Calc20_Seikatsu();
		self.Calc22_Seikatsu();
		self.SetEvent();
		self.Calc29_EventCost();
		self.Calc_Seikatsu_Month();
	};

	// 計算式（24）諸費用・初期値
	p.Calc24_Syohiyo = function(pYosan) {
		var dJyutakuHiyoRateE;
		var dSyohiyo;

		// 2021/02/22 self.MC.sm_jyutakukeihi が初期値の場合のみ、予算×住宅購入初期費用率を戻すように修正
		//            self.MC.sm_jyutakukeihi は lp_modelcase.json:sm_jyutakukeihi または 住宅プラン画面で編集した値
		if( self.MC.sm_jyutakukeihi > 0) {
			dSyohiyo = self.MC.sm_jyutakukeihi;
		} else {
			dJyutakuHiyoRateE = self.DB.get_banksetupinfo().ra_housecost_early;
			dSyohiyo = Util.excelRound(pYosan * dJyutakuHiyoRateE, 0);
		}

		self.vSyohiyo[self.MC.age_hon + self.getIndex(false)] = dSyohiyo;

		return dSyohiyo;
	};

	// 計算式（25）自己資金
	p.Calc25_Jikoshikin = function(pYosan) {
		var dSyohiyo;
		var dJikoshikin;
		self.mSogakuhi = 0;

		dSyohiyo = self.Calc24_Syohiyo(pYosan);

		dJikoshikin = pYosan + dSyohiyo - self.MC.sm_kariire;

		// 2021/04/12 現況住まいが自宅の場合、本年の自己資金はゼロにするよう修正。自宅は過去に購入したもの。
		if (self.MC.id_lives === 1) {
			dJikoshikin = 0;
		}

		self.vJikoshikin[self.MC.age_hon + self.getIndex(false)] = dJikoshikin;

		if (pYosan + dSyohiyo !== 0) {
			self.mSogakuhi = dJikoshikin / (pYosan + dSyohiyo);
		}

		return dJikoshikin;
	};

	//計算式（26）ローン返済計画
	p.Calc26_LoanHensai = function() {
		var i;//' ループ
		var j;//           As Integer  ' ループ
		var arrR = [];
		var arrS = [];//     As Double   ' 適用開始
		var AG;//          As Integer  ' 購入年齢
		var Y;//           As Integer  ' 返済期間
		var LA;//          As Double   ' 借入金額
		var LB;//          As Double   ' 賞与返済残高
		var T;//           As Integer  ' 賞与時加算回数
		var AY;//          As Integer  ' 繰上返済期間
		var MR;//          As Double   ' 月間返済額
		var YR;//          As Double   ' 年間返済額
		var r;//           As Double   ' 借入金利月率
		var q;//           As Double   ' 賞与返済利率
		var p;//           As Integer  ' 適用期間
		var k;//           As Integer

		var index = self.getIndex(false);

		if (self.MC.age_jyutaku === 0) {
			return;
		}

		//' 【設定】ローン返済計画情報
		AG = self.MC.age_jyutaku;
		Y = self.MC.no_hensai;
		YR = 0;
		arrS[1] = self.MC.no_kariirekinri2;
		arrS[2] = self.MC.no_kariirekinri3;
		arrS[3] = 0;
		arrR[0] = self.MC.ra_kariirekinri1;
		arrR[1] = self.MC.ra_kariirekinri2;
		arrR[2] = self.MC.ra_kariirekinri3;
		arrR[3] = 0;
		LA = self.MC.sm_kariire;
		T = self.MC.id_syouyo;
		if (T === 0) {
			return;
		}
		self.B = self.MC.sm_syouyo;
		AY = self.MC.y_kuriage;
		self.AR = self.MC.sm_kuriage;

		k = 0;
		self.mTR = 0;

		for (i = 0; i < 3; i++) {
			if (i === 0 || arrS[i] > 0) {
				r = Math.pow(1.0 + arrR[i], 1.0 / 12.0);
				q = Math.pow(1.0 + arrR[i], 1.0 / T);
				LB = Util.excelRoundUp((self.B * (Math.pow(1.0 / q, (Y - k) * T + 1.0) - 1.0 / q) / (1.0 / q - 1.0)), 3);
				MR = Util.excelRoundUp(((LA - LB) * (1.0 / r - 1.0) / (Math.pow(1 / r, (Y - k) * 12.0 + 1.0) - 1.0 / r)), 3);
				// 2021/03/08 適用期間の取得方法を変更
				//p = (arrS[i + 1] > 0) ? arrS[i + 1] + 1 : Y + 1;
				p = (arrS[i + 1] > 0) ? arrS[i + 1] : Y;

				while (k < p) {
					// 2021/03/08 添え字のインクリメントのタイミングを変更
					//k = k + 1;
					self.vLA[AG + k + index] = LA;
					self.vMR[AG + k + index] = MR;
					self.vYR[AG + k + index] = 0;

					for (j = 1; j <= 12; j++) {
						//' 【計算】給与の返済額

						LA = Util.excelRoundUp(LA * r, 3) - MR;
						self.mTR = self.mTR + MR;
						self.vYR[AG + k + index] = self.vYR[AG + k + index] + MR;

						//' 【計算】賞与の返済額

						if (j % (12 / T) === 0) {
							//' 【Lifeplan_問題管理票_社内.xls】No.076 対応

							if (Util.excelRoundUp(LB * q, 3) >= self.B) {
								LB = Util.excelRoundUp(LB * q, 3) - self.B;
							} else {
								self.B = Util.excelRoundUp(LB * q, 3);
								LB = 0;
							}

							LA = LA - self.B;
							self.mTR = self.mTR + self.B;
							self.vYR[AG + k + index] = self.vYR[AG + k + index] + self.B;
						}

						if (LA <= 0) {
							break;
						}
					}
					// 2021/03/08 添え字のインクリメントのタイミングを変更
					k = k + 1;

					if (k === AY) {
						if (LA <= self.AR) {
							self.AR = LA;
							LA = 0;
							LB = 0;
						} else {
							if (self.MC.id_kuriage === 0) {   // 返済軽減
								if (LB <= self.AR) {
									LA = LA - self.AR;
									// 2021/04/28 賞与時加算：B,賞与返済残高：LB をクリアしないよう修正
									//LB = 0;
									//self.B = 0;
								} else {
									LA = LA - self.AR;
								}
								MR = Util.excelRoundUp(((LA - LB) * (1.0 / r - 1.0) / (Math.pow(1 / r, (Y - k) * 12.0 + 1.0) - 1.0 / r)), 3);

							} else {   // 期間短縮　（繰り上げ）
								LA = LA - self.AR;
								// 【Web版LifePlan_課題管理.xml】No.8 対応 START
								// self.vLA[AG + k + index] = LA;
								// 【Web版LifePlan_課題管理.xml】No.8 対応 END
								// 2021/03/08 返済期間：Y の計算式変更、 賞与返済残高：LB 再計算
//								Y = Util.excelRoundDown(Math.log((MR + (self.B * T) / 12) / ((MR + (self.B * T) / 12) - LA * (r - 1))) / Math.log(r) / 12, 0) + k;
////
////								// Y = Util.excelRoundDown(((Math.log((LA - LB) * (r - 1) / MR) / Math.log(1 / r)) / 12), 0);
								Y = Util.excelRoundDown(
								        (    Math.log( LA*(1-r) / (MR + self.B*T/12) + 1)
								           / Math.log(1/r)
								        )/6
								      , 0
								    );

								LB =Util.excelRoundUp( self.B*(Math.pow(1/q, Y+1) - 1/q) / (1/q - 1) , 3);

								Y = Util.excelRoundUp(
								    (    Math.log(  (LA-LB)*(1-r)/MR + 1)
								       / Math.log(1/r)
								    )  / 12
								  , 0
								) + k;

							}
							//MR = Util.excelRoundUp(((LA - LB) * (1 / r - 1) / (Math.pow(1 / r,(Y - k) * 12 + 1) - 1 / r)), 3);
						}

						self.mTR = self.mTR + self.AR;

						// 2021/03/24 年返済額 YR の更新位置をここに移動
						// 2021/04/28 //繰上返済年については、繰上返済額を年返済額に加算しないように修正
						//self.vYR[AG + k + index] = self.vYR[AG + k + index] + self.AR;
					}

					if (LA <= 0) {
						break;
					}

					// 2021/03/24 年返済額 YR の更新位置を上に移動
//					if (k === AY) {
//						//self.vYR(AG + k - 20) = self.vYR(AG + k - 20) + self.AR
//						self.vYR[AG + k + index] = self.vYR[AG + k + index] + self.AR;
//					}

				}
			}
		}

		self.mTR = self.mTR + LA;
		// 2021/04/28 年返済額 YR の計算式を変更
		//self.vYR[AG + k + index] = YR + LA;
		self.vYR[AG + k - 1 + index] = self.vYR[AG + k - 1 + index] + LA;
		self.vLA[AG + k + index] = 0;
		// 2021/04/28 完済年齢の計算式を変更
		//self._KansaiAge = AG + k;
		self._KansaiAge = AG + k - 1;
	};
	p.Calc27_LoanGenzei = function() {
		var _Age = LPdate.calcAge(self.MC.st_birthday_hon);
		var index = self.getIndex(false);
		var KounyuAge = self.MC.age_jyutaku;
		var KounyuYYYY = LPdate.getYear(self.MC.st_birthday_hon) + KounyuAge;
		if (!self.DB.get_jyutakuloan(KounyuYYYY)) {
			return;
		}
		var iKoujyoKikan = self.DB.get_jyutakuloan(KounyuYYYY).sm_kikan;
		var dSyoKoujyoRate = self.DB.get_jyutakuloan(KounyuYYYY).ra_syotokukojo;
		var dSyoGendo = self.DB.get_jyutakuloan(KounyuYYYY).sm_syotokugendo;

		for (var i = _Age; i <= 99; i++) {
			if (i >= KounyuAge && i < KounyuAge + iKoujyoKikan) {
				self.vLoanGenzei[i + index] = Math.min(self.vLA[i + index] * dSyoKoujyoRate, dSyoGendo);
			}
		}
	};
	p.Calc28_Jyutaku = function() {
		var i;
		var lHouseCost;
		var dRentExp;
		var dCpi;
		var dJikoshikin;

		var _Age = LPdate.calcAge(self.MC.st_birthday_hon);
		var _KounyuAge = self.MC.age_jyutaku;
		var index = self.getIndex(false);

		dJikoshikin = self.Calc25_Jikoshikin(self.MC.sm_jyutakuyosan);

		if (self.MC.id_lives === 1) {
			lHouseCost = self.DB.get_banksetupinfo().sm_housecost;
			/******** 2014/01/20 自宅あり、ローン残ありの住宅費計算ロジック(計算ロジック28)修正 start *******/
//            for (i=_Age;i <= 99;i++){
//                self.vJyutaku[i + index] = Util.excelRound(lHouseCost * self.DB.get_banksetupinfo().ra_housecost_year, 2);
//            }
			if (self.MC.id_jyutakuloan === 1) {
				for (i = _Age; i <= 99; i++) {
					if (i <= self._KansaiAge) {
						self.vJyutaku[i + index] = Util.excelRound(self.vYR[i + index] + (lHouseCost * self.DB.get_banksetupinfo().ra_housecost_year), 2);
					} else {
						self.vJyutaku[i + index] = Util.excelRound(lHouseCost * self.DB.get_banksetupinfo().ra_housecost_year, 2);
					}
				}
			} else {
				for (i = _Age; i <= 99; i++) {
					self.vJyutaku[i + index] = Util.excelRound(lHouseCost * self.DB.get_banksetupinfo().ra_housecost_year, 2);
				}
			}
			/******** 2014/01/20 自宅あり、ローン残ありの住宅費計算ロジック(計算ロジック28)修正 end *******/
		} else {
			dRentExp = self.DB.get_banksetupinfo().no_rent_exp;

			if (self.MC.id_lives_yotei === 1) {
				dCpi = 1;

				for (i = _Age; i <= 99; i++) {
					if (i < _KounyuAge) {
						self.vJyutaku[i + index] = Util.excelRound(self.MC.sm_rent * (12 + dRentExp) * dCpi, 2);
					} else if (i === _KounyuAge) {
						self.vJyutaku[i + index] = Util.excelRound(self.MC.sm_rent * (12 + dRentExp) * dCpi + dJikoshikin, 2);
						// 2021/02/22 支出が住宅費とイベント費（住宅費分）の2重計上にならないよう修正。
						//            ご家族のイベントは SetFamilyEvent を呼ばなくても登録される。
						// self.SetFamilyEvent(i, 0, 2, self.vJyutaku[i + index]);
					} else if (i <= self._KansaiAge) {
						self.vJyutaku[i + index] = Util.excelRound(self.vYR[i + index] + self.MC.sm_jyutakuyosan * self.DB.get_banksetupinfo().ra_housecost_year, 2);
					} else {
						self.vJyutaku[i + index] = Util.excelRound(self.MC.sm_jyutakuyosan * self.DB.get_banksetupinfo().ra_housecost_year, 2);
					}

					//' 【設定】出力のための計算結果
					self.vChikaCpi[i + index] = dCpi;

					dCpi = dCpi * (1 + self.DB.get_banksetupinfo().ra_cpi_chika);
				}
			} else {
				dCpi = 1;

				for (i = _Age; i <= 99; i++) {
					self.vJyutaku[i + index] = Util.excelRound(self.MC.sm_rent * (12 + dRentExp) * dCpi, 2);

					//' 【設定】出力のための計算結果
					self.vChikaCpi[i + index] = dCpi;

					dCpi = dCpi * (1 + self.DB.get_banksetupinfo().ra_cpi_chika);
				}
			}
		}
	};
	p.Calc23_Kyouiku = function() {
		var iAgeGap;
		var index = self.getIndex(false);




		for (var j = 1; j <= self.MC.get_child_count(); j++) {


			var g_EduPi = self.MC.get_kyouiku(j);
			if (g_EduPi === null) {
				break;
			}

			var Age = self.MC.age_hon;

			var iChdBirthY = LPdate.getCurYear() - g_EduPi.age_child;
			var iChdBirthMD = LPdate.getMon(g_EduPi.ymd_child) * 100 + LPdate.getDay(g_EduPi.ymd_child);
			var iHonBirthY = LPdate.getYear(self.MC.st_birthday_hon);

			iAgeGap = iChdBirthY - iHonBirthY - (iChdBirthMD > 401 ? 0 : 1);
			var dCpi = 1.0;

			for (var i = Age; i < 100; i++) {
				self.innerSchool = {};
				if (i >= 19 + iAgeGap) {
					if (i === 19 + iAgeGap) {
						self.SetChildEvent(j, i, "大1");
						self.vKyouiku[i + index] += self.GetKyoikuhi(j, 5, 1) * dCpi;
						self.vKyouiku[i + index] += self.GetKyoikuhi(j, 5, 2) * dCpi;
					} else if (i < 19 + iAgeGap + (g_EduPi.id_college_course === 3 ? 6 : 4)) {
						self.vKyouiku[i + index] += self.GetKyoikuhi(j, 5, 2) * dCpi;
					}
				} else if (i >= 16 + iAgeGap) {
					if (i === 16 + iAgeGap) {
						self.SetChildEvent(j, i, "高1");
						self.vKyouiku[i + index] += self.GetKyoikuhi(j, 4, 1) * dCpi;
					} else if (i < 16 + iAgeGap + 3) {
						self.vKyouiku[i + index] += self.GetKyoikuhi(j, 4, 1) * dCpi;
					}
				} else if (i >= 13 + iAgeGap) {
					if (i === 13 + iAgeGap) {
						self.SetChildEvent(j, i, "中1");
						self.vKyouiku[i + index] += self.GetKyoikuhi(j, 3, 1) * dCpi;
					} else if (i < 13 + iAgeGap + 3) {
						self.vKyouiku[i + index] += self.GetKyoikuhi(j, 3, 1) * dCpi;
					}
				} else if (i >= 7 + iAgeGap) {
					if (i === 7 + iAgeGap) {
						self.SetChildEvent(j, i, "小1");
						self.vKyouiku[i + index] += self.GetKyoikuhi(j, 2, 1) * dCpi;
						// 【Lifeplan_問題管理票_社内.xls】No.039 対応

					} else if (i < 7 + iAgeGap + 6) {
						self.vKyouiku[i + index] += self.GetKyoikuhi(j, 2, 1) * dCpi;
					}
					// 【Lifeplan_問題管理票_社内.xls】No.059 対応

				} else if (i >= 7 - g_EduPi.no_kindergarten + iAgeGap) {
					if (i === 7 - g_EduPi.no_kindergarten + iAgeGap) {
						self.SetChildEvent(j, i, "幼1");
						self.vKyouiku[i + index] += self.GetKyoikuhi(j, 1, 1) * dCpi;
					} else if (i < 7 - g_EduPi.no_kindergarten + iAgeGap + 3) {
						self.vKyouiku[i + index] += self.GetKyoikuhi(j, 1, 1) * dCpi;
					}
				} else if (i === iAgeGap) {
					self.SetChildEvent(j, i, "誕生");
				}

				// 【設定】出力のための計算結果
				self.vKyouikuCpi[i + index] = dCpi;

				dCpi = dCpi * (1 + self.DB.get_banksetupinfo().ra_cpi_kyouiku);
			}
		}
	};
	p.SetChildEvent = function(no_child, age_hon, school) {
		self.innerSchool.no_child = no_child;
		self.innerSchool.age_hon = age_hon;
		self.innerSchool.school = school;
		self.school.push(self.innerSchool);
	};
	p.GetKyoikuhi = function(no_child, id_school, kubun) {
		var kyouiku = self.MC.get_kyouiku(no_child);
		if (kyouiku === null) {
			return 0;
		}
		var id_koushi = 0;
		var no_nenji = 0;
		var id_bunri = 0;

		switch (id_school) {
			case 1:	//幼稚園
				id_koushi = kyouiku.id_kindergarten;
				no_nenji = kyouiku.no_kindergarten;
				id_bunri = 0;
				break;
			case 2: //小学校
				id_koushi = kyouiku.id_primary_school;
				no_nenji = 6;
				id_bunri = 0;
				break;
			case 3: //中学校
				id_koushi = kyouiku.id_junior_high_school;
				no_nenji = 3;
				id_bunri = 0;
				break;
			case 4: //高校
				id_koushi = kyouiku.id_high_school;
				no_nenji = 3;
				id_bunri = 0;
				break;
			case 5: //大学
				id_koushi = kyouiku.id_college;
				id_bunri = kyouiku.id_college_course;
				//【設定】文理区分が3(医歯系)の場合、年次を6に設定

				if (id_bunri === 3) {
					no_nenji = 6;
				} else {
					no_nenji = 4;
				}
				break;
		}

		var kyouikuhi = self.DB.get_kyouikuhi(id_school, id_koushi, no_nenji, id_bunri);
		if (kyouikuhi === null) {
			return 0;
		}
		var iKyouikuhi = 0;
		//大学の場合

		if (id_school === 5) {
			//入学初年度の場合

			if (kubun === 1) {
				iKyouikuhi += kyouikuhi.sm_nyugaku;
				//下宿の場合

				if (kyouiku.id_college_from === 2) {
					iKyouikuhi += kyouikuhi.sm_nyugakuroom;
				}
			} else {
				iKyouikuhi += kyouikuhi.sm_year;
				//下宿の場合

				if (kyouiku.id_college_from === 2) {
					iKyouikuhi += kyouikuhi.sm_room;
				}
			}
		} else {
			iKyouikuhi += kyouikuhi.sm_year;
		}
		return iKyouikuhi;
	};


	// 2021/03/26 （20）基本生活費、（21）退職後生活費の関数の中から、「基本生活費（月額）」画面の項目の計算ロジックを削除

	// （20）基本生活費
	p.Calc20_Seikatsu = function() {
		var dSeikatsuWork = self.MC.sm_kihon;

		if (dSeikatsuWork < 0) {
			dSeikatsuWork = 0;
		}

		//基本生活費編集画面でセットされていたら上書き扱い
		if (self.MC.save_kihon_gen !== -1) {
			dSeikatsuWork = self.MC.save_kihon_gen;
		}
		return dSeikatsuWork;
	};

	// 計算式（21）退職後生活費
	p.Calc21_TaiSeikatsu = function() {
		var dTaiSeikatsu = self.MC.sm_taiseikatu;;

		if (self.MC.save_kihon_tai !== -1) {
			dTaiSeikatsu = self.MC.save_kihon_tai;
		}

		return dTaiSeikatsu;
	};

	// 基本生活費（月額）
	p.Calc_Seikatsu_Month = function() {
		self.Calc_Seikatsu_Month_Age(self.MC.age_hon);
		self.Calc_Seikatsu_Month_Age(self.MC.age_taisyoku_hon);
	};

	// 基本生活費（月額）年齢指定
	p.Calc_Seikatsu_Month_Age = function(Age) {
		var index = self.getIndex(false);

		var iAgeGap = 0;      // 配偶者年齢差 （本人年齢 - 配偶者年齢）
		if (self.MC.is_kekkon()) {
			iAgeGap = LPdate.calcAge(self.MC.st_birthday_hai, self.MC.st_birthday_hon);
		}

		//--------------------------------
		// 手取り収入額（月額）

		//   税引後退職金
		var zeibikiTaikinHon = 0;
		var zeibikiTaikinHai = 0;
		// 2021/04/12 税引後退職金を算出する際の職業判定は Calc34_ZeibikiTaisyoku() の中で行うためここからは削除
		// 2021/03/26 退職年齢になってから退職金をもらうように変更
		//if (Age === self.MC.age_taisyoku_hon - 1) {
		if (Age === self.MC.age_taisyoku_hon) {
			zeibikiTaikinHon = self.L6.Calc34_ZeibikiTaisyoku(false, self.MC.get_sm_taisyoku(false));
		}
		if (self.MC.is_kekkon()) {
			// 2021/04/12 税引後退職金を算出する際の職業判定は Calc34_ZeibikiTaisyoku() の中で行うためここからは削除
			// 2021/03/26 退職年齢になってから退職金をもらうように変更
			//if (Age === self.MC.age_taisyoku_hai + iAgeGap - 1) {
			if (Age === self.MC.age_taisyoku_hai + iAgeGap) {
				zeibikiTaikinHai = self.L6.Calc34_ZeibikiTaisyoku(true, self.MC.get_sm_taisyoku(true));
			}
		}

		//   満期金      配偶者の満期金の添え字は正しい
		var manki = self.L9.vManki_hon[Age + index] + self.L9.vManki_hai[Age + index];

		//   個人年金受給額（月額）
		var kojinNKJ = self.L6.vKojin_hon[Age + index] + self.L6.vKojin_hai[Age + index];

		self.dSyunyu[Age + index] = (self.L6.vSyunyu[Age + index] - zeibikiTaikinHon - zeibikiTaikinHai - manki + kojinNKJ) / 12;

		//--------------------------------
		// 基本生活費（月額）
		self.dSeikatsu[Age + index] = self.vSeikatsuFu[Age + index] / 12;

		//--------------------------------
		// 住宅関連費（月額）
		
		//   自己資金     頭金、初期費用
		var jikosk = Age === self.MC.age_jyutaku ? self.Calc25_Jikoshikin(self.MC.sm_jyutakuyosan) : 0;

		self.dJyutaku[Age + index] = (self.vJyutaku[Age + index] - jikosk) / 12

		//--------------------------------
		// 教育関連費（月額）
		self.dKyouiku[Age + index] = self.vKyouiku[Age + index] / 12;

		//--------------------------------
		// 毎月の貯蓄・積立額
		self.dSaving[Age + index] = self.L6.vTsumitate[Age + index] / 12;

		//--------------------------------
		// 生命・損害保険料（月額）
		self.dInsfee[Age + index] = ( 
		    self.L9.vSeimei_hon[Age + index]
		  + self.L9.vSeimei_hai[Age + index]
		  + self.L9.vKojin_hon[Age + index]
		  + self.L9.vKojin_hai[Age + index]
		  + self.L9.vIryou_hon[Age + index]
		  + self.L9.vKojin_hai[Age + index]
		  + self.L9.vSonota_hon[Age + index]
		  + self.L9.vSonota_hai[Age + index]
		) / 12;

	};

// 2021/03/26 「基本生活費（月額）」画面の項目のロジックをCalc20_Seikatsu()とは別の関数で計算するため、これはコメントアウト
//	// （20）基本生活費
//	p.Calc20_Seikatsu = function() {
//		var Age = self.MC.age_hon;
//		var index = self.getIndex(false);
//		self.vSyunyu[Age + index] = self.L6.vSyunyu[Age + index];
//		var vTsumitate = self.L6.vTsumitate;
//		/*****2014/01/20  基本生活費、退職後生活費の入力欄追加    start***********/
////    	double dHokenryou;
////    	if (!self.MC.is_kekkon()){
////    		dHokenryou= self.L9().vGetsuHo_hon[Age+index]
////                + self.L9().vGetsuHoSonota_hon[Age+index];
////    	}else{
////    		dHokenryou = self.L9().vGetsuHo_hon[Age+index]
////    			+self.L9().vGetsuHo_hai[Age+index]
////            + self.L9().vGetsuHoSonota_hon[Age+index];
////    	}
//		/*****2014/01/20  基本生活費、退職後生活費の入力欄追加    end***********/
//		var iAgeGap = 0;
//
//		if (self.MC.is_kekkon()) {
//			iAgeGap = LPdate.calcAge(self.MC.st_birthday_hai, self.MC.st_birthday_hon);
//		}
//		var dZeibikiTaikinHon = 0;
//		var dZeibikiTaikinHai = 0;
//
//		var dSyunyuWork = self.vSyunyu[Age + index];
//		if (self.MC.id_syokugyo_hon === G_syokugyo.KAISYAIN || self.MC.id_syokugyo_hon === G_syokugyo.YAKUIN || self.MC.id_syokugyo_hon === G_syokugyo.KOMUIN) {
//			// 2021/03/26 退職年齢になってから退職金をもらうように変更
//			//if (Age === self.MC.age_taisyoku_hon - 1) {
//			if (Age === self.MC.age_taisyoku_hon) {
//// 20160517_Web版lifeplan対応_start
////				dZeibikiTaikinHon = this.Calc34_ZeibikiTaisyoku(false, self.MC.get_sm_taisyoku(false));
//				dZeibikiTaikinHon = self.L6.Calc34_ZeibikiTaisyoku(false, self.MC.get_sm_taisyoku(false));
//// 20160517_Web版lifeplan対応_end
//				dSyunyuWork = dSyunyuWork - dZeibikiTaikinHon;
//			}
//		}
//
//		if (self.MC.is_kekkon()) {
//			if (self.MC.id_syokugyo_hai === G_syokugyo.KAISYAIN || self.MC.id_syokugyo_hai === G_syokugyo.YAKUIN || self.MC.id_syokugyo_hai === G_syokugyo.KOMUIN) {
//				// 2021/03/26 退職年齢になってから退職金をもらうように変更
//				//if (Age === self.MC.age_taisyoku_hai + iAgeGap - 1) {
//				if (Age === self.MC.age_taisyoku_hai + iAgeGap) {
//// 20160517_Web版lifeplan対応_start
////					dZeibikiTaikinHai = this.Calc34_ZeibikiTaisyoku(true, self.MC.get_sm_taisyoku(true));
//					dZeibikiTaikinHai = self.L6.Calc34_ZeibikiTaisyoku(true, self.MC.get_sm_taisyoku(true));
//// 20160517_Web版lifeplan対応_end
//
//					dSyunyuWork = dSyunyuWork - dZeibikiTaikinHai;
//				}
//			}
//		}
//
//		dSyunyuWork = dSyunyuWork / 12;
//		var dJyutakuWork = (self.vJyutaku[Age + index] - (Age === self.MC.age_jyutaku ? self.Calc25_Jikoshikin(self.MC.sm_jyutakuyosan) : 0)) / 12;
//		var dKyouikuWork = self.vKyouiku[Age + index] / 12;
//		var dSavingWork = vTsumitate[Age + index] / 12;
//		/*****2014/01/20  基本生活費、退職後生活費の入力欄追加    start***********/
//		//var dSeikatsuWork = dSyunyuWork - dJyutakuWork - dKyouikuWork - dHokenryou - dSavingWork;
//		var dSeikatsuWork = self.MC.sm_kihon;
//		/*****2014/01/20  基本生活費、退職後生活費の入力欄追加    end***********/
//		// 基本生活費のマイナス対応
//
//		if (dSeikatsuWork < 0) {
//			dSeikatsuWork = 0;
//		}
//
//		//基本生活費編集画面でセットされていたら上書き扱い
//
//		if (self.MC.save_kihon_gen !== -1) {
//			dSeikatsuWork = self.MC.save_kihon_gen;
//		}
//
//		//  【設定】出力のための計算結果
//		// iCol = Range("ご本人様_年齢").Find(g_PiHon.Age).Column
//
//		// iRow = Range("ご本人様_年間収入").EntireRow.Row
//		// Cells(iRow, iCol).Value = self.vSyunyu(1, g_PiHon.Age - 19)
//
//		// iRow = Range("ご本人様_税引後退職金").EntireRow.Row
//		// Cells(iRow, iCol).Value = dZeibikiTaikinHon
//		self.vZeibikiTaikin_hon[Age + index] = dZeibikiTaikinHon;
//
//		// iRow = Range("配偶者様_税引後退職金").EntireRow.Row
//		// Cells(iRow, iCol).Value = dZeibikiTaikinHai
//		self.vZeibikiTaikin_hai[Age + index] = dZeibikiTaikinHai;
//
//		// iRow = Range("ご本人様_手取り収入額").EntireRow.Row
//		// Cells(iRow, iCol).Value = dSyunyu
//		self.dSyunyu[Age + index] = dSyunyuWork;
//
//		// iRow = Range("ご本人様_住宅費月額").EntireRow.Row
//		// Cells(iRow, iCol).Value = dJyutaku
//		self.dJyutaku[Age + index] = dJyutakuWork;
//
//		// iRow = Range("ご本人様_教育費月額").EntireRow.Row
//		// Cells(iRow, iCol).Value = dKyouiku
//		self.dKyouiku[Age + index] = dKyouikuWork;
//
//		// iRow = Range("ご本人様_毎月の貯蓄・積立額").EntireRow.Row
//		// Cells(iRow, iCol).Value = dSaving
//		self.dSaving[Age + index] = dSavingWork;
//
//		return dSeikatsuWork;
//	};
//	// 計算式（21）退職後生活費
//	p.Calc21_TaiSeikatsu = function() {
//		/*****2014/01/20  基本生活費、退職後生活費の入力欄追加	start***********/
////    	 double dSeikatsuRate=1;
////
////         //基本生活費編集画面でセットされていたら上書き扱い
//
////
////         if (self.MC.save_kihon_tai !== -1){
////         	return self.MC.save_kihon_tai;
////         }
////
////         double seikatsu = Calc20_Seikatsu();
////
////         switch (self.MC.sm_livingcost){
////             case 0:
////                 dSeikatsuRate = self.DB.get_banksetupinfo().ra_livingcost_many;
////                 break;
////             case 1:
////                 dSeikatsuRate = self.DB.get_banksetupinfo().ra_livingcost_normal;
////                 break;
////             case 2:
////                 dSeikatsuRate = self.DB.get_banksetupinfo().ra_livingcost_few;
////                 break;
////         }
//// 		double dTaiSeikatsu;
//// 		if (self.MC.id_syokugyo_hon === G_syokugyo.TAI_KAISYAIN || self.MC.id_syokugyo_hon === G_syokugyo.TAI_KOMUIN){
//// 			dTaiSeikatsu = self.MC.sm_kihon;
//// 		}else{
//// 			dTaiSeikatsu = Util.excelRoundUp(seikatsu * dSeikatsuRate, 1);
//// 		}
//		var dTaiSeikatsu;
//		//基本生活費編集画面でセットされていたら上書き扱い
//		if (self.MC.save_kihon_tai !== -1) {
//			return self.MC.save_kihon_tai;
//		}
//
//		/*        if (self.MC.id_syokugyo_hon === G_syokugyo.KAISYAIN || self.MC.id_syokugyo_hon === G_syokugyo.YAKUIN
//		 ||self.MC.id_syokugyo_hon === G_syokugyo.KOMUIN || self.MC.id_syokugyo_hon === G_syokugyo.JIEIGYO
//		 || self.MC.id_syokugyo_hon === G_syokugyo.MUSYOKU){
//		 dTaiSeikatsu = self.MC.sm_kihon*0.7;
//		 }else{
//		 dTaiSeikatsu = self.MC.sm_taiseikatu;
//		 }
//		 */
//		// 老後生活費を年齢で判定する
//
//		if (self.MC.age_hon < 60) {
//			// 60歳未満
//			dTaiSeikatsu = self.MC.sm_kihon * 0.7;
//		} else {
//			// 60歳以上
//
//			dTaiSeikatsu = self.MC.sm_taiseikatu;
//		}
//
//		/*****2014/01/20  基本生活費、退職後生活費の入力欄追加	end***********/
//		return dTaiSeikatsu;
//	};

	// 計算式（22）将来生活費推計

	p.Calc22_Seikatsu = function() {
		var iLifespanHon;
		var iLifespanHai;
		var iAgeGap = 0;
		var dCpi;
		var index = self.getIndex(false);
		var Age = self.MC.age_hon;

		if (self.MC.id_sex_hon === 1) {
			iLifespanHon = self.DB.get_banksetupinfo().age_life_m;
			iLifespanHai = self.DB.get_banksetupinfo().age_life_w;
		} else {
			iLifespanHon = self.DB.get_banksetupinfo().age_life_w;
			iLifespanHai = self.DB.get_banksetupinfo().age_life_m;
		}
		if (self.MC.is_kekkon()) {
			iAgeGap = LPdate.calcAge(self.MC.st_birthday_hon, self.MC.st_birthday_hai);
		}

		// 2021/03/26 配列変数 dTaiSeikatsu[] は削除し、既存の dSeikatsu[] で代用する。
		//            ただし、ここでは、基本生活費、退職後生活費は関数Calc20_Seikatsu(),Calc21_TaiSeikatsu()を呼び出して取得する。
		var dTaiSeikatsu = self.Calc21_TaiSeikatsu();
		var dSeikatsu = self.Calc20_Seikatsu();

		dCpi = 1;

		for (var i = Age; i < 100; i++) {
			/*****2014/01/20  退職会社員・公務員の場合の基本生活費未計上の修正  start***********/
//            if (Age < self.MC.age_taisyoku_hon){
			if (i < self.MC.age_taisyoku_hon) {
				self.vSeikatsuFu[i + index] = Util.excelRound(dSeikatsu * 12 * dCpi, 2);
			} else {
				if (self.MC.is_kekkon()) {
					// 2021/03/31 寿命の前年から単身生活比率を掛けてしまっているため、　> → >= 。配偶者寿命 - 配偶者年齢差 → 配偶者寿命 + 配偶者年齢差
					//if (i > Util.excelMin(iLifespanHon, iLifespanHai - iAgeGap)) {
					if (i >= Util.excelMin(iLifespanHon, iLifespanHai + iAgeGap)) {
						self.vSeikatsuFu[i + index] = Util.excelRound(dTaiSeikatsu * 12.0 * self.DB.get_banksetupinfo().ra_livingcost_alone * dCpi, 2);
					} else {
						self.vSeikatsuFu[i + index] = Util.excelRound(dTaiSeikatsu * 12.0 * dCpi, 2);
					}
				} else {
					self.vSeikatsuFu[i + index] = Util.excelRound(dTaiSeikatsu * 12.0 * dCpi, 2);
				}
			}

			// 【設定】出力のための計算結果
			self.vCpi[i + index] = dCpi;

			dCpi = dCpi * (1 + self.DB.get_banksetupinfo().ra_cpi);
//            }
			/*****2014/01/20  退職会社員・公務員の場合の基本生活費未計上の修正  end***********/
		}

	};
	p.SetEvent = function() {

	};
	p.SetFamilyEvent = function(pAge, pJ, pEvent, pYosan) {
		var Age = self.MC.age_hon;
		var index = self.getIndex(false);
		var dCpi = 1;
		var cpi = self.DB.get_banksetupinfo().ra_cpi;

		for (var i = Age; i < 100; i++) {
			if (i === pAge) {
				self.vEvent[pAge + index] += pYosan * dCpi;
			}
			dCpi = dCpi * (1 + cpi);
		}
	};
	p.Calc29_EventCost = function() {
		var Age = self.MC.age_hon;
		var list = self.MC.get_event_list();
		var dCpi = 1;
		var index = self.getIndex(false);
		var cpi = self.DB.get_banksetupinfo().ra_cpi;

		for (var i = Age; i < 100; i++) {
			for (var key in list) {
				var event = list[key];
				if (i === event.no_age) {
					var yosan = event.sm_yosan;
					yosan = yosan * dCpi;
					yosan += +self.vEvent[i + index];
					self.vEvent[i + index] = Util.excelRound(yosan, 2);
				}
			}
			dCpi = dCpi * (1 + cpi);
		}
	};
//    // 計算式（34）税引後退職金
//
//    public double Calc34_ZeibikiTaisyoku(boolean pTyPi_is_hai, long pTaisyokukin){
//    	// vbaでは、第一引数がpTyPiで型はPersonalInfoだが、
//
//    	// Androidでは、第一引数をpTyPi_is_haiとし本人(false)か配偶者(true)とする。
//
//
//        // Dim iSyugyouY           As Integer
//        int iSyugyouY = 0;
//        // Dim iKinzoku            As Integer
//        int iKinzoku = 0;
//        // Dim dTaisyokuKoujyo     As Double
//        double dTaisyokuKoujyo = 0.0;
//        // Dim dTaisyokuSyotoku    As Double
//        double dTaisyokuSyotoku = 0.0;
//        // Dim dZeibikiTaisyoku    As Double
//        double dZeibikiTaisyoku = 0.0;
//
//        // iSyugyouY = Mid(pTyPi.Syugyoday, 1, 4)
//        LPdate lpDate = self.MC.get_ym_syugyo(pTyPi_is_hai);
//        iSyugyouY = LPdate.getYear(lpDate);
//
//        // If pTyPi.Syokugyo = Syokugyou.Kaishain Or pTyPi.Syokugyo = Syokugyou.KaishaYakuin Or pTyPi.Syokugyo = Syokugyou.Koumuin Then
//        int pTyPi_Syokugyo = self.MC.get_id_syokugyo(pTyPi_is_hai);
//        if (pTyPi_Syokugyo === G_syokugyo.KAISYAIN || pTyPi_Syokugyo === G_syokugyo.YAKUIN || pTyPi_Syokugyo === G_syokugyo.KOMUIN){
//            // iKinzoku = WorksheetFunction.Min(pTyPi.TaisyokuAge, 60) - pTyPi.SyugyoAge
//        	int pTyPi_TaisyokuAge = self.MC.get_age_taisyoku(pTyPi_is_hai);
//        	int pTyPi_SyugyoAge = self.MC.get_age_syugyo(pTyPi_is_hai);
//        	iKinzoku = (int)Util.excelMin(pTyPi_TaisyokuAge, 60) - pTyPi_SyugyoAge;
//            // If iKinzoku <= 20 Then
//        	if(iKinzoku <= 20){
//        		// dTaisyokuKoujyo = WorksheetFunction.Max(iKinzoku * 40, 80)
//            	dTaisyokuKoujyo = Util.excelMax(iKinzoku * 40, 80);
//        	// Else
//        	}else{
//        		// dTaisyokuKoujyo = (iKinzoku - 20) * 70 + 800
//            	dTaisyokuKoujyo = (iKinzoku - 20) * 70 + 800;
//        	// End If
//        	}
//
//        	// If pTaisyokukin > dTaisyokuKoujyo Then
//        	if(pTaisyokukin > dTaisyokuKoujyo){
//        		// dTaisyokuSyotoku = (pTaisyokukin - dTaisyokuKoujyo) * 0.5
//            	dTaisyokuSyotoku = (pTaisyokukin - dTaisyokuKoujyo) * 0.5;
//        	// Else
//        	}else{
//        		// dTaisyokuSyotoku = 0
//        		dTaisyokuSyotoku = 0;
//        	// End If
//        	}
//        	// If dTaisyokuSyotoku >= 18000000 Then
//        	if(dTaisyokuSyotoku >= 18000000){
//        		// dZeibikiTaisyoku = pTaisyokukin - (dTaisyokuSyotoku * 0.4 + 2796000)
//        		dZeibikiTaisyoku = pTaisyokukin - (dTaisyokuSyotoku * 0.4 + 2796000);
//        	// ElseIf dTaisyokuSyotoku >= 9000000 Then
//        	}else if(dTaisyokuSyotoku >= 9000000){
//        		// dZeibikiTaisyoku = pTaisyokukin - (dTaisyokuSyotoku * 0.33 + 1536000)
//            	dZeibikiTaisyoku = pTaisyokukin - (dTaisyokuSyotoku * 0.33 + 1536000);
//        	// ElseIf dTaisyokuSyotoku >= 6950000 Then
//        	}else if(dTaisyokuSyotoku >= 6950000){
//        		// dZeibikiTaisyoku = pTaisyokukin - (dTaisyokuSyotoku * 0.23 + 636000)
//            	dZeibikiTaisyoku = pTaisyokukin - (dTaisyokuSyotoku * 0.23 + 636000);
//        	// ElseIf dTaisyokuSyotoku >= 3300000 Then
//        	}else if(dTaisyokuSyotoku >= 3300000){
//        		// dZeibikiTaisyoku = pTaisyokukin - (dTaisyokuSyotoku * 0.2 + 427500)
//            	dZeibikiTaisyoku = pTaisyokukin - (dTaisyokuSyotoku * 0.2 + 427500);
//        	// ElseIf dTaisyokuSyotoku >= 1950000 Then
//        	}else if(dTaisyokuSyotoku >= 1950000){
//        		// dZeibikiTaisyoku = pTaisyokukin - (dTaisyokuSyotoku * 0.1 + 97500)
//            	dZeibikiTaisyoku = pTaisyokukin - (dTaisyokuSyotoku * 0.1 + 97500);
//        	// Else
//        	}else{
//        		// dZeibikiTaisyoku = pTaisyokukin - (dTaisyokuSyotoku * 0.05)
//            	dZeibikiTaisyoku = pTaisyokukin - (dTaisyokuSyotoku * 0.05);
//        	// End If
//        	}
//
//        	// If iSyugyouY + pTyPi.TaisyokuAge - pTyPi.SyugyoAge <= 2037 Then
//        	if(iSyugyouY + pTyPi_TaisyokuAge - pTyPi_SyugyoAge <= 2037){
//        		// dZeibikiTaisyoku = dZeibikiTaisyoku * (1 + g_Ci.Fukkousyotoku)
//            	dZeibikiTaisyoku = dZeibikiTaisyoku * (1 + self.DB.get_cmninfo().ra_hukkousyotoku);
//        	// End If
//        	}
//
//        // Else
//        }else{
//        	dZeibikiTaisyoku = pTaisyokukin;
//        // End If
//        }
//
//        // Calc34_ZeibikiTaisyoku = dZeibikiTaisyoku
//        return dZeibikiTaisyoku;
//    }

	//IF定義書から住宅ローン住民税控除率を取得する

	p.GetIfLoanJyuKoujyoRate = function() {
		var dJyuKoujyoRate = 0;
		var iJyutakuY = self.MC.age_jyutaku + self.getIndex(false) + self.mYYYYStart;

		var loan = self.DB.get_jyutakuloan(iJyutakuY);
		if (loan) {
			dJyuKoujyoRate = loan.ra_jyukojo;
		}
		return dJyuKoujyoRate;
	};
	//IF定義書から住宅ローン住民税限度額を取得する

	p.GetIfLoanJyuGendo = function() {
		var lJyuGendo = 0;
		var iJyutakuY = self.MC.age_jyutaku + self.getIndex(false) + self.mYYYYStart;

		var loan = self.DB.get_jyutakuloan(iJyutakuY);
		if (loan) {
			lJyuGendo = loan.sm_jyugendo;
		}
		return lJyuGendo;
	};
	p.dump = function(context) {
		var result = [];
		var p = 0;

		// 2021/03/31 このjsの中で編集した項目のみをログ出力
//		result[p++] = "5:年間収\t";
//		result[p++] = "5:ご本人様_税引後退職金\t";
//		result[p++] = "5:配偶者様_税引後退職金\t";
		result[p++] = "5:手取り収入額月額\t";
		result[p++] = "5:住宅費月額\t";
		result[p++] = "5:教育費月額\t";
		result[p++] = "5:毎月の貯蓄・積立額\t";
		result[p++] = "5:基本生活費月額\t";
		result[p++] = "5:生命・損害保険料月額\t";
		result[p++] = "5:CPI\t";
		result[p++] = "5:将来生活費\t";
		result[p++] = "5:教育CPI\t";
		result[p++] = "5:将来教育費\t";
		result[p++] = "5:諸費用・初期値\t";
		result[p++] = "5:自己資金\t";
		result[p++] = "5:借入残高\t";
		result[p++] = "5:年返済額\t";
		result[p++] = "5:住宅ローン所得税減税額\t";
		result[p++] = "5:地価CPI\t";
		result[p++] = "5:将来住宅費\t";
		result[p++] = "5:将来イベント費用\t";

		for (var i = 0; i < self.mDataLength; i++) {
			p = 0;
//			result[p++] += (self.vSyunyu[i]) + "\t";
//			result[p++] += (self.vZeibikiTaikin_hon[i]) + "\t";
//			result[p++] += (self.vZeibikiTaikin_hai[i]) + "\t";
			result[p++] += (self.dSyunyu[i]) + "\t";
			result[p++] += (self.dJyutaku[i]) + "\t";
			result[p++] += (self.dKyouiku[i]) + "\t";
			result[p++] += (self.dSaving[i]) + "\t";
			result[p++] += (self.dSeikatsu[i]) + "\t";
			result[p++] += (self.dInsfee[i]) + "\t";
			result[p++] += (self.vCpi[i]) + "\t";
			result[p++] += (self.vSeikatsuFu[i]) + "\t";
			result[p++] += (self.vKyouikuCpi[i]) + "\t";
			result[p++] += (self.vKyouiku[i]) + "\t";
			result[p++] += (self.vSyohiyo[i]) + "\t";
			result[p++] += (self.vJikoshikin[i]) + "\t";
			result[p++] += (self.vLA[i]) + "\t";
			result[p++] += (self.vYR[i]) + "\t";
			result[p++] += (self.vLoanGenzei[i]) + "\t";
			result[p++] += (self.vChikaCpi[i]) + "\t";
			result[p++] += (self.vJyutaku[i]) + "\t";
			result[p++] += (self.vEvent[i]) + "\t";
		}
		var mLog = "";
		for (var i = 0; i < result.length; i++) {
			mLog += result[i] + "\n";
		}
		return mLog;
	};

	p.setStorage = function() {
		var data = {};

//		data.vSyunyu = self.vSyunyu;
//		data.vZeibikiTaikin_hon = self.vZeibikiTaikin_hon;
//		data.vZeibikiTaikin_hai = self.vZeibikiTaikin_hai;
		data.dSyunyu = self.dSyunyu;
		data.dJyutaku = self.dJyutaku;
		data.dKyouiku = self.dKyouiku;
		data.dSaving = self.dSaving;
		data.dInsfee = self.dInsfee;
		data.dSeikatsu = self.dSeikatsu;
//		data.dTaiSeikatsu = self.dTaiSeikatsu;
		data.vCpi = self.vCpi;
		data.vSeikatsuFu = self.vSeikatsuFu;
		data.vKyouikuCpi = self.vKyouikuCpi;
		data.vKyouiku = self.vKyouiku;
		data.vSyohiyo = self.vSyohiyo;
		data.vJikoshikin = self.vJikoshikin;
		data.vLA = self.vLA;
		data.vYR = self.vYR;
		data.vLoanGenzei = self.vLoanGenzei;
		data.vChikaCpi = self.vChikaCpi;
		data.vJyutaku = self.vJyutaku;
		data.vEvent = self.vEvent;
		data.school = self.school;
		data.Calc20_Seikatsu = self.Calc20_Seikatsu();
		data.Calc21_TaiSeikatsu = self.Calc21_TaiSeikatsu();
		data.mYYYYStart = self.mYYYYStart;

		LIFEPLAN.conf.storage.setItem("Logic05", JSON.stringify(data));
	};

	return Logic05;
})();