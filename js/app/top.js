"use strict";

window.onload = function() {
	// ストレージをクリア
	LIFEPLAN.conf.storage.clear();

	var DB = new LIFEPLAN.db.LifePlanDB();
	// JSONの読み込み&編集可能JSONデータをwebstorageに保存
	var isLoad = DB.db.load();
	var errorMessage = "設定ファイルが存在しないため表示できません。";

	// サイドメニュー表示制御
	var dispSidemenu;
	var screenMessage = isLoad ? JSON.parse(LIFEPLAN.conf.storage.getItem("lp_screenmessage")) : [];
	var lp_setupinfo = isLoad ? JSON.parse(LIFEPLAN.conf.storage.getItem("lp_setupinfo")) : [""];
	// サイドメニュー表示制御 END

	var ViewModel = function() {

		this.goProfile = function(id) {
			if (false == isLoad) {
				alert(errorMessage);
				return;
			}
			
			if (id === 1) {
				LIFEPLAN.conf.storage.setItem('id_modelcase', id);
			} else if (id === 2) {
				LIFEPLAN.conf.storage.setItem('id_modelcase', id);
			} else if (id === 3) {
				LIFEPLAN.conf.storage.setItem('id_modelcase', id);
			} else if (id === 4) {
				LIFEPLAN.conf.storage.setItem('id_modelcase', id);
			}

			window.location.href = 'profile.html';
		};

		this.goSetting = function(id, no) {
			if (false == isLoad) {
				alert(errorMessage);
				return;
			}
			
			LIFEPLAN.conf.storage.setItem('id_modelcase', id);

			if (no === 1) {
				window.location.href = 'setting_tab1_basic.html';
			} else if (no === 2) {
				window.location.href = 'setting_tab3_house.html';
			} else if (no === 3) {
				window.location.href = 'setting_tab4_education.html';
			} else if (no === 4) {
				window.location.href = 'setting_tab5_insurance.html';
			}
		};

		// サイドメニュー表示制御
		this.dispSidemenu = ko.observable(dispSidemenu);
		this.Sidemenu = function(target) {
			if (false == isLoad) {
				alert(errorMessage);
				return;
			}
			
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

    this.current_year = new Date().getFullYear();
	};

	var viewModel = new ViewModel();
	ko.applyBindings(viewModel);
};