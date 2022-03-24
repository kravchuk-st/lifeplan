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
	var InputValueCheck;

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

	// コンテンツ内共有変数
	var mTab1Hon;

	var Scenes = {
		S0: {},
		S1: {},
		S2: {},
		S3: {},
		S4: {},
		S5: {}
	};

	Scenes.S0 = (function () {
		var self;

		var S0 = function () {
			self = this;
		};

		var p = S0.prototype;

		p.onCreate = function (updateHai) {
			if (updateHai === true) {
				mTab1Hon = 1;
			} else {
				mTab1Hon = 0;
			}


			self.update();
		};

		p.update = function () {
			var s;

			var Age = MC.get_age(false);
			if (Age >= 60) {
				self.row1 = false;
				self.row2 = true;
			} else {
				self.row1 = true;
				self.row2 = true;
			}
			//左上 - 基本エリア

			//性別
			if (MC.id_sex_hon === 1) {
				self.edit_txt_sex = "男性";
			} else if (MC.id_sex_hon === 2) {
				self.edit_txt_sex = "女性";
			} else {
				self.edit_txt_sex = Wording.MISETTEI;
			}
			//生年月日
			self.edit_txt_birth = LPdate.toZen(MC.st_birthday_hon);
			//配偶者

			if (MC.id_haiumu === 1) {
				self.edit_txt_haiumu = "あり";
			} else if (MC.id_haiumu === 0) {
				if (MC.age_kekkon === 0) {
					self.edit_txt_haiumu = "なし";
				} else {
					self.edit_txt_haiumu = "予定あり/" + String(MC.age_kekkon) + "歳時";
				}
			} else {
				self.edit_txt_haiumu = Wording.MISETTEI;
			}

			//配偶者生年月日

			if (MC.is_kekkon()) {
				self.title_txt_birth_hai = "生年月日<br\>(配偶者)";
				self.edit_txt_birth_hai = LPdate.toZen(MC.st_birthday_hai);
			} else {
				self.title_txt_birth_hai = "結婚予定";
				self.edit_txt_birth_hai = "予定なし";
			}

			//左下 - 職業エリア

			//本人/配偶者タブ

			if (MC.is_kekkon()) {
				self.tab_basic2_2 = true;
			} else {
				self.tab_basic2_2 = false;
				mTab1Hon = 0;
			}

			var id_syokugyo = MC.get_id_syokugyo(mTab1Hon === 1);
			var data = DB.get_syokugyo(id_syokugyo);
			self.edit_txt_syokugyo = data.st_syokugyo;

			// 2021/04/12 自営業も就業年月を入力可能に変更
			if (id_syokugyo === DB.G_syokugyo.KAISYAIN ||
							id_syokugyo === DB.G_syokugyo.YAKUIN ||
							id_syokugyo === DB.G_syokugyo.KOMUIN ||
							id_syokugyo === DB.G_syokugyo.TAI_KAISYAIN ||
							id_syokugyo === DB.G_syokugyo.TAI_KOMUIN ||
							id_syokugyo === DB.G_syokugyo.JIEIGYO) {
				// 年齢変更時の就業年齢調整
				self.basic2_syugyo_row = true;
				s = Wording.MISETTEI;
				var ym_syugyo = MC.get_ym_syugyo(mTab1Hon === 1);
				var cur_y = LPdate.getCurYear();
				if (LPdate.getYear(ym_syugyo) > cur_y) {
					ym_syugyo = Module.setYear(cur_y, ym_syugyo);
					var age_syugyo = LPdate.calcAge(MC.get_st_birthday(mTab1Hon === 1), MC.get_ym_syugyo(mTab1Hon === 1));
					MC.set_ym_syugyo(ym_syugyo, mTab1Hon === 1);
					MC.set_age_syugyo(age_syugyo, mTab1Hon === 1);
				}
				if (ym_syugyo !== 0) {
					s = LPdate.toZenYM(ym_syugyo);
				}
				self.edit_txt_syugyo = s;

				if (MC.is_kekkon()) {
					ym_syugyo = MC.get_ym_syugyo(true);
					cur_y = LPdate.getCurYear();
					if (LPdate.getYear(ym_syugyo) > cur_y) {
						ym_syugyo = Module.setYear(cur_y, ym_syugyo);
						var age_syugyo = LPdate.calcAge(MC.get_st_birthday(true), MC.get_ym_syugyo(true));
						MC.set_age_syugyo(age_syugyo, true);
					}
				}
			} else {
				self.basic2_syugyo_row = false;
			}

			if (id_syokugyo === DB.G_syokugyo.TAI_KAISYAIN || id_syokugyo === DB.G_syokugyo.TAI_KOMUIN) {
				// 年齢変更時の退職年齢調整

				self.basic2_taisyoku_row = true;
				s = Wording.MISETTEI;

				var y_tai_start = MC.get_age_syugyo(mTab1Hon === 1);
				var y_tai_end = MC.get_age(mTab1Hon === 1);

				var taisyoku_index = MC.get_age_taisyoku(mTab1Hon === 1);
				if (taisyoku_index > y_tai_end) {
					taisyoku_index = y_tai_end;
				}
				if (taisyoku_index >= y_tai_start) {
					taisyoku_index = taisyoku_index - y_tai_start + 1;
				} else {
					taisyoku_index = 0;
				}
				if (taisyoku_index > 0) {
					MC.set_age_taisyoku(taisyoku_index - 1 + y_tai_start, mTab1Hon === 1);
				}

				var taisyoku = MC.get_age_taisyoku(mTab1Hon === 1);
				s = String(taisyoku) + "歳";
				self.edit_txt_taisyoku = s;
			} else {
				self.basic2_taisyoku_row = false;
			}
			/****2014/03/12 配偶者の退職年齢は配偶者の職業によって再計算 start*****/
			var id_taiSyokugyo = MC.get_id_syokugyo(true);
			if (MC.is_kekkon() && (id_taiSyokugyo === DB.G_syokugyo.TAI_KAISYAIN || id_taiSyokugyo === DB.G_syokugyo.TAI_KOMUIN)) {
				var y_tai_start = MC.get_age_syugyo(true);
				var y_tai_end = MC.get_age(true);

				var taisyoku_index = MC.get_age_taisyoku(true);
				if (taisyoku_index > y_tai_end) {
					taisyoku_index = y_tai_end;
				}
				if (taisyoku_index >= y_tai_start) {
					taisyoku_index = taisyoku_index - y_tai_start + 1;
				} else {
					taisyoku_index = 0;
				}
				if (taisyoku_index > 0) {
					MC.set_age_taisyoku(taisyoku_index - 1 + y_tai_start, true);
				}
			}
			/****2014/03/12 配偶者の退職年齢は配偶者の職業によって再計算 end*****/
			// 年齢変更時の毎月の貯蓄・積立額調整

			var iAge = MC.get_age(mTab1Hon === 1);

			if (MC.mon_saving1_to <= iAge) {
				MC.mon_saving1_from = 0;
				MC.mon_saving1_to = 0;
				MC.sm_saving1 = 0;
			} else if (MC.mon_saving1_from <= iAge && iAge < MC.mon_saving1_to) {
				MC.mon_saving1_from = iAge;
			}

			if (MC.mon_saving2_to <= iAge) {
				MC.mon_saving2_from = 0;
				MC.mon_saving2_to = 0;
				MC.sm_saving2 = 0;
			} else if (MC.mon_saving2_from <= iAge && iAge < MC.mon_saving2_to) {
				MC.mon_saving2_from = iAge;
			}
			/**********2014/03/13 Fromが現在年齢かつ、Toも現在年齢の場合 値を保持 start***********/
			/****<= to < ****/
			// 年齢変更時のその他収入調整

			if (MC.sm_income1_to < iAge) {
				MC.sm_income1_from = 0;
				MC.sm_income1_to = 0;
				MC.sm_income1 = 0;
			} else if (MC.sm_income1_from < iAge && iAge < MC.sm_income1_to) {
				MC.sm_income1_from = iAge;
			}

			if (MC.sm_income2_to < iAge) {
				MC.sm_income2_from = 0;
				MC.sm_income2_to = 0;
				MC.sm_income2 = 0;
			} else if (MC.sm_income2_from < iAge && iAge < MC.sm_income2_to) {
				MC.sm_income2_from = iAge;
			}

			if (MC.sm_income3_to < iAge) {
				MC.sm_income3_from = 0;
				MC.sm_income3_to = 0;
				MC.sm_income3 = 0;
			} else if (MC.sm_income3_from < iAge && iAge < MC.sm_income3_to) {
				MC.sm_income3_from = iAge;
			}
			/**********2014/03/13 Fromが現在年齢かつ、Toも現在年齢の場合 値を保持 end***********/
			//右上 - 住宅エリア

			if (MC.id_lives === 1) {
				self.basic3_txt_lives = "自宅";
				self.basic3_lives_yotei_row = false;
				self.basic3_age_jyutaku_row = true;
				self.basic3_sm_rent_row = false;
				//ローン利用なし

				if (MC.id_jyutakuloan === 0) {
					self.basic3_sm_kariire_row = false;
				} else {
					self.basic3_sm_kariire_row = true;
				}
			} else {
				self.basic3_txt_lives = "賃貸";
				self.basic3_lives_yotei_row = true;
				self.basic3_age_jyutaku_row = false;
				self.basic3_sm_rent_row = true;
				self.basic3_sm_kariire_row = false;
			}
			if (MC.id_lives_yotei === 1) {
				self.basic3_txt_lives_yotei = "購入計画あり";
			} else {
				self.basic3_txt_lives_yotei = "購入計画なし";
			}
			s = Wording.MISETTEI;
			if (MC.age_jyutaku !== 0) {
				s = String(MC.age_jyutaku) + "歳時";
			}
			self.basic3_txt_age_jyutaku = s;

			s = Wording.MISETTEI;
			if (MC.sm_rent !== 0) {
				s = Util.formatMoneyMan(MC.sm_rent, 1);
			}
			self.basic3_txt_rent = s;

			s = Wording.MISETTEI;
			if (MC.sm_kariire !== 0 && MC.no_hensai !== 0) {
				s = "借入金額 " + Util.formatMoneyMan(MC.sm_kariire, 0) + "<br\>";
				s += String(MC.no_hensai) + "年間 ";
				s += Util.num2RoundN(MC.ra_kariirekinri1 * 100, 2) + "%";
			}
			self.basic3_txt_sm_kariire = s;

			//右下 - 保有金融資産エリア

			self.basic4_txt_sm_assets = Util.formatMoneyMan(MC.sm_assets, 0);
			s = "なし";
			if (MC.mon_saving1_from === 0 && MC.mon_saving2_from === 0 && MC.sm_saving1 <= 0 && MC.sm_saving2 <= 0) {
				s = Wording.MISETTEI;
			}
			if (MC.mon_saving1_from > 0 && MC.sm_saving1 > 0) {
				s = String(MC.mon_saving1_from) + "歳～";
				if (MC.mon_saving1_to > 0) {
					s += String(MC.mon_saving1_to) + "歳<br\>";
				}
				s += "月額";
				s += Util.formatMoneyMan(MC.sm_saving1, 1);
			}
			if (MC.mon_saving2_from > 0 && MC.sm_saving2 > 0) {
				s += "<br\><br\>" + String(MC.mon_saving2_from) + "歳～";
				if (MC.mon_saving2_to > 0) {
					s += String(MC.mon_saving2_to) + "歳<br\>";
				}
				s += "月額";
				s += Util.formatMoneyMan(MC.sm_saving2, 1);
			}
			self.basic4_txt_mon_saving = s;
			/*****2014/01/20  基本生活費、退職後生活費の入力欄追加	start***********/
			self.kihonn_seikatu = Util.formatMoneyMan(Calc.L5().Calc20_Seikatsu(), 1);
			self.taisyoku_seikatu = Util.formatMoneyMan(Calc.L5().Calc21_TaiSeikatsu(), 1);
			/*****2014/01/20  基本生活費、退職後生活費の入力欄追加	end***********/
		};

		p.onClick = function (v) {
			viewModel.Sidemenu();

			switch (v) {
				case "setting_tab3":
					if (id_modelcase !== 0) {
						if (MC.id_lives === 1 || MC.id_lives_yotei === 1) {
							if (self.isValid(this)) {
								window.location.href = 'setting_tab3_house.html';
							}
						}
					}
					break;
				case "setting_tab4":
					if (id_modelcase !== 0) {
						if (self.isValid(this)) {
							window.location.href = 'setting_tab4_education.html';
						}
					}
					break;
				case "setting_tab5":
					if (id_modelcase !== 0) {
						if (self.isValid(this)) {
							window.location.href = 'setting_tab5_insurance.html';
						}
					}
					break;
				case "goto_simulation":
					if (self.isValid(this)) {
						if (InputValueCheck.settingJob_S0_isValid(MC)) {
							window.location.href = 'simulation1.html';
						}
					}
					break;
			}

			switch (v) {
				case "setting_tab1":
					break;
				case "setting_tab2":
					if (self.isValid(this)) {
						window.location.href = 'setting_tab2_job.html';
					}
					break;
				case "#modal-1":
					S1.onCreate();
					LMPS.openModal(v);
					var dWidth = $(".kihonHon").outerWidth();
					// $(".kihonHai").css('width', dWidth );
					break;
				case "#modal-2":
					// 20160517_Web版lifeplan対応_結合-025_start
					DB.Lp_modelcase.copy(MC);
					// 20160517_Web版lifeplan対応_結合-025_end
					S2.onCreate();
					LMPS.openModal(v);
					break;
				case "#modal-3":
					// 20160517_Web版lifeplan対応_結合-025_start
					DB.Lp_modelcase.copy(MC);
					// 20160517_Web版lifeplan対応_結合-025_end
					S3.onCreate();
					LMPS.openModal(v);
					break;
				case "#modal-4":
					// 20160517_Web版lifeplan対応_結合-025_start
					DB.Lp_modelcase.copy(MC);
					// 20160517_Web版lifeplan対応_結合-025_end
					S4.onCreate();
					LMPS.openModal(v);
					break;
					/*****2014/01/20  基本生活費、退職後生活費の入力欄追加	start***********/
				case "#modal-5":
					// 20160517_Web版lifeplan対応_結合-025_start
					DB.Lp_modelcase.copy(MC);
					// 20160517_Web版lifeplan対応_結合-025_end
					S5.onCreate();
					LMPS.openModal(v);
					break;
					/*****2014/01/20  基本生活費、退職後生活費の入力欄追加	end***********/
				case "tab_basic2_1":
					if (mTab1Hon !== 0) {
						mTab1Hon = 0;
						self.update();
					}
					break;
				case "tab_basic2_2":
					if (mTab1Hon !== 1) {
						mTab1Hon = 1;
						self.update();
					}
					break;
			}
		};

		p.isValid = function (context) {
			if (false === S1.isValid(MC, context)) {
				return false;
			}
			if (MC.is_kekkon()) {
				if (false === S2.isValid(MC, context, true)) {
					return false;
				}
			}
			if (false === S2.isValid(MC, context, false)) {
				return false;
			}
			if (false === S3.isValid(MC, context)) {
				return false;
			}
			if (false === S4.isValid(MC, context)) {
				return false;
			}
			return true;
		};

		return S0;
	})();

	Scenes.S1 = (function () {
		var self;
		var mSave;
		var y_start;
		var y_end;
		var dayMax_hon;
		var dayMax_hai;

		var S1 = function () {
			self = this;
		};

		var p = S1.prototype;

		p.onCreate = function () {
			mSave = DB.Lp_modelcase;
			mSave.copy(MC);
			/**
			 * 生年月日（本人）sysdate - 65	～ sysdate - 20
			 */
			var birth = mSave.st_birthday_hon;
			y_start = LPdate.getCurYear(birth) - 65;
			y_end = LPdate.getCurYear(birth) - 20;
			var y, m, d;

			y = (LPdate.getYear(birth) !== 0) ? LPdate.getYear(birth) : y_start;
			y = (y > y_end) ? y_end : y;
			m = (LPdate.getMon(birth) !== 0) ? LPdate.getMon(birth) : 4;

			dayMax_hon = Util.calcDaysOfMonth(y, m);
			d = (LPdate.getDay(birth) !== 0) ? LPdate.getDay(birth) : 2;
			d = (d > dayMax_hon) ? dayMax_hon : d;

			var yyyy = DB.getNumberList(0, y_start, y_end, "", "年");
			var mm = DB.getNumberList(0, 1, 12, "", "月");
			var dd = DB.getNumberList(0, 1, dayMax_hon, "", "日");

			self.spn_birth_hon_yyyy = yyyy;
			self.spn_birth_hon_yyyy_v = self.spn_birth_hon_yyyy[y - y_start];
			self.spn_birth_hon_mm = mm;
			self.spn_birth_hon_mm_v = self.spn_birth_hon_mm[m - 1];
			self.spn_birth_hon_dd = dd;
			self.spn_birth_hon_dd_v = self.spn_birth_hon_dd[d - 1];


			birth = mSave.st_birthday_hai;

			y = LPdate.getYear(birth);
			/******2014/01/20 年齢（配偶者）=0時　配偶者を押した後の[あり]==> Exceptionとなる。 start***/
			//		if (y==0){
			//			y=y_start;
			//		}
			if (y === 0 || y - y_start < 0) {
				y = y_start;
			} else if (y - y_start >= yyyy.length) {
				y = yyyy.length + y_start - 1;
			}
			/******2014/01/20 年齢（配偶者）=0時　配偶者を押した後の[あり]==> Exceptionとなる。 end***/
			m = LPdate.getMon(birth);
			if (m === 0) {
				m = 4;
			}
			dayMax_hai = Util.calcDaysOfMonth(y, m);
			d = LPdate.getDay(birth);
			if (d === 0) {
				d = 2;
			}
			if (d > dayMax_hai) {
				d = dayMax_hai;
			}
			dd = DB.getNumberList(0, 1, dayMax_hai, "", "日");

			self.spn_birth_hai_yyyy = yyyy;
			self.spn_birth_hai_yyyy_v = self.spn_birth_hai_yyyy[y - y_start];
			self.spn_birth_hai_mm = mm;
			self.spn_birth_hai_mm_v = self.spn_birth_hai_mm[m - 1];
			self.spn_birth_hai_dd = dd;
			self.spn_birth_hai_dd_v = self.spn_birth_hai_dd[d - 1];

			self.update();
		};

		p.update = function () {
			if (mSave.id_sex_hon === 1) {
				self.btn_sex_1 = "男性";
				self.btn_sex_2 = "";
			} else if (mSave.id_sex_hon === 2) {
				self.btn_sex_1 = "";
				self.btn_sex_2 = "女性";
			} else {
				self.btn_sex_1 = "";
				self.btn_sex_2 = "";
			}
			if (mSave.id_haiumu === 1) {
				self.btn_haiumu_1 = "あり";
				self.btn_haiumu_2 = "";
			} else if (mSave.id_haiumu === 0) {
				self.btn_haiumu_1 = "";
				self.btn_haiumu_2 = "なし";
			} else {
				self.btn_haiumu_1 = "";
				self.btn_haiumu_2 = "";
			}
			var row = 1;
			if (mSave.id_haiumu !== 0) {
				self.row_kekkon_age = false;
			} else {
				self.row_kekkon_age = true;
				var age = LPdate.calcAge(mSave.st_birthday_hon);
				var l = ["予定なし"];
				if (age === 0) {
					self.spn_kekkon_age = l;
					self.spn_kekkon_age_v = self.spn_kekkon_age[0];
				} else {
					var list = DB.getNumberList(age, 0, 2, "", "歳");
					if (mSave.age_kekkon !== 0 && mSave.age_kekkon < age) {
						mSave.age_kekkon = age;
					}
					if (mSave.age_kekkon > age + 2) {
						mSave.age_kekkon = age + 2;
					}
					var list2 = new Array(list.length + 1);
					list2[0] = l[0];
					var index = 0;
					for (var i = 0; i < list.length; i++) {
						list2[i + 1] = list[i];
						if (age + i === mSave.age_kekkon) {
							index = i + 1;
						}
					}
					self.spn_kekkon_age = list2;
					self.spn_kekkon_age_v = self.spn_kekkon_age[index];
				}

				row++;
			}
			if (mSave.is_kekkon()) {
				self.row_birth_hai = true;
				row++;
			} else {
				self.row_birth_hai = false;
			}
			if (row < 2) {
				self.basic1_dummy2_row = true;
			} else {
				self.basic1_dummy2_row = false;
			}
			if (row < 3) {
				self.basic1_dummy_row = true;
			} else {
				self.basic1_dummy_row = false;
			}

		};

		p.onClickClose = function (v) {
			switch (v) {
				case "popup_cancel":
					LMPS.closeModal();
					break;
				case "popup_change":
					// 配偶者誕生日にスピナー選択値をセット
					var y, m, d;
					y = self.spn_birth_hai_yyyy_v.replace(/年/, '') * 10000;
					m = self.spn_birth_hai_mm_v.replace(/月/, '') * 100;
					d = self.spn_birth_hai_dd_v.replace(/日/, '') * 1;
					mSave.st_birthday_hai = (y + m + d);

					if (self.isValid(mSave, this)) {
						var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase"));
						var key = id_modelcase;
						data[key].id_sex_hon = mSave.id_sex_hon;
						data[key].id_haiumu = mSave.id_haiumu;
						data[key].st_birthday_hon = mSave.st_birthday_hon;
						data[key].age_hon = mSave.age_hon;
						data[key].st_birthday_hai = mSave.st_birthday_hai;
						data[key].age_hai = mSave.age_hai;
						data[key].age_kekkon = mSave.age_kekkon;
						LIFEPLAN.conf.storage.setItem("lp_modelcase", JSON.stringify(data));

						// M_add_start
						var yosan = 0;
						// lp_modelcase_event の結婚イベントを一旦削除
						var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase_event"));
						var sub = [];
						for (var i = 0; i < data.length; i++) {
							if (data[i].id_event == 1) {
								yosan = data[i].sm_yosan;
								continue;
							}
							sub.push(data[i]);
						}
						LIFEPLAN.conf.storage.setItem("lp_modelcase_event", JSON.stringify(sub));

						// 配偶者無し、結婚予定ありの場合にユーザ登録イベントを積む
						if (0 == mSave.id_haiumu && 0 != mSave.age_kekkon) {
							var newData = {};
							newData.id_event = 1;
							newData.id_line = 1;
							newData.id_modelcase = id_modelcase;
							newData.no_age = mSave.age_kekkon;
							newData.sm_yosan = yosan;

							var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase_event"));
							data.push(newData);
							LIFEPLAN.conf.storage.setItem("lp_modelcase_event", JSON.stringify(data));
						}
						// M_add_end

						init();
						setup();
						// 20160517_Web版lifeplan対応_結合-025_start
						var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase"));
						var key = id_modelcase;
						data[key] = DB.Lp_modelcase;
						LIFEPLAN.conf.storage.setItem("lp_modelcase", JSON.stringify(data));
						MC.copy(DB.Lp_modelcase);
						// 20160517_Web版lifeplan対応_結合-025_end
						LMPS.closeModal();
					}
					break;
			}
		};

		p.onClick = function (param) {
			switch (param) {
				case "btn_sex_1":
					mSave.id_sex_hon = 1;
					self.update();
					break;
				case "btn_sex_2":
					mSave.id_sex_hon = 2;
					self.update();
					break;
				case "btn_haiumu_1":
					mSave.id_haiumu = 1;
					self.update();
					break;
				case "btn_haiumu_2":
					mSave.id_haiumu = 0;
					self.update();
					break;
			}
		};

		p.onSelect = function (target, event) {
			var y, m, d;
			var spn;
			var isupdate = false;
			var id = target;
			var index;
			var v;

			// スピナーの表示規定値に変更された値をセット
			switch (id) {
				case "spn_birth_hon_yyyy":
					self.spn_birth_hon_yyyy_v = event.target.value;
					break;
				case "spn_birth_hon_mm":
					self.spn_birth_hon_mm_v = event.target.value;
					break;
				case "spn_birth_hon_dd":
					self.spn_birth_hon_dd_v = event.target.value;
					break;
				case "spn_birth_hai_yyyy":
					self.spn_birth_hai_yyyy_v = event.target.value;
					break;
				case "spn_birth_hai_mm":
					self.spn_birth_hai_mm_v = event.target.value;
					break;
				case "spn_birth_hai_dd":
					self.spn_birth_hai_dd_v = event.target.value;
					break;
				case "spn_kekkon_age":
					self.spn_kekkon_age_v = event.target.value;
					break;
			}

			if (id === "spn_birth_hon_yyyy" ||
							id === "spn_birth_hon_mm" ||
							id === "spn_birth_hon_dd") {

				spn = self.spn_birth_hon_yyyy;
				v = self.spn_birth_hon_yyyy_v;
				index = spn.indexOf(v);
				y = index + y_start;
				mSave.st_birthday_hon = Module.setYear(y, mSave.st_birthday_hon);

				spn = self.spn_birth_hon_mm;
				v = self.spn_birth_hon_mm_v;
				index = spn.indexOf(v);
				m = 1 + index;
				mSave.st_birthday_hon = Module.setMon(m, mSave.st_birthday_hon);

				spn = self.spn_birth_hon_dd;
				v = self.spn_birth_hon_dd_v;
				index = spn.indexOf(v);
				d = 1 + index;

				var max = Util.calcDaysOfMonth(y, m);
				if (dayMax_hon !== max) {
					dayMax_hon = max;
					if (d > dayMax_hon) {
						d = dayMax_hon;
					}
					var dd = DB.getNumberList(0, 1, dayMax_hon, "", "日");
					self.spn_birth_hon_dd = dd;
					self.spn_birth_hon_dd_v = self.spn_birth_hon_dd[d - 1];
				}
				mSave.st_birthday_hon = Module.setDay(d, mSave.st_birthday_hon);
				mSave.age_hon = LPdate.calcAge(mSave.st_birthday_hon);
				isupdate = true;

			} else if (id === "spn_birth_hai_yyyy" ||
							id === "spn_birth_hai_mm" ||
							id === "spn_birth_hai_dd") {
				spn = self.spn_birth_hai_yyyy;
				v = self.spn_birth_hai_yyyy_v;
				index = spn.indexOf(v);
				y = index + y_start;
				mSave.st_birthday_hai = Module.setYear(y, mSave.st_birthday_hai);

				spn = self.spn_birth_hai_mm;
				v = self.spn_birth_hai_mm_v;
				index = spn.indexOf(v);
				m = 1 + index;
				mSave.st_birthday_hai = Module.setMon(m, mSave.st_birthday_hai);

				spn = self.spn_birth_hai_dd;
				v = self.spn_birth_hai_dd_v;
				index = spn.indexOf(v);
				d = 1 + index;

				var max = Util.calcDaysOfMonth(y, m);
				if (dayMax_hai !== max) {
					dayMax_hai = max;
					if (d > dayMax_hai) {
						d = dayMax_hai;
					}
					var dd = DB.getNumberList(0, 1, dayMax_hai, "", "日");
					self.spn_birth_hai_dd = dd;
					self.spn_birth_hai_dd_v = self.spn_birth_hai_dd[d - 1];
				}
				mSave.st_birthday_hai = Module.setDay(d, mSave.st_birthday_hai);
				mSave.age_hai = LPdate.calcAge(mSave.st_birthday_hai);

			} else if (id === "spn_kekkon_age") {
				spn = self.spn_kekkon_age;
				v = self.spn_kekkon_age_v;
				index = spn.indexOf(v);

				if (index !== 0) {
					y = LPdate.calcAge(mSave.st_birthday_hon);
					index += y - 1;
				}
				mSave.age_kekkon = index;
				isupdate = true;
			}
			if (isupdate) {
				self.update();
			}
		};

		p.isValid = function (_mc, context) {
			var birth_hon = _mc.st_birthday_hon;
			var birth_hai = _mc.st_birthday_hai;

			var y_start = LPdate.getCurYear(birth_hon) - 65;
			var y_end = LPdate.getCurYear(birth_hon) - 20;

			// 受入No.15 性別が未選択の場合
			if (_mc.id_sex_hon === 0) {
				alert("性別を入力してください。");
				return false;
			}
			// 受入No.16 生年月日が未選択の場合
			if (LPdate.getYear(birth_hon) < y_start || LPdate.getYear(birth_hon) > y_end) {
				alert("生年月日を入力してください。");
				return false;
			}
			/*****2014/01/20 本人・配偶者の年齢チェック追加 start ******/
			var _Age = LPdate.calcAge(birth_hon);
			if (_Age < 20) {
				alert("20歳よりご利用できます。");
				return false;
			}
			/*****2014/01/20 本人・配偶者の年齢チェック追加 end   ******/
			// 受入No.17 配偶者が未選択の場合
			if (_mc.id_haiumu !== 1 && _mc.id_haiumu !== 0) {
				alert("配偶者を入力してください。");
				return false;
			}
			// 受入No.18,19 生年月日（配偶者）が未選択の場合
			if (_mc.is_kekkon()) {
				if (LPdate.getYear(birth_hai) < y_start || LPdate.getYear(birth_hai) > y_end) {
					alert("生年月日（配偶者）を入力してください。");
					return false;
				}
				/*****2014/01/20 本人・配偶者の年齢チェック追加 start ******/
				_Age = LPdate.calcAge(birth_hai);
				if (_Age < 20) {
					alert("20歳よりご利用できます。");
					return false;
				}
				/*****2014/01/20 本人・配偶者の年齢チェック追加 end   ******/
			}
			return true;
		};

		return S1;
	})();

	Scenes.S2 = (function () {
		var self;
		var mIsHai;
		var mSave;

		var y_start;
		var y_end;

		var y_tai_start;
		var y_tai_end;

		var S2 = function () {
			self = this;
		};

		var p = S2.prototype;

		p.onCreate = function () {

			mSave = DB.Lp_modelcase;
			// 20160517_Web版lifeplan対応_結合-025_start
			//mSave.copy(MC);
			// 20160517_Web版lifeplan対応_結合-025_end

			if (mTab1Hon === 0) {
				mIsHai = false;
			} else {
				mIsHai = true;
			}

			self.spn_syokugyo = DB.get_syokugyo_list();
			self.spn_syokugyo_v = self.spn_syokugyo[mSave.get_id_syokugyo(mIsHai)];

			var birth = mSave.get_st_birthday(mIsHai);
			y_start = LPdate.getYear(birth) + 15;
			y_end = LPdate.getCurYear(birth);

			var syugyo = mSave.get_ym_syugyo(mIsHai);
			var y, m;
			y = LPdate.getYear(syugyo);
			if (y < y_start) {
				y = y_start;
			} else if (y > y_end) {
				y = y_end;
			}
			m = LPdate.getMon(syugyo);
			if (m === 0) {
				m = 4;
			}
			if (mIsHai) {
				mSave.ym_syugyo_hai = Module.setYear(y, mSave.get_ym_syugyo(mIsHai));
				mSave.ym_syugyo_hai = Module.setMon(m, mSave.get_ym_syugyo(mIsHai));
			} else {
				mSave.ym_syugyo_hon = Module.setYear(y, mSave.get_ym_syugyo(mIsHai));
				mSave.ym_syugyo_hon = Module.setMon(m, mSave.get_ym_syugyo(mIsHai));
			}

			var age_syugyo = LPdate.calcAge(mSave.get_st_birthday(mIsHai), mSave.get_ym_syugyo(mIsHai));
			mSave.set_age_syugyo(age_syugyo, mIsHai);

			var yyyy = DB.getNumberList(0, y_start, y_end, "", "年");
			self.spn_syugyo_yyyy = yyyy;
			self.spn_syugyo_yyyy_v = self.spn_syugyo_yyyy[y - y_start];
			var mm = DB.getNumberList(0, 1, 12, "", "月");
			self.spn_syugyo_mm = mm;
			self.spn_syugyo_mm_v = self.spn_syugyo_mm[m - 1];
			self.update_taisyoku();

			if (mIsHai) {
				self.popup_basic2_title = ("基本情報／配偶者様の職業");
			} else {
				self.popup_basic2_title = ("基本情報／ご本人様の職業");
			}
			// 退職年齢初期値設定
			y_tai_start = mSave.get_age_syugyo(mIsHai);
			if (y_tai_start < 20) {
				y_tai_start = 20;
			}
			y_tai_end = mSave.get_age(mIsHai);

			var age = Module.listAddUnselected(DB.getNumberList(0, y_tai_start, y_tai_end, "", "歳"));
			var taisyoku_index = mSave.get_age_taisyoku(mIsHai);
			if (taisyoku_index > y_tai_end) {
				taisyoku_index = y_tai_end;
			}
			if (taisyoku_index >= y_tai_start) {
				taisyoku_index = taisyoku_index - y_tai_start + 1;
			} else {
				taisyoku_index = 0;
			}
			self.spn_taisyoku_age = age;
			self.spn_taisyoku_age_v = self.spn_taisyoku_age[taisyoku_index];
			// 20160517_Web版lifeplan対応_結合-026_start
			if ((mSave.get_id_syokugyo(mIsHai) === DB.G_syokugyo.TAI_KAISYAIN) || (mSave.get_id_syokugyo(mIsHai) === DB.G_syokugyo.TAI_KOMUIN)) {
			// 20160517_Web版lifeplan対応_結合-026_end
				if (taisyoku_index > 0) {
					mSave.set_age_taisyoku(taisyoku_index - 1 + y_tai_start, mIsHai);
				}
			// 20160517_Web版lifeplan対応_結合-026_start
				S0.edit_txt_taisyoku = String(mSave.get_age_taisyoku(mIsHai)) + "歳";
			}
			// 20160517_Web版lifeplan対応_結合-026_end

			self.update();
		};

		p.update = function () {
			var id_syokugyo = mSave.get_id_syokugyo(mIsHai);

			// 2021/04/12 自営業も就業年月を入力可能に変更
			if (id_syokugyo === DB.G_syokugyo.KAISYAIN || id_syokugyo === DB.G_syokugyo.YAKUIN || id_syokugyo === DB.G_syokugyo.KOMUIN || id_syokugyo === DB.G_syokugyo.JIEIGYO) {
				self.popup_basic2_syugyo_row = true;
				self.popup_basic2_taisyoku_row = false;
			} else if (id_syokugyo === DB.G_syokugyo.TAI_KAISYAIN || id_syokugyo === DB.G_syokugyo.TAI_KOMUIN) {
				self.popup_basic2_syugyo_row = true;
				self.popup_basic2_taisyoku_row = true;
			} else {
				self.popup_basic2_syugyo_row = false;
				self.popup_basic2_taisyoku_row = false;
			}

		};

		p.update_taisyoku = function() {
			var id_syokugyo = mSave.get_id_syokugyo(mIsHai);

			if (id_syokugyo !== DB.G_syokugyo.TAI_KAISYAIN && id_syokugyo !== DB.G_syokugyo.TAI_KOMUIN) {
				/****2014/01/20 退職会社員・公務員の場合の基本生活費未計上の修正 start**/
				if (mIsHai) {
					mSave.set_age_taisyoku(MC.age_taisyoku_hai, mIsHai);
				} else {
					mSave.set_age_taisyoku(MC.age_taisyoku_hon, mIsHai);
				}
				/****2014/01/20 退職会社員・公務員の場合の基本生活費未計上の修正 end**/
				return;
			}

			y_tai_start = mSave.get_age_syugyo(mIsHai);
			//add begin
			if (y_tai_start < 20) {
				y_tai_start = 20;
			}
			//add end
			y_tai_end = mSave.get_age(mIsHai);

			var age = Module.listAddUnselected(DB.getNumberList(0, y_tai_start, y_tai_end, "", "歳"));
			var taisyoku_index = mSave.get_age_taisyoku(mIsHai);
			if (taisyoku_index > y_tai_end) {
				taisyoku_index = y_tai_end;
			}
			if (taisyoku_index >= y_tai_start) {
				taisyoku_index = taisyoku_index - y_tai_start + 1;
			} else {
				taisyoku_index = 0;
			}
			self.spn_taisyoku_age = age;
			self.spn_taisyoku_age_v = self.spn_taisyoku_age[taisyoku_index];
			if (taisyoku_index > 0) {
				mSave.set_age_taisyoku(taisyoku_index - 1 + y_tai_start, mIsHai);
			}
		};

		p.onSelect = function(target, event) {
			var id = target;
			var index = event.target.selectedIndex;

			// スピナーの表示規定値に変更された値をセット
			switch (id) {
				case "spn_syokugyo":
					self.spn_syokugyo_v = event.target.value;
					break;
				case "spn_syugyo_yyyy":
					self.spn_syugyo_yyyy_v = event.target.value;
					break;
				case "spn_syugyo_mm":
					self.spn_syugyo_mm_v = event.target.value;
					break;
				case "spn_taisyoku_age":
					self.spn_taisyoku_age_v = event.target.value;
					break;
			}

			if (id === "spn_syokugyo") {
				mSave.set_id_syokugyo(index, mIsHai);
				self.update_taisyoku();
			} else if (id === "spn_syugyo_yyyy") {
				mSave.set_ym_syugyo(Module.setYear(index + y_start, mSave.get_ym_syugyo(mIsHai)), mIsHai);
				var age_syugyo = LPdate.calcAge(mSave.get_st_birthday(mIsHai), mSave.get_ym_syugyo(mIsHai));
				if (mSave.get_age_syugyo(mIsHai) !== age_syugyo) {
					mSave.set_age_syugyo(age_syugyo, mIsHai);
					self.update_taisyoku();
				}
			} else if (id === "spn_syugyo_mm") {
				mSave.set_ym_syugyo(Module.setMon(index + 1, mSave.get_ym_syugyo(mIsHai)), mIsHai);
				var age_syugyo = LPdate.calcAge(mSave.get_st_birthday(mIsHai), mSave.get_ym_syugyo(mIsHai));
				if (mSave.get_age_syugyo(mIsHai) !== age_syugyo) {
					mSave.set_age_syugyo(age_syugyo, mIsHai);
					self.update_taisyoku();
				}
			} else if (id === "spn_taisyoku_age") {
				if (index === 0) {
					mSave.set_age_taisyoku(index, mIsHai);
				} else {
					mSave.set_age_taisyoku(index + y_tai_start - 1, mIsHai);
				}
			} else {
				return;
			}

			self.update();
		};

		p.onClickClose = function (v) {
			switch (v) {
				case "popup_cancel":
					LMPS.closeModal();
					break;
				case "popup_change":
					if (self.isValid(mSave, this, mIsHai)) {
						if (mIsHai) {
							mSave.age_syugyo_hai = LPdate.calcAge(mSave.st_birthday_hai, mSave.ym_syugyo_hai);
						} else {
							mSave.age_syugyo_hon = LPdate.calcAge(mSave.st_birthday_hon, mSave.ym_syugyo_hon);
						}
						var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase"));
						var key = id_modelcase;
						data[key].id_syokugyo_hon = mSave.id_syokugyo_hon;
						data[key].id_syokugyo_hai = mSave.id_syokugyo_hai;
						data[key].ym_syugyo_hon = mSave.ym_syugyo_hon;
						data[key].ym_syugyo_hai = mSave.ym_syugyo_hai;
						data[key].age_syugyo_hon = mSave.age_syugyo_hon;
						data[key].age_syugyo_hai = mSave.age_syugyo_hai;
						data[key].age_taisyoku_hon = mSave.age_taisyoku_hon;
						data[key].age_taisyoku_hai = mSave.age_taisyoku_hai;

						LIFEPLAN.conf.storage.setItem("lp_modelcase", JSON.stringify(data));
						init();
						if (mIsHai) {
							setup(true);
						} else {
							setup();
						}

						LMPS.closeModal();
					}
					break;
			}
		};

		p.isValid = function (_mc, context, is_hai) {
			var birth;
			if (is_hai) {
				birth = _mc.st_birthday_hai;
			} else {
				birth = _mc.st_birthday_hon;
			}
			var ym_syugyo = _mc.get_ym_syugyo(is_hai);
			var y_start = LPdate.getYear(birth) + 15;
			var y_end = LPdate.getCurYear(birth);

			var taisyoku = _mc.get_age_taisyoku(is_hai);
			var y_tai_start = _mc.get_age_syugyo(is_hai);
			var y_tai_end = _mc.get_age(is_hai);

			var id_syokugyo = _mc.get_id_syokugyo(is_hai);

			if (id_syokugyo === DB.G_syokugyo.KAISYAIN ||
							id_syokugyo === DB.G_syokugyo.YAKUIN ||
							id_syokugyo === DB.G_syokugyo.KOMUIN) {
				y_tai_start = _mc.get_age(is_hai);
				y_tai_end = 65;
			}

			// 受入No.20,21 職業が未設定の場合

			// 配偶者なしの場合は配偶者側のチェックをしない

			if (_mc.is_kekkon() || !is_hai) {
				if (id_syokugyo === 0) {
					alert("職業を入力してください。");
					return false;
				} else if (id_syokugyo === DB.G_syokugyo.KAISYAIN ||
								id_syokugyo === DB.G_syokugyo.YAKUIN ||
								id_syokugyo === DB.G_syokugyo.KOMUIN ||
								id_syokugyo === DB.G_syokugyo.TAI_KAISYAIN ||
								id_syokugyo === DB.G_syokugyo.TAI_KOMUIN) {
					if (y_start > LPdate.getYear(ym_syugyo) || y_end < LPdate.getYear(ym_syugyo)) {
						alert("就業年を入力してください。");
						return false;
					} else if (1 > LPdate.getMon(ym_syugyo) || 12 < LPdate.getMon(ym_syugyo)) {
						alert("就業月を入力してください。");
						return false;
					}
				}
				if (id_syokugyo === DB.G_syokugyo.TAI_KAISYAIN || id_syokugyo === DB.G_syokugyo.TAI_KOMUIN) {
					if (y_tai_start > taisyoku || y_tai_end < taisyoku) {
						alert("退職年齢を入力してください。");
						return false;
					}
				}
			}
			return true;
		};

		return S2;
	})();

	Scenes.S3 = (function () {
		var self;
		var mSave;

		var S3 = function () {
			self = this;
		};

		var p = S3.prototype;

		p.onCreate = function () {
			mSave = DB.Lp_modelcase;
			// 20160517_Web版lifeplan対応_結合-025_start
			//mSave.copy(MC);
			// 20160517_Web版lifeplan対応_結合-025_end

			var index = 0;

			var list = DB.getNumberList(0, 20, 65, "", "歳");
			index = 0;
			if (mSave.age_jyutaku !== 0) {
				index = mSave.age_jyutaku - 20;
			}
			self.basic3_spn_age_jyutaku = list;
			self.basic3_spn_age_jyutaku_v = self.basic3_spn_age_jyutaku[index];
			var sm = mSave.sm_kariire;
			self.basic3_txt_kariire = String(sm);
			list = DB.getNumberList(0, 1, 35, "", "年");
			index = 0;
			if (mSave.no_hensai !== 0) {
				index = mSave.no_hensai - 1;
			} else {
				index = 34;
				// 2021/02/22 設定編集画面（基本情報／住まいモーダル）の返済期間セレクトだけ初期値35年が表示されているが、
				//            計算用変数には0が設定されている。35になるように修正。
				mSave.no_hensai = index + 1;
			}
			self.basic3_spn_hensai = list;
			self.basic3_spn_hensai_v = self.basic3_spn_hensai[index];

			self.update();
		};

		p.update = function () {
			self.basic3_txt_kariirekinri = Number(mSave.ra_kariirekinri1 * 100).toFixed(2);
			self.m_basic3_txt_rent = Module.commafy(Number(mSave.sm_rent));
			self.basic3_txt_kariire = Module.commafy(Number(mSave.sm_kariire));

			//賃貸
			if (mSave.id_lives === 0) {
				self.basic3_row_lives_yotei = true;
				self.basic3_row_sm_rent = true;

				self.basic3_row_age_jyutaku = false;
				//自宅

			} else {
				self.basic3_row_lives_yotei = false;
				self.basic3_row_sm_rent = false;

				self.basic3_row_age_jyutaku = true;

				//ローン利用なし

				if (mSave.id_jyutakuloan === 0) {
					self.basic3_check_jyutakuloan_1 = "";
					self.basic3_check_jyutakuloan_2 = "ローン残なし";
				} else {
					self.basic3_check_jyutakuloan_1 = "ローン残あり";
					self.basic3_check_jyutakuloan_2 = "";
				}
			}
			//自宅＆ローンあり
			if (mSave.id_lives === 1 && mSave.id_jyutakuloan === 1) {
				self.basic3_row_sm_kariire = true;
			} else {
				self.basic3_row_sm_kariire = false;
			}
			if (mSave.id_lives === 0) {
				self.basic3_btn_lives_1 = "賃貸";
				self.basic3_btn_lives_2 = "";
			} else {
				self.basic3_btn_lives_1 = "";
				self.basic3_btn_lives_2 = "自宅";
			}
			if (mSave.id_lives_yotei === 1) {
				self.basic3_btn_lives_yotei_1 = "購入計画あり";
				self.basic3_btn_lives_yotei_2 = "";
			} else {
				self.basic3_btn_lives_yotei_1 = "";
				self.basic3_btn_lives_yotei_2 = "購入計画なし";
			}

		};

		p.onClick = function (param) {
			switch (param) {
				case "basic3_btn_lives_1":
					mSave.id_lives = 0;
					self.update();
					break;
				case "basic3_btn_lives_2":
					mSave.id_lives = 1;
					// 2021/02/22 設定編集画面（基本情報／住まいモーダル）の購入年齢セレクトだけ初期値20歳年が表示されているが、
					//            計算用変数には0が設定されている。20になるように修正。
					if(mSave.age_jyutaku === 0){
						mSave.age_jyutaku = 20;
					}
					self.update();
					break;
				case "basic3_btn_lives_yotei_1":
					mSave.id_lives_yotei = 1;
					self.update();
					break;
				case "basic3_btn_lives_yotei_2":
					mSave.id_lives_yotei = 0;
					mSave.age_jyutaku = 0;
					self.update();
					break;
				case "basic3_check_jyutakuloan_1":
					mSave.id_jyutakuloan = 1;
					self.update();
					break;
				case "basic3_check_jyutakuloan_2":
					mSave.id_jyutakuloan = 0;
					self.update();
					break;
			}
		};

		p.onSelect = function (id, event) {
			var index = event.target.selectedIndex;

			// スピナーの表示規定値に変更された値をセット
			switch (id) {
				case "basic3_spn_age_jyutaku":
					self.basic3_spn_age_jyutaku_v = event.target.value;
					break;
				case "basic3_spn_hensai":
					self.basic3_spn_hensai_v = event.target.value;
					break;
			}

			if (id === "basic3_spn_age_jyutaku") {
				mSave.age_jyutaku = index + 20;
			} else if (id === "basic3_spn_hensai") {
				mSave.no_hensai = index + 1;
			}
		};

		p.onCalcFinish = function (v) {
			var value;
			switch (v) {
				case "m_basic3_txt_rent":
					value = Module.toFilteredNum(viewModel.m_basic3_txt_rent());
					value = (value > 999000) ? 999000 : value;
					mSave.sm_rent = value;
					self.update();
					break;
				case "basic3_txt_kariire":
					value = Module.toFilteredNum(viewModel.basic3_txt_kariire());
					value = (value > 999990000) ? 999990000 : value;
					mSave.sm_kariire = value;
					self.update();
					break;
				case "basic3_txt_kariirekinri":
					value = Module.toFilteredNum(viewModel.basic3_txt_kariirekinri()) / 100;
					value = (value > 0.9875) ? 0.9875 : value;
					mSave.ra_kariirekinri1 = value;
					self.update();
					break;
			}
		};

		p.isValid = function (_mc, context) {
			//賃貸
			if (_mc.id_lives === 0) {
				// 受入No.22 家賃が未入力の場合

				if (_mc.sm_rent <= 0 || _mc.sm_rent > 999000) {
					alert("家賃を入力してください。");
					return false;
				}
			}
			//自宅＆ローンあり
			if (_mc.id_lives === 1 && _mc.id_jyutakuloan === 1) {
				// 受入No.23 借入金額が 0 or 空白の場合

				if (1 > _mc.sm_kariire || 999990000 < _mc.sm_kariire) {
					alert("借入金額を入力してください。");
					return false;
				}
				if (0.0005 > _mc.ra_kariirekinri1 || 0.9875 < _mc.ra_kariirekinri1) {
					alert("借入金利を入力してください。");
					return false;
				}
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
						data[key].ra_kariirekinri1 = mSave.ra_kariirekinri1;
						data[key].sm_rent = mSave.sm_rent;
						data[key].sm_kariire = mSave.sm_kariire;
						data[key].id_lives = mSave.id_lives;
						data[key].id_lives_yotei = mSave.id_lives_yotei;
						data[key].age_jyutaku = mSave.age_jyutaku;
						data[key].id_jyutakuloan = mSave.id_jyutakuloan;
						data[key].no_hensai = mSave.no_hensai;

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

		return S3;
	})();

	Scenes.S4 = (function () {
		var self;
		var seekBar;
		var mSave;

		var S4 = function () {
			self = this;
		};

		var p = S4.prototype;

		p.onCreate = function () {
			mSave = DB.Lp_modelcase;
			// 20160517_Web版lifeplan対応_結合-025_start
			//mSave.copy(MC);
			// 20160517_Web版lifeplan対応_結合-025_end

			var index1, index2;

			var age = mSave.age_hon;
			var list = DB.getNumberList(0, age - 1, 99, "", "歳");
			index1 = mSave.mon_saving1_from;
			if (index1 < age - 1) {
				index1 = age - 1;
			}
			if (index1 > 99) {
				index1 = 99;
			}
			index1 -= age - 1;
			list[0] = Wording.MISENTAKU;
			self.basic4_spn_saving1_from = list;
			self.basic4_spn_saving1_from_v = self.basic4_spn_saving1_from[index1];

			index2 = mSave.mon_saving2_from;
			if (index2 < age - 1) {
				index2 = age - 1;
			}
			if (index2 > 99) {
				index2 = 99;
			}
			index2 -= age - 1;
			list[0] = Wording.MISENTAKU;
			self.basic4_spn_saving2_from = list;
			self.basic4_spn_saving2_from_v = self.basic4_spn_saving2_from[index2];

			self.basic4_edit_sm_assets = String(mSave.sm_assets);

			if (index1 === 0) {
				mSave.sm_saving1 = 0;
			}
			if (index2 === 0) {
				mSave.sm_saving2 = 0;
			}

			self.update();
		};

		p.update = function () {
			self.basic4_edit_sm_assets = Module.commafy(mSave.sm_assets);
			self.basic4_edit_saving1 = Module.commafy(mSave.sm_saving1);
			self.basic4_edit_saving2 = Module.commafy(mSave.sm_saving2);

			var from1 = mSave.mon_saving1_from;
			var from2 = mSave.mon_saving2_from;
			var list;

			var index = mSave.mon_saving1_to;
			if (from1 === 0) {
				list = [];
				index = 0;
			} else {
				list = DB.getNumberList(0, from1 - 1, 99, "", "歳");
			}
			if (index > 0) {
				index = index - from1 + 1;
			}
			if (index < 0) {
				index = 0;
			}
			list[0] = Wording.MISENTAKU;
			self.basic4_spn_saving1_to = list;
			self.basic4_spn_saving1_to_v = self.basic4_spn_saving1_to[index];

			index = mSave.mon_saving2_to;
			if (from2 === 0) {
				list = [];
				index = 0;
			} else {
				list = DB.getNumberList(0, from2 - 1, 99, "", "歳");
			}
			if (index > 0) {
				index = index - from2 + 1;
			}
			if (index < 0) {
				index = 0;
			}
			list[0] = Wording.MISENTAKU;
			self.basic4_spn_saving2_to = list;
			self.basic4_spn_saving2_to_v = self.basic4_spn_saving2_to[index];

		};

		p.isValid = function (_mc, context) {
			var age = _mc.age_hon;
			var from1 = _mc.mon_saving1_from;
			var from2 = _mc.mon_saving2_from;
			var money1 = _mc.sm_saving1;
			var money2 = _mc.sm_saving2;
			var to1 = _mc.mon_saving1_to;
			var to2 = _mc.mon_saving2_to;

			//           金融資産残高が 0 or 空白の場合

			if (_mc.sm_assets < 0 || _mc.sm_assets > 999990000) {
				alert("金融資産残高は0～999990000の数値を入力してください");
				return false;
			}
			// 受入No.24 積立額１が ０ or 空白以外かつ　積立期間１From or 積立期間１Toが未選択の場合

			if (money1 > 0 && money1 <= 999000) {
				if (from1 < age || from1 > 99 || to1 < age || to1 > 99) {
					alert("毎月の貯蓄・積立額１を見直してください。");
					return false;
				}
			}
			// 受入No.27 積立額２が ０ or 空白以外かつ　積立期間２From or 積立期間２Toが未選択の場合

			if (money2 > 0 && money2 <= 999000) {
				if (from2 < age || from2 > 99 || to2 < age || to2 > 99) {
					alert("毎月の貯蓄・積立額２を見直してください。");
					return false;
				}
			}
			// 受入No.26 積立期間1To ＜ 積立期間1Fromの場合

			if (to1 < from1) {
				alert("毎月の貯蓄・積立額１を見直してください。");
				return false;
			}
			// 受入No.29 積立期間2To ＜ 積立期間2Fromの場合

			if (to2 < from2) {
				alert("毎月の貯蓄・積立額２を見直してください。");
				return false;
			}
			// 受入No.25 積立額１が ０ or 空白かつ　積立期間１From or 積立期間１Toが入力ありの場合

			if (money1 < 1 || money1 > 999000) {
				if (from1 > age - 1 || to1 > age - 1) {
					alert("毎月の貯蓄・積立額１を見直してください。");
					return false;
				}
			}
			// 受入No.28 積立額２が ０ or 空白かつ　積立期間２From or 積立期間２Toが入力ありの場合

			if (money2 < 1 || money2 > 999000) {
				if (from2 > age - 1 || to2 > age - 1) {
					alert("毎月の貯蓄・積立額２を見直してください。");
					return false;
				}
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
						data[key].sm_assets = mSave.sm_assets;
						data[key].sm_saving1 = mSave.sm_saving1;
						data[key].sm_saving2 = mSave.sm_saving2;
						data[key].mon_saving1_from = mSave.mon_saving1_from;
						data[key].mon_saving1_to = mSave.mon_saving1_to;
						data[key].mon_saving2_from = mSave.mon_saving2_from;
						data[key].mon_saving2_to = mSave.mon_saving2_to;
						LIFEPLAN.conf.storage.setItem("lp_modelcase", JSON.stringify(data));

						init();
						setup();
						LMPS.closeModal();
					}
					break;
			}

		};

		p.onCalcFinish = function (v) {
			var value;
			switch (v) {
				case "basic4_edit_sm_assets":
					value = Module.toFilteredNum(viewModel.basic4_edit_sm_assets());
					value = (value > 999990000) ? 999990000 : value;
					mSave.sm_assets = value;
					self.update();
					break;
				case "basic4_edit_saving1":
					value = Module.toFilteredNum(viewModel.basic4_edit_saving1());
					value = (value > 999000) ? 999000 : value;
					mSave.sm_saving1 = value;
					self.update();
					break;
				case "basic4_edit_saving2":
					value = Module.toFilteredNum(viewModel.basic4_edit_saving2());
					value = (value > 999000) ? 999000 : value;
					mSave.sm_saving2 = value;
					self.update();
					break;
			}
		};

		p.onSelect = function (id, event) {
			var index = event.target.selectedIndex;

			// スピナーの表示規定値に変更された値をセット
			switch (id) {
				case "basic4_spn_saving1_from":
					self.basic4_spn_saving1_from_v = event.target.value;
					break;
				case "basic4_spn_saving1_to":
					self.basic4_spn_saving1_to_v = event.target.value;
					break;
				case "basic4_spn_saving2_from":
					self.basic4_spn_saving2_from_v = event.target.value;
					break;
				case "basic4_spn_saving2_to":
					self.basic4_spn_saving2_to_v = event.target.value;
					break;
			}

			if (id === "basic4_spn_saving1_from") {
				if (index > 0) {
					index += mSave.age_hon - 1;
				}
				mSave.mon_saving1_from = index;
				self.update();
			} else if (id === "basic4_spn_saving1_to") {
				if (index > 0) {
					index += mSave.mon_saving1_from - 1;
				}
				mSave.mon_saving1_to = index;
			} else if (id === "basic4_spn_saving2_from") {
				if (index > 0) {
					index += mSave.age_hon - 1;
				}
				mSave.mon_saving2_from = index;
				self.update();
			} else if (id === "basic4_spn_saving2_to") {
				if (index > 0) {
					index += mSave.mon_saving2_from - 1;
				}
				mSave.mon_saving2_to = index;
			}
		};

		return S4;
	})();

	Scenes.S5 = (function () {
		var self;
		var seekBar;
		var mSave;

		var S5 = function () {
			self = this;
		};

		var p = S5.prototype;

		p.onCreate = function () {

			mSave = DB.Lp_modelcase;
			// 20160517_Web版lifeplan対応_結合-025_start
			//mSave.copy(MC);
			// 20160517_Web版lifeplan対応_結合-025_end

			self.base_edit_income1 = Module.commafy(Math.round(Logic05.Calc20_Seikatsu));
			self.base_edit_income2 = Module.commafy(Math.round(Logic05.Calc21_TaiSeikatsu));

			var Age = MC.get_age(false);
			if (Age >= 60) {
				self.row1 = false;
				self.row2 = true;
			} else {
				self.row1 = true;
				self.row2 = true;
			}

			self.update();
		};

		p.update = function () {
			if (mSave.save_kihon_gen >= 0) {
				self.base_edit_income1 = Module.commafy(mSave.save_kihon_gen);
			}
			if (mSave.save_kihon_tai >= 0) {
				self.base_edit_income2 = Module.commafy(mSave.save_kihon_tai);
			}

		};

		p.onClickClose = function (v) {
			switch (v) {
				case "popup_cancel":
					LMPS.closeModal();
					break;
				case "popup_change":
					var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase"));
					var key = id_modelcase;
					data[key].save_kihon_gen = mSave.save_kihon_gen;
					data[key].save_kihon_tai = mSave.save_kihon_tai;
					LIFEPLAN.conf.storage.setItem("lp_modelcase", JSON.stringify(data));

					init();
					setup();
					LMPS.closeModal();
					break;
			}
		};

		p.onCalcFinish = function (v) {
			var value;
			switch (v) {
				case "base_edit_income1":
					value = Module.toFilteredNum(viewModel.base_edit_income1());

					// 入力制限
					if (value > 999000){
						value = 999000;
					}

					mSave.save_kihon_gen = value;
					self.update();
					break;
				case "base_edit_income2":
					value = Module.toFilteredNum(viewModel.base_edit_income2());

					// 入力制限
					if (value > 999000){
						value = 999000;
					}

					mSave.save_kihon_tai = value;
					self.update();
					break;
			}
		};

		return S5;
	})();

	var S0 = new Scenes.S0();
	var S1 = new Scenes.S1();
	var S2 = new Scenes.S2();
	var S3 = new Scenes.S3();
	var S4 = new Scenes.S4();
	var S5 = new Scenes.S5();


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

		// scene-0: S0
		this.edit_txt_sex = ko.observable(S0.edit_txt_sex);
		this.edit_txt_birth = ko.observable(S0.edit_txt_birth);
		this.edit_txt_haiumu = ko.observable(S0.edit_txt_haiumu);
		this.title_txt_birth_hai = ko.observable(S0.title_txt_birth_hai);
		this.edit_txt_birth_hai = ko.observable(S0.edit_txt_birth_hai);
		this.tab_basic2_2 = ko.observable(S0.tab_basic2_2);
		this.edit_txt_syokugyo = ko.observable(S0.edit_txt_syokugyo);
		this.basic2_syugyo_row = ko.observable(S0.basic2_syugyo_row);
		this.edit_txt_syugyo = ko.observable(S0.edit_txt_syugyo);
		this.basic2_taisyoku_row = ko.observable(S0.basic2_taisyoku_row);
		this.edit_txt_taisyoku = ko.observable(S0.edit_txt_taisyoku);
		this.edit_txt_syokugyo = ko.observable(S0.edit_txt_syokugyo);
		this.basic2_syugyo_row = ko.observable(S0.basic2_syugyo_row);
		this.edit_txt_syugyo = ko.observable(S0.edit_txt_syugyo);
		this.basic2_taisyoku_row = ko.observable(S0.basic2_taisyoku_row);
		this.edit_txt_taisyoku = ko.observable(S0.edit_txt_taisyoku);
		this.basic3_txt_lives = ko.observable(S0.basic3_txt_lives);
		this.basic3_lives_yotei_row = ko.observable(S0.basic3_lives_yotei_row);
		this.basic3_txt_lives_yotei = ko.observable(S0.basic3_txt_lives_yotei);
		this.basic3_sm_rent_row = ko.observable(S0.basic3_sm_rent_row);
		this.basic3_txt_rent = ko.observable(S0.basic3_txt_rent);
		this.basic3_age_jyutaku_row = ko.observable(S0.basic3_age_jyutaku_row);
		this.basic3_txt_age_jyutaku = ko.observable(S0.basic3_txt_age_jyutaku);
		this.basic3_sm_kariire_row = ko.observable(S0.basic3_sm_kariire_row);
		this.basic3_txt_sm_kariire = ko.observable(S0.basic3_txt_sm_kariire);
		this.basic4_txt_sm_assets = ko.observable(S0.basic4_txt_sm_assets);
		this.basic4_txt_mon_saving = ko.observable(S0.basic4_txt_mon_saving);
		this.kihonn_seikatu = ko.observable(S0.kihonn_seikatu);
		this.taisyoku_seikatu = ko.observable(S0.taisyoku_seikatu);

		// scene-1: S1
		this.btn_sex_1 = ko.observable(S1.btn_sex_1);
		this.btn_sex_2 = ko.observable(S1.btn_sex_2);
		this.spn_birth_hon_yyyy = ko.observableArray(S1.spn_birth_hon_yyyy);
		this.spn_birth_hon_yyyy_v = ko.observable(S1.spn_birth_hon_yyyy_v);
		this.spn_birth_hon_mm = ko.observableArray(S1.spn_birth_hon_mm);
		this.spn_birth_hon_mm_v = ko.observable(S1.spn_birth_hon_mm_v);
		this.spn_birth_hon_dd = ko.observableArray(S1.spn_birth_hon_dd);
		this.spn_birth_hon_dd_v = ko.observable(S1.spn_birth_hon_dd_v);
		this.btn_haiumu_1 = ko.observable(S1.btn_haiumu_1);
		this.btn_haiumu_2 = ko.observable(S1.btn_haiumu_2);
		this.row_kekkon_age = ko.observable(S1.row_kekkon_age);
		this.spn_kekkon_age = ko.observableArray(S1.spn_kekkon_age);
		this.spn_kekkon_age_v = ko.observable(S1.spn_kekkon_age_v);
		this.row_birth_hai = ko.observable(S1.row_birth_hai);
		this.spn_birth_hai_yyyy = ko.observable(S1.spn_birth_hai_yyyy);
		this.spn_birth_hai_yyyy_v = ko.observable(S1.spn_birth_hai_yyyy_v);
		this.spn_birth_hai_mm = ko.observable(S1.spn_birth_hai_mm);
		this.spn_birth_hai_mm_v = ko.observable(S1.spn_birth_hai_mm_v);
		this.spn_birth_hai_dd = ko.observable(S1.spn_birth_hai_dd);
		this.spn_birth_hai_dd_v = ko.observable(S1.spn_birth_hai_dd_v);

		// scene-2: S2
		this.popup_basic2_title = ko.observable(S2.popup_basic2_title);
		this.popup_basic2_syugyo_row = ko.observable(S2.popup_basic2_syugyo_row);
		this.spn_syokugyo = ko.observableArray(S2.spn_syokugyo);
		this.spn_syokugyo_v = ko.observable(S2.spn_syokugyo_v);
		this.spn_syugyo_yyyy = ko.observableArray(S2.spn_syugyo_yyyy);
		this.spn_syugyo_yyyy_v = ko.observable(S2.spn_syugyo_yyyy_v);
		this.spn_syugyo_mm = ko.observableArray(S2.spn_syugyo_mm);
		this.spn_syugyo_mm_v = ko.observable(S2.spn_syugyo_mm_v);
		this.popup_basic2_taisyoku_row = ko.observable(S2.popup_basic2_taisyoku_row);
		this.spn_taisyoku_age = ko.observableArray(S2.spn_taisyoku_age);
		this.spn_taisyoku_age_v = ko.observable(S2.spn_taisyoku_age_v);

		// scene-3: S3
		this.basic3_btn_lives_1 = ko.observable(S3.basic3_btn_lives_1);
		this.basic3_btn_lives_2 = ko.observable(S3.basic3_btn_lives_2);
		this.basic3_btn_lives_yotei_1 = ko.observable(S3.basic3_btn_lives_yotei_1);
		this.basic3_btn_lives_yotei_2 = ko.observable(S3.basic3_btn_lives_yotei_2);
		this.m_basic3_txt_rent = ko.observable(S3.m_basic3_txt_rent);
		this.basic3_row_lives_yotei = ko.observable(S3.basic3_row_lives_yotei);
		this.basic3_row_sm_rent = ko.observable(S3.basic3_row_sm_rent);
		this.basic3_row_age_jyutaku = ko.observable(S3.basic3_row_age_jyutaku);
		this.basic3_spn_age_jyutaku = ko.observableArray(S3.basic3_spn_age_jyutaku);
		this.basic3_spn_age_jyutaku_v = ko.observable(S3.basic3_spn_age_jyutaku_v);
		this.basic3_row_sm_kariire = ko.observable(S3.basic3_row_sm_kariire);
		this.basic3_txt_kariire = ko.observable(S3.basic3_txt_kariire);
		this.basic3_spn_hensai = ko.observableArray(S3.basic3_spn_hensai);
		this.basic3_spn_hensai_v = ko.observable(S3.basic3_spn_hensai_v);
		this.basic3_txt_kariirekinri = ko.observable(S3.basic3_txt_kariirekinri);
		this.basic3_check_jyutakuloan_1 = ko.observable(S3.basic3_check_jyutakuloan_1);
		this.basic3_check_jyutakuloan_2 = ko.observable(S3.basic3_check_jyutakuloan_2);

		// scene-4: S4
		this.basic4_edit_sm_assets = ko.observable(S4.basic4_edit_sm_assets);
		this.basic4_spn_saving1_from = ko.observableArray(S4.basic4_spn_saving1_from);
		this.basic4_spn_saving1_from_v = ko.observable(S4.basic4_spn_saving1_from_v);
		this.basic4_spn_saving1_to = ko.observableArray(S4.basic4_spn_saving1_to);
		this.basic4_spn_saving1_to_v = ko.observable(S4.basic4_spn_saving1_to_v);
		this.basic4_edit_saving1 = ko.observable(S4.basic4_edit_saving1);
		this.basic4_spn_saving2_from = ko.observableArray(S4.basic4_spn_saving2_from);
		this.basic4_spn_saving2_from_v = ko.observable(S4.basic4_spn_saving2_from_v);
		this.basic4_spn_saving2_to = ko.observableArray(S4.basic4_spn_saving2_to);
		this.basic4_spn_saving2_to_v = ko.observable(S4.basic4_spn_saving2_to_v);
		this.basic4_edit_saving2 = ko.observable(S4.basic4_edit_saving2);

		// scene-5: S5
		this.row1 = ko.observable(S5.row1);
		this.row2 = ko.observable(S5.row2);
		this.base_edit_income1 = ko.observable(S5.base_edit_income1);
		this.base_edit_income2 = ko.observable(S5.base_edit_income2);


		this.setData = function () {
			//weapperクラス変更 上部プラン別画像表示
			this.modelClass(m_modelClass);
			this.simulation1(simulation1);
			this.setting_tab1_basic(setting_tab1_basic);
			this.setting_tab2_job(setting_tab2_job);
			this.setting_tab3_house(setting_tab3_house);
			this.setting_tab4_education(setting_tab4_education);
			this.setting_tab5_insurance(setting_tab5_insurance);

			// scene-0: S0
			this.edit_txt_sex(S0.edit_txt_sex);
			this.edit_txt_birth(S0.edit_txt_birth);
			this.edit_txt_haiumu(S0.edit_txt_haiumu);
			this.title_txt_birth_hai(S0.title_txt_birth_hai);
			this.edit_txt_birth_hai(S0.edit_txt_birth_hai);
			this.tab_basic2_2(S0.tab_basic2_2);
			this.edit_txt_syokugyo(S0.edit_txt_syokugyo);
			this.basic2_syugyo_row(S0.basic2_syugyo_row);
			this.edit_txt_syugyo(S0.edit_txt_syugyo);
			this.basic2_taisyoku_row(S0.basic2_taisyoku_row);
			this.edit_txt_taisyoku(S0.edit_txt_taisyoku);
			this.edit_txt_syokugyo(S0.edit_txt_syokugyo);
			this.basic2_syugyo_row(S0.basic2_syugyo_row);
			this.edit_txt_syugyo(S0.edit_txt_syugyo);
			this.basic2_taisyoku_row(S0.basic2_taisyoku_row);
			this.edit_txt_taisyoku(S0.edit_txt_taisyoku);
			this.basic3_txt_lives(S0.basic3_txt_lives);
			this.basic3_lives_yotei_row(S0.basic3_lives_yotei_row);
			this.basic3_txt_lives_yotei(S0.basic3_txt_lives_yotei);
			this.basic3_sm_rent_row(S0.basic3_sm_rent_row);
			this.basic3_txt_rent(S0.basic3_txt_rent);
			this.basic3_age_jyutaku_row(S0.basic3_age_jyutaku_row);
			this.basic3_txt_age_jyutaku(S0.basic3_txt_age_jyutaku);
			this.basic3_sm_kariire_row(S0.basic3_sm_kariire_row);
			this.basic3_txt_sm_kariire(S0.basic3_txt_sm_kariire);
			this.basic4_txt_sm_assets(S0.basic4_txt_sm_assets);
			this.basic4_txt_mon_saving(S0.basic4_txt_mon_saving);
			this.kihonn_seikatu(S0.kihonn_seikatu);
			this.taisyoku_seikatu(S0.taisyoku_seikatu);

			// scene-1: S1
			this.btn_sex_1(S1.btn_sex_1);
			this.btn_sex_2(S1.btn_sex_2);
			this.spn_birth_hon_yyyy(S1.spn_birth_hon_yyyy);
			this.spn_birth_hon_yyyy_v(S1.spn_birth_hon_yyyy_v);
			this.spn_birth_hon_mm(S1.spn_birth_hon_mm);
			this.spn_birth_hon_mm_v(S1.spn_birth_hon_mm_v);
			this.spn_birth_hon_dd(S1.spn_birth_hon_dd);
			this.spn_birth_hon_dd_v(S1.spn_birth_hon_dd_v);
			this.btn_haiumu_1(S1.btn_haiumu_1);
			this.btn_haiumu_2(S1.btn_haiumu_2);
			this.row_kekkon_age(S1.row_kekkon_age);
			this.spn_kekkon_age(S1.spn_kekkon_age);
			this.spn_kekkon_age_v(S1.spn_kekkon_age_v);
			this.row_birth_hai(S1.row_birth_hai);
			this.spn_birth_hai_yyyy(S1.spn_birth_hai_yyyy);
			this.spn_birth_hai_yyyy_v(S1.spn_birth_hai_yyyy_v);
			this.spn_birth_hai_mm(S1.spn_birth_hai_mm);
			this.spn_birth_hai_mm_v(S1.spn_birth_hai_mm_v);
			this.spn_birth_hai_dd(S1.spn_birth_hai_dd);
			this.spn_birth_hai_dd_v(S1.spn_birth_hai_dd_v);

			// scene-2: S2
			this.popup_basic2_title(S2.popup_basic2_title);
			this.popup_basic2_syugyo_row(S2.popup_basic2_syugyo_row);
			this.spn_syokugyo(S2.spn_syokugyo);
			this.spn_syokugyo_v(S2.spn_syokugyo_v);
			this.spn_syugyo_yyyy(S2.spn_syugyo_yyyy);
			this.spn_syugyo_yyyy_v(S2.spn_syugyo_yyyy_v);
			this.spn_syugyo_mm(S2.spn_syugyo_mm);
			this.spn_syugyo_mm_v(S2.spn_syugyo_mm_v);
			this.popup_basic2_taisyoku_row(S2.popup_basic2_taisyoku_row);
			this.spn_taisyoku_age(S2.spn_taisyoku_age);
			this.spn_taisyoku_age_v(S2.spn_taisyoku_age_v);

			// scene-3: S3
			this.basic3_btn_lives_1(S3.basic3_btn_lives_1);
			this.basic3_btn_lives_2(S3.basic3_btn_lives_2);
			this.basic3_btn_lives_yotei_1(S3.basic3_btn_lives_yotei_1);
			this.basic3_btn_lives_yotei_2(S3.basic3_btn_lives_yotei_2);
			this.m_basic3_txt_rent(S3.m_basic3_txt_rent);
			this.basic3_row_lives_yotei(S3.basic3_row_lives_yotei);
			this.basic3_row_sm_rent(S3.basic3_row_sm_rent);
			this.basic3_row_age_jyutaku(S3.basic3_row_age_jyutaku);
			this.basic3_spn_age_jyutaku(S3.basic3_spn_age_jyutaku);
			this.basic3_spn_age_jyutaku_v(S3.basic3_spn_age_jyutaku_v);
			this.basic3_row_sm_kariire(S3.basic3_row_sm_kariire);
			this.basic3_txt_kariire(S3.basic3_txt_kariire);
			this.basic3_spn_hensai(S3.basic3_spn_hensai);
			this.basic3_spn_hensai_v(S3.basic3_spn_hensai_v);
			this.basic3_txt_kariirekinri(S3.basic3_txt_kariirekinri);
			this.basic3_check_jyutakuloan_1(S3.basic3_check_jyutakuloan_1);
			this.basic3_check_jyutakuloan_2(S3.basic3_check_jyutakuloan_2);

			// scene-4: S4
			this.basic4_edit_sm_assets(S4.basic4_edit_sm_assets);
			this.basic4_spn_saving1_from(S4.basic4_spn_saving1_from);
			this.basic4_spn_saving1_from_v(S4.basic4_spn_saving1_from_v);
			this.basic4_spn_saving1_to(S4.basic4_spn_saving1_to);
			this.basic4_spn_saving1_to_v(S4.basic4_spn_saving1_to_v);
			this.basic4_edit_saving1(S4.basic4_edit_saving1);
			this.basic4_spn_saving2_from(S4.basic4_spn_saving2_from);
			this.basic4_spn_saving2_from_v(S4.basic4_spn_saving2_from_v);
			this.basic4_spn_saving2_to(S4.basic4_spn_saving2_to);
			this.basic4_spn_saving2_to_v(S4.basic4_spn_saving2_to_v);
			this.basic4_edit_saving2(S4.basic4_edit_saving2);

			// scene-5: S5
			this.row1(S5.row1);
			this.row2(S5.row2);
			this.base_edit_income1(S5.base_edit_income1);
			this.base_edit_income2(S5.base_edit_income2);

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
				case 4:
					S4.onClickClose(target);
					this.setData();
					break;
				case 5:
					S5.onClickClose(target);
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
				case 3:
					S3.onClick(target);
					this.setData();
					break;
				case 4:
					S4.onClick(target);
					this.setData();
					break;
				case 5:
					S5.onClick(target);
					this.setData();
					break;
			}
		};


		this.onSelect = function(target, id, event) {
			// クリックイベントを無視
			if (event.type !== "click") {
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
						S3.onSelect(target, event);
						this.setData();
						break;
					case 4:
						S4.onSelect(target, event);
						this.setData();
						break;
					case 5:
						break;
				}
			}
		};

		this.onCalcFinish = function (target, id) {
			switch (id) {
				case 0:
					break;
				case 1:
					break;
				case 2:
					break;
				case 3:
					S3.onCalcFinish(target);
					this.setData();
					break;
				case 4:
					S4.onCalcFinish(target);
					this.setData();
					break;
				case 5:
					S5.onCalcFinish(target);
					this.setData();
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

    this.goSimulation = function () {
      window.location.href = "simulation1.html";
    };
    this.current_year = new Date().getFullYear();
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
		InputValueCheck = new LIFEPLAN.app.InputValueCheck();

		// JSONの読み込み&編集可能JSONデータをwebstorageから読み込み
		DB.db.loadStorage();
		// モデルケースを設定 引数にモデルケース番号
		DB.loadModelcase(id_modelcase);
		// 計算ロジック実行
		Calc.logicALL_Go();

		Logic05 = JSON.parse(LIFEPLAN.conf.storage.getItem("Logic05"));
	}

	function setup(updateHai) {
		m_modelClass = Module.getModelClass(id_modelcase);

		if (id_modelcase === 0) {
			setting_tab1_basic = '<a href="#" class="current"><span>基本</span><span>情報</span></a>';
			setting_tab2_job = '<a href="#"><span>職業</span><span class="dot">・</span><span>年収</span></a>';
			setting_tab3_house = '<span href="#"><span>住宅</span><span>プラン</span></span>';
			setting_tab4_education = '<span href="#"><span>教育</span><span>プラン</span></span>';
			setting_tab5_insurance = '<span href="#"><span>加入</span><span>保険</span></span>';
			simulation1 = '';
		} else {
			if (MC.id_lives === 1 || MC.id_lives_yotei === 1) {
				setting_tab1_basic = '<a href="#" class="current"><span>基本</span><span>情報</span></a>';
				setting_tab2_job = '<a href="#"><span>職業</span><span class="dot">・</span><span>年収</span></a>';
				setting_tab3_house = '<a href="#"><span>住宅</span><span>プラン</span></a>';
				setting_tab4_education = '<a href="#"><span>教育</span><span>プラン</span></a>';
				setting_tab5_insurance = '<a href="#"><span>加入</span><span>保険</span></a>';
				simulation1 = '<a class="button-diagnosis"></a>';
			} else {
				setting_tab1_basic = '<a href="#" class="current"><span>基本</span><span>情報</span></a>';
				setting_tab2_job = '<a href="#"><span>職業</span><span class="dot">・</span><span>年収</span></a>';
				setting_tab3_house = '<span href="#"><span>住宅</span><span>プラン</span></span>';
				setting_tab4_education = '<a href="#"><span>教育</span><span>プラン</span></a>';
				setting_tab5_insurance = '<a href="#"><span>加入</span><span>保険</span></a>';
				simulation1 = '<a class="button-diagnosis"></a>';
			}
		}

		S0.onCreate(updateHai);
		S1.onCreate();
		S2.onCreate();
		S3.onCreate();
		S4.onCreate();
		S5.onCreate();
	}
};