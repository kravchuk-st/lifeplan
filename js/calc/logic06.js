/* global LIFEPLAN */

/**
 * （6）資金収支＆資金残高推計

 * 【計算】依存関係： (4) 税金・社会保険料推計

 * 【計算】依存関係：（9） 加入保険診断
 */
"use strict";

// public class Logic06 extends BaseCalc
LIFEPLAN.calc.Logic06 = (function() {

	var self;
	var G_syokugyo = new LIFEPLAN.db.LifePlanDB().G_syokugyo;
	var LPdate = new LIFEPLAN.db.LifePlanDB().LPdate;
	var Util = new LIFEPLAN.util.Util();

	var Logic06 = function(db) {
		self = this;
		LIFEPLAN.calc.BaseCalc.call(self, db);
		//出力値
		self.vNensyu_hon = [];			//ご本人様:将来年収額
		self.vNensyu_hai = [];			//配偶者様:将来年収額
		self.vShikyuteishi_hon = [];	//ご本人様:在職支給停止額
		self.vShikyuteishi_hai = [];	//ご本人様:在職支給停止額
		self.vSonotaSyunyu_hon = [];	//その他収入
		self.vKojin_hon = [];	 		//ご本人様:個人年金
		self.vKojin_hai = [];	 		//配偶者様:個人年金
		self.vManki_hon = [];	 		//ご本人様:満期金
		self.vManki_hai = [];	 		//配偶者様:満期金
		self.vSyotokuzei_hon = [];		//ご本人様:所得税
		self.vSyotokuzei_hai = [];		//配偶者様:所得税
		self.vJyuminzei_hon = [];		//ご本人様:住民税
		self.vJyuminzei_hai = [];		//配偶者様:住民税
		self.vNenkin_hon = [];	 		//ご本人様:年金保険料
		self.vNenkin_hai = [];	 		//配偶者様:年金保険料
		self.vKenkohoken_hon = [];		//ご本人様:健康保険料
		self.vKenkohoken_hai = [];		//配偶者様:健康保険料
		self.vZeibikiTaikin_hon = [];	//ご本人様_税引後退職金
		self.vZeibikiTaikin_hai = [];	//配偶者様_税引後退職金
		self.vJidoTeate = [];			//V2:児童手当
		self.vSyunyu = [];				//年間収入
		self.vSeikatsuFu = [];			//将来生活費
		self.vKyouiku = [];				//将来教育費
		self.vJyutaku = [];				//将来住宅費
		self.vEvent = [];				//将来イベント費用
		self.vNenkin1_hon = [];		//ご本人様:年金保険料1
		self.vNenkin1_hai = [];		//配偶者様:年金保険料1
		self.vShakaihoken_hon = [];		//ご本人様:社会保険料
		self.vShakaihoken_hai = [];		//配偶者様:社会保険料
		self.vSeimei_hon = [];	 		//ご本人様:生命保険料
		self.vSeimei_hai = [];	 		//配偶者様:生命保険料
		self.vNenkin2_hon = [];	 		//ご本人様:年金保険料2
		self.vNenkin2_hai = [];	 		//配偶者様:年金保険料2
		self.vIryou_hon = [];	 		//ご本人様:医療保険料
		self.vIryou_hai = [];	 		//配偶者様:医療保険料
		self.vSonota_hon = [];	 		//ご本人様:その他保険料
		self.vSonota_hai = [];	 		//配偶者様:その他保険料
		self.vShisyutsu = [];			//年間支出
		self.vSyushi = [];				//年間収支
		self.vTsumitate = [];			//年間積立額
		self.vAntei = [];				//安定資金残高
		self.vUnyou = [];				//運用資金残高
		self.vShikin = [];				//資金残高
		self.vRyudoShikin = [];			//流動性資金
		self.vAnteiShikin = [];			//安定性資金
		self.vYobiShikin = [];			//予備資金

		self.L1;
		self.L3;
		self.L4;
		self.L5;
		self.L6;
		self.L9;
	};

	LIFEPLAN.module.inherits(Logic06, LIFEPLAN.calc.BaseCalc);

	var p = Logic06.prototype;

//	@Override
	p.setupData = function() {
		LIFEPLAN.calc.BaseCalc.prototype.setupData.call();
		if (self.mDataLength === 0) {
			return;
		}
		self.vNensyu_hon = self.makeArrayBuffer();
		self.vNensyu_hai = self.makeArrayBuffer();
		self.vShikyuteishi_hon = self.makeArrayBuffer();
		self.vShikyuteishi_hai = self.makeArrayBuffer();
		self.vSonotaSyunyu_hon = self.makeArrayBuffer();
		self.vKojin_hon = self.makeArrayBuffer();
		self.vKojin_hai = self.makeArrayBuffer();
		self.vManki_hon = self.makeArrayBuffer();
		self.vManki_hai = self.makeArrayBuffer();
		self.vSyotokuzei_hon = self.makeArrayBuffer();
		self.vSyotokuzei_hai = self.makeArrayBuffer();
		self.vJyuminzei_hon = self.makeArrayBuffer();
		self.vJyuminzei_hai = self.makeArrayBuffer();
		self.vNenkin_hon = self.makeArrayBuffer();
		self.vNenkin_hai = self.makeArrayBuffer();
		self.vKenkohoken_hon = self.makeArrayBuffer();
		self.vKenkohoken_hai = self.makeArrayBuffer();
		self.vZeibikiTaikin_hon = self.makeArrayBuffer();
		self.vZeibikiTaikin_hai = self.makeArrayBuffer();
		self.vJidoTeate = self.makeArrayBuffer();
		self.vSyunyu = self.makeArrayBuffer();
		self.vSeikatsuFu = self.makeArrayBuffer();
		self.vKyouiku = self.makeArrayBuffer();
		self.vJyutaku = self.makeArrayBuffer();
		self.vEvent = self.makeArrayBuffer();
		self.vNenkin1_hon = self.makeArrayBuffer();
		self.vNenkin1_hai = self.makeArrayBuffer();
		self.vShakaihoken_hon = self.makeArrayBuffer();
		self.vShakaihoken_hai = self.makeArrayBuffer();
		self.vSeimei_hon = self.makeArrayBuffer();
		self.vSeimei_hai = self.makeArrayBuffer();
		self.vNenkin2_hon = self.makeArrayBuffer();
		self.vNenkin2_hai = self.makeArrayBuffer();
		self.vIryou_hon = self.makeArrayBuffer();
		self.vIryou_hai = self.makeArrayBuffer();
		self.vSonota_hon = self.makeArrayBuffer();
		self.vSonota_hai = self.makeArrayBuffer();
		self.vShisyutsu = self.makeArrayBuffer();
		self.vSyushi = self.makeArrayBuffer();
		self.vTsumitate = self.makeArrayBuffer();
		self.vAntei = self.makeArrayBuffer();
		self.vUnyou = self.makeArrayBuffer();
		self.vShikin = self.makeArrayBuffer();
		self.vRyudoShikin = self.makeArrayBuffer();
		self.vAnteiShikin = self.makeArrayBuffer();
		self.vYobiShikin = self.makeArrayBuffer();
	};

	p.logic06_Go = function() {
		self.Calc32_Shisyutsu();
		self.Calc33_Syushi();
		self.Calc36_ShikinZandaka();
		self.Calc37a_ShikinUnyouPlan();
	};

	p.Calc30_Syunyu = function() {
		var iAgeGap = 0;
		var Age = self.MC.age_hon;
		var iTaisyokuAge = self.MC.get_age_taisyoku(false);
		var iTaisyokuAgeHai = self.MC.get_age_taisyoku(true);
		var iSaisyusyokuStAge = self.MC.get_age_saisyusyoku_st(false);
		var iSaisyusyokuStAgeHai = self.MC.get_age_saisyusyoku_st(true);
		var iSaisyusyokuEdAge = self.MC.get_age_saisyusyoku_end(false);
		var iSaisyusyokuEdAgeHai = self.MC.get_age_saisyusyoku_end(true);
		var iSyokugyo = self.MC.get_id_syokugyo(false);
		var iSyokugyoHai = self.MC.get_id_syokugyo(true);
		var iTaisyokukin = self.MC.get_sm_taisyoku(false);
		var iTaisyokukinHai = self.MC.get_sm_taisyoku(true);
		var tyPin = self.DB.get_mc_calc(false);
		var tyPinHai = self.DB.get_mc_calc(true);
		var index = self.getIndex(false);
		var index_hai = self.getIndex(true);
		var dJido = 0;

		for (var i = 0; i < self.mDataLength; i++) {
			// 【取得】将来年収額
			self.vNensyu_hon[i] = self.L1.vNensyu_hon[i];

			// 【取得】将来年金額、在職支給停止額

			self.vNenkin_hon[i] = self.L3.vNenkin_hon[i];
			self.vShikyuteishi_hon[i] = self.L3.vShikyuteishi_hon[i];

			// 【取得】所得税、住民税、年金保険料、健康保険料

			self.vSyotokuzei_hon[i] = self.L4.vSyotokuzei_hon[i];
			self.vJyuminzei_hon[i] = self.L4.vJyuminzei_hon[i];
			self.vNenkin1_hon[i] = self.L4.vNenkinhoken_hon[i];
			self.vKenkohoken_hon[i] = self.L4.vShakaihoken_hon[i];
			self.vShakaihoken_hon[i] = self.L4.vShakaihoken_hon[i];

			// 【取得】個人年金、満期金
			self.vKojin_hon[i] = self.L9.vKojin_hon[i];
			self.vManki_hon[i] = self.L9.vManki_hon[i];
		}

		if (self.MC.is_kekkon()) {
			iAgeGap = LPdate.calcAge(self.MC.st_birthday_hon, self.MC.st_birthday_hai);

			for (var i = 0; i < self.mDataLength; i++) {
				// 【取得】将来年収額

				self.vNensyu_hai[i] = self.L1.vNensyu_hai[i];

				// 【取得】将来年金額、在職支給停止額

				self.vNenkin_hai[i] = self.L3.vNenkin_hai[i];
				self.vShikyuteishi_hai[i] = self.L3.vShikyuteishi_hai[i];

				// 【取得】所得税、住民税、年金保険料、健康保険料

				self.vSyotokuzei_hai[i] = self.L4.vSyotokuzei_hai[i];
				self.vJyuminzei_hai[i] = self.L4.vJyuminzei_hai[i];
				self.vNenkin1_hai[i] = self.L4.vNenkinhoken_hai[i];
				self.vKenkohoken_hai[i] = self.L4.vShakaihoken_hai[i];
				self.vShakaihoken_hai[i] = self.L4.vShakaihoken_hai[i];

				// 【取得】個人年金、満期金
				self.vKojin_hai[i] = self.L9.vKojin_hai[i];
				self.vManki_hai[i] = self.L9.vManki_hai[i];
			}
		}

		for (var i = Age; i < 100; i++) {
			if (i < iTaisyokuAge) {
				self.vSyunyu[i + index] += Util.excelRound(self.vNensyu_hon[i + index], 0);
			}

			if (iSaisyusyokuStAge > 0) {
				if (iSaisyusyokuStAge <= i && i < iSaisyusyokuEdAge) {
					self.vSyunyu[i + index] += self.vNensyu_hon[i + index];
				}
			}

			if (i >= tyPin.BubunStAge) {
				self.vSyunyu[i + index] += self.vNenkin_hon[i + index] - self.vShikyuteishi_hon[i + index];
			}
			self.vSyunyu[i + index] += self.vSonotaSyunyu_hon[i + index];
			self.vSyunyu[i + index] += self.vKojin_hon[i + index];
			self.vSyunyu[i + index] += self.vManki_hon[i + index];
			// 検証01
			self.vSyunyu[i + index] -= (self.vSyotokuzei_hon[i + index] + self.vJyuminzei_hon[i + index] + self.vNenkin1_hon[i + index] + self.vShakaihoken_hon[i + index]);
			// 【Lifeplan_問題管理票_社内.xls】No.077 対応

			if (self.MC.is_kekkon() && (i - iAgeGap) < 100) {
				if (i < iTaisyokuAgeHai + iAgeGap) {
					// 【Lifeplan_問題管理票_社内.xls】No.072 対応

					self.vSyunyu[i + index] += self.vNensyu_hai[i - iAgeGap + index_hai];
				}

				if (iSaisyusyokuStAgeHai > 0) {
					if (i >= iSaisyusyokuStAgeHai + iAgeGap && i < iSaisyusyokuEdAgeHai + iAgeGap) {
						self.vSyunyu[i + index] += self.vNensyu_hai[i - iAgeGap + index_hai];
					}
				}

				if (i >= tyPinHai.BubunStAge + iAgeGap) {
					self.vSyunyu[i + index] += self.vNenkin_hai[i - iAgeGap + index_hai] - self.vShikyuteishi_hai[i - iAgeGap + index_hai];
				}
				self.vSyunyu[i + index] += self.vKojin_hai[i - iAgeGap + index_hai];
				self.vSyunyu[i + index] += self.vManki_hai[i - iAgeGap + index_hai];
				// 検証02
				// self.vNenkin1_hai[i - iAgeGap + index_hai] がExcel版の場合、配偶者の年齢差を考慮に入れていないためズレあり
				self.vSyunyu[i + index] -= (self.vSyotokuzei_hai[i - iAgeGap + index_hai] + self.vJyuminzei_hai[i - iAgeGap + index_hai]
						+ self.vNenkin1_hai[i - iAgeGap + index_hai] + self.vShakaihoken_hai[i - iAgeGap + index_hai]);
			}

			// 2021/03/09 退職年齢の前年ではなく、退職年齢になってから（誕生日後）退職金をもらう。
			//if (i === (iTaisyokuAge - 1)) {
			if (i === (iTaisyokuAge)) {
				// 2021/04/12 税引後退職金を算出する際の職業判定は Calc34_ZeibikiTaisyoku() の中で行うためここからは削除
				var dZeibikiTaisyoku = self.Calc34_ZeibikiTaisyoku(false, iTaisyokukin);
				//self.vSyunyu[iTaisyokuAge - 1 + index] += dZeibikiTaisyoku;
				self.vSyunyu[iTaisyokuAge + index] += dZeibikiTaisyoku;
				// 2021/03/09 税引後退職金配列に格納する位置をここに移動
				self.vZeibikiTaikin_hon[iTaisyokuAge + index] = dZeibikiTaisyoku;
			}

			// 2021/03/09 退職年齢の前年ではなく、退職年齢になってから（誕生日後）退職金をもらう。
			if (self.MC.is_kekkon()) {
				//if (i === (iTaisyokuAgeHai + iAgeGap - 1)) {
				if (i === (iTaisyokuAgeHai + iAgeGap)) {
					// 2021/04/12 税引後退職金を算出する際の職業判定は Calc34_ZeibikiTaisyoku() の中で行うためここからは削除
					var dZeibikiTaisyoku = self.Calc34_ZeibikiTaisyoku(true, iTaisyokukinHai);
					//self.vSyunyu[iTaisyokuAgeHai - 1 + iAgeGap + index] += dZeibikiTaisyoku;
					self.vSyunyu[iTaisyokuAgeHai + iAgeGap + index] += dZeibikiTaisyoku;
					// 2021/03/09 税引後退職金配列に格納する位置をここに移動
					self.vZeibikiTaikin_hai[iTaisyokuAgeHai + iAgeGap + index] = dZeibikiTaisyoku;
				}
			}
			dJido = 0;

			if (self.MC.get_child_count() > 0) {
				for (var j = 1; j <= self.MC.get_child_count(); j++) {
					var g_EduPi = self.MC.get_kyouiku(j);
					var iChdBirthY = LPdate.getCurYear(g_EduPi.ymd_child) - g_EduPi.age_child;
					var iChdBirthMD = LPdate.getMon(g_EduPi.ymd_child) * 100 + LPdate.getDay(g_EduPi.ymd_child);
					var iHonBirthY = LPdate.getYear(self.MC.st_birthday_hon);
					var AgeGap = iChdBirthY - iHonBirthY - (iChdBirthMD > 401 ? 0 : 1);

					// 2021/03/09 児童手当支給条件変更。年収<1042→<=1042。子供の生まれる前後判定を追加
					//if (self.vNensyu_hon[i + index] < 10420000) {
					if (self.vNensyu_hon[i + index] <= 10420000 && i - AgeGap >= 0 ) {
						if (iChdBirthMD > 401 &&
								(i - AgeGap >= 0 && i - AgeGap < 3) ||
								(iChdBirthMD <= 401 && (i - AgeGap > 0 && i - AgeGap < 4))) {
							dJido += 15000;
						} else if (i - AgeGap >= 0 && i - AgeGap < 13) {
							if (j > 2) {
								dJido += 15000;
							} else {
								dJido += 10000;
							}
						} else if (i - AgeGap >= 0 && i - AgeGap < 16) {
							dJido += 10000;
						}
					}
				}
				self.vJidoTeate[i + index] += dJido * 12;
				self.vSyunyu[i + index] += dJido * 12;
			}
		}
		// 2021/03/09 税引後退職金配列に格納する位置を上に移動
//		var dZeibikiTaisyoku;
//		if (iTaisyokuAge !== 20) {
//			dZeibikiTaisyoku = self.Calc34_ZeibikiTaisyoku(false, iTaisyokukin);
//			self.vZeibikiTaikin_hon[iTaisyokuAge - 1 + index] += dZeibikiTaisyoku;
//		}
//		if (self.MC.is_kekkon() && iTaisyokuAgeHai > 0) {
//			if (iTaisyokuAgeHai !== 20) {
//				dZeibikiTaisyoku = self.Calc34_ZeibikiTaisyoku(true, iTaisyokukinHai);
//				self.vZeibikiTaikin_hai[iTaisyokuAgeHai - 1 + iAgeGap + index] = dZeibikiTaisyoku;
//			}
//		}
	};
	p.Calc31_Sonota = function() {
		var index = self.getIndex(false);
		if (self.MC.sm_income1 > 0) {
			for (var i = self.MC.sm_income1_from; i <= self.MC.sm_income1_to; i++) {
				self.vSonotaSyunyu_hon[i + index] += self.MC.sm_income1;
			}
		}

		if (self.MC.sm_income2 > 0) {
			for (var i = self.MC.sm_income2_from; i <= self.MC.sm_income2_to; i++) {
				self.vSonotaSyunyu_hon[i + index] += self.MC.sm_income2;
			}
		}

		if (self.MC.sm_income3 > 0) {
			for (var i = self.MC.sm_income3_from; i <= self.MC.sm_income3_to; i++) {
				self.vSonotaSyunyu_hon[i + index] += self.MC.sm_income3;
			}
		}
	};
	p.Calc32_Shisyutsu = function() {
		var iAgeGap = LPdate.calcAge(self.MC.st_birthday_hon, self.MC.st_birthday_hai);
		var Age = self.MC.age_hon;
		var index = self.getIndex(false);
		var index_hai = self.getIndex(true);

		for (var i = 0; i < self.mDataLength; i++) {
			// 【取得】年金保険料、健康保険料

			self.vNenkin_hon[i] = self.L4.vNenkinhoken_hon[i];
			self.vNenkin_hai[i] = self.L4.vNenkinhoken_hai[i];
			// 【取得】将来生活費、将来教育費、将来住宅費、イベント費用
			self.vSeikatsuFu[i] = self.L5.vSeikatsuFu[i];
			self.vKyouiku[i] = self.L5.vKyouiku[i];
			self.vJyutaku[i] = self.L5.vJyutaku[i];
			self.vEvent[i] = self.L5.vEvent[i];

			// 【取得】生命保険料、年金保険料、医療保険料、その他保険料

			self.vSeimei_hon = self.L9.vSeimei_hon;
			self.vNenkin2_hon = self.L9.vNenkin_hon;
			self.vIryou_hon = self.L9.vIryou_hon;
			self.vSonota_hon = self.L9.vSonota_hon;
			if (self.MC.is_kekkon()) {
				// 【取得】年金保険料、健康保険料

				self.vNenkin_hai[i] = self.L4.vNenkinhoken_hai[i];
				self.vShakaihoken_hai[i] = self.L4.vShakaihoken_hai[i];

				// 【取得】生命保険料、年金保険料、医療保険料、その他保険料

				self.vSeimei_hai[i] = self.L9.vSeimei_hai[i];
				self.vNenkin2_hai[i] = self.L9.vNenkin_hai[i];
				self.vIryou_hai[i] = self.L9.vIryou_hai[i];
				self.vSonota_hai[i] = self.L9.vSonota_hai[i];
			}
		}
		for (var i = Age; i < 100; i++) {
			// 【Lifeplan_問題管理票_社内.xls】No.078 対応

			if (i - iAgeGap < 100) {
				// 【Lifeplan_問題管理票_社内.xls】No.073 対応

				if (!self.MC.is_kekkon()) {
					self.vShisyutsu[i + index] = self.vSeikatsuFu[i + index]
							+ self.vKyouiku[i + index] + self.vJyutaku[i + index] + self.vEvent[i + index]
							+ self.vSeimei_hon[i + index] + self.vNenkin2_hon[i + index] + self.vIryou_hon[i + index]
							+ self.vSonota_hon[i + index];
				} else {
					self.vShisyutsu[i + index] = self.vSeikatsuFu[i + index]
							+ self.vKyouiku[i + index] + self.vJyutaku[i + index] + self.vEvent[i + index]
							+ self.vSeimei_hon[i + index] + self.vNenkin2_hon[i + index] + self.vIryou_hon[i + index]
							+ self.vSonota_hon[i + index]
							+ self.vSeimei_hai[i - iAgeGap + index_hai]
							+ self.vNenkin2_hai[i - iAgeGap + index_hai] + self.vIryou_hai[i - iAgeGap + index_hai]
							+ self.vSonota_hai[i - iAgeGap + index_hai];
				}
			}
		}
	};
	p.Calc33_Syushi = function() {
		var Age = self.MC.age_hon;
		var index = self.getIndex(false);
		for (var i = Age; i < 100; i++) {

			self.vSyushi[i + index] = self.vSyunyu[i + index] - self.vShisyutsu[i + index];
		}

	};
	p.Calc34_ZeibikiTaisyoku = function(is_hai, iTaisyokukin) {
		var dTaisyokuKoujyo = 0;
		var dTaisyokuSyotoku = 0;
		var dTaisyokuSyoZei = 0;    // 退職金所得税
		var dTaisyokuJyuZei = 0;    // 退職金住民税
		var dZeibikiTaisyoku = 0;
		var iSyokugyo = self.MC.get_id_syokugyo(is_hai);
		var iTaisyokuAge = self.MC.get_age_taisyoku(is_hai);
		// 2021/03/08 就業年月の計算式を変更
		//var iSyugyoAge = LPdate.calcAge(self.MC.get_st_birthday(is_hai), self.MC.get_ym_syugyo(is_hai));
		var syugyoMon1stYmd = Math.floor(self.MC.get_ym_syugyo(is_hai) / 100) * 100 + 1;
		var iSyugyoAge = LPdate.calcAge(self.MC.get_st_birthday(is_hai), syugyoMon1stYmd);
		var dtSyugyoday = self.MC.get_ym_syugyo(is_hai);
		var g_Ci = self.DB.get_cmninfo();

		// 2021/04/12 自営業 JIEIGYO を条件に追加
		if (iSyokugyo === G_syokugyo.KAISYAIN
				|| iSyokugyo === G_syokugyo.YAKUIN
				|| iSyokugyo === G_syokugyo.KOMUIN
				|| iSyokugyo === G_syokugyo.JIEIGYO
				) {
			// 2021/03/24 退職上限60歳を単に退職年に変更
			//var iKinzoku = Math.min(iTaisyokuAge, 60) - iSyugyoAge;
			var iKinzoku = iTaisyokuAge - iSyugyoAge;

			if (iKinzoku <= 20) {
				dTaisyokuKoujyo = Math.max(iKinzoku * 40, 80);
			} else {
				dTaisyokuKoujyo = (iKinzoku - 20) * 70 + 800;
			}

			if (iTaisyokukin > dTaisyokuKoujyo) {
				dTaisyokuSyotoku = (iTaisyokukin - dTaisyokuKoujyo) * 0.5;
			} else {
				dTaisyokuSyotoku = 0;
			}

			// 2021/03/08 乗率、加算額を最新化。2007年分～2014年分　→　2015年分以降。=>→>。+→-。
//			if (dTaisyokuSyotoku >= 18000000) {
//				dZeibikiTaisyoku = iTaisyokukin - (dTaisyokuSyotoku * 0.4 + 2796000);
//			} else if (dTaisyokuSyotoku >= 9000000) {
//				dZeibikiTaisyoku = iTaisyokukin - (dTaisyokuSyotoku * 0.33 + 1536000);
//			} else if (dTaisyokuSyotoku >= 6950000) {
//				dZeibikiTaisyoku = iTaisyokukin - (dTaisyokuSyotoku * 0.23 + 636000);
//			} else if (dTaisyokuSyotoku >= 3300000) {
//				dZeibikiTaisyoku = iTaisyokukin - (dTaisyokuSyotoku * 0.2 + 427500);
//			} else if (dTaisyokuSyotoku >= 1950000) {
//				dZeibikiTaisyoku = iTaisyokukin - (dTaisyokuSyotoku * 0.1 + 97500);
//			} else {
//				dZeibikiTaisyoku = iTaisyokukin - (dTaisyokuSyotoku * 0.05);
//			}
//
//			//EXCELにあわせて修正
//			if (LPdate.getYear(dtSyugyoday) + iTaisyokuAge - iSyugyoAge <= 2037) {
//				dZeibikiTaisyoku = dZeibikiTaisyoku * (1.0 + g_Ci.ra_hukkousyotoku);
//			}
			if (dTaisyokuSyotoku > 40000000) {
				dTaisyokuSyoZei = dTaisyokuSyotoku * 0.45 - 4796000;
			} else if (dTaisyokuSyotoku > 18000000) {
				dTaisyokuSyoZei = dTaisyokuSyotoku * 0.4 - 2796000;
			} else if (dTaisyokuSyotoku > 9000000) {
				dTaisyokuSyoZei = dTaisyokuSyotoku * 0.33 - 1536000;
			} else if (dTaisyokuSyotoku > 6950000) {
				dTaisyokuSyoZei = dTaisyokuSyotoku * 0.23 - 636000;
			} else if (dTaisyokuSyotoku > 3300000) {
				dTaisyokuSyoZei = dTaisyokuSyotoku * 0.2 - 427500;
			} else if (dTaisyokuSyotoku > 1950000) {
				dTaisyokuSyoZei = dTaisyokuSyotoku * 0.1 - 97500;
			} else {
				dTaisyokuSyoZei = dTaisyokuSyotoku * 0.05;
			}

			// 退職金所得税に復興所得税を加算
			if (LPdate.getYear(dtSyugyoday) + iTaisyokuAge - iSyugyoAge <= 2037) {
				dTaisyokuSyoZei = dTaisyokuSyoZei * (1.0 + g_Ci.ra_hukkousyotoku);
			}
			dTaisyokuSyoZei = Math.floor(dTaisyokuSyoZei);

			// 退職金住民税
			dTaisyokuJyuZei = Math.floor(dTaisyokuSyotoku * 0.1);

			dZeibikiTaisyoku = iTaisyokukin - (dTaisyokuSyoZei + dTaisyokuJyuZei);
		} else {
			dZeibikiTaisyoku = iTaisyokukin;
		}

		return dZeibikiTaisyoku;
	};
	p.Calc35_Tsumitate = function() {
		var index = self.getIndex(false);

		for (var i = 0; i < self.mDataLength; i++) {
			// 【設定】初期値0
			self.vTsumitate[i] = 0;
		}
		for (var i = self.MC.mon_saving1_from; i < self.MC.mon_saving1_to; i++) {
			self.vTsumitate[i + index] = self.MC.sm_saving1 * 12.0;
		}

		for (var i = self.MC.mon_saving2_from; i < self.MC.mon_saving2_to; i++) {
			self.vTsumitate[i + index] += self.MC.sm_saving2 * 12.0;
		}
	};
	p.Calc36_ShikinZandaka = function() {
		var index = self.getIndex(false);

		for (var i = 0; i < self.mDataLength; i++) {
			// 【取得】イベント費用
			self.vEvent[i] = self.L5.vEvent[i];
		}
		// 【取得】設定情報
		var dJikoshikin = self.L5.Calc25_Jikoshikin(self.MC.sm_jyutakuyosan);
		var dRimawari = self.GetIfRimawari();
		var dTaiRimawari = self.GetIfTaiRimawari();

		var Rtn1 = Math.pow(1.0 + dRimawari, 1.0 / 12.0);
		var Rtn2 = Math.pow(1.0 + dTaiRimawari, 1.0 / 12.0);
		var Rtn3 = 1.0 + self.DB.get_banksetupinfo().ra_yield;

		// 2021/03/31 年は用いずに次の誕生月までの月数を計算する
//		// 1ヵ月未満は切り上げ
//		var birth_year = LPdate.getYear(self.MC.st_birthday_hon);
//		var now_year = LPdate.getCurYear(self.MC.st_birthday_hon);
//		var birth_mon = LPdate.getMon(self.MC.st_birthday_hon);
//		var now_mon = LPdate.getCurMon();
//		var iMonthAge = now_year * 12 + now_mon - (birth_year * 12 + birth_mon) + 1;
		var birth_mon = LPdate.getMon(self.MC.st_birthday_hon);
		var now_mon = LPdate.getCurMon();
		var iMonthBirth = ( birth_mon > now_mon ) ? birth_mon - now_mon : 12 + birth_mon - now_mon ;


		var lUnyouShikin = 0;
		// 2021/03/25 退職後運用資金 save_unyoshikin_tai というのは扱っていないため、現在の運用資金のみを使用するように修正
		//            また、ここを通るときは vUnyou は常にゼロのため、固定でゼロを記述するように修正。
//		/*****2014/01/20  運用コース変更時の異常動作修正	start***********/
//		// 退職年齢-1以降は、 現役世代タブを非表示
//		if (self.MC.age_taisyoku_hon - 1 <= self.MC.age_hon) {
//			var bias = self.MC.age_taisyoku_hon > 20 ? -1 : 0; //2015/07/16 異常終了修正対応
//
//			lUnyouShikin = (self.MC.save_unyoshikin_tai !== -1) ? self.MC.save_unyoshikin_tai : self.L6.vUnyou[self.MC.age_taisyoku_hon + bias + index];
//		} else {
//			lUnyouShikin = (self.MC.save_unyoshikin_gen !== -1) ? self.MC.save_unyoshikin_gen : self.L6.vUnyou[self.MC.age_hon + index];
//		}
//		/*****2014/01/20  運用コース変更時の異常動作修正	end***********/
		lUnyouShikin = (self.MC.save_unyoshikin_gen !== -1) ? self.MC.save_unyoshikin_gen : 0;

		var lTaiUnyouShikin = 0;
		var Age = self.MC.age_hon;

		// 2021/03/25 資金残高の計算方法を大幅修正
//		for (var i = Age; i < 100; i++) {
//			if (i === Age) {
//				var months = (i * 12.0 + 12.0 - iMonthAge) / 12.0;
//				self.vAntei[i + index] = (self.MC.sm_assets - lUnyouShikin) * Math.pow(Rtn3, months);
//				self.vAntei[i + index] += (self.vSyushi[i + index] - self.vTsumitate[i + index]) * months;
//
//				if (self.vAntei[i + index] > 0) {
//					self.vUnyou[i + index] = lUnyouShikin * Math.pow(Rtn1, i * 12 + 12 - iMonthAge)
//							+ self.vTsumitate[i + index] * (Rtn1 - Math.pow(Rtn1, i * 12 + 13 - iMonthAge)) / ((1 - Rtn1) * 12);
//				} else if (lUnyouShikin + self.vAntei[i + index] > 0) {
//					self.vUnyou[i + index] = (lUnyouShikin + self.vAntei[i + index]) * Math.pow(Rtn1, i * 12 + 12 - iMonthAge)
//							+ self.vTsumitate[i + index] * (Rtn1 - Math.pow(Rtn1, i * 12 + 13 - iMonthAge) / ((1 - Rtn1) * 12));
//					self.vAntei[i + index] = 0.0;
//				} else {
//					self.vUnyou[i + index] = 0.0;
//					self.vAntei[i + index] = (self.vAntei[i + index] + self.vTsumitate[i + index]) * (i * 12 + 12 - iMonthAge) / 12
//							+ lUnyouShikin * Math.pow(Rtn3, (i * 12 + 12 - iMonthAge) / 12);
//				}
//			} else {
//				if (i === self.MC.age_taisyoku_hon) {
//					self.vAntei[i + index] = (self.vShikin[i - 1 + index] - lTaiUnyouShikin) * Rtn3 + self.vSyushi[i + index] - self.vTsumitate[i + index];
//					if (self.vAntei[i + index] > 0) {
//
//						// 2015/01/18 start
//						//self.vUnyou[i + index] = lTaiUnyouShikin * Math.pow(Rtn2,12) + self.vTsumitate[i + index] * (Rtn2 - Math.pow(Rtn2,13) / ((1 - Rtn2) * 12));
//						self.vUnyou[i + index] = lTaiUnyouShikin * Math.pow(Rtn2, 12) + self.vTsumitate[i + index] * (Rtn2 - Math.pow(Rtn2, 13)) / ((1 - Rtn2) * 12);
//						// 2015/01/18 end
//
//					} else if (lTaiUnyouShikin + self.vAntei[i + index] > 0) {
//						self.vUnyou[i + index] = (lTaiUnyouShikin + self.vAntei[i + index]) * Math.pow(Rtn2, 12)
//								+ self.vTsumitate[i + index] * (Rtn2 - Math.pow(Rtn2, 13) / ((1 - Rtn2) * 12));
//						self.vAntei[i + index] = 0.0;
//					} else {
//						self.vUnyou[i + index] = 0.0;
//						self.vAntei[i + index] = self.vAntei[i + index] + self.vTsumitate[i + index] + lTaiUnyouShikin * Rtn3;
//					}
//				} else {
//					self.vAntei[i + index] = self.vAntei[i - 1 + index] * Rtn3 + self.vSyushi[i + index] - self.vTsumitate[i + index];
//
//					if (self.vAntei[i + index] > 0) {
//						self.vUnyou[i + index] = self.vUnyou[i - 1 + index] * Math.pow(Rtn1, 12)
//								+ self.vTsumitate[i + index] * (Rtn1 - Math.pow(Rtn1, 13)) / ((1 - Rtn1) * 12);
//					} else if (self.vUnyou[i - 1 + index] + self.vAntei[i + index] > 0) {
//						self.vUnyou[i + index] = (self.vUnyou[i - 1 + index] + self.vAntei[i + index]) * Math.pow(Rtn1, 12)
//								+ self.vTsumitate[i + index] * (Rtn1 - Math.pow(Rtn1, 13)) / ((1 - Rtn1) * 12);
//						self.vAntei[i + index] = 0.0;
//					} else {
//						self.vUnyou[i + index] = 0.0;
//						self.vAntei[i + index] = self.vAntei[i + index] + self.vTsumitate[i + index] + self.vUnyou[i - 1 + index] * Rtn3;
//					}
//				}
//			}
//			self.vShikin[i + index] = self.vAntei[i + index] + self.vUnyou[i + index];
//			// 【設定】出力のための計算結果
//		}
		var dUnyouZan = 0;	// 前年の運用資金残高 self.vUnyou[i - 1 + index] に相当する
		for (var i = Age; i < 100; i++) {
			var T;     // 現在から次の誕生日までの月数
			var R;     // 運用利回り　現役時代と退職時代で切り替える

			if (i < self.MC.age_taisyoku_hon) {
				R = Rtn1;
			} else {
				R = Rtn2;
			}

			// 安定資金の計算

			// 初年度（初期値）
			if (i === Age) {
				T = iMonthBirth;
				dUnyouZan = lUnyouShikin;
				self.vAntei[i + index] = (self.MC.sm_assets - lUnyouShikin) * Math.pow(Rtn3, T / 12)
				                       + (self.vSyushi[i + index] - self.vTsumitate[i + index]) * (T / 12);
			}
			// 次年度以降
			else {
				T = 12;
				self.vAntei[i + index] = self.vAntei[i - 1 + index] * Rtn3
				                       + (self.vSyushi[i + index] - self.vTsumitate[i + index]) * (T / 12);
			}

			// 運用資金の計算、および、安定資金の補正

			// 現役時代からシミュレーションする場合（現在は退職していない）
			if (Age < self.MC.age_taisyoku_hon) {

				// 現役時代、または、退職後も積立てがある場合、積極運用
				if (i < self.MC.age_taisyoku_hon || self.vTsumitate[i + index] > 0) {

					// 安定資金がある場合
					if (self.vAntei[i + index] > 0) {
						dUnyouZan = dUnyouZan * Math.pow(R, T)
						           + self.vTsumitate[i + index] / 12 * (R - Math.pow(R, T + 1)) / (1 - R);

					// 安定資金がゼロ以下だが、前年の運用資金残高から差し引いて運用できる場合
					} else if (dUnyouZan + self.vAntei[i + index] > 0) {
						dUnyouZan = (dUnyouZan + self.vAntei[i + index]) * Math.pow(R, T)
						           + self.vTsumitate[i + index] / 12 * (R - Math.pow(R, T + 1)) / (1 - R);
						self.vAntei[i + index] = 0.0;

					// 安定資金がゼロ以下で、前年の運用資金残高から差し引いてもマイナスの場合
					} else {
						dUnyouZan = 0.0;
						self.vAntei[i + index] = (self.vAntei[i + index] + self.vTsumitate[i + index]) * (T / 12)
						           + dUnyouZan * Math.pow(Rtn3, T / 12);
					}
				}
				// 退職後、積立てもない場合、安定運用のみ
				else {
					self.vAntei[i + index] = (self.vAntei[i - 1 + index] + dUnyouZan) * Rtn3 + self.vSyushi[i + index];
					dUnyouZan = 0.0;
				}
			}
			// 退職時代からシミュレーションする場合（現在は退職している）
			else {

				// 安定資金がある場合
				if (self.vAntei[i + index] > 0) {
					dUnyouZan = dUnyouZan * Math.pow(R, T)
					           + self.vTsumitate[i + index] / 12 * (R - Math.pow(R, T + 1)) / (1 - R);

				// 安定資金がゼロ以下だが、前年の運用資金残高から差し引いて運用できる場合
				} else if (dUnyouZan + self.vAntei[i + index] > 0) {
					dUnyouZan = (dUnyouZan + self.vAntei[i + index]) * Math.pow(R, T)
					           + self.vTsumitate[i + index] / 12 * (R - Math.pow(R, T + 1)) / (1 - R);
					self.vAntei[i + index] = 0.0;

				// 安定資金がゼロ以下で、前年の運用資金残高から差し引いてもマイナスの場合
				} else {
					dUnyouZan = 0.0;
					self.vAntei[i + index] = (self.vAntei[i + index] + self.vTsumitate[i + index]) * (T / 12)
					           + dUnyouZan * Math.pow(Rtn3, T / 12);
				}
			}
			self.vUnyou[i + index] = dUnyouZan;
			self.vShikin[i + index] = self.vAntei[i + index] + self.vUnyou[i + index];
		}
	};

	// 計算式（37a）資金運用プラン（現役時代）

	p.Calc37a_ShikinUnyouPlan = function() {
		var index = self.getIndex(false);

		// 【判定】退職者は推計対象外

//        if (self.MC.age_hon >= self.MC.age_taisyoku_hon){
//        	return;
//        }
		// 【取得】基本生活費、将来教育費、将来イベント費用、自己資金

		var dSeikatsu;

		// 2021/03/10 採用する生活費の現役-老後切り替え年齢を変更。60→退職年齢
		//if (self.MC.age_hon < 60) {
		if (self.MC.age_hon < self.MC.age_taisyoku_hon) {
			// 基本生活費を設定

			dSeikatsu = self.L5.Calc20_Seikatsu();
		} else {
			// 老後生活費を設定

			dSeikatsu = self.L5.Calc21_TaiSeikatsu();
		}

		var dJikoshikin = self.L5.Calc25_Jikoshikin(self.MC.sm_jyutakuyosan);

		// 【計算】流動性資金
		var dRyuudouShikin = Util.excelMin(dSeikatsu * 6, self.MC.sm_assets);

		// 【計算】安定性資金
		var d10YearShikin;

		// 【計算】安定性資金
		var iMonthAge = LPdate.calcAgeMonth(self.MC.st_birthday_hon);

		// 2021/04/07 初年度運用後の運用資金残高をゼロクリアしている不具合を改修。「マネープラン」画面の長期運用資金の初期値をゼロにするのはここではない。
		//// 長期運用資金
		//var dUnyoShikin = 0;

		var TT;

		if (iMonthAge - self.MC.age_hon * 12 > 6) {
			TT = 10;
		} else {
			TT = 9;
		}

		d10YearShikin = 0;

		for (var i = 0; i <= TT; i++) {
			d10YearShikin = d10YearShikin -
					Util.excelMin(
							self.vSyushi[self.MC.age_hon + index + i] + self.vKyouiku[self.MC.age_hon + index + i] + self.vEvent[self.MC.age_hon + index + i] + (self.MC.age_hon + i === self.MC.age_jyutaku ? dJikoshikin : 0),
							0);
			d10YearShikin = d10YearShikin + self.vKyouiku[self.MC.age_hon + index + i] + self.vEvent[self.MC.age_hon + index + i];

			if (self.MC.age_hon + i === self.MC.age_jyutaku) {
				d10YearShikin = d10YearShikin + dJikoshikin;
			}
		}

		// 2021/03/10 安定性資金の算出に翌年の退職金額を加味
		//var dAnteiShikin = Util.excelMin(d10YearShikin, self.MC.sm_assets - dRyuudouShikin);
		var tai1y_hon = (self.MC.age_hon === self.MC.age_taisyoku_hon - 1) ? self.vZeibikiTaikin_hon[self.MC.age_hon + 1 + index] : 0;
		var tai1y_hai = (self.MC.age_hai === self.MC.age_taisyoku_hai - 1) ? self.vZeibikiTaikin_hai[self.MC.age_hon + 1 + index] : 0; // 添え字はage_honで正しい
		var dAnteiShikin = Util.excelMin(d10YearShikin, self.MC.sm_assets + tai1y_hon + tai1y_hai - dRyuudouShikin);

		// 【計算】予備資金
		var dYobiShikin = self.MC.sm_assets - dRyuudouShikin - dAnteiShikin - self.vUnyou[self.MC.age_hon + index];

		self.vRyudoShikin[self.MC.age_hon + index] = dRyuudouShikin;
		self.vAnteiShikin[self.MC.age_hon + index] = dAnteiShikin;
		self.vYobiShikin[self.MC.age_hon + index] = dYobiShikin;
		// 2021/04/07 初年度運用後の運用資金残高をゼロクリアしている不具合を改修。「マネープラン」画面の長期運用資金の初期値をゼロにするのはここではない。
		//self.vUnyou[self.MC.age_hon + index] = dUnyoShikin;
	};

// // 計算式（37b）資金運用プラン（退職時代）
//
//    public void Calc37b_ShikinUnyouPlan(){
//    	int index=self.getIndex(false);
//
//        // 【取得】基本生活費、将来教育費、将来イベント費用、自己資金
//    	//double dSeikatsu = self.L5.Calc20_Seikatsu();
//    	double dSeikatsu = self.L5.Calc21_TaiSeikatsu();
//    	double dJikoshikin = self.L5.Calc25_Jikoshikin(self.MC.sm_jyutakuyosan);
//
//        // 【計算】流動性資金
//    	double dRyuudouShikin = 0;
//    	if (self.MC.age_taisyoku_hon !== 20) {
//    	    // dRyuudouShikin = Util.excelMin(dSeikatsu * 6, self.vShikin[self.MC.age_taisyoku_hon - 1 + index]);
//    	     dRyuudouShikin = Util.excelMin(dSeikatsu * 6, self.vShikin[self.MC.age_hon - 1 + index]);
//    	    //dRyuudouShikin = dSeikatsu * 6;
//    	}
//
//        // 【計算】安定性資金
//        double d10YearShikin = 0;
//
//        for (int i = 0;i<=9;i++){
//            d10YearShikin = d10YearShikin -
//                Util.excelMin(
//                    self.vSyushi[self.MC.age_hon + i + index]
//                    - self.vKyouiku[self.MC.age_hon + i + index]
//                    - self.vEvent[self.MC.age_hon + i + index]
//                    - (self.MC.age_hon + i === self.MC.age_jyutaku ? dJikoshikin : 0),
//                    0);
//
//            d10YearShikin = d10YearShikin + self.vKyouiku[self.MC.age_hon + i + index] + self.vEvent[self.MC.age_hon + i + index];
//
//            if (self.MC.age_hon + i === self.MC.age_jyutaku){
//                d10YearShikin = d10YearShikin + dJikoshikin;
//            }
//        }
//
//        double dAnteiShikin = 0;
//        if (self.MC.age_taisyoku_hon !== 20) {
//            dAnteiShikin = Util.excelMin(d10YearShikin, self.vShikin[self.MC.age_taisyoku_hon - 1 + index] - dRyuudouShikin);
//        }
//
//        // 【計算】予備資金
//        double dYobiShikin = 0;
//        if (self.MC.age_taisyoku_hon !== 20) {
//            dYobiShikin = self.vShikin[self.MC.age_taisyoku_hon - 1 + index] - dRyuudouShikin - dAnteiShikin - self.vUnyou[self.MC.age_taisyoku_hon - 1 + index];
//        }
//
//        int iAge;
////        if (self.MC.age_hon >= self.MC.age_taisyoku_hon){
//            iAge = self.MC.age_hon;
////        }else{
////            iAge = self.MC.age_taisyoku_hon - 1;
////        }
//
//        self.vRyudoShikin[iAge + index] = dRyuudouShikin;
//        self.vAnteiShikin[iAge + index] = dAnteiShikin;
//        self.vYobiShikin[iAge + index] = dYobiShikin;
//    }
//
	p.GetIfRimawari = function() {
		var style = self.DB.get_investstyle(self.MC.id_invest);
		if (style === null) {
			return 0.0;
		}
		return style.ra_invest;
	};
	p.GetIfTaiRimawari = function() {
		var style = self.DB.get_investstyle(self.MC.id_tai_invest);
		if (style === null) {
			return 0.0;
		}
		return style.ra_invest;
	};
	p.dump = function(context) {
		var result = [];
		var p = 0;
		// 2021/03/31 このjsの中で編集した項目のみをログ出力
//		result[p++] = "6:ご本人様_将来年収額\t";
//		result[p++] = "6:配偶者様_将来年収額\t";
//		result[p++] = "6:ご本人様_在職支給停止額\t";
//		result[p++] = "6:配偶者様_在職支給停止額\t";
		result[p++] = "6:その他収入\t";
//		result[p++] = "6:ご本人様_個人年金\t";
//		result[p++] = "6:配偶者様_個人年金\t";
//		result[p++] = "6:ご本人様_満期金\t";
//		result[p++] = "6:配偶者様_満期金\t";
//		result[p++] = "6:ご本人様_所得税\t";
//		result[p++] = "6:配偶者様_所得税\t";
//		result[p++] = "6:ご本人様_住民税\t";
//		result[p++] = "6:配偶者様_住民税\t";
//		result[p++] = "6:ご本人様_年金保険料\t";
//		result[p++] = "6:配偶者様_年金保険料\t";
//		result[p++] = "6:ご本人様_健康保険料\t";
//		result[p++] = "6:配偶者様_健康保険料\t";
		result[p++] = "6:ご本人様_税引後退職金\t";
		result[p++] = "6:配偶者様_税引後退職金\t";
		result[p++] = "6:児童手当\t";
		result[p++] = "6:年間収入\t";
//		result[p++] = "6:将来生活費\t";
//		result[p++] = "6:将来教育費\t";
//		result[p++] = "6:将来住宅費\t";
//		result[p++] = "6:将来イベント費用\t";
//		result[p++] = "6:ご本人様_年金保険料1\t";
//		result[p++] = "6:配偶者様_年金保険料1\t";
//		result[p++] = "6:ご本人様_社会保険料\t";
//		result[p++] = "6:配偶者様_社会保険料\t";
//		result[p++] = "6:ご本人様_生命保険料\t";
//		result[p++] = "6:配偶者様_生命保険料\t";
//		result[p++] = "6:ご本人様_年金保険料2\t";
//		result[p++] = "6:配偶者様_年金保険料2\t";
//		result[p++] = "6:ご本人様_医療保険料\t";
//		result[p++] = "6:配偶者様_医療保険料\t";
//		result[p++] = "6:ご本人様_その他保険料\t";
//		result[p++] = "6:配偶者様_その他保険料\t";
		result[p++] = "6:年間支出\t";
		result[p++] = "6:年間収支\t";
		result[p++] = "6:年間積立額\t";
		result[p++] = "6:安定資金残高\t";
		result[p++] = "6:運用資金残高\t";
		result[p++] = "6:資金残高\t";
		result[p++] = "6:流動性資金\t";
		result[p++] = "6:安定性資金\t";
		result[p++] = "6:予備資金\t";

		for (var i = 0; i < self.mDataLength; i++) {
			p = 0;
//			result[p++] += (self.vNensyu_hon[i]) + "\t";
//			result[p++] += (self.vNensyu_hai[i]) + "\t";
//			result[p++] += (self.vShikyuteishi_hon[i]) + "\t";
//			result[p++] += (self.vShikyuteishi_hai[i]) + "\t";
			result[p++] += (self.vSonotaSyunyu_hon[i]) + "\t";
//			result[p++] += (self.vKojin_hon[i]) + "\t";
//			result[p++] += (self.vKojin_hai[i]) + "\t";
//			result[p++] += (self.vManki_hon[i]) + "\t";
//			result[p++] += (self.vManki_hai[i]) + "\t";
//			result[p++] += (self.vSyotokuzei_hon[i]) + "\t";
//			result[p++] += (self.vSyotokuzei_hai[i]) + "\t";
//			result[p++] += (self.vJyuminzei_hon[i]) + "\t";
//			result[p++] += (self.vJyuminzei_hai[i]) + "\t";
//			result[p++] += (self.vNenkin_hon[i]) + "\t";
//			result[p++] += (self.vNenkin_hai[i]) + "\t";
//			result[p++] += (self.vKenkohoken_hon[i]) + "\t";
//			result[p++] += (self.vKenkohoken_hai[i]) + "\t";
			result[p++] += (self.vZeibikiTaikin_hon[i]) + "\t";
			result[p++] += (self.vZeibikiTaikin_hai[i]) + "\t";
			result[p++] += (self.vJidoTeate[i]) + "\t";
			result[p++] += (self.vSyunyu[i]) + "\t";
//			result[p++] += (self.vSeikatsuFu[i]) + "\t";
//			result[p++] += (self.vKyouiku[i]) + "\t";
//			result[p++] += (self.vJyutaku[i]) + "\t";
//			result[p++] += (self.vEvent[i]) + "\t";
//			result[p++] += (self.vNenkin1_hon[i]) + "\t";
//			result[p++] += (self.vNenkin1_hai[i]) + "\t";
//			result[p++] += (self.vShakaihoken_hon[i]) + "\t";
//			result[p++] += (self.vShakaihoken_hai[i]) + "\t";
//			result[p++] += (self.vSeimei_hon[i]) + "\t";
//			result[p++] += (self.vSeimei_hai[i]) + "\t";
//			result[p++] += (self.vNenkin2_hon[i]) + "\t";
//			result[p++] += (self.vNenkin2_hai[i]) + "\t";
//			result[p++] += (self.vIryou_hon[i]) + "\t";
//			result[p++] += (self.vIryou_hai[i]) + "\t";
//			result[p++] += (self.vSonota_hon[i]) + "\t";
//			result[p++] += (self.vSonota_hai[i]) + "\t";
			result[p++] += (self.vShisyutsu[i]) + "\t";
			result[p++] += (self.vSyushi[i]) + "\t";
			result[p++] += (self.vTsumitate[i]) + "\t";
			result[p++] += (self.vAntei[i]) + "\t";
			result[p++] += (self.vUnyou[i]) + "\t";
			result[p++] += (self.vShikin[i]) + "\t";
			result[p++] += (self.vRyudoShikin[i]) + "\t";
			result[p++] += (self.vAnteiShikin[i]) + "\t";
			result[p++] += (self.vYobiShikin[i]) + "\t";
		}
		var mLog = "";
		for (var i = 0; i < result.length; i++) {
			mLog += result[i] + "\n";
		}
		return mLog;
	};

	p.setStorage = function() {
		var data = {};

//		data.vNensyu_hon = self.vNensyu_hon;
//		data.vNensyu_hai = self.vNensyu_hai;
//		data.vShikyuteishi_hon = self.vShikyuteishi_hon;
//		data.vShikyuteishi_hai = self.vShikyuteishi_hai;
		data.vSonotaSyunyu_hon = self.vSonotaSyunyu_hon;
//		data.vKojin_hon = self.vKojin_hon;
//		data.vKojin_hai = self.vKojin_hai;
//		data.vManki_hon = self.vManki_hon;
//		data.vManki_hai = self.vManki_hai;
//		data.vSyotokuzei_hon = self.vSyotokuzei_hon;
//		data.vSyotokuzei_hai = self.vSyotokuzei_hai;
//		data.vJyuminzei_hon = self.vJyuminzei_hon;
//		data.vJyuminzei_hai = self.vJyuminzei_hai;
//		data.vNenkin_hon = self.vNenkin_hon;
//		data.vNenkin_hai = self.vNenkin_hai;
//		data.vKenkohoken_hon = self.vKenkohoken_hon;
//		data.vKenkohoken_hai = self.vKenkohoken_hai;
		data.vZeibikiTaikin_hon = self.vZeibikiTaikin_hon;
		data.vZeibikiTaikin_hai = self.vZeibikiTaikin_hai;
		data.vJidoTeate = self.vJidoTeate;
		data.vSyunyu = self.vSyunyu;
//		data.vSeikatsuFu = self.vSeikatsuFu;
//		data.vKyouiku = self.vKyouiku;
//		data.vJyutaku = self.vJyutaku;
//		data.vEvent = self.vEvent;
//		data.vNenkin1_hon = self.vNenkin1_hon;
//		data.vNenkin1_hai = self.vNenkin1_hai;
//		data.vShakaihoken_hon = self.vShakaihoken_hon;
//		data.vShakaihoken_hai = self.vShakaihoken_hai;
//		data.vSeimei_hon = self.vSeimei_hon;
//		data.vSeimei_hai = self.vSeimei_hai;
//		data.vNenkin2_hon = self.vNenkin2_hon;
//		data.vNenkin2_hai = self.vNenkin2_hai;
//		data.vIryou_hon = self.vIryou_hon;
//		data.vIryou_hai = self.vIryou_hai;
//		data.vSonota_hon = self.vSonota_hon;
//		data.vSonota_hai = self.vSonota_hai;
		data.vShisyutsu = self.vShisyutsu;
		data.vSyushi = self.vSyushi;
		data.vTsumitate = self.vTsumitate;
		data.vAntei = self.vAntei;
		data.vUnyou = self.vUnyou;
		data.vShikin = self.vShikin;
		data.vRyudoShikin = self.vRyudoShikin;
		data.vAnteiShikin = self.vAnteiShikin;
		data.vYobiShikin = self.vYobiShikin;
		data.index = self.getIndex(false);
		data.mYYYYStart = self.mYYYYStart;

		LIFEPLAN.conf.storage.setItem("Logic06", JSON.stringify(data));
	};

	return Logic06;
})();