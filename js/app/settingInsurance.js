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
	var Logic09;

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
	// タブ番号 1個目は1（data-tabcontent="tab#" 独身の場合 1:本人、3:その他、既婚の場合 1:本人、2:配偶者、3:その他）
	var mTab;
	// 保険一覧の行 1行目は0（data-bind="css: class_row_#" 0行目、1行目、…）
	var mPos;


	var Scenes = {
		S0: {},
		S1: {}
	};

	// 保険一覧画面
	Scenes.S0 = (function () {
		var self;

		var S0 = function () {
			self = this;
		};

		var p = S0.prototype;

		p.setup = function (id) {
			if (id) {
				mTab = id;
			} else {
				mTab = 1;
			}

			self.update();
		};

		p.update = function (id) {

			if (id) {
				mTab = id;
			}

			var total_hokenryo = 0;
			var total_ichiji = 0;
			var total = 0;
			var ichiji, all, getsugaku;
			if (mTab === 1) {
				ichiji = Logic09.vIchijiHo_hon;
				all = Logic09.vSumHo_hon;
				getsugaku = Logic09.vGetsuHo_hon;
				self.setting_insurance_right = true;
			} else if (mTab === 2) {
				ichiji = Logic09.vIchijiHo_hai;
				all = Logic09.vSumHo_hai;
				getsugaku = Logic09.vGetsuHo_hai;
				self.setting_insurance_right = true;
			} else {
				ichiji = Logic09.vIchijiHo_hon;
				all = Logic09.vSumHo_hon;
				getsugaku = Logic09.vGetsuHo_hon;
				self.setting_insurance_right = false;
			}
			for (var a = 0; a < ichiji.length; a++) {
				total_ichiji += ichiji[a];
			}
			for (var a = 0; a < all.length; a++) {
				total += all[a];
			}
			for (var a = 0; a < getsugaku.length; a++) {
				total_hokenryo += getsugaku[a];
			}
			var s = "月額 " + Util.formatMoney(total_hokenryo, 0);
			self.setting_ins_txt_month = s;
			s = "一時払 " + Util.formatMoney(total_ichiji, 0);
			self.setting_ins_txt_ichiji = s;
			s = Util.formatMoney(total, 0);
			self.setting_ins_txt_total = s;

			if (MC.is_kekkon()) {
				self.tab_insurance1_2 = true;
			} else {
				self.tab_insurance1_2 = false;
			}
			if (mTab === 2) {
				self.setting_insurance_right_title = "配偶者様の保障内容";
			} else if (mTab === 3) {
				self.setting_insurance_right_title = "その他の保障内容";
			} else {
				self.setting_insurance_right_title = "ご本人様の保障内容";
			}

			self.setItemData();

			if (id_modelcase !== 0) {
				var ls = DB.db.get_lifestyle(MC.id_modelcase, 99 + mTab);
				if (ls.st_message !== " " && ls.st_message !== "") {
					self.popup_ins_icon_comment = true;
					s = ls.st_message;
					s = s.replace(/・/g, '');
					self.popup_ins_txt_comment = s;
				} else {
					self.popup_ins_icon_comment = false;
					s = "";
				}
			}


			// 保証内容描画
			// 保険料描画
			// 横棒グラフ描画
			//*********** グラフ初期表示のフィルターは MCを渡したほうがいいかもしれない
			switch (mTab) {
				case 1:
					new LIFEPLAN.graph.GraphInsurance().drawGraphInsurance("canvas1", DB, mTab, MC);
					break;
				case 2:
					new LIFEPLAN.graph.GraphInsurance().drawGraphInsurance("canvas2", DB, mTab, MC);
					break;
			}
		};

		p.setItemData = function () {

			var mList = MC.get_hoken_list(mTab);
			var list = DB.get_insgoods_list();
			self.item_list = [];
			self.class_row = [];
			self.class_btn = [];


			for (var i = 0; i < 8; i++) {
				if (i < mList.length) {
					var id = mList[i].id_goods;
					self.item_list.push(list[id - 1].st_goodsname);
					self.class_row.push("settled");
					self.class_btn.push("edit");
				} else {
					self.item_list.push("保険を追加...");
					self.class_row.push("new");
					self.class_btn.push("add");
				}
			}
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
					if (id_modelcase !== 0) {
						window.location.href = 'setting_tab4_education.html';
					}
					break;
				case "setting_tab5":
					break;
				case "goto_simulation":
					window.location.href = 'simulation1.html';
					break;
			}
		};

		return S0;
	})();

	// 個別保険編集画面
	Scenes.S1 = (function () {
		var self;
		var mGoods;
		var mList;
		var mItem;

		var S1 = function () {
			self = this;
		};

		var p = S1.prototype;

		p.setup = function (tab, pos) {
			mTab = tab;
			mPos = pos;

			// 開いているタブの対象 登録済み保険リストを格納

			mList = MC.get_hoken_list(mTab);
			mItem = DB.Lp_modelcase_hoken;

			if (mPos >= mList.length) {
				//新規商品追加
				self.popup_delete = false;
				mItem.clear();
			} else {
				// 対象ポジションの登録済み保険を格納 ＝ mItem 開いている基準の保険情報
				self.popup_delete = true;
				mItem.copy(mList[mPos]);
			}
			// 新規登録用 空のmItemだった場合の初期設定
			if (mItem.id_goods === 0) {
				mItem.id_goods = 1;
			}
			mItem.id_honhai = mTab;

			var s;
			s = "保険商品：";
			if (mTab === 2) {
				s += "配偶者様";
			} else if (mTab === 3) {
				s += "その他";
			} else {
				s += "ご本人様";
			}
			s += "：" + String(mPos + 1) + "番目の商品";

			self.popup_insurance1_title = s;

			// mItemからid_goodsを取得
			var id_goods = mItem.id_goods;
			var list = DB.get_insgoods_list();

			mGoods = [];
			var name = [];
			var count = 0;
			var index = 0;
			for (var i = 0; i < list.length; i++) {
				if ((mTab === 3 && list[i].id_insclass === 8) ||
								(mTab !== 3 && list[i].id_insclass !== 8)) {
					mGoods[count] = list[i];
					name[count] = list[i].st_goodsname;
					if (id_goods === list[i].id_goods) {
						index = count;
					}
					count++;
				}
			}

			// 初期位置はmItemの商品にする
			self.spn_goods = name;
			self.spn_goods_v = name[index];


			var list_policy = ["本人", "配偶者"];
			var list_policy_dokushin = ["本人"];

			var policy = mItem.id_policy;

			if (MC.is_kekkon()) {
				if (policy > 0) {
					policy--;
				}
				self.spn_policy = list_policy;
				self.spn_policy_v = list_policy[policy];
			} else {
				policy = 0;
				self.spn_policy = list_policy_dokushin;
				self.spn_policy_v = list_policy_dokushin[policy];
			}

			// 契約年齢のスピナーを作成
			var age = MC.get_age(mItem.id_policy === 2);
			var agelist = DB.getNumberList(0, 20, age + 3, "", "歳");
			var keiyaku = mItem.age_keiyaku;
			if (keiyaku !== 0) {
				keiyaku -= 20;
			}
			//実年齢+3より契約年齢が上だった場合、スピナーのindex値を実年齢+3にする
			if (keiyaku > age - 20 + 3) {
				keiyaku = age - 20 + 3;
			}
			self.spn_age_keiyaku = agelist;
			self.spn_age_keiyaku_v = agelist[keiyaku];

			// 保険料 保険金を設定
			self.popup_ins_txt_hokenryo = Module.toMoneyManNum(String(mItem.sm_hokenryo));
			self.popup_ins_txt_hokenkin = Module.toMoneyManNum(String(mItem.sm_hokenkin));

			self.update(mGoods[index].id_goods);
		};

		p.update = function (goodsId) {
			var age = MC.get_age(mItem.id_policy === 2);
			var agelist = DB.getNumberList(0, 20, age + 3, "", "歳");
			var keiyaku = mItem.age_keiyaku;
			if (keiyaku !== 0) {
				keiyaku -= 20;
			}
			//実年齢+3より契約年齢が上だった場合、スピナーのindex値を実年齢+3にする
			if (keiyaku > age - 20 + 3) {
				keiyaku = age - 20 + 3;
			}
			self.spn_age_keiyaku = agelist;
			self.spn_age_keiyaku_v = agelist[keiyaku];

			// mItem の商品IDで商品マスター配列を照会し、商品プロファイルを取得する
			var goods = goodsId ? DB.get_insgoods(goodsId) : DB.get_insgoods(mItem.id_goods);

			// 商品プロファイルから取得した払込方法リストのIDを用いて、画面の払込方法リストの配列と選択値と払込期間の行の表示可否を再設定
			// mItem.id_haraikomiは払込方法のIDだが、goods.id_haraikomiは払込方法リストのID
			if (goods.id_haraikomi === 0) {
				var list_haraikomi = ["一時払い"];
				self.spn_haraikomi = list_haraikomi;
				self.spn_haraikomi_v = list_haraikomi[0];
				self.popup_ins_row_age_haraikomi = false;
			} else {
				var list_haraikomi = ["月払い", "年払い"];
				var haraikomi = mItem.id_haraikomi;
				if (haraikomi === 12) {
					haraikomi = 1;
				} else {
					haraikomi = 0;
				}
				self.spn_haraikomi = list_haraikomi;
				self.spn_haraikomi_v = list_haraikomi[haraikomi];
				self.popup_ins_row_age_haraikomi = true;
			}

			// 商品プロファイルから取得した保険金表示名を用いて、画面の保険金の行の表示可否と表示名（「保険金、学資金…」等）を再設定
			if (goods.st_hokenkin.length === 0) {
				self.popup_ins_row_hokenkin = false;
			} else {
				self.popup_ins_row_hokenkin = true;
			}
			self.popup_ins_label_hokenkin = goods.st_hokenkin;

			// 商品プロファイルから取得した期間1表示名を用いて、画面の期間1の行の表示可否と表示名（「保険期間、受取開始」等）を再設定
			if (goods.st_kikan1.length === 0) {
				self.popup_ins_row_kikan1 = false;
			} else {
				self.popup_ins_row_kikan1 = true;
			}
			self.popup_ins_label_kikan1 = goods.st_kikan1;

			// 商品プロファイルから取得した期間2表示名を用いて、画面の期間2の行の表示可否と表示名（「年金期間」等）を再設定
			if (goods.st_kikan2.length === 0) {
				self.popup_ins_row_kikan2 = false;
			} else {
				self.popup_ins_row_kikan2 = true;
			}
			self.popup_ins_label_kikan2 = goods.st_kikan2;

			// 新規登録 未設定スピナーの初期値登録
			if (mPos >= mList.length) {
				self.setSpnParams();
			}
			
			// 2021/02/22 update_keiyakuage()の呼び出し元の個所が錯綜しているのを正した。
			self.update_keiyakuage();

		};

		// 契約年齢に応じて、払込期間、期間1、期間2のリストを再設定する
		p.update_keiyakuage = function () {
			var goods = DB.get_insgoods(mItem.id_goods);

			var list_age_haraikomi = DB.getNumberList(0, mItem.age_keiyaku, 99, "", "歳");
			var age_haraikomi = mItem.age_haraikomi;
			if (age_haraikomi > 0) {
				// 2021/02/22 払込期間（終了年齢） <= 契約年齢 の場合、払込期間（終了年齢）を契約年齢に更新する
				if (mItem.age_haraikomi <= mItem.age_keiyaku) {
					mItem.age_haraikomi = mItem.age_keiyaku;
				}
				age_haraikomi -= mItem.age_keiyaku;
			}
			self.spn_age_haraikomi = list_age_haraikomi;
			self.spn_age_haraikomi_v = list_age_haraikomi[age_haraikomi];

			if (goods.id_syushin === 1) {
				if (goods.st_kikan2.length === 0) {
					//期間1を終身、期間2を非表示
					var list_kikan1 = ["終身"];
					self.spn_kikan1 = list_kikan1;
					self.spn_kikan1_v = list_kikan1[0];
				} else {
					//期間1を選択、期間2を終身
					var list_kikan1 = DB.getNumberList(0, mItem.age_keiyaku, 99, "", "歳");
					var kikan1 = mItem.id_kikan1;
					if (kikan1 > 0) {
						// 2021/02/22 期間1（終了年齢） <= 契約年齢 の場合、期間1（終了年齢）を契約年齢に更新する
						if (mItem.id_kikan1 <= mItem.age_keiyaku) {
							mItem.id_kikan1 = mItem.age_keiyaku;
						}
						kikan1 -= mItem.age_keiyaku;
					}
					self.spn_kikan1 = list_kikan1;
					self.spn_kikan1_v = list_kikan1[kikan1];
					var list_kikan2 = ["終身"];
					self.spn_kikan2 = list_kikan2;
					self.spn_kikan2_v = list_kikan2[0];
				}
			} else {
				// 2021/02/22 設定編集画面（加入保険モーダル）の保険期間セレクトは初期値20歳が表示されているが、
				//            計算用変数には0が設定されている。20になるように修正。
				if (mItem.id_kikan1 === 0) {
					mItem.id_kikan1 = 20;
				}
				var list_kikan1 = DB.getNumberList(0, mItem.age_keiyaku, 99, "", "歳");
				var kikan1 = mItem.id_kikan1;
				if (kikan1 > 0) {
					// 2021/02/22 期間1（終了年齢） <= 契約年齢 の場合、期間1（終了年齢）を契約年齢に更新する
					if (mItem.id_kikan1 <= mItem.age_keiyaku) {
						mItem.id_kikan1 = mItem.age_keiyaku;
					}
					kikan1 -= mItem.age_keiyaku;
				}
				self.spn_kikan1 = list_kikan1;
				self.spn_kikan1_v = list_kikan1[kikan1];
				if (goods.st_kikan2.length > 0) {
					// 2021/02/22 設定編集画面（加入保険モーダル）の年金期間セレクトは初期値20歳が表示されているが、
					//            計算用変数には0が設定されている。20になるように修正。
					if (mItem.id_kikan2 === 0 || mItem.id_kikan2 === "") {
						mItem.id_kikan2 = 20;
					}
					var list_kikan2 = DB.getNumberList(0, mItem.age_keiyaku, 99, "", "歳");
					var kikan2 = mItem.id_kikan2;
					if (kikan2 > 0) {
						// 2021/02/22 期間2（終了年齢） <= 契約年齢 の場合、期間2（終了年齢）を契約年齢に更新する
						if (mItem.id_kikan2 <= mItem.age_keiyaku) {
							mItem.id_kikan2 = mItem.age_keiyaku;
						}
						kikan2 -= mItem.age_keiyaku;
					}
					self.spn_kikan2 = list_kikan2;
					self.spn_kikan2_v = list_kikan2[kikan2];
				}
			}
		};

		p.onSelect = function (data, event) {
			var outer = event.target.outerHTML;
			var id;
			var index = event.target.selectedIndex;

			if (~outer.indexOf('spn_goods')) {
				id = 'spn_goods';
			} else if (~outer.indexOf('spn_haraikomi')) {
				id = 'spn_haraikomi';
			} else if (~outer.indexOf('spn_age_haraikomi')) {
				id = 'spn_age_haraikomi';
			} else if (~outer.indexOf('spn_age_keiyaku')) {
				id = 'spn_age_keiyaku';
			} else if (~outer.indexOf('spn_kikan1')) {
				id = 'spn_kikan1';
			} else if (~outer.indexOf('spn_kikan2')) {
				id = 'spn_kikan2';
			} else if (~outer.indexOf('spn_policy')) {
				id = 'spn_policy';
			}

			switch (id) {
				case "spn_goods":
					mItem.id_goods = mGoods[index].id_goods;
					self.setGoods();
					//self.update_keiyakuage();
					self.update();
					break;
				case "spn_haraikomi":
					if (index === 0) {
						index = 1;
					} else {
						index = 12;
					}
					mItem.id_haraikomi = index;
					self.update();
					break;
				case "spn_age_haraikomi":
					mItem.age_haraikomi = index + mItem.age_keiyaku;
					self.update_keiyakuage();
					break;
				case "spn_age_keiyaku":
					mItem.age_keiyaku = index + 20;
					self.setAgeKeiyaku();
					self.update_keiyakuage();
					break;
				case "spn_kikan1":
					mItem.id_kikan1 = index + mItem.age_keiyaku;
					self.update_keiyakuage();
					break;
				case "spn_kikan2":
					mItem.id_kikan2 = index + mItem.age_keiyaku;
					self.update_keiyakuage();
					break;
				case "spn_policy":
					mItem.id_policy = index + 1;
					self.setPolicy();
					self.update();
					break;
			}
		};

		p.MoneyUpdate = function (data, event) {
			var outer = event.target.outerHTML;
			var id;
			var data = event.target.value;

			if (~outer.indexOf('popup_ins_txt_hokenryo')) {
				id = 'popup_ins_txt_hokenryo';
			} else if (~outer.indexOf('popup_ins_txt_hokenkin')) {
				id = 'popup_ins_txt_hokenkin';
			}

			while (data.match(/[^0-9]+/)) {
				data = data.replace(/[^0-9]+/, '');
			}

			switch (id) {
				case "popup_ins_txt_hokenryo":
					mItem.sm_hokenryo = (Number(data) > 99999999) ? 99999999 : Number(data);
					self.popup_ins_txt_hokenryo = Module.toMoneyManNum(String(mItem.sm_hokenryo));
					break;
				case "popup_ins_txt_hokenkin":
					mItem.sm_hokenkin = (Number(data) > 999990000) ? 999990000 : Number(data);
					self.popup_ins_txt_hokenkin = Module.toMoneyManNum(String(mItem.sm_hokenkin));
					break;
			}
		};

		p.setGoods = function () {
			// mItemからid_goodsを取得
			var id_goods = mItem.id_goods;
			var list = DB.get_insgoods_list();
			mGoods = [];
			var name = [];
			var count = 0;
			var index = 0;
			for (var i = 0; i < list.length; i++) {
				if ((mTab === 3 && list[i].id_insclass === 8) ||
								(mTab !== 3 && list[i].id_insclass !== 8)) {
					mGoods[count] = list[i];
					name[count] = list[i].st_goodsname;
					if (id_goods === list[i].id_goods) {
						index = count;
					}
					count++;
				}
			}
			self.spn_goods = name;
			self.spn_goods_v = name[index];
		};

		p.setPolicy = function () {
			var list_policy = ["本人", "配偶者"];
			var list_policy_dokushin = ["本人"];

			var policy = mItem.id_policy;

			if (MC.is_kekkon()) {
				if (policy > 0) {
					policy--;
				}
				self.spn_policy = list_policy;
				self.spn_policy_v = list_policy[policy];
			} else {
				policy = 0;
				self.spn_policy = list_policy_dokushin;
				self.spn_policy_v = list_policy_dokushin[policy];
			}
		};

		p.setAgeKeiyaku = function () {
			var age = MC.get_age(mItem.id_policy === 2);
			var agelist = DB.getNumberList(0, 20, age + 3, "", "歳");
			var keiyaku = mItem.age_keiyaku;
			if (keiyaku !== 0) {
				keiyaku -= 20;
			}
			//実年齢+3より契約年齢が上だった場合、スピナーのindex値を実年齢+3にする
			if (keiyaku > age - 20 + 3) {
				keiyaku = age - 20 + 3;
			}
			self.spn_age_keiyaku = agelist;
			self.spn_age_keiyaku_v = agelist[keiyaku];
		};

		p.setSpnParams = function () {
			var list = DB.get_insgoods_list();
			// 保険商品
			var cur_goods = list.filter(function (element) {
				return (element.st_goodsname === self.spn_goods_v);
			});
			mItem.id_goods = cur_goods[0].id_goods;
			// 払込方法
			switch (self.spn_haraikomi_v) {
				case "月払い":
					mItem.id_haraikomi = 1;
					break;
				case "年払い":
					mItem.id_haraikomi = 12;
					break;
				case "一時払い":
					mItem.id_haraikomi = 0;
					break;
			}
		};

		p.save = function () {
			// 未設定初期値
			var mPolicy = (viewModel.spn_policy_v() === "本人") ? 1 : 2;
			mItem.id_policy = mPolicy;

			if (self.isValid()) {
				var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase_hoken"));

				//****** 修正 mList モデルケースごとに抽出
				var sub = data.filter(function (element) {
					return (Number(element.id_honhai) === mTab && Number(element.id_modelcase) === id_modelcase);
				});
				//****** 修正 mList モデルケースごとに抽出

				mItem.id_modelcase = id_modelcase;

				if (mPos >= mList.length) {
					mItem.id_kikan2 = (mItem.id_kikan2 === 0) ? "" : mItem.id_kikan2;
					data.push(mItem);
				} else {
					sub[mPos].age_haraikomi = mItem.age_haraikomi;
					sub[mPos].age_keiyaku = mItem.age_keiyaku;
					sub[mPos].id_goods = mItem.id_goods;
					sub[mPos].id_haraikomi = mItem.id_haraikomi;
					sub[mPos].id_honhai = mItem.id_honhai;
					sub[mPos].id_kikan1 = mItem.id_kikan1;
					sub[mPos].id_kikan2 = (mItem.id_kikan2 === 0) ? "" : mItem.id_kikan2;
					sub[mPos].id_policy = mItem.id_policy;
					sub[mPos].sm_hokenkin = mItem.sm_hokenkin;
					sub[mPos].sm_hokenryo = mItem.sm_hokenryo;
					sub[mPos].id_modelcase = mItem.id_modelcase;
				}

				LIFEPLAN.conf.storage.setItem("lp_modelcase_hoken", JSON.stringify(data));
				
				// 削除ボタンの状態保持
				var popupDelete = self.popup_delete;

				init();
				setup(mTab, mPos);
				self.popup_delete = popupDelete;
				viewModel.setData(true);

				LMPS.closeModal();
			}
		};

		p.delete = function () {
			var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase_hoken"));
			var sub = [];
			var count = 0;
			//****** 修正 mList モデルケースごとに抽出
			for (var i = 0; i < data.length; i++) {
				if (Number(data[i].id_honhai) === mTab && Number(data[i].id_modelcase) === id_modelcase) {
					if (count === mPos) {
						count++;
						continue;
					}
					count++;
				}
				sub.push(data[i]);
			}
			//****** 修正 mList モデルケースごとに抽出
			LIFEPLAN.conf.storage.setItem("lp_modelcase_hoken", JSON.stringify(sub));

			init();
			setup(mTab, mPos);
		};

		p.isValid = function () {
			var goods = DB.get_insgoods(mItem.id_goods);
			// 受入No.80 保険商品選択時、保険区分ごとの表示項目に未選択がある場合

			// IF定義書でNNであるものをチェック（全てint型のためnullチェックは無し）

			if (mItem.sm_hokenryo < 1) {
				alert("契約内容を全て入力してください。");
				return false;
			}
			if (goods.st_hokenkin.length > 0 && mItem.sm_hokenkin < 1) {
				alert("契約内容を全て入力してください。");
				return false;
			}
			if (mItem.id_goods < 0 || mItem.age_keiyaku < 0 || mItem.id_kikan1 < 0 || mItem.id_policy < 1) {
				alert("契約内容を全て入力してください。");
				return false;
			}
			return true;
		};

		return S1;
	})();

	var S0 = new Scenes.S0();
	var S1 = new Scenes.S1();


	// knockout表示用セットアップ
	// 2021/02/18 ここを通るのは、本人タブ初期表示時のみ。引数を明示。
	//setup();
	setup(1, 0);


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
		this.item_list_0 = ko.observable(S0.item_list[0]);
		this.item_list_1 = ko.observable(S0.item_list[1]);
		this.item_list_2 = ko.observable(S0.item_list[2]);
		this.item_list_3 = ko.observable(S0.item_list[3]);
		this.item_list_4 = ko.observable(S0.item_list[4]);
		this.item_list_5 = ko.observable(S0.item_list[5]);
		this.item_list_6 = ko.observable(S0.item_list[6]);
		this.item_list_7 = ko.observable(S0.item_list[7]);
		this.class_row_0 = ko.observable(S0.class_row[0]);
		this.class_row_1 = ko.observable(S0.class_row[1]);
		this.class_row_2 = ko.observable(S0.class_row[2]);
		this.class_row_3 = ko.observable(S0.class_row[3]);
		this.class_row_4 = ko.observable(S0.class_row[4]);
		this.class_row_5 = ko.observable(S0.class_row[5]);
		this.class_row_6 = ko.observable(S0.class_row[6]);
		this.class_row_7 = ko.observable(S0.class_row[7]);
		this.class_btn_0 = ko.observable(S0.class_btn[0]);
		this.class_btn_1 = ko.observable(S0.class_btn[1]);
		this.class_btn_2 = ko.observable(S0.class_btn[2]);
		this.class_btn_3 = ko.observable(S0.class_btn[3]);
		this.class_btn_4 = ko.observable(S0.class_btn[4]);
		this.class_btn_5 = ko.observable(S0.class_btn[5]);
		this.class_btn_6 = ko.observable(S0.class_btn[6]);
		this.class_btn_7 = ko.observable(S0.class_btn[7]);
		this.setting_insurance_right_title = ko.observable(S0.setting_insurance_right_title);
		this.setting_ins_txt_month = ko.observable(S0.setting_ins_txt_month);
		this.setting_ins_txt_total = ko.observable(S0.setting_ins_txt_total);
		this.setting_ins_txt_ichiji = ko.observable(S0.setting_ins_txt_ichiji);
		this.tab_insurance1_2 = ko.observable(S0.tab_insurance1_2);
		this.setting_insurance_right = ko.observable(S0.setting_insurance_right);
		this.popup_ins_icon_comment = ko.observable(S0.popup_ins_icon_comment);
		this.popup_ins_txt_comment = ko.observable(S0.popup_ins_txt_comment);

		// scene-1: S1
		this.popup_delete = ko.observable(S1.popup_delete); // 削除ボタンvisible
		this.popup_insurance1_title = ko.observable(S1.popup_insurance1_title); // モーダルタイトル
		this.spn_goods = ko.observableArray(S1.spn_goods); // 保険商品リスト
		this.spn_goods_v = ko.observable(S1.spn_goods_v); // 保険商品リスト 初期値
		this.spn_policy = ko.observableArray(S1.spn_policy); // 契約者リスト
		this.spn_policy_v = ko.observable(S1.spn_policy_v); // 契約者リスト 初期値
		this.spn_age_keiyaku = ko.observableArray(S1.spn_age_keiyaku); // 契約年齢 リスト
		this.spn_age_keiyaku_v = ko.observable(S1.spn_age_keiyaku_v); // 契約年齢 初期値
		this.popup_ins_txt_hokenryo = ko.observable(S1.popup_ins_txt_hokenryo); // 保険料
		this.popup_ins_txt_hokenkin = ko.observable(S1.popup_ins_txt_hokenkin); // 保険金
		this.spn_haraikomi = ko.observableArray(S1.spn_haraikomi); // 払込方法リスト
		this.spn_haraikomi_v = ko.observable(S1.spn_haraikomi_v); // 払込方法リスト 初期値
		this.popup_ins_row_age_haraikomi = ko.observable(S1.popup_ins_row_age_haraikomi); // 払込期間visible
		this.popup_ins_row_kikan1 = ko.observable(S1.popup_ins_row_kikan1); // 期間1 visible
		this.popup_ins_label_kikan1 = ko.observable(S1.popup_ins_label_kikan1); // 期間1 ラベル
		this.popup_ins_row_kikan2 = ko.observable(S1.popup_ins_row_kikan2); // 期間2 visible
		this.popup_ins_label_kikan2 = ko.observable(S1.popup_ins_label_kikan2); // 期間2 ラベル
		this.popup_ins_row_hokenkin = ko.observable(S1.popup_ins_row_hokenkin); // 保険金ラベルvisible
		this.popup_ins_label_hokenkin = ko.observable(S1.popup_ins_label_hokenkin); // 保険金ラベル
		this.spn_age_haraikomi = ko.observable(S1.spn_age_haraikomi); // 払込期間 リスト
		this.spn_age_haraikomi_v = ko.observable(S1.spn_age_haraikomi_v); // 払込期間 リスト 初期値
		this.spn_kikan1 = ko.observable(S1.spn_kikan1);
		this.spn_kikan1_v = ko.observable(S1.spn_kikan1_v);
		this.spn_kikan2 = ko.observable(S1.spn_kikan2);
		this.spn_kikan2_v = ko.observable(S1.spn_kikan2_v);

		this.MoneyUpdate = function (data, event) {
			S1.MoneyUpdate(data, event);
			this.setData(true);
		};

		this.onSelect = function (data, event) {
			if (event.originalEvent) {
				S1.onSelect(data, event);
			}
			this.setData(true);
		};

		this.clickTab = function (id) {
			viewModel.Sidemenu();

			S0.update(id);
			this.setData(true);
		};

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
			this.item_list_0(S0.item_list[0]);
			this.item_list_1(S0.item_list[1]);
			this.item_list_2(S0.item_list[2]);
			this.item_list_3(S0.item_list[3]);
			this.item_list_4(S0.item_list[4]);
			this.item_list_5(S0.item_list[5]);
			this.item_list_6(S0.item_list[6]);
			this.item_list_7(S0.item_list[7]);
			this.class_row_0(S0.class_row[0]);
			this.class_row_1(S0.class_row[1]);
			this.class_row_2(S0.class_row[2]);
			this.class_row_3(S0.class_row[3]);
			this.class_row_4(S0.class_row[4]);
			this.class_row_5(S0.class_row[5]);
			this.class_row_6(S0.class_row[6]);
			this.class_row_7(S0.class_row[7]);
			this.class_btn_0(S0.class_btn[0]);
			this.class_btn_1(S0.class_btn[1]);
			this.class_btn_2(S0.class_btn[2]);
			this.class_btn_3(S0.class_btn[3]);
			this.class_btn_4(S0.class_btn[4]);
			this.class_btn_5(S0.class_btn[5]);
			this.class_btn_6(S0.class_btn[6]);
			this.class_btn_7(S0.class_btn[7]);
			this.setting_insurance_right_title(S0.setting_insurance_right_title);
			this.setting_ins_txt_month(S0.setting_ins_txt_month);
			this.setting_ins_txt_total(S0.setting_ins_txt_total);
			this.setting_ins_txt_ichiji(S0.setting_ins_txt_ichiji);
			this.tab_insurance1_2(S0.tab_insurance1_2);
			this.setting_insurance_right(S0.setting_insurance_right);
			this.popup_ins_icon_comment(S0.popup_ins_icon_comment);
			this.popup_ins_txt_comment(S0.popup_ins_txt_comment);

			// scene-1: S1
			if (isModalUpdate) {
				this.popup_delete(S1.popup_delete); // 削除ボタンvisible
				this.popup_insurance1_title(S1.popup_insurance1_title); // モーダルタイトル
				this.spn_goods(S1.spn_goods); // 保険商品リスト
				this.spn_goods_v(S1.spn_goods_v); // 保険商品リスト 初期値
				this.spn_policy(S1.spn_policy); // 契約者リスト
				this.spn_policy_v(S1.spn_policy_v); // 契約者リスト 初期値
				this.spn_age_keiyaku(S1.spn_age_keiyaku); // 契約年齢 リスト
				this.spn_age_keiyaku_v(S1.spn_age_keiyaku_v); // 契約年齢 初期値
				this.popup_ins_txt_hokenryo(S1.popup_ins_txt_hokenryo); // 保険料
				this.popup_ins_txt_hokenkin(S1.popup_ins_txt_hokenkin); // 保険金
				this.spn_haraikomi(S1.spn_haraikomi); // 払込方法リスト
				this.spn_haraikomi_v(S1.spn_haraikomi_v); // 払込方法リスト 初期値
				this.popup_ins_row_age_haraikomi(S1.popup_ins_row_age_haraikomi); // 払込期間visible
				this.popup_ins_row_kikan1(S1.popup_ins_row_kikan1); // 期間1 visible
				this.popup_ins_label_kikan1(S1.popup_ins_label_kikan1); // 期間1 ラベル
				this.popup_ins_row_kikan2(S1.popup_ins_row_kikan2); // 期間2 visible
				this.popup_ins_label_kikan2(S1.popup_ins_label_kikan2); // 期間2 ラベル
				this.popup_ins_row_hokenkin(S1.popup_ins_row_hokenkin); // 保険金ラベルvisible
				this.popup_ins_label_hokenkin(S1.popup_ins_label_hokenkin); // 保険金ラベル
				this.spn_age_haraikomi(S1.spn_age_haraikomi); // 払込期間 リスト
				this.spn_age_haraikomi_v(S1.spn_age_haraikomi_v); // 払込期間 リスト 初期値
				this.spn_kikan1(S1.spn_kikan1);
				this.spn_kikan1_v(S1.spn_kikan1_v);
				this.spn_kikan2(S1.spn_kikan2);
				this.spn_kikan2_v(S1.spn_kikan2_v);
			}
		};

		this.onClick = function (target, id) {
			switch (id) {
				case 0:
					S0.onClick(target);
					this.setData();
					break;
			}
		};

		this.saveData = function () {
			S1.save();
		};

		this.discard = function () {
			LMPS.closeModal();
		};

		this.openModal = function (target, tab, pos) {
			viewModel.Sidemenu();
			S1.setup(tab, pos);
			//S1.update_keiyakuage();
			this.setData(true);
			LMPS.openModal(target);
		};

		this.deleteData = function () {
			S1.delete();

			this.setData(false);

			LMPS.closeModal();
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

		this.st_message1 = lp_setupinfo[1].st_message;
		this.st_message2 = lp_setupinfo[2].st_message;

    this.goSimulation = function () {
      window.location.href = "simulation1.html";
    };
    this.current_year = new Date().getFullYear();
	};

	var viewModel = new ViewModel();
	ko.applyBindings(viewModel);

	// 保証内容描画
	// 保険料描画
	// 横棒グラフ描画
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

		Logic09 = JSON.parse(LIFEPLAN.conf.storage.getItem("Logic09"));
	}

	function setup(id, pos) {
		m_modelClass = Module.getModelClass(id_modelcase);

		if (id_modelcase === 0) {
			setting_tab1_basic = '<span href="#"><span>基本</span><span>情報</span></span>';
			setting_tab2_job = '<span href="#"><span>職業</span><span class="dot">・</span><span>年収</span></span>';
			setting_tab3_house = '<span href="#"><span>住宅</span><span>プラン</span></span>';
			setting_tab4_education = '<span href="#"><span>教育</span><span>プラン</span></span>';
			setting_tab5_insurance = '<a href="#" class="current"><span>加入</span><span>保険</span></a>';
			simulation1 = '';
		} else {
			if (MC.id_lives === 1 || MC.id_lives_yotei === 1) {
				setting_tab1_basic = '<a href="#"><span>基本</span><span>情報</span></a>';
				setting_tab2_job = '<a href="#"><span>職業</span><span class="dot">・</span><span>年収</span></a>';
				setting_tab3_house = '<a href="#"><span>住宅</span><span>プラン</span></a>';
				setting_tab4_education = '<a href="#"><span>教育</span><span>プラン</span></a>';
				setting_tab5_insurance = '<a href="#" class="current"><span>加入</span><span>保険</span></a>';
				simulation1 = '<a class="button-diagnosis"></a>';
			} else {
				setting_tab1_basic = '<a href="#"><span>基本</span><span>情報</span></a>';
				setting_tab2_job = '<a href="#"><span>職業</span><span class="dot">・</span><span>年収</span></a>';
				setting_tab3_house = '<span href="#"><span>住宅</span><span>プラン</span></span>';
				setting_tab4_education = '<a href="#"><span>教育</span><span>プラン</span></a>';
				setting_tab5_insurance = '<a href="#" class="current"><span>加入</span><span>保険</span></a>';
				simulation1 = '<a class="button-diagnosis"></a>';
			}
		}
		
		if (typeof pos === "undefined") {
			pos = 0;
		}

		S0.setup(id);
		S1.setup(id, pos);
		//S1.update_keiyakuage();
	}
};