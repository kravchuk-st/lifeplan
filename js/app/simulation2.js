/* global LIFEPLAN */

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
	var Logic06;
	var Logic09;

	// DB MC をセットし計算ロジック実行
	init();

	// コンテンツ内共有変数
	var g_start_gen;
	var g_start_tai;
	var m_id_invest1;
	var m_id_invest2;
	var hasTab = true;
	var mTab = 0;
	var mRa_invest;
	var mSt_invest;

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
//		S4: {},
//		S5: {}
	};

	Scenes.S0 = (function () {
		var self;
		var mInfoHon;

		var S0 = function () {
			self = this;
		};

		var p = S0.prototype;

		p.setup = function () {

			mInfoHon = (60 <= MC.age_hon) ? 1 : 0;

			// 投資スタイル表示
			var mId_invest = (60 <= MC.age_hon) ? MC.id_tai_invest : MC.id_invest;
			var obj = DB.db.m_investstyle;
			Object.keys(obj).forEach(function (key) {
				if (Number(this[key].id_invest) === Number(mId_invest)) {
					// 2021/03/30 「型」を付けないよう修正
					//mSt_invest = this[key].st_invest + "型";
					mSt_invest = this[key].st_invest;
					mRa_invest = (this[key].ra_invest * 100).toFixed(1) + "%";
				}
			}, obj);


			var index = MC.id_invest;
			if (index > 0) {
				index--;
			}

			var sim1_spn_style = DB.get_investstyle_list();
			self.sim1_spn_style_1 = (sim1_spn_style[0] * 100).toFixed(1);
			self.sim1_spn_style_2 = (sim1_spn_style[1] * 100).toFixed(1);
			self.sim1_spn_style_3 = (sim1_spn_style[2] * 100).toFixed(1);

			self.sim1_tab_1 = true;

			// 配偶者が居ない場合は、配偶者タブを非表示にする
			if (!MC.is_kekkon()) {
				self.sim1_tab_1 = false;
			}

			self.update();
		};

		p.update = function () {
			// マネープランの設定

			//基本生活費
			//現役世代
			var mLivingcost;
			if (mInfoHon === 0) {
				mLivingcost = Logic05.Calc20_Seikatsu;
				//退職世代
			} else {
				mLivingcost = Logic05.Calc21_TaiSeikatsu;
			}
			self.edit_txt_simulation1 = Util.formatMoneyManNum(mLivingcost, 1);

			// 運用資金額
			// 2021/04/12 「マネープラン」画面で長期運用資金に値を設定したとき、運用資金額がゼロになる不具合を改修
//			if (mInfoHon === 0) {
//				// 現役時代 ( 0 固定 )
//				self.sim1_lbl_invest = "0";
//			} else {
//				// 退職時代
//				var investValue = 0;
//				if (MC.age_taisyoku_hon !== 20) {
//					investValue = Logic06.vUnyou[(MC.age_taisyoku_hon - 1) + getIndex(false)];
//				}
//				self.sim1_lbl_invest = Util.formatMoneyManNum(investValue, 0);
//			}
			if (MC.save_unyoshikin_gen === -1) {
				self.sim1_lbl_invest = "0";
			} else {
				self.sim1_lbl_invest = Util.formatMoneyManNum(MC.save_unyoshikin_gen, 0);
			}

			// 貯蓄・積立額
			var storeValue = MC.sm_saving1 + MC.sm_saving2;
			self.sim1_lbl_store = Util.formatMoneyManNum(storeValue, 0);


			// 投資スタイル
			var id_invest = (mInfoHon === 0) ? MC.id_invest : MC.id_tai_invest;

			// 2021/03/22 使用していない変数を削除
//			switch (Number(id_invest)) {
//				case 1:
//					self.invest_current_1 = "current";
//					self.invest_current_2 = "";
//					self.invest_current_3 = "";
//					break;
//				case 2:
//					self.invest_current_1 = "";
//					self.invest_current_2 = "current";
//					self.invest_current_3 = "";
//					break;
//				case 3:
//					self.invest_current_1 = "";
//					self.invest_current_2 = "";
//					self.invest_current_3 = "current";
//					break;
//			}

			// =======  以下 結果表示使用データ =====================

			var childEvent = Logic05.school;

			// 家族イベントを取得
			var familyEvent = getFamilyEvents();

			var familyEventsData = {
				childEvent: childEvent,
				familyEvent: familyEvent
			};

			// 現在のモデルケース情報から配偶者有無を取得 0:なし 1:あり
			var haiumu = MC.id_haiumu;
			var index = Logic06.index;
			var index_hai = getIndex(true);
			var ageC = Math.abs(index - index_hai);
			if (index > index_hai) {
				ageC *= -1;
			}
			// =======  ここまで 結果表示使用データ =====================
			// 将来資金収支分析グラフの描画

			new LIFEPLAN.graph.GraphSimulation2().drawGraph("canvas1", MC.age_hon, 0, MC.is_kekkon(), ageC);
			new LIFEPLAN.graph.GraphSimulation2().drawGraph("canvas2", MC.age_hon, 1, MC.is_kekkon(), ageC);

			// イベント表の描画
			new LIFEPLAN.graph.GraphEvent().drawGraphFamilyEvents("canvas-event-list-1", familyEventsData, MC.age_hon);
			new LIFEPLAN.graph.GraphEvent().drawGraphFamilyEvents("canvas-event-list-2", familyEventsData, MC.age_hon);

			// リザルト画面
			self.messageSt = "";
			self.st_mark = "";
			var iLifespanHai = 0;
			var mZandaka_tai = 0;

			var m_result_msg = DB.db.m_result_msg;

			if (MC.id_sex_hon === 1) {
				iLifespanHai = DB.get_banksetupinfo().age_life_m;
			} else if (MC.id_sex_hon === 2) {
				iLifespanHai = DB.get_banksetupinfo().age_life_w;
			}

			mZandaka_tai = Logic06.vShikin[iLifespanHai + index];

			for (var i = 0; i < m_result_msg.length; i++) {
				if (mZandaka_tai > m_result_msg[i].sm_assets) {
					self.st_mark = m_result_msg[i].st_mark;
					self.messageSt = m_result_msg[i].st_message;
					break;
				}
			}
		};

		return S0;
	})();

	// 診断結果画面モーダル
	Scenes.S1 = (function () {
		var self;

		var S1 = function () {
			self = this;
		};

		var p = S1.prototype;

		p.setup = function () {


			self.update();
		};

		p.update = function () {


		};

		return S1;
	})();

	// 基本生活費モーダル
	Scenes.S2 = (function () {
		var self;
		var mTab;
		var mLivingcost;

		var popup_sim1_tedori;

		var S2 = function () {
			self = this;
		};

		var p = S2.prototype;

		p.setup = function (param) {
			var cur = MC.age_hon + getIndex(false);

			mTab = param;

			//現役世代
			if (mTab === 0) {
				mLivingcost = MC.save_kihon_gen;
				if (mLivingcost === -1) {
					mLivingcost = Logic05.dSeikatsu[cur];
				}
				//退職世代
			} else {
				mLivingcost = MC.save_kihon_tai;
				if (mLivingcost === -1) {
					mLivingcost = Logic05.dTaiSeikatsu[cur];
				}
			}

			self.popup_sim1_edit_livingcost = Util.formatMoney(mLivingcost, 0);

			self.update();
		};

		p.update = function () {
			// 2021/04/12 デッドコード削除。「必要保障額分析」画面では「基本生活費（月額）」モーダルを表示していないため、
			//            「基本生活費（月額）」モーダルに使用する変数、および、その編集コードを削除した。
			//            今後「基本生活費（月額）」モーダルを表示する場合は、simulasion1.jsから同コードをここにコピーすればよい。
		};


		return S2;
	})();

	// イベントモーダル
	Scenes.S3 = (function () {
		var self;
		var mEvent;
		var mAge_hon;
		var eventID;		// イベントID
		var eventIndex;		// イベントインデックス( 編集時のみ利用 )
		var editEvent;		// 編集時のイベントデータ
		var ageList = [];		// 歳リスト

		var mAge;	// 歳
		var mYosan;	// 予算額
		var isNew;	// 新規or編集の判断

		var S3 = function () {
			self = this;
		};

		var p = S3.prototype;

		p.setup = function (isnew, event, age_hon, key) {

			mEvent = event;
			mAge_hon = age_hon;
			isNew = isnew;
			eventIndex = key;
			eventID = (mEvent === "結婚") ? 1 : 0;

			mAge = null;
			mYosan = null;


			// ボタンの表示変更
			if (isNew) {
				self.popup_delete = false;
				self.popup_close = "登録する";
			} else {
				self.popup_delete = true;
				self.popup_close = "設定を変更する";
				// 編集する対象のイベントを取得
				var events = MC.get_event_list();
				// M_add_start
				// 結婚イベントを探す
				if (key < 0) {
					for (var i = 0; i < events.length; i++) {
						if (events[i].id_event == 1) {
							editEvent = events[i];
							break;
						}
					}
				} else {
					editEvent = events[eventIndex];
				}
				// M_add_end
			}

			if (eventID === 1) {
				// 結婚年齢のリストを作成
				ageList = DB.getNumberList(0, MC.age_kekkon, MC.age_kekkon, "", "");
			} else {
				// n 歳時用のリストを作成
				ageList = DB.getNumberList(0, MC.age_hon, 99, "", "");
			}
			self.popup_event_age = ageList;

			self.update();
		};

		p.update = function () {
			var ageIndex = 0;

			if (isNew) {
				// 登録データの設定
				if (mAge) {
					ageIndex = mAge - MC.age_hon;
					if (ageIndex >= ageList.length) {
						ageIndex = ageList.length - 1;
					}
				}
			} else {
				// 初期データの設定
				if (!mAge) {
					mAge = editEvent.no_age;
				}
				if (!mYosan) {
					mYosan = editEvent.sm_yosan;
				}

				ageIndex = mAge - MC.age_hon;
				if (ageIndex >= ageList.length) {
					ageIndex = ageList.length - 1;
				}
			}

			self.popup_event_age_v = self.popup_event_age[ageIndex];
			// M_add_start
			//self.popup_event_yosangaku = Util.formatMoneyManNum(mYosan, 0);
			self.popup_event_yosangaku = Module.commafy(Util.excelRound(mYosan, 0));
			// M_add_end

		};

		p.onSelect = function (id, event) {
			var index = event.target.selectedIndex;

			if (id === "popup_event_age") {
				mAge = parseInt(ageList[index]);
			}
			self.update();
		};

		p.onCalcFinish = function (v) {
			var value;
			switch (v) {
				case "popup_event_yosangaku":
					// M_add_start
					//value = Module.toFilteredNum(viewModel.popup_event_yosangaku()) * 10000;
					value = Module.toFilteredNum(viewModel.popup_event_yosangaku());
					// M_add_end

					// 上限あり
					if (value > 99990000) {
						// M_add_start
						//value = 99990000;
						value = 99999999;
						// M_add_end
					}

					mYosan = value;
					self.update();
					break;
			}
		};

		p.isValid = function () {
			var list = MC.get_event_list();
			mAge = (mAge) ? mAge : Number(self.popup_event_age_v);
			var count = 0;
			for (var i = 0; i < list.length; i++) {
				if (list[i].no_age === mAge) {
					count++;
				}
			}
			if (count >= 2) {
				alert("同一年齢で登録できるイベントは２つまでです。");
				return false;
			}

			if (0 < mYosan && (99999999) < mYosan) {
				alert("予算額は9999万円を超えない金額を入力してください");
				return false;
			}

			// 受入No.81 本人同一年齢での登録が2件を超える場合
			// 既存イベントの中でeventIDとageが同じものがあればfalse
			// ⇒ノーチェックに仕様変更

			return true;
		};

		p.onClickClose = function (v) {
			switch (v) {
				case "popup_cancel":
					LMPS.closeModal();
					break;
				case "popup_change":
					if (self.isValid()) {

						if (mYosan !== 0 && mYosan !== null) {
							// 予算額: 0 は入力できない仕様に設定済み
							if (isNew) {
								// イベント名mEventからid_eventを取得
								var mIdEvent;
								var eventKeys = Object.keys(DB.db.m_event);
								for (var i = 0; i < eventKeys.length; i++) {
									if (DB.db.m_event[eventKeys[i]].st_event === mEvent) {
										mIdEvent = DB.db.m_event[eventKeys[i]].id_event;
									}
								}

								var newData = {};
								newData.id_event = mIdEvent;
								newData.id_line = 1;
								newData.id_modelcase = id_modelcase;
								newData.no_age = (mAge) ? mAge : Number(self.popup_event_age_v);
								newData.sm_yosan = mYosan;

								var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase_event"));
								data.push(newData);
								LIFEPLAN.conf.storage.setItem("lp_modelcase_event", JSON.stringify(data));

							} else {

								var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase_event"));
								for (var i = 0; i < data.length; i++) {
									if (Number(data[i].id_event) === Number(editEvent.id_event) &&
													Number(data[i].id_line) === Number(editEvent.id_line) &&
													Number(data[i].id_modelcase) === Number(editEvent.id_modelcase) &&
													Number(data[i].no_age) === Number(editEvent.no_age) &&
													Number(data[i].sm_yosan) === Number(editEvent.sm_yosan)) {
										data[i].no_age = mAge;
										data[i].sm_yosan = mYosan;
									}
								}
								LIFEPLAN.conf.storage.setItem("lp_modelcase_event", JSON.stringify(data));
							}

							init();
							setup();
						}
						LMPS.closeModal();
					}
					break;
				case "popup_delete":
					if (eventIndex >= 0) {

						var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase_event"));
						var sub = [];
						for (var i = 0; i < data.length; i++) {
							if (Number(data[i].id_event) === Number(editEvent.id_event) &&
											Number(data[i].id_line) === Number(editEvent.id_line) &&
											Number(data[i].id_modelcase) === Number(editEvent.id_modelcase) &&
											Number(data[i].no_age) === Number(editEvent.no_age) &&
											Number(data[i].sm_yosan) === Number(editEvent.sm_yosan)) {
								continue;
							}
							sub.push(data[i]);
						}
						LIFEPLAN.conf.storage.setItem("lp_modelcase_event", JSON.stringify(sub));
					// M_add_start
					} else {
						var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase_event"));
						var sub = [];
						for (var i = 0; i < data.length; i++) {
							if (Number(data[i].id_event) == 1) {
								data[i].sm_yosan = 0;
							}
							sub.push(data[i]);
						}
						LIFEPLAN.conf.storage.setItem("lp_modelcase_event", JSON.stringify(sub));
					}
					// M_add_end
					init();
					setup();
					LMPS.closeModal();
					break;
			}
		};

		return S3;
	})();

	var S0 = new Scenes.S0();
	var S1 = new Scenes.S1();
	var S2 = new Scenes.S2();
	var S3 = new Scenes.S3();

	if (MC.age_hon <= 34) {
		g_start_gen = 20;
		g_start_tai = 56;
	} else if (MC.age_hon <= 59) {
		g_start_gen = 35;
		g_start_tai = 60;
	} else if (MC.age_hon <= 69) {
		g_start_gen = 60;
		g_start_tai = 60;
	} else {
		g_start_gen = 20;
		g_start_tai = 56;
	}

	var getFamilyEvents = function () {

		var familyEvent = [];
		var age;

		// 固定イベント
		var settingLine = 1;
		// イベント追加
		age = MC.age_kekkon;		// 結婚
		if (0 < age) {
			familyEvent.push({age_hon: age, event: "結婚", line: settingLine});
		}

		age = MC.age_jyutaku;		// 住宅
		if (0 < age) {
			familyEvent.push({age_hon: age, event: "住宅", line: settingLine});
		}

		age = MC.age_taisyoku_hon;	// 退職
		if (0 < age) {
			familyEvent.push({age_hon: age, event: "退職", line: settingLine});
		}

		// ユーザー設定のイベント
		var events = MC.m_modelcase_event;
		var editableLine = 2;
		var title;
		for (var i = 0; i < events.length; i++) {
			var event = events[i];
			age = event.no_age;
			title = DB.get_event(event.id_event).st_event;

			if (0 < age && event.id_event !== 1 && 0 < title.length) {
				familyEvent.push({age_hon: age, event: title, line: editableLine, m_modelcase_event_key: i});
			}
		}
		return familyEvent;
	};

	setup();

	var ViewModel = function () {
		// S0
		this.st_mark = ko.observable(S0.st_mark);
		this.messageSt = ko.observable(S0.messageSt);
		this.sim1_tab_1 = ko.observable(S0.sim1_tab_1);
		this.edit_txt_simulation1 = ko.observable(S0.edit_txt_simulation1);
		this.sim1_lbl_invest = ko.observable(S0.sim1_lbl_invest);
		this.sim1_lbl_store = ko.observable(S0.sim1_lbl_store);
		// 2021/03/22 使用していない変数を削除
//		this.invest_current_1 = ko.observable(S0.invest_current_1);
//		this.invest_current_2 = ko.observable(S0.invest_current_2);
//		this.invest_current_3 = ko.observable(S0.invest_current_3);
		this.mSt_invest = mSt_invest;
		this.mRa_invest = mRa_invest;

		// S2
		this.popup_sim1_tedori = ko.observable(S2.popup_sim1_tedori);
		this.popup_sim1_tedori_year = ko.observable(S2.popup_sim1_tedori_year);
		this.popup_sim1_edit_livingcost = ko.observable(S2.popup_sim1_edit_livingcost);
		this.popup_sim1_livingcost_year = ko.observable(S2.popup_sim1_livingcost_year);
		this.popup_sim1_jyutaku = ko.observable(S2.popup_sim1_jyutaku);
		this.popup_sim1_jyutaku_year = ko.observable(S2.popup_sim1_jyutaku_year);
		this.popup_sim1_kyouiku = ko.observable(S2.popup_sim1_kyouiku);
		this.popup_sim1_kyouiku_year = ko.observable(S2.popup_sim1_kyouiku_year);
		this.popup_sim1_seimei = ko.observable(S2.popup_sim1_seimei);
		this.popup_sim1_seimei_year = ko.observable(S2.popup_sim1_seimei_year);
		this.popup_sim1_tsumitate = ko.observable(S2.popup_sim1_tsumitate);
		this.popup_sim1_tsumitate_year = ko.observable(S2.popup_sim1_tsumitate_year);
		this.popup_sim1_kabusoku = ko.observable(S2.popup_sim1_kabusoku);
		this.popup_sim1_kabusoku_year = ko.observable(S2.popup_sim1_kabusoku_year);

		// S3
		this.popup_event_age = ko.observableArray(S3.popup_event_age);
		this.popup_event_age_v = ko.observable(S3.popup_event_age_v);
		this.popup_event_yosangaku = ko.observable(S3.popup_event_yosangaku);
		this.popup_delete = ko.observable(S3.popup_delete);
		this.popup_close = ko.observable(S3.popup_close);

		this.setData = function () {
			// S0
			this.sim1_tab_1(S0.sim1_tab_1);
			this.edit_txt_simulation1(S0.edit_txt_simulation1);
			this.sim1_lbl_invest(S0.sim1_lbl_invest);
			this.sim1_lbl_store(S0.sim1_lbl_store);
			// 2021/03/22 使用していない変数を削除
//			this.invest_current_1(S0.invest_current_1);
//			this.invest_current_2(S0.invest_current_2);
//			this.invest_current_3(S0.invest_current_3);

			// S2
			this.popup_sim1_tedori(S2.popup_sim1_tedori);
			this.popup_sim1_tedori_year(S2.popup_sim1_tedori_year);
			this.popup_sim1_edit_livingcost(S2.popup_sim1_edit_livingcost);
			this.popup_sim1_livingcost_year(S2.popup_sim1_livingcost_year);
			this.popup_sim1_jyutaku(S2.popup_sim1_jyutaku);
			this.popup_sim1_jyutaku_year(S2.popup_sim1_jyutaku_year);
			this.popup_sim1_kyouiku(S2.popup_sim1_kyouiku);
			this.popup_sim1_kyouiku_year(S2.popup_sim1_kyouiku_year);
			this.popup_sim1_seimei(S2.popup_sim1_seimei);
			this.popup_sim1_seimei_year(S2.popup_sim1_seimei_year);
			this.popup_sim1_tsumitate(S2.popup_sim1_tsumitate);
			this.popup_sim1_tsumitate_year(S2.popup_sim1_tsumitate_year);
			this.popup_sim1_kabusoku(S2.popup_sim1_kabusoku);
			this.popup_sim1_kabusoku_year(S2.popup_sim1_kabusoku_year);

			// S3
			this.popup_event_age(S3.popup_event_age);
			this.popup_event_age_v(S3.popup_event_age_v);
			this.popup_event_yosangaku(S3.popup_event_yosangaku);
			this.popup_delete(S3.popup_delete);
			this.popup_close(S3.popup_close);
		};

		this.onClickClose = function (target, id) {
			switch (id) {
				case 0:
					break;
				case 1:
					break;
				case 2:
					break;
				case 3:
					S3.onClickClose(target);
					this.setData();
					break;
			}
		};

		this.onSelect = function (target, id, event) {
			// クリックイベントを無視
			if (event.type !== "click") {
				switch (id) {
					case 0:
						break;
					case 1:
						break;
					case 2:
						break;
					case 3:
						S3.onSelect(target, event);
						this.setData();
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
			}
		};

		this.changeInvest = function () {
		};

		this.onClick = function (target) {
			switch (target) {
				case "simulation_tab1":
					window.location.href = 'simulation1.html';
					break;
				case "simulation_tab2":

					break;
				case "simulation_tab3":
					window.location.href = 'simulation3.html';
					break;
				case "goto_setting":
					window.location.href = 'setting_tab1_basic.html';
					break;
				case "#modal-2":
					LMPS.openModal(target);
					break;
				case "#modal-3": // 車
					S3.setup(true, "車", null, null);
					viewModel.setData();
					LMPS.openModal('#modal-3');
					break;
				case "#modal-4": // 改築
					S3.setup(true, "改築", null, null);
					viewModel.setData();
					LMPS.openModal('#modal-4');
					break;
				case "#modal-5": // 旅行
					S3.setup(true, "旅行", null, null);
					viewModel.setData();
					LMPS.openModal('#modal-5');
					break;
				case "sim1_tab_1":

					S0.update();
					LMPS.prevPanel();
					break;
				case "sim1_tab_2":

					S0.update();
					LMPS.nextPanel();
					break;
			}

			this.setData();
		};

		// サイドメニュー表示制御
		this.dispSidemenu = ko.observable(dispSidemenu);
		this.Sidemenu = function (target) {
			dispSidemenu = false;
			this.dispSidemenu(dispSidemenu);
			if (target) {
				LMPS.openModal(target)
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
		Logic06 = JSON.parse(LIFEPLAN.conf.storage.getItem("Logic06"));
		Logic09 = JSON.parse(LIFEPLAN.conf.storage.getItem("Logic09"));

	}

	function setup() {
		S0.setup();
		S2.setup(0);
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

	LIFEPLAN.openEventModal = function (event, age_hon, key) {
		viewModel.Sidemenu();
		// 開くタイミングによってはS3内に記述する
		switch (event) {
			case "車":
				S3.setup(false, event, age_hon, key);
				viewModel.setData();
				LMPS.openModal('#modal-3');
				break;
			case "改築":
				S3.setup(false, event, age_hon, key);
				viewModel.setData();
				LMPS.openModal('#modal-4');
				break;
			case "旅行":
				S3.setup(false, event, age_hon, key);
				viewModel.setData();
				LMPS.openModal('#modal-5');
				break;
			// M_add_start
			case "結婚":
				S3.setup(false, event, age_hon, key);
				viewModel.setData();
				LMPS.openModal('#modal-6');
				break;
			// M_add_end
		}
	};
};
