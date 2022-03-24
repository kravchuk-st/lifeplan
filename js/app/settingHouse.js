/* global LMPS, LIFEPLAN */

"use strict";

window.onload = function () {

	var DB;
	var Calc;
	var Util;
	var MC;
	var Wording;
	var LPdate;
	var id_modelcase;
	var Module;
	var Logic05;

	// DB MC をセットし計算ロジック実行
	init();

	// main
	var m_modelClass;
	var setting_tab1_basic;
	var setting_tab2_job;
	var setting_tab3_house;
	var setting_tab4_education;
	var setting_tab5_insurance;
	var simulation1;

	// サイドメニュー表示制御
	var dispSidemenu;
	var screenMessage = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_screenmessage"));
	var lp_setupinfo = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_setupinfo"));
	// サイドメニュー表示制御 END


	var Scenes = {
		S0: {},
		S1: {},
		S2: {},
		S3: {}
	};

	Scenes.S0 = (function () {
		var self;

		var S0 = function () {
			self = this;
		};
		var p = S0.prototype;

		p.onCreate = function () {
			self.update();
		};

		p.update = function () {
			var s;
			var index = getIndex(false);
			var amount = 0;
			if (MC.age_jyutaku > 0) {
				amount = Logic05.vYR[MC.age_jyutaku + 1 + index];
			}
			var LA60 = Logic05.vLA[60 + index];

			s = "当初の年返済額は" + Util.formatMoneyMan(amount, 0) + "";
			// 2021/04/26 月間返済額は小数1桁まで表示するように修正。
			//s += "（月額" + Util.formatMoneyMan(amount / 12, 0) + "）になります。";
			s += "（月額" + Util.formatMoneyMan(amount / 12, 1) + "）になります。";
			self.setting_house_txt_comment_1 = s;
			s = "完済時年齢は";
			var kansaiAge = Calc.mLogic05._KansaiAge;
			s += String(kansaiAge) + "歳";
			s += "、満60歳時点の借入残高は";
			s += Util.formatMoneyMan(LA60, 0);
			s += "になります。";

			self.setting_house_txt_comment_2 = s;

			if (MC.id_lives !== 1 && MC.id_lives_yotei !== 1) {
				self.house3_row_jyutakuloan = "hidden";

				self.house1_txt_age_jyutaku = Wording.MISETTEI;
				self.house1_txt_id_prefecture = Wording.MISETTEI;
				self.house1_txt_sm_jyutakuyosan = Wording.MISETTEI;
				self.house1_txt_sm_jyutakukeihi = Wording.MISETTEI;
				self.house1_txt_id_jyutakuloan = Wording.MISETTEI;
				return;
			}
			if (MC.id_jyutakuloan === 0) {
				self.house3_row_jyutakuloan = "hidden";
			} else {
				self.house3_row_jyutakuloan = "visible";
			}

			if (MC.age_jyutaku === 0) {
				s = Wording.MISETTEI;
			} else {
				s = String(MC.age_jyutaku) + "歳時";
			}
			self.house1_txt_age_jyutaku = s;

			if (MC.id_prefecture === 0) {
				s = Wording.MISETTEI;
			} else {
				s = DB.get_jyutaku(MC.id_prefecture).st_prefecture;
			}
			self.house1_txt_id_prefecture = s;

			if (MC.sm_jyutakuyosan === 0) {
				s = Wording.MISETTEI;
			} else {
				s = Util.formatMoneyMan(MC.sm_jyutakuyosan, 0);
			}
			self.house1_txt_sm_jyutakuyosan = s;

			if (MC.sm_jyutakukeihi === 0) {
				s = Wording.MISETTEI;
			} else {
				s = Util.formatMoneyMan(MC.sm_jyutakukeihi, 0);
			}
			self.house1_txt_sm_jyutakukeihi = s;

			if (MC.id_jyutakuloan === 0) {
				s = "ローン利用なし";
			} else {
				s = "ローン利用あり";
			}
			self.house1_txt_id_jyutakuloan = s;
			/**
			 * 住宅ローン
			 */
			if (MC.sm_kariire === 0) {
				s = Wording.MISETTEI;
			} else {
				s = Util.formatMoneyMan(MC.sm_kariire, 0);
			}
			self.house3_txt_sm_kariire = s;

			if (MC.no_hensai === 0) {
				s = Wording.MISETTEI;
			} else {
				s = String(MC.no_hensai) + "年";
			}
			self.house3_txt_no_hensai = s;

			if (MC.ra_kariirekinri1 === 0) {
				s = Wording.MISETTEI;
			} else {
				s = "当初 " + Util.num2RoundN(MC.ra_kariirekinri1 * 100.0, 2) + "%";
				if (MC.ra_kariirekinri2 > 0) {
					s += "<br\>" + String(MC.no_kariirekinri2) + "年後 ";
					s += Util.num2RoundN(MC.ra_kariirekinri2 * 100.0, 2) + "%";
					if (MC.ra_kariirekinri3 > 0) {
						s += "<br\>" + String(MC.no_kariirekinri3) + "年後 ";
						s += Util.num2RoundN(MC.ra_kariirekinri3 * 100.0, 2) + "%";
					}
				}
			}
			self.house3_txt_kariirekinri = s;
			if (MC.id_syouyo === 0) {
				s = "なし";
			} else if (MC.id_syouyo === 1) {
				s = "年1回";
			} else if (MC.id_syouyo === 2) {
				s = "年2回";
			}
			if (MC.sm_syouyo > 0) {
				s += " " + Util.formatMoneyMan(MC.sm_syouyo, 0);
			}
			self.house3_txt_syouyo = s;
			if (MC.y_kuriage === 0 || MC.sm_kuriage === 0) {
				s = "なし";
			} else {
				s = String(MC.y_kuriage) + "年後 ";
				s += Util.formatMoneyMan(MC.sm_kuriage, 0) + "<br\>";
				if (MC.id_kuriage === 0) {
					s += "返済軽減型";
				} else {
					s += "期間短縮型";
				}
			}
			self.house3_txt_kuriage = s;
			if (MC.id_dansin === 0) {
				s = "未加入";
			} else if (MC.id_dansin === 1) {
				s = "加入";
			}
			self.house3_txt_dansin = s;
		};

		p.onClick = function (v) {
			viewModel.Sidemenu();

			switch (v) {
				case "setting_tab1":
					if (id_modelcase !== 0) {
						window.location.href = 'setting_tab1_basic.html';
					}
					break;
				case "setting_tab2":
					if (id_modelcase !== 0) {
						window.location.href = 'setting_tab2_job.html';
					}
					break;
				case "setting_tab3":
					break;
				case "setting_tab4":
					if (id_modelcase !== 0) {
						window.location.href = 'setting_tab4_education.html';
					}
					break;
				case "setting_tab5":
					if (id_modelcase !== 0) {
						window.location.href = 'setting_tab5_insurance.html';
					}
					break;
				case "goto_simulation":
					window.location.href = 'simulation1.html';
					break;
				case "#modal-1":
					S1.onCreate();
					LMPS.openModal(v);
					break;
				case "#modal-2":
					S2.onCreate();
					LMPS.openModal(v);
					break;
				case "#modal-3":
					if ((MC.id_lives === 1 || MC.id_lives_yotei === 1) && MC.age_jyutaku > 0) {
						S3.onCreate();
						LMPS.openModal(v);
					}
					break;
			}
		};

		return S0;
	})();

	Scenes.S1 = (function () {
		var self;
		var mSave;

		var S1 = function () {
			self = this;
		};

		var p = S1.prototype;

		p.onCreate = function () {
			mSave = DB.Lp_modelcase;
			mSave.copy(MC);

			self.update();
		};

		p.update = function () {
			var index = 0;

			var list = Module.listAddUnselected(DB.getNumberList(0, 20, 65, "", "歳"));

			index = 0;
			if (mSave.age_jyutaku !== 0) {
				index = mSave.age_jyutaku - 20 + 1; //-20+未設定1
			}
			self.house1_spn_age_jyutaku = list;
			self.house1_spn_age_jyutaku_v = self.house1_spn_age_jyutaku[index];
			list = DB.get_jyutaku_list();
			index = 0;
			if (mSave.id_prefecture !== 0) {
				index = mSave.id_prefecture - 1;
			}
			if (index >= list.length) {
				index = list.length - 1;
			}
			self.house1_spn_prefecture = list;
			self.house1_spn_prefecture_v = self.house1_spn_prefecture[index];

			self.house1_edit_jyutakuyosan = Module.commafy(Number(mSave.sm_jyutakuyosan));
			self.house1_edit_jyutakukeihi = Module.commafy(Number(mSave.sm_jyutakukeihi));


			if (mSave.id_jyutakutype === 1) {
				self.house1_btn_jyutakutype_1 = "戸建て";
				self.house1_btn_jyutakutype_2 = "";
			} else if (mSave.id_jyutakutype === 2) {
				self.house1_btn_jyutakutype_1 = "";
				self.house1_btn_jyutakutype_2 = "マンション";
			}
			if (mSave.id_jyutakuloan === 1) {
				self.house1_btn_jyutakuloan_1 = "あり";
				self.house1_btn_jyutakuloan_2 = "";
			} else if (mSave.id_jyutakuloan === 0) {
				self.house1_btn_jyutakuloan_1 = "";
				self.house1_btn_jyutakuloan_2 = "なし";
			}
		};

		p.onClick = function (v) {
			switch (v) {
				case "house1_btn_jyutakutype_1":
					mSave.id_jyutakutype = 1;
					if (mSave.id_prefecture > 0) {
						var tbl = DB.get_jyutaku(mSave.id_prefecture);
						if (tbl !== null) {
							mSave.sm_jyutakuyosan = tbl.sm_house;
							self.house1_edit_jyutakuyosan = mSave.sm_jyutakuyosan;
							// 2021/02/22 固定値 0.06 -> DB.db.s_banksetupinfo.ra_housecost_early
							// mSave.sm_jyutakukeihi = (mSave.sm_jyutakuyosan * 0.06);
							mSave.sm_jyutakukeihi = (mSave.sm_jyutakuyosan * DB.db.s_banksetupinfo.ra_housecost_early);
							self.house1_edit_jyutakukeihi = mSave.sm_jyutakukeihi;
						}
					}
					self.update();
					break;
				case "house1_btn_jyutakutype_2":
					mSave.id_jyutakutype = 2;
					if (mSave.id_prefecture > 0) {
						var tbl = DB.get_jyutaku(mSave.id_prefecture);
						if (tbl !== null) {
							mSave.sm_jyutakuyosan = tbl.sm_apartment;
							self.house1_edit_jyutakuyosan = mSave.sm_jyutakuyosan;
							// 2021/02/22 固定値 0.06 -> DB.db.s_banksetupinfo.ra_housecost_early
							// mSave.sm_jyutakukeihi = (mSave.sm_jyutakuyosan * 0.06);
							mSave.sm_jyutakukeihi = (mSave.sm_jyutakuyosan * DB.db.s_banksetupinfo.ra_housecost_early);
							self.house1_edit_jyutakukeihi = mSave.sm_jyutakukeihi;
						}
					}
					self.update();
					break;
				case "house1_btn_jyutakuloan_1":
					mSave.id_jyutakuloan = 1;
					self.update();
					break;
				case "house1_btn_jyutakuloan_2":
					mSave.id_jyutakuloan = 0;
					self.update();
					break;
			}
		};

		p.isValid = function (_mc, context) {
			// 2021/02/22 購入時期を追加
			var MSG_ERR_1 = "購入時期、購入予算、諸経費を入力してください。";
			if (_mc.sm_jyutakuyosan <= 0) {
				alert(MSG_ERR_1);
				return false;
			}
			if (_mc.sm_jyutakukeihi <= 0) {
				alert(MSG_ERR_1);
				return false;
			}
			if (_mc.age_jyutaku === 0) {
				alert(MSG_ERR_1);
				return false;
			}
			return true;
		};

		p.onClickClose = function (v) {
			switch (v) {
				case "popup_cancel":
					LMPS.closeModal();
					break;
				case "popup_change":
					if (self.isValid(mSave, this)) {
						var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase"));
						var key = id_modelcase;
						data[key].id_jyutakutype = mSave.id_jyutakutype;
						data[key].sm_jyutakuyosan = mSave.sm_jyutakuyosan;
						data[key].sm_jyutakukeihi = mSave.sm_jyutakukeihi;
						data[key].id_jyutakuloan = mSave.id_jyutakuloan;
						data[key].age_jyutaku = mSave.age_jyutaku;
						data[key].id_prefecture = mSave.id_prefecture;

						// 【Web版LifePlan_課題管理.xml】No.11 対応 START
						// 住宅ローン関連の値を初期化
						if (mSave.id_jyutakuloan === 0) {
							data[key].sm_kariire = 0;
							data[key].no_hensai = 0;
							data[key].ra_kariirekinri1 = 0.0;
							data[key].no_kariirekinri2 = 0;
							data[key].ra_kariirekinri2 = 0.0;
							data[key].no_kariirekinri3 = 0;
							data[key].ra_kariirekinri3 = 0.0;
							data[key].sm_syouyo = 0;
							data[key].y_kuriage = 0;
							data[key].sm_kuriage = 0;
							data[key].id_kuriage = 0;
							data[key].id_dansin = 0;
						}
						// 【Web版LifePlan_課題管理.xml】No.11 対応 START

						LIFEPLAN.conf.storage.setItem("lp_modelcase", JSON.stringify(data));

						init();
						setup();
						LMPS.closeModal();
					}
					break;
			}
		};

		p.onSelect = function (id, event) {
			var index = event.target.selectedIndex;

			if (id === "house1_spn_prefecture") {
				mSave.id_prefecture = index + 1;
				// 2021/03/24 都道府県セレクトを変更したとき、購入予算、諸費用を更新するように修正
				var tbl = DB.get_jyutaku(mSave.id_prefecture);
				if (tbl !== null) {
					mSave.sm_jyutakuyosan = mSave.id_jyutakutype == 1 ? tbl.sm_house : tbl.sm_apartment;
					self.house1_edit_jyutakuyosan = mSave.sm_jyutakuyosan;
					mSave.sm_jyutakukeihi = (mSave.sm_jyutakuyosan * DB.db.s_banksetupinfo.ra_housecost_early);
					self.house1_edit_jyutakukeihi = mSave.sm_jyutakukeihi;
				}
			} else if (id === "house1_spn_age_jyutaku") {
				if (index === 0) {
					mSave.age_jyutaku = 0;
				} else {
					mSave.age_jyutaku = index + 20 - 1;
				}
			}

			self.update();
		};

		p.onCalcFinish = function (v) {
			var value;
			switch (v) {
				case "house1_edit_jyutakuyosan":
					value = Module.toFilteredNum(viewModel.house1_edit_jyutakuyosan());
					mSave.sm_jyutakuyosan = (value > 999990000) ? 999990000 : value;
					if (mSave.sm_jyutakukeihi === 0) {
						// 2021/02/22 固定値 0.06 -> DB.db.s_banksetupinfo.ra_housecost_early
						// mSave.sm_jyutakukeihi = Math.floor(mSave.sm_jyutakuyosan * 0.06);
						mSave.sm_jyutakukeihi = Math.floor(mSave.sm_jyutakuyosan * DB.db.s_banksetupinfo.ra_housecost_early);
						self.house1_edit_jyutakukeihi = mSave.sm_jyutakukeihi;
					}
					self.update();
					break;
				case "house1_edit_jyutakukeihi":
					value = Module.toFilteredNum(viewModel.house1_edit_jyutakukeihi());
					mSave.sm_jyutakukeihi = (value > 99990000) ? 99990000 : value;
					self.update();
					break;
			}
		};

		return S1;
	})();

	Scenes.S2 = (function () {
		var self;
		var mSave;

		var S2 = function () {
			self = this;
		};

		var p = S2.prototype;

		p.onCreate = function () {
			mSave = DB.Lp_modelcase;
			mSave.copy(MC);

			self.update();
		};

		p.update = function () {
			var list = DB.getNumberList(0, 1, 35, "", "年");
			var index = 0;
			if (mSave.no_hensai !== 0) {
				index = mSave.no_hensai - 1;
			} else {
				index = 34;
				// 2021/02/22 設定編集画面（住宅プラン／住宅ローンモーダル）の返済期間セレクトは初期値35年が表示されているが、
				//            計算用変数には0が設定されている。35になるように修正。
				mSave.no_hensai = index + 1;
			}
			self.house3_spn_hensai = list;
			self.house3_spn_hensai_v = self.house3_spn_hensai[index];

			self.house3_edit_kariirekinri1 = (Number(mSave.ra_kariirekinri1 * 100).toFixed(2) === "0.00") ? 0 : Number(mSave.ra_kariirekinri1 * 100).toFixed(2);
			self.house3_edit_kariirekinri2 = (Number(mSave.ra_kariirekinri2 * 100).toFixed(2) === "0.00") ? 0 : Number(mSave.ra_kariirekinri2 * 100).toFixed(2);
			self.house3_edit_kariirekinri3 = (Number(mSave.ra_kariirekinri3 * 100).toFixed(2) === "0.00") ? 0 : Number(mSave.ra_kariirekinri3 * 100).toFixed(2);


			self.house3_edit_kuriage = Module.commafy(Number(mSave.sm_kuriage));
			self.house3_edit_sm_kariire = Module.commafy(Number(mSave.sm_kariire));
			self.house3_edit_sm_syouyo = Module.commafy(Number(mSave.sm_syouyo));

			if (mSave.id_kuriage === 0) {
				self.house3_btn_kuriage_1 = "返済軽減";
				self.house3_btn_kuriage_2 = "";
			} else {
				self.house3_btn_kuriage_1 = "";
				self.house3_btn_kuriage_2 = "期間短縮";
			}
			if (mSave.id_dansin === 1) {
				self.house3_btn_dansin_1 = "加入";
				self.house3_btn_dansin_2 = "";
			} else {
				self.house3_btn_dansin_1 = "";
				self.house3_btn_dansin_2 = "未加入";
			}
			var index = 0;
			var list1_max = mSave.no_hensai - 1;
			var list2_max = mSave.no_hensai - 1;
			if (mSave.no_hensai <= 1) {
				mSave.no_kariirekinri2 = 0;
				mSave.no_kariirekinri3 = 0;
				list1_max = 0;
				list2_max = 0;
			} else if (mSave.no_hensai === 2) {
				if (mSave.no_kariirekinri2 > 1) {
					mSave.no_kariirekinri2 = 1;
				}
				mSave.no_kariirekinri3 = 0;
				list1_max = 1;
				list2_max = 0;
			} else {
				if (mSave.no_hensai < mSave.no_kariirekinri3 + 1) {
					mSave.no_kariirekinri3 = mSave.no_hensai - 1;
				}
				if (mSave.no_kariirekinri3 === 0 && mSave.no_hensai < mSave.no_kariirekinri2 + 1) {
					mSave.no_kariirekinri2 = mSave.no_hensai - 1;
				} else if (mSave.no_hensai < mSave.no_kariirekinri2 + 2) {
					mSave.no_kariirekinri2 = mSave.no_hensai - 2;
				}

			}
			var list1 = DB.getNumberList(0, 0, list1_max, "", "年後");
			var list2 = DB.getNumberList(0, 0, list2_max, "", "年後");
			list1[0] = Wording.MISENTAKU;
			list2[0] = Wording.MISENTAKU;
			index = mSave.no_kariirekinri2;
			self.house3_spn_kariirekinri2 = list1;
			self.house3_spn_kariirekinri2_v = self.house3_spn_kariirekinri2[index];
			index = mSave.no_kariirekinri3;
			self.house3_spn_kariirekinri3 = list2;
			self.house3_spn_kariirekinri3_v = self.house3_spn_kariirekinri3 [index];

			var list_max = mSave.no_hensai - 1;
			if (list_max < 0) {
				list_max = 0;
			}
			var list = DB.getNumberList(0, 0, list_max, "", "年後");
			list[0] = Wording.MISENTAKU;
			if (list_max !== 0 && mSave.y_kuriage >= mSave.no_hensai) {
				mSave.y_kuriage = mSave.no_hensai - 1;
			} else if (list_max === 0) {
				mSave.y_kuriage = 0;
			}
			index = mSave.y_kuriage;
			self.house3_spn_kuriage = list;
			self.house3_spn_kuriage_v = self.house3_spn_kuriage[index];
		};

		p.onClick = function (v) {
			switch (v) {
				case "house3_btn_kuriage_1":
					mSave.id_kuriage = 0;
					self.update();
					break;
				case "house3_btn_kuriage_2":
					mSave.id_kuriage = 1;
					self.update();
					break;
				case "house3_btn_dansin_1":
					mSave.id_dansin = 1;
					self.update();
					break;
				case "house3_btn_dansin_2":
					mSave.id_dansin = 0;
					self.update();
					break;
			}
		};

		p.isValid = function (_mc, context) {
			if (_mc.sm_kariire <= 0 || _mc.sm_kariire > 999990000) {
				alert("借入金額 の入力内容を見直してください。");
				return false;
			}
			if (_mc.ra_kariirekinri1 < 0.0005 || _mc.ra_kariirekinri1 > 0.9875) {
				alert("借入金利１の入力内容を見直してください。");
				return false;
			}
			// 受入No.72 借入金利２の期間 or 金利のいずれかが入力済みの場合

			if ((_mc.no_kariirekinri2 !== 0 && _mc.ra_kariirekinri2 < 0.0005) || (_mc.no_kariirekinri2 === 0 && _mc.ra_kariirekinri2 >= 0.0005)) {
				alert("借入金利２の入力内容を見直してください。");
				return false;
			}
			// 受入No.73 借入金利３の期間 or 金利のいずれかが入力済みの場合

			if ((_mc.no_kariirekinri3 !== 0 && _mc.ra_kariirekinri3 < 0.0005) || (_mc.no_kariirekinri3 === 0 && _mc.ra_kariirekinri3 >= 0.0005)) {
				alert("借入金利３の入力内容を見直してください。");
				return false;
			}
			// 返済期間＜借入２・３期間  or 借入２期間＝ ＞借入３期間 or 借入期間２未設定かつ借入期間３設定の場合

			if ((_mc.no_hensai < _mc.no_kariirekinri2 || _mc.no_hensai < _mc.no_kariirekinri3) || (_mc.no_kariirekinri2 >= _mc.no_kariirekinri3 && _mc.no_kariirekinri3 > 0) || (_mc.no_kariirekinri2 === 0 && _mc.no_kariirekinri3 > 0)) {
				alert("借入金利の入力内容を見直してください。");
				return false;
			}
			// 受入No.74 繰上返済の期間 or 金利のいずれかが入力済みの場合

			if ((_mc.y_kuriage !== 0 && _mc.sm_kuriage <= 0) || (_mc.y_kuriage === 0 && _mc.sm_kuriage > 0)) {
				alert("繰上返済の入力内容を見直してください。");
				return false;
			}
			return true;
		};

		p.onClickClose = function (v) {
			switch (v) {
				case "popup_cancel":
					LMPS.closeModal();
					break;
				case "popup_change":
					if (self.isValid(mSave, this)) {
						var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase"));
						var key = id_modelcase;
						data[key].id_kuriage = mSave.id_kuriage;
						data[key].id_dansin = mSave.id_dansin;
						data[key].no_hensai = mSave.no_hensai;
						data[key].no_kariirekinri2 = mSave.no_kariirekinri2;
						data[key].no_kariirekinri3 = mSave.no_kariirekinri3;
						data[key].y_kuriage = mSave.y_kuriage;
						data[key].sm_kariire = mSave.sm_kariire;
						data[key].ra_kariirekinri1 = mSave.ra_kariirekinri1;
						data[key].ra_kariirekinri2 = mSave.ra_kariirekinri2;
						data[key].ra_kariirekinri3 = mSave.ra_kariirekinri3;
						data[key].sm_kuriage = mSave.sm_kuriage;
						data[key].sm_syouyo = mSave.sm_syouyo;
						LIFEPLAN.conf.storage.setItem("lp_modelcase", JSON.stringify(data));

						init();
						setup();
						LMPS.closeModal();
					}
					break;
			}
		};

		p.onSelect = function (id, event) {
			var index = event.target.selectedIndex;

			if (id === "house3_spn_hensai") {
				mSave.no_hensai = index + 1;
				self.update();
			} else if (id === "house3_spn_kariirekinri2") {
				mSave.no_kariirekinri2 = index;
				self.update();
			} else if (id === "house3_spn_kariirekinri3") {
				mSave.no_kariirekinri3 = index;
				self.update();
			} else if (id === "house3_spn_kuriage") {
				mSave.y_kuriage = index;
				self.update();
			}
		};

		p.onCalcFinish = function (v) {
			var value;
			switch (v) {
				case "house3_edit_sm_kariire":
					value = Module.toFilteredNum(viewModel.house3_edit_sm_kariire());
					mSave.sm_kariire = (value > 999990000) ? 999990000 : value;
					self.update();
					break;
				case "house3_edit_kariirekinri1":
					value = Module.toFilteredNum(viewModel.house3_edit_kariirekinri1()) / 100;
					mSave.ra_kariirekinri1 = (value > 0.9875) ? 0.9875 : value;
					self.update();
					break;
				case "house3_edit_kariirekinri2":
					value = Module.toFilteredNum(viewModel.house3_edit_kariirekinri2()) / 100;
					mSave.ra_kariirekinri2 = (value > 0.9995) ? 0.9995 : value;
					self.update();
					break;
				case "house3_edit_kariirekinri3":
					value = Module.toFilteredNum(viewModel.house3_edit_kariirekinri3()) / 100;
					mSave.ra_kariirekinri3 = (value > 0.9995) ? 0.9995 : value;
					self.update();
					break;
				case "house3_edit_kuriage":
					value = Module.toFilteredNum(viewModel.house3_edit_kuriage());
					mSave.sm_kuriage = (value > 99990000) ? 99990000 : value;
					self.update();
					break;
				case "house3_edit_sm_syouyo":
					value = Module.toFilteredNum(viewModel.house3_edit_sm_syouyo());
					mSave.sm_syouyo = (value > 990000) ? 990000 : value;
					self.update();
					break;
			}
		};

		return S2;
	})();

	Scenes.S3 = (function () {
		var self;
		var S3 = function () {
			self = this;
		};
		var p = S3.prototype;

		p.onCreate = function () {
			self.update();
		};

		p.update = function () {
			var s;

			//総予算

			var pref = MC.id_prefecture;
			if (pref === 0) {
				return;
			}

			// 脚注
			// 2021/04/22 脚注の編集仕様変更
			//if (MC.id_kuriage === 0) {
			//	self.popup_house_detail_txt_comment = "※繰越返済後は返済軽減、賞与は年2回";
			//} else {
			//	self.popup_house_detail_txt_comment = "※繰越返済後は期間短縮、賞与は年2回";
			//}
			var txt_comment = "";
			var delim_comment = "";
			if (MC.y_kuriage > 0) {
				if (MC.id_kuriage === 0) {
					txt_comment = "※繰上返済後は返済軽減";
					delim_comment = "、";
				} else {
					txt_comment = "※繰上返済後は期間短縮";
					delim_comment = "、";
				}
			}
			if (MC.sm_syouyo > 0) {
				txt_comment = txt_comment + delim_comment + "賞与は年" + MC.id_syouyo + "回";
			}
			self.popup_house_detail_txt_comment = txt_comment;

			//計算式(25)自己資金
			var jiko = Calc.mLogic05.Calc25_Jikoshikin(MC.sm_jyutakuyosan);
			s = Util.formatMoneyMan(jiko, 0);
			self.house_detail_txt_jikosikin = s;

			//計算式(26)借入金

			s = Util.formatMoneyMan(MC.sm_kariire, 0);
			self.house_detail_txt_sm_kariire = s;
			//返済総額(26)

			var hensou = Calc.mLogic05.mTR;
			s = Util.formatMoneyMan(hensou, 0);
			self.house_detail_txt_total_hensai = s;

			var index = Calc.L5().getIndex(false);

			//完済年齢(26)
			var kansaiAge = Calc.mLogic05._KansaiAge;
			s = String(kansaiAge) + "歳";
			self.house_detail_txt_age_kansai = s;

			//繰上返済(26)
			s = Util.formatMoneyMan(Calc.mLogic05.AR, 0) + "(" + String(MC.y_kuriage) + "年後)";
			self.house_detail_txt_kuriage = s;

			//総予算 = 自己資金 + 返済総額

			s = Util.formatMoneyMan(jiko + hensou, 0);
			self.house_detail_txt_totalyosan = s;

			// 2021/04/26 適用期間中に繰上返済の期間短縮がある場合は、繰上返済後の年返済額・月返済額を表示する処理を追加
			var S = [];  // S(i):適用期間開始年 … 金利変更年  i=1は1段目
			var H = [];  // H(i):金利変更年or繰上年 i=1は1段目
			for (var i = 0; i < 4; i++) {
				S[i] = 0;
				H[i] = 0;
			}
			S[1] = 0;  // 固定 金利① 適用開始年
			S[2] = MC.no_kariirekinri2;  // 金利② 適用開始年
			S[3] = MC.no_kariirekinri3;  // 金利③ 適用開始年
			for (var i = 1; i < 4; i++) {
				if (i == 1 || S[i] > 0) {
					H[i] = MC.y_kuriage;
					if (S[i] <= MC.y_kuriage) {
						H[i - 1] = S[i];
					} else {
						H[i] = S[i];
					}
				}
			}

			//----１段目
			//借入金利1
			s = Util.num2RoundN(MC.ra_kariirekinri1 * 100.0, 2) + "%";
			self.house_detail_txt_ra_kariirekinri1 = s;

			var pernensyu;

			var NENSYU_ZERO_PERCENT = "(--.--%)";
			//年間返済額1
			// 2021/04/26 取得年を金利変更年or繰上年2段目に変更
			//var amount = Calc.mLogic05.vYR[MC.age_jyutaku + 1 + index];
			var amount = Calc.mLogic05.vYR[MC.age_jyutaku + H[1] + index];
			s = Util.formatMoneyMan(amount, 0);
			// 2021/04/26 取得年を金利変更年or繰上年1段目に変更
			//if (Calc.L1().vNensyu_hon[MC.age_hon + index] > 0) {
			if (Calc.L1().vNensyu_hon[MC.age_hon + H[1] + index] > 0) {
				// 2021/04/26 取得年を金利変更年or繰上年1段目に変更
				//pernensyu = amount * 100.0 / Calc.L1().vNensyu_hon[MC.age_hon + index];
				pernensyu = amount * 100.0 / Calc.L1().vNensyu_hon[MC.age_hon + H[1] + index];
				s += "(" + Util.num2RoundN(pernensyu, 2) + "%)";
			} else {
				s += NENSYU_ZERO_PERCENT;
			}
			self.house_detail_txt_year_hensai1 = s;

			//月間返済額1
			// 2021/04/26 月間返済額は小数1桁まで表示するように修正。取得年を金利変更年or繰上年1段目に変更
			//s = Util.formatMoneyMan(Calc.mLogic05.vMR[MC.age_jyutaku + 1 + index], 0);
			s = Util.formatMoneyMan(Calc.mLogic05.vMR[MC.age_jyutaku + H[1] + index], 1);
			self.house_detail_txt_month_hensai1 = s;

			//賞与時加算1
			s = Util.formatMoneyMan(MC.sm_syouyo, 0);
			self.house_detail_txt_sm_syouyo1 = s;

			//----２段目
			//適用期間2
			if (MC.no_kariirekinri2 === 0) {
				s = "-";
			} else {
				s = String(MC.no_kariirekinri2) + "年後";
			}
			self.house_detail_txt_title2 = s;

			//借入金利2
			if (MC.no_kariirekinri2 === 0) {
				s = "-";
			} else {
				s = Util.num2RoundN(MC.ra_kariirekinri2 * 100.0, 2) + "%";
			}
			self.house_detail_txt_ra_kariirekinri2 = s;

			//年間返済額2
			if (MC.no_kariirekinri2 === 0) {
				s = "-";
			} else {
				// 2021/04/26 取得年を金利変更年or繰上年2段目に変更
				//amount = Calc.mLogic05.vYR[MC.age_jyutaku + 1 + MC.no_kariirekinri2 + 1 + index];
				amount = Calc.mLogic05.vYR[MC.age_jyutaku + H[2] + index];
				s = Util.formatMoneyMan(amount, 0);
				// 2021/04/26 取得年を金利変更年or繰上年2段目に変更
				//if (Calc.L1().vNensyu_hon[MC.age_hon + index] > 0) {
				if (Calc.L1().vNensyu_hon[MC.age_jyutaku + H[2] + index] > 0) {
					// 2021/04/26 取得年を金利変更年or繰上年2段目に変更
					//pernensyu = amount * 100.0 / Calc.L1().vNensyu_hon[MC.age_hon + index];
					pernensyu = amount * 100.0 / Calc.L1().vNensyu_hon[MC.age_jyutaku + H[2] + index];
					s += "(" + Util.num2RoundN(pernensyu, 2) + "%)";
				} else {
					s += NENSYU_ZERO_PERCENT;
				}
			}
			self.house_detail_txt_year_hensai2 = s;

			//月間返済額2
			if (MC.no_kariirekinri2 === 0) {
				s = "-";
			} else {
				// 2021/04/26 月間返済額は小数1桁まで表示するように修正。取得年を金利変更年or繰上年2段目に変更
				//s = Util.formatMoneyMan(Calc.mLogic05.vMR[MC.age_jyutaku + 1 + MC.no_kariirekinri2 + 1 + index], 0);
				s = Util.formatMoneyMan(Calc.mLogic05.vMR[MC.age_jyutaku + H[2] + index], 1);
			}
			self.house_detail_txt_month_hensai2 = s;

			//賞与時加算2
			if (MC.no_kariirekinri2 === 0) {
				s = "-";
			} else {
				s = Util.formatMoneyMan(MC.sm_syouyo, 0);
			}
			self.house_detail_txt_sm_syouyo2 = s;

			//----３段目
			//適用期間3
			if (MC.no_kariirekinri3 === 0) {
				s = "-";
			} else {
				s = String(MC.no_kariirekinri3) + "年後";
			}
			self.house_detail_txt_title3 = s;

			//借入金利3
			if (MC.no_kariirekinri3 === 0) {
				s = "-";
			} else {
				s = Util.num2RoundN(MC.ra_kariirekinri3 * 100.0, 2) + "%";
			}
			self.house_detail_txt_ra_kariirekinri3 = s;

			//年間返済額3
			if (MC.no_kariirekinri3 === 0) {
				s = "-";
			} else {
				// 2021/04/26 取得年を金利変更年or繰上年3段目に変更
				//amount = Calc.mLogic05.vYR[MC.age_jyutaku + 1 + MC.no_kariirekinri3 + 1 + index];
				amount = Calc.mLogic05.vYR[MC.age_jyutaku + H[3] + index];
				s = Util.formatMoneyMan(amount, 0);
				// 2021/04/26 取得年を金利変更年or繰上年3段目に変更
				//if (Calc.L1().vNensyu_hon[MC.age_hon + index] > 0) {
				if (Calc.L1().vNensyu_hon[MC.age_jyutaku + H[3] + index] > 0) {
					// 2021/04/26 月間返済額は小数1桁まで表示するように修正。取得年を金利変更年or繰上年3段目に変更
					//pernensyu = amount * 100.0 / Calc.L1().vNensyu_hon[MC.age_hon + index];
					pernensyu = amount * 100.0 / Calc.L1().vNensyu_hon[MC.age_jyutaku + H[3] + index];
					s += "(" + Util.num2RoundN(pernensyu, 2) + "%)";
				} else {
					s += NENSYU_ZERO_PERCENT;
				}
			}
			self.house_detail_txt_year_hensai3 = s;

			//月間返済額3
			if (MC.no_kariirekinri3 === 0) {
				s = "-";
			} else {
				// 2021/04/26 月間返済額は小数1桁まで表示するように修正。取得年を金利変更年or繰上年3段目に変更
				//s = Util.formatMoneyMan(Calc.mLogic05.vMR[MC.age_jyutaku + 1 + MC.no_kariirekinri3 + 1 + index], 0);
				s = Util.formatMoneyMan(Calc.mLogic05.vMR[MC.age_jyutaku + H[3] + index], 1);
			}
			self.house_detail_txt_month_hensai3 = s;

			//賞与時加算3
			if (MC.no_kariirekinri3 === 0) {
				s = "-";
			} else {
				s = Util.formatMoneyMan(MC.sm_syouyo, 0);
			}
			self.house_detail_txt_sm_syouyo3 = s;
		};

		p.onClickClose = function (v) {
			LMPS.closeModal();
		};

		return S3;
	})();

	var S0 = new Scenes.S0();
	var S1 = new Scenes.S1();
	var S2 = new Scenes.S2();
	var S3 = new Scenes.S3();


	// knockout表示用セットアップ
	setup();


	var ViewModel = function () {
		//weapperクラス変更 上部プラン別画像表示
		this.modelClass = ko.observable(m_modelClass);
		this.simulation1 = ko.observable(simulation1);
		this.setting_tab1_basic = ko.observable(setting_tab1_basic);
		this.setting_tab2_job = ko.observable(setting_tab2_job);
		this.setting_tab3_house = ko.observable(setting_tab3_house);
		this.setting_tab4_education = ko.observable(setting_tab4_education);
		this.setting_tab5_insurance = ko.observable(setting_tab5_insurance);

		// scene-0
		this.setting_house_txt_comment_1 = ko.observable(S0.setting_house_txt_comment_1);
		this.setting_house_txt_comment_2 = ko.observable(S0.setting_house_txt_comment_2);
		this.house1_txt_age_jyutaku = ko.observable(S0.house1_txt_age_jyutaku);
		this.house1_txt_id_prefecture = ko.observable(S0.house1_txt_id_prefecture);
		this.house1_txt_sm_jyutakuyosan = ko.observable(S0.house1_txt_sm_jyutakuyosan);
		this.house1_txt_sm_jyutakukeihi = ko.observable(S0.house1_txt_sm_jyutakukeihi);
		this.house1_txt_id_jyutakuloan = ko.observable(S0.house1_txt_id_jyutakuloan);
		this.house3_row_jyutakuloan = ko.observable(S0.house3_row_jyutakuloan);
		this.house3_txt_sm_kariire = ko.observable(S0.house3_txt_sm_kariire);
		this.house3_txt_no_hensai = ko.observable(S0.house3_txt_no_hensai);
		this.house3_txt_kariirekinri = ko.observable(S0.house3_txt_kariirekinri);
		this.house3_txt_syouyo = ko.observable(S0.house3_txt_syouyo);
		this.house3_txt_kuriage = ko.observable(S0.house3_txt_kuriage);
		this.house3_txt_dansin = ko.observable(S0.house3_txt_dansin);

		// scene-1
		this.house1_spn_age_jyutaku = ko.observableArray(S1.house1_spn_age_jyutaku);
		this.house1_spn_age_jyutaku_v = ko.observable(S1.house1_spn_age_jyutaku_v);
		this.house1_spn_prefecture = ko.observableArray(S1.house1_spn_prefecture);
		this.house1_spn_prefecture_v = ko.observable(S1.house1_spn_prefecture_v);
		this.house1_btn_jyutakutype_1 = ko.observable(S1.house1_btn_jyutakutype_1);
		this.house1_btn_jyutakutype_2 = ko.observable(S1.house1_btn_jyutakutype_2);
		this.house1_edit_jyutakuyosan = ko.observable(S1.house1_edit_jyutakuyosan);
		this.house1_edit_jyutakukeihi = ko.observable(S1.house1_edit_jyutakukeihi);
		this.house1_btn_jyutakuloan_1 = ko.observable(S1.house1_btn_jyutakuloan_1);
		this.house1_btn_jyutakuloan_2 = ko.observable(S1.house1_btn_jyutakuloan_2);

		// scene-2
		this.house3_edit_sm_kariire = ko.observable(S2.house3_edit_sm_kariire);
		this.house3_spn_hensai = ko.observableArray(S2.house3_spn_hensai);
		this.house3_spn_hensai_v = ko.observable(S2.house3_spn_hensai_v);
		this.house3_edit_kariirekinri1 = ko.observable(S2.house3_edit_kariirekinri1);
		this.house3_spn_kariirekinri2 = ko.observableArray(S2.house3_spn_kariirekinri2);
		this.house3_spn_kariirekinri2_v = ko.observable(S2.house3_spn_kariirekinri2_v);
		this.house3_edit_kariirekinri2 = ko.observable(S2.house3_edit_kariirekinri2);
		this.house3_spn_kariirekinri3 = ko.observableArray(S2.house3_spn_kariirekinri3);
		this.house3_spn_kariirekinri3_v = ko.observable(S2.house3_spn_kariirekinri3_v);
		this.house3_edit_kariirekinri3 = ko.observable(S2.house3_edit_kariirekinri3);
		this.house3_edit_sm_syouyo = ko.observable(S2.house3_edit_sm_syouyo);
		this.house3_spn_kuriage = ko.observableArray(S2.house3_spn_kuriage);
		this.house3_spn_kuriage_v = ko.observable(S2.house3_spn_kuriage_v);
		this.house3_edit_kuriage = ko.observable(S2.house3_edit_kuriage);
		this.house3_btn_kuriage_1 = ko.observable(S2.house3_btn_kuriage_1);
		this.house3_btn_kuriage_2 = ko.observable(S2.house3_btn_kuriage_2);
		this.house3_btn_dansin_1 = ko.observable(S2.house3_btn_dansin_1);
		this.house3_btn_dansin_2 = ko.observable(S2.house3_btn_dansin_2);

		// scene-3
		this.house_detail_txt_totalyosan = ko.observable(S3.house_detail_txt_totalyosan);
		this.house_detail_txt_jikosikin = ko.observable(S3.house_detail_txt_jikosikin);
		this.house_detail_txt_sm_kariire = ko.observable(S3.house_detail_txt_sm_kariire);
		this.house_detail_txt_total_hensai = ko.observable(S3.house_detail_txt_total_hensai);
		this.house_detail_txt_age_kansai = ko.observable(S3.house_detail_txt_age_kansai);
		this.house_detail_txt_kuriage = ko.observable(S3.house_detail_txt_kuriage);
		this.house_detail_txt_ra_kariirekinri1 = ko.observable(S3.house_detail_txt_ra_kariirekinri1);
		this.house_detail_txt_year_hensai1 = ko.observable(S3.house_detail_txt_year_hensai1);
		this.house_detail_txt_month_hensai1 = ko.observable(S3.house_detail_txt_month_hensai1);
		this.house_detail_txt_sm_syouyo1 = ko.observable(S3.house_detail_txt_sm_syouyo1);
		this.house_detail_txt_title2 = ko.observable(S3.house_detail_txt_title2);
		this.house_detail_txt_ra_kariirekinri2 = ko.observable(S3.house_detail_txt_ra_kariirekinri2);
		this.house_detail_txt_year_hensai2 = ko.observable(S3.house_detail_txt_year_hensai2);
		this.house_detail_txt_month_hensai2 = ko.observable(S3.house_detail_txt_month_hensai2);
		this.house_detail_txt_sm_syouyo2 = ko.observable(S3.house_detail_txt_sm_syouyo2);
		this.house_detail_txt_title3 = ko.observable(S3.house_detail_txt_title3);
		this.house_detail_txt_ra_kariirekinri3 = ko.observable(S3.house_detail_txt_ra_kariirekinri3);
		this.house_detail_txt_year_hensai3 = ko.observable(S3.house_detail_txt_year_hensai3);
		this.house_detail_txt_month_hensai3 = ko.observable(S3.house_detail_txt_month_hensai3);
		this.house_detail_txt_sm_syouyo3 = ko.observable(S3.house_detail_txt_sm_syouyo3);
		this.popup_house_detail_txt_comment = ko.observable(S3.popup_house_detail_txt_comment);


		this.setData = function () {
			//weapperクラス変更 上部プラン別画像表示
			this.modelClass(m_modelClass);
			this.simulation1(simulation1);
			this.setting_tab1_basic(setting_tab1_basic);
			this.setting_tab2_job(setting_tab2_job);
			this.setting_tab3_house(setting_tab3_house);
			this.setting_tab4_education(setting_tab4_education);
			this.setting_tab5_insurance(setting_tab5_insurance);

			// scene-0
			this.setting_house_txt_comment_1(S0.setting_house_txt_comment_1);
			this.setting_house_txt_comment_2(S0.setting_house_txt_comment_2);
			this.house1_txt_age_jyutaku(S0.house1_txt_age_jyutaku);
			this.house1_txt_id_prefecture(S0.house1_txt_id_prefecture);
			this.house1_txt_sm_jyutakuyosan(S0.house1_txt_sm_jyutakuyosan);
			this.house1_txt_sm_jyutakukeihi(S0.house1_txt_sm_jyutakukeihi);
			this.house1_txt_id_jyutakuloan(S0.house1_txt_id_jyutakuloan);
			this.house3_row_jyutakuloan(S0.house3_row_jyutakuloan);
			this.house3_txt_sm_kariire(S0.house3_txt_sm_kariire);
			this.house3_txt_no_hensai(S0.house3_txt_no_hensai);
			this.house3_txt_kariirekinri(S0.house3_txt_kariirekinri);
			this.house3_txt_syouyo(S0.house3_txt_syouyo);
			this.house3_txt_kuriage(S0.house3_txt_kuriage);
			this.house3_txt_dansin(S0.house3_txt_dansin);

			// scene-1
			this.house1_spn_age_jyutaku(S1.house1_spn_age_jyutaku);
			this.house1_spn_age_jyutaku_v(S1.house1_spn_age_jyutaku_v);
			this.house1_spn_prefecture(S1.house1_spn_prefecture);
			this.house1_spn_prefecture_v(S1.house1_spn_prefecture_v);
			this.house1_btn_jyutakutype_1(S1.house1_btn_jyutakutype_1);
			this.house1_btn_jyutakutype_2(S1.house1_btn_jyutakutype_2);
			this.house1_edit_jyutakuyosan(S1.house1_edit_jyutakuyosan);
			this.house1_edit_jyutakukeihi(S1.house1_edit_jyutakukeihi);
			this.house1_btn_jyutakuloan_1(S1.house1_btn_jyutakuloan_1);
			this.house1_btn_jyutakuloan_2(S1.house1_btn_jyutakuloan_2);

			// scene-2
			this.house3_edit_sm_kariire(S2.house3_edit_sm_kariire);
			this.house3_spn_hensai(S2.house3_spn_hensai);
			this.house3_spn_hensai_v(S2.house3_spn_hensai_v);
			this.house3_edit_kariirekinri1(S2.house3_edit_kariirekinri1);
			this.house3_spn_kariirekinri2(S2.house3_spn_kariirekinri2);
			this.house3_spn_kariirekinri2_v(S2.house3_spn_kariirekinri2_v);
			this.house3_edit_kariirekinri2(S2.house3_edit_kariirekinri2);
			this.house3_spn_kariirekinri3(S2.house3_spn_kariirekinri3);
			this.house3_spn_kariirekinri3_v(S2.house3_spn_kariirekinri3_v);
			this.house3_edit_kariirekinri3(S2.house3_edit_kariirekinri3);
			this.house3_edit_sm_syouyo(S2.house3_edit_sm_syouyo);
			this.house3_spn_kuriage(S2.house3_spn_kuriage);
			this.house3_spn_kuriage_v(S2.house3_spn_kuriage_v);
			this.house3_edit_kuriage(S2.house3_edit_kuriage);
			this.house3_btn_kuriage_1(S2.house3_btn_kuriage_1);
			this.house3_btn_kuriage_2(S2.house3_btn_kuriage_2);
			this.house3_btn_dansin_1(S2.house3_btn_dansin_1);
			this.house3_btn_dansin_2(S2.house3_btn_dansin_2);

			// scene-3
			this.house_detail_txt_totalyosan(S3.house_detail_txt_totalyosan);
			this.house_detail_txt_jikosikin(S3.house_detail_txt_jikosikin);
			this.house_detail_txt_sm_kariire(S3.house_detail_txt_sm_kariire);
			this.house_detail_txt_total_hensai(S3.house_detail_txt_total_hensai);
			this.house_detail_txt_age_kansai(S3.house_detail_txt_age_kansai);
			this.house_detail_txt_kuriage(S3.house_detail_txt_kuriage);
			this.house_detail_txt_ra_kariirekinri1(S3.house_detail_txt_ra_kariirekinri1);
			this.house_detail_txt_year_hensai1(S3.house_detail_txt_year_hensai1);
			this.house_detail_txt_month_hensai1(S3.house_detail_txt_month_hensai1);
			this.house_detail_txt_sm_syouyo1(S3.house_detail_txt_sm_syouyo1);
			this.house_detail_txt_title2(S3.house_detail_txt_title2);
			this.house_detail_txt_ra_kariirekinri2(S3.house_detail_txt_ra_kariirekinri2);
			this.house_detail_txt_year_hensai2(S3.house_detail_txt_year_hensai2);
			this.house_detail_txt_month_hensai2(S3.house_detail_txt_month_hensai2);
			this.house_detail_txt_sm_syouyo2(S3.house_detail_txt_sm_syouyo2);
			this.house_detail_txt_title3(S3.house_detail_txt_title3);
			this.house_detail_txt_ra_kariirekinri3(S3.house_detail_txt_ra_kariirekinri3);
			this.house_detail_txt_year_hensai3(S3.house_detail_txt_year_hensai3);
			this.house_detail_txt_month_hensai3(S3.house_detail_txt_month_hensai3);
			this.house_detail_txt_sm_syouyo3(S3.house_detail_txt_sm_syouyo3);
			this.popup_house_detail_txt_comment(S3.popup_house_detail_txt_comment);

		};

		this.onClickClose = function (target, id) {
			switch (id) {
				case 0:
					break;
				case 1:
					S1.onClickClose(target);
					this.setData();
					break;
				case 2:
					S2.onClickClose(target);
					this.setData();
					break;
				case 3:
					S3.onClickClose(target);
					this.setData();
					break;
			}
		};

		this.onClick = function (target, id) {
			switch (id) {
				case 0:
					S0.onClick(target);
					this.setData();
					break;
				case 1:
					S1.onClick(target);
					this.setData();
					break;
				case 2:
					S2.onClick(target);
					this.setData();
					break;
			}
		};

		this.onSelect = function (target, id, event) {
			switch (id) {
				case 0:
					break;
				case 1:
					S1.onSelect(target, event);
					this.setData();
					break;
				case 2:
					S2.onSelect(target, event);
					this.setData();
					break;
				case 3:
					break;
			}
		};

		this.onCalcFinish = function (target, id) {
			switch (id) {
				case 0:
					break;
				case 1:
					S1.onCalcFinish(target);
					this.setData();
					break;
				case 2:
					S2.onCalcFinish(target);
					this.setData();
					break;
				case 3:
					break;
			}
		};

		// サイドメニュー表示制御
		this.dispSidemenu = ko.observable(dispSidemenu);
		this.Sidemenu = function (target) {
			dispSidemenu = false;
			this.dispSidemenu(dispSidemenu);
			if (target) {
				LMPS.openModal(target);
			}
			dispSidemenu = null;
			this.dispSidemenu(dispSidemenu);
		};

		// ご利用に際しての留意事項
		var L = [];
		var R = [];
		for (var i = 0; i < screenMessage.length; i++) {
			if ("L" === screenMessage[i].id_message) {
				L.push(screenMessage[i]);
			} else if ("R" === screenMessage[i].id_message) {
				R.push(screenMessage[i]);
			}
		}
		this.screenMessageL = ko.observableArray(L);
		this.screenMessageR = ko.observableArray(R);

		// 設定
		this.id_company = lp_setupinfo[0].id_company;
		// サイドメニュー表示制御 END

		this.st_message1 = lp_setupinfo[1].st_message;
		this.st_message2 = lp_setupinfo[2].st_message;
		
	};

	var viewModel = new ViewModel();
	ko.applyBindings(viewModel);


	function init() {
		DB = new LIFEPLAN.db.LifePlanDB();
		Calc = new LIFEPLAN.calc.Calc(DB);
		Util = new LIFEPLAN.util.Util();
		MC = DB.mc.s_modelcase;
		Wording = DB.Wording;
		LPdate = DB.LPdate;
		id_modelcase = JSON.parse(LIFEPLAN.conf.storage.getItem("id_modelcase"));
		Module = LIFEPLAN.module;

		// JSONの読み込み&編集可能JSONデータをwebstorageから読み込み
		DB.db.loadStorage();
		// モデルケースを設定 引数にモデルケース番号
		DB.loadModelcase(id_modelcase);
		// 計算ロジック実行
		Calc.logicALL_Go();

		Logic05 = JSON.parse(LIFEPLAN.conf.storage.getItem("Logic05"));
	}

	function setup() {
		m_modelClass = LIFEPLAN.module.getModelClass(id_modelcase);

		if (id_modelcase === 0) {
			setting_tab1_basic = '<span href="#"><span>基本</span><span>情報</span></span>';
			setting_tab2_job = '<span href="#"><span>職業</span><span class="dot">・</span><span>年収</span></span>';
			setting_tab3_house = '<a href="#" class="current"><span>住宅</span><span>プラン</span></a>';
			setting_tab4_education = '<span href="#"><span>教育</span><span>プラン</span></span>';
			setting_tab5_insurance = '<span href="#"><span>加入</span><span>保険</span></span>';
			simulation1 = '';
		} else {
			if (MC.id_lives === 1 || MC.id_lives_yotei === 1) {
				setting_tab1_basic = '<a href="#"><span>基本</span><span>情報</span></a>';
				setting_tab2_job = '<a href="#"><span>職業</span><span class="dot">・</span><span>年収</span></a>';
				setting_tab3_house = '<a href="#" class="current"><span>住宅</span><span>プラン</span></a>';
				setting_tab4_education = '<a href="#"><span>教育</span><span>プラン</span></a>';
				setting_tab5_insurance = '<a href="#"><span>加入</span><span>保険</span></a>';
				simulation1 = '<a class="button-diagnosis"></a>';
			} else {
				setting_tab1_basic = '<a href="#"><span>基本</span><span>情報</span></a>';
				setting_tab2_job = '<a href="#"><span>職業</span><span class="dot">・</span><span>年収</span></a>';
				setting_tab3_house = '<span href="#"><span>住宅</span><span>プラン</span></span>';
				setting_tab4_education = '<a href="#"><span>教育</span><span>プラン</span></a>';
				setting_tab5_insurance = '<a href="#"><span>加入</span><span>保険</span></a>';
				simulation1 = '<a class="button-diagnosis"></a>';
			}
		}

		S0.onCreate();
		S1.onCreate();
		S2.onCreate();
		S3.onCreate();
	}

	function getIndex(is_hai) {
		var res = 0;

		if (!MC.is_kekkon() && MC.age_hai > 0) {
			res = LPdate.getYear(MC.get_st_birthday(false)) - Logic05.mYYYYStart;
			if (res * -1 > MC.age_hai) {
				res = MC.age_hai * -1;
			}
		} else {
			res = LPdate.getYear(MC.get_st_birthday(is_hai)) - Logic05.mYYYYStart;
		}

		return res;
	}
};