/* global LIFEPLAN */

/**
 * (8) 必要保障額推計
 *
 */
"use strict";

// 2021/02/22 全体的に修正。旧ロジックのコメントアウトは省略し、直接変更

// public class Logic08 extends BaseCalc
LIFEPLAN.calc.Logic08 = (function() {

	var self;
	var G_syokugyo = new LIFEPLAN.db.LifePlanDB().G_syokugyo;
	var LPdate = new LIFEPLAN.db.LifePlanDB().LPdate;
	var Util = new LIFEPLAN.util.Util();

	var Logic08 = function(db) {
		self = this;
		LIFEPLAN.calc.BaseCalc.call(self, db);
		//出力値
		self.vSeikatsuFu = [];			//将来生活費
		self.vKyouiku = [];				//将来教育費
		self.vJyutaku = [];				//将来住宅費
		self.vYR = [];					//年返済額
		self.vNensyu_hon = [];			//ご本人様:将来年収額
		self.vNensyu_hai = [];			//配偶者様:将来年収額
		self.vKojin_hai = [];	 		//配偶者様:個人年金
		self.vNenkin_hai = [];			//配偶者様:将来年金額
		self.vShikyuteishi_hai = [];	//配偶者様:在職支給停止額
		self.vKakyu_hai = [];			//配偶者様:加給年金
		self.vKakyuTo_hai = [];			//配偶者様:加給年金・特別
		self.vFurikae_hai = [];			//配偶者様:振替加算
		self.vSyotokuzei_hai = [];		//配偶者様:所得税
		self.vJyuminzei_hai = [];		//配偶者様:住民税
		self.vNenkinhoken_hai = [];		//配偶者様:年金保険料
		self.vShakaihoken_hai = [];		//配偶者様:社会保険料
		self.vIzokuKiso_hai = [];		//配偶者様:遺族基礎年金
		self.vIzokuKousei_hai = [];		//配偶者様:遺族厚生年金
		self.vIzokuKyousai_hai = [];	//配偶者様:遺族共済年金
		self.vKafunenkin_hai = [];		//配偶者様:寡婦年金
		self.vSeikatsu_hai = [];	//配偶者様_単身生活費
		self.vJyutaku_hai = [];	//配偶者様_単身住宅費
		self.vKyouiku_hai = [];	//配偶者様_単身教育費
		self.vRourei_hai = [];	//配偶者様_単身老齢年金
		self.vShibouTaikin_hon = [];	//ご本人様_死亡退職金
		self.vHitsuho_hon = [];			//ご本人様:必要保障額
		self.vKojin_hon = [];	 		//ご本人様:個人年金
		self.vNenkin_hon = [];			//ご本人様:将来年金額
		self.vShikyuteishi_hon = [];	//ご本人様:在職支給停止額
		self.vKakyu_hon = [];			//ご本人様:加給年金
		self.vKakyuTo_hon = [];			//ご本人様:加給年金・特別
		self.vFurikae_hon = [];			//ご本人様:振替加算
		self.vSyotokuzei_hon = [];		//ご本人様:所得税
		self.vJyuminzei_hon = [];		//ご本人様:住民税
		self.vNenkinhoken_hon = [];		//ご本人様:年金保険料
		self.vShakaihoken_hon = [];		//ご本人様:社会保険料
		self.vIzokuKiso_hon = [];		//ご本人様:遺族基礎年金
		self.vIzokuKousei_hon = [];		//ご本人様:遺族厚生年金
		self.vIzokuKyousai_hon = [];	//ご本人様:遺族共済年金
		self.vKafunenkin_hon = [];		//ご本人様:寡婦年金
		self.vSeikatsu_hon = [];	//ご本人様_単身生活費
		self.vJyutaku_hon = [];	//ご本人様_単身住宅費
		self.vKyouiku_hon = [];	//ご本人様_単身教育費
		self.vRourei_hon = [];	//ご本人様_単身老齢年金
		self.vShibouTaikin_hai = [];	//配偶者様:死亡退職金
		self.vHitsuho_hai = [];			//配偶者様:必要保障額

		self.vSum_Seikatsu_hon = 0;			//ご本人様:単身生活費合計
		self.vSum_Seikatsu_hai = 0;			//配偶者様:単身生活費合計
		self.vSum_Jyutaku_hon = 0;				//ご本人様:単身住宅費合計
		self.vSum_Jyutaku_hai = 0;				//配偶者様:単身住宅費合計
		self.vSum_Rourei_hon = 0;				//ご本人様:単身老齢年金合計
		self.vSum_Rourei_hai = 0;				//配偶者様:単身老齢年金合計
		self.vSum_Kyouiku_hon = 0;				//ご本人様:単身教育費合計
		self.vSum_Kyouiku_hai = 0;				//配偶者様:単身教育費合計

		/****2014/01/20 必要保障額計上ロジックの修正（グラフと内訳の金額一致） start *****/
		self.vSeimei_hon = [];	 		//ご本人様:生命保険料
		self.vSeimei_hai = [];	 		//配偶者様:生命保険料
		self.vEvent = [];				//将来イベント費用
		self.vSonotaSyunyu_hon = [];        //本人、配偶者共通:その他収入
		/****2014/01/20 必要保障額計上ロジックの修正（グラフと内訳の金額一致）end *****/

		self.L1;
		self.L3;
		self.L4;
		self.L5;
		self.L6;
		self.L7;
		self.L9;
	};

	LIFEPLAN.module.inherits(Logic08, LIFEPLAN.calc.BaseCalc);

	var p = Logic08.prototype;

//	@Override
	p.setupData = function() {
		LIFEPLAN.calc.BaseCalc.prototype.setupData.call();
		if (self.mDataLength === 0) {
			return;
		}
		self.vSeikatsuFu = self.makeArrayBuffer();
		self.vKyouiku = self.makeArrayBuffer();
		self.vJyutaku = self.makeArrayBuffer();
		self.vYR = self.makeArrayBuffer();
		self.vNensyu_hon = self.makeArrayBuffer();
		self.vNensyu_hai = self.makeArrayBuffer();
		self.vKojin_hai = self.makeArrayBuffer();
		self.vNenkin_hai = self.makeArrayBuffer();
		self.vShikyuteishi_hai = self.makeArrayBuffer();
		self.vKakyu_hai = self.makeArrayBuffer();
		self.vKakyuTo_hai = self.makeArrayBuffer();
		self.vFurikae_hai = self.makeArrayBuffer();
		self.vSyotokuzei_hai = self.makeArrayBuffer();
		self.vJyuminzei_hai = self.makeArrayBuffer();
		self.vNenkinhoken_hai = self.makeArrayBuffer();
		self.vShakaihoken_hai = self.makeArrayBuffer();
		self.vIzokuKiso_hai = self.makeArrayBuffer();
		self.vIzokuKousei_hai = self.makeArrayBuffer();
		self.vIzokuKyousai_hai = self.makeArrayBuffer();
		self.vKafunenkin_hai = self.makeArrayBuffer();
		self.vShibouTaikin_hon = self.makeArrayBuffer();
		self.vHitsuho_hon = self.makeArrayBuffer();

		self.vKojin_hon = self.makeArrayBuffer();
		self.vNenkin_hon = self.makeArrayBuffer();
		self.vShikyuteishi_hon = self.makeArrayBuffer();
		self.vKakyu_hon = self.makeArrayBuffer();
		self.vKakyuTo_hon = self.makeArrayBuffer();
		self.vFurikae_hon = self.makeArrayBuffer();
		self.vSyotokuzei_hon = self.makeArrayBuffer();
		self.vJyuminzei_hon = self.makeArrayBuffer();
		self.vNenkinhoken_hon = self.makeArrayBuffer();
		self.vShakaihoken_hon = self.makeArrayBuffer();
		self.vIzokuKiso_hon = self.makeArrayBuffer();
		self.vIzokuKousei_hon = self.makeArrayBuffer();
		self.vIzokuKyousai_hon = self.makeArrayBuffer();
		self.vKafunenkin_hon = self.makeArrayBuffer();
		self.vShibouTaikin_hai = self.makeArrayBuffer();
		self.vHitsuho_hai = self.makeArrayBuffer();
		self.vSum_Seikatsu_hon = 0.0;
		self.vSum_Seikatsu_hai = 0.0;
		self.vSum_Jyutaku_hon = 0.0;
		self.vSum_Jyutaku_hai = 0.0;
		self.vSum_Rourei_hon = 0.0;
		self.vSum_Rourei_hai = 0.0;
		self.vSum_Kyouiku_hon = 0.0;
		self.vSum_Kyouiku_hai = 0.0;

		self.vSeikatsu_hon = self.makeArrayBuffer();
		self.vSeikatsu_hai = self.makeArrayBuffer();
		self.vJyutaku_hon = self.makeArrayBuffer();
		self.vJyutaku_hai = self.makeArrayBuffer();
		self.vKyouiku_hon = self.makeArrayBuffer();
		self.vKyouiku_hai = self.makeArrayBuffer();
		self.vRourei_hon = self.makeArrayBuffer();
		self.vRourei_hai = self.makeArrayBuffer();
		/***** 2014/01/20 必要保障額計上ロジックの修正（グラフと内訳の金額一致） start ****/
		self.vSeimei_hai = self.makeArrayBuffer();
		self.vSeimei_hon = self.makeArrayBuffer();
		self.vEvent = self.makeArrayBuffer();
		self.vSonotaSyunyu_hon = self.makeArrayBuffer();
		/***** 2014/01/20 必要保障額計上ロジックの修正（グラフと内訳の金額一致） end ****/
	};

	p.logic08_Go = function() {
		self.Calc43_HitsuhoHon();
		if (self.MC.is_kekkon()) {
			self.Calc44_HitsuhoHai();
		}
	};

	p.Calc43_HitsuhoHon = function() {
		var index_hon = self.getIndex(false);
		var index_hai = self.getIndex(true);
		var Age = LPdate.calcAge(self.MC.st_birthday_hon);

		// 【取得】将来年収額

		self.vNensyu_hon = self.L1.vNensyu_hon;
		self.vNensyu_hai = self.L1.vNensyu_hai;

		// 【取得】加給年金、加給年金・特別、振替加算、将来年金額、在職支給停止額

		self.vKakyu_hai = self.L3.vKakyu_hai;
		self.vKakyuTo_hai = self.L3.vKakyuTo_hai;
		self.vFurikae_hai = self.L3.vFurikae_hai;
		self.vNenkin_hai = self.L3.vNenkin_hai;
		self.vShikyuteishi_hai = self.L3.vShikyuteishi_hai;

		// 【取得】所得税、住民税、年金保険料、社会保険料

		self.vSyotokuzei_hai = self.L4.vSyotokuzei_hai;
		self.vJyuminzei_hai = self.L4.vJyuminzei_hai;
		self.vNenkinhoken_hai = self.L4.vNenkinhoken_hai;
		self.vShakaihoken_hai = self.L4.vShakaihoken_hai;

		// 【取得】将来生活費、将来教育費、将来住宅費、年返済額

		self.vSeikatsuFu = self.L5.vSeikatsuFu;
		self.vKyouiku = self.L5.vKyouiku;
		self.vJyutaku = self.L5.vJyutaku;
		self.vYR = self.L5.vYR;
		/******** 2014/01/20  必要保障額計上ロジックの修正（グラフと内訳の金額一致） start *******/
		self.vSeimei_hai = self.L9.vSeimei_hai;
		self.vEvent = self.L5.vEvent;
		self.vSonotaSyunyu_hon = self.L6.vSonotaSyunyu_hon;
		/******** 2014/01/20  必要保障額計上ロジックの修正（グラフと内訳の金額一致） end *******/

		// 【取得】資金残高

//		    double[] vShikinZandaka = self.L6.vShikin;

		// 【取得】個人年金額

		self.vKojin_hai = self.L9.vKojin_hai;


		if (self.MC.is_kekkon()) {
			for (var i = 0; i < self.mDataLength; i++) {
				// 【取得】遺族基礎年金、遺族厚生年金、遺族共済年金、寡婦年金

				self.vIzokuKiso_hon[i] = self.L7.vIzokuKiso_hon[i];
				self.vIzokuKousei_hon[i] = self.L7.vIzokuKouseiS_hon[i];
				self.vIzokuKyousai_hon[i] = self.L7.vIzokuKyousaiS_hon[i];
				self.vKafunenkin_hon[i] = self.L7.vKafunenkin_hon[i];
			}
		}
		var iAgeGap = LPdate.calcAge(self.MC.st_birthday_hon, self.MC.st_birthday_hai);
		var g_PinHon = self.DB.get_mc_calc(false);
		var iLifespanHai;
		var syokugyo = self.MC.id_syokugyo_hon;

		if (self.MC.id_sex_hon === 1) {
			iLifespanHai = self.DB.get_banksetupinfo().age_life_w;
		} else {
			iLifespanHai = self.DB.get_banksetupinfo().age_life_m;
		}

		// 2021/04/14 予備費用の使用方法を変更
		//self.vSum_Seikatsu_hai = self.DB.get_banksetupinfo().sm_yobi;
		self.vSum_Seikatsu_hai = 0;

		for (var i = Age; i <= (Age + 35) && i < 100; i++) {
			if (i >= 100) {
				break;
			}
			self.vHitsuho_hon[i + index_hon] = self.DB.get_banksetupinfo().sm_yobi;

			if (self.MC.is_kekkon()) {
				for (var j = i; j <= (iLifespanHai + iAgeGap); j++) {
					if (j >= 100) {
						break;
					}

					if (self.vKyouiku[j + index_hon] > 0) {
						// 配偶者の生活費
						self.vHitsuho_hon[i + index_hon] += self.vSeikatsuFu[j + index_hon];
						// 子供の教育費
						self.vHitsuho_hon[i + index_hon] += self.vKyouiku[j + index_hon];

						if (i === Age) {
							self.vSum_Seikatsu_hai += self.vSeikatsuFu[j + index_hon];
							self.vSum_Kyouiku_hai += self.vKyouiku[j + index_hon];
						}
					} else {
						self.vHitsuho_hon[i + index_hon] += self.vSeikatsuFu[j + index_hon] * self.DB.get_banksetupinfo().ra_livingcost_alone;

						if (i === Age) {
							self.vSum_Seikatsu_hai += self.vSeikatsuFu[j + index_hon] * self.DB.get_banksetupinfo().ra_livingcost_alone;
						}
					}

					self.vHitsuho_hon[i + index_hon] += self.vJyutaku[j + index_hon];

					// 団信
					// 2021/04/22 住宅購入年齢を考慮して年返済額分を差し引くように修正
					//if (self.MC.id_dansin > 0) {
					if (self.MC.id_dansin > 0 && self.MC.id_lives_yotei === 1 && i >= self.MC.age_jyutaku) {
						self.vHitsuho_hon[i + index_hon] -= self.vYR[j + index_hon];
					}

					if (i === Age) {
						self.vSum_Jyutaku_hai += self.vJyutaku[j + index_hon];

						if (self.MC.id_dansin > 0) {
							self.vSum_Jyutaku_hai -= self.vYR[j + index_hon];
						}
					}

					// 配偶者収入・年金分の減額

					self.vHitsuho_hon[i + index_hon] -= self.vNensyu_hai[j + index_hai - iAgeGap];
					self.vHitsuho_hon[i + index_hon] -= self.vKojin_hai[j + index_hai - iAgeGap];
					self.vHitsuho_hon[i + index_hon] -= self.vNenkin_hai[j + index_hai - iAgeGap] - self.vShikyuteishi_hai[j + index_hai - iAgeGap];

					if (i === Age) {
						self.vSum_Rourei_hai += self.vNenkin_hai[j + index_hai - iAgeGap] - self.vShikyuteishi_hai[j + index_hai - iAgeGap];
					}

					// 振替加算は相手が死亡時にも受給できるため、相殺しない。
					// 加給年金の相殺（公的年金受給額 vNenkin_hon に相手の加給年金が含まれているが死亡時には停止されるため、相殺する）
					self.vHitsuho_hon[i + index_hon] += self.vKakyu_hai[j + index_hai - iAgeGap] + self.vKakyuTo_hai[j + index_hai - iAgeGap];

					if (j > 65){
						if (i === Age){
							self.vSum_Rourei_hai += self.vKakyu_hai[j + index_hai - iAgeGap];
						}
					}else if (j >= g_PinHon.JyukyuStAge){

						if (i === Age){
							self.vSum_Rourei_hai += self.vKakyuTo_hai[j + index_hai - iAgeGap];
						}
					}

					/******* 2014/01/20 必要保障額計上ロジックの修正（グラフと内訳の金額一致） start ******/
					self.vHitsuho_hon[i + index_hon] +=
							self.vSyotokuzei_hai[j + index_hai - iAgeGap]
							+ self.vJyuminzei_hai[j + index_hai - iAgeGap]
							+ self.vNenkinhoken_hai[j + index_hai - iAgeGap]
							+ self.vShakaihoken_hai[j + index_hai - iAgeGap]
							+ self.vSeimei_hai[j + index_hai - iAgeGap]
							+ self.vEvent[j + index_hai - iAgeGap]
							- self.vSonotaSyunyu_hon[j + index_hai - iAgeGap];
					/******* 2014/01/20 必要保障額計上ロジックの修正（グラフと内訳の金額一致） end ******/

				}
				// 遺族年金・死亡退職金分の減額

				// 遺族基礎年金を性別に関係なく加算する

				self.vHitsuho_hon[i + index_hon] -= self.vIzokuKiso_hon[i + index_hon];

				if (self.MC.id_sex_hon === 1) {
					if (syokugyo === G_syokugyo.KAISYAIN ||
							syokugyo === G_syokugyo.YAKUIN ||
							syokugyo === G_syokugyo.TAI_KAISYAIN ||
							(syokugyo === G_syokugyo.JIEIGYO && self.MC.id_kinmu_hon === 1) ||
							(syokugyo === G_syokugyo.MUSYOKU && self.MC.id_kinmu_hon === 1)) {
						self.vHitsuho_hon[i + index_hon] -= self.vIzokuKousei_hon[i + index_hon];
					}
					if (syokugyo === G_syokugyo.KOMUIN ||
							syokugyo === G_syokugyo.TAI_KOMUIN ||
							(syokugyo === G_syokugyo.JIEIGYO && self.MC.id_kinmu_hon === 2) ||
							(syokugyo === G_syokugyo.MUSYOKU && self.MC.id_kinmu_hon === 2)) {
						self.vHitsuho_hon[i + index_hon] -= self.vIzokuKyousai_hon[i + index_hon];
					}
					self.vHitsuho_hon[i + index_hon] -= self.vKafunenkin_hon[i + index_hon];
				}
			} else if (self.MC.get_child_count() > 0) {
				for (var j = i; j < 100; j++) {
					if (self.vKyouiku[j + index_hon] > 0) {
						self.vHitsuho_hon[i + index_hon] += self.vSeikatsuFu[j + index_hon] * self.DB.get_banksetupinfo().ra_livingcost_alone;
						self.vHitsuho_hon[i + index_hon] += self.vJyutaku[j + index_hon];
						self.vHitsuho_hon[i + index_hon] += self.vKyouiku[j + index_hon];

						if (i === Age) {
							self.vSum_Seikatsu_hai += self.vSeikatsuFu[j + index_hon] * self.DB.get_banksetupinfo().ra_livingcost_alone;
							self.vSum_Jyutaku_hai += self.vJyutaku[j + index_hon];
							self.vSum_Kyouiku_hai += self.vKyouiku[j + index_hon];
						}
					}

					if (self.MC.id_dansin > 0) {
						self.vHitsuho_hon[i + index_hon] -= self.vYR[j + index_hon];

						if (i === Age) {
							self.vSum_Jyutaku_hai += self.vYR[j + index_hon];
						}
					}
				}
			}

			if (syokugyo === G_syokugyo.KAISYAIN || syokugyo === G_syokugyo.YAKUIN || syokugyo === G_syokugyo.KOMUIN) {
				if (i < self.MC.get_age_taisyoku(false)) {
					// 【Lifeplan_問題管理票_社内.xls】No.031 対応

					self.vShibouTaikin_hon[i + index_hon] = Util.excelRound(self.vNensyu_hon[i + index_hon] * self.DB.get_banksetupinfo().ra_kotei / 100.0, 0) * 100.0;
					self.vHitsuho_hon[i + index_hon] -= self.vShibouTaikin_hon[i + index_hon];
				}
			}

			// 金融資産残高及び資金残高の減額

			if (i === Age) {
				self.vHitsuho_hon[i + index_hon] -= self.MC.sm_assets;
			} else if (i === self.MC.get_age_taisyoku(false)){
				self.vHitsuho_hon[i + index_hon] -= self.L6.vShikin[i + index_hon - 1] + self.L6.vZeibikiTaikin_hon[i + index_hon];
			} else {
				self.vHitsuho_hon[i + index_hon] -= self.L6.vShikin[i + index_hon - 1];
				//self.vHitsuho_hon[i + index_hon] -= self.MC.sm_assets;
			}

			// 2021/04/14 予備費用の使用方法を変更
			self.vHitsuho_hon[i + index_hon] = Math.max(self.vHitsuho_hon[i + index_hon], self.DB.get_banksetupinfo().sm_yobi);

		}

		self.vSeikatsu_hai[self.MC.age_hai + index_hai] = self.vSum_Seikatsu_hai;
		self.vJyutaku_hai[self.MC.age_hai + index_hai] = self.vSum_Jyutaku_hai;
		self.vKyouiku_hai[self.MC.age_hai + index_hai] = self.vSum_Kyouiku_hai;
		self.vRourei_hai[self.MC.age_hai + index_hai] = self.vSum_Rourei_hai;
	};
	// 計算式(44) 必要補償額

	p.Calc44_HitsuhoHai = function() {
		var index = self.getIndex(false);
		var index_hai = self.getIndex(true);

		var Age = LPdate.calcAge(self.MC.st_birthday_hon);
		//var Age = LPdate.calcAge(self.MC.st_birthday_hai);

		for (var i = 0; i < self.mDataLength; i++) {
			// 【取得】将来年収額
			/****** 2014/01/20  必要保障額計上ロジックの修正（グラフと内訳の金額一致） start ******/
			self.vSeimei_hon[i] = self.L9.vSeimei_hon[i];
			// 【取得】イベント費用
			self.vEvent[i] = self.L5.vEvent[i];
			self.vSonotaSyunyu_hon = self.L6.vSonotaSyunyu_hon;
			/****** 2014/01/20  必要保障額計上ロジックの修正（グラフと内訳の金額一致） end ******/

			self.vNensyu_hon[i] = self.L1.vNensyu_hon[i];
			self.vNensyu_hai[i] = self.L1.vNensyu_hai[i];

			// 【取得】加給年金、加給年金・特別、振替加算、将来年金額、在職支給停止額

			self.vKakyu_hon[i] = self.L3.vKakyu_hon[i];
			self.vKakyu_hai[i] = self.L3.vKakyu_hai[i];
			self.vKakyuTo_hon[i] = self.L3.vKakyuTo_hon[i];
			self.vFurikae_hon[i] = self.L3.vFurikae_hon[i];
			self.vNenkin_hon[i] = self.L3.vNenkin_hon[i];
			self.vShikyuteishi_hon[i] = self.L3.vShikyuteishi_hon[i];

			// 【取得】所得税、住民税、年金保険料、社会保険料

			self.vSyotokuzei_hon[i] = self.L4.vSyotokuzei_hon[i];
			self.vJyuminzei_hon[i] = self.L4.vJyuminzei_hon[i];
			self.vNenkinhoken_hon[i] = self.L4.vNenkinhoken_hon[i];
			self.vShakaihoken_hon[i] = self.L4.vShakaihoken_hon[i];

			// 【取得】将来生活費、将来教育費、将来住宅費、年返済額

			self.vSeikatsuFu[i] = self.L5.vSeikatsuFu[i];
			self.vKyouiku[i] = self.L5.vKyouiku[i];
			self.vJyutaku[i] = self.L5.vJyutaku[i];
			self.vYR[i] = self.L5.vYR[i];

			// 【取得】資金残高

			//double[] vShikinZandaka = self.L6.vShikin;

			// 【取得】個人年金額

			self.vKojin_hon[i] = self.L9.vKojin_hon[i];
		}

//		for (var i=Age;i<=70;i++){
		for (var i = 0; i < self.mDataLength; i++) {
			// 【取得】遺族基礎年金、遺族厚生年金、遺族共済年金、寡婦年金
// ☆

			self.vIzokuKiso_hai[i] = self.L7.vIzokuKiso_hai[i];
			self.vIzokuKousei_hai[i] = self.L7.vIzokuKouseiS_hai[i];
			self.vIzokuKyousai_hai[i] = self.L7.vIzokuKyousaiS_hai[i];
			self.vKafunenkin_hai[i] = self.L7.vKafunenkin_hai[i];
		}

		var iAgeGap = LPdate.calcAge(self.MC.st_birthday_hon, self.MC.st_birthday_hai);

		var iLifespanHon;
		if (self.MC.id_sex_hon === 1) {
			iLifespanHon = self.DB.get_banksetupinfo().age_life_m;
		} else {
			iLifespanHon = self.DB.get_banksetupinfo().age_life_w;
		}

		// 2021/04/14 予備費用の使用方法を変更
		//self.vSum_Seikatsu_hon = self.DB.get_banksetupinfo().sm_yobi;
		self.vSum_Seikatsu_hon = 0;

		var g_PinHon = self.DB.get_mc_calc(false);
		var syokugyo_hon = self.MC.id_syokugyo_hon;
		var syokugyo_hai = self.MC.id_syokugyo_hai;

		// 【Lifeplan_問題管理票_社内.xls】No.031 対応
		for (var i = Age; i <= (Age + 35); i++) {

			self.vHitsuho_hai[i + index] = self.DB.get_banksetupinfo().sm_yobi;
			if (self.MC.is_kekkon()) {
				for (var j = i; j <= iLifespanHon; j++) {
					if (self.vKyouiku[j + index] > 0) {
						// 配偶者の生活費
						self.vHitsuho_hai[i + index] += self.vSeikatsuFu[j + index];
						// 子供の教育費
						self.vHitsuho_hai[i + index] += self.vKyouiku[j + index];
						if (i === Age) {
							self.vSum_Seikatsu_hon += self.vSeikatsuFu[j + index];
							self.vSum_Kyouiku_hon += self.vKyouiku[j + index];
						}

					} else {
						self.vHitsuho_hai[i + index] += (self.vSeikatsuFu[j + index] * self.DB.get_banksetupinfo().ra_livingcost_alone);
						if (i === Age) {
							self.vSum_Seikatsu_hon += (self.vSeikatsuFu[j + index] * self.DB.get_banksetupinfo().ra_livingcost_alone);
						}
					}

					self.vHitsuho_hai[i + index] += self.vJyutaku[j + index];
					if (i === Age) {
						self.vSum_Jyutaku_hon += self.vJyutaku[j + index];
					}

					// 本人収入・年金分の減額

					self.vHitsuho_hai[i + index] -= self.vNensyu_hon[j + index];
					self.vHitsuho_hai[i + index] -= self.vKojin_hon[j + index];
					self.vHitsuho_hai[i + index] -= (self.vNenkin_hon[j + index] - self.vShikyuteishi_hon[j + index]);
					if (i === Age) {
						self.vSum_Rourei_hon += (self.vNenkin_hon[j + index] - self.vShikyuteishi_hon[j + index]);
					}

					// 振替加算は相手が死亡時にも受給できるため、相殺しない。
					// 加給年金の相殺（公的年金受給額 vNenkin_hon に相手の加給年金が含まれているが死亡時には停止されるため、相殺する）
					self.vHitsuho_hai[i + index] += self.vKakyu_hon[j + index_hai - iAgeGap] + self.vKakyuTo_hon[j + index];

					if(j > (65 - iAgeGap)) {
						if(i === Age) {
						self.vSum_Rourei_hon += self.vKakyu_hon[j + index];
						}

					} else if(j >= (g_PinHon.JyukyuStAge - iAgeGap)) {
						if(i === Age) {
						self.vSum_Rourei_hon += self.vKakyuTo_hon[j + index];
						}
					}

					/****** 2014/01/20 必要保障額計上ロジックの修正（グラフと内訳の金額一致） start *******/
					self.vHitsuho_hai[i + index] += (self.vSyotokuzei_hon[j + index]
							+ self.vJyuminzei_hon[j + index]
							+ self.vNenkinhoken_hon[j + index]
							+ self.vShakaihoken_hon[j + index]
							+ self.vSeimei_hon[j + index]
							+ self.vEvent[j + index]
							- self.vSonotaSyunyu_hon[j + index]
							);

					/****** 2014/01/20 必要保障額計上ロジックの修正（グラフと内訳の金額一致） end *******/

				}

				// 遺族年金・死亡退職金分の減額
				// 遺族基礎年金を性別に関係なく加算する

				self.vHitsuho_hai[i + index] -= self.vIzokuKiso_hai[i - iAgeGap + index_hai];

				if (self.MC.id_sex_hon === 2) {
					if (syokugyo_hai === G_syokugyo.KAISYAIN ||
							syokugyo_hai === G_syokugyo.YAKUIN ||
							syokugyo_hai === G_syokugyo.TAI_KAISYAIN ||
							(syokugyo_hai === G_syokugyo.JIEIGYO && self.MC.id_kinmu_hon === 1) ||
							(syokugyo_hai === G_syokugyo.MUSYOKU && self.MC.id_kinmu_hon === 1)) {
						self.vHitsuho_hai[i + index] -= self.vIzokuKousei_hai[i - iAgeGap + index_hai];
					}
					if (syokugyo_hai === G_syokugyo.KOMUIN ||
							syokugyo_hai === G_syokugyo.TAI_KOMUIN ||
							(syokugyo_hai === G_syokugyo.JIEIGYO && self.MC.id_kinmu_hon === 2) ||
							(syokugyo_hai === G_syokugyo.MUSYOKU && self.MC.id_kinmu_hon === 2)) {
						self.vHitsuho_hai[i + index] -= self.vIzokuKyousai_hai[i - iAgeGap + index_hai];
					}
					self.vHitsuho_hai[i + index] -= self.vKafunenkin_hai[i - iAgeGap + index_hai];
				}

			} else if (self.MC.get_child_count() > 0) {
				for (var j = i; j <= 99; j++) {
					if (self.vKyouiku[j + index] > 0) {
						self.vHitsuho_hai[i + index] += (self.vSeikatsuFu[j + index] * self.DB.get_banksetupinfo().ra_livingcost_alone);
						self.vHitsuho_hai[i + index] += self.vJyutaku[j + index];
						self.vHitsuho_hai[i + index] += self.vKyouiku[j + index];
						if (i === Age) {
							self.vSum_Seikatsu_hon += (self.vSeikatsuFu[j + index] * self.DB.get_banksetupinfo().ra_livingcost_alone);
							self.vSum_Jyutaku_hon += self.vJyutaku[j + index];
							self.vSum_Kyouiku_hon += self.vKyouiku[j + index];
						}
					}
				}
			}

			// 【Lifeplan_問題管理票_社内.xls】No.071 対応

			if ((syokugyo_hai === G_syokugyo.KAISYAIN) || (syokugyo_hai === G_syokugyo.YAKUIN) || (syokugyo_hai === G_syokugyo.KOMUIN)) {
				if (i - iAgeGap < self.MC.get_age_taisyoku(true)) {
					// 【Lifeplan_問題管理票_社内.xls】No.031 対応

					self.vShibouTaikin_hai[i + index] = Util.excelRound((self.vNensyu_hai[i - iAgeGap + index_hai] * self.DB.get_banksetupinfo().ra_kotei / 100), 0) * 100;
					self.vHitsuho_hai[i + index] -= self.vShibouTaikin_hai[i - iAgeGap + index_hai];
				}
			}

			// 資金残高の減額

			if (i === Age) {
				self.vHitsuho_hai[i + index] -= self.MC.sm_assets;
			} else if (i - iAgeGap === self.MC.get_age_taisyoku(true)){
				self.vHitsuho_hai[i + index] -= self.L6.vShikin[i + index - 1] + self.L6.vZeibikiTaikin_hai[i + index];
			} else {
				self.vHitsuho_hai[i + index] -= self.L6.vShikin[i + index - 1];
				//self.vHitsuho_hai[i + index] -= self.MC.sm_assets;
			}

			// 2021/04/14 予備費用の使用方法を変更
			self.vHitsuho_hai[i + index] = Math.max(self.vHitsuho_hai[i + index], self.DB.get_banksetupinfo().sm_yobi);

		}
		self.vSeikatsu_hon[self.MC.age_hon + index] = self.vSum_Seikatsu_hon;
		self.vJyutaku_hon[self.MC.age_hon + index] = self.vSum_Jyutaku_hon;
		self.vKyouiku_hon[self.MC.age_hon + index] = self.vSum_Kyouiku_hon;
		self.vRourei_hon[self.MC.age_hon + index] = self.vSum_Rourei_hon;

	};
	p.dump = function(context, is_hai) {
		var p;
		var result;
		p = 0;
		if (!is_hai) {
			result = [];
			result[p++] = "8:ご本人様_死亡退職金\t";
			result[p++] = "8:ご本人様:必要保障額\t";
		} else {
			result = [];
			result[p++] = "8:配偶者様_死亡退職金\t";
			result[p++] = "8:配偶者様:必要保障額\t";
		}
		for (var i = 0; i < self.mDataLength; i++) {
			p = 0;
			if (!is_hai) {
				result[p++] += (self.vShibouTaikin_hon[i]) + "\t";
				result[p++] += (self.vHitsuho_hon[i]) + "\t";
			} else {
				result[p++] += (self.vShibouTaikin_hai[i]) + "\t";
				result[p++] += (self.vHitsuho_hai[i]) + "\t";
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

		data.vSeikatsuFu = self.vSeikatsuFu;
		data.vKyouiku = self.vKyouiku;
		data.vJyutaku = self.vJyutaku;
		data.vYR = self.vYR;
		data.vNensyu_hon = self.vNensyu_hon;
		data.vNensyu_hai = self.vNensyu_hai;
		data.vKojin_hai = self.vKojin_hai;
		data.vNenkin_hai = self.vNenkin_hai;
		data.vShikyuteishi_hai = self.vShikyuteishi_hai;
		data.vKakyu_hai = self.vKakyu_hai;
		data.vKakyuTo_hai = self.vKakyuTo_hai;
		data.vFurikae_hai = self.vFurikae_hai;
		data.vSyotokuzei_hai = self.vSyotokuzei_hai;
		data.vJyuminzei_hai = self.vJyuminzei_hai;
		data.vNenkinhoken_hai = self.vNenkinhoken_hai;
		data.vShakaihoken_hai = self.vShakaihoken_hai;
		data.vIzokuKiso_hai = self.vIzokuKiso_hai;
		data.vIzokuKousei_hai = self.vIzokuKousei_hai;
		data.vIzokuKyousai_hai = self.vIzokuKyousai_hai;
		data.vKafunenkin_hai = self.vKafunenkin_hai;
		data.vSeikatsu_hai = self.vSeikatsu_hai;
		data.vJyutaku_hai = self.vJyutaku_hai;
		data.vKyouiku_hai = self.vKyouiku_hai;
		data.vRourei_hai = self.vRourei_hai;
		data.vShibouTaikin_hon = self.vShibouTaikin_hon;
		data.vHitsuho_hon = self.vHitsuho_hon;

		data.vSeikatsu_hon = self.vSeikatsu_hon;
		data.vJyutaku_hon = self.vJyutaku_hon;
		data.vKyouiku_hon = self.vKyouiku_hon;
		data.vRourei_hon = self.vRourei_hon;
		data.vShibouTaikin_hai = self.vShibouTaikin_hai;
		data.vHitsuho_hai = self.vHitsuho_hai;

		LIFEPLAN.conf.storage.setItem("Logic08", JSON.stringify(data));
	};

	return Logic08;
})();