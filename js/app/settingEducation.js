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

	// コンテンツ内共有変数
	var mChild = [];


	var Scenes = {
		S0: {},
		S1: {}
	};

	Scenes.S0 = (function () {
		var self;
//		var mChild = [];

		var S0 = function () {
			self = this;
		};

		var p = S0.prototype;

		p.setup = function () {
			for (var i = 0; i < 4; i++) {
				mChild[i] = MC.get_kyouiku(i + 1);
			}

			self.update();
		};

		p.update = function () {
			var tv;
			var s;
			var titleid = [self.edu1_title, self.edu2_title, self.edu3_title, self.edu4_title];
			var yo_id = [self.edu1_yochien, self.edu2_yochien, self.edu3_yochien, self.edu4_yochien];
			var syo_id = [self.edu1_syogakko, self.edu2_syogakko, self.edu3_syogakko, self.edu4_syogakko];
			var cyu_id = [self.edu1_cyugakko, self.edu2_cyugakko, self.edu3_cyugakko, self.edu4_cyugakko];
			var ko_id = [self.edu1_koko, self.edu2_koko, self.edu3_koko, self.edu4_koko];
			var dai_id = [self.edu1_daigaku, self.edu2_daigaku, self.edu3_daigaku, self.edu4_daigaku];
			var sum_id = [self.edu1_sum, self.edu2_sum, self.edu3_sum, self.edu4_sum];



			var kyouiku_peak_year = 0;
			var kyouiku_peak_value = 0;

			var index = getIndex(false);

			for (var age = MC.age_hon; age < 100; age++) {
				if (Logic05.vKyouiku[age + index] > kyouiku_peak_value) {
					kyouiku_peak_year = Logic05.mYYYYStart + age + index;
					kyouiku_peak_value = Logic05.vKyouiku[age + index];
				}
			}
			if (kyouiku_peak_year === 0) {
				self.popup_edu_icon_comment = false;
				s = "";
			} else {
				self.popup_edu_icon_comment = true;
				s = "教育資金は" + String(kyouiku_peak_year) + "年（年間教育費" + Util.formatMoneyMan(kyouiku_peak_value, 0) + "）にピークになります。";
			}
			self.popup_edu_txt_comment = s;

			var total_sum = 0;

			for (var i = 0; i < 4; i++) {
				var has_child = false;
				if (mChild[i] !== null) {
					has_child = true;
				}

				tv = titleid;
				s = "第" + (i + 1) + "子";
				if (has_child) {
					if (mChild[i].age_child < 0) {
						s += "<br\>（" + (-mChild[i].age_child) + "年後誕生）";
					} else {
						s += "<br\>（" + (mChild[i].age_child) + "歳）";
					}
				}
				tv[i] = (s);

				tv = yo_id;
				if (!has_child) {
					s = "-";
				} else if (mChild[i].id_kindergarten === 1) {
					s = "公立";
				} else if (mChild[i].id_kindergarten === 2) {
					s = "私立";
				} else {
					s = "-";
				}
				tv[i] = (s);

				tv = syo_id;
				if (!has_child) {
					s = "-";
				} else if (mChild[i].id_primary_school === 1) {
					s = "公立";
				} else if (mChild[i].id_primary_school === 2) {
					s = "私立";
				} else {
					s = "-";
				}
				tv[i] = (s);

				tv = cyu_id;
				if (!has_child) {
					s = "-";
				} else if (mChild[i].id_junior_high_school === 1) {
					s = "公立";
				} else if (mChild[i].id_junior_high_school === 2) {
					s = "私立";
				} else {
					s = "-";
				}
				tv[i] = (s);

				tv = ko_id;
				if (!has_child) {
					s = "-";
				} else if (mChild[i].id_high_school === 1) {
					s = "公立";
				} else if (mChild[i].id_high_school === 2) {
					s = "私立";
				} else {
					s = "-";
				}
				tv[i] = (s);

				s = "";
				tv = dai_id;
				if (!has_child) {
					s = "";
				} else if (mChild[i].id_college === 1) {
					s = "国公立";
				} else if (mChild[i].id_college === 2) {
					s = "私立";
				}

				if (!has_child) {
				} else if (mChild[i].id_college_course === 1) {
					s += "文系";
				} else if (mChild[i].id_college_course === 2) {
					s += "理系";
				} else if (mChild[i].id_college_course === 3) {
					s += "医歯系";
				}
				if (!has_child) {
				} else if (mChild[i].id_college_from === 1) {
					s += "<br\>自宅通学";
				} else if (mChild[i].id_college_from === 2) {
					s += "<br\>下宿";
				}
				if (!has_child || mChild[i].id_college === 0 || mChild[i].id_college_course === 0 || mChild[i].id_college_from === 0) {
					s = "-";
				}
				tv[i] = (s);

				var yo = 0, syo = 0, chu = 0, ko = 0, dai1 = 0, dai2 = 0, daiyear = 4, sum = 0;
				if (has_child) {
					var ret = DB.get_kyouikuhi(1, mChild[i].id_kindergarten, mChild[i].no_kindergarten, 0);
					if (ret !== null) {
						yo = ret.sm_year;
					}
					ret = DB.get_kyouikuhi(2, mChild[i].id_primary_school, 6, 0);
					if (ret !== null) {
						syo = ret.sm_year;
					}
					ret = DB.get_kyouikuhi(3, mChild[i].id_junior_high_school, 3, 0);
					if (ret !== null) {
						chu = ret.sm_year;
					}
					ret = DB.get_kyouikuhi(4, mChild[i].id_high_school, 3, 0);
					if (ret !== null) {
						ko = ret.sm_year;
					}
					daiyear = 4;
					if (mChild[i].id_college_course === 3) {
						daiyear = 6;
					}

					ret = DB.get_kyouikuhi(5, mChild[i].id_college, daiyear, mChild[i].id_college_course);
					if (ret !== null) {
						dai1 = ret.sm_nyugaku;
						dai1 += ret.sm_year;
						if (mChild[i].id_college_from === 2) {
							dai1 += ret.sm_room;
							dai1 += ret.sm_nyugakuroom;
						}
						dai2 += ret.sm_year;
						if (mChild[i].id_college_from === 2) {
							dai2 += ret.sm_room;
						}
					}
				}

				sum = 0;
				if (has_child) {
					sum += yo * mChild[i].no_kindergarten;
				}
				sum += syo * 6;
				sum += chu * 3;
				sum += ko * 3;
				sum += dai1;
				sum += dai2 * (daiyear - 1);
				if (!has_child) {
					sum = 0;
				}
				if (sum > 0) {
					s = Util.formatMoneyMan(sum, 0);
				} else {
					s = "-";
				}
				sum_id[i] = s;
				total_sum += sum;
			}
			self.edu_total_sum = Util.formatMoneyMan(total_sum, 0);

			self.edu1_title = titleid[0];
			self.edu2_title = titleid[1];
			self.edu3_title = titleid[2];
			self.edu4_title = titleid[3];
			self.edu1_yochien = yo_id[0];
			self.edu2_yochien = yo_id[1];
			self.edu3_yochien = yo_id[2];
			self.edu4_yochien = yo_id[3];
			self.edu1_syogakko = syo_id[0];
			self.edu2_syogakko = syo_id[1];
			self.edu3_syogakko = syo_id[2];
			self.edu4_syogakko = syo_id[3];
			self.edu1_cyugakko = cyu_id[0];
			self.edu2_cyugakko = cyu_id[1];
			self.edu3_cyugakko = cyu_id[2];
			self.edu4_cyugakko = cyu_id[3];
			self.edu1_koko = ko_id[0];
			self.edu2_koko = ko_id[1];
			self.edu3_koko = ko_id[2];
			self.edu4_koko = ko_id[3];
			self.edu1_daigaku = dai_id[0];
			self.edu2_daigaku = dai_id[1];
			self.edu3_daigaku = dai_id[2];
			self.edu4_daigaku = dai_id[3];
			self.edu1_sum = sum_id[0];
			self.edu2_sum = sum_id[1];
			self.edu3_sum = sum_id[2];
			self.edu4_sum = sum_id[3];
		};

		p.onClick = function (v) {

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
					if (id_modelcase !== 0) {
						if (MC.id_lives === 1 || MC.id_lives_yotei === 1) {
							window.location.href = 'setting_tab3_house.html';
						}
					}
					break;
				case "setting_tab4":
					break;
				case "setting_tab5":
					if (id_modelcase !== 0) {
						window.location.href = 'setting_tab5_insurance.html';
					}
					break;
				case "goto_simulation":
					window.location.href = 'simulation1.html';
					break;
			}
		};

		return S0;
	})();

	Scenes.S1 = (function () {
		var mKyouiku;
		var self;
		var mParam;
		var dayMax;

		var S1 = function () {
			self = this;
		};

		var p = S1.prototype;

		p.setup = function(param) {
			mParam = param + 1;
			var s = "第" + (mParam) + "子の編集設定";
			self.popup_edu_label_title = (s);

			mKyouiku = DB.Lp_modelcase_kyouiku;
			var item = MC.get_kyouiku(mParam);

			if (item === null) {
				item = DB.Lp_modelcase_kyouiku;
				item.id_modelcase = MC.id_modelcase;
				item.no_child = mParam;
				item.ymd_child.fromAge(item.age_child, null, null);
				item.id_kindergarten = 0;
			}


			//コピーしておく
			mKyouiku.copy(item);

			//幼稚園が0だったら未定義なので全てのデフォルトを1にする
			if (mKyouiku.id_kindergarten < 1) {
				mKyouiku.id_kindergarten = 1;
				mKyouiku.id_primary_school = 1;
				mKyouiku.id_junior_high_school = 1;
				mKyouiku.id_high_school = 1;
				mKyouiku.id_college = 1;
				mKyouiku.id_college_course = 1;
				mKyouiku.id_college_from = 1;
				mKyouiku.no_kindergarten = 3;
			}

			self.update();
		};

		p.update = function () {
			if (!isNaN(mKyouiku.ymd_child.mValue)) {
				var birth = mKyouiku.ymd_child.mValue;
			} else {
				var birth = Number(LPdate.getCurYear()) * 10000 + 402;
			}

			var y_hon = LPdate.getYear(MC.st_birthday_hon) + 18;
			var y, m, d;

			y = LPdate.getYear(birth);
			m = LPdate.getMon(birth);
			d = LPdate.getDay(birth);
			var yyyy = DB.getNumberList(LPdate.getYear(MC.st_birthday_hon), 18, 60, "", "");
			var select = y - y_hon + 1;
			if (select < 0) {
				select = 1;
			}
			if (select >= yyyy.length) {
				select = yyyy.length;
			}
			self.spn_birth_yyyy = yyyy;
			self.spn_birth_yyyy_v = self.spn_birth_yyyy[select - 1];

			var mm = DB.getNumberList(0, 1, 12, "", "");
			self.spn_birth_mm = mm;
			self.spn_birth_mm_v = self.spn_birth_mm[m - 1];

			dayMax = Util.calcDaysOfMonth(y, m);
			if (d > dayMax) {
				d = dayMax;
			}

			var dd = DB.getNumberList(0, 1, dayMax, "", "");
			self.spn_birth_dd = dd;
			self.spn_birth_dd_v = self.spn_birth_dd[d - 1];

			var list = DB.getNumberList(0, 3, 5, "", "");
			var y_mKyouiku_no_kindergarten = mKyouiku.no_kindergarten;
			if (y_mKyouiku_no_kindergarten > 0) {
				y_mKyouiku_no_kindergarten -= 3;
			}
			self.spn_kindergarten = list;
			self.spn_kindergarten_v = self.spn_kindergarten[y_mKyouiku_no_kindergarten];


			self.btn_education_1_1 = (mKyouiku.id_kindergarten !== 1 && mKyouiku.id_kindergarten !== 0) ? "私立" : "公立";

			self.btn_education_2_1 = (mKyouiku.id_primary_school !== 1 && mKyouiku.id_primary_school !== 0) ? "私立" : "公立";

			self.btn_education_3_1 = (mKyouiku.id_junior_high_school !== 1 && mKyouiku.id_junior_high_school !== 0) ? "私立" : "公立";

			self.btn_education_4_1 = (mKyouiku.id_high_school !== 1 && mKyouiku.id_high_school !== 0) ? "私立" : "公立";

			self.btn_education_5_1 = (mKyouiku.id_college !== 1 && mKyouiku.id_college !== 0) ? "私立" : "国公立";

			self.btn_education_6_1 = (mKyouiku.id_college_course !== 1 && mKyouiku.id_college_course !== 0) ? "" : "文系";
			self.btn_education_6_2 = (mKyouiku.id_college_course !== 2) ? "" : "理系";
			self.btn_education_6_3 = (mKyouiku.id_college_course !== 3) ? "" : "医歯系";

			self.btn_education_7_1 = (mKyouiku.id_college_from !== 1 && mKyouiku.id_college_from !== 0) ? "下宿" : "自宅";

			var s;
			var yo = 0, syo = 0, chu = 0, ko = 0, dai1 = 0, dai2 = 0, daiyear = 4;
			var ret = DB.get_kyouikuhi(1, mKyouiku.id_kindergarten, mKyouiku.no_kindergarten, 0);
			if (ret !== null && typeof (ret) !== "undefined") {
				yo = ret.sm_year;
				s = Util.num2ManRound(yo) + "万円";
			} else {
				s = Wording.MISENTAKU;
			}
			self.popup_edu2_label1 = s;
			ret = DB.get_kyouikuhi(2, mKyouiku.id_primary_school, 6, 0);
			if (ret !== null) {
				syo = ret.sm_year;
				s = Util.num2ManRound(syo) + "万円";
			} else {
				s = Wording.MISENTAKU;
			}
			self.popup_edu2_label2 = s;
			ret = DB.get_kyouikuhi(3, mKyouiku.id_junior_high_school, 3, 0);
			if (ret !== null) {
				chu = ret.sm_year;
				s = Util.num2ManRound(chu) + "万円";
			} else {
				s = Wording.MISENTAKU;
			}
			self.popup_edu2_label3 = s;
			ret = DB.get_kyouikuhi(4, mKyouiku.id_high_school, 3, 0);
			if (ret !== null) {
				ko = ret.sm_year;
				s = Util.num2ManRound(ko) + "万円";
			} else {
				s = Wording.MISENTAKU;
			}
			self.popup_edu2_label4 = s;
			ret = DB.get_kyouikuhi(4, mKyouiku.id_high_school, 3, 0);
			daiyear = 4;
			if (mKyouiku.id_college_course === 3) {
				daiyear = 6;
			}

			ret = DB.get_kyouikuhi(5, mKyouiku.id_college, daiyear, mKyouiku.id_college_course);
			if (ret !== null) {
				dai1 = ret.sm_nyugaku;
				dai1 += ret.sm_year;
				if (mKyouiku.id_college_from === 2) {
					dai1 += ret.sm_room;
					dai1 += ret.sm_nyugakuroom;
				}
				s = Util.num2ManRound(dai1) + "万円";
			} else {
				s = Wording.MISENTAKU;
			}
			self.popup_edu2_label5 = s;
			if (ret !== null) {
				dai2 += ret.sm_year;
				if (mKyouiku.id_college_from === 2) {
					dai2 += ret.sm_room;
				}
				s = Util.num2ManRound(dai2) + "万円";
			} else {
				s = Wording.MISENTAKU;
			}
			self.popup_edu2_label6 = s;
			var sum = yo * mKyouiku.no_kindergarten;
			sum += syo * 6;
			sum += chu * 3;
			sum += ko * 3;
			sum += dai1;
			sum += dai2 * (daiyear - 1);
			s = Util.num2ManRound(sum) + "万円";
			self.popup_edu_label_sum = s;
			mKyouiku.age_child = LPdate.calcAge(String(mKyouiku.ymd_child.mValue));

			(function () {
				var y = self.spn_birth_yyyy_v;
				var m = self.spn_birth_mm_v;
				var d = self.spn_birth_dd_v;
				var st_y = mKyouiku.ymd_child.setYear(y);
				var st_m = mKyouiku.ymd_child.setMon(m);
				var st_d = mKyouiku.ymd_child.setDay(d);
				var ymd = Number(st_y) + Number(st_m) + Number(st_d);
				mKyouiku.ymd_child.mValue = ymd;
			})();

		};

		p.onClick = function (data, event) {

			var outer = event.target.outerHTML;
			var id;
			var value = event.target.value;

			if (~outer.indexOf('btn_education_1_1')) {
				id = 'btn_education_1_1';
			} else if (~outer.indexOf('btn_education_1_2')) {
				id = 'btn_education_1_2';
			} else if (~outer.indexOf('btn_education_2_1')) {
				id = 'btn_education_2_1';
			} else if (~outer.indexOf('btn_education_2_2')) {
				id = 'btn_education_2_2';
			} else if (~outer.indexOf('btn_education_3_1')) {
				id = 'btn_education_3_1';
			} else if (~outer.indexOf('btn_education_4_1')) {
				id = 'btn_education_4_1';
			} else if (~outer.indexOf('btn_education_4_2')) {
				id = 'btn_education_4_2';
			} else if (~outer.indexOf('btn_education_5_1')) {
				id = 'btn_education_5_1';
			} else if (~outer.indexOf('btn_education_5_2')) {
				id = 'btn_education_5_2';
			} else if (~outer.indexOf('btn_education_6_1')) {
				id = 'btn_education_6_1';
			} else if (~outer.indexOf('btn_education_6_2')) {
				id = 'btn_education_6_2';
			} else if (~outer.indexOf('btn_education_6_3')) {
				id = 'btn_education_6_3';
			} else if (~outer.indexOf('btn_education_7_1')) {
				id = 'btn_education_7_1';
			} else if (~outer.indexOf('btn_education_7_2')) {
				id = 'btn_education_7_2';
			}

			switch (id) {
				case "btn_education_1_1":
					mKyouiku.id_kindergarten = (value === "公立") ? 1 : 2;
					self.update();
					break;
				case "btn_education_1_2":
					mKyouiku.id_kindergarten = 2;
					self.update();
					break;
				case "btn_education_2_1":
					mKyouiku.id_primary_school = (value === "公立") ? 1 : 2;
					self.update();
					break;
				case "btn_education_2_2":
					mKyouiku.id_primary_school = 2;
					self.update();
					break;
				case "btn_education_3_1":
					mKyouiku.id_junior_high_school = (value === "公立") ? 1 : 2;
					self.update();
					break;
				case "btn_education_3_2":
					mKyouiku.id_junior_high_school = 2;
					self.update();
					break;
				case "btn_education_4_1":
					mKyouiku.id_high_school = (value === "公立") ? 1 : 2;
					self.update();
					break;
				case "btn_education_4_2":
					mKyouiku.id_high_school = 2;
					self.update();
					break;
				case "btn_education_5_1":
					mKyouiku.id_college = (value === "国公立") ? 1 : 2;
					self.update();
					break;
				case "btn_education_5_2":
					mKyouiku.id_college = 2;
					self.update();
					break;
				case "btn_education_6_1":
					mKyouiku.id_college_course = 1;
					self.update();
					break;
				case "btn_education_6_2":
					mKyouiku.id_college_course = 2;
					self.update();
					break;
				case "btn_education_6_3":
					mKyouiku.id_college_course = 3;
					self.update();
					break;
				case "btn_education_7_1":
					mKyouiku.id_college_from = (value === "自宅") ? 1 : 2;
					self.update();
					break;
				case "btn_education_7_2":
					mKyouiku.id_college_from = 2;
					self.update();
					break;
			}
		};

		p.onSelect = function (data, event) {
			var outer = event.target.outerHTML;
			var id;
			var index = event.target.selectedIndex;
			var item = event.target.value;

			if (~outer.indexOf('spn_kindergarten')) {
				id = 'spn_kindergarten';
			} else if (~outer.indexOf('spn_birth_yyyy')) {
				id = 'spn_birth_yyyy';
			} else if (~outer.indexOf('spn_birth_mm')) {
				id = 'spn_birth_mm';
			} else if (~outer.indexOf('spn_birth_dd')) {
				id = 'spn_birth_dd';
			}

			var y_hon = LPdate.getYear(MC.st_birthday_hon) + 18;

			switch (id) {
				case "spn_kindergarten":
					mKyouiku.no_kindergarten = index + 3;
					self.update();
					break;
				case "spn_birth_yyyy":
					var y = index;
					var m = self.spn_birth_mm_v;
					var d = self.spn_birth_dd_v;
					var st_y = mKyouiku.ymd_child.setYear(y + y_hon);
					var st_m = mKyouiku.ymd_child.setMon(m);
					var st_d = mKyouiku.ymd_child.setDay(d);
					var ymd = Number(st_y) + Number(st_m) + Number(st_d);
					mKyouiku.ymd_child.mValue = ymd;
					self.update();
					break;
				case "spn_birth_mm":
					var y = self.spn_birth_yyyy_v;
					var m = index;
					var d = self.spn_birth_dd_v;
					var st_y = mKyouiku.ymd_child.setYear(y);
					var st_m = mKyouiku.ymd_child.setMon(m + 1);
					var st_d = mKyouiku.ymd_child.setDay(d);
					var ymd = Number(st_y) + Number(st_m) + Number(st_d);
					mKyouiku.ymd_child.mValue = ymd;
					self.update();
					break;
				case "spn_birth_dd":
					var y = self.spn_birth_yyyy_v;
					var m = self.spn_birth_mm_v;
					var d = index;
					var st_y = mKyouiku.ymd_child.setYear(y);
					var st_m = mKyouiku.ymd_child.setMon(m);
					var st_d = mKyouiku.ymd_child.setDay(d + 1);
					var ymd = Number(st_y) + Number(st_m) + Number(st_d);
					mKyouiku.ymd_child.mValue = ymd;
					self.update();
					break;
			}
		};

		p.save = function () {
			var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase_kyouiku"));

			if (mParam > MC.m_modelcase_kyouiku.length) {
				var row = MC.m_modelcase_kyouiku.length + 1;

				var key;
				for (var i = 0; i < data.length; i++) {
					if (Number(data[i].id_modelcase) === Number(id_modelcase) && Number(data[i].no_child) === Number(row)) {
						key = i;
						break;
					}
				}
				data[key].age_child = (isNaN(mKyouiku.age_child)) ? LPdate.calcAge(mKyouiku.ymd_child.mValue) : mKyouiku.age_child;
				data[key].id_college = mKyouiku.id_college;
				data[key].id_college_course = mKyouiku.id_college_course;
				data[key].id_college_from = mKyouiku.id_college_from;
				data[key].id_high_school = mKyouiku.id_high_school;
				data[key].id_junior_high_school = mKyouiku.id_junior_high_school;
				data[key].id_kindergarten = mKyouiku.id_kindergarten;
				data[key].id_primary_school = mKyouiku.id_primary_school;
				data[key].no_kindergarten = mKyouiku.no_kindergarten;
				data[key].ymd_child = mKyouiku.ymd_child.mValue;
			} else {
				var key;
				for (var i = 0; i < data.length; i++) {
					if (Number(data[i].id_modelcase) === Number(id_modelcase) && Number(data[i].no_child) === Number(mParam)) {
						key = i;
						break;
					}
				}
				data[key].age_child = (isNaN(mKyouiku.age_child)) ? 0 : mKyouiku.age_child;
				data[key].id_college = mKyouiku.id_college;
				data[key].id_college_course = mKyouiku.id_college_course;
				data[key].id_college_from = mKyouiku.id_college_from;
				data[key].id_high_school = mKyouiku.id_high_school;
				data[key].id_junior_high_school = mKyouiku.id_junior_high_school;
				data[key].id_kindergarten = mKyouiku.id_kindergarten;
				data[key].id_primary_school = mKyouiku.id_primary_school;
				data[key].no_kindergarten = mKyouiku.no_kindergarten;
				data[key].ymd_child = mKyouiku.ymd_child.mValue;
			}

			// 子供を年齢順でソート（生年月日は初期値で空のため）
			var sub = data.filter(function(element) {
				return Number(element.id_modelcase) === Number(id_modelcase);
			});

			sub.sort(function(a, b) {
				if (parseInt(a.age_child) > parseInt(b.age_child))
					return -1;
				if (parseInt(a.age_child) < parseInt(b.age_child))
					return 1;
				return 0;
			});

			var sub_copy = [{}, {}, {}, {}];

			for (var i = 0; i < sub.length; i++) {
				sub_copy[i].age_child = sub[i].age_child;
				sub_copy[i].id_college = sub[i].id_college;
				sub_copy[i].id_college_course = sub[i].id_college_course;
				sub_copy[i].id_college_from = sub[i].id_college_from;
				sub_copy[i].id_high_school = sub[i].id_high_school;
				sub_copy[i].id_junior_high_school = sub[i].id_junior_high_school;
				sub_copy[i].id_kindergarten = sub[i].id_kindergarten;
				sub_copy[i].id_modelcase = sub[i].id_modelcase;
				sub_copy[i].id_primary_school = sub[i].id_primary_school;
				sub_copy[i].no_child = sub[i].no_child;
				sub_copy[i].no_kindergarten = sub[i].no_kindergarten;
				sub_copy[i].ymd_child = sub[i].ymd_child;
			}
			for (var i = 0; i < sub_copy.length; i++) {
				sub_copy[i].no_child = i + 1;
			}

			var j = 0;
			for (var i = 0; i < data.length; i++) {
				if (Number(data[i].id_modelcase) === Number(id_modelcase) && Number(data[i].no_child) === Number(j + 1)) {
					data[i].age_child = sub_copy[j].age_child;
					data[i].id_college = sub_copy[j].id_college;
					data[i].id_college_course = sub_copy[j].id_college_course;
					data[i].id_college_from = sub_copy[j].id_college_from;
					data[i].id_high_school = sub_copy[j].id_high_school;
					data[i].id_junior_high_school = sub_copy[j].id_junior_high_school;
					data[i].id_kindergarten = sub_copy[j].id_kindergarten;
					data[i].id_primary_school = sub_copy[j].id_primary_school;
					data[i].no_child = sub_copy[j].no_child;
					data[i].no_kindergarten = sub_copy[j].no_kindergarten;
					data[i].ymd_child = sub_copy[j].ymd_child;

					j++;
				}
			}

			LIFEPLAN.conf.storage.setItem("lp_modelcase_kyouiku", JSON.stringify(data));

			init();
//			self.update();
//			S0.setup();
			setup();
		};

		p.delete = function () {
			var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase_kyouiku"));

			// 配列キーを取得
			var key;
			for (var i = 0; i < data.length; i++) {
				if (Number(data[i].id_modelcase) === Number(id_modelcase) && Number(data[i].no_child) === Number(mParam)) {
					key = i;
					break;
				}
			}

			var x = 4 - mParam;
			var sub = {
				age_child: "",
				id_college: "1",
				id_college_course: "1",
				id_college_from: "1",
				id_high_school: "1",
				id_junior_high_school: "1",
				id_kindergarten: "1",
				id_modelcase: String(id_modelcase),
				id_primary_school: "1",
				no_child: "4",
				no_kindergarten: "3",
				ymd_child: ""
			};

			// no_child(mParam) 4 or other
			if (mParam === 4) {
				// モデルケースごとの最後の行
				// 空データを代入
				data[key].age_child = "";
				data[key].id_college = "1";
				data[key].id_college_course = "1";
				data[key].id_college_from = "1";
				data[key].id_high_school = "1";
				data[key].id_junior_high_school = "1";
				data[key].id_kindergarten = "1";
				data[key].id_primary_school = "1";
				data[key].no_kindergarten = "3";
				data[key].ymd_child = "";
			} else {
				// モデルケースごとの最後の行以外
				// 配列を詰める
				data.splice(key, 1);
				// no_childを詰める
				for (var i = 0; i < x; i++) {
					data[key + i].no_child = String(data[key + i].no_child - 1);
				}
				// 最後の行にからデータ挿入
				data.splice(key + x, 0, sub);
			}

			LIFEPLAN.conf.storage.setItem("lp_modelcase_kyouiku", JSON.stringify(data));

			init();
			self.update();
			S0.setup();
		};

		return S1;
	})();

	var S0 = new Scenes.S0();
	var S1 = new Scenes.S1();


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
		this.edu1_title = ko.observable(S0.edu1_title);
		this.edu1_yochien = ko.observable(S0.edu1_yochien);
		this.edu1_syogakko = ko.observable(S0.edu1_syogakko);
		this.edu1_cyugakko = ko.observable(S0.edu1_cyugakko);
		this.edu1_koko = ko.observable(S0.edu1_koko);
		this.edu1_daigaku = ko.observable(S0.edu1_daigaku);
		this.edu1_sum = ko.observable(S0.edu1_sum);
		this.edu2_title = ko.observable(S0.edu2_title);
		this.edu2_yochien = ko.observable(S0.edu2_yochien);
		this.edu2_syogakko = ko.observable(S0.edu2_syogakko);
		this.edu2_cyugakko = ko.observable(S0.edu2_cyugakko);
		this.edu2_koko = ko.observable(S0.edu2_koko);
		this.edu2_daigaku = ko.observable(S0.edu2_daigaku);
		this.edu2_sum = ko.observable(S0.edu2_sum);
		this.edu3_title = ko.observable(S0.edu3_title);
		this.edu3_yochien = ko.observable(S0.edu3_yochien);
		this.edu3_syogakko = ko.observable(S0.edu3_syogakko);
		this.edu3_cyugakko = ko.observable(S0.edu3_cyugakko);
		this.edu3_koko = ko.observable(S0.edu3_koko);
		this.edu3_daigaku = ko.observable(S0.edu3_daigaku);
		this.edu3_sum = ko.observable(S0.edu3_sum);
		this.edu4_title = ko.observable(S0.edu4_title);
		this.edu4_yochien = ko.observable(S0.edu4_yochien);
		this.edu4_syogakko = ko.observable(S0.edu4_syogakko);
		this.edu4_cyugakko = ko.observable(S0.edu4_cyugakko);
		this.edu4_koko = ko.observable(S0.edu4_koko);
		this.edu4_daigaku = ko.observable(S0.edu4_daigaku);
		this.edu4_sum = ko.observable(S0.edu4_sum);
		this.class_btn_0 = ko.observable(S0.class_btn_0);
		this.edu_total_sum = ko.observable(S0.edu_total_sum);
		this.popup_edu_icon_comment = ko.observable(S0.popup_edu_icon_comment);
		this.popup_edu_txt_comment = ko.observable(S0.popup_edu_txt_comment);


		// scene-1: S1
		this.popup_edu_label_title = ko.observable(S1.popup_edu_label_title);
		this.spn_birth_yyyy = ko.observableArray(S1.spn_birth_yyyy);
		this.spn_birth_yyyy_v = ko.observable(S1.spn_birth_yyyy_v);
		this.spn_birth_mm = ko.observableArray(S1.spn_birth_mm);
		this.spn_birth_mm_v = ko.observable(S1.spn_birth_mm_v);
		this.spn_birth_dd = ko.observableArray(S1.spn_birth_dd);
		this.spn_birth_dd_v = ko.observable(S1.spn_birth_dd_v);
		this.btn_education_1_1 = ko.observable(S1.btn_education_1_1);

		this.btn_education_2_1 = ko.observable(S1.btn_education_2_1);
		this.btn_education_3_1 = ko.observable(S1.btn_education_3_1);
		this.btn_education_4_1 = ko.observable(S1.btn_education_4_1);
		this.btn_education_5_1 = ko.observable(S1.btn_education_5_1);
		this.btn_education_6_1 = ko.observable(S1.btn_education_6_1);
		this.btn_education_6_2 = ko.observable(S1.btn_education_6_2);
		this.btn_education_6_3 = ko.observable(S1.btn_education_6_3);
		this.btn_education_7_1 = ko.observable(S1.btn_education_7_1);
		this.spn_kindergarten = ko.observableArray(S1.spn_kindergarten);
		this.spn_kindergarten_v = ko.observable(S1.spn_kindergarten_v);
		this.popup_edu2_label1 = ko.observable(S1.popup_edu2_label1);
		this.popup_edu2_label2 = ko.observable(S1.popup_edu2_label2);
		this.popup_edu2_label3 = ko.observable(S1.popup_edu2_label3);
		this.popup_edu2_label4 = ko.observable(S1.popup_edu2_label4);
		this.popup_edu2_label5 = ko.observable(S1.popup_edu2_label5);
		this.popup_edu2_label6 = ko.observable(S1.popup_edu2_label6);
		this.popup_edu_label_sum = ko.observable(S1.popup_edu_label_sum);


		this.setData = function (isModalUpdate) {
			//weapperクラス変更 上部プラン別画像表示
			this.modelClass(m_modelClass);
			this.simulation1(simulation1);
			this.setting_tab1_basic(setting_tab1_basic);
			this.setting_tab2_job(setting_tab2_job);
			this.setting_tab3_house(setting_tab3_house);
			this.setting_tab4_education(setting_tab4_education);
			this.setting_tab5_insurance(setting_tab5_insurance);

			// scene-0: S0
			this.edu1_title(S0.edu1_title);
			this.edu1_yochien(S0.edu1_yochien);
			this.edu1_syogakko(S0.edu1_syogakko);
			this.edu1_cyugakko(S0.edu1_cyugakko);
			this.edu1_koko(S0.edu1_koko);
			this.edu1_daigaku(S0.edu1_daigaku);
			this.edu1_sum(S0.edu1_sum);
			this.edu2_title(S0.edu2_title);
			this.edu2_yochien(S0.edu2_yochien);
			this.edu2_syogakko(S0.edu2_syogakko);
			this.edu2_cyugakko(S0.edu2_cyugakko);
			this.edu2_koko(S0.edu2_koko);
			this.edu2_daigaku(S0.edu2_daigaku);
			this.edu2_sum(S0.edu2_sum);
			this.edu3_title(S0.edu3_title);
			this.edu3_yochien(S0.edu3_yochien);
			this.edu3_syogakko(S0.edu3_syogakko);
			this.edu3_cyugakko(S0.edu3_cyugakko);
			this.edu3_koko(S0.edu3_koko);
			this.edu3_daigaku(S0.edu3_daigaku);
			this.edu3_sum(S0.edu3_sum);
			this.edu4_title(S0.edu4_title);
			this.edu4_yochien(S0.edu4_yochien);
			this.edu4_syogakko(S0.edu4_syogakko);
			this.edu4_cyugakko(S0.edu4_cyugakko);
			this.edu4_koko(S0.edu4_koko);
			this.edu4_daigaku(S0.edu4_daigaku);
			this.edu4_sum(S0.edu4_sum);
			this.class_btn_0(S0.class_btn_0);
			this.edu_total_sum(S0.edu_total_sum);
			this.popup_edu_icon_comment(S0.popup_edu_icon_comment);
			this.popup_edu_txt_comment(S0.popup_edu_txt_comment);


			// scene-1: S1
			if (isModalUpdate) {
				this.popup_edu_label_title(S1.popup_edu_label_title);
				this.spn_birth_yyyy(S1.spn_birth_yyyy);
				this.spn_birth_yyyy_v(S1.spn_birth_yyyy_v);
				this.spn_birth_mm(S1.spn_birth_mm);
				this.spn_birth_mm_v(S1.spn_birth_mm_v);
				this.spn_birth_dd(S1.spn_birth_dd);
				this.spn_birth_dd_v(S1.spn_birth_dd_v);
				this.btn_education_1_1(S1.btn_education_1_1);
				this.btn_education_2_1(S1.btn_education_2_1);
				this.btn_education_3_1(S1.btn_education_3_1);
				this.btn_education_4_1(S1.btn_education_4_1);
				this.btn_education_5_1(S1.btn_education_5_1);
				this.btn_education_6_1(S1.btn_education_6_1);
				this.btn_education_6_2(S1.btn_education_6_2);
				this.btn_education_6_3(S1.btn_education_6_3);
				this.btn_education_7_1(S1.btn_education_7_1);
				this.spn_kindergarten(S1.spn_kindergarten);
				this.spn_kindergarten_v(S1.spn_kindergarten_v);
				this.popup_edu2_label1(S1.popup_edu2_label1);
				this.popup_edu2_label2(S1.popup_edu2_label2);
				this.popup_edu2_label3(S1.popup_edu2_label3);
				this.popup_edu2_label4(S1.popup_edu2_label4);
				this.popup_edu2_label5(S1.popup_edu2_label5);
				this.popup_edu2_label6(S1.popup_edu2_label6);
				this.popup_edu_label_sum(S1.popup_edu_label_sum);
			}
		};
		this.onClick = function (target, id) {
			switch (id) {
				case 0:
					S0.onClick(target);
					this.setData(true);
					break;
			}
		};
		this.onClick_1 = function (data, event) {
			S1.onClick(data, event);
			this.setData(true);
		};
		this.onSelect = function (data, event) {
			S1.onSelect(data, event);
			this.setData(true);
		};
		this.saveData = function (id) {
			S1.save();
			this.setData(false);

			LMPS.closeModal();
		};
		this.discard = function () {
			LMPS.closeModal();
		};
		this.openModal = function (target, param) {
			viewModel.Sidemenu();
			S1.setup(param);
			this.setData(true);
			LMPS.openModal(target);
		};
		this.deleteData = function () {
			S1.delete();
			this.setData(true);
			LMPS.closeModal();
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
			//		Calc.logicALL_Go();
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

		// JSONの読み込み&編集可能JSONデータをwebstorageから読み込み
		DB.db.loadStorage();
		// モデルケースを設定 引数にモデルケース番号
		DB.loadModelcase(id_modelcase);
		// 計算ロジック実行
		Calc.logicALL_Go();

		Logic05 = JSON.parse(LIFEPLAN.conf.storage.getItem("Logic05"));
	}

	function setup() {
		m_modelClass = Module.getModelClass(id_modelcase);
		if (id_modelcase === 0) {
			setting_tab1_basic = '<span href="#"><span>基本</span><span>情報</span></span>';
			setting_tab2_job = '<span href="#"><span>職業</span><span class="dot">・</span><span>年収</span></span>';
			setting_tab3_house = '<span href="#"><span>住宅</span><span>プラン</span></span>';
			setting_tab4_education = '<a href="#" class="current"><span>教育</span><span>プラン</span></a>';
			setting_tab5_insurance = '<span href="#"><span>加入</span><span>保険</span></span>';
			simulation1 = '';
		} else {
			if (MC.id_lives === 1 || MC.id_lives_yotei === 1) {
				setting_tab1_basic = '<a href="#"><span>基本</span><span>情報</span></a>';
				setting_tab2_job = '<a href="#"><span>職業</span><span class="dot">・</span><span>年収</span></a>';
				setting_tab3_house = '<a href="#"><span>住宅</span><span>プラン</span></a>';
				setting_tab4_education = '<a href="#" class="current"><span>教育</span><span>プラン</span></a>';
				setting_tab5_insurance = '<a href="#"><span>加入</span><span>保険</span></a>';
				simulation1 = '<a class="button-diagnosis"></a>';
			} else {
				setting_tab1_basic = '<a href="#"><span>基本</span><span>情報</span></a>';
				setting_tab2_job = '<a href="#"><span>職業</span><span class="dot">・</span><span>年収</span></a>';
				setting_tab3_house = '<span href="#"><span>住宅</span><span>プラン</span></span>';
				setting_tab4_education = '<a href="#" class="current"><span>教育</span><span>プラン</span></a>';
				setting_tab5_insurance = '<a href="#"><span>加入</span><span>保険</span></a>';
				simulation1 = '<a class="button-diagnosis"></a>';
			}
		}

		S0.setup();
		S1.setup(0);
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