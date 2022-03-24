"use strict";

window.onload = function () {

	var DB = new LIFEPLAN.db.LifePlanDB();
	var Calc = new LIFEPLAN.calc.Calc(DB);
	var Util = new LIFEPLAN.util.Util();
	var MC = DB.mc.s_modelcase;
	var id_modelcase = JSON.parse(LIFEPLAN.conf.storage.getItem("id_modelcase"));

	// JSONの読み込み&編集可能JSONデータをwebstorageから読み込み
	DB.db.loadStorage();
	// モデルケースを設定 引数にモデルケース番号
	DB.loadModelcase(id_modelcase);
	// 計算ロジック実行
	Calc.logicALL_Go();

	// サイドメニュー表示制御
	var dispSidemenu;
	var screenMessage = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_screenmessage"));
	var lp_setupinfo = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_setupinfo"));
	// サイドメニュー表示制御 END


	var ViewModel = function () {

		this.modelClass = function () {
			var className;
			if (id_modelcase === 0) {
				className = "single";
			} else if (id_modelcase === 1) {
				className = "single";
			} else if (id_modelcase === 2) {
				className = "child-rearing";
			} else if (id_modelcase === 3) {
				className = "senior";
			} else if (id_modelcase === 4) {
				className = "retirement";
			}
			return className;
		};

		this.sex = (MC.id_sex_hon === 1) ? "男性" : "女性";
		this.sex_hon = ko.observable(this.sex);

		this.age_hon = ko.observable(MC.age_hon);

		this.is_kekkon = function () {
			var ret;
			if (!MC.is_kekkon()) {
				ret = "独身";
			} else if (MC.id_haiumu === 0) {
				if (MC.age_kekkon === 0) {
					ret = "結婚予定なし";
				} else {
					ret = "結婚予定：" + MC.age_kekkon + "歳";
				}
			} else {
				ret = "配偶者あり";
			}
			return ret;
		};
		this.kekkon = ko.observable(this.is_kekkon());

		this.child = function () {
			var count_child = 0;
			var age_child = "";
			for (var i = 0; i < 4; i++) {
				var kyouiku = MC.get_kyouiku(i + 1);
				if (kyouiku !== null) {
					count_child++;
					if (age_child.length > 0) {
						age_child += "と";
					}
					if (kyouiku.age_child < 0) {
						age_child += "誕生予定";
					} else {
						age_child += kyouiku.age_child + "歳";
					}
				}
			}
			if (count_child > 0) {
				this.show_child = true;
				return {"count": count_child, "age": age_child};
			} else {
				this.show_child = false;
				return {"count": 0, "age": 0};
			}
		};
		this.count_child = ko.observable(this.child().count);
		this.age_child = ko.observable(this.child().age);

		this.syokugyo_hon = ko.observable(DB.get_syokugyo(MC.id_syokugyo_hon).st_syokugyo);

		this.nensyu_hon = ko.observable(Util.formatMoneyMan(MC.sm_nensyu_hon, 0));

		this.hai = function () {
			if (MC.is_kekkon()) {
				this.show_hai = true;
				return {
					syokugyo: DB.get_syokugyo(MC.id_syokugyo_hai).st_syokugyo,
					nensyu: Util.formatMoneyMan(MC.sm_nensyu_hai, 0)
				};
			} else {
				this.show_hai = false;
				return {
					syokugyo: 0,
					nensyu: 0
				};
			}
		};
		this.syokugyo_hai = ko.observable(this.hai().syokugyo);
		this.nensyu_hai = ko.observable(this.hai().nensyu);

		this.kihon = ko.observable(Util.formatMoneyMan(MC.sm_kihon, 0));

		this.lives_i = function () {
			if (MC.id_lives === 1) {
				this.show_lives = false;
				return {
					lives: "自宅",
					rent: 0,
					lives_yotei: 0
				};
			} else {
				this.show_lives = true;
				if (MC.id_lives_yotei === 0) {
					return {
						lives: "賃貸",
						rent: Util.formatMoneyMan(MC.sm_rent, 1),
						lives_yotei: "なし"
					};
				} else {
					return {
						lives: "賃貸",
						rent: Util.formatMoneyMan(MC.sm_rent, 1),
						lives_yotei: "あり"
					};
				}
			}
		};
		this.lives = ko.observable(this.lives_i().lives);
		this.rent = ko.observable(this.lives_i().rent);
		this.lives_yotei = ko.observable(this.lives_i().lives_yotei);

		this.assets = ko.observable(Util.formatMoneyMan(MC.sm_assets, 0));

		this.lifestyle = function () {
			var ret;
			var data = DB.db.get_lifestyle(MC.id_modelcase, 40).st_message;
			var result = data.replace(/・/g, "");
			var ret = result.split("\n");

			return ret;
		};
		this.lifestyle_arr = ko.observable(this.lifestyle());

		this.generation_title = function () {
			var title;
			if (id_modelcase === 0) {
				title = "<b>独</b><b>身</b>";
			} else if (id_modelcase === 1) {
				title = "<b>独</b><b>身</b>";
			} else if (id_modelcase === 2) {
				title = "<b>結</b><b>婚</b><b>･</b><b>子</b><b>育</b><b>て</b>";
			} else if (id_modelcase === 3) {
				title = "<b>円</b><b>熟</b><b>･</b><b>シ</b><b>ニ</b><b>ア</b>";
			} else if (id_modelcase === 4) {
				title = "<b>退</b><b>職</b><b>･</b><b>悠</b><b>々</b>";
			}
			return title;
		};
		this.generation = ko.observable(this.generation_title());

		this.goSetting_basic = function () {
			window.location.href = "setting_tab1_basic.html";
		};
		this.goSetting_insurance = function () {
			window.location.href = "setting_tab5_insurance.html";
		};
		this.goSimulation = function () {
			//		Calc.logicALL_Go();
			window.location.href = "simulation1.html";
		};

		// サイドメニュー表示制御
		this.dispSidemenu = ko.observable(dispSidemenu);
		this.Sidemenu = function (target) {
			dispSidemenu = false;
			this.dispSidemenu(dispSidemenu);
			LMPS.openModal(target)
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

    this.current_year = new Date().getFullYear();
	};

	var viewModel = new ViewModel();
	ko.applyBindings(viewModel);

};