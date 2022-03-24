/* global LIFEPLAN, LMPS */

"use strict";

window.onload = function() {

	var DB;
	var Calc;
	var Util;
	var MC;
	var LPdate;
	var id_modelcase;
	var Logic05;
	var Logic06;
	var Module;

	// DB MC をセットし計算ロジック実行
	init();

	// サイドメニュー表示制御
	var dispSidemenu;
	var screenMessage = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_screenmessage"));
	var lp_setupinfo = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_setupinfo"));
	// サイドメニュー表示制御 END

	var Scenes = {
		S0: {}
	};

	Scenes.S0 = (function() {
		var self;
		var mZandaka_gen;
		var mZandaka_tai;
		var mRyudo_gen;
		var mRyudo_tai;
		var mAntei_gen;
		var mAntei_tai;
		var mChoki_gen;
		var mChoki_tai;

		var S0 = function() {
			self = this;
		};

		var p = S0.prototype;

		p.onCreate = function() {

			var index = getIndex(false);

			if (MC.age_taisyoku_hon !== 20) {
				mZandaka_gen = MC.sm_assets;
				mZandaka_tai = Math.floor(Logic06.vShikin[MC.age_taisyoku_hon - 1 + index]);
				mRyudo_gen = (MC.save_ryudoshikin_gen !== -1) ? MC.save_ryudoshikin_gen : Math.floor(Logic06.vRyudoShikin[MC.age_hon + index]);
				mRyudo_tai = (MC.save_ryudoshikin_tai !== -1) ? MC.save_ryudoshikin_tai : Math.floor(Logic06.vRyudoShikin[MC.age_taisyoku_hon - 1 + index]);
				mAntei_gen = (MC.save_anteishikin_gen !== -1) ? MC.save_anteishikin_gen : Math.floor(Logic06.vAnteiShikin[MC.age_hon + index]);
				mAntei_tai = (MC.save_anteishikin_tai !== -1) ? MC.save_anteishikin_tai : Math.floor(Logic06.vAnteiShikin[MC.age_taisyoku_hon - 1 + index]);
				// 2021/04/08 「マネープラン」画面の長期運用資金は画面で編集していないときはゼロを表示すべきところ、初年度運用後の値が表示されている不具合を改修。
				//mChoki_gen = (MC.save_unyoshikin_gen !== -1) ? MC.save_unyoshikin_gen : Math.floor(Logic06.vUnyou[MC.age_hon + index]);
				mChoki_gen = (MC.save_unyoshikin_gen !== -1) ? MC.save_unyoshikin_gen : 0;
				mChoki_tai = (MC.save_unyoshikin_tai !== -1) ? MC.save_unyoshikin_tai : Math.floor(Logic06.vUnyou[MC.age_taisyoku_hon - 1 + index]);
			} else {
				mZandaka_tai = MC.sm_assets;
				mRyudo_tai = (MC.save_ryudoshikin_tai !== -1) ? MC.save_ryudoshikin_tai : 0;
				mAntei_tai = (MC.save_anteishikin_tai !== -1) ? MC.save_anteishikin_tai : 0;
				mChoki_tai = (MC.save_unyoshikin_tai !== -1) ? MC.save_unyoshikin_tai : 0;
			}

			self.sim3_edit_ryudo_shikin = self.mRyudo_gen;
			self.sim3_edit_antei_shikin = self.mAntei_gen;
			self.sim3_edit_chouki_shikin = self.mChoki_gen;

			self.update();
		};

		p.update = function() {
			var index = getIndex(false);

			if (MC.age_taisyoku_hon !== 20) {
				mRyudo_gen = (MC.save_ryudoshikin_gen !== -1) ? MC.save_ryudoshikin_gen : Math.floor(Logic06.vRyudoShikin[MC.age_hon + index]);
				mRyudo_tai = (MC.save_ryudoshikin_tai !== -1) ? MC.save_ryudoshikin_tai : Math.floor(Logic06.vRyudoShikin[MC.age_taisyoku_hon - 1 + index]);
				mAntei_gen = (MC.save_anteishikin_gen !== -1) ? MC.save_anteishikin_gen : Math.floor(Logic06.vAnteiShikin[MC.age_hon + index]);
				mAntei_tai = (MC.save_anteishikin_tai !== -1) ? MC.save_anteishikin_tai : Math.floor(Logic06.vAnteiShikin[MC.age_taisyoku_hon - 1 + index]);
				// 2021/04/08 「マネープラン」画面の長期運用資金は画面で編集していないときはゼロを表示すべきところ、初年度運用後の値が表示されている不具合を改修。
				//mChoki_gen = (MC.save_unyoshikin_gen !== -1) ? MC.save_unyoshikin_gen : Math.floor(Logic06.vUnyou[MC.age_hon + index]);
				mChoki_gen = (MC.save_unyoshikin_gen !== -1) ? MC.save_unyoshikin_gen : 0;
				mChoki_tai = (MC.save_unyoshikin_tai !== -1) ? MC.save_unyoshikin_tai : Math.floor(Logic06.vUnyou[MC.age_taisyoku_hon - 1 + index]);
			} else {
				mRyudo_gen = (MC.save_ryudoshikin_gen !== -1) ? MC.save_ryudoshikin_gen : 0;
				mRyudo_tai = (MC.save_ryudoshikin_tai !== -1) ? MC.save_ryudoshikin_tai : 0;
				mAntei_gen = (MC.save_anteishikin_gen !== -1) ? MC.save_anteishikin_gen : 0;
				mAntei_tai = (MC.save_anteishikin_tai !== -1) ? MC.save_anteishikin_tai : 0;
				mChoki_gen = (MC.save_unyoshikin_gen !== -1) ? MC.save_unyoshikin_gen : 0;
				mChoki_tai = (MC.save_unyoshikin_tai !== -1) ? MC.save_unyoshikin_tai : 0;
			}

			var yobi;
			yobi = (mZandaka_gen - mChoki_gen - mAntei_gen - mRyudo_gen);
			self.sim3_edit_ryudo_shikin = Module.commafy(mRyudo_gen);
			self.sim3_edit_antei_shikin = Module.commafy(mAntei_gen);
			self.sim3_edit_chouki_shikin = Module.commafy(mChoki_gen);

			var total = Util.formatMoneyMan(mZandaka_gen, 0);
			self.sim3_txt_total = total;

			var s = Util.formatMoneyManNum(yobi, 0);
			self.sim3_txt_yobi_shikin = s;


			// 投資スタイル
			var id_invest = (MC.age_hon < 60) ? MC.id_invest : MC.id_tai_invest;

			var styleValue = DB.get_investstyle(id_invest).ra_invest;
			styleValue = ((styleValue * 1000) / 10).toFixed(1);
			// 2021/03/30 「型」を付けないよう修正
			//self.sim3_txt_id_invest = DB.get_investstyle(id_invest).st_invest + "型";
			self.sim3_txt_id_invest = DB.get_investstyle(id_invest).st_invest;
			self.sim3_txt_ra_invest = styleValue + "%";
		};

		p.onCalcFinish = function(v) {
			var value;
			switch (v) {
				case "sim3_edit_ryudo_shikin":
					value = Module.toFilteredNum(viewModel.sim3_edit_ryudo_shikin());
					value = (value > 999999999) ? 999999999 : value;

					var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase"));
					data[id_modelcase].save_ryudoshikin_gen = value;
					LIFEPLAN.conf.storage.setItem("lp_modelcase", JSON.stringify(data));
					break;
				case "sim3_edit_antei_shikin":
					value = Module.toFilteredNum(viewModel.sim3_edit_antei_shikin());
					value = (value > 999999999) ? 999999999 : value;

					var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase"));
					data[id_modelcase].save_anteishikin_gen = value;
					LIFEPLAN.conf.storage.setItem("lp_modelcase", JSON.stringify(data));
					break;
				case "sim3_edit_chouki_shikin":
					value = Module.toFilteredNum(viewModel.sim3_edit_chouki_shikin());
					value = (value > 999999999) ? 999999999 : value;

					var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase"));
					data[id_modelcase].save_unyoshikin_gen = value;
					LIFEPLAN.conf.storage.setItem("lp_modelcase", JSON.stringify(data));
					break;
			}
			self.update();
		};

		return S0;
	})();

	var S0 = new Scenes.S0();
	setup();

	var ViewModel = function() {
		this.sim3_txt_total = ko.observable(S0.sim3_txt_total);
		this.sim3_edit_ryudo_shikin = ko.observable(S0.sim3_edit_ryudo_shikin);
		this.sim3_edit_antei_shikin = ko.observable(S0.sim3_edit_antei_shikin);
		this.sim3_txt_yobi_shikin = ko.observable(S0.sim3_txt_yobi_shikin);
		this.sim3_edit_chouki_shikin = ko.observable(S0.sim3_edit_chouki_shikin);
		this.sim3_txt_id_invest = ko.observable(S0.sim3_txt_id_invest);
		this.sim3_txt_ra_invest = ko.observable(S0.sim3_txt_ra_invest);

		this.setData = function() {
			this.sim3_txt_total(S0.sim3_txt_total);
			this.sim3_edit_ryudo_shikin(S0.sim3_edit_ryudo_shikin);
			this.sim3_edit_antei_shikin(S0.sim3_edit_antei_shikin);
			this.sim3_txt_yobi_shikin(S0.sim3_txt_yobi_shikin);
			this.sim3_edit_chouki_shikin(S0.sim3_edit_chouki_shikin);
			this.sim3_txt_id_invest(S0.sim3_txt_id_invest);
			this.sim3_txt_ra_invest(S0.sim3_txt_ra_invest);
		};

		this.onCalcFinish = function(target, id) {
			switch (id) {
				case 0:
					S0.onCalcFinish(target);
					init();
					setup();
					this.setData();
					break;
			}
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
		
	};

	var viewModel = new ViewModel();
	ko.applyBindings(viewModel);

	function init() {
		DB = new LIFEPLAN.db.LifePlanDB();
		Calc = new LIFEPLAN.calc.Calc(DB);
		Util = new LIFEPLAN.util.Util();
		MC = DB.mc.s_modelcase;
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
	}

	function setup() {
		S0.onCreate();
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