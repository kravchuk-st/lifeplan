/* global LIFEPLAN */

/**
 * （3）老齢年金受給額推計

 * 【計算】依存関係：（2）標準報酬額推計ロジック
 */
"use strict";

// public class Logic03 extends BaseCalc
LIFEPLAN.calc.Logic03 = (function() {

	var self;
	var G_syokugyo = new LIFEPLAN.db.LifePlanDB().G_syokugyo;
	var LPdate = new LIFEPLAN.db.LifePlanDB().LPdate;
	var Util = new LIFEPLAN.util.Util();

	var Logic03 = function(db) {
		self = this;
		LIFEPLAN.calc.BaseCalc.call(self, db);
		//出力値
		self.vKiso_hon = [];          //ご本人様:老齢基礎年金
		self.vKousei_hon = [];            //ご本人様:老齢厚生年金
		self.vKouseiBu_hon = [];      //ご本人様:老齢厚生年金・部分
		self.vKouseiTo_hon = [];      //ご本人様:老齢厚生年金・特別
		self.vKyousai_hon = [];           //ご本人様:退職共済年金
		self.vKyousaiBu_hon = [];     //ご本人様:退職共済年金・部分
		self.vKyousaiTo_hon = [];     //ご本人様:退職共済年金・特別
		self.vKakyu_hon = [];         //ご本人様:加給年金
		self.vKakyuTo_hon = [];           //ご本人様:加給年金・特別
		self.vFurikae_hon = [];           //ご本人様:振替加算
		self.vKouseiNenkin_hon = [];  //ご本人様:将来厚生年金額
		self.vNenkin_hon = [];            //ご本人様:将来年金額
		self.vShikyuteishi_hon = [];  //ご本人様:在職支給停止額

		self.vKiso_hai = [];          //配偶者様:老齢基礎年金
		self.vKousei_hai = [];            //配偶者様:老齢厚生年金
		self.vKouseiBu_hai = [];      //配偶者様:老齢厚生年金・部分
		self.vKouseiTo_hai = [];      //配偶者様:老齢厚生年金・特別
		self.vKyousai_hai = [];           //配偶者様:退職共済年金
		self.vKyousaiBu_hai = [];     //配偶者様:退職共済年金・部分
		self.vKyousaiTo_hai = [];     //配偶者様:退職共済年金・特別
		self.vKakyu_hai = [];         //配偶者様:加給年金
		self.vKakyuTo_hai = [];           //配偶者様:加給年金・特別
		self.vFurikae_hai = [];           //配偶者様:振替加算
		self.vKouseiNenkin_hai = [];  //配偶者様:将来厚生年金額
		self.vNenkin_hai = [];            //配偶者様:将来年金額
		self.vShikyuteishi_hai = [];  //配偶者様:在職支給停止額

		self.vJyukyuStAge_hon = 0; //ご本人様:受給開始年齢
		self.vJyukyuStAge_hai = 0; //配偶者様:受給開始年齢

		self.bVisibleKakyu_hon = {};
		self.bVisibleKakyu_hai = {};
		self.bVisibleFurikae_hon = {};
		self.bVisibleFurikae_hai = {};

		self.L2;
		self.L3;
	};

	LIFEPLAN.module.inherits(Logic03, LIFEPLAN.calc.BaseCalc);

	var p = Logic03.prototype;

//	@Override
	p.setupData = function() {
		LIFEPLAN.calc.BaseCalc.prototype.setupData.call();
		if (self.mDataLength === 0) {
			return;
		}
		self.vKiso_hon = self.makeArrayBuffer();
		self.vKousei_hon = self.makeArrayBuffer();
		self.vKouseiBu_hon = self.makeArrayBuffer();
		self.vKouseiTo_hon = self.makeArrayBuffer();
		self.vKyousai_hon = self.makeArrayBuffer();
		self.vKyousaiBu_hon = self.makeArrayBuffer();
		self.vKyousaiTo_hon = self.makeArrayBuffer();
		self.vKakyu_hon = self.makeArrayBuffer();
		self.vKakyuTo_hon = self.makeArrayBuffer();
		self.vFurikae_hon = self.makeArrayBuffer();
		self.vKouseiNenkin_hon = self.makeArrayBuffer();
		self.vNenkin_hon = self.makeArrayBuffer();
		self.vShikyuteishi_hon = self.makeArrayBuffer();
		self.bVisibleKakyu_hon = self.makebooleanBuffer();
		self.bVisibleFurikae_hon = self.makebooleanBuffer();

		self.vKiso_hai = self.makeArrayBuffer();
		self.vKousei_hai = self.makeArrayBuffer();
		self.vKouseiBu_hai = self.makeArrayBuffer();
		self.vKouseiTo_hai = self.makeArrayBuffer();
		self.vKyousai_hai = self.makeArrayBuffer();
		self.vKyousaiBu_hai = self.makeArrayBuffer();
		self.vKyousaiTo_hai = self.makeArrayBuffer();
		self.vKakyu_hai = self.makeArrayBuffer();
		self.vKakyuTo_hai = self.makeArrayBuffer();
		self.vFurikae_hai = self.makeArrayBuffer();
		self.vKouseiNenkin_hai = self.makeArrayBuffer();
		self.vNenkin_hai = self.makeArrayBuffer();
		self.vShikyuteishi_hai = self.makeArrayBuffer();
		self.bVisibleKakyu_hai = self.makebooleanBuffer();
		self.bVisibleFurikae_hai = self.makebooleanBuffer();
	};

	p.logic03_Go = function() {
		self.GetPersonalInfoNenkin();

		self.Calc08_Nenkin(false);
		self.Calc10_Shikyuteishi(false);
		if (self.MC.is_kekkon()) {
			self.Calc08_Nenkin(true);
			self.Calc10_Shikyuteishi(true);
		}
	};
	//計算式（3）老齢基礎年金

	p.Calc03_Kiso = function(is_hai) {
		var tyPin = self.DB.get_mc_calc(is_hai);
		var dKiso = 0;

		// 2021/03/01 加入月数 300 -> 120
		if (tyPin.KokuKanyuTsukisu >= 120 || tyPin.KanyuTsukisu2 >= tyPin.Tokureikikan * 12) {
			dKiso = Util.excelRound(self.DB.get_cmninfo().sm_roureikiso * tyPin.KokuKanyuTsukisu / 480, -2);
		}
		//
		var vKiso = is_hai ? self.vKiso_hai : self.vKiso_hon;
		var index = self.getIndex(is_hai);
		for (var i = 65; i < 100; i++) {
			var save_kiso = -1;
			if (tyPin.has_70 && i >= 70) {
				save_kiso = is_hai ? self.MC.save_kiso_70_hai : self.MC.save_kiso_70_hon;
			} else if (tyPin.has_65 && i >= 65) {
				save_kiso = is_hai ? self.MC.save_kiso_65_hai : self.MC.save_kiso_65_hon;
			}
// 2021/03/01 不要ロジック削除
//			} else if (tyPin.has_to && tyPin.JyukyuStAge > 20 && i >= tyPin.JyukyuStAge) {
//				save_kiso = is_hai ? self.MC.save_kiso_to_hai : self.MC.save_kiso_to_hon;
//			} else if (tyPin.has_bu && tyPin.BubunStAge > 20 && i >= tyPin.BubunStAge) {
//				save_kiso = is_hai ? self.MC.save_kiso_bu_hai : self.MC.save_kiso_bu_hon;
//			}
			if (save_kiso >= 0) {
				vKiso[i + index] = save_kiso;
			} else {
				vKiso[i + index] = dKiso;
			}
		}
	};
	//' 計算式（4）老齢厚生年金

	p.Calc04_Kousei = function(is_hai) {
		var dRoreiKiso;
		var dKousei;
		var dKouseiBu;
		var dKouseiTo;
		var vKousei, vKouseiBu, vKouseiTo;

		var index = self.getIndex(is_hai);

		if (!is_hai) {
			vKousei = self.vKousei_hon;
			vKouseiBu = self.vKouseiBu_hon;
			vKouseiTo = self.vKouseiTo_hon;
			dRoreiKiso = self.vKiso_hon[65 + index];
		} else {
			vKousei = self.vKousei_hai;
			vKouseiBu = self.vKouseiBu_hai;
			vKouseiTo = self.vKouseiTo_hai;
			dRoreiKiso = self.vKiso_hai[65 + index];
		}

		var tyPin = self.DB.get_mc_calc(is_hai);

		dKousei = 0;
		dKouseiBu = 0;
		dKouseiTo = 0;

		// 2021/03/24 公務員を条件に追加。退職共済年金から厚生年金部分を差し引いたことに連動。
//		if (self.MC.get_id_syokugyo(is_hai) === G_syokugyo.KAISYAIN ||
//				self.MC.get_id_syokugyo(is_hai) === G_syokugyo.YAKUIN ||
//				self.MC.get_id_syokugyo(is_hai) === G_syokugyo.TAI_KAISYAIN ||
//				(self.MC.get_id_syokugyo(is_hai) === G_syokugyo.JIEIGYO && self.MC.get_id_kinmu(is_hai) === 1) ||
//				(self.MC.get_id_syokugyo(is_hai) === G_syokugyo.MUSYOKU && self.MC.get_id_kinmu(is_hai) === 1)) {
		if (self.MC.get_id_syokugyo(is_hai) === G_syokugyo.KAISYAIN ||
				self.MC.get_id_syokugyo(is_hai) === G_syokugyo.YAKUIN ||
				self.MC.get_id_syokugyo(is_hai) === G_syokugyo.TAI_KAISYAIN ||
				self.MC.get_id_syokugyo(is_hai) === G_syokugyo.KOMUIN ||
				self.MC.get_id_syokugyo(is_hai) === G_syokugyo.TAI_KOMUIN ||
				(self.MC.get_id_syokugyo(is_hai) === G_syokugyo.JIEIGYO && self.MC.get_id_kinmu(is_hai) === 1) ||
				(self.MC.get_id_syokugyo(is_hai) === G_syokugyo.MUSYOKU && self.MC.get_id_kinmu(is_hai) === 1) ||
				(self.MC.get_id_syokugyo(is_hai) === G_syokugyo.JIEIGYO && self.MC.get_id_kinmu(is_hai) === 2) ||
				(self.MC.get_id_syokugyo(is_hai) === G_syokugyo.MUSYOKU && self.MC.get_id_kinmu(is_hai) === 2)) {
			// 2021/03/01 加入月数 300 -> 120
			if (tyPin.KokuKanyuTsukisu >= 120 || tyPin.KanyuTsukisu1 >= tyPin.Tokureikikan * 12) {
				if (tyPin.KanyuTsukisu1 >= 12 && tyPin.BubunStAge < 65) {
					dKouseiBu = (tyPin.AvgHousyu1 * tyPin.KoseiRate / 1000 * tyPin.KanyuTsukisu1);
				}

				if (tyPin.KanyuTsukisu1 >= 12 && tyPin.JyukyuStAge < 65) {
					dKouseiTo = (self.DB.get_cmninfo().sm_teigakutanka * tyPin.TeigakuRate * Util.excelMin(tyPin.KanyuTsukisu1, tyPin.TeigakuMaxMon));
				}
			}

			// 2021/03/01 加入月数 300 -> 120
			if (tyPin.KokuKanyuTsukisu >= 120 || tyPin.KanyuTsukisu2 >= tyPin.Tokureikikan * 12) {
				dKousei = (tyPin.AvgHousyu2 * tyPin.KoseiRate / 1000 * tyPin.KanyuTsukisu2);
			}

			// 定額部分を受給していた者が65歳になると定額部分は老齢基礎年金に変わる。

			// この時、老齢基礎年金が定額部分より少なくなることがある。

			// 年金額が減少しないように差額分を経過的加算として老齢基礎年金に上乗せして支給する。

			if (dKouseiTo > dRoreiKiso) {
				dKousei = Util.excelRound(dKousei - dRoreiKiso + dKouseiTo, -2);
			} else {
				dKousei = Util.excelRound(dKousei, -2);
			}
		}

		dKouseiTo = Util.excelRound(dKouseiBu + dKouseiTo, -2);
		dKouseiBu = Util.excelRound(dKouseiBu, -2);

		// 部分開始年齢～受給開始年齢
		for (var i = tyPin.BubunStAge; i < tyPin.JyukyuStAge; i++) {
			var _saveBu = -1;

			if (tyPin.has_bu) {
				_saveBu = is_hai ? self.MC.save_kose_bu_hai : self.MC.save_kose_bu_hon;
			}

			vKouseiBu[i + index] = (_saveBu === -1) ? dKouseiBu : _saveBu;
		}

		// 受給開始年齢～65歳
		for (var i = tyPin.JyukyuStAge; i < 65; i++) {
			var _saveTo = -1;

			if (tyPin.has_to) {
				_saveTo = is_hai ? self.MC.save_kose_to_hai : self.MC.save_kose_to_hon;
			}

			vKouseiTo[i + index] = (_saveTo === -1) ? dKouseiTo : _saveTo;
		}

		// 65歳～99歳
		for (var i = 65; i < 100; i++) {
			var _save = -1;

			if (tyPin.has_70 && i >= 70) {
				_save = is_hai ? self.MC.save_kose_70_hai : self.MC.save_kose_70_hon;
			} else if (tyPin.has_65 && i >= 65) {
				_save = is_hai ? self.MC.save_kose_65_hai : self.MC.save_kose_65_hon;
			}

			vKousei[i + index] = (_save === -1) ? dKousei : _save;
		}
	};
	//' 計算式（5）退職共済年金

	p.Calc05_Kyousai = function(is_hai) {
		var dRoreiKiso;
		var dKyousai;
		var dKyousaiBu;
		var dKyousaiTo;

		var vKyousai, vKyousaiBu, vKyousaiTo;

		var index = self.getIndex(is_hai);

		if (!is_hai) {
			vKyousai = self.vKyousai_hon;
			vKyousaiBu = self.vKyousaiBu_hon;
			vKyousaiTo = self.vKyousaiTo_hon;
			dRoreiKiso = self.vKiso_hon[65 + index];
		} else {
			vKyousai = self.vKyousai_hai;
			vKyousaiBu = self.vKyousaiBu_hai;
			vKyousaiTo = self.vKyousaiTo_hai;
			dRoreiKiso = self.vKiso_hai[65 + index];
		}

		var tyPin = self.DB.get_mc_calc(is_hai);

		dKyousai = 0;
		dKyousaiBu = 0;
		dKyousaiTo = 0;

		if (self.MC.get_id_syokugyo(is_hai) === G_syokugyo.KOMUIN || self.MC.get_id_syokugyo(is_hai) === G_syokugyo.TAI_KOMUIN ||
				(self.MC.get_id_syokugyo(is_hai) === G_syokugyo.JIEIGYO && self.MC.get_id_kinmu(is_hai) === 2) ||
				(self.MC.get_id_syokugyo(is_hai) === G_syokugyo.MUSYOKU && self.MC.get_id_kinmu(is_hai) === 2)) {
			// 2021/03/01 加入月数 300 -> 120
			if (tyPin.KokuKanyuTsukisu >= 120 || tyPin.KanyuTsukisu1 >= tyPin.Tokureikikan * 12) {
				if (tyPin.KanyuTsukisu1 >= 12 && tyPin.BubunStAge < 65) {
					// 2021/03/01 tyPin.KoseiRate / 1000削除、　tyPin.KanyuTsukisu1　→　tyPin.KyousaiKanyuTsukisu 被用者の年金制度の一元化
					//dKyousaiBu = (tyPin.AvgHousyu1 * (tyPin.KoseiRate / 1000 + tyPin.SyokuikiRate / 1000) * tyPin.KanyuTsukisu1);
					dKyousaiBu = (tyPin.AvgHousyu1 * (tyPin.SyokuikiRate / 1000) * tyPin.KyousaiKanyuTsukisu);
				}
				if (tyPin.KanyuTsukisu1 >= 12 && tyPin.JyukyuStAge < 65) {
					// 2021/03/01 tyPin.KanyuTsukisu1　→　tyPin.KyousaiKanyuTsukisu 被用者の年金制度の一元化
					//dKyousaiTo = (self.DB.get_cmninfo().sm_teigakutanka * tyPin.TeigakuRate * Util.excelMin(tyPin.KanyuTsukisu1, tyPin.TeigakuMaxMon));
					dKyousaiTo = (self.DB.get_cmninfo().sm_teigakutanka * tyPin.TeigakuRate * Util.excelMin(tyPin.KyousaiKanyuTsukisu, tyPin.TeigakuMaxMon));
				}
			}

			// 2021/03/01 加入月数 300 -> 120
			if (tyPin.KokuKanyuTsukisu >= 120 || tyPin.KanyuTsukisu2 >= tyPin.Tokureikikan * 12) {
				// 2021/03/01 tyPin.KoseiRate / 1000削除、　tyPin.KanyuTsukisu2　→　tyPin.KyousaiKanyuTsukisu 被用者の年金制度の一元化
				//dKyousai = (tyPin.AvgHousyu2 * (tyPin.KoseiRate / 1000 + tyPin.SyokuikiRate / 1000) * tyPin.KanyuTsukisu2);
				dKyousai = (tyPin.AvgHousyu2 * (tyPin.SyokuikiRate / 1000) * tyPin.KyousaiKanyuTsukisu);
			}

			if (dKyousaiTo > dRoreiKiso) {
				dKyousai = Util.excelRound(dKyousai - dRoreiKiso + dKyousaiTo, -2);
			} else {
				dKyousai = Util.excelRound(dKyousai, -2);
			}
		}

		dKyousaiTo = Util.excelRound(dKyousaiBu + dKyousaiTo, -2);
		dKyousaiBu = Util.excelRound(dKyousaiBu, -2);

		// 部分開始年齢～受給開始年齢
		for (var i = tyPin.BubunStAge; i < tyPin.JyukyuStAge; i++) {
			var _saveBu = -1;

			if (tyPin.has_bu) {
				_saveBu = is_hai ? self.MC.save_tai_bu_hai : self.MC.save_tai_bu_hon;
			}

			vKyousaiBu[i + index] = (_saveBu === -1) ? dKyousaiBu : _saveBu;
		}

		// 受給開始年齢～65歳
		for (var i = tyPin.JyukyuStAge; i < 65; i++) {
			var _saveTo = -1;

			if (tyPin.has_to) {
				_saveTo = is_hai ? self.MC.save_tai_to_hai : self.MC.save_tai_to_hon;
			}

			vKyousaiTo[i + index] = (_saveTo === -1) ? dKyousaiTo : _saveTo;
		}

		// 65歳～99歳
		for (var i = 65; i < 100; i++) {
			var _save = -1;

			if (tyPin.has_70 && i >= 70) {
				_save = is_hai ? self.MC.save_tai_70_hai : self.MC.save_tai_70_hon;
			} else if (tyPin.has_65 && i >= 65) {
				_save = is_hai ? self.MC.save_tai_65_hai : self.MC.save_tai_65_hon;
			}

			vKyousai[i + index] = (_save === -1) ? dKyousai : _save;
		}
	};
	//' 計算式（6）加給年金

	p.Calc06_Kakyu = function(is_hai) {
		var iAgeGap;
		var dKakyu;
		var dKakyuTo;
		var vKakyu, vKakyuTo;

		if (!is_hai) {
			vKakyu = self.vKakyu_hon;
			vKakyuTo = self.vKakyuTo_hon;
		} else {
			vKakyu = self.vKakyu_hai;
			vKakyuTo = self.vKakyuTo_hai;
		}

		var tyPinHon = self.DB.get_mc_calc(is_hai);
		var tyPinHai = self.DB.get_mc_calc(!is_hai);
		iAgeGap = LPdate.calcAge(self.MC.get_st_birthday(is_hai), self.MC.get_st_birthday(!is_hai));

		dKakyu = 0;
		dKakyuTo = 0;

		// 【Lifeplan_問題管理票_社内.xls】No.046 対応

		if (self.MC.is_kekkon()) {
			if (tyPinHon.JyukyuStAge < 65) {
				// 2021/03/01 加入月数 300 -> 120
				if (tyPinHon.KokuKanyuTsukisu >= 120 || tyPinHon.KanyuTsukisu1 >= tyPinHon.Tokureikikan * 12) {
					if (tyPinHon.KanyuTsukisu1 >= 240 &&
							((tyPinHai.KanyuTsukisu1 < 240 && tyPinHon.JyukyuStAge - iAgeGap < 65) ||
									(tyPinHai.KanyuTsukisu1 >= 240 && tyPinHon.JyukyuStAge - iAgeGap < tyPinHai.BubunStAge))) {
						dKakyuTo = self.DB.get_cmninfo().sm_kakyunenkin + tyPinHon.HaiguToku;
					}
				}
			}

			// 2021/03/01 加入月数 300 -> 120
			if (tyPinHon.KokuKanyuTsukisu >= 120 || tyPinHon.KanyuTsukisu2 >= tyPinHon.Tokureikikan * 12) {
				if (tyPinHon.KanyuTsukisu2 >= 240 &&
						((tyPinHai.KanyuTsukisu2 < 240 && tyPinHon.JyukyuStAge - iAgeGap < 65) ||
								(tyPinHai.KanyuTsukisu2 >= 240 && tyPinHon.JyukyuStAge - iAgeGap < tyPinHai.BubunStAge))) {
					dKakyu = self.DB.get_cmninfo().sm_kakyunenkin + tyPinHon.HaiguToku;
				}
			}
		} else {
			iAgeGap = 0;
		}

		var index = self.getIndex(is_hai);

		// 受給開始年齢～65歳
		for (var i = tyPinHon.JyukyuStAge; i < 65; i++) {
			var _saveTo = -1;

			if (tyPinHon.has_to) {
				_saveTo = is_hai ? self.MC.save_kakyu_to_hai : self.MC.save_kakyu_to_hon;
			}

			if ((tyPinHai.KanyuTsukisu1 < 240 && i - iAgeGap < 65) ||
					(tyPinHai.KanyuTsukisu1 >= 240 && i - iAgeGap < tyPinHai.BubunStAge)) {
				vKakyuTo[i + index] = (_saveTo === -1) ? dKakyuTo : _saveTo;
			}
		}
		// 65歳～配偶者の部分開始年齢又は配偶者の65歳
		for (var i = 65; i - iAgeGap < 65; i++) {
			var _save = -1;

			if (tyPinHon.has_70 && i >= 70) {
				_save = is_hai ? self.MC.save_kakyu_70_hai : self.MC.save_kakyu_70_hon;
			} else if (tyPinHon.has_65 && i >= 65) {
				_save = is_hai ? self.MC.save_kakyu_65_hai : self.MC.save_kakyu_65_hon;
			}

			if ((tyPinHai.KanyuTsukisu2 < 240 && i - iAgeGap < 65) ||
					(tyPinHai.KanyuTsukisu2 >= 240 && i - iAgeGap < tyPinHai.BubunStAge)) {
				vKakyu[i + index] = (_save === -1) ? dKakyu : _save;
			}
		}
	};
	//' 計算式（7）振替加算

	p.Calc07_Furikae = function(is_hai) {
		var tyPinHon = self.DB.get_mc_calc(is_hai);
		var tyPinHai = self.DB.get_mc_calc(!is_hai);
		var dFurikae;
		var vFurikae;

		if (!is_hai) {
			vFurikae = self.vFurikae_hon;
		} else {
			vFurikae = self.vFurikae_hai;
		}

		dFurikae = 0;

		if (self.MC.is_kekkon()) {
			// 2021/03/01 加入月数 300 -> 120
			if (tyPinHai.KokuKanyuTsukisu >= 120 || tyPinHai.KanyuTsukisu2 >= tyPinHai.Tokureikikan * 12) {
				if (tyPinHai.KanyuTsukisu2 >= 240) {
					// 2021/03/01 加入月数 300 -> 120
					if (tyPinHon.KokuKanyuTsukisu >= 120 && tyPinHon.KanyuTsukisu2 < 240) {
						dFurikae = tyPinHon.Furikae;
					}
				}
			}
		}
		var index = self.getIndex(is_hai);

		// 65歳～99歳
		for (var i = 65; i < 100; i++) {
			var _save = -1;

			if (tyPinHon.has_70 && i >= 70) {
				_save = is_hai ? self.MC.save_furikae_70_hai : self.MC.save_furikae_70_hon;
			} else if (tyPinHon.has_65 && i >= 65) {
				_save = is_hai ? self.MC.save_furikae_65_hai : self.MC.save_furikae_65_hon;
			}

			vFurikae[i + index] = (_save === -1) ? dFurikae : _save;
		}
	};
	//' 計算式（8）将来年金額推計

	p.Calc08_Nenkin = function(is_hai) {
		var iAgeGap;

		var vKiso = [];
		var vKousei = [];
		var vKouseiBu = [];
		var vKouseiTo = [];
		var vKyousai = [];
		var vKyousaiBu = [];
		var vKyousaiTo = [];
		var vKakyu = [];
		var vKakyuTo = [];
		var vFurikae = [];
		var vFurikae_haigu = [];
		var vNenkin = [];
		var vNenkin_haigu = [];
		var vKouseiNenkin = [];
		var bVisibleKakyu;
		var bVisibleFurikae;
		var iIndex = 0;

		iAgeGap = LPdate.calcAge(self.MC.st_birthday_hon, self.MC.st_birthday_hai);

		self.Calc03_Kiso(is_hai);
		self.Calc04_Kousei(is_hai);
		self.Calc05_Kyousai(is_hai);

		self.Calc06_Kakyu(is_hai);
		self.Calc07_Furikae(is_hai);

		if (is_hai) {
			vKiso = self.vKiso_hai;
			vKousei = self.vKousei_hai;
			vKouseiBu = self.vKouseiBu_hai;
			vKouseiTo = self.vKouseiTo_hai;
			vKyousai = self.vKyousai_hai;
			vKyousaiBu = self.vKyousaiBu_hai;
			vKyousaiTo = self.vKyousaiTo_hai;
			vKakyu = self.vKakyu_hai;
			vKakyuTo = self.vKakyuTo_hai;
			vFurikae = self.vFurikae_hai;
			vFurikae_haigu = self.vFurikae_hon;
			vNenkin = self.vNenkin_hai;
			vNenkin_haigu = self.vNenkin_hon;
			vKouseiNenkin = self.vKouseiNenkin_hai;
			bVisibleKakyu = self.bVisibleKakyu_hai;
			bVisibleFurikae = self.bVisibleFurikae_hai;
		} else {
			vKiso = self.vKiso_hon;
			vKousei = self.vKousei_hon;
			vKouseiBu = self.vKouseiBu_hon;
			vKouseiTo = self.vKouseiTo_hon;
			vKyousai = self.vKyousai_hon;
			vKyousaiBu = self.vKyousaiBu_hon;
			vKyousaiTo = self.vKyousaiTo_hon;
			vKakyu = self.vKakyu_hon;
			vKakyuTo = self.vKakyuTo_hon;
			vFurikae = self.vFurikae_hon;
			vFurikae_haigu = self.vFurikae_hai;
			vNenkin = self.vNenkin_hon;
			vNenkin_haigu = self.vNenkin_hai;
			vKouseiNenkin = self.vKouseiNenkin_hon;
			bVisibleKakyu = self.bVisibleKakyu_hon;
			bVisibleFurikae = self.bVisibleFurikae_hon;
		}

		var g_PinHon = self.DB.get_mc_calc(is_hai);
		var g_PinHai = self.DB.get_mc_calc(!is_hai);

		if (g_PinHon.BubunStAge === 0) {
			return;
		}

		var index = self.getIndex(is_hai);

		if (self.MC.is_kekkon()) {
			iAgeGap = LPdate.calcAge(self.MC.st_birthday_hon, self.MC.st_birthday_hai);
			if (is_hai) {
				//Calc08_NenkinHonとCalc09_NenkinHaiは
				//iAgeGapの符号が反対な点を除くと共通

				iAgeGap = -iAgeGap;
			}
		}

		for (var i = g_PinHon.BubunStAge; i < 100; i++) {
			if (i < 65) {
				if (i < g_PinHon.JyukyuStAge) {
					vNenkin[i + index] = vKouseiBu[i + index] + vKyousaiBu[i + index];
					vKouseiNenkin[i + index] = vKouseiBu[i + index] + vKyousaiBu[i + index];
				} else {
					vNenkin[i + index] = vKouseiTo[i + index] + vKyousaiTo[i + index];
					vKouseiNenkin[i + index] = vKouseiTo[i + index] + vKyousaiTo[i + index];

					if (self.MC.is_kekkon()) {
						if (g_PinHai.KanyuTsukisu1 >= 240) {
							if (i < g_PinHai.BubunStAge + iAgeGap) {
								vNenkin[i + index] += vKakyuTo[i + index];
							}
						} else {
							if (i < 65 + iAgeGap) {
								vNenkin[i + index] += vKakyuTo[i + index];
							}
						}
					}
				}
			} else {
				vNenkin[i + index] = vKiso[i + index] + vKousei[i + index] + vKyousai[i + index];
				vKouseiNenkin[i + index] = vKousei[i + index] + vKyousai[i + index];

				if (self.MC.is_kekkon()) {
					if (g_PinHai.KanyuTsukisu2 >= 240) {
						if (i < g_PinHai.BubunStAge + iAgeGap) {
							vNenkin[i + index] += vKakyu[i + index];

							bVisibleKakyu[iIndex] = true;
							bVisibleFurikae[iIndex] = false;
							iIndex = 1;
						} else {
							// 2021/03/04 本人でなく配偶者への振替加算。
							//vNenkin[i + index] += vFurikae[i + index];
							vNenkin_haigu[i + index] += vFurikae_haigu[i + index];

							bVisibleKakyu[iIndex] = false;
							bVisibleFurikae[iIndex] = true;
							iIndex = 1;
						}
					} else {
						if (i < 65 + iAgeGap) {
							vNenkin[i + index] += vKakyu[i + index];

							bVisibleKakyu[iIndex] = true;
							bVisibleFurikae[iIndex] = false;
							iIndex = 1;
						} else {
							// 2021/03/04 本人でなく配偶者への振替加算。
							//vNenkin[i + index] += vFurikae[i + index];
							vNenkin_haigu[i + index] += vFurikae_haigu[i + index];

							bVisibleKakyu[iIndex] = false;
							bVisibleFurikae[iIndex] = true;
							iIndex = 1;
						}
					}
				}
			}
		}

	};
	//' 計算式（9）将来年金額

	p.Calc09_NenkinHai = function() {
		//Calc08_NenkinHonとCalc09_NenkinHaiは
		//iAgeGapの符号が反対な点を除くと共通

		//なので、こちらは不使用
	};
	//' 計算式（10）在職支給停止額

	p.Calc10_Shikyuteishi = function(is_hai) {
		var tyPin = self.DB.get_mc_calc(is_hai);
		var lShikyukaishi;
		var lShikyuhenkou;
		var vKounenHousyu = [];
		var vKouseiNenkin = [];
		var vNenkin = [];
		var vKakyu = [];
		var vKakyuTo = [];
		var vShikyuteishi = [];
		var index = self.getIndex(is_hai);

		lShikyukaishi = 280000;
		lShikyuhenkou = 470000;
		if (false === is_hai) {
			vKounenHousyu = self.L2.vKoseiHousyu_hon;
			vKouseiNenkin = self.L3.vKouseiNenkin_hon;
			vNenkin = self.L3.vNenkin_hon;
			vKakyu = self.L3.vKakyu_hon;
			vKakyuTo = self.L3.vKakyuTo_hon;
			vShikyuteishi = self.vShikyuteishi_hon;
		} else {
			vKounenHousyu = self.L2.vKoseiHousyu_hai;
			vKouseiNenkin = self.L3.vKouseiNenkin_hai;
			vNenkin = self.L3.vNenkin_hai;
			vKakyu = self.L3.vKakyu_hai;
			vKakyuTo = self.L3.vKakyuTo_hai;
			vShikyuteishi = self.vShikyuteishi_hai;
		}

		for (var i = 60; i < 100; i++) {
			vShikyuteishi[i + index] = 0;

			if (vKounenHousyu[i + index] >= 0) {
				if (i >= 65) {
					if (vKouseiNenkin[i + index] / 12 + vKounenHousyu[i + index] > lShikyuhenkou) {
						vShikyuteishi[i + index] = Util.excelMin(vKouseiNenkin[i + index] / 2 + vKounenHousyu[i + index] * 6 - lShikyuhenkou * 6, vNenkin[i + index]);
					}
				} else if (i >= tyPin.BubunStAge) {
					if (vKouseiNenkin[i + index] / 12 + vKounenHousyu[i + index] > lShikyukaishi) {
						// 2021/03/01 修正
						//if (vKounenHousyu[i + index] <= lShikyuhenkou) {
						//	vShikyuteishi[i + index] = Util.excelMax((vKounenHousyu[i + index] + vKouseiNenkin[i + index] / 12 - lShikyukaishi) / 2,
						//			vKounenHousyu[i + index] / 2) * 12;
						//} else {
						//	vShikyuteishi[i + index] = (Util.excelMax((lShikyuhenkou + vKouseiNenkin[i + index] / 12 - lShikyukaishi) / 2 + vKounenHousyu[i + index] - lShikyuhenkou,
						//			lShikyuhenkou / 2 + vKounenHousyu[i + index] - lShikyuhenkou) * 12);
						//}
						if (vKouseiNenkin[i + index] / 12 <= lShikyukaishi) {
							vShikyuteishi[i + index] = Util.excelMax( lShikyuhenkou / 2 + vKouseiNenkin[i + index] / 24 - lShikyukaishi / 2 + vKounenHousyu[i + index] - lShikyuhenkou
								, vKounenHousyu[i + index] / 2 + vKouseiNenkin[i + index] / 24 - lShikyukaishi / 2 ) * 12;
						} else {
							vShikyuteishi[i + index] = Util.excelMax( vKounenHousyu[i + index] - lShikyuhenkou / 2
								, vKounenHousyu[i + index] / 2 ) * 12;
						}
					}
					// 2021/02/22 全額支給停止
					vShikyuteishi[i + index] = Util.excelMin(vShikyuteishi[i + index], vKouseiNenkin[i + index]);
				}
			}

			// 老齢厚生年金が全額停止の場合、加給年金も受けられなくなる。

			if (vShikyuteishi[i + index] >= vKouseiNenkin[i + index]) {
				if (i >= 65) {
					vShikyuteishi[i + index] += vKakyu[i + index];
				} else {
					vShikyuteishi[i + index] += vKakyuTo[i + index];
				}
			}
		}
	};
	// 年金情報を設定する

	p.GetPersonalInfoNenkin = function() {
		var g_PinHon = self.DB.get_mc_calc(false);
		var g_PinHai = self.DB.get_mc_calc(true);

		// 【設定】ご本人様年金情報
		g_PinHon.KanyuTsukisu1 = self.GetKanyuTsukisu1(false);
		g_PinHon.KanyuTsukisu2 = self.GetKanyuTsukisu2(false);
		g_PinHon.KokuKanyuTsukisu = 480;
		g_PinHon.KyousaiKanyuTsukisu = self.GetKyousaiKanyuTsukisu(false);
		g_PinHon.JyukyuStAge = self.GetIfJyukyuStAge(false);
		g_PinHon.BubunStAge = self.GetIfBubunStAge(false);
		g_PinHon.TeigakuRate = self.GetIfTeigakuRate(false);
		g_PinHon.KoseiRate = self.GetIfKoseiRate(false);
		g_PinHon.SyokuikiRate = self.GetIfSyokuikiRate(false);
		g_PinHon.HaiguToku = self.GetIfHaiguToku(false);
		g_PinHon.Furikae = self.GetIfFurikae(false);
		g_PinHon.TeigakuMaxMon = self.GetIfTeigakuMaxMon(false);
		g_PinHon.Tokureikikan = self.GetIfTokureikikan(false);
		self.setupNenkin(false);
		self.vJyukyuStAge_hon = g_PinHon.JyukyuStAge;

		if (self.MC.is_kekkon()) {
			// 【設定】配偶者様年金情報
			g_PinHai.KanyuTsukisu1 = self.GetKanyuTsukisu1(true);
			g_PinHai.KanyuTsukisu2 = self.GetKanyuTsukisu2(true);
			g_PinHai.KokuKanyuTsukisu = 480;
			g_PinHai.KyousaiKanyuTsukisu = self.GetKyousaiKanyuTsukisu(true);
			g_PinHai.JyukyuStAge = self.GetIfJyukyuStAge(true);
			g_PinHai.BubunStAge = self.GetIfBubunStAge(true);
			g_PinHai.TeigakuRate = self.GetIfTeigakuRate(true);
			g_PinHai.KoseiRate = self.GetIfKoseiRate(true);
			g_PinHai.SyokuikiRate = self.GetIfSyokuikiRate(true);
			g_PinHai.HaiguToku = self.GetIfHaiguToku(true);
			g_PinHai.Furikae = self.GetIfFurikae(true);
			g_PinHai.TeigakuMaxMon = self.GetIfTeigakuMaxMon(true);
			g_PinHai.Tokureikikan = self.GetIfTokureikikan(true);
			self.setupNenkin(true);
			self.vJyukyuStAge_hai = g_PinHai.JyukyuStAge;
		}
	};
	// 年金受給情報を設定する

	p.setupNenkin = function(is_hai) {
		var g_pinHon = self.DB.get_mc_calc(is_hai);
		var ageGap = LPdate.calcAge(self.MC.st_birthday_hon, self.MC.st_birthday_hai);

		if (is_hai) {
			ageGap = -ageGap;
		}

		g_pinHon.has_bu = false;
		g_pinHon.has_to = false;
		g_pinHon.has_65 = false;
		g_pinHon.has_70 = false;
		g_pinHon.year_70 = 65;


		if (g_pinHon.JyukyuStAge < 65) {
			if (self.MC.is_kekkon() && ageGap > 0) {
				if (g_pinHon.BubunStAge < g_pinHon.JyukyuStAge) {
					g_pinHon.has_bu = true;
					g_pinHon.has_to = true;
					g_pinHon.has_65 = true;
					g_pinHon.has_70 = true;
					g_pinHon.year_70 = 65 + Util.excelRoundUp(ageGap / 5.0, 0) * 5;
				} else {
					g_pinHon.has_bu = false;
					g_pinHon.has_to = true;
					g_pinHon.has_65 = true;
					g_pinHon.has_70 = true;
					g_pinHon.year_70 = 65 + Util.excelRoundUp(ageGap / 5.0, 0) * 5;
				}
			} else {
				if (g_pinHon.BubunStAge < g_pinHon.JyukyuStAge) {
					g_pinHon.has_bu = true;
					g_pinHon.has_to = true;
					g_pinHon.has_65 = true;
					g_pinHon.has_70 = false;
				} else {
					g_pinHon.has_bu = false;
					g_pinHon.has_to = true;
					g_pinHon.has_65 = true;
					g_pinHon.has_70 = false;
				}
			}
		} else {
			if (self.MC.is_kekkon() && ageGap > 0) {
				if (g_pinHon.BubunStAge < 65) {
					g_pinHon.has_bu = true;
					g_pinHon.has_to = false;
					g_pinHon.has_65 = true;
					g_pinHon.has_70 = true;
					g_pinHon.year_70 = 65 + Util.excelRoundUp(ageGap / 5.0, 0) * 5;
				} else {
					g_pinHon.has_bu = false;
					g_pinHon.has_to = false;
					g_pinHon.has_65 = true;
					g_pinHon.has_70 = true;
					g_pinHon.year_70 = 65 + Util.excelRoundUp(ageGap / 5.0, 0) * 5;
				}
			} else {
				if (g_pinHon.BubunStAge < 65) {
					g_pinHon.has_bu = true;
					g_pinHon.has_to = false;
					g_pinHon.has_65 = true;
					g_pinHon.has_70 = false;
				} else {
					g_pinHon.has_bu = false;
					g_pinHon.has_to = false;
					g_pinHon.has_65 = true;
					g_pinHon.has_70 = false;
				}
			}
		}

	};
	// 加入月数1を計算する

	p.GetKanyuTsukisu1 = function(is_hai) {
		var dtBirthday;
		var dtSyugyoday;
		var iBubunStart;
		var iSyugyouAge;
		var iTaisyokuAge;
		var iKanyuTsukisu1;

		iBubunStart = self.GetIfBubunStAge(is_hai);

		var syokugyo = self.MC.get_id_syokugyo(is_hai);

		// 【Lifeplan_問題管理票_社内.xls】No.040 対応

		if (syokugyo === G_syokugyo.KAISYAIN || syokugyo === G_syokugyo.YAKUIN || syokugyo === G_syokugyo.KOMUIN || syokugyo === G_syokugyo.JIEIGYO ||
				syokugyo === G_syokugyo.TAI_KAISYAIN || syokugyo === G_syokugyo.TAI_KOMUIN ||
				(syokugyo === G_syokugyo.JIEIGYO && self.MC.get_id_kinmu(is_hai) !== 0) ||
				(syokugyo === G_syokugyo.MUSYOKU && self.MC.get_id_kinmu(is_hai) !== 0)) {
			dtBirthday = self.MC.get_st_birthday(is_hai);
			dtSyugyoday = self.MC.get_ym_syugyo(is_hai);

			// 【Lifeplan_問題管理票_社内.xls】No.057 対応

			if (syokugyo === G_syokugyo.JIEIGYO || syokugyo === G_syokugyo.MUSYOKU) {
				iSyugyouAge = self.MC.get_age_kakosyugyo(is_hai);
				iTaisyokuAge = self.MC.get_age_kakotaisyoku(is_hai);
			} else {
				iSyugyouAge = LPdate.calcAge(self.MC.get_st_birthday(is_hai), self.MC.get_ym_syugyo(is_hai));
				iTaisyokuAge = self.MC.get_age_taisyoku(is_hai);
			}
			iKanyuTsukisu1 = ((Util.excelMin(iTaisyokuAge, iBubunStart) - iSyugyouAge) * 12
					- (LPdate.getMon(dtBirthday) > LPdate.getMon(dtSyugyoday) ? 11 + LPdate.getMon(dtSyugyoday) - LPdate.getMon(dtBirthday)
							: LPdate.getMon(dtSyugyoday) - LPdate.getMon(dtBirthday) - 1));
		} else {
			iKanyuTsukisu1 = 0;
		}

		return iKanyuTsukisu1;
	};
	// 加入月数2を計算する

	p.GetKanyuTsukisu2 = function(is_hai) {
		var dtBirthday;
		var dtSyugyoday;
		var iSyugyouAge;
		var iTaisyokuAge;
		var iKanyuTsukisu2;

		var syokugyo = self.MC.get_id_syokugyo(is_hai);

		// 【Lifeplan_問題管理票_社内.xls】No.040 対応

		if (syokugyo === G_syokugyo.KAISYAIN || syokugyo === G_syokugyo.YAKUIN || syokugyo === G_syokugyo.KOMUIN || syokugyo === G_syokugyo.JIEIGYO ||
				syokugyo === G_syokugyo.TAI_KAISYAIN || syokugyo === G_syokugyo.TAI_KOMUIN ||
				(syokugyo === G_syokugyo.JIEIGYO && self.MC.get_id_kinmu(is_hai) !== 0) ||
				(syokugyo === G_syokugyo.MUSYOKU && self.MC.get_id_kinmu(is_hai) !== 0)) {
			dtBirthday = self.MC.get_st_birthday(is_hai);
			dtSyugyoday = self.MC.get_ym_syugyo(is_hai);

			// 【Lifeplan_問題管理票_社内.xls】No.057 対応

			if (syokugyo === G_syokugyo.JIEIGYO || syokugyo === G_syokugyo.MUSYOKU) {
				iSyugyouAge = self.MC.get_age_kakosyugyo(is_hai);
				iTaisyokuAge = self.MC.get_age_kakotaisyoku(is_hai);
			} else {
				iSyugyouAge = LPdate.calcAge(self.MC.get_st_birthday(is_hai), self.MC.get_ym_syugyo(is_hai));
				iTaisyokuAge = self.MC.get_age_taisyoku(is_hai);
			}

			iKanyuTsukisu2 = (Util.excelMin(iTaisyokuAge, 65) - iSyugyouAge) * 12
					- (LPdate.getMon(dtBirthday) > LPdate.getMon(dtSyugyoday) ? 11 + LPdate.getMon(dtSyugyoday) - LPdate.getMon(dtBirthday) :
							LPdate.getMon(dtSyugyoday) - LPdate.getMon(dtBirthday) - 1);
		} else {
			iKanyuTsukisu2 = 0;
		}

		return iKanyuTsukisu2;
	};

	// 2021/03/03 追加 被用者保険一元化対応
	// 共済加入月数を計算する
	//   就業年月　から　被用者の年金制度の一元化2015/10/01施行年月　までの月数
	p.GetKyousaiKanyuTsukisu = function(is_hai) {

		var kyousaiKanyuTsukisu = 0;
		var syokugyo = self.MC.get_id_syokugyo(is_hai);
		var id_kinmu = self.MC.get_id_kinmu(is_hai);     // 0：勤務なし, 1：会社員, 2：公務員

		if ( syokugyo === G_syokugyo.KOMUIN     ||
				 syokugyo === G_syokugyo.TAI_KOMUIN ||
				(syokugyo === G_syokugyo.JIEIGYO    && id_kinmu === 2) ||
				(syokugyo === G_syokugyo.MUSYOKU    && id_kinmu === 2)) {

			var dtSyugyoday = self.MC.get_ym_syugyo(is_hai)
			if ( 20151001 > dtSyugyoday ) {
				kyousaiKanyuTsukisu = (2015 - LPdate.getYear(dtSyugyoday))*12 + 10 - LPdate.getMon(dtSyugyoday);
			}
		}

		return kyousaiKanyuTsukisu;
	};

	//IF定義書から受給開始年齢を取得する

	p.GetIfJyukyuStAge = function(is_hai) {
		var iJyukyuStAge = 65;

		var birth = self.MC.get_st_birthday(is_hai);
		var sex = self.MC.id_sex_hon;
		if (is_hai) {
			sex = (sex === 2) ? 1 : 2;
		}

		Object.keys(self.DB.db.m_nenkin).forEach(function(key) {
			var nenkin = this[key];
			var birth_from = nenkin.ymd_birth_from;
			var birth_to = nenkin.ymd_birth_to;
			if (birth_from <= birth && birth <= birth_to) {
				if (sex === 1) {
					iJyukyuStAge = nenkin.age_jkyustart_m;
				} else {
					iJyukyuStAge = nenkin.age_jkyustart_w;
				}
			}

		}, self.DB.db.m_nenkin);

		return iJyukyuStAge;
	};
	// IF定義書から部分開始年齢を取得する

	p.GetIfBubunStAge = function(is_hai) {
		var iBubunStAge = 65;

		var birth = self.MC.get_st_birthday(is_hai);
		var sex = self.MC.id_sex_hon;
		if (is_hai) {
			sex = (sex === 2) ? 1 : 2;
		}

		Object.keys(self.DB.db.m_nenkin).forEach(function(key) {
			var nenkin = this[key];
			var birth_from = nenkin.ymd_birth_from;
			var birth_to = nenkin.ymd_birth_to;
			if (birth_from <= birth && birth <= birth_to) {
				if (sex === 1) {
					iBubunStAge = nenkin.age_bubunstart_m;
				} else {
					iBubunStAge = nenkin.age_bubunstart_w;
				}
			}

		}, self.DB.db.m_nenkin);

		return iBubunStAge;
	};
	// IF定義書から定額乗率を取得する

	p.GetIfTeigakuRate = function(is_hai) {
		var dTeigakuRate = 1;

		var birth = self.MC.get_st_birthday(is_hai);

		Object.keys(self.DB.db.m_nenkin).forEach(function(key) {
			var nenkin = this[key];
			var birth_from = nenkin.ymd_birth_from;
			var birth_to = nenkin.ymd_birth_to;
			if (birth_from <= birth && birth <= birth_to) {
				dTeigakuRate = nenkin.ra_teiritu;
			}

		}, self.DB.db.m_nenkin);

		return dTeigakuRate;
	};
	// IF定義書から厚生年金乗率を取得する

	p.GetIfKoseiRate = function(is_hai) {
		var dKoseiRate = 5.481;

		var birth = self.MC.get_st_birthday(is_hai);

		Object.keys(self.DB.db.m_nenkin).forEach(function(key) {
			var nenkin = this[key];
			var birth_from = nenkin.ymd_birth_from;
			var birth_to = nenkin.ymd_birth_to;
			if (birth_from <= birth && birth <= birth_to) {
				dKoseiRate = nenkin.ra_kouseiritu;
			}

		}, self.DB.db.m_nenkin);

		return dKoseiRate;
	};
	// IF定義書から共済職域乗率を取得する

	p.GetIfSyokuikiRate = function(is_hai) {
		var dSyokuikiRate = 1.096;

		var birth = self.MC.get_st_birthday(is_hai);

		Object.keys(self.DB.db.m_nenkin).forEach(function(key) {
			var nenkin = this[key];
			var birth_from = nenkin.ymd_birth_from;
			var birth_to = nenkin.ymd_birth_to;
			if (birth_from <= birth && birth <= birth_to) {
				dSyokuikiRate = nenkin.ra_syokuikiritu_20;
			}

		}, self.DB.db.m_nenkin);

		return dSyokuikiRate;
	};
	// IF定義書から配偶者特別加算を取得する

	p.GetIfHaiguToku = function(is_hai) {
		var lHaiguToku = 168100;

		var birth = self.MC.get_st_birthday(is_hai);

		Object.keys(self.DB.db.m_nenkin).forEach(function(key) {
			var nenkin = this[key];
			var birth_from = nenkin.ymd_birth_from;
			var birth_to = nenkin.ymd_birth_to;
			if (birth_from <= birth && birth <= birth_to) {
				lHaiguToku = nenkin.sm_haigukasan;
			}

		}, self.DB.db.m_nenkin);

		return lHaiguToku;
	};
	// IF定義書から振替加算を取得する

	p.GetIfFurikae = function(is_hai) {
		var lFurikae = 15300;

		var birth = self.MC.get_st_birthday(is_hai);

		Object.keys(self.DB.db.m_nenkin).forEach(function(key) {
			var nenkin = this[key];
			var birth_from = nenkin.ymd_birth_from;
			var birth_to = nenkin.ymd_birth_to;
			if (birth_from <= birth && birth <= birth_to) {
				lFurikae = nenkin.sm_hurikasan;
			}

		}, self.DB.db.m_nenkin);

		return lFurikae;
	};
	// 定額上限月数を取得する

	p.GetIfTeigakuMaxMon = function(is_hai) {
		var iTeigakuMaxMon = 480;

		var birth = self.MC.get_st_birthday(is_hai);

		Object.keys(self.DB.db.m_nenkin).forEach(function(key) {
			var nenkin = this[key];
			var birth_from = nenkin.ymd_birth_from;
			var birth_to = nenkin.ymd_birth_to;
			if (birth_from <= birth && birth <= birth_to) {
				//EXCELで特例期間を取得しているので、あわせる
				iTeigakuMaxMon = nenkin.sm_tokureikikan;
			}

		}, self.DB.db.m_nenkin);

		return iTeigakuMaxMon;
	};
	// 特例資格期間を取得する

	p.GetIfTokureikikan = function(is_hai) {
		var iTokureikikan = 25;

		var birth = self.MC.get_st_birthday(is_hai);

		Object.keys(self.DB.db.m_nenkin).forEach(function(key) {
			var nenkin = this[key];
			var birth_from = nenkin.ymd_birth_from;
			var birth_to = nenkin.ymd_birth_to;
			if (birth_from <= birth && birth <= birth_to) {
				iTokureikikan = nenkin.sm_tokureikikan;
			}

		}, self.DB.db.m_nenkin);

		return iTokureikikan;
	};

	p.dump = function(context, is_hai) {
		var result = [];
		var p = 0;
		if (!is_hai) {
			result[p++] = "3:ご本人様:老齢基礎年金\t";
			result[p++] = "3:ご本人様:老齢厚生年金\t";
			result[p++] = "3:ご本人様:老齢厚生年金・部分\t";
			result[p++] = "3:ご本人様:老齢厚生年金・特別\t";
			result[p++] = "3:ご本人様:退職共済年金\t";
			result[p++] = "3:ご本人様:退職共済年金・部分\t";
			result[p++] = "3:ご本人様:退職共済年金・特別\t";
			result[p++] = "3:ご本人様:加給年金\t";
			result[p++] = "3:ご本人様:加給年金・特別\t";
			result[p++] = "3:ご本人様:振替加算\t";
			result[p++] = "3:ご本人様:将来厚生年金額\t";
			result[p++] = "3:ご本人様:将来年金額\t";
			result[p++] = "3:ご本人様:在職支給停止額\t";
		} else {
			result[p++] = "3:配偶者様:老齢基礎年金\t";
			result[p++] = "3:配偶者様:老齢厚生年金\t";
			result[p++] = "3:配偶者様:老齢厚生年金・部分\t";
			result[p++] = "3:配偶者様:老齢厚生年金・特別\t";
			result[p++] = "3:配偶者様:退職共済年金\t";
			result[p++] = "3:配偶者様:退職共済年金・部分\t";
			result[p++] = "3:配偶者様:退職共済年金・特別\t";
			result[p++] = "3:配偶者様:加給年金\t";
			result[p++] = "3:配偶者様:加給年金・特別\t";
			result[p++] = "3:配偶者様:振替加算\t";
			result[p++] = "3:配偶者様:将来厚生年金額\t";
			result[p++] = "3:配偶者様:将来年金額\t";
			result[p++] = "3:配偶者様:在職支給停止額\t";
		}
		for (var i = 0; i < self.mDataLength; i++) {
			p = 0;
			if (!is_hai) {
				result[p++] += (self.vKiso_hon[i]) + "\t";
				result[p++] += (self.vKousei_hon[i]) + "\t";
				result[p++] += (self.vKouseiBu_hon[i]) + "\t";
				result[p++] += (self.vKouseiTo_hon[i]) + "\t";
				result[p++] += (self.vKyousai_hon[i]) + "\t";
				result[p++] += (self.vKyousaiBu_hon[i]) + "\t";
				result[p++] += (self.vKyousaiTo_hon[i]) + "\t";
				result[p++] += (self.vKakyu_hon[i]) + "\t";
				result[p++] += (self.vKakyuTo_hon[i]) + "\t";
				result[p++] += (self.vFurikae_hon[i]) + "\t";
				result[p++] += (self.vKouseiNenkin_hon[i]) + "\t";
				result[p++] += (self.vNenkin_hon[i]) + "\t";
				result[p++] += (self.vShikyuteishi_hon[i]) + "\t";
			} else {
				result[p++] += (self.vKiso_hai[i]) + "\t";
				result[p++] += (self.vKousei_hai[i]) + "\t";
				result[p++] += (self.vKouseiBu_hai[i]) + "\t";
				result[p++] += (self.vKouseiTo_hai[i]) + "\t";
				result[p++] += (self.vKyousai_hai[i]) + "\t";
				result[p++] += (self.vKyousaiBu_hai[i]) + "\t";
				result[p++] += (self.vKyousaiTo_hai[i]) + "\t";
				result[p++] += (self.vKakyu_hai[i]) + "\t";
				result[p++] += (self.vKakyuTo_hai[i]) + "\t";
				result[p++] += (self.vFurikae_hai[i]) + "\t";
				result[p++] += (self.vKouseiNenkin_hai[i]) + "\t";
				result[p++] += (self.vNenkin_hai[i]) + "\t";
				result[p++] += (self.vShikyuteishi_hai[i]) + "\t";
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
		data.vKiso_hon = self.vKiso_hon;
		data.vKousei_hon = self.vKousei_hon;
		data.vKouseiBu_hon = self.vKouseiBu_hon;
		data.vKouseiTo_hon = self.vKouseiTo_hon;
		data.vKyousai_hon = self.vKyousai_hon;
		data.vKyousaiBu_hon = self.vKyousaiBu_hon;
		data.vKyousaiTo_hon = self.vKyousaiTo_hon;
		data.vKakyu_hon = self.vKakyu_hon;
		data.vKakyuTo_hon = self.vKakyuTo_hon;
		data.vFurikae_hon = self.vFurikae_hon;
		data.vKouseiNenkin_hon = self.vKouseiNenkin_hon;
		data.vNenkin_hon = self.vNenkin_hon;
		data.vShikyuteishi_hon = self.vShikyuteishi_hon;
		data.bVisibleKakyu_hon = self.bVisibleKakyu_hon;
		data.bVisibleFurikae_hon = self.bVisibleFurikae_hon;

		data.vKiso_hai = self.vKiso_hai;
		data.vKousei_hai = self.vKousei_hai;
		data.vKouseiBu_hai = self.vKouseiBu_hai;
		data.vKouseiTo_hai = self.vKouseiTo_hai;
		data.vKyousai_hai = self.vKyousai_hai;
		data.vKyousaiBu_hai = self.vKyousaiBu_hai;
		data.vKyousaiTo_hai = self.vKyousaiTo_hai;
		data.vKakyu_hai = self.vKakyu_hai;
		data.vKakyuTo_hai = self.vKakyuTo_hai;
		data.vFurikae_hai = self.vFurikae_hai;
		data.vKouseiNenkin_hai = self.vKouseiNenkin_hai;
		data.vNenkin_hai = self.vNenkin_hai;
		data.vShikyuteishi_hai = self.vShikyuteishi_hai;
		data.bVisibleKakyu_hai = self.bVisibleKakyu_hai;
		data.bVisibleFurikae_hai = self.bVisibleFurikae_hai;

		LIFEPLAN.conf.storage.setItem("Logic03", JSON.stringify(data));
	};

	return Logic03;
})();