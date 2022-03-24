/* global LMPS, LIFEPLAN */

"use strict";

window.onload = function() {

	var DB;
	var Calc;
	var Util;
	var MC;
	var Wording;
	var LPdate;
	var id_modelcase;
	var Module;
	var Logic01;
	var Logic03;
	var Logic05;
	var Logic06;
	var InputValueCheck;

	// DB MC をセットし計算ロジック実行
	init();

	// main
	var m_modelClass;
	var m_show_modal;
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

	// modal-5
	var mMC = DB.Lp_modelcase;
	mMC.copy(MC);

	// コンテンツ内共有変数
	var mTab1Hon;
	var mTab2Hon;

	// モーダルを定義
	var Scenes = {
		S0: {},
		S1: {},
		S2: {},
		S3: {},
		S4: {},
		S5: {}
	};

	Scenes.S0 = (function() {
		var self;

		var S0 = function() {
			self = this;
		};

		var p = S0.prototype;

		p.onCreate = function(tab1, tab2) {

			if (tab1 !== null && tab2 !== null) {
				mTab1Hon = tab1;
				mTab2Hon = tab2;
			} else {
				mTab1Hon = 0;
				mTab2Hon = 0;
			}

			this.update();
		};

		p.update = function() {
			var s;
			s = Wording.MISETTEI;

			//左側
			var id_syokugyo = MC.get_id_syokugyo(mTab1Hon === 1);
			if (id_syokugyo !== 0) {
				s = DB.get_syokugyo(id_syokugyo).st_syokugyo;
			}

			//職業・就業年月表示
			if (id_syokugyo !== DB.G_syokugyo.JIEIGYO && id_syokugyo !== DB.G_syokugyo.MUSYOKU) {
				self.job_left_syokugyo_row = true;
				self.job_left_syugyo_row = true;
				self.job1_txt_syokugyo = s;
				self.job1_txt_syugyo = LPdate.toZenYM(MC.get_ym_syugyo(mTab1Hon === 1));
			} else {
				self.job_left_syokugyo_row = false;
				self.job_left_syugyo_row = false;
			}

			//退職年齢表示
			if (id_syokugyo === DB.G_syokugyo.TAI_KAISYAIN || id_syokugyo === DB.G_syokugyo.TAI_KOMUIN) {
				self.job_left_taisyoku_row = true;
				s = String(MC.get_age_taisyoku(mTab1Hon === 1)) + "歳";
				self.job1_txt_taisyoku_age = s;
			} else {
				self.job_left_taisyoku_row = false;
			}

			//業種・職種・規模表示
			if (id_syokugyo === DB.G_syokugyo.KAISYAIN || id_syokugyo === DB.G_syokugyo.YAKUIN || id_syokugyo === DB.G_syokugyo.TAI_KAISYAIN) {
				self.job_left_gyosyu_row = true;
				self.job_left_syokusyu_row = true;
				self.job_left_kibo_row = true;
				self.job1_txt_gyosyu = DB.get_gyosyu(MC.get_id_gyosyu(mTab1Hon === 1)).st_gyosyu;
				self.job1_txt_syokusyu = DB.get_syokusyu(MC.get_id_syokusyu(mTab1Hon === 1)).st_syokusyu;
				self.job1_txt_kibo = DB.get_kibo(MC.get_id_kibo(mTab1Hon === 1)).st_kibo;
			} else {
				self.job_left_gyosyu_row = false;
				self.job_left_syokusyu_row = false;
				self.job_left_kibo_row = false;
			}

			//現在の年収表示
			if (id_syokugyo === DB.G_syokugyo.KAISYAIN || id_syokugyo === DB.G_syokugyo.YAKUIN || id_syokugyo === DB.G_syokugyo.KOMUIN || id_syokugyo === DB.G_syokugyo.JIEIGYO) {
				self.job_left_nensyu_row = true;
				self.job1_txt_nensyu = Util.formatMoneyMan(MC.get_sm_nensyu(mTab1Hon === 1), 0);
			} else {
				self.job_left_nensyu_row = false;
			}

			//年収上昇率表示
			if (id_syokugyo === DB.G_syokugyo.JIEIGYO) {
				self.job_left_ra_nensyu_row = true;
				s = Util.num2RoundN(MC.get_ra_nensyu(mTab1Hon === 1), 1);
				self.job1_edit_ra_nensyu = s + "%";
			} else {
				self.job_left_ra_nensyu_row = false;
			}

			//勤務経験・過去就業年齢・過去退職年齢表示
			if (id_syokugyo === DB.G_syokugyo.JIEIGYO) {
				self.linear_btn_popup_job1 = true;

				self.job_left_kinmu_row = true;
				if (MC.get_id_kinmu(mTab1Hon === 1) === 0) {
					self.job1_text_kinmu = "勤務なし";
				} else if (MC.get_id_kinmu(mTab1Hon === 1) === 1) {
					self.job1_text_kinmu = "会社員";
				} else if (MC.get_id_kinmu(mTab1Hon === 1) === 2) {
					self.job1_text_kinmu = "公務員";
				} else {
					self.job1_text_kinmu = Wording.MISETTEI;
				}
				self.btn_popup_job1 = true;
				self.job_left_kakosyugyo_row = true;
				if (MC.get_age_kakosyugyo(mTab1Hon === 1) !== 0) {
					s = String(MC.get_age_kakosyugyo(mTab1Hon === 1)) + "歳";
				} else {
					s = Wording.MISETTEI;
				}
				self.job1_txt_kakosyugyo_age = s;
				self.job_left_kakotaisyoku_row = true;
				if (MC.get_age_kakotaisyoku(mTab1Hon === 1) !== 0) {
					s = String(MC.get_age_kakotaisyoku(mTab1Hon === 1)) + "歳";
				} else {
					s = Wording.MISETTEI;
				}
				self.job1_txt_kakotaisyoku_age = s;
			} else if (id_syokugyo === DB.G_syokugyo.MUSYOKU) {
				self.job1_text_kinmu = "勤務なし";
				self.job_left_kinmu_row = true;
				self.linear_btn_popup_job1 = false;
				self.job_left_kakosyugyo_row = false;
				self.job_left_kakotaisyoku_row = false;
			} else {
				self.job_left_kinmu_row = false;
				self.job_left_kakosyugyo_row = false;
				self.job_left_kakotaisyoku_row = false;
			}

			//退職時の年収表示
			if (id_syokugyo === DB.G_syokugyo.TAI_KAISYAIN || id_syokugyo === DB.G_syokugyo.TAI_KOMUIN || id_syokugyo === DB.G_syokugyo.JIEIGYO) {
				self.job_left_sm_tai_nensyu_row = true;
				self.job1_txt_sm_tai_nensyu = Util.formatMoneyMan(MC.get_sm_tai_nensyu(mTab1Hon === 1), 0);
			} else {
				self.job_left_sm_tai_nensyu_row = false;
			}

			//右上

			id_syokugyo = MC.get_id_syokugyo(mTab2Hon === 1);
			if (id_syokugyo !== 0) {
				s = DB.get_syokugyo(id_syokugyo).st_syokugyo;
			}

			//退職年齢・退職金表示
			if (id_syokugyo === DB.G_syokugyo.KAISYAIN || id_syokugyo === DB.G_syokugyo.YAKUIN || id_syokugyo === DB.G_syokugyo.KOMUIN || id_syokugyo === DB.G_syokugyo.JIEIGYO) {
				s = Wording.MISETTEI;
				if (MC.get_age_taisyoku(mTab2Hon === 1) > 0) {
					s = String(MC.get_age_taisyoku(mTab2Hon === 1)) + "歳";
				}
				self.job_right_taisyoku_row = true;
				self.job2_txt_age_taisyoku = s;
				s = Wording.MISETTEI;
				if (MC.get_sm_taisyoku(mTab2Hon === 1) > 0) {
					s = Util.formatMoneyMan(MC.get_sm_taisyoku(mTab2Hon === 1), 0);
				}
				self.job_right_sm_taisyoku_row = true;
				self.job2_txt_sm_taisyoku = s;
			} else {
				self.job_right_taisyoku_row = false;
				self.job_right_sm_taisyoku_row = false;
			}

			//再就職による収入見込み表示
			if (id_syokugyo === DB.G_syokugyo.MUSYOKU) {
				self.job_right_saisyusyoku_row = true;
				self.job2_txt_saisyusyoku = "なし";
				self.job_right_saisyusyoku_popup = false;
			} else if (id_syokugyo !== DB.G_syokugyo.JIEIGYO) {
				self.job_right_saisyusyoku_popup = true;
				s = Wording.MISETTEI;
				var st = MC.get_age_saisyusyoku_st(mTab2Hon === 1);
				var ed = MC.get_age_saisyusyoku_end(mTab2Hon === 1);
				var val = MC.get_sm_saisyu_income(mTab2Hon === 1);
				if (st > 0 && val > 0) {
					s = String(st) + "歳～";
					if (ed > 0) {
						s += String(ed) + "歳" + "<br\>";
					}
					s += Util.formatMoneyMan(val, 0);
				}
				self.job_right_saisyusyoku_row = true;
				self.job2_txt_saisyusyoku = s;
			} else {
				self.job_right_saisyusyoku_row = false;
			}
			//右下

			//退職後の生活費用表示
			s = Wording.MISETTEI;
			s = Util.formatMoneyMan(Calc.L5().Calc21_TaiSeikatsu(), 1);
			/*****2014/01/20  基本生活費、退職後生活費の入力欄追加	start***********/
			/*****2014/01/20  基本生活費、退職後生活費の入力欄追加	end***********/
			s = "なし";
			var SAIJI = "歳時";
			if (MC.sm_income1_from > 0 && MC.sm_income1 > 0) {
				s = String(MC.sm_income1_from) + SAIJI + "～";
				if (MC.sm_income1_to > 0) {
					s += String(MC.sm_income1_to) + SAIJI + "<br\>";
				}
				s += Util.formatMoneyMan(MC.sm_income1, 0);
			}
			if (MC.sm_income2_from > 0 && MC.sm_income2 > 0) {
				s += "<br\>" + String(MC.sm_income2_from) + SAIJI + "～";
				if (MC.sm_income2_to > 0) {
					s += String(MC.sm_income2_to) + SAIJI + "<br\>";
				}
				s += Util.formatMoneyMan(MC.sm_income2, 0);
			}
			if (MC.sm_income3_from > 0 && MC.sm_income3 > 0) {
				s += "<br\>" + String(MC.sm_income3_from) + SAIJI + "～";
				if (MC.sm_income3_to > 0) {
					s += String(MC.sm_income3_to) + SAIJI + "<br\>";
				}
				s += Util.formatMoneyMan(MC.sm_income3, 0);
			}
			self.job1_txt_income = s;

			if (MC.is_kekkon()) {
				self.job1_tab1_2 = true;
				self.job2_tab2_2 = true;
			} else {
				self.job1_tab1_2 = false;
				self.job2_tab2_2 = false;
			}
		};

		p.onClick = function(v) {
			viewModel.Sidemenu();

			switch (v) {
				case "setting_tab3":
					if (id_modelcase !== 0) {
						if (MC.id_lives === 1 || MC.id_lives_yotei === 1) {
							if (InputValueCheck.settingJob_S0_isValid(MC)) {
								window.location.href = 'setting_tab3_house.html';
							}
						}
					}
					break;
				case "setting_tab4":
					if (id_modelcase !== 0) {
						if (InputValueCheck.settingJob_S0_isValid(MC)) {
							window.location.href = 'setting_tab4_education.html';
						}
					}
					break;
				case "setting_tab5":
					if (id_modelcase !== 0) {
						if (InputValueCheck.settingJob_S0_isValid(MC)) {
							window.location.href = 'setting_tab5_insurance.html';
						}
					}
					break;
				case "goto_simulation":
					if (InputValueCheck.settingJob_S0_isValid(MC)) {
						window.location.href = 'simulation1.html';
					}
					break;
			}

			switch (v) {
				case "setting_tab1":
					if (InputValueCheck.settingJob_S0_isValid(MC)) {
						window.location.href = 'setting_tab1_basic.html';
					}
					break;
				case "setting_tab2":
					break;
				case "#modal-1":
					S1.onCreate(mTab1Hon);
					LMPS.openModal(v);
					break;
				case "#modal-2":
					S2.onCreate(mTab2Hon);
					LMPS.openModal(v);
					break;
				case "#modal-3":
					S3.onCreate();
					LMPS.openModal(v);
					break;
				case "#modal-4":
					if (InputValueCheck.settingJob_S0_isValid(MC)) {
						S4.onCreate();
						LMPS.openModal(v);
					}
					break;
				case "#modal-5":
					S5.onCreate();
					LMPS.openModal(v);
					break;
				case "job1_tab1_1":
					mTab1Hon = 0;
					self.update();
					break;
				case "job1_tab1_2":
					mTab1Hon = 1;
					self.update();
					break;
				case "job2_tab1_1":
					mTab2Hon = 0;
					self.update();
					S2.onCreate(mTab2Hon);
					break;
				case "job2_tab1_2":
					mTab2Hon = 1;
					self.update();
					S2.onCreate(mTab2Hon);
					break;
			}
		};

		return S0;
	})();

	// ご職業ポップアップ
	Scenes.S1 = (function() {
		var self;
		var mIsHai;
		var mSave;

		var y_start;
		var y_end;
		var KAKO_AGE_KAGEN = 15;

		var S1 = function() {
			self = this;
		};

		var p = S1.prototype;

		p.onCreate = function(param) {
			mSave = DB.Lp_modelcase;
			mSave.copy(MC);

			if (param === 1) {
				mIsHai = true;
			} else {
				mIsHai = false;
			}

			self.update();
		};

		p.update = function() {
			var birth = mSave.get_st_birthday(mIsHai);
			y_start = LPdate.getYear(birth) + 15;
			y_end = LPdate.getCurYear(birth);
			self.job1_spn_gyosyu = DB.get_gyosyu_list();
			self.job1_spn_gyosyu_v = self.job1_spn_gyosyu[mSave.get_id_gyosyu(mIsHai)];
			self.job1_spn_syokusyu = DB.get_syokusyu_list();
			self.job1_spn_syokusyu_v = self.job1_spn_syokusyu[mSave.get_id_syokusyu(mIsHai)];
			self.job1_spn_kibo = DB.get_kibo_list();
			self.job1_spn_kibo_v = self.job1_spn_kibo[mSave.get_id_kibo(mIsHai)];

			var list = [];
			var index;

			var genzai_age;
			index = mSave.get_age_kakosyugyo(mIsHai);
			if (mIsHai) {
				genzai_age = mSave.age_hai;
			} else {
				genzai_age = mSave.age_hon;
			}

			list = Module.listAddUnselected(DB.getNumberList(0, KAKO_AGE_KAGEN, genzai_age - 1, "", "歳"));

			// 【Web版LifePlan_課題管理.xml】No.13 対応 START
/*
			if (index > 0) {
				index -= KAKO_AGE_KAGEN;
				index++;
			}
			if (index < 0) {
				index = 0;
			}
			if (index > 99 - genzai_age) {
				index = 99 - genzai_age;
			}
*/
			// 就業年齢リストボックス
			if (index!=0 && index<KAKO_AGE_KAGEN){
				index=0;  // 0:未選択
			} else if (index!=0 && index>genzai_age-1){
				index=list.length-1;  // 最大年齢
			} else if (index!=0){
				index=index-14;
			}
			// 【Web版LifePlan_課題管理.xml】No.13 対応 END

			self.job1_spn_age_kakosyugyo = list;
			self.job1_spn_age_kakosyugyo_v = self.job1_spn_age_kakosyugyo[index];

			index = mSave.get_age_kakotaisyoku(mIsHai);
			if (mIsHai) {
				genzai_age = mSave.age_hai;
			} else {
				genzai_age = mSave.age_hon;
			}

			// 【Web版LifePlan_課題管理.xml】No.13 対応 START
/*
			if (index > 0) {
				index -= KAKO_AGE_KAGEN;
				index++;
			}
			if (index < 0) {
				index = 0;
			}
			if (index > 99 - genzai_age) {
				index = 99 - genzai_age;
			}
*/
			// 退職年齢リストボックス
			if (index!=0 && index<KAKO_AGE_KAGEN){
				index=0;  // 0:未選択
			} else if (index!=0 && index>genzai_age-1){
				index=list.length-1;  // 最大年齢
			} else if (index!=0){
				index=index-14;
			}
			// 【Web版LifePlan_課題管理.xml】No.13 対応 END

			self.job1_spn_age_kakotaisyoku = list;
			self.job1_spn_age_kakotaisyoku_v = self.job1_spn_age_kakotaisyoku[index];

			if (mIsHai) {
				self.popup_job1_title = "職業・年収／配偶者様の設定";
			} else {
				self.popup_job1_title = "職業・年収／ご本人様の設定";
			}
			//年収上昇率をテキスト入力

			self.job1_edit_ra_nensyu = Util.num2RoundN(mSave.get_ra_nensyu(mIsHai), 1);

			var s;
			s = Module.commafy(mSave.get_sm_nensyu(mIsHai));
			self.job1_edit_sm_nensyu = s;
			if (mSave.get_id_syokugyo(mIsHai) === DB.G_syokugyo.JIEIGYO) {
				s = Util.num2RoundN(mSave.get_ra_nensyu(mIsHai), 1);
				self.job1_edit_ra_nensyu = s;

				self.reference_value = false;
			} else {
				self.reference_value = true;
			}
			if (mSave.get_id_syokugyo(mIsHai) > 5 && 0 === mSave.get_id_kinmu(mIsHai)) {
				s = String(0);
			} else {
				s = Module.commafy(mSave.get_sm_tai_nensyu(mIsHai));
			}
			self.job1_edit_sm_tai_nensyu = s;

			var id_syokugyo = mSave.get_id_syokugyo(mIsHai);

			s = DB.get_syokugyo(mSave.get_id_syokugyo(mIsHai)).st_syokugyo;
			self.popup_job1_txt_syokugyo = s;
			self.popup_job1_txt_syugyo = LPdate.toZenYM(mSave.get_ym_syugyo(mIsHai));
			s = String(MC.get_age_taisyoku(mIsHai)) + "歳";
			self.popup_job1_txt_taisyoku_age = s;

			//職業・勤務経験・過去就業年齢・過去退職年齢の表示有無
			if (id_syokugyo === DB.G_syokugyo.JIEIGYO) {
				self.popup_job1_syokugyo_row = false;
				self.popup_job1_kinmu_row = true;
				self.popup_job1_kakosyugyo_row = true;
				self.popup_job1_kakotaisyoku_row = true;
			} else if (id_syokugyo === DB.G_syokugyo.MUSYOKU) {
				self.popup_job1_syokugyo_row = false;
				self.popup_job1_kinmu_row = false;
				self.popup_job1_kakosyugyo_row = false;
				self.popup_job1_kakotaisyoku_row = false;
			} else {
				self.popup_job1_syokugyo_row = true;
				self.popup_job1_kinmu_row = false;
				self.popup_job1_kakosyugyo_row = false;
				self.popup_job1_kakotaisyoku_row = false;
			}
			//就業年月の表示・入力有無
			if (id_syokugyo === DB.G_syokugyo.KAISYAIN || id_syokugyo === DB.G_syokugyo.YAKUIN || id_syokugyo === DB.G_syokugyo.KOMUIN ||
					id_syokugyo === DB.G_syokugyo.TAI_KAISYAIN || id_syokugyo === DB.G_syokugyo.TAI_KOMUIN) {
				self.popup_job1_txt_syugyo_row = true;
			} else {
				self.popup_job1_txt_syugyo_row = false;
			}
			//退職年齢の表示有無
			if (id_syokugyo === DB.G_syokugyo.TAI_KAISYAIN || id_syokugyo === DB.G_syokugyo.TAI_KOMUIN) {
				self.popup_job1_taisyoku_row = true;
			} else {
				self.popup_job1_taisyoku_row = false;
			}
			//業種・職種・規模の表示有無
			if (id_syokugyo === DB.G_syokugyo.KAISYAIN || id_syokugyo === DB.G_syokugyo.YAKUIN || id_syokugyo === DB.G_syokugyo.TAI_KAISYAIN) {
				self.popup_job1_gyosyu_row = true;
				self.popup_job1_syokusyu_row = true;
				self.popup_job1_kibo_row = true;
			} else {
				self.popup_job1_gyosyu_row = false;
				self.popup_job1_syokusyu_row = false;
				self.popup_job1_kibo_row = false;
			}
			//現在の年収の表示有無
			if (id_syokugyo === DB.G_syokugyo.KAISYAIN || id_syokugyo === DB.G_syokugyo.YAKUIN || id_syokugyo === DB.G_syokugyo.KOMUIN || id_syokugyo === DB.G_syokugyo.JIEIGYO) {
				self.popup_job1_sm_nensyu_row = true;
			} else {
				self.popup_job1_sm_nensyu_row = false;
			}
			//退職時の年収の表示有無
			if (id_syokugyo === DB.G_syokugyo.TAI_KAISYAIN || id_syokugyo === DB.G_syokugyo.TAI_KOMUIN || id_syokugyo === DB.G_syokugyo.JIEIGYO) {
				self.popup_job1_sm_tai_nensyu_row = true;
			} else {
				self.popup_job1_sm_tai_nensyu_row = false;
			}
			//年収上昇率の表示有無
			if (id_syokugyo === DB.G_syokugyo.JIEIGYO) {
				self.popup_job1_ra_nensyu_row = true;
			} else {
				self.popup_job1_ra_nensyu_row = false;
			}

			if (mSave.get_id_kinmu(mIsHai) === 0) {
				self.job1_btn_kinmu_1 = "勤務なし";
				self.job1_btn_kinmu_2 = "";
				self.job1_btn_kinmu_3 = "";
			} else if (mSave.get_id_kinmu(mIsHai) === 1) {
				self.job1_btn_kinmu_1 = "";
				self.job1_btn_kinmu_2 = "会社員";
				self.job1_btn_kinmu_3 = "";
			} else if (mSave.get_id_kinmu(mIsHai) === 2) {
				self.job1_btn_kinmu_1 = "";
				self.job1_btn_kinmu_2 = "";
				self.job1_btn_kinmu_3 = "公務員";
			}
		};

		p.onClickClose = function(v) {

			switch (v) {
				case "popup_cancel":
					LMPS.closeModal();
					break;
				case "popup_change":
					if (InputValueCheck.settingJob_S1_isValid(mSave, mIsHai)) {
						var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase"));
						var key = id_modelcase;
						data[key].sm_nensyu_hon = mSave.sm_nensyu_hon;
						data[key].sm_nensyu_hai = mSave.sm_nensyu_hai;
						data[key].id_gyosyu_hon = mSave.id_gyosyu_hon;
						data[key].id_gyosyu_hai = mSave.id_gyosyu_hai;
						data[key].id_syokusyu_hon = mSave.id_syokusyu_hon;
						data[key].id_syokusyu_hai = mSave.id_syokusyu_hai;
						data[key].id_kibo_hon = mSave.id_kibo_hon;
						data[key].id_kibo_hai = mSave.id_kibo_hai;
						data[key].ra_nensyu_hon = mSave.ra_nensyu_hon;
						data[key].ra_nensyu_hai = mSave.ra_nensyu_hai;
						data[key].id_kinmu_hon = mSave.id_kinmu_hon;
						data[key].id_kinmu_hai = mSave.id_kinmu_hai;
						data[key].age_kakosyugyo_hon = mSave.age_kakosyugyo_hon;
						data[key].age_kakosyugyo_hai = mSave.age_kakosyugyo_hai;
						data[key].age_kakotaisyoku_hon = mSave.age_kakotaisyoku_hon;
						data[key].age_kakotaisyoku_hai = mSave.age_kakotaisyoku_hai;
						data[key].sm_tai_nensyu_hon = mSave.sm_tai_nensyu_hon;
						data[key].sm_tai_nensyu_hai = mSave.sm_tai_nensyu_hai;
						LIFEPLAN.conf.storage.setItem("lp_modelcase", JSON.stringify(data));

						init();
						if (mIsHai) {
							setup(mTab1Hon, mTab2Hon);
						} else {
							setup();
						}
						LMPS.closeModal();
					}
					break;
			}
		};

//		/**
//		 参考値のボタンハンドラ
//		 */
		p.onClickReference = function(v) {


			/* 20200826 参考値ロジック応急対応 */
			var selectTags = document.getElementsByTagName('select');
			GSKArr[0] = selectTags[0].selectedIndex;
			GSKArr[1] = selectTags[1].selectedIndex;
			GSKArr[2] = selectTags[2].selectedIndex;

			init();
			/* 20200826 参考値ロジック応急対応 */


			var index = getIndex(mIsHai);
			var avgIncome = 0;
			if (mIsHai) {
				avgIncome = Logic01.vAvgIncome_hai[mSave.age_hai + index];
			} else {
				avgIncome = Logic01.vAvgIncome_hon[mSave.age_hon + index];
			}

			mSave.set_sm_nensyu(avgIncome, mIsHai);
			self.job1_edit_sm_nensyu = Module.commafy(avgIncome);
		};

		p.onSelect = function(id, event) {
			var index = event.target.selectedIndex;

			var age_misettei_taiou = 0;
			if (id === "job1_spn_gyosyu") {
				mSave.set_id_gyosyu(index, mIsHai);
				self.update();
			} else if (id === "job1_spn_syokusyu") {
				mSave.set_id_syokusyu(index, mIsHai);
				self.update();
			} else if (id === "job1_spn_kibo") {
				mSave.set_id_kibo(index, mIsHai);
				self.update();
			} else if (id === "job1_spn_age_kakosyugyo") {
				if (index === 0) {
					age_misettei_taiou = 14;
				} else {
					age_misettei_taiou = 0;
				}
				if (mIsHai) {
					mSave.age_kakosyugyo_hai = index + KAKO_AGE_KAGEN - 1 - age_misettei_taiou;
				} else {
					mSave.age_kakosyugyo_hon = index + KAKO_AGE_KAGEN - 1 - age_misettei_taiou;
				}
				self.update();
			} else if (id === "job1_spn_age_kakotaisyoku") {
				if (index === 0) {
					age_misettei_taiou = 14;
				} else {
					age_misettei_taiou = 0;
				}
				if (mIsHai) {
					mSave.age_kakotaisyoku_hai = index + KAKO_AGE_KAGEN - 1 - age_misettei_taiou;
				} else {
					mSave.age_kakotaisyoku_hon = index + KAKO_AGE_KAGEN - 1 - age_misettei_taiou;
				}
				self.update();
			} else {
				return;
			}
		};

		p.onClick = function(v) {

			switch (v) {
				case "job1_btn_kinmu_1":
					mSave.set_id_kinmu(0, mIsHai);
					self.update();
					break;
				case "job1_btn_kinmu_2":
					mSave.set_id_kinmu(1, mIsHai);
					self.update();
					break;
				case "job1_btn_kinmu_3":
					mSave.set_id_kinmu(2, mIsHai);
					self.update();
					break;
			}
		};

		p.onCalcFinish = function(v) {
			var value;
			switch (v) {
				case "job1_edit_sm_nensyu":
					value = Module.toFilteredNum(viewModel.job1_edit_sm_nensyu());
					value = (value > 99990000) ? 99990000 : value;
					mSave.set_sm_nensyu(value, mIsHai);
					self.update();
					break;
				case "job1_edit_sm_tai_nensyu":
					value = Module.toFilteredNum(viewModel.job1_edit_sm_tai_nensyu());
					value = (value > 99990000) ? 99990000 : value;
					mSave.set_sm_tai_nensyu(value, mIsHai);
					self.update();
					break;
				case "job1_edit_ra_nensyu":
					value = Module.toFilteredNum(viewModel.job1_edit_ra_nensyu());
					value = (value > 9.9) ? 9.9 : value;
					mSave.set_ra_nensyu(value, mIsHai);
					self.update();
					break;
			}
		};

		return S1;
	})();

	// 退職後のご予定ポップアップ
	Scenes.S2 = (function() {
		var self;
		var S2 = function() {
			self = this;
		};
		var p = S2.prototype;

		var is_hai = (mTab2Hon === 1);
		var mIsHai = (mTab2Hon === 1);

		var mSave = DB.Lp_modelcase;

		var y_tai_start = 0;
		var y_tai_end = 0;


		p.onCreate = function(param) {
			mSave = DB.Lp_modelcase;
			mSave.copy(MC);
			if (param === 1) {
				mIsHai = true;
			} else {
				mIsHai = false;
			}

			// モーダルのタイトルを動的に変更する
			if (mIsHai) {
				self.popup_job2_title = "退職後のご予定／配偶者様";
			} else {
				self.popup_job2_title = "退職後のご予定／ご本人様";
			}

			var syokugyo = mSave.get_id_syokugyo(mIsHai);

			if (syokugyo === DB.G_syokugyo.KAISYAIN || syokugyo === DB.G_syokugyo.YAKUIN || syokugyo === DB.G_syokugyo.KOMUIN || syokugyo === DB.G_syokugyo.JIEIGYO) {
				y_tai_start = mSave.get_age(mIsHai);
				y_tai_end = 65;
			} else if (syokugyo === DB.G_syokugyo.TAI_KAISYAIN ||
					syokugyo === DB.G_syokugyo.TAI_KOMUIN) {
				y_tai_start = mSave.get_age_syugyo(mIsHai);
				y_tai_end = mSave.get_age(mIsHai);
			}

			// 本人、配偶者の年齢が20歳の場合、退職年齢は21歳から選択できる
			if ((mSave.age_hon === 20 && syokugyo !== 7) || (mSave.age_hai === 20 && syokugyo !== 7)) {
				y_tai_start = 21;
			}

			var age = LIFEPLAN.module.listAddUnselected(DB.getNumberList(0, y_tai_start, y_tai_end, "", "歳"));
			var taisyoku_index = mSave.get_age_taisyoku(mIsHai);
			if (taisyoku_index > y_tai_end) {
				taisyoku_index = y_tai_end;
			}
			if (taisyoku_index >= y_tai_start) {
				taisyoku_index = taisyoku_index - y_tai_start + 1;
			} else {
				taisyoku_index = 0;
			}
			self.job2_spn_age_taisyoku = age;
			if (taisyoku_index > 0) {
				self.job2_spn_age_taisyoku_v = mSave.get_age_taisyoku(mIsHai) + "歳";
			} else {
				self.job2_spn_age_taisyoku_v = Wording.MISENTAKU;
			}
			self.job2_spn_taisyoku = Module.commafy(mSave.get_sm_taisyoku(mIsHai));
			self.job2_spn_saisyu_income = Module.commafy(mSave.get_sm_saisyu_income(mIsHai));

			this.update();

		};

		p.update = function() {

			var tai_age = mSave.get_age_taisyoku(mIsHai);
			var index = 0;
			var list_st;
			index = mSave.get_age_saisyusyoku_st(mIsHai);
			if (tai_age === 0) {
				list_st = [0];
				index = 0;
				list_st[0] = Wording.MISENTAKU;
			} else {
				list_st = LIFEPLAN.module.listAddUnselected(DB.getNumberList(0, tai_age, 99, "", "歳"));
				if (index > 0) {
					index -= tai_age - 1;
				}
				if (index < 0) {
					index = 0;
				}
			}
			self.job2_spn_age_saisyusyoku_st = list_st;
			if (index > 0) {
				self.job2_spn_age_saisyusyoku_st_v = mSave.get_age_saisyusyoku_st(mIsHai) + "歳";
			} else if (index == 0) {
				self.job2_spn_age_saisyusyoku_st_v = "(未選択)";
			}

			var list_end = [0];
			index = mSave.get_age_saisyusyoku_end(mIsHai);
			if (tai_age === 0) {
				list_st = [0];
				index = 0;
				list_end[0] = Wording.MISENTAKU;
			} else {
				list_end = LIFEPLAN.module.listAddUnselected(DB.getNumberList(0, tai_age, 99, "", "歳"));
				if (index > 0) {
					index -= tai_age - 1;
				}
				if (index < 0) {
					index = 0;
				}
			}
			self.job2_spn_age_saisyusyoku_end = list_end;
			if (index > 0) {
				self.job2_spn_age_saisyusyoku_end_v = mSave.get_age_saisyusyoku_end(mIsHai) + "歳";
			} else if (index == 0) {
				self.job2_spn_age_saisyusyoku_end_v = "(未選択)";
			}

			var id_syokugyo = mSave.get_id_syokugyo(mIsHai);

			//退職年齢・退職金の表示有無
			if (id_syokugyo === DB.G_syokugyo.KAISYAIN || id_syokugyo === DB.G_syokugyo.YAKUIN || id_syokugyo === DB.G_syokugyo.KOMUIN || id_syokugyo === DB.G_syokugyo.JIEIGYO) {
				self.popup_job2_taisyoku_row = true;
				self.popup_job2_sm_taisyoku_row = true;
			} else {
				self.popup_job2_taisyoku_row = false;
				self.popup_job2_sm_taisyoku_row = false;
			}
			//再就職（開始年齢）・再就職（終了年齢）・収入額の表示有無
			if (id_syokugyo !== DB.G_syokugyo.JIEIGYO) {
				self.popup_job2_age_saisyusyoku_st_row = true;
				self.popup_job2_age_saisyusyoku_end_row = true;
				self.popup_job2_sm_saisyu_income_row = true;
			} else {
				self.popup_job2_age_saisyusyoku_st_row = false;
				self.popup_job2_age_saisyusyoku_end_row = false;
				self.popup_job2_sm_saisyu_income_row = false;
			}
		};

		p.save = function() {

			if (InputValueCheck.settingJob_S2_isValid(mSave, mIsHai)) {
				MC = mSave;
			} else {
				return;
			}
			;

			var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase"));

			data[id_modelcase].age_taisyoku_hon = MC.age_taisyoku_hon;
			data[id_modelcase].sm_taisyoku_hon = MC.sm_taisyoku_hon;
			data[id_modelcase].age_saisyusyoku_st_hon = MC.age_saisyusyoku_st_hon;
			data[id_modelcase].age_saisyusyoku_end_hon = MC.age_saisyusyoku_end_hon;
			data[id_modelcase].sm_saisyu_income_hon = MC.sm_saisyu_income_hon;
			data[id_modelcase].age_taisyoku_hai = MC.age_taisyoku_hai;
			data[id_modelcase].sm_taisyoku_hai = MC.sm_taisyoku_hai;
			data[id_modelcase].age_saisyusyoku_st_hai = MC.age_saisyusyoku_st_hai;
			data[id_modelcase].age_saisyusyoku_end_hai = MC.age_saisyusyoku_end_hai;
			data[id_modelcase].sm_saisyu_income_hai = MC.sm_saisyu_income_hai;

			LIFEPLAN.conf.storage.setItem("lp_modelcase", JSON.stringify(data));

			init();
			if (mIsHai) {
				setup(mTab1Hon, mTab2Hon);
			} else {
				setup();
			}
			LMPS.closeModal();
		};

		p.job2_spn_income = function(data, event) {

			var outer = event.target.outerHTML;
			var data = event.target.value;

			while (data.match(/[^0-9]+/)) {
				data = data.replace(/[^0-9]+/, '');
			}

			if (~outer.indexOf('job2_spn_taisyoku')) {
				mSave.set_sm_taisyoku((Number(data) > 999990000) ? 999990000 : (Number(data)), mIsHai);
				self.job2_spn_taisyoku = Module.commafy(mSave.get_sm_taisyoku(mIsHai));
			}
			if (~outer.indexOf('job2_spn_saisyu_income')) {
				mSave.set_sm_saisyu_income((Number(data) > 99990000) ? 99990000 : (Number(data)), mIsHai);
				self.job2_spn_saisyu_income = Module.commafy(mSave.get_sm_saisyu_income(mIsHai));
			}
		};

		p.job2_onSelect = function(data, event) {

			if ($('#modal-2').hasClass('is-open')) {
				var outer = event.target.outerHTML;
				var index = event.target.selectedIndex;

				var tai_age = mSave.get_age_taisyoku(mIsHai);
				if (~outer.indexOf('job2_spn_age_taisyoku_v')) {
					if (index === 0) {
						mSave.set_age_taisyoku(index, mIsHai);
						mSave.set_age_saisyusyoku_st(index, mIsHai);
						mSave.set_age_saisyusyoku_end(index, mIsHai);
					} else {
						mSave.set_age_taisyoku(index + y_tai_start - 1, mIsHai);
					}

				} else if (~outer.indexOf('job2_spn_age_saisyusyoku_st_v')) {
					if (index === 0) {
						mSave.set_age_saisyusyoku_st(index, mIsHai);
						mSave.set_age_saisyusyoku_end(index, mIsHai);
					} else {
						mSave.set_age_saisyusyoku_st(index + tai_age - 1, mIsHai);
					}
				} else if (~outer.indexOf('job2_spn_age_saisyusyoku_end_v')) {
					if (index === 0) {
						mSave.set_age_saisyusyoku_end(index, mIsHai);
					} else {
						mSave.set_age_saisyusyoku_end(index + tai_age - 1, mIsHai);
					}
				} else {
				}
			}
			self.job2_spn_age_taisyoku_v = mSave.get_age_taisyoku(mIsHai);
			self.job2_spn_age_saisyusyoku_st_v = mSave.get_age_saisyusyoku_st(mIsHai);
			self.job2_spn_age_saisyusyoku_end_v = mSave.get_age_saisyusyoku_end(mIsHai);

			this.update();
		};

		return S2;
	})();

	// その他収入モーダルポップアップ
	Scenes.S3 = (function() {
		var self;
		var mSave = DB.Lp_modelcase;

		var S3 = function() {
			self = this;
		};

		var p = S3.prototype;

		p.onCreate = function() {

			mSave = DB.Lp_modelcase;
			mSave.copy(MC);

			// 年齢以降スピナーの値設定
			var age = mSave.get_age(0);
			var agelist = DB.getNumberList(0, age - 1, 99, "", "歳時");
			agelist[0] = "未選択";

			// スピナーの値設定
			// fromは年齢以降
			self.job1_spn_income1_from = agelist;
			self.job1_spn_income2_from = agelist;
			self.job1_spn_income3_from = agelist;

			// 値を設定する
			if (mSave.sm_income1_to > 0) {
				self.job1_spn_income1_to_v = mSave.sm_income1_to + "歳時";
			} else {
				self.job1_spn_income1_to_v = "未選択";
			}
			if (mSave.sm_income2_to > 0) {
				self.job1_spn_income2_to_v = mSave.sm_income2_to + "歳時";
			} else {
				self.job1_spn_income2_to_v = "未選択";
			}
			if (mSave.sm_income3_to > 0) {
				self.job1_spn_income3_to_v = mSave.sm_income3_to + "歳時";
			} else {
				self.job1_spn_income3_to_v = "未選択";
			}

			if (mSave.sm_income1_from > 0) {
				self.job1_spn_income1_from_v = mSave.sm_income1_from + "歳時";
			} else {
				self.job1_spn_income1_from_v = "未選択";
			}
			if (mSave.sm_income2_from > 0) {
				self.job1_spn_income2_from_v = mSave.sm_income2_from + "歳時";
			} else {
				self.job1_spn_income2_from_v = "未選択";
			}
			if (mSave.sm_income3_from > 0) {
				self.job1_spn_income3_from_v = mSave.sm_income3_from + "歳時";
			} else {
				self.job1_spn_income3_from_v = "未選択";
			}

			// toはfrom以降
			if (mSave.sm_income1_to > 0) {
				agelist = DB.getNumberList(0, mSave.sm_income1_from - 1, 99, "", "歳時");
				agelist[0] = "未選択";
			} else {
				agelist = ["未選択"];
			}
			self.job1_spn_income1_to = agelist;

			if (mSave.sm_income2_to > 0) {
				agelist = DB.getNumberList(0, mSave.sm_income2_from - 1, 99, "", "歳時");
				agelist[0] = "未選択";
			} else {
				agelist = ["未選択"];
			}
			self.job1_spn_income2_to = agelist;

			if (mSave.sm_income3_to > 0) {
				agelist = DB.getNumberList(0, mSave.sm_income3_from - 1, 99, "", "歳時");
				agelist[0] = "未選択";
			} else {
				agelist = ["未選択"];
			}
			self.job1_spn_income3_to = agelist;

			// 金額を設定する
			self.job1_spn_income1 = Module.commafy(mSave.sm_income1);
			self.job1_spn_income2 = Module.commafy(mSave.sm_income2);
			self.job1_spn_income3 = Module.commafy(mSave.sm_income3);

			this.update();
		};

		p.update = function() {
		};

		p.save = function() {
			if (self.isValid(mSave, this)) {
				var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase"));

				data[id_modelcase].sm_income1 = mSave.sm_income1;
				data[id_modelcase].sm_income1_from = mSave.sm_income1_from;
				data[id_modelcase].sm_income1_to = mSave.sm_income1_to;

				data[id_modelcase].sm_income2 = mSave.sm_income2;
				data[id_modelcase].sm_income2_from = mSave.sm_income2_from;
				data[id_modelcase].sm_income2_to = mSave.sm_income2_to;

				data[id_modelcase].sm_income3 = mSave.sm_income3;
				data[id_modelcase].sm_income3_from = mSave.sm_income3_from;
				data[id_modelcase].sm_income3_to = mSave.sm_income3_to;

				LIFEPLAN.conf.storage.setItem("lp_modelcase", JSON.stringify(data));

				MC = mSave;
				init();
				setup(mTab1Hon, mTab2Hon);

				LMPS.closeModal();
			}
		};

		// 年齢スピナー選択時
		p.onSelect = function(data, event) {

			var outer = event.target.outerHTML;
			var index = event.target.selectedIndex;

			// spiner 1
			if (~outer.indexOf('job1_spn_income1_from_v')) {
				mSave.sm_income1_from = index - 1 + mSave.get_age(0);
				self.job1_spn_income1_from_v = mSave.sm_income1_from + "歳時";
				// 連動してtoのspinerの選択肢を変更する
				var agelist = DB.getNumberList(0, mSave.sm_income1_from - 1, 99, "", "歳時");
				agelist[0] = "未選択";
				self.job1_spn_income1_to = agelist;

				// from で未選択が選択されて場合は,toも未選択として、リストも未選択のみとする
				if (index === 0) {
					mSave.sm_income1_from = 0;
					mSave.sm_income1_to = 0;
					var agelist = ["未選択"];
					self.job1_spn_income1_to = agelist;
				}
			}
			if (~outer.indexOf('job1_spn_income1_to_v')) {
				mSave.sm_income1_to = index - 1 + mSave.sm_income1_from;
				self.job1_spn_income1_to_v = mSave.sm_income1_to + "歳時";
				if (index === 0) {
					mSave.sm_income1_to = 0;
				}
			}

			// spiner 2
			if (~outer.indexOf('job1_spn_income2_from_v')) {
				mSave.sm_income2_from = index - 1 + mSave.get_age(0);
				self.job1_spn_income2_from_v = mSave.sm_income2_from + "歳時";
				// 連動してtoのspinerの選択肢を変更する
				var agelist = DB.getNumberList(0, mSave.sm_income2_from - 1, 99, "", "歳時");
				agelist[0] = "未選択";
				self.job1_spn_income2_to = agelist;

				// from で未選択が選択されて場合は,toも未選択として、リストも未選択のみとする
				if (index === 0) {
					mSave.sm_income2_from = 0;
					mSave.sm_income2_to = 0;
					var agelist = ["未選択"];
					self.job1_spn_income2_to = agelist;
				}
			}
			if (~outer.indexOf('job1_spn_income2_to_v')) {
				mSave.sm_income2_to = index - 1 + mSave.sm_income2_from;
				self.job1_spn_income2_to_v = mSave.sm_income2_to + "歳時";
				if (index === 0) {
					mSave.sm_income2_to = 0;
				}
			}

			// spiner 3
			if (~outer.indexOf('job1_spn_income3_from_v')) {
				mSave.sm_income3_from = index - 1 + mSave.get_age(0);
				self.job1_spn_income3_from_v = mSave.sm_income3_from + "歳時";
				// 連動してtoのspinerの選択肢を変更する
				var agelist = DB.getNumberList(0, mSave.sm_income3_from - 1, 99, "", "歳時");
				agelist[0] = "未選択";
				self.job1_spn_income3_to = agelist;

				// from で未選択が選択されて場合は,toも未選択として、リストも未選択のみとする
				if (index === 0) {
					mSave.sm_income3_from = 0;
					mSave.sm_income3_to = 0;
					var agelist = ["未選択"];
					self.job1_spn_income3_to = agelist;
				}
			}
			if (~outer.indexOf('job1_spn_income3_to_v')) {
				mSave.sm_income3_to = index - 1 + mSave.sm_income3_from;
				self.job1_spn_income3_to_v = mSave.sm_income3_to + "歳時";
				if (index === 0) {
					mSave.sm_income3_to = 0;
				}
			}
		};

		// その他収入の金額テキストボックスのイベント
		p.job1_spn_income = function(data, event) {

			var outer = event.target.outerHTML;
			var data = event.target.value;

			while (data.match(/[^0-9]+/)) {
				data = data.replace(/[^0-9]+/, '');
			}

			if (~outer.indexOf('job1_spn_income1')) {
				mSave.sm_income1 = (Number(data) > 99990000) ? 99990000 : Number(data);
				self.job1_spn_income1 = Module.commafy(mSave.sm_income1);
			}
			if (~outer.indexOf('job1_spn_income2')) {
				mSave.sm_income2 = (Number(data) > 99990000) ? 99990000 : Number(data);
				self.job1_spn_income2 = Module.commafy(mSave.sm_income2);
			}
			if (~outer.indexOf('job1_spn_income3')) {
				mSave.sm_income3 = (Number(data) > 99990000) ? 99990000 : Number(data);
				self.job1_spn_income3 = Module.commafy(mSave.sm_income3);
			}
		};

		p.isValid = function(_mc, context) {
			/*****2014/01/20  退職後の生活費用および、その入力チェックを削除   start***********/
			/*****2014/01/20  退職後の生活費用および、その入力チェックを削除   end***********/
			// 受入No.50 その他収入金額１が空白以外の場合、その他収入１From or その他収入１Toが未設定の場合

			if (_mc.sm_income1 > 0 && (0 === _mc.sm_income1_from || 0 === _mc.sm_income1_to)) {
				alert("その他収入の入力内容を見直してください。");
				return false;
			}
			// 受入No.51 その他収入金額１が空白以外の場合、その他収入１From ＞ その他収入１Toの場合

			if (_mc.sm_income1 > 0 && (_mc.sm_income1_from > _mc.sm_income1_to)) {
				alert("その他収入の入力内容を見直してください。");
				return false;
			}

			// 受入No.53 その他収入金額２が空白以外の場合、その他収入２From or その他収入２Toが未設定の場合

			if (_mc.sm_income2 > 0 && (0 === _mc.sm_income2_from || 0 === _mc.sm_income2_to)) {
				alert("その他収入の入力内容を見直してください。");
				return false;
			}

			// 受入No.54 その他収入金額２が空白以外の場合、その他収入２From ＞ その他収入２Toの場合

			if (_mc.sm_income2 > 0 && (_mc.sm_income2_from > _mc.sm_income2_to)) {
				alert("その他収入の入力内容を見直してください。");
				return false;
			}

			// 受入No.56 その他収入金額３が空白以外の場合、その他収入３From or その他収入３Toが未設定の場合

			if (_mc.sm_income3 > 0 && (0 === _mc.sm_income3_from || 0 === _mc.sm_income3_to)) {
				alert("その他収入の入力内容を見直してください。");
				return false;
			}

			// 受入No.57 その他収入金額３が空白以外の場合、その他収入３From ＞ その他収入３Toの場合

			if (_mc.sm_income3 > 0 && (_mc.sm_income3_from > _mc.sm_income3_to)) {
				alert("その他収入の入力内容を見直してください。");
				return false;
			}

			// 受入No.52 その他収入金額1が空白の場合、その他収入1From or その他収入1Toが選択済みの場合

			if ((_mc.sm_income1 < 1 || _mc.sm_income1 > 99990000) && (0 !== _mc.sm_income1_from || 0 !== _mc.sm_income1_to)) {
				alert("その他収入の入力内容を見直してください。");
				return false;
			}
			// 受入No.55 その他収入金額2が空白の場合、その他収入2From or その他収入2Toが選択済みの場合

			if ((_mc.sm_income2 < 1 || _mc.sm_income2 > 99990000) && (0 !== _mc.sm_income2_from || 0 !== _mc.sm_income2_to)) {
				alert("その他収入の入力内容を見直してください。");
				return false;
			}
			// 受入No.58 その他収入金額3が空白の場合、その他収入3From or その他収入3Toが選択済みの場合

			if ((_mc.sm_income3 < 1 || _mc.sm_income3 > 99990000) && (0 !== _mc.sm_income3_from || 0 !== _mc.sm_income3_to)) {
				alert("その他収入の入力内容を見直してください。");
				return false;
			}
			return true;
		};

		return S3;
	})();

	// 公的年金試算ポップアップ
	Scenes.S4 = (function() {
		var self;
		var S4 = function() {
			self = this;
		};
		var p = S4.prototype;

		p.onCreate = function() {
			this.update();
		};

		p.update = function() {
			// 年金チャートの再描画

			var index = getIndex(false);
			var index_hai = getIndex(true);
			var age_taisyoku = MC.age_taisyoku_hon;
			var s = "";

			//退職・引退時金融資産残高
			var zandaka = 0;
			if (age_taisyoku !== 20) {
				zandaka = Logic06.vShikin[age_taisyoku - 1 + index];
			} else {
				zandaka = MC.sm_assets;
			}
			s = Util.formatMoneyMan(zandaka, 0);
			//65
			self.diag_nenkin_txt_tai_zandaka = Util.formatMoneyMan(Logic06.vShikin[65 + index], 0);

			//退職金
			var taisyoku = 0;
			if (MC.get_id_syokugyo(false) !== DB.G_syokugyo.TAI_KAISYAIN &&
					MC.get_id_syokugyo(false) !== DB.G_syokugyo.TAI_KOMUIN &&
					MC.get_id_syokugyo(false) !== DB.G_syokugyo.MUSYOKU) {
				taisyoku = MC.sm_taisyoku_hon;
			}
			s = Util.formatMoneyMan(taisyoku, 0);
			//70
			self.diag_nenkin_txt_sm_taisyoku = Util.formatMoneyMan(Logic06.vShikin[70 + index], 0);

			//基本生活費不足合計額
			var baseincome = Logic05.Calc21_TaiSeikatsu;
			var totalSeikatsuMinus = 0;
			for (var i = 60; i < 100; i++) {
				var minus = Logic03.vNenkin_hon[index + i] + Logic03.vNenkin_hai[index + i] - baseincome * 12;
				// マイナスしか考慮に入れていないため、数値を増やしても基本生活費不足合計額が変わらない
				if (minus < 0) {
					totalSeikatsuMinus += minus;
				}
			}
			s = Util.formatMoneyMan(totalSeikatsuMinus, 0);
			//75
			self.diag_nenkin_txt_basic_income = Util.formatMoneyMan(Logic06.vShikin[75 + index], 0);

			//イベント費用
			var eventCost = 0;
			for (var i = 0; i < Calc.mLogic05.vEvent.length; i++) {
				eventCost += Calc.mLogic05.vEvent[i];
			}
			s = Util.formatMoneyMan(eventCost, 0);
			//80
			self.diag_nenkin_txt_sm_event = Util.formatMoneyMan(Logic06.vShikin[80 + index], 0);

			//ローン残高（引退時）
			var loanzandaka = Calc.mLogic05.vLA[MC.age_taisyoku_hon + index];
			s = Util.formatMoneyMan(loanzandaka, 0);
			//85
			self.diag_nenkin_txt_sm_loan = Util.formatMoneyMan(Logic06.vShikin[85 + index], 0);

			//生涯資金収支
			var kekka = zandaka + taisyoku + totalSeikatsuMinus - eventCost - loanzandaka;
			s = Util.formatMoneyMan(kekka, 0);
			//90
			self.diag_nenkin_txt_total_living = Util.formatMoneyMan(Logic06.vShikin[90 + index], 0);

			var g_pinHon = DB.get_mc_calc(false);
			var g_pinHai = DB.get_mc_calc(true);

			//ラベル・レイアウトの表示
			self.diag_nenkin_row_to_3 = false;


			//値のセット

			var value;
			value = 0;

			// 60~64
			value = 0;
			for (var i = 60; i < 65; i++) {
				value += Logic03.vNenkin_hon[index + i];
			}
			value /= 5;
			if (value > 0) {
				s = Util.formatMoneyMan(value, 0);
				s += "<br\>";
				s += "(月額" + Util.formatMoneyMan(value / 12, 2) + ")";
				self.diag_nenkin_txt_bu_hon = s;
			} else {
				self.diag_nenkin_txt_bu_hon = "-";
			}
			// 65~69
			value = 0;
			for (var i = 65; i < 70; i++) {
				value += Logic03.vNenkin_hon[index + i];
			}
			value /= 5;
			if (value > 0) {
				s = Util.formatMoneyMan(value, 0);
				s += "<br\>";
				s += "(月額" + Util.formatMoneyMan(value / 12, 2) + ")";
				self.diag_nenkin_txt_65_hon = s;
			} else {
				self.diag_nenkin_txt_65_hon = "-";
			}
			// 70~74
			value = 0;
			for (var i = 70; i < 75; i++) {
				value += Logic03.vNenkin_hon[index + i];
			}
			value /= 5;
			if (value > 0) {
				s = Util.formatMoneyMan(value, 0);
				s += "<br\>";
				s += "(月額" + Util.formatMoneyMan(value / 12, 2) + ")";
				self.diag_nenkin_txt_70_hon = s;
			} else {
				self.diag_nenkin_txt_70_hon = "-";
			}

			if (MC.is_kekkon()) {
				value = 0;

				// 60~64
				value = 0;
				for (var i = 60; i < 65; i++) {
					value += Logic03.vNenkin_hai[index_hai + i];
				}
				value /= 5;
				if (value > 0) {
					s = Util.formatMoneyMan(value, 0);
					s += "<br\>";
					s += "(月額" + Util.formatMoneyMan(value / 12, 2) + ")";
					self.diag_nenkin_txt_bu_hai = s;
				} else {
					self.diag_nenkin_txt_bu_hai = "-";
				}
				// 65~69
				value = 0;
				for (var i = 65; i < 70; i++) {
					value += Calc.L3().vNenkin_hai[index_hai + i];
				}
				value /= 5;
				if (value > 0) {
					s = Util.formatMoneyMan(value, 0);
					s += "<br\>";
					s += "(月額" + Util.formatMoneyMan(value / 12, 2) + ")";
					self.diag_nenkin_txt_65_hai = s;
				} else {
					self.diag_nenkin_txt_65_hai = "-";
				}
				// 70~74
				value = 0;
				for (var i = 70; i < 75; i++) {
					value += Calc.L3().vNenkin_hai[index_hai + i];
				}
				value /= 5;
				if (value > 0) {
					s = Util.formatMoneyMan(value, 0);
					s += "<br\>";
					s += "(月額" + Util.formatMoneyMan(value / 12, 2) + ")";
					self.diag_nenkin_txt_70_hai = s;
				} else {
					self.diag_nenkin_txt_70_hai = "-";
				}

				self.diag_nenkin_hai = true;
			} else {
				self.diag_nenkin_hai = false;
			}

			/******* 2014/01/20 養老・学資保険・収入保障保険について、グラフへの表示対応  start ******/
			var ageC = Math.abs(index - index_hai);

			// ①本人部分開始年齢
			var stAge_hon = Calc.mLogic03.GetIfBubunStAge(false);
			// ②配偶者部分開始年齢
			var stAge_hai = Calc.mLogic03.GetIfBubunStAge(true);
			// ③Ｍａｘ（本人受給開始年齢，配偶者受給開始年齢＋年齢差）
			var stAgeCC = Util.excelMax(Calc.mLogic03.vJyukyuStAge_hon, Calc.mLogic03.vJyukyuStAge_hai + ageC);
			// 将来年金額（本人）
			var vNenkinHon = Logic03.vNenkin_hon;
			// 将来年金額（配偶者）
			var vNenkinHai = Logic03.vNenkin_hai;

			if (MC.is_kekkon()) {
				self.diag_nenkin_row_to_3 = true;
				// ④③時点の将来年金額（本人）＋将来年金額（配偶者）
				var nenkin = vNenkinHon[index + stAgeCC] + vNenkinHai[index_hai + stAgeCC];
				// ⑤④ ÷12
				var nenkinY = nenkin / 12;
// 20160517_Web版lifeplan対応_結合-011_start
//				s = "公的年金の受給開始年齢は、ご本人様" + stAge_hon + "歳・配偶者様" + stAge_hai + "歳となります。<br\>本人が" + stAgeCC + "歳以降、夫婦合わせての受給年金額は年間"
//						+ Util.formatMoneyMan(nenkin, 2) + "（月額" + Util.formatMoneyMan(nenkinY, 2) + "）が見込まれます。";
				s = "公的年金の受給開始年齢は、ご本人さま" + stAge_hon + "歳・配偶者さま" + stAge_hai + "歳となります。";
// 20160517_Web版lifeplan対応_結合-011_end
			} else {
				self.diag_nenkin_row_to_3 = false;
				// ③本人受給開始年齢時点の将来年金額（本人）

				var nenkin = vNenkinHon[index + stAge_hon];
				// ⑤④ ÷12
				var nenkinY = nenkin / 12;
// 20160517_Web版lifeplan対応_結合-011_start
//				s = "公的年金の受給開始年齢は、" + stAge_hon + "歳となります。\n" + String(Calc.mLogic03.vJyukyuStAge_hon)
//						+ "歳以降、受給年金額は年間" + Util.formatMoneyMan(nenkin, 2) + "（月額" + Util.formatMoneyMan(nenkinY, 2) + "）が見込まれます。";
				s = "公的年金の受給開始年齢は、" + stAge_hon + "歳となります。";
// 20160517_Web版lifeplan対応_結合-011_end
			}
			/******* 2014/01/20 養老・学資保険・収入保障保険について、グラフへの表示対応  end ******/

			self.diag_nenkin_txt_info = s;

			var iAgeGap = LPdate.calcAge(MC.get_st_birthday(false), MC.get_st_birthday(true));
			new LIFEPLAN.graph.GraphNenkin().drawGraphNenkin("canvas1", vNenkinHon, vNenkinHai, iAgeGap, MC.is_kekkon());
		};

		return S4;
	})();

	// 公的年金試算ポップアップ
	Scenes.S5 = (function() {
		var self;

		var S5 = function() {
			self = this;
			self.popup_nenkin_col2 = true;
			self.popup_nenkin_col3 = true;
			self.popup_nenkin_col4 = true;
			self.popup_nenkin_col5 = true;
		};

		var p = S5.prototype;

		p.onCreate = function(param) {
			mMC.copy(MC);
			var setsumei_suffix = "様の職務経歴や年齢等を基に推計した公的年金額を表示しています。\<br\>実際の受給額がわかる方は、以下の金額を修正してください。";

			if (param === 0) {
				self.is_hai = false;
				self.popup_nenkin_title = "公的年金受給額（本人）";
				self.popup_nenkin_setsumei = "ご本人" + setsumei_suffix;
			} else {
				self.is_hai = true;
				self.popup_nenkin_title = "公的年金受給額（配偶者）";
				self.popup_nenkin_setsumei = "配偶者" + setsumei_suffix;
			}

			self.popup_nenkin_col2 = true;
			self.popup_nenkin_col3 = true;
			self.popup_nenkin_col4 = true;
			self.popup_nenkin_col5 = true;

			self.update();
		};

		p.update = function() {
			var g_pin = DB.get_mc_calc(self.is_hai);
			var s;
			var index = getIndex(self.is_hai);
			var val1, val2, val3, val4, val5;
			var kiso = Logic03.vKiso_hon;
			var kousei = Logic03.vKousei_hon;
			var kouseiBu = Logic03.vKouseiBu_hon;
			var kouseiTo = Logic03.vKouseiTo_hon;
			var kyousai = Logic03.vKyousai_hon;
			var kyousaiBu = Logic03.vKyousaiBu_hon;
			var kyousaiTo = Logic03.vKyousaiTo_hon;
			var kakyu = Logic03.vKakyu_hon;
			var kakyuTo = Logic03.vKakyuTo_hon;
			var furikae = Logic03.vFurikae_hon;
			var visibleKakyu = Logic03.bVisibleKakyu_hon;
			var visibleFurikae = Logic03.bVisibleFurikae_hon;

			if (self.is_hai) {
				kiso = Logic03.vKiso_hai;
				kousei = Logic03.vKousei_hai;
				kouseiBu = Logic03.vKouseiBu_hai;
				kouseiTo = Logic03.vKouseiTo_hai;
				kyousai = Logic03.vKyousai_hai;
				kyousaiBu = Logic03.vKyousaiBu_hai;
				kyousaiTo = Logic03.vKyousaiTo_hai;
				kakyu = Logic03.vKakyu_hai;
				kakyuTo = Logic03.vKakyuTo_hai;
				furikae = Logic03.vFurikae_hai;
				visibleKakyu = Logic03.bVisibleKakyu_hai;
				visibleFurikae = Logic03.bVisibleFurikae_hai;
			}

			if (g_pin.BubunStAge > 0 && g_pin.has_bu) {
				s = String(g_pin.BubunStAge) + "歳";
				self.popup_nenkin_col2_label = s;

				val2 = self.is_hai ? mMC.save_kose_bu_hai : mMC.save_kose_bu_hon;
				if (val2 === -1) {
					val2 = kouseiBu[g_pin.BubunStAge + index];
				}
				self.popup_nenkin_edit_col2_2 = Module.commafy(val2);

				val3 = self.is_hai ? mMC.save_tai_bu_hai : mMC.save_tai_bu_hon;
				if (val3 === -1) {
					val3 = kyousaiBu[g_pin.BubunStAge + index];
				}
				self.popup_nenkin_edit_col2_3 = Module.commafy(val3);

				//合計
				s = Util.formatMoneyMan(val2 + val3, 2);
				self.popup_nenkin_col2_sum = s;

			} else {
				self.popup_nenkin_col2 = false;
			}
			if (g_pin.JyukyuStAge > 0 && g_pin.has_to) {
				s = String(g_pin.JyukyuStAge) + "歳";
				self.popup_nenkin_col3_label = s;

				val2 = self.is_hai ? mMC.save_kose_to_hai : mMC.save_kose_to_hon;
				if (val2 === -1) {
					val2 = kouseiTo[g_pin.JyukyuStAge + index];
				}
				self.popup_nenkin_edit_col3_2 = Module.commafy(val2);

				val3 = self.is_hai ? mMC.save_tai_to_hai : mMC.save_tai_to_hon;
				if (val3 === -1) {
					val3 = kyousaiTo[g_pin.JyukyuStAge + index];
				}
				self.popup_nenkin_edit_col3_3 = Module.commafy(val3);

				val4 = self.is_hai ? mMC.save_kakyu_to_hai : mMC.save_kakyu_to_hon;
				if (val4 === -1) {
					val4 = kakyuTo[g_pin.JyukyuStAge + index];
				}
				self.popup_nenkin_edit_col3_4 = Module.commafy(val4);

				//合計
				s = Util.formatMoneyMan(val2 + val3 + val4, 2);
				self.popup_nenkin_col3_sum = s;
			} else {
				self.popup_nenkin_col3 = false;
			}

			if (g_pin.has_65) {
				s = "65歳";
				self.popup_nenkin_col4_label = s;

				val1 = self.is_hai ? mMC.save_kiso_65_hai : mMC.save_kiso_65_hon;
				if (val1 === -1) {
					val1 = kiso[65 + index];
				}
				self.popup_nenkin_edit_col4_1 = Module.commafy(val1);

				val2 = self.is_hai ? mMC.save_kose_65_hai : mMC.save_kose_65_hon;
				if (val2 === -1) {
					val2 = kousei[65 + index];
				}
				self.popup_nenkin_edit_col4_2 = Module.commafy(val2);

				val3 = self.is_hai ? mMC.save_tai_65_hai : mMC.save_tai_65_hon;
				if (val3 === -1) {
					val3 = kyousai[65 + index];
				}
				self.popup_nenkin_edit_col4_3 = Module.commafy(val3);

				val4 = self.is_hai ? mMC.save_kakyu_65_hai : mMC.save_kakyu_65_hon;
				if (val4 === -1) {
					val4 = kakyu[65 + index];
				}
				self.popup_nenkin_edit_col4_4 = Module.commafy(val4);

				val5 = self.is_hai ? mMC.save_furikae_65_hai : mMC.save_furikae_65_hon;
				if (val5 === -1) {
					val5 = furikae[65 + index];
				}
				self.popup_nenkin_edit_col4_5 = Module.commafy(val5);

				if (visibleKakyu[0] === true) {
					self.show_popup_nenkin_edit_col4_4 = true;
					self.show_popup_nenkin_txt_col4_4 = false;
					self.align_col4_4 = "right";
				} else {
					self.show_popup_nenkin_edit_col4_4 = false;
					self.show_popup_nenkin_txt_col4_4 = true;
					self.align_col4_4 = "center";
				}

				if (visibleFurikae[0] === true) {
					self.show_popup_nenkin_edit_col4_5 = true;
					self.show_popup_nenkin_txt_col4_5 = false;
					self.align_col4_5 = "right";
				} else {
					self.show_popup_nenkin_edit_col4_5 = false;
					self.show_popup_nenkin_txt_col4_5 = true;
					self.align_col4_5 = "center";
				}
				//合計
				s = Util.formatMoneyMan(val1 + val2 + val3 + val4 + val5, 2);
				self.popup_nenkin_col4_sum = s;
			} else {
				self.popup_nenkin_col4 = false;
			}
			if (g_pin.year_70 > 0 && g_pin.has_70) {
				s = String(g_pin.year_70) + "歳";
				self.popup_nenkin_col5_label = s;

				val1 = self.is_hai ? mMC.save_kiso_70_hai : mMC.save_kiso_70_hon;
				if (val1 === -1) {
					val1 = kiso[70 + index];
				}
				self.popup_nenkin_edit_col5_1 = Module.commafy(val1);

				val2 = self.is_hai ? mMC.save_kose_70_hai : mMC.save_kose_70_hon;
				if (val2 === -1) {
					val2 = kousei[70 + index];
				}
				self.popup_nenkin_edit_col5_2 = Module.commafy(val2);

				val3 = self.is_hai ? mMC.save_tai_70_hai : mMC.save_tai_70_hon;
				if (val3 === -1) {
					val3 = kyousai[70 + index];
				}
				self.popup_nenkin_edit_col5_3 = Module.commafy(val3);

				val4 = self.is_hai ? mMC.save_kakyu_70_hai : mMC.save_kakyu_70_hon;
				if (val4 === -1) {
					val4 = kakyu[70 + index];
				}
				self.popup_nenkin_edit_col5_4 = Module.commafy(val4);

				val5 = self.is_hai ? mMC.save_furikae_70_hai : mMC.save_furikae_70_hon;
				if (val5 === -1) {
					val5 = furikae[70 + index];
				}
				self.popup_nenkin_edit_col5_5 = Module.commafy(val5);

				if (visibleKakyu[1] === true) {
					self.show_popup_nenkin_edit_col5_4 = true;
					self.show_popup_nenkin_txt_col5_4 = false;
					self.align_col5_4 = "right";
				} else {
					self.show_popup_nenkin_edit_col5_4 = false;
					self.show_popup_nenkin_txt_col5_4 = true;
					self.align_col5_4 = "center";
				}

				if (visibleFurikae[1] === true) {
					self.show_popup_nenkin_edit_col5_5 = true;
					self.show_popup_nenkin_txt_col5_5 = false;
					self.align_col5_5 = "right";
				} else {
					self.show_popup_nenkin_edit_col5_5 = false;
					self.show_popup_nenkin_txt_col5_5 = true;
					self.align_col5_5 = "center";
				}

				//合計

				s = Util.formatMoneyMan(val1 + val2 + val3 + val4 + val5, 2);
				self.popup_nenkin_col5_sum = s;
			} else {
				self.popup_nenkin_col5 = false;
			}
		};

		p.onCalcFinish = function(event) {
			var outer = event.target.outerHTML;
			var id;
			var value = event.target.value;

			if (~outer.indexOf('popup_nenkin_edit_col2_2')) {
				id = 'popup_nenkin_edit_col2_2';
			} else if (~outer.indexOf('popup_nenkin_edit_col2_3')) {
				id = 'popup_nenkin_edit_col2_3';
			} else if (~outer.indexOf('popup_nenkin_edit_col3_2')) {
				id = 'popup_nenkin_edit_col3_2';
			} else if (~outer.indexOf('popup_nenkin_edit_col3_3')) {
				id = 'popup_nenkin_edit_col3_3';
			} else if (~outer.indexOf('popup_nenkin_edit_col3_4')) {
				id = 'popup_nenkin_edit_col3_4';
			} else if (~outer.indexOf('popup_nenkin_edit_col4_1')) {
				id = 'popup_nenkin_edit_col4_1';
			} else if (~outer.indexOf('popup_nenkin_edit_col4_2')) {
				id = 'popup_nenkin_edit_col4_2';
			} else if (~outer.indexOf('popup_nenkin_edit_col4_3')) {
				id = 'popup_nenkin_edit_col4_3';
			} else if (~outer.indexOf('popup_nenkin_edit_col4_4')) {
				id = 'popup_nenkin_edit_col4_4';
			} else if (~outer.indexOf('popup_nenkin_edit_col4_5')) {
				id = 'popup_nenkin_edit_col4_5';
			} else if (~outer.indexOf('popup_nenkin_edit_col5_1')) {
				id = 'popup_nenkin_edit_col5_1';
			} else if (~outer.indexOf('popup_nenkin_edit_col5_2')) {
				id = 'popup_nenkin_edit_col5_2';
			} else if (~outer.indexOf('popup_nenkin_edit_col5_3')) {
				id = 'popup_nenkin_edit_col5_3';
			} else if (~outer.indexOf('popup_nenkin_edit_col5_4')) {
				id = 'popup_nenkin_edit_col5_4';
			} else if (~outer.indexOf('popup_nenkin_edit_col5_5')) {
				id = 'popup_nenkin_edit_col5_5';
			}

			while (String(value).match(/[^0-9]+/)) {
				value = value.replace(/[^0-9]+/, '');
			}
			value = (Number(value) > 9999900) ? 9999900 : Number(value);
			if (self.is_hai) {
				switch (id) {
					case "popup_nenkin_edit_col2_2":
						mMC.save_kose_bu_hai = value;
						self.update();
						break;
					case "popup_nenkin_edit_col2_3":
						mMC.save_tai_bu_hai = value;
						self.update();
						break;
					case "popup_nenkin_edit_col3_2":
						mMC.save_kose_to_hai = value;
						self.update();
						break;
					case "popup_nenkin_edit_col3_3":
						mMC.save_tai_to_hai = value;
						self.update();
						break;
					case "popup_nenkin_edit_col3_4":
						mMC.save_kakyu_to_hai = value;
						self.update();
						break;
					case "popup_nenkin_edit_col4_1":
						mMC.save_kiso_65_hai = value;
						self.update();
						break;
					case "popup_nenkin_edit_col4_2":
						mMC.save_kose_65_hai = value;
						self.update();
						break;
					case "popup_nenkin_edit_col4_3":
						mMC.save_tai_65_hai = value;
						self.update();
						break;
					case "popup_nenkin_edit_col4_4":
						mMC.save_kakyu_65_hai = value;
						self.update();
						break;
					case "popup_nenkin_edit_col4_5":
						mMC.save_furikae_65_hai = value;
						self.update();
						break;
					case "popup_nenkin_edit_col5_1":
						mMC.save_kiso_70_hai = value;
						self.update();
						break;
					case "popup_nenkin_edit_col5_2":
						mMC.save_kose_70_hai = value;
						self.update();
						break;
					case "popup_nenkin_edit_col5_3":
						mMC.save_tai_70_hai = value;
						self.update();
						break;
					case "popup_nenkin_edit_col5_4":
						mMC.save_kakyu_70_hai = value;
						self.update();
						break;
					case "popup_nenkin_edit_col5_5":
						mMC.save_furikae_70_hai = value;
						self.update();
						break;
				}
			} else {
				switch (id) {
					case "popup_nenkin_edit_col2_2":
						mMC.save_kose_bu_hon = value;
						self.update();
						break;
					case "popup_nenkin_edit_col2_3":
						mMC.save_tai_bu_hon = value;
						self.update();
						break;
					case "popup_nenkin_edit_col3_2":
						mMC.save_kose_to_hon = value;
						self.update();
						break;
					case "popup_nenkin_edit_col3_3":
						mMC.save_tai_to_hon = value;
						self.update();
						break;
					case "popup_nenkin_edit_col3_4":
						mMC.save_kakyu_to_hon = value;
						self.update();
						break;
					case "popup_nenkin_edit_col4_1":
						mMC.save_kiso_65_hon = value;
						self.update();
						break;
					case "popup_nenkin_edit_col4_2":
						mMC.save_kose_65_hon = value;
						self.update();
						break;
					case "popup_nenkin_edit_col4_3":
						mMC.save_tai_65_hon = value;
						self.update();
						break;
					case "popup_nenkin_edit_col4_4":
						mMC.save_kakyu_65_hon = value;
						self.update();
						break;
					case "popup_nenkin_edit_col4_5":
						mMC.save_furikae_65_hon = value;
						self.update();
						break;
					case "popup_nenkin_edit_col5_1":
						mMC.save_kiso_70_hon = value;
						self.update();
						break;
					case "popup_nenkin_edit_col5_2":
						mMC.save_kose_70_hon = value;
						self.update();
						break;
					case "popup_nenkin_edit_col5_3":
						mMC.save_tai_70_hon = value;
						self.update();
						break;
					case "popup_nenkin_edit_col5_4":
						mMC.save_kakyu_70_hon = value;
						self.update();
						break;
					case "popup_nenkin_edit_col5_5":
						mMC.save_furikae_70_hon = value;
						self.update();
						break;
				}
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


	var ViewModel = function() {
		//weapperクラス変更 上部プラン別画像表示
		this.modelClass = ko.observable(m_modelClass);
		this.show_syokugyo_hai = true;
		this.show_modal = ko.observable(m_show_modal);
		this.simulation1 = ko.observable(simulation1);
		this.setting_tab1_basic = ko.observable(setting_tab1_basic);
		this.setting_tab2_job = ko.observable(setting_tab2_job);
		this.setting_tab3_house = ko.observable(setting_tab3_house);
		this.setting_tab4_education = ko.observable(setting_tab4_education);
		this.setting_tab5_insurance = ko.observable(setting_tab5_insurance);

		// scene-0: S0
		this.job1_tab1_2 = ko.observable(S0.job1_tab1_2);
		this.job2_tab2_2 = ko.observable(S0.job2_tab2_2);
		this.job_left_syokugyo_row = ko.observable(S0.job_left_syokugyo_row);
		this.job1_txt_syokugyo = ko.observable(S0.job1_txt_syokugyo);
		this.job_left_syugyo_row = ko.observable(S0.job_left_syugyo_row);
		this.job1_txt_syugyo = ko.observable(S0.job1_txt_syugyo);
		this.job_left_taisyoku_row = ko.observable(S0.job_left_taisyoku_row);
		this.job1_txt_taisyoku_age = ko.observable(S0.job1_txt_taisyoku_age);
		this.job_left_gyosyu_row = ko.observable(S0.job_left_gyosyu_row);
		this.job1_txt_gyosyu = ko.observable(S0.job1_txt_gyosyu);
		this.job_left_syokusyu_row = ko.observable(S0.job_left_syokusyu_row);
		this.job1_txt_syokusyu = ko.observable(S0.job1_txt_syokusyu);
		this.job_left_kibo_row = ko.observable(S0.job_left_kibo_row);
		this.job1_txt_kibo = ko.observable(S0.job1_txt_kibo);
		this.job_left_nensyu_row = ko.observable(S0.job_left_nensyu_row);
		this.job1_txt_nensyu = ko.observable(S0.job1_txt_nensyu);
		this.job_left_ra_nensyu_row = ko.observable(S0.job_left_ra_nensyu_row);
		this.S0_job1_edit_ra_nensyu = ko.observable(S0.job1_edit_ra_nensyu);
		this.job_left_kinmu_row = ko.observable(S0.job_left_kinmu_row);
		this.job1_text_kinmu = ko.observable(S0.job1_text_kinmu);
		this.job_left_kakosyugyo_row = ko.observable(S0.job_left_kakosyugyo_row);
		this.job1_txt_kakosyugyo_age = ko.observable(S0.job1_txt_kakosyugyo_age);
		this.job_left_kakotaisyoku_row = ko.observable(S0.job_left_kakotaisyoku_row);
		this.job1_txt_kakotaisyoku_age = ko.observable(S0.job1_txt_kakotaisyoku_age);
		this.job_left_sm_tai_nensyu_row = ko.observable(S0.job_left_sm_tai_nensyu_row);
		this.job1_txt_sm_tai_nensyu = ko.observable(S0.job1_txt_sm_tai_nensyu);
		this.job_right_taisyoku_row = ko.observable(S0.job_right_taisyoku_row);
		this.job2_txt_age_taisyoku = ko.observable(S0.job2_txt_age_taisyoku);
		this.job_right_sm_taisyoku_row = ko.observable(S0.job_right_sm_taisyoku_row);
		this.job2_txt_sm_taisyoku = ko.observable(S0.job2_txt_sm_taisyoku);
		this.job_right_saisyusyoku_row = ko.observable(S0.job_right_saisyusyoku_row);
		this.job2_txt_saisyusyoku = ko.observable(S0.job2_txt_saisyusyoku);
		this.job1_txt_income = ko.observable(S0.job1_txt_income);
		this.linear_btn_popup_job1 = ko.observable(S0.linear_btn_popup_job1);
		this.job_right_saisyusyoku_popup = ko.observable(S0.job_right_saisyusyoku_popup);

		// scene-1: S1
		this.popup_job1_txt_syokugyo = ko.observable(S1.popup_job1_txt_syokugyo);
		this.popup_job1_txt_syugyo = ko.observable(S1.popup_job1_txt_syugyo);
		this.job1_spn_gyosyu = ko.observableArray(S1.job1_spn_gyosyu);
		this.job1_spn_gyosyu_v = ko.observable(S1.job1_spn_gyosyu_v);
		this.job1_spn_syokusyu = ko.observableArray(S1.job1_spn_syokusyu);
		this.job1_spn_syokusyu_v = ko.observable(S1.job1_spn_syokusyu_v);
		this.job1_spn_kibo = ko.observableArray(S1.job1_spn_kibo);
		this.job1_spn_kibo_v = ko.observable(S1.job1_spn_kibo_v);
		this.job1_edit_sm_nensyu = ko.observable(S1.job1_edit_sm_nensyu);
		this.popup_job1_title = ko.observable(S1.popup_job1_title);
		this.popup_job1_txt_taisyoku_age = ko.observable(S1.popup_job1_txt_taisyoku_age);
		this.job1_edit_ra_nensyu = ko.observable(S1.job1_edit_ra_nensyu);
		this.job1_btn_kinmu_1 = ko.observable(S1.job1_btn_kinmu_1);
		this.job1_btn_kinmu_2 = ko.observable(S1.job1_btn_kinmu_2);
		this.job1_btn_kinmu_3 = ko.observable(S1.job1_btn_kinmu_3);
		this.job1_spn_age_kakosyugyo = ko.observableArray(S1.job1_spn_age_kakosyugyo);
		this.job1_spn_age_kakosyugyo_v = ko.observable(S1.job1_spn_age_kakosyugyo_v);
		this.job1_spn_age_kakotaisyoku = ko.observableArray(S1.job1_spn_age_kakotaisyoku);
		this.job1_spn_age_kakotaisyoku_v = ko.observable(S1.job1_spn_age_kakotaisyoku_v);
		this.job1_edit_sm_tai_nensyu = ko.observable(S1.job1_edit_sm_tai_nensyu);
		this.popup_job1_syokugyo_row = ko.observable(S1.popup_job1_syokugyo_row);
		this.popup_job1_txt_syugyo_row = ko.observable(S1.popup_job1_txt_syugyo_row);
		this.popup_job1_taisyoku_row = ko.observable(S1.popup_job1_taisyoku_row);
		this.popup_job1_gyosyu_row = ko.observable(S1.popup_job1_gyosyu_row);
		this.popup_job1_syokusyu_row = ko.observable(S1.popup_job1_syokusyu_row);
		this.popup_job1_kibo_row = ko.observable(S1.popup_job1_kibo_row);
		this.popup_job1_sm_nensyu_row = ko.observable(S1.popup_job1_sm_nensyu_row);
		this.popup_job1_ra_nensyu_row = ko.observable(S1.popup_job1_ra_nensyu_row);
		this.popup_job1_kinmu_row = ko.observable(S1.popup_job1_kinmu_row);
		this.popup_job1_kakosyugyo_row = ko.observable(S1.popup_job1_kakosyugyo_row);
		this.popup_job1_kakotaisyoku_row = ko.observable(S1.popup_job1_kakotaisyoku_row);
		this.popup_job1_sm_tai_nensyu_row = ko.observable(S1.popup_job1_sm_tai_nensyu_row);
		this.reference_value = ko.observable(S1.reference_value);



		// modal-4
		this.diag_nenkin_txt_bu_hon = ko.observable(S4.diag_nenkin_txt_bu_hon);
		this.diag_nenkin_txt_65_hon = ko.observable(S4.diag_nenkin_txt_65_hon);
		this.diag_nenkin_txt_70_hon = ko.observable(S4.diag_nenkin_txt_70_hon);
		this.diag_nenkin_txt_bu_hai = ko.observable(S4.diag_nenkin_txt_bu_hai);
		this.diag_nenkin_txt_65_hai = ko.observable(S4.diag_nenkin_txt_65_hai);
		this.diag_nenkin_txt_70_hai = ko.observable(S4.diag_nenkin_txt_70_hai);
		this.diag_nenkin_txt_tai_zandaka = ko.observable(S4.diag_nenkin_txt_tai_zandaka);
		this.diag_nenkin_txt_sm_taisyoku = ko.observable(S4.diag_nenkin_txt_sm_taisyoku);
		this.diag_nenkin_txt_basic_income = ko.observable(S4.diag_nenkin_txt_basic_income);
		this.diag_nenkin_txt_sm_event = ko.observable(S4.diag_nenkin_txt_sm_event);
		this.diag_nenkin_txt_sm_loan = ko.observable(S4.diag_nenkin_txt_sm_loan);
		this.diag_nenkin_txt_total_living = ko.observable(S4.diag_nenkin_txt_total_living);
		this.diag_nenkin_txt_info = ko.observable(S4.diag_nenkin_txt_info);
		this.diag_nenkin_row_to_3 = ko.observable(S4.diag_nenkin_row_to_3);
		this.class_expenses_1 = ko.observable(S4.class_expenses_1);
		this.class_expenses_2 = ko.observable(S4.class_expenses_2);
		this.class_expenses_3 = ko.observable(S4.class_expenses_3);
		this.class_expenses_4 = ko.observable(S4.class_expenses_4);
		this.class_expenses_5 = ko.observable(S4.class_expenses_5);
		this.class_expenses_6 = ko.observable(S4.class_expenses_6);

		// modal-5
		this.popup_nenkin_title = ko.observable(S5.popup_nenkin_title);
		this.popup_nenkin_setsumei = ko.observable(S5.popup_nenkin_setsumei);
		this.popup_nenkin_col2_label = ko.observable(S5.popup_nenkin_col2_label);
		this.popup_nenkin_col3_label = ko.observable(S5.popup_nenkin_col3_label);
		this.popup_nenkin_col4_label = ko.observable(S5.popup_nenkin_col4_label);
		this.popup_nenkin_col5_label = ko.observable(S5.popup_nenkin_col5_label);
		this.popup_nenkin_col2_sum = ko.observable(S5.popup_nenkin_col2_sum);
		this.popup_nenkin_col3_sum = ko.observable(S5.popup_nenkin_col3_sum);
		this.popup_nenkin_col4_sum = ko.observable(S5.popup_nenkin_col4_sum);
		this.popup_nenkin_col5_sum = ko.observable(S5.popup_nenkin_col5_sum);
		this.popup_nenkin_edit_col2_2 = ko.observable(S5.popup_nenkin_edit_col2_2);
		this.popup_nenkin_edit_col2_3 = ko.observable(S5.popup_nenkin_edit_col2_3);
		this.popup_nenkin_edit_col3_2 = ko.observable(S5.popup_nenkin_edit_col3_2);
		this.popup_nenkin_edit_col3_3 = ko.observable(S5.popup_nenkin_edit_col3_3);
		this.popup_nenkin_edit_col3_4 = ko.observable(S5.popup_nenkin_edit_col3_4);
		this.popup_nenkin_edit_col4_1 = ko.observable(S5.popup_nenkin_edit_col4_1);
		this.popup_nenkin_edit_col4_2 = ko.observable(S5.popup_nenkin_edit_col4_2);
		this.popup_nenkin_edit_col4_3 = ko.observable(S5.popup_nenkin_edit_col4_3);
		this.popup_nenkin_edit_col4_4 = ko.observable(S5.popup_nenkin_edit_col4_4);
		this.popup_nenkin_edit_col4_5 = ko.observable(S5.popup_nenkin_edit_col4_5);
		this.popup_nenkin_edit_col5_1 = ko.observable(S5.popup_nenkin_edit_col5_1);
		this.popup_nenkin_edit_col5_2 = ko.observable(S5.popup_nenkin_edit_col5_2);
		this.popup_nenkin_edit_col5_3 = ko.observable(S5.popup_nenkin_edit_col5_3);
		this.popup_nenkin_edit_col5_4 = ko.observable(S5.popup_nenkin_edit_col5_4);
		this.popup_nenkin_edit_col5_5 = ko.observable(S5.popup_nenkin_edit_col5_5);
		this.show_popup_nenkin_edit_col4_4 = ko.observable(S5.show_popup_nenkin_edit_col4_4);
		this.show_popup_nenkin_edit_col5_4 = ko.observable(S5.show_popup_nenkin_edit_col5_4);
		this.show_popup_nenkin_txt_col4_4 = ko.observable(S5.show_popup_nenkin_txt_col4_4);
		this.show_popup_nenkin_txt_col5_4 = ko.observable(S5.show_popup_nenkin_txt_col5_4);
		this.show_popup_nenkin_edit_col4_5 = ko.observable(S5.show_popup_nenkin_edit_col4_5);
		this.show_popup_nenkin_edit_col5_5 = ko.observable(S5.show_popup_nenkin_edit_col5_5);
		this.show_popup_nenkin_txt_col4_5 = ko.observable(S5.show_popup_nenkin_txt_col4_5);
		this.show_popup_nenkin_txt_col5_5 = ko.observable(S5.show_popup_nenkin_txt_col5_5);
		this.popup_nenkin_col2 = ko.observable(S5.popup_nenkin_col2);
		this.popup_nenkin_col3 = ko.observable(S5.popup_nenkin_col3);
		this.popup_nenkin_col4 = ko.observable(S5.popup_nenkin_col4);
		this.popup_nenkin_col5 = ko.observable(S5.popup_nenkin_col5);
		this.align_col4_4 = ko.observable(S5.align_col4_4);
		this.align_col5_4 = ko.observable(S5.align_col5_4);
		this.align_col4_5 = ko.observable(S5.align_col4_5);
		this.align_col5_5 = ko.observable(S5.align_col5_5);



		// scene-1: S3
		this.job1_spn_income1_to = ko.observableArray(S3.job1_spn_income1_to);			// その他収入１開始 リスト
		this.job1_spn_income1_to_v = ko.observable(S3.job1_spn_income1_to_v);				// その他収入１開始 初期値
		this.job1_spn_income1_from = ko.observable(S3.job1_spn_income1_from);				// その他収入１終了 リスト
		this.job1_spn_income1_from_v = ko.observable(S3.job1_spn_income1_from_v);		// その他収入１終了 初期値
		this.job1_spn_income2_to = ko.observableArray(S3.job1_spn_income2_to);			// その他収入２開始 リスト
		this.job1_spn_income2_to_v = ko.observable(S3.job1_spn_income2_to_v);				// その他収入２開始 初期値
		this.job1_spn_income2_from = ko.observable(S3.job1_spn_income2_from);				// その他収入２終了 リスト
		this.job1_spn_income2_from_v = ko.observable(S3.job1_spn_income2_from_v);		// その他収入２終了 初期値
		this.job1_spn_income3_to = ko.observableArray(S3.job1_spn_income3_to);			// その他収入３開始 リスト
		this.job1_spn_income3_to_v = ko.observable(S3.job1_spn_income3_to_v);				// その他収入３開始 初期値
		this.job1_spn_income3_from = ko.observable(S3.job1_spn_income3_from);				// その他収入３終了 リスト
		this.job1_spn_income3_from_v = ko.observable(S3.job1_spn_income3_from_v);		// その他収入３終了 初期値
		this.job1_spn_income1 = ko.observable(S3.job1_spn_income1);									// その他収入１金額
		this.job1_spn_income2 = ko.observable(S3.job1_spn_income2);									// その他収入２金額
		this.job1_spn_income3 = ko.observable(S3.job1_spn_income3);									// その他収入３金額


		// scene-2: S2
		this.job2_spn_age_taisyoku = ko.observable(S2.job2_spn_age_taisyoku);
		this.job2_spn_age_taisyoku_v = ko.observable(S2.job2_spn_age_taisyoku_v);
		this.job2_spn_age_saisyusyoku_st = ko.observable(S2.job2_spn_age_saisyusyoku_st);
		this.job2_spn_age_saisyusyoku_st_v = ko.observable(S2.job2_spn_age_saisyusyoku_st_v);
		this.job2_spn_age_saisyusyoku_end = ko.observable(S2.job2_spn_age_saisyusyoku_end);
		this.job2_spn_age_saisyusyoku_end_v = ko.observable(S2.job2_spn_age_saisyusyoku_end_v);
		this.job2_spn_taisyoku = ko.observable(S2.job2_spn_taisyoku);
		this.job2_spn_saisyu_income = ko.observable(S2.job2_spn_saisyu_income);
		this.popup_job2_title = ko.observable(S2.popup_job2_title);
		this.popup_job2_taisyoku_row = ko.observable(S2.popup_job2_taisyoku_row);
		this.popup_job2_sm_taisyoku_row = ko.observable(S2.popup_job2_sm_taisyoku_row);
		this.popup_job2_age_saisyusyoku_st_row = ko.observable(S2.popup_job2_age_saisyusyoku_st_row);
		this.popup_job2_age_saisyusyoku_end_row = ko.observable(S2.popup_job2_age_saisyusyoku_end_row);
		this.popup_job2_sm_saisyu_income_row = ko.observable(S2.popup_job2_sm_saisyu_income_row);


		this.setData = function() {
			//weapperクラス変更 上部プラン別画像表示
			this.modelClass(m_modelClass);
			this.simulation1(simulation1);
			this.setting_tab1_basic(setting_tab1_basic);
			this.setting_tab2_job(setting_tab2_job);
			this.setting_tab3_house(setting_tab3_house);
			this.setting_tab4_education(setting_tab4_education);
			this.setting_tab5_insurance(setting_tab5_insurance);

			// scene-0: S0
			this.job1_tab1_2(S0.job1_tab1_2);
			this.job2_tab2_2(S0.job2_tab2_2);
			this.job_left_syokugyo_row(S0.job_left_syokugyo_row);
			this.job1_txt_syokugyo(S0.job1_txt_syokugyo);
			this.job_left_syugyo_row(S0.job_left_syugyo_row);
			this.job1_txt_syugyo(S0.job1_txt_syugyo);
			this.job_left_taisyoku_row(S0.job_left_taisyoku_row);
			this.job1_txt_taisyoku_age(S0.job1_txt_taisyoku_age);
			this.job_left_gyosyu_row(S0.job_left_gyosyu_row);
			this.job1_txt_gyosyu(S0.job1_txt_gyosyu);
			this.job_left_syokusyu_row(S0.job_left_syokusyu_row);
			this.job1_txt_syokusyu(S0.job1_txt_syokusyu);
			this.job_left_kibo_row(S0.job_left_kibo_row);
			this.job1_txt_kibo(S0.job1_txt_kibo);
			this.job_left_nensyu_row(S0.job_left_nensyu_row);
			this.job1_txt_nensyu(S0.job1_txt_nensyu);
			this.job_left_ra_nensyu_row(S0.job_left_ra_nensyu_row);
			this.S0_job1_edit_ra_nensyu(S0.job1_edit_ra_nensyu);
			this.job_left_kinmu_row(S0.job_left_kinmu_row);
			this.job1_text_kinmu(S0.job1_text_kinmu);
			this.job_left_kakosyugyo_row(S0.job_left_kakosyugyo_row);
			this.job1_txt_kakosyugyo_age(S0.job1_txt_kakosyugyo_age);
			this.job_left_kakotaisyoku_row(S0.job_left_kakotaisyoku_row);
			this.job1_txt_kakotaisyoku_age(S0.job1_txt_kakotaisyoku_age);
			this.job_left_sm_tai_nensyu_row(S0.job_left_sm_tai_nensyu_row);
			this.job1_txt_sm_tai_nensyu(S0.job1_txt_sm_tai_nensyu);
			this.job_right_taisyoku_row(S0.job_right_taisyoku_row);
			this.job2_txt_age_taisyoku(S0.job2_txt_age_taisyoku);
			this.job_right_sm_taisyoku_row(S0.job_right_sm_taisyoku_row);
			this.job2_txt_sm_taisyoku(S0.job2_txt_sm_taisyoku);
			this.job_right_saisyusyoku_row(S0.job_right_saisyusyoku_row);
			this.job2_txt_saisyusyoku(S0.job2_txt_saisyusyoku);
			this.job1_txt_income(S0.job1_txt_income);
			this.linear_btn_popup_job1(S0.linear_btn_popup_job1);
			this.job_right_saisyusyoku_popup(S0.job_right_saisyusyoku_popup);

			// S1
			this.popup_job1_txt_syokugyo(S1.popup_job1_txt_syokugyo);
			this.popup_job1_txt_syugyo(S1.popup_job1_txt_syugyo);
			this.job1_spn_gyosyu(S1.job1_spn_gyosyu);
			this.job1_spn_gyosyu_v(S1.job1_spn_gyosyu_v);
			this.job1_spn_syokusyu(S1.job1_spn_syokusyu);
			this.job1_spn_syokusyu_v(S1.job1_spn_syokusyu_v);
			this.job1_spn_kibo(S1.job1_spn_kibo);
			this.job1_spn_kibo_v(S1.job1_spn_kibo_v);
			this.job1_edit_sm_nensyu(S1.job1_edit_sm_nensyu);
			this.popup_job1_title(S1.popup_job1_title);
			this.popup_job1_txt_taisyoku_age(S1.popup_job1_txt_taisyoku_age);
			this.job1_edit_ra_nensyu(S1.job1_edit_ra_nensyu);
			this.job1_btn_kinmu_1(S1.job1_btn_kinmu_1);
			this.job1_btn_kinmu_2(S1.job1_btn_kinmu_2);
			this.job1_btn_kinmu_3(S1.job1_btn_kinmu_3);
			this.job1_spn_age_kakosyugyo(S1.job1_spn_age_kakosyugyo);
			this.job1_spn_age_kakosyugyo_v(S1.job1_spn_age_kakosyugyo_v);
			this.job1_spn_age_kakotaisyoku(S1.job1_spn_age_kakotaisyoku);
			this.job1_spn_age_kakotaisyoku_v(S1.job1_spn_age_kakotaisyoku_v);
			this.job1_edit_sm_tai_nensyu(S1.job1_edit_sm_tai_nensyu);
			this.popup_job1_syokugyo_row(S1.popup_job1_syokugyo_row);
			this.popup_job1_txt_syugyo_row(S1.popup_job1_txt_syugyo_row);
			this.popup_job1_taisyoku_row(S1.popup_job1_taisyoku_row);
			this.popup_job1_gyosyu_row(S1.popup_job1_gyosyu_row);
			this.popup_job1_syokusyu_row(S1.popup_job1_syokusyu_row);
			this.popup_job1_kibo_row(S1.popup_job1_kibo_row);
			this.popup_job1_sm_nensyu_row(S1.popup_job1_sm_nensyu_row);
			this.popup_job1_ra_nensyu_row(S1.popup_job1_ra_nensyu_row);
			this.popup_job1_kinmu_row(S1.popup_job1_kinmu_row);
			this.popup_job1_kakosyugyo_row(S1.popup_job1_kakosyugyo_row);
			this.popup_job1_kakotaisyoku_row(S1.popup_job1_kakotaisyoku_row);
			this.popup_job1_sm_tai_nensyu_row(S1.popup_job1_sm_tai_nensyu_row);
			this.reference_value(S1.reference_value);



			// 変わったデータをバインドに入れ直す
			this.job1_txt_income(S0.job1_txt_income);

			// modal-4
			this.diag_nenkin_txt_bu_hon(S4.diag_nenkin_txt_bu_hon);
			this.diag_nenkin_txt_65_hon(S4.diag_nenkin_txt_65_hon);
			this.diag_nenkin_txt_70_hon(S4.diag_nenkin_txt_70_hon);
			this.diag_nenkin_txt_bu_hai(S4.diag_nenkin_txt_bu_hai);
			this.diag_nenkin_txt_65_hai(S4.diag_nenkin_txt_65_hai);
			this.diag_nenkin_txt_70_hai(S4.diag_nenkin_txt_70_hai);
			this.diag_nenkin_txt_tai_zandaka(S4.diag_nenkin_txt_tai_zandaka);
			this.diag_nenkin_txt_sm_taisyoku(S4.diag_nenkin_txt_sm_taisyoku);
			this.diag_nenkin_txt_basic_income(S4.diag_nenkin_txt_basic_income);
			this.diag_nenkin_txt_sm_event(S4.diag_nenkin_txt_sm_event);
			this.diag_nenkin_txt_sm_loan(S4.diag_nenkin_txt_sm_loan);
			this.diag_nenkin_txt_total_living(S4.diag_nenkin_txt_total_living);
			this.diag_nenkin_txt_info(S4.diag_nenkin_txt_info);
			this.diag_nenkin_row_to_3(S4.diag_nenkin_row_to_3);
			this.class_expenses_1(S4.class_expenses_1);
			this.class_expenses_2(S4.class_expenses_2);
			this.class_expenses_3(S4.class_expenses_3);
			this.class_expenses_4(S4.class_expenses_4);
			this.class_expenses_5(S4.class_expenses_5);
			this.class_expenses_6(S4.class_expenses_6);
			// modal-5
			this.popup_nenkin_title(S5.popup_nenkin_title);
			this.popup_nenkin_setsumei(S5.popup_nenkin_setsumei);
			this.popup_nenkin_col2_label(S5.popup_nenkin_col2_label);
			this.popup_nenkin_col3_label(S5.popup_nenkin_col3_label);
			this.popup_nenkin_col4_label(S5.popup_nenkin_col4_label);
			this.popup_nenkin_col5_label(S5.popup_nenkin_col5_label);
			this.popup_nenkin_col2_sum(S5.popup_nenkin_col2_sum);
			this.popup_nenkin_col3_sum(S5.popup_nenkin_col3_sum);
			this.popup_nenkin_col4_sum(S5.popup_nenkin_col4_sum);
			this.popup_nenkin_col5_sum(S5.popup_nenkin_col5_sum);
			this.popup_nenkin_edit_col2_2(S5.popup_nenkin_edit_col2_2);
			this.popup_nenkin_edit_col2_3(S5.popup_nenkin_edit_col2_3);
			this.popup_nenkin_edit_col3_2(S5.popup_nenkin_edit_col3_2);
			this.popup_nenkin_edit_col3_3(S5.popup_nenkin_edit_col3_3);
			this.popup_nenkin_edit_col3_4(S5.popup_nenkin_edit_col3_4);
			this.popup_nenkin_edit_col4_1(S5.popup_nenkin_edit_col4_1);
			this.popup_nenkin_edit_col4_2(S5.popup_nenkin_edit_col4_2);
			this.popup_nenkin_edit_col4_3(S5.popup_nenkin_edit_col4_3);
			this.popup_nenkin_edit_col4_4(S5.popup_nenkin_edit_col4_4);
			this.popup_nenkin_edit_col4_5(S5.popup_nenkin_edit_col4_5);
			this.popup_nenkin_edit_col5_1(S5.popup_nenkin_edit_col5_1);
			this.popup_nenkin_edit_col5_2(S5.popup_nenkin_edit_col5_2);
			this.popup_nenkin_edit_col5_3(S5.popup_nenkin_edit_col5_3);
			this.popup_nenkin_edit_col5_4(S5.popup_nenkin_edit_col5_4);
			this.popup_nenkin_edit_col5_5(S5.popup_nenkin_edit_col5_5);
			this.show_popup_nenkin_edit_col4_4(S5.show_popup_nenkin_edit_col4_4);
			this.show_popup_nenkin_edit_col5_4(S5.show_popup_nenkin_edit_col5_4);
			this.show_popup_nenkin_txt_col4_4(S5.show_popup_nenkin_txt_col4_4);
			this.show_popup_nenkin_txt_col5_4(S5.show_popup_nenkin_txt_col5_4);
			this.show_popup_nenkin_edit_col4_5(S5.show_popup_nenkin_edit_col4_5);
			this.show_popup_nenkin_edit_col5_5(S5.show_popup_nenkin_edit_col5_5);
			this.show_popup_nenkin_txt_col4_5(S5.show_popup_nenkin_txt_col4_5);
			this.show_popup_nenkin_txt_col5_5(S5.show_popup_nenkin_txt_col5_5);
			this.popup_nenkin_col2(S5.popup_nenkin_col2);
			this.popup_nenkin_col3(S5.popup_nenkin_col3);
			this.popup_nenkin_col4(S5.popup_nenkin_col4);
			this.popup_nenkin_col5(S5.popup_nenkin_col5);
			this.align_col4_4(S5.align_col4_4);
			this.align_col5_4(S5.align_col5_4);
			this.align_col4_5(S5.align_col4_5);
			this.align_col5_5(S5.align_col5_5);


			// その他情報
			// スピナーの選択肢
			this.job1_spn_income1_to(S3.job1_spn_income1_to);
			this.job1_spn_income1_from(S3.job1_spn_income1_from);
			this.job1_spn_income2_to(S3.job1_spn_income2_to);
			this.job1_spn_income2_from(S3.job1_spn_income2_from);
			this.job1_spn_income3_to(S3.job1_spn_income3_to);
			this.job1_spn_income3_from(S3.job1_spn_income3_from);
			// スピナーの値
			this.job1_spn_income1_to_v(S3.job1_spn_income1_to_v);
			this.job1_spn_income1_from_v(S3.job1_spn_income1_from_v);
			this.job1_spn_income2_to_v(S3.job1_spn_income2_to_v);
			this.job1_spn_income2_from_v(S3.job1_spn_income2_from_v);
			this.job1_spn_income3_to_v(S3.job1_spn_income3_to_v);
			this.job1_spn_income3_from_v(S3.job1_spn_income3_from_v);
			// テキストボックスの値
			this.job1_spn_income1(S3.job1_spn_income1);
			this.job1_spn_income2(S3.job1_spn_income2);
			this.job1_spn_income3(S3.job1_spn_income3);

			// 退職のご予定
			this.job2_spn_age_taisyoku(S2.job2_spn_age_taisyoku);
			this.job2_spn_age_taisyoku_v(S2.job2_spn_age_taisyoku_v);
			this.job2_spn_age_saisyusyoku_st(S2.job2_spn_age_saisyusyoku_st);
			this.job2_spn_age_saisyusyoku_st_v(S2.job2_spn_age_saisyusyoku_st_v);
			this.job2_spn_age_saisyusyoku_end(S2.job2_spn_age_saisyusyoku_end);
			this.job2_spn_age_saisyusyoku_end_v(S2.job2_spn_age_saisyusyoku_end_v);
			this.job2_spn_taisyoku(S2.job2_spn_taisyoku);
			this.job2_spn_saisyu_income(S2.job2_spn_saisyu_income);
			// S2 その他
			this.popup_job2_title(S2.popup_job2_title);
			this.popup_job2_taisyoku_row(S2.popup_job2_taisyoku_row);
			this.popup_job2_sm_taisyoku_row(S2.popup_job2_sm_taisyoku_row);
			this.popup_job2_age_saisyusyoku_st_row(S2.popup_job2_age_saisyusyoku_st_row);
			this.popup_job2_age_saisyusyoku_end_row(S2.popup_job2_age_saisyusyoku_end_row);
			this.popup_job2_sm_saisyu_income_row(S2.popup_job2_sm_saisyu_income_row);


		};

		this.onClickClose = function(target, id) {
			switch (id) {
				case 0:
					break;
				case 1:
					S1.onClickClose(target);
					this.setData();
					break;
			}
		};

		this.onClick = function(target, id) {
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
					this.setData();
					break;
				case 3:
					this.setData();
					break;
				case 4:
					S4.onCeetData();
					break;
			}
		};

		this.onSelect = function(target, id, event) {
			switch (id) {
				case 0:
					break;
				case 1:
					S1.onSelect(target, event);
					this.setData();
					break;
			}
		};

		this.onCalcFinish = function(target, id) {
			switch (id) {
				case 0:
					break;
				case 1:
					S1.onCalcFinish(target);
					this.setData();
					break;
			}
		};

		this.onClickReference = function() {
			S1.onClickReference();
			this.setData();
		};

		this.MoneyUpdate = function(data, event) {
			S5.onCalcFinish(event);
			this.setData();
		};

		this.sonotaSyunyu = function() {
			// その他情報
			this.job1_txt_income(S0.job1_txt_income);

			this.job1_spn_income1_to_v(S3.job1_spn_income1_to_v);
			this.job1_spn_income1_from_v(S3.job1_spn_income1_from_v);
			this.job1_spn_income2_to_v(S3.job1_spn_income2_to_v);
			this.job1_spn_income2_from_v(S3.job1_spn_income2_from_v);
			this.job1_spn_income3_to_v(S3.job1_spn_income3_to_v);
			this.job1_spn_income3_from_v(S3.job1_spn_income3_from_v);

			this.job1_spn_income1(S3.job1_spn_income1);
			this.job1_spn_income2(S3.job1_spn_income2);
			this.job1_spn_income3(S3.job1_spn_income3);
		};

		this.job1_spn_income = function(data, event) {
			S3.job1_spn_income(data, event);
			this.setData();
		};

		this.onSelect2 = function(data, event) {
			S3.onSelect(data, event);
			this.setData();
		};


		this.job2_spn_income = function(data, event) {
			S2.job2_spn_income(data, event);
			this.setData();
		};

		this.job2_onSelect = function(data, event) {
			S2.job2_onSelect(data, event);
			this.setData();
		};

		this.job2_saveData = function(id) {
			S2.save();
			this.setData();
		};

		this.saveData = function(id) {

			switch (id) {
				case 3:
					S3.save();
					this.setData();
					break;
				case 5:
					var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase"));
					data[id_modelcase] = mMC;
					LIFEPLAN.conf.storage.setItem("lp_modelcase", JSON.stringify(data));

					init();
					S4.onCreate();
					this.setData();

					this.closeTopModal();
					break;
			}
		};



		this.discard = function() {
			this.setData();
			LMPS.closeModal();
		};

		this.openModal = function(target, param) {
			switch (target) {
				case "#modal-5":
					S5.onCreate(param);
					this.setData();

					this.show_modal(true);
					LMPS.openModal(target);
					break;
			}
		};
		this.closeTopModal = function() {
			this.show_modal(false);
		};
		this.tabChange = function(tab) {
		};
		this.deleteData = function() {
		};
		this.goSimulation = function() {
			Calc.logicALL_Go();
			window.location.href = "simulation1.html";
		};

		// サイドメニュー表示制御
		this.dispSidemenu = ko.observable(dispSidemenu);
		this.Sidemenu = function(target) {
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

		Logic01 = JSON.parse(LIFEPLAN.conf.storage.getItem("Logic01"));
		Logic03 = JSON.parse(LIFEPLAN.conf.storage.getItem("Logic03"));
		Logic05 = JSON.parse(LIFEPLAN.conf.storage.getItem("Logic05"));
		Logic06 = JSON.parse(LIFEPLAN.conf.storage.getItem("Logic06"));
	}

	function setup(tab1, tab2) {
		m_modelClass = LIFEPLAN.module.getModelClass(id_modelcase);
		m_show_modal = true;

		if (id_modelcase === 0) {
			setting_tab1_basic = '<a href="#"><span>基本</span><span>情報</span></a>';
			setting_tab2_job = '<a href="#" class="current"><span>職業</span><span class="dot">・</span><span>年収</span></a>';
			setting_tab3_house = '<span href="#"><span>住宅</span><span>プラン</span></span>';
			setting_tab4_education = '<span href="#"><span>教育</span><span>プラン</span></span>';
			setting_tab5_insurance = '<span href="#"><span>加入</span><span>保険</span></span>';
			simulation1 = '';
		} else {
			if (MC.id_lives === 1 || MC.id_lives_yotei === 1) {
				setting_tab1_basic = '<a href="#"><span>基本</span><span>情報</span></a>';
				setting_tab2_job = '<a href="#" class="current"><span>職業</span><span class="dot">・</span><span>年収</span></a>';
				setting_tab3_house = '<a href="#"><span>住宅</span><span>プラン</span></a>';
				setting_tab4_education = '<a href="#"><span>教育</span><span>プラン</span></a>';
				setting_tab5_insurance = '<a href="#"><span>加入</span><span>保険</span></a>';
				simulation1 = '<a class="button-diagnosis"></a>';
			} else {
				setting_tab1_basic = '<a href="#"><span>基本</span><span>情報</span></a>';
				setting_tab2_job = '<a href="#" class="current"><span>職業</span><span class="dot">・</span><span>年収</span></a>';
				setting_tab3_house = '<span href="#"><span>住宅</span><span>プラン</span></span>';
				setting_tab4_education = '<a href="#"><span>教育</span><span>プラン</span></a>';
				setting_tab5_insurance = '<a href="#"><span>加入</span><span>保険</span></a>';
				simulation1 = '<a class="button-diagnosis"></a>';
			}
		}

		S0.onCreate(tab1, tab2);
		S1.onCreate(tab1);
		S2.onCreate(tab2);
		S3.onCreate();

		S5.onCreate(0);
		S4.onCreate();
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