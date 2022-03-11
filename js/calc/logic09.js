/* global LIFEPLAN */

/**
 * (9) 加入保険診断
 */
"use strict";

// public class Logic09 extends BaseCalc
LIFEPLAN.calc.Logic09 = (function() {

	var self;
	var LPdate = new LIFEPLAN.db.LifePlanDB().LPdate;
	var Util = new LIFEPLAN.util.Util();

	var Logic09 = function(db) {
		self = this;
		LIFEPLAN.calc.BaseCalc.call(self, db);
		//出力値
		self.vSyushin_hon = [];	 		//ご本人様:終身保険
		self.vTeiki_hon = [];	 		//ご本人様:定期保険
		self.vSyunyuHo_hon = [];	 	//ご本人様:収入保障保険
		self.vYourou_hon = [];	 		//ご本人様:養老・学資保険
		self.vManki_hon = [];	 		//ご本人様:満期金
		self.vHenrei_hon = [];	 		//ご本人様:返戻金
		self.vSeimei_hon = [];	 		//ご本人様:生命保険料（新旧制度合計）
		// 2021/02/25 被保険者と契約者が違う場合のコード方法を変更する。_Haifutan_hon が付く変数を削除
		//            保険金については現行通り、保険料については
		//            本人の分の配偶者負担、配偶者の分の本人負担の変数を使用しないで
		//            契約者の保険料に含めるようにする。
		//self.vSeimei_Haifutan_hon = [];	//ご本人様:生命保険料_配偶者負担
		// 2021/02/25 生命保険料（旧制度）を追加
		self.vSeimei_old_hon = []; 		//ご本人様:生命保険料（旧制度）一時払除く
		self.vKojin_hon = [];	 		//ご本人様:個人年金（新旧制度合計）
		self.vNenkin_hon = [];	 		//ご本人様:年金保険料
		// 2021/02/25 被保険者と契約者が違う場合のコード方法を変更する。_Haifutan_hon が付く変数を削除
		//self.vNenkin_Haifutan_hon = [];	//ご本人様:年金保険料_配偶者負担
		// 2021/02/25 個人年金保険料（旧制度）を追加
		self.vNenkin_old_hon = [];		//ご本人様:個人年金保険料（旧制度）一時払除く
		self.vNyukyu_hon = [];	 		//ご本人様:入院給付金
		self.vGankyu_hon = [];	 		//ご本人様:ガン給付金
		self.vIryou_hon = [];	 		//ご本人様:医療保険料
		// 2021/02/25 被保険者と契約者が違う場合のコード方法を変更する。_Haifutan_hon が付く変数を削除
		//self.vIryou_Haifutan_hon = [];	//ご本人様:医療保険料_配偶者負担
		self.vGetsuHo_hon = [];	 		//ご本人様:月額払保険料
		self.vIchijiHo_hon = [];	 	//ご本人様:一時払保険料
		self.vSumHo_hon = [];	 		//ご本人様:払込保険料総額
		self.vGetsuHoSonota_hon = [];	//ご本人様:月額払その他保険料
		self.vSonota_hon = [];	 		//ご本人様:その他保険料

		self.vSyushin_hai = [];	 		//配偶者様:終身保険
		self.vTeiki_hai = [];	 		//配偶者様:定期保険
		self.vSyunyuHo_hai = [];	 	//配偶者様:収入保障保険
		self.vYourou_hai = [];	 		//配偶者様:養老・学資保険
		self.vManki_hai = [];	 		//配偶者様:満期金
		self.vHenrei_hai = [];	 		//配偶者様:返戻金
		self.vSeimei_hai = [];	 		//配偶者様:生命保険料
		// 2021/02/25 被保険者と契約者が違う場合のコード方法を変更する。_Haifutan_hai が付く変数を削除
		//self.vSeimei_Haifutan_hai = [];	//配偶者様:生命保険料_配偶者負担
		// 2021/02/25 生命保険料（旧制度）を追加。
		self.vSeimei_old_hai = []; 		//配偶者様:生命保険料（旧制度）一時払除く
		self.vKojin_hai = [];	 		//配偶者様:個人年金
		self.vNenkin_hai = [];	 		//配偶者様:年金保険料
		// 2021/02/25 被保険者と契約者が違う場合のコード方法を変更する。_Haifutan_hai が付く変数を削除
		//self.vNenkin_Haifutan_hai = [];	//配偶者様:年金保険料_配偶者負担
		// 2021/02/25 個人年金保険料（旧制度）を追加
		self.vNenkin_old_hai = [];		//配偶者様:個人年金保険料（旧制度）一時払除く
		self.vNyukyu_hai = [];	 		//配偶者様:入院給付金
		self.vGankyu_hai = [];	 		//配偶者様:ガン給付金
		self.vIryou_hai = [];	 		//配偶者様:医療保険料
		// 2021/02/25 被保険者と契約者が違う場合のコード方法を変更する。_Haifutan_hai が付く変数を削除
		//self.vIryou_Haifutan_hai = [];	//配偶者様:医療保険料_配偶者負担
		self.vGetsuHo_hai = [];	 		//配偶者様:月額払保険料
		self.vIchijiHo_hai = [];	 	//配偶者様:一時払保険料
		self.vSumHo_hai = [];	 		//配偶者様:払込保険料総額
		self.vSonota_hai = [];	 		//配偶者様:その他保険料
	};

	LIFEPLAN.module.inherits(Logic09, LIFEPLAN.calc.BaseCalc);

	var p = Logic09.prototype;

//	@Override
	p.setupData = function() {
		LIFEPLAN.calc.BaseCalc.prototype.setupData.call();
		if (self.mDataLength === 0) {
			return;
		}
		self.vSyushin_hon = self.makeArrayBuffer();
		self.vTeiki_hon = self.makeArrayBuffer();
		self.vSyunyuHo_hon = self.makeArrayBuffer();
		self.vYourou_hon = self.makeArrayBuffer();
		self.vManki_hon = self.makeArrayBuffer();
		self.vHenrei_hon = self.makeArrayBuffer();
		self.vSeimei_hon = self.makeArrayBuffer();
		//self.vSeimei_Haifutan_hon = self.makeArrayBuffer();
		self.vSeimei_old_hon = self.makeArrayBuffer();
		self.vKojin_hon = self.makeArrayBuffer();
		self.vNenkin_hon = self.makeArrayBuffer();
		//self.vNenkin_Haifutan_hon = self.makeArrayBuffer();
		self.vNenkin_old_hon = self.makeArrayBuffer();
		self.vNyukyu_hon = self.makeArrayBuffer();
		self.vGankyu_hon = self.makeArrayBuffer();
		self.vIryou_hon = self.makeArrayBuffer();
		//self.vIryou_Haifutan_hon = self.makeArrayBuffer();
		self.vGetsuHo_hon = self.makeArrayBuffer();
		self.vIchijiHo_hon = self.makeArrayBuffer();
		self.vSumHo_hon = self.makeArrayBuffer();
		self.vGetsuHoSonota_hon = self.makeArrayBuffer();
		self.vSonota_hon = self.makeArrayBuffer();

		self.vSyushin_hai = self.makeArrayBuffer();
		self.vTeiki_hai = self.makeArrayBuffer();
		self.vSyunyuHo_hai = self.makeArrayBuffer();
		self.vYourou_hai = self.makeArrayBuffer();
		self.vManki_hai = self.makeArrayBuffer();
		self.vHenrei_hai = self.makeArrayBuffer();
		self.vSeimei_hai = self.makeArrayBuffer();
		//self.vSeimei_Haifutan_hai = self.makeArrayBuffer();
		self.vSeimei_old_hai = self.makeArrayBuffer();
		self.vKojin_hai = self.makeArrayBuffer();
		self.vNenkin_hai = self.makeArrayBuffer();
		//self.vNenkin_Haifutan_hai = self.makeArrayBuffer();
		self.vNenkin_old_hai = self.makeArrayBuffer();
		self.vNyukyu_hai = self.makeArrayBuffer();
		self.vGankyu_hai = self.makeArrayBuffer();
		self.vIryou_hai = self.makeArrayBuffer();
		//self.vIryou_Haifutan_hai = self.makeArrayBuffer();
		self.vGetsuHo_hai = self.makeArrayBuffer();
		self.vIchijiHo_hai = self.makeArrayBuffer();
		self.vSumHo_hai = self.makeArrayBuffer();
		self.vSonota_hai = self.makeArrayBuffer();
	};

	p.logic09_Go = function() {
		// 2021/02/25 加入保険診断関数を本人・配偶者一本化
		//self.Calc45_KanyuhokenHon();
		self.Calc45_KanyuhokenHon(false);

		if (self.MC.is_kekkon()) {
			// 2021/02/25 加入保険診断関数を本人・配偶者一本化
			//self.Calc45_KanyuhokenHai();
			self.Calc45_KanyuhokenHon(true);
		}
		self.Calc47_KanyuhokenSonota();
	};

	p.Calc45_KanyuhokenHon = function(is_hai) {
		//var is_hai = false;
		var list = [];
		var vSyushin = []; 		//ご本人様:終身保険
		var vTeiki = [];	 		//ご本人様:定期保険
		var vSyunyuHo = [];	 	//ご本人様:収入保障保険
		var vYourou = [];	 		//ご本人様:養老・学資保険
		var vManki = [];	 		//ご本人様:満期金
		var vHenrei = [];	 		//ご本人様:返戻金

		var vSeimei = [];	 		//ご本人様:生命保険料（新旧制度合計）

		var vSeimei_old = [];	 	//ご本人様:生命保険料（旧制度）一時払除く

		var vSeimei_Haifutan = [];	//ご本人様:生命保険料_配偶者負担

		var vSeimei_Haifutan_old = [];	//ご本人様:生命保険料_配偶者負担（旧制度）一時払除く

		var vKojin = [];	 		//ご本人様:個人年金

		var vNenkin = [];	 		//ご本人様:年金保険料（新旧制度合計）

		var vNenkin_old = [];	 		//ご本人様:年金保険料（旧制度）一時払除く

		var vNenkin_Haifutan = [];	//ご本人様:年金保険料_配偶者負担

		var vNenkin_Haifutan_old = [];	//ご本人様:年金保険料_配偶者負担（旧制度）一時払除く

		var vNyukyu = [];	 		//ご本人様:入院給付金
		var vGankyu = [];	 		//ご本人様:ガン給付金
		var vIryou = [];	 		//ご本人様:医療保険料

		var vIryou_Haifutan = [];	//ご本人様:医療保険料_配偶者負担

		var vGetsuHo = [];	 		//ご本人様:月額払保険料

		var vIchijiHo = [];	 	//ご本人様:一時払保険料

		var vSumHo = [];	 		//ご本人様:払込保険料総額


		var index = self.getIndex(is_hai);
		var _Age;
		var _BirthDay;

		if (is_hai) {
			list = self.MC.get_hoken_list(2);
			_Age = self.MC.age_hai;
			_BirthDay = self.MC.st_birthday_hai;

			vSyushin = self.vSyushin_hai;
			vTeiki = self.vTeiki_hai;
			vSyunyuHo = self.vSyunyuHo_hai;
			vYourou = self.vYourou_hai;
			vManki = self.vManki_hai;
			vHenrei = self.vHenrei_hai;
			vSeimei = self.vSeimei_hai;
			vSeimei_old = self.vSeimei_old_hai;
			//vSeimei_Haifutan = self.vSeimei_Haifutan_hai;
			vSeimei_Haifutan = self.vSeimei_hon;
			vSeimei_Haifutan_old = self.vSeimei_old_hon;
			vKojin = self.vKojin_hai;
			vNenkin = self.vNenkin_hai;
			vNenkin_old = self.vNenkin_old_hai;
			//vNenkin_Haifutan = self.vNenkin_Haifutan_hai;
			vNenkin_Haifutan = self.vNenkin_hon;
			vNenkin_Haifutan_old = self.vNenkin_old_hon;
			vNyukyu = self.vNyukyu_hai;
			vGankyu = self.vGankyu_hai;
			vIryou = self.vIryou_hai;
			//vIryou_Haifutan = self.vIryou_Haifutan_hai;
			vIryou_Haifutan = self.vIryou_hon;
			vGetsuHo = self.vGetsuHo_hai;
			vIchijiHo = self.vIchijiHo_hai;
			vSumHo = self.vSumHo_hai;
		} else {
			list = self.MC.get_hoken_list(1);
			_Age = self.MC.age_hon;
			_BirthDay = self.MC.st_birthday_hon;

			vSyushin = self.vSyushin_hon;
			vTeiki = self.vTeiki_hon;
			vSyunyuHo = self.vSyunyuHo_hon;
			vYourou = self.vYourou_hon;
			vManki = self.vManki_hon;
			vHenrei = self.vHenrei_hon;
			vSeimei = self.vSeimei_hon;
			vSeimei_old = self.vSeimei_old_hon;
			//vSeimei_Haifutan = self.vSeimei_Haifutan_hon;
			vSeimei_Haifutan = self.vSeimei_hai;
			vSeimei_Haifutan_old = self.vSeimei_old_hai;
			vKojin = self.vKojin_hon;
			vNenkin = self.vNenkin_hon;
			vNenkin_old = self.vNenkin_old_hon;
			//vNenkin_Haifutan = self.vNenkin_Haifutan_hon;
			vNenkin_Haifutan = self.vNenkin_hai;
			vNenkin_Haifutan_old = self.vNenkin_old_hai;
			vNyukyu = self.vNyukyu_hon;
			vGankyu = self.vGankyu_hon;
			vIryou = self.vIryou_hon;
			//vIryou_Haifutan = self.vIryou_Haifutan_hon;
			vIryou_Haifutan = self.vIryou_hai;
			vGetsuHo = self.vGetsuHo_hon;
			vIchijiHo = self.vIchijiHo_hon;
			vSumHo = self.vSumHo_hon;
		}

		// 2021/02/24 生命保険料旧制度加味対応　旧制度の方が控除額大。一時払分は無視。
		// 生命保険料控除旧制度適用最終日時点の年齢
		var age_oldrow = LPdate.calcAge(_BirthDay, 20111231);

		var dGetsuHoHon = 0;
		var dIchijiHoHon = 0;
		var dSumHoHon = 0;


		for (var key in list) {
			var hoken = list[key];
			if (hoken === null) {
				break;
			}
			var goods = self.DB.get_insgoods(hoken.id_goods);
			if (goods === null) {
				break;
			}
			//生命保険系の保険金、保険料の集計
			if (goods.id_insclass <= 4) {
				//保険金額を保険区分ごとに集計
				//終身保険
				if (goods.id_insclass === 1) {
					for (var i = hoken.age_keiyaku; i <= 100; i++) {
						vSyushin[i + index] += hoken.sm_hokenkin;
					}
					//定期保険
				} else if (goods.id_insclass === 2) {
					for (var i = hoken.age_keiyaku; i < hoken.id_kikan1; i++) {
						vTeiki[i + index] += hoken.sm_hokenkin;
					}
					//収入保障保険
				} else if (goods.id_insclass === 3) {
					for (var i = hoken.age_keiyaku; i < hoken.id_kikan1; i++) {
						vSyunyuHo[i + index] += hoken.sm_hokenkin * (hoken.id_kikan1 - i);
					}
					//養老・学資保険
				} else if (goods.id_insclass === 4) {
					for (var i = hoken.age_keiyaku; i < hoken.id_kikan1; i++) {
						vYourou[i + index] += hoken.sm_hokenkin;
					}
					vManki[hoken.id_kikan1 + index] += hoken.sm_hokenkin;
				}
				//保険料を保険区分ごとに集計
				if (goods.id_haraikomi > 0 && hoken.id_haraikomi > 0) {
					var dHoryou = 0;

					for (var i = hoken.age_keiyaku; i < hoken.age_haraikomi; i++) {

						if (hoken.id_policy === 1) {
							vSeimei[i + index] += hoken.sm_hokenryo * 12 / hoken.id_haraikomi;
							// 2021/02/24 生命保険料旧制度加味対応　…誕生日に契約したものとする
							if (hoken.age_keiyaku <= age_oldrow){
								vSeimei_old[i + index] += hoken.sm_hokenryo * 12 / hoken.id_haraikomi;
							}
						} else if (hoken.id_policy === 2) {
							vSeimei_Haifutan[i + index] += hoken.sm_hokenryo * 12 / hoken.id_haraikomi;
							// 2021/02/24 生命保険料旧制度加味対応
							if (hoken.age_keiyaku <= age_oldrow){
								vSeimei_Haifutan_old[i + index] += hoken.sm_hokenryo * 12 / hoken.id_haraikomi;
							}
						}

						dHoryou += hoken.sm_hokenryo * 12 / hoken.id_haraikomi;
						dSumHoHon += hoken.sm_hokenryo * 12 / hoken.id_haraikomi;
					}

					dGetsuHoHon += hoken.sm_hokenryo / hoken.id_haraikomi;

					if (goods.id_insclass === 1) {
						for (var i = hoken.age_keiyaku; i <= 100; i++) {
							vHenrei[i + index] += Util.excelMin(dHoryou * Math.pow(1 + goods.ra_henrei, i - hoken.age_keiyaku + 1), hoken.sm_hokenkin);
						}
					}
				} else {
					//goods.id_haraikomiが0なのにage_haraikomiが使用されていて
					//落ちるのでチェックを追加
					if (hoken.id_policy === 1) {
						vSeimei[hoken.age_keiyaku + index] += hoken.sm_hokenryo;
					} else {
						vSeimei_Haifutan[hoken.age_keiyaku + index] += hoken.sm_hokenryo;
					}


					dIchijiHoHon += hoken.sm_hokenryo;
					dSumHoHon += hoken.sm_hokenryo;
					if (goods.id_insclass === 1) {
						for (var i = hoken.age_keiyaku; i <= 100; i++) {
							vHenrei[i + index] += Util.excelMin(hoken.sm_hokenryo * Math.pow(1 + goods.ra_henrei, i - hoken.age_keiyaku + 1), hoken.sm_hokenkin);
						}
					}
				}
			//個人年金系の保険金、保険料の集計
			} else if (goods.id_insclass === 5) {
				//保険金額を保険区分ごとに集計
				//年金保険
				if (goods.id_syushin === 1) {
					for (var i = hoken.id_kikan1; i <= 100; i++) {
						vKojin[i + index] += hoken.sm_hokenkin;
					}
				} else {
					for (var i = hoken.id_kikan1; i < hoken.id_kikan2; i++) {
						vKojin[i + index] += hoken.sm_hokenkin;
					}
				}
				//保険料を保険区分ごとに集計
				if (goods.id_haraikomi > 0 && hoken.id_haraikomi > 0) {
					for (var i = hoken.age_keiyaku; i < hoken.age_haraikomi; i++) {
						if (hoken.id_policy === 1) {
							vNenkin[i + index] += hoken.sm_hokenryo * 12 / hoken.id_haraikomi;
							// 2021/02/24 生命保険料旧制度加味対応
							if (hoken.age_keiyaku <= age_oldrow){
								vNenkin_old[i + index] += hoken.sm_hokenryo * 12 / hoken.id_haraikomi;
							}
						} else if (hoken.id_policy === 2) {
							vNenkin_Haifutan[i + index] += hoken.sm_hokenryo * 12 / hoken.id_haraikomi;
							// 2021/02/24 生命保険料旧制度加味対応
							if (hoken.age_keiyaku <= age_oldrow){
								vNenkin_Haifutan_old[i + index] += hoken.sm_hokenryo * 12 / hoken.id_haraikomi;
							}
						}

						dSumHoHon += hoken.sm_hokenryo * 12 / hoken.id_haraikomi;
					}
					dGetsuHoHon += hoken.sm_hokenryo / hoken.id_haraikomi;
				} else {
					if (hoken.id_policy === 1) {
						vNenkin[hoken.age_keiyaku + index] += hoken.sm_hokenryo;
					} else {
						vNenkin_Haifutan[hoken.age_keiyaku + index] += hoken.sm_hokenryo;
					}
					dIchijiHoHon += hoken.sm_hokenryo;
					dSumHoHon += hoken.sm_hokenryo;
				}
			//医療系の保険金、保険料の集計
			} else if (goods.id_insclass <= 7) {
				//保険金額を保険区分ごとに集計
				//医療保険
				if (goods.id_insclass === 6) {
					if (goods.id_syushin === 1) {
						for (var i = hoken.age_keiyaku; i <= 100; i++) {
							vNyukyu[i + index] += hoken.sm_hokenkin;
						}
					} else {
						for (var i = hoken.age_keiyaku; i < hoken.id_kikan1; i++) {
							vNyukyu[i + index] += hoken.sm_hokenkin;
						}
					}
				} else if (goods.id_insclass === 7) {
					//ガン保険
					if (goods.id_syushin === 1) {
						for (var i = hoken.age_keiyaku; i <= 100; i++) {
							vGankyu[i + index] += hoken.sm_hokenkin;
						}
					} else {
						for (var i = hoken.age_keiyaku; i < hoken.id_kikan1; i++) {
							vGankyu[i + index] += hoken.sm_hokenkin;
						}
					}
				}
				//保険料を保険区分ごとに集計
				if (goods.id_haraikomi > 0 && hoken.id_haraikomi > 0) {
					for (var i = hoken.age_keiyaku; i < hoken.age_haraikomi; i++) {
						if (hoken.id_policy === 1) {
							vIryou[i + index] += hoken.sm_hokenryo * 12 / hoken.id_haraikomi;
						} else if (hoken.id_policy === 2) {
							vIryou_Haifutan[i + index] += hoken.sm_hokenryo * 12 / hoken.id_haraikomi;
						}

						dSumHoHon += hoken.sm_hokenryo * 12 / hoken.id_haraikomi;
					}
					dGetsuHoHon += hoken.sm_hokenryo / hoken.id_haraikomi;
				} else {
					if (hoken.id_policy === 1) {
						vIryou[hoken.age_keiyaku + index] += hoken.sm_hokenryo;
					} else {
						vIryou_Haifutan[hoken.age_keiyaku + index] += hoken.sm_hokenryo;
					}
					dIchijiHoHon += hoken.sm_hokenryo;
					dSumHoHon += hoken.sm_hokenryo;
				}
			}
		}
		vSumHo[_Age + index] = dSumHoHon;
		vGetsuHo[_Age + index] = dGetsuHoHon;
		vIchijiHo[_Age + index] = dIchijiHoHon;
	};

// 2021/02/25 ここから削除　加入保険関数を本人・配偶者一本化　加入保険関数を本人・配偶者一本化のため配偶者用関数を削除
//	p.Calc45_KanyuhokenHai = function()
// 2021/02/25 ここまで削除　加入保険関数を本人・配偶者一本化　加入保険関数を本人・配偶者一本化のため配偶者用関数を削除

	p.Calc47_KanyuhokenSonota = function() {
		var list = self.MC.get_hoken_list(3);

		var index = self.getIndex(false);
		var index_hai = self.getIndex(true);
		var dGetsuHo = 0;

		for (var key in list) {
			var hoken = list[key];

			if (hoken === null) {
				break;
			}
			var goods = self.DB.get_insgoods(hoken.id_goods);
			if (goods === null) {
				break;
			}

			if (goods.id_haraikomi > 0) {
				for (var i = hoken.age_keiyaku; i < hoken.age_haraikomi; i++) {
					if (hoken.id_policy === 1) {
						self.vSonota_hon[i + index] += hoken.sm_hokenryo * 12 / hoken.id_haraikomi;
					} else if (hoken.id_policy === 2) {
						self.vSonota_hai[i + index_hai] += hoken.sm_hokenryo * 12 / hoken.id_haraikomi;
					}
				}
				dGetsuHo += hoken.sm_hokenryo / hoken.id_haraikomi;
			} else {
				if (hoken.id_policy === 1) {
					self.vSonota_hon[hoken.age_keiyaku + index] += hoken.sm_hokenryo;
				} else {
					self.vSonota_hai[hoken.age_keiyaku + index_hai] += hoken.sm_hokenryo;
				}
			}
		}
		self.vGetsuHoSonota_hon[self.MC.age_hon + index] = dGetsuHo;
	};

// 2021/02/25 ここから旧ロジック削除　大幅に修正するため以下4関数を削除し、後ろに同名関数を追加
//	// 計算式（48_a）所得税生命保険料控除
//	p.Calc48a_SyoSeihokoujyo = function(is_hai, pAge)
//	// 計算式（48_b）住民税生命保険料控除
//	p.Calc48b_JyuSeihokoujyo = function(is_hai, pAge)
//	// 計算式（49_a）所得税個人年金保険料控除
//	p.Calc49a_SyoNenhokoujyo = function(is_hai, pAge)
//	// 計算式（49_b）住民税個人年金保険料控除
//	p.Calc49b_JyuNenhokoujyo = function(is_hai, pAge)
// 2021/02/25 ここまで旧ロジック削除


	// 所得税生命保険料控除
	//     生命保険、個人年金、介護医療保険共通　…　介護医療保険は20120101以降のみ
	p.Get_SyoSeihokoujyo = function(fee, ymd_keiyaku) {

		var syoSeihokoujyoMap = [
			  { le_ymd: 20111231,    le_fee:  25000,    keisu:  1     ,    kasan:     0,    row:0 }
			, { le_ymd: 20111231,    le_fee:  50000,    keisu:  0.5   ,    kasan: 12500,    row:1 }
			, { le_ymd: 20111231,    le_fee: 100000,    keisu:  0.25  ,    kasan: 25000,    row:2 }
			, { le_ymd: 20111231,                       keisu:  0     ,    kasan: 50000,    row:3 }
			, {                      le_fee:  20000,    keisu:  1     ,    kasan:     0,    row:4 }
			, {                      le_fee:  40000,    keisu:  0.5   ,    kasan: 10000,    row:5 }
			, {                      le_fee:  80000,    keisu:  0.25  ,    kasan: 20000,    row:6 }
			, {                                         keisu:  0     ,    kasan: 40000,    row:7 }
		];

		var rec;
		var result;

		result = syoSeihokoujyoMap.some( function(v) {
			if (typeof ymd_keiyaku === "undefined" || typeof fee === "undefined") {
				return false;
			}
			if (typeof v.le_ymd === "undefined" || ymd_keiyaku <= v.le_ymd) {
				if (typeof v.le_fee === "undefined" || fee <= v.le_fee) {
					rec = v;
					return true;
				}
			}
		});

		if (result === false) {
			console.log("error syoSeihokoujyoMap.");
		}

		var dKoujyo = fee * rec.keisu + rec.kasan;

		return dKoujyo;
	};

	// 住民税生命保険料控除
	//     生命保険、個人年金、介護医療保険共通　…　介護医療保険は20120101以降のみ
	p.Get_JyuSeihokoujyo = function(fee, ymd_keiyaku) {

		var jyuSeihokoujyoMap = [
			  { le_ymd: 20111231,    le_fee:  15000,    keisu:  1     ,    kasan:     0,    row:0 }
			, { le_ymd: 20111231,    le_fee:  40000,    keisu:  0.5   ,    kasan:  7500,    row:1 }
			, { le_ymd: 20111231,    le_fee:  70000,    keisu:  0.25  ,    kasan: 17500,    row:2 }
			, { le_ymd: 20111231,                       keisu:  0     ,    kasan: 35000,    row:3 }
			, {                      le_fee:  12000,    keisu:  1     ,    kasan:     0,    row:4 }
			, {                      le_fee:  32000,    keisu:  0.5   ,    kasan:  6000,    row:5 }
			, {                      le_fee:  56000,    keisu:  0.25  ,    kasan: 14000,    row:6 }
			, {                                         keisu:  0     ,    kasan: 28000,    row:7 }
		];

		var rec;
		var result;

		result = jyuSeihokoujyoMap.some( function(v) {
			if (typeof ymd_keiyaku === "undefined" || typeof fee === "undefined") {
				return false;
			}
			if (typeof v.le_ymd === "undefined" || ymd_keiyaku <= v.le_ymd) {
				if (typeof v.le_fee === "undefined" || fee <= v.le_fee) {
					rec = v;
					return true;
				}
			}
		});

		if (result === false) {
			console.log("error jyuSeihokoujyoMap.");
		}

		var dKoujyo = fee * rec.keisu + rec.kasan;

		return dKoujyo;
	};

	// 計算式（48a）所得税生命保険料控除
	p.Calc48a_SyoSeihokoujyo = function(is_hai, pAge) {

		var vSeimei_old = [];     //生命保険料（旧制度）一時払除く
		var vSeimei = [];         //生命保険料（新旧制度合計）　…一時払含まれるが契約年のみ控除される

		if (is_hai) {
			vSeimei_old = self.vSeimei_old_hai;
			vSeimei = self.vSeimei_hai;
		} else {
			vSeimei_old = self.vSeimei_old_hon;
			vSeimei = self.vSeimei_hon;
		}

		var index = self.getIndex(is_hai);
		var dOldFee = vSeimei_old[pAge + index];
		var dNewFee = vSeimei[pAge + index] - vSeimei_old[pAge + index];

		var dOldKojo = self.Get_SyoSeihokoujyo(dOldFee, 20111231);
		var dNewKojo = self.Get_SyoSeihokoujyo(dNewFee, 20120101);

		var dKoujyo = Math.max(dOldKojo, dNewKojo, Math.min(dOldKojo + dNewKojo, 40000));

		return dKoujyo;
	};

	// 計算式（49a）住民税生命保険料控除
	p.Calc49a_JyuSeihokoujyo = function(is_hai, pAge) {

		var vSeimei_old = [];     //生命保険料（旧制度）一時払除く
		var vSeimei = [];         //生命保険料（新旧制度合計）　…一時払含まれるが契約年のみ控除される

		if (is_hai) {
			vSeimei_old = self.vSeimei_old_hai;
			vSeimei = self.vSeimei_hai;
		} else {
			vSeimei_old = self.vSeimei_old_hon;
			vSeimei = self.vSeimei_hon;
		}

		var index = self.getIndex(is_hai);
		var dOldFee = vSeimei_old[pAge + index];
		var dNewFee = vSeimei[pAge + index] - vSeimei_old[pAge + index];

		var dOldKojo = self.Get_JyuSeihokoujyo(dOldFee, 20111231);
		var dNewKojo = self.Get_JyuSeihokoujyo(dNewFee, 20120101);

		var dKoujyo = Math.max(dOldKojo, dNewKojo, Math.min(dOldKojo + dNewKojo, 28000));

		return dKoujyo;
	};

	// 計算式（48b）所得税個人年金保険料控除
	p.Calc48b_SyoNenhokoujyo = function(is_hai, pAge) {

		var vNenkin_old = [];     //年金保険料（旧制度）一時払除く
		var vNenkin = [];         //年金保険料（新旧制度合計）　…一時払含まれるが契約年のみ控除される

		if (is_hai) {
			vNenkin_old = self.vNenkin_old_hai;
			vNenkin = self.vNenkin_hai;
		} else {
			vNenkin_old = self.vNenkin_old_hon;
			vNenkin = self.vNenkin_hon;
		}

		var index = self.getIndex(is_hai);
		var dOldFee = vNenkin_old[pAge + index];
		var dNewFee = vNenkin[pAge + index] - vNenkin_old[pAge + index];

		var dOldKojo = self.Get_SyoSeihokoujyo(dOldFee, 20111231);
		var dNewKojo = self.Get_SyoSeihokoujyo(dNewFee, 20120101);

		var dKoujyo = Math.max(dOldKojo, dNewKojo, Math.min(dOldKojo + dNewKojo, 40000));

		return dKoujyo;
	};

	// 計算式（49b）住民税個人年金保険料控除
	p.Calc49b_JyuNenhokoujyo = function(is_hai, pAge) {

		var vNenkin_old = [];     //年金保険料（旧制度）一時払除く
		var vNenkin = [];         //年金保険料（新旧制度合計）　…一時払含まれるが契約年のみ控除される

		if (is_hai) {
			vNenkin_old = self.vNenkin_old_hai;
			vNenkin = self.vNenkin_hai;
		} else {
			vNenkin_old = self.vNenkin_old_hon;
			vNenkin = self.vNenkin_hon;
		}

		var index = self.getIndex(is_hai);
		var dOldFee = vNenkin_old[pAge + index];
		var dNewFee = vNenkin[pAge + index] - vNenkin_old[pAge + index];

		var dOldKojo = self.Get_JyuSeihokoujyo(dOldFee, 20111231);
		var dNewKojo = self.Get_JyuSeihokoujyo(dNewFee, 20120101);

		var dKoujyo = Math.max(dOldKojo, dNewKojo, Math.min(dOldKojo + dNewKojo, 28000));

		return dKoujyo;
	};

	// 計算式（48a）所得税介護医療保険料控除
	p.Calc48c_SyoIryhokoujyo = function(is_hai, pAge) {

		var vIryou = [];          //医療保険料　…一時払含まれるが契約年のみ控除される

		if (is_hai) {
			vIryou = self.vIryou_hai;
		} else {
			vIryou = self.vIryou_hon;
		}

		var index = self.getIndex(is_hai);

		var dKoujyo = self.Get_SyoSeihokoujyo(vIryou[pAge + index], 20120101);

		return dKoujyo;
	};

	// 計算式（49c）住民税介護医療保険料控除
	p.Calc49c_JyuIryhokoujyo = function(is_hai, pAge) {

		var vIryou = [];          //医療保険料　…一時払含まれるが契約年のみ控除される

		if (is_hai) {
			vIryou = self.vIryou_hai;
		} else {
			vIryou = self.vIryou_hon;
		}

		var index = self.getIndex(is_hai);

		var dKoujyo = self.Get_JyuSeihokoujyo(vIryou[pAge + index], 20120101);

		return dKoujyo;
	};

	p.dump = function(context, is_hai) {
		var result;
		var p = 0;
		if (!is_hai) {
			result = [];

			result[p++] = "9:ご本人様:終身保険\t";
			result[p++] = "9:ご本人様:定期保険\t";
			result[p++] = "9:ご本人様:収入保障保険\t";
			result[p++] = "9:ご本人様:養老・学資保険\t";
			result[p++] = "9:ご本人様:満期金\t";
			result[p++] = "9:ご本人様:返戻金\t";
			result[p++] = "9:ご本人様:生命保険料\t";
			result[p++] = "9:ご本人様:生命保険料_旧制度\t";
			result[p++] = "9:ご本人様:個人年金\t";
			result[p++] = "9:ご本人様:個人年金保険料\t";
			result[p++] = "9:ご本人様:個人年金保険料_旧制度\t";
			result[p++] = "9:ご本人様:入院給付金\t";
			result[p++] = "9:ご本人様:ガン給付金\t";
			result[p++] = "9:ご本人様:医療保険料\t";
			result[p++] = "9:ご本人様:医療保険料●この行後で削除●\t";
			result[p++] = "9:ご本人様:月額払保険料\t";
			result[p++] = "9:ご本人様:一時払保険料\t";
			result[p++] = "9:ご本人様:払込保険料総額\t";
			result[p++] = "9:ご本人様:月額払その他保険料\t";
			result[p++] = "9:ご本人様:その他保険料\t";
		} else {
			result = [];
			result[p++] = "9:配偶者様:終身保険\t";
			result[p++] = "9:配偶者様:定期保険\t";
			result[p++] = "9:配偶者様:収入保障保険\t";
			result[p++] = "9:配偶者様:養老・学資保険\t";
			result[p++] = "9:配偶者様:満期金\t";
			result[p++] = "9:配偶者様:返戻金\t";
			result[p++] = "9:配偶者様:生命保険料\t";
			result[p++] = "9:配偶者様:生命保険料_旧制度\t";
			result[p++] = "9:配偶者様:個人年金\t";
			result[p++] = "9:配偶者様:個人年金保険料\t";
			result[p++] = "9:配偶者様:個人年金保険料_旧制度\t";
			result[p++] = "9:配偶者様:入院給付金\t";
			result[p++] = "9:配偶者様:ガン給付金\t";
			result[p++] = "9:配偶者様:医療保険料\t";
			result[p++] = "9:配偶者様:医療保険料●この行後で削除●\t";
			result[p++] = "9:配偶者様:月額払保険料\t";
			result[p++] = "9:配偶者様:一時払保険料\t";
			result[p++] = "9:配偶者様:払込保険料総額\t";
			result[p++] = "9:配偶者様:その他保険料\t";
		}
		for (var i = 0; i < self.mDataLength; i++) {
			p = 0;
			if (!is_hai) {
				result[p++] += (self.vSyushin_hon[i]) + "\t";
				result[p++] += (self.vTeiki_hon[i]) + "\t";
				result[p++] += (self.vSyunyuHo_hon[i]) + "\t";
				result[p++] += (self.vYourou_hon[i]) + "\t";
				result[p++] += (self.vManki_hon[i]) + "\t";
				result[p++] += (self.vHenrei_hon[i]) + "\t";
				result[p++] += (self.vSeimei_hon[i]) + "\t";
				//result[p++] += (self.vSeimei_Haifutan_hon[i]) + "\t";
				result[p++] += (self.vSeimei_old_hon[i]) + "\t";
				result[p++] += (self.vKojin_hon[i]) + "\t";
				result[p++] += (self.vNenkin_hon[i]) + "\t";
				//result[p++] += (self.vNenkin_Haifutan_hon[i]) + "\t";
				result[p++] += (self.vNenkin_old_hon[i]) + "\t";
				result[p++] += (self.vNyukyu_hon[i]) + "\t";
				result[p++] += (self.vGankyu_hon[i]) + "\t";
				result[p++] += (self.vIryou_hon[i]) + "\t";
				//result[p++] += (self.vIryou_Haifutan_hon[i]) + "\t";
				result[p++] += "●この行後で削除●\t";
				result[p++] += (self.vGetsuHo_hon[i]) + "\t";
				result[p++] += (self.vIchijiHo_hon[i]) + "\t";
				result[p++] += (self.vSumHo_hon[i]) + "\t";
				result[p++] += (self.vGetsuHoSonota_hon[i]) + "\t";
				result[p++] += (self.vSonota_hon[i]) + "\t";
			} else {
				result[p++] += (self.vSyushin_hai[i]) + "\t";
				result[p++] += (self.vTeiki_hai[i]) + "\t";
				result[p++] += (self.vSyunyuHo_hai[i]) + "\t";
				result[p++] += (self.vYourou_hai[i]) + "\t";
				result[p++] += (self.vManki_hai[i]) + "\t";
				result[p++] += (self.vHenrei_hai[i]) + "\t";
				result[p++] += (self.vSeimei_hai[i]) + "\t";
				//result[p++] += (self.vSeimei_Haifutan_hai[i]) + "\t";
				result[p++] += (self.vSeimei_old_hai[i]) + "\t";
				result[p++] += (self.vKojin_hai[i]) + "\t";
				result[p++] += (self.vNenkin_hai[i]) + "\t";
				//result[p++] += (self.vNenkin_Haifutan_hai[i]) + "\t";
				result[p++] += (self.vNenkin_old_hai[i]) + "\t";
				result[p++] += (self.vNyukyu_hai[i]) + "\t";
				result[p++] += (self.vGankyu_hai[i]) + "\t";
				result[p++] += (self.vIryou_hai[i]) + "\t";
				//result[p++] += (self.vIryou_Haifutan_hai[i]) + "\t";
				result[p++] += "●この行後で削除●\t";
				result[p++] += (self.vGetsuHo_hai[i]) + "\t";
				result[p++] += (self.vIchijiHo_hai[i]) + "\t";
				result[p++] += (self.vSumHo_hai[i]) + "\t";
				result[p++] += (self.vSonota_hai[i]) + "\t";
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

		data.vSyushin_hon = self.vSyushin_hon;
		data.vTeiki_hon = self.vTeiki_hon;
		data.vSyunyuHo_hon = self.vSyunyuHo_hon;
		data.vYourou_hon = self.vYourou_hon;
		data.vManki_hon = self.vManki_hon;
		data.vHenrei_hon = self.vHenrei_hon;
		data.vSeimei_hon = self.vSeimei_hon;
		//data.vSeimei_Haifutan_hon = self.vSeimei_Haifutan_hon;
		data.vSeimei_old_hon = self.vSeimei_old_hon;
		data.vKojin_hon = self.vKojin_hon;
		data.vNenkin_hon = self.vNenkin_hon;
		//data.vNenkin_Haifutan_hon = self.vNenkin_Haifutan_hon;
		data.vNenkin_old_hon = self.vNenkin_old_hon;
		data.vNyukyu_hon = self.vNyukyu_hon;
		data.vGankyu_hon = self.vGankyu_hon;
		data.vIryou_hon = self.vIryou_hon;
		//data.vIryou_Haifutan_hon = self.vIryou_Haifutan_hon;
		data.vGetsuHo_hon = self.vGetsuHo_hon;
		data.vIchijiHo_hon = self.vIchijiHo_hon;
		data.vSumHo_hon = self.vSumHo_hon;
		data.vGetsuHoSonota_hon = self.vGetsuHoSonota_hon;
		data.vSonota_hon = self.vSonota_hon;

		data.vSyushin_hai = self.vSyushin_hai;
		data.vTeiki_hai = self.vTeiki_hai;
		data.vSyunyuHo_hai = self.vSyunyuHo_hai;
		data.vYourou_hai = self.vYourou_hai;
		data.vManki_hai = self.vManki_hai;
		data.vHenrei_hai = self.vHenrei_hai;
		data.vSeimei_hai = self.vSeimei_hai;
		//data.vSeimei_Haifutan_hai = self.vSeimei_Haifutan_hai;
		data.vSeimei_old_hai = self.vSeimei_old_hai;
		data.vKojin_hai = self.vKojin_hai;
		data.vNenkin_hai = self.vNenkin_hai;
		//data.vNenkin_Haifutan_hai = self.vNenkin_Haifutan_hai;
		data.vNenkin_old_hai = self.vNenkin_old_hai;
		data.vNyukyu_hai = self.vNyukyu_hai;
		data.vGankyu_hai = self.vGankyu_hai;
		data.vIryou_hai = self.vIryou_hai;
		//data.vIryou_Haifutan_hai = self.vIryou_Haifutan_hai;
		data.vGetsuHo_hai = self.vGetsuHo_hai;
		data.vIchijiHo_hai = self.vIchijiHo_hai;
		data.vSumHo_hai = self.vSumHo_hai;
		data.vSonota_hai = self.vSonota_hai;

		LIFEPLAN.conf.storage.setItem("Logic09", JSON.stringify(data));
	};

	return Logic09;
})();