/* global LIFEPLAN */

"use strict";

LIFEPLAN.db.LifePlanDB = (function() {
	var self;

	var LifePlanDB = function() {
		self = this;
		self.mc = new Modelcase();
		self.db = new Tables();

		self.Lp_modelcase = new Lp_modelcase();
		self.LPdate = new LPdate();
		self.Lp_incomestatistics = new Lp_incomestatistics();
		self.Lp_modelcase_hoken = new Lp_modelcase_hoken();
		self.Lp_modelcase_kyouiku = new Lp_modelcase_kyouiku();
		self.Wording = new Wording();

		self.G_syokugyo = {
			KAISYAIN: 1, //' 会社員
			YAKUIN: 2, //' 会社役員
			KOMUIN: 3, //' 公務員
			TAI_KAISYAIN: 4, //' 退職・会社員
			TAI_KOMUIN: 5, //' 退職・公務員
			JIEIGYO: 6, //' 自営業
			MUSYOKU: 7        //' 無職
		};
	};

	var p = LifePlanDB.prototype;

	p.getMC = function() {
		return self.mc.s_modelcase;
	};

	p.getNumberList = function(value, min, max, prefix, safix) {
		var len = max - min + 1;
		var result = new Array(len);
		for (var i = 0; i < len; i++) {
			var val = i + value + min;
			result[i] = prefix + val + safix;
		}
		return result;
	};

	p.get_investstyle = function(id_invest) {
		return self.db.m_investstyle[id_invest];
	};

	p.get_investstyle_list = function() {
		var obj = self.db.m_investstyle;
		var result = Object.keys(obj).map(function(key) {
			return obj[key].ra_invest;
		});

		return result;
	};

	p.get_gyosyu = function(id_gyosyu) {
		return this.db.m_gyosyu[id_gyosyu];
	};

	p.get_gyosyu_list = function() {
		var obj = this.db.m_gyosyu;
		var result = Object.keys(obj).map(function(key) {
			return obj[key].st_gyosyu;
		});
		return result;
	};

	p.get_syokusyu = function(id_syokusyu) {
		return this.db.m_syokusyu[id_syokusyu];
	};

	p.get_syokusyu_list = function() {
		var obj = this.db.m_syokusyu;
		var result = Object.keys(obj).map(function(key) {
			return obj[key].st_syokusyu;
		});
		return result;
	};

	p.get_kibo = function(id_kibo) {
		return this.db.m_kibo[id_kibo];
	};

	p.get_kibo_list = function() {
		var obj = this.db.m_kibo;
		var result = Object.keys(obj).map(function(key) {
			return obj[key].st_kibo;
		});
		return result;
	};

	p.get_incomestatistics = function(id_gyosyu, id_syokusyu, no_age) {
		var tbl = new Lp_incomestatistics();
		tbl.id_gyosyu = id_gyosyu;
		tbl.id_syokusyu = id_syokusyu;
		tbl.no_age = no_age;
		return self.db.m_incomestatistics[tbl.key()];
	};

	p.get_syokugyo = function(id_syokugyo) {
		return this.db.m_syokugyo[id_syokugyo];
	};

	p.get_syokugyo_list = function() {
		var obj = this.db.m_syokugyo;
		var result = Object.keys(obj).map(function(key) {
			return obj[key].st_syokugyo;
		});
		return result;

	};

	p.get_jyutaku = function(id_prefecture) {
		return this.db.m_jyutaku[id_prefecture];
	};

	p.get_jyutaku_list = function() {
		var obj = this.db.m_jyutaku;
		var result = Object.keys(obj).map(function(key) {
			return obj[key].st_prefecture;
		});
		return result;
	};

	p.get_cmninfo = function() {
		return self.db.s_cmninfo;
	};
	p.get_banksetupinfo = function() {
		return self.db.s_banksetupinfo;
	};
	p.get_setupinfo = function() {
		return self.db.s_setupinfo;
	};

	p.get_kyouikuhi = function(id_school, id_koushi, no_nenji, id_bunri) {
		var tbl = new Lp_kyouikuhi();
		tbl.id_school = id_school;
		tbl.id_koushi = id_koushi;
		tbl.no_nenji = no_nenji;
		tbl.id_bunri = id_bunri;
		return this.db.m_kyouikuhi[tbl.key()];
	};

	p.get_mc_calc = function(is_hai) {
		return is_hai ? this.db.s_modelcase_calc_hai : this.db.s_modelcase_calc_hon;
	};

	p.get_insgoods = function(id_goods) {
		return self.db.m_insgoods[id_goods];
	};

	p.get_insgoods_list = function() {
		var obj = self.db.m_insgoods;
		return Object.keys(obj).map(function(key) {
			return obj[key];
		});
	};

	p.get_jyutakuloan = function(y_buyyear) {
		return self.db.m_jyutakuloan[y_buyyear];
	};

	p.get_event = function(id_event) {
		return self.db.m_event[id_event];
	};

	p.loadModelcase = function(id) {
		self.mc.s_modelcase.copy(this.db.m_modelcase[id]);

		for (var i = 0; i < 4; i++) {
			var kyouiku = self.db.get_kyouiku(id, i + 1);
			if (kyouiku === null) {
				break;
			}
			self.mc.s_modelcase.m_modelcase_kyouiku.push(kyouiku);
		}

		var hoken = self.db.get_hoken_list(id);
		for (var i = 0; i < hoken.length; i++) {
			var h = hoken[i];
			self.mc.s_modelcase.add_hoken(h);
		}

		var event = self.db.get_event_list(id);
		for (var i = 0; i < event.length; i++) {
			var e = event[i];
			self.mc.s_modelcase.add_event(e);
		}

		var life = self.db.get_lifestyle_list(id);
		for (var i = 0; i < life.length; i++) {
			var l = life[i];
			self.mc.s_modelcase.m_modelcase_lifestyle[l.key()] = l;
		}

	};

	// クラス定義 class
	var Modelcase = (function() {

		var Modelcase = function() {
			this.s_modelcase = new Lp_modelcase();
		};

		return Modelcase;
	})();

	/**
	 * JSONテーブル
	 * 接頭辞  s_:クラス,m_：IDをキーとしたハッシュ
	 * @author y-sakai
	 *
	 */
	// クラス定義 class
	var Tables = (function() {
		var m_modelcase = {};
		var m_modelcase_kyouiku = [];
		var m_modelcase_hoken = [];
		var m_modelcase_event = [];
		var m_modelcase_lifestyle = {};

		var s_modelcase_calc_hon;
		var s_modelcase_calc_hai;

		var s_cmninfo;
		var s_setupinfo;
		var s_banksetupinfo;

		var m_screenmessage = [];
		/*****2014/01/20  診断結果画面作成	start***********/
		var m_result_msg = [];
		/*****2014/01/20  診断結果画面作成	end***********/

		var m_investstyle = {};
		var m_gyosyu = {};
		var m_syokusyu = {};
		var m_kibo = {};
		var m_incomestatistics = {};
		var m_syokugyo = {};
		var m_nenkin = {};
		var m_jyutaku = {};
		var m_kyouikuhi = {};
		var m_insgoods = {};
		var m_jyutakuloan = {};
		var m_event = {};

		var Tables = function() {
			this.m_modelcase = {};
			this.m_modelcase_kyouiku = new Lp_modelcase_kyouiku;
			this.m_modelcase_hoken = new Lp_modelcase_hoken;
			this.m_modelcase_event = new Lp_modelcase_event;
			this.m_modelcase_lifestyle = {};

			this.s_setupinfo = new Lp_setupinfo();
			this.s_cmninfo = new Lp_cmninfo();
			this.s_banksetupinfo = new Lp_banksetupinfo();
			this.s_modelcase_calc_hon = new Lp_modelcase_calc();
			this.s_modelcase_calc_hai = new Lp_modelcase_calc();
			this.m_screenmessage = [];
			/*****2014/01/20  診断結果画面作成	start***********/
					this.m_result_msg = new Lp_result_msg();
			/*****2014/01/20  診断結果画面作成	end***********/
					this.m_investstyle = {};
			this.m_gyosyu = {};
			this.m_syokusyu = {};
			this.m_kibo = {};
			this.m_incomestatistics = {};
			this.m_syokugyo = {};
			this.m_nenkin = {};
			this.m_jyutaku = {};
			this.m_kyouikuhi = {};
			this.m_insgoods = {};
			this.m_jyutakuloan = {};
			this.m_event = {};
		};

		var p = Tables.prototype;

		p.get_kyouiku = function(id_modelcase, no_child) {
			for (var i = 0; i < self.db.m_modelcase_kyouiku.length; i++) {
				var item = self.db.m_modelcase_kyouiku[i];
				if (item.id_modelcase === id_modelcase && item.no_child === no_child) {
					return item;
				}
			}

			return null;
		};
		p.get_hoken_list = function(id_modelcase) {
			var ret = [];
			for (var i = 0; i < self.db.m_modelcase_hoken.length; i++) {
				var row = self.db.m_modelcase_hoken[i];
				if (row.id_modelcase !== id_modelcase) {
					continue;
				}
				ret.push(row);
			}
			return ret;
		};
		p.get_event_list = function(id_modelcase) {
			var ret = [];
			for (var i = 0; i < self.db.m_modelcase_event.length; i++) {
				var row = self.db.m_modelcase_event[i];
				if (row.id_modelcase !== id_modelcase) {
					continue;
				}
				ret.push(row);
			}
			return ret;
		};
		p.get_lifestyle = function(id_modelcase, id_screen) {
			var ls = new Lp_modelcase_lifestyle();
			ls.id_screen = id_screen;
			ls.id_modelcase = id_modelcase;
			return m_modelcase_lifestyle[ls.key()];
		};
		p.get_lifestyle_list = function(id_modelcase) {
			var ret = [];
			var d = self.db.m_modelcase_lifestyle;

			Object.keys(d).forEach(function(key) {
				var row = this[key];
				if (row.id_modelcase === id_modelcase) {
					ret.push(row);
				}
			}, d);

			return ret;
		};
		p.loadStorage = function() {
			$.ajaxSetup({async: false});
			$.getJSON("assets/json/modelcase/lp_banksetupinfo.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_banksetupinfo();
					_data.fromjson(_col);
					s_banksetupinfo = _data;
				}
			});
			$.getJSON("assets/json/modelcase/lp_cmninfo.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_cmninfo();
					_data.fromjson(_col);
					s_cmninfo = _data;
				}
			});
			$.getJSON("assets/json/modelcase/lp_event.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_event();
					_data.fromjson(_col);
					m_event[_data.key()] = _data;
				}
			});
			$.getJSON("assets/json/modelcase/lp_gyosyu.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_gyosyu();
					_data.fromjson(_col);
					m_gyosyu[_data.key()] = _data;
				}
			});
			$.getJSON("assets/json/modelcase/lp_syokusyu.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_syokusyu();
					_data.fromjson(_col);
					m_syokusyu[_data.key()] = _data;
				}
			});
			$.getJSON("assets/json/modelcase/lp_kibo.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_kibo();
					_data.fromjson(_col);
					m_kibo[_data.key()] = _data;
				}
			});
			$.getJSON("assets/json/modelcase/lp_incomestatistics.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_incomestatistics();
					_data.fromjson(_col);
					m_incomestatistics[_data.key()] = _data;
				}
			});
			$.getJSON("assets/json/modelcase/lp_insgoods.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_insgoods();
					_data.fromjson(_col);
					m_insgoods[_data.key()] = _data;
				}
			});
			$.getJSON("assets/json/modelcase/lp_investstyle.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_investstyle();
					_data.fromjson(_col);
					m_investstyle[_data.key()] = _data;
				}
			});
			$.getJSON("assets/json/modelcase/lp_jyutakuloan.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_jyutakuloan();
					_data.fromjson(_col);
					m_jyutakuloan[_data.key()] = _data;
				}
			});
			$.getJSON("assets/json/modelcase/lp_jyutaku.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_jyutaku();
					_data.fromjson(_col);
					m_jyutaku[_data.key()] = _data;
				}
			});
			$.getJSON("assets/json/modelcase/lp_kyouikuhi.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_kyouikuhi();
					_data.fromjson(_col);
					m_kyouikuhi[_data.key()] = _data;
				}
			});
			$.getJSON("assets/json/modelcase/lp_nenkin.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_nenkin();
					_data.fromjson(_col);
					m_nenkin[_data.key()] = _data;
				}
			});
			$.getJSON("assets/json/modelcase/lp_result_msg.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_result_msg();
					_data.fromjson(_col);
					m_result_msg.push(_data);
				}
			});
			$.getJSON("assets/json/modelcase/lp_setupinfo.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_setupinfo();
					_data.fromjson(_col);
					s_setupinfo = _data;
				}
			});
			$.getJSON("assets/json/modelcase/lp_syokugyo.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_syokugyo();
					_data.fromjson(_col);
					m_syokugyo[_data.key()] = _data;
				}
			});
			$.ajaxSetup({async: true});
			var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase"));
			for (var i = 0; i < data.length; i++) {
				var _col = data[i];
				var _data = new Lp_modelcase();
				_data.fromjson(_col);
				m_modelcase[_data.key()] = _data;
			}
			var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase_event"));
			m_modelcase_event.length = 0;
			for (var i = 0; i < data.length; i++) {
				var _col = data[i];
				var _data = new Lp_modelcase_event();
				_data.fromjson(_col);
				m_modelcase_event.push(_data);
			}
			var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase_hoken"));
			m_modelcase_hoken.length = 0;
			for (var i = 0; i < data.length; i++) {
				var _col = data[i];
				var _data = new Lp_modelcase_hoken();
				_data.fromjson(_col);
				m_modelcase_hoken.push(_data);
			}
			var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase_kyouiku"));
			m_modelcase_kyouiku.length = 0;
			for (var i = 0; i < data.length; i++) {
				var _col = data[i];
				var age_child = _col.age_child;
				if (age_child === null ||
						age_child === "") {
					continue;
				}
				var _data = new Lp_modelcase_kyouiku();
				_data.fromjson(_col);
				m_modelcase_kyouiku.push(_data);
			}
			var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase_lifestyle"));
			for (var i = 0; i < data.length; i++) {
				var _col = data[i];
				var _data = new Lp_modelcase_lifestyle();
				_data.fromjson(_col);
				m_modelcase_lifestyle[_data.key()] = _data;
			}
			this.m_modelcase = m_modelcase;
			this.m_modelcase_kyouiku = m_modelcase_kyouiku;
			this.m_modelcase_hoken = m_modelcase_hoken;
			this.m_modelcase_event = m_modelcase_event;
			this.m_modelcase_lifestyle = m_modelcase_lifestyle;
			this.s_setupinfo = s_setupinfo;
			this.s_cmninfo = s_cmninfo;
			this.s_banksetupinfo = s_banksetupinfo;
			this.m_result_msg = m_result_msg;
			this.m_investstyle = m_investstyle;
			this.m_gyosyu = m_gyosyu;
			this.m_syokusyu = m_syokusyu;
			this.m_kibo = m_kibo;
			this.m_incomestatistics = m_incomestatistics;
			this.m_syokugyo = m_syokugyo;
			this.m_nenkin = m_nenkin;
			this.m_jyutaku = m_jyutaku;
			this.m_kyouikuhi = m_kyouikuhi;
			this.m_insgoods = m_insgoods;
			this.m_jyutakuloan = m_jyutakuloan;
			this.m_event = m_event;

		};
		p.load = function(path, className) {
			var isSuccess = true;
			$.ajaxSetup({async: false});
			$.getJSON("assets/json/modelcase/lp_banksetupinfo.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_banksetupinfo();
					_data.fromjson(_col);
					s_banksetupinfo = _data;
				}
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_cmninfo.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_cmninfo();
					_data.fromjson(_col);
					s_cmninfo = _data;
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_gyosyu.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_gyosyu();
					_data.fromjson(_col);
					m_gyosyu[_data.key()] = _data;
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_syokusyu.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_syokusyu();
					_data.fromjson(_col);
					m_syokusyu[_data.key()] = _data;
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_kibo.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_kibo();
					_data.fromjson(_col);
					m_kibo[_data.key()] = _data;
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_event.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_event();
					_data.fromjson(_col);
					m_event[_data.key()] = _data;
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_incomestatistics.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_incomestatistics();
					_data.fromjson(_col);
					m_incomestatistics[_data.key()] = _data;
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_insgoods.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_insgoods();
					_data.fromjson(_col);
					m_insgoods[_data.key()] = _data;
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_investstyle.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_investstyle();
					_data.fromjson(_col);
					m_investstyle[_data.key()] = _data;
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_jyutaku.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_jyutaku();
					_data.fromjson(_col);
					m_jyutaku[_data.key()] = _data;
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_jyutakuloan.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_jyutakuloan();
					_data.fromjson(_col);
					m_jyutakuloan[_data.key()] = _data;
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_kyouikuhi.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_kyouikuhi();
					_data.fromjson(_col);
					m_kyouikuhi[_data.key()] = _data;
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_modelcase.json", function(data) {
				LIFEPLAN.conf.storage.setItem("lp_modelcase", JSON.stringify(data));
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_modelcase();
					_data.fromjson(_col);
					m_modelcase[_data.key()] = _data;
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_modelcase_event.json", function(data) {
				LIFEPLAN.conf.storage.setItem("lp_modelcase_event", JSON.stringify(data));
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_modelcase_event();
					_data.fromjson(_col);
					m_modelcase_event.push(_data);
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_modelcase_hoken.json", function(data) {
				LIFEPLAN.conf.storage.setItem("lp_modelcase_hoken", JSON.stringify(data));
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_modelcase_hoken();
					_data.fromjson(_col);
					m_modelcase_hoken.push(_data);
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_modelcase_kyouiku.json", function(data) {
				LIFEPLAN.conf.storage.setItem("lp_modelcase_kyouiku", JSON.stringify(data));
				self.db.m_modelcase_kyouiku.clear();
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var age_child = _col.age_child;
					if (age_child === null ||
							age_child === "") {
						continue;
					}
					var _data = new Lp_modelcase_kyouiku();
					_data.fromjson(_col);
					m_modelcase_kyouiku.push(_data);
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_modelcase_lifestyle.json", function(data) {
				LIFEPLAN.conf.storage.setItem("lp_modelcase_lifestyle", JSON.stringify(data));
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_modelcase_lifestyle();
					_data.fromjson(_col);
					m_modelcase_lifestyle[_data.key()] = _data;
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_nenkin.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_nenkin();
					_data.fromjson(_col);
					m_nenkin[_data.key()] = _data;
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_result_msg.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_result_msg();
					_data.fromjson(_col);
					m_result_msg.push(_data);
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_setupinfo.json", function(data) {
				LIFEPLAN.conf.storage.setItem("lp_setupinfo", JSON.stringify(data));
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_setupinfo();
					_data.fromjson(_col);
					s_setupinfo = _data;
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_syokugyo.json", function(data) {
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_syokugyo();
					_data.fromjson(_col);
					m_syokugyo[_data.key()] = _data;
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.getJSON("assets/json/modelcase/lp_screenmessage.json", function(data) {
				LIFEPLAN.conf.storage.setItem("lp_screenmessage", JSON.stringify(data));
				for (var i = 0; i < data.length; i++) {
					var _col = data[i];
					var _data = new Lp_screenmessage();
					_data.fromjson(_col);
					m_screenmessage.push(_data);
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				isSuccess = false;
			});
			$.ajaxSetup({async: true});

			this.m_modelcase = m_modelcase;
			this.m_modelcase_kyouiku = m_modelcase_kyouiku;
			this.m_modelcase_hoken = m_modelcase_hoken;
			this.m_modelcase_event = m_modelcase_event;
			this.m_modelcase_lifestyle = m_modelcase_lifestyle;
			this.s_setupinfo = s_setupinfo;
			this.s_cmninfo = s_cmninfo;
			this.s_banksetupinfo = s_banksetupinfo;
			this.m_screenmessage = m_screenmessage;
			this.m_result_msg = m_result_msg;
			this.m_investstyle = m_investstyle;
			this.m_gyosyu = m_gyosyu;
			this.m_syokusyu = m_syokusyu;
			this.m_kibo = m_kibo;
			this.m_incomestatistics = m_incomestatistics;
			this.m_syokugyo = m_syokugyo;
			this.m_nenkin = m_nenkin;
			this.m_jyutaku = m_jyutaku;
			this.m_kyouikuhi = m_kyouikuhi;
			this.m_insgoods = m_insgoods;
			this.m_jyutakuloan = m_jyutakuloan;
			this.m_event = m_event;
			
			return isSuccess;
		};

		return Tables;
	})();

	// クラス定義 class
	var TableBase = (function() {

		var TableBase = function() {
		};

		var p = TableBase.prototype;

		p.NumberWithDefault = function(s, _default) {
			var value;
			try {
				if (!isNaN(Number(s)) && !(s === "")) {
					value = Number(s);
				} else {
					throw "e";
				}
			} catch (e) {
				value = _default;
			}
			return value;
		};
		return TableBase;
	})();



	var LPdate = (function() {
		var mValue;

		var LPdate = function() {
		};

		var p = LPdate.prototype;

		p.fromjson = function(s) {
			try {
				if (!isNaN(Number(s)) && !(s === "")) {
					mValue = Number(s);
				} else {
					throw "e";
				}
			} catch (e) {
				mValue = 0;
			}
			if (mValue > 0 && mValue < 999999) {
				mValue = mValue * 100 + 1;
			}
			return mValue;
		};
		p.toZen = function(date) {
			if (date === 0) {
				return "(未設定)";
			}
			var s = this.getYear(date);
			s += "年";
			s += this.getMon(date);
			s += "月";
			s += this.getDay(date);
			s += "日";
			return s;
		};
		p.toZenYM = function(ym) {
			if (ym === 0) {
				return "(未設定)";
			}
			var s = this.getYear(ym);
			s += "年";
			s += this.getMon(ym);
			s += "月";
			return s;
		};
		p.copy = function(other) {
			this.set(other);
		};
		p.set = function(val) {
			this.mValue = val;
		};
		p.setCurrent = function() {
			var y = this.setYear(this.getCurYear());
			var m = this.setMon(this.getCurMon());
			var d = this.setDay(this.getCurDay());
			var ret = y + m + d;
			return ret;
		};
		p.getCurYear = function() {
			var cal = new Date;
			return cal.getFullYear();
		};
		p.getCurMon = function() {
			var cal = new Date;
			return cal.getMonth() + 1;
		};
		p.getCurDay = function() {
			var cal = new Date;
			return cal.getDate();
		};
		//年齢から生年月日をセット
		//生年月日がセットされていない場合、月・日は4/2がデフォルト
		p.fromAge = function(age, birthday, syugyoday) {
			var y = 0, m = 0, d = 0;
			if (birthday === null) {
				y = this.getCurYear() - age;
				m = 4;
				d = 2;
				if (this.getCurMon() < m ||
						(this.getCurMon() === m && this.getCurDay() < d)) {
					y--;
				}
			} else {
				if (syugyoday === null) {
					y = this.getYear(birthday) + age;
					m = this.getMon(birthday);
				} else if (this.getMon(syugyoday) < this.getMon(birthday) ||
						this.getMon(syugyoday) === this.getMon(birthday) && this.getDay(syugyoday) < this.getDay(birthday)) {
					y = this.getYear(birthday) + age + 1;
					m = this.getMon(syugyoday);
				} else {
					y = this.getYear(birthday) + age;
					m = this.getMon(syugyoday);
				}
				d = this.getDay(birthday);
			}

			var ret = this.setYear(y) + this.setMon(m) + this.setDay(d);
			return ret;
		};
		//fromからtoまでの年齢を計算
		//toがnullの場合はfromから現在までの年齢を計算
		p.calcAge = function(from, to) {
			var s;
			var d;

			if (to === undefined || to === null) {
				if (from === undefined || from === null) {
					return;
				}
				s = this.setCurrent();
				d = from;
			} else {
				s = to;
				d = from;
			}

			var s_y = this.getYear(s);
			var s_md = this.getMon(s) * 100 + this.getDay(s);

			if (s_y <= 1900) {
				return 0;
			}

			var d_y = this.getYear(d);
			var d_md = this.getMon(d) * 100 + this.getDay(d);

			var age = s_y - d_y;

			if (s_md < d_md) {
				age -= 1;
			}
			return age;
		};
		//fromからtoまでの経過月数を計算
		p.calcAgeMonth = function(from, to) {
			var s;
			var d;

			if (to === undefined || to === null) {
				if (from === undefined || from === null) {
					return;
				}
				s = this.setCurrent();
				d = from;
			} else {
				s = to;
				d = from;
			}

			var s_y = this.getYear(s);
			var s_m = this.getMon(s);

			if (s_y <= 1900) {
				return 0;
			}

			var d_y = this.getYear(d);
			var d_m = this.getMon(d);

			var age = s_y * 12 + s_m - (d_y * 12 + d_m) + 1;

			return age;
		};
		p.getYear = function(mValue) {
			return Math.floor(mValue / 10000);
		};
		p.getMon = function(mValue) {
			return Math.floor(mValue / 100) % 100;
		};
		p.getDay = function(mValue) {
			return mValue % 100;
		};
		p.setYear = function(y) {
			return y * 10000;
		};
		p.setMon = function(m) {
			return m * 100;
		};
		p.setDay = function(d) {
			return d;
		};
		return LPdate;
	})();

	/**
	 lp_setupinfo - システム設定情報
	 */
	// クラス定義 class extends TableBase
	var Lp_setupinfo = (function() {

		var Lp_setupinfo = function() {
			this.id_company = "";
			this.st_url = "";
			this.fg_okane = 0;
			this.st_okane = "";
			this.fg_modelcase = 0;
			this.st_modelcase = "";
			this.st_color = "";
			this.fg_debug = 0;
		};

		LIFEPLAN.module.inherits(Lp_setupinfo, TableBase);
		var p = Lp_setupinfo.prototype;

		p.fromjson = function(from) {
			this.id_company = from.id_company;
			this.st_url = from.st_url;
			this.fg_okane = Number(from.fg_okane);
			this.st_okane = from.st_okane;
			this.fg_modelcase = Number(from.fg_modelcase);
			this.st_modelcase = from.st_modelcase;
			this.st_color = from.st_color;
			this.fg_debug = Number(from.fg_debug);
		};

		return Lp_setupinfo;
	})();

//	/**
//	  lp_modelcase - モデルケース（メイン）
//	*/
	// クラス定義 class extends TableBase
	var Lp_modelcase = (function() {

		var Lp_modelcase = function() {
			TableBase.call(this);

			this.id_modelcase = 0;
			this.st_modelcase = "";
			this.id_sex_hon = 0;
			this.age_hon = 0;
			this.age_hai = 0;
			this.id_haiumu = 0;
			this.age_kekkon = 0;
			this.id_syokugyo_hon = 0;
			this.id_syokugyo_hai = 0;
			this.ym_syugyo_hon = new LPdate();
			this.ym_syugyo_hai = new LPdate();
			this.age_syugyo_hon = 0;
			this.age_syugyo_hai = 0;
			this.age_taisyoku_hon = 0;
			this.age_taisyoku_hai = 0;
			this.id_lives = 0;
			this.id_lives_yotei = 0;
			this.sm_rent = 0;
			this.sm_assets = 0;
			this.mon_saving1_from = 0;
			this.mon_saving1_to = 0;
			this.sm_saving1 = 0;
			this.mon_saving2_from = 0;
			this.mon_saving2_to = 0;
			this.sm_saving2 = 0;
			this.id_invest = 0;
			this.id_tai_invest = 0;
			this.id_gyosyu_hon = 0;
			this.id_gyosyu_hai = 0;
			this.id_syokusyu_hon = 0;
			this.id_syokusyu_hai = 0;
			this.id_kibo_hon = 0;
			this.id_kibo_hai = 0;
			this.sm_nensyu_hon = 0;
			this.sm_nensyu_hai = 0;
			this.sm_tai_nensyu_hon = 0;
			this.sm_tai_nensyu_hai = 0;
			this.ra_nensyu_hon = 0.0;
			this.ra_nensyu_hai = 0.0;
			this.id_kinmu_hon = 0;
			this.id_kinmu_hai = 0;
			this.age_kakosyugyo_hon = 0;
			this.age_kakosyugyo_hai = 0;
			this.age_kakotaisyoku_hon = 0;
			this.age_kakotaisyoku_hai = 0;
			this.sm_income1_from = 0;
			this.sm_income1_to = 0;
			this.sm_income1 = 0;
			this.sm_income2_from = 0;
			this.sm_income2_to = 0;
			this.sm_income2 = 0;
			this.sm_income3_from = 0;
			this.sm_income3_to = 0;
			this.sm_income3 = 0;
			this.sm_taisyoku_hon = 0;
			this.sm_taisyoku_hai = 0;
			this.age_saisyusyoku_st_hon = 0;
			this.age_saisyusyoku_st_hai = 0;
			this.age_saisyusyoku_end_hon = 0;
			this.age_saisyusyoku_end_hai = 0;
			this.sm_saisyu_income_hon = 0;
			this.sm_saisyu_income_hai = 0;
			this.sm_livingcost = 0;
			this.age_jyutaku = 0;
			this.id_prefecture = 0;
			this.id_jyutakutype = 0;
			this.sm_jyutakuyosan = 0;
			this.sm_jyutakukeihi = 0;
			this.id_jyutakuloan = 0;
			this.age_zoukaichiku = 0;
			this.sm_zoukaichiku = 0;
			this.sm_kariire = 0;
			this.no_hensai = 0;
			this.ra_kariirekinri1 = 0.0;
			this.no_kariirekinri2 = 0;
			this.ra_kariirekinri2 = 0.0;
			this.no_kariirekinri3 = 0;
			this.ra_kariirekinri3 = 0.0;
			this.id_syouyo = 0;
			this.sm_syouyo = 0;
			this.y_kuriage = 0;
			this.sm_kuriage = 0;
			this.id_kuriage = 0;
			this.id_dansin = 0;
			this.sm_kihon = 0;
			/*****2014/01/20  基本生活費、退職後生活費の入力欄追加	start***********/
			this.sm_taiseikatu = 0;
			/*****2014/01/20  基本生活費、退職後生活費の入力欄追加	end***********/

			//個別データ
			this.save_kihon_gen = -1;
			this.save_kihon_tai = -1;
			this.save_ryudoshikin_gen = -1;
			this.save_anteishikin_gen = -1;
			this.save_yobishikin_gen = -1;
			this.save_unyoshikin_gen = -1;
			this.save_ryudoshikin_tai = -1;
			this.save_anteishikin_tai = -1;
			this.save_yobishikin_tai = -1;
			this.save_unyoshikin_tai = -1;
			this.save_kiso_bu_hon = -1;
			this.save_kiso_to_hon = -1;
			this.save_kiso_65_hon = -1;
			this.save_kiso_70_hon = -1;
			this.save_kose_bu_hon = -1;
			this.save_kose_to_hon = -1;
			this.save_kose_65_hon = -1;
			this.save_kose_70_hon = -1;
			this.save_tai_bu_hon = -1;
			this.save_tai_to_hon = -1;
			this.save_tai_65_hon = -1;
			this.save_tai_70_hon = -1;
			this.save_kakyu_bu_hon = -1;
			this.save_kakyu_to_hon = -1;
			this.save_kakyu_65_hon = -1;
			this.save_kakyu_70_hon = -1;
			this.save_furikae_bu_hon = -1;
			this.save_furikae_to_hon = -1;
			this.save_furikae_65_hon = -1;
			this.save_furikae_70_hon = -1;
			this.save_kiso_bu_hai = -1;
			this.save_kiso_to_hai = -1;
			this.save_kiso_65_hai = -1;
			this.save_kiso_70_hai = -1;
			this.save_kose_bu_hai = -1;
			this.save_kose_to_hai = -1;
			this.save_kose_65_hai = -1;
			this.save_kose_70_hai = -1;
			this.save_tai_bu_hai = -1;
			this.save_tai_to_hai = -1;
			this.save_tai_65_hai = -1;
			this.save_tai_70_hai = -1;
			this.save_kakyu_bu_hai = -1;
			this.save_kakyu_to_hai = -1;
			this.save_kakyu_65_hai = -1;
			this.save_kakyu_70_hai = -1;
			this.save_furikae_bu_hai = -1;
			this.save_furikae_to_hai = -1;
			this.save_furikae_65_hai = -1;
			this.save_furikae_70_hai = -1;

			this.m_modelcase_kyouiku = [];
			this.m_modelcase_hoken = [];
			this.m_modelcase_event = [];
			this.m_modelcase_lifestyle = {};
		};

		LIFEPLAN.module.inherits(Lp_modelcase, TableBase);
		var p = Lp_modelcase.prototype;

		p.fromjson = function(from) {
			this.id_modelcase = Number(from.id_modelcase);
			this.st_modelcase = from.st_modelcase;
			this.id_sex_hon = Number(from.id_sex_hon);

			this.age_hon = Number(from.age_hon);
			if (from.st_birthday_hon) {
				this.st_birthday_hon = from.st_birthday_hon;
			} else {
				this.st_birthday_hon = self.LPdate.fromAge(this.age_hon, null, null);
			}

			this.age_hai = Number(from.age_hai);
			if (from.st_birthday_hai) {
				this.st_birthday_hai = from.st_birthday_hai;
			} else {
				this.st_birthday_hai = self.LPdate.fromAge(this.age_hai, null, null);
			}

			this.id_haiumu = Number(from.id_haiumu);
			this.age_kekkon = Number(from.age_kekkon);
			this.id_syokugyo_hon = Number(from.id_syokugyo_hon);
			this.id_syokugyo_hai = Number(from.id_syokugyo_hai);

			this.age_syugyo_hon = Number(from.age_syugyo_hon);
			if (from.ym_syugyo_hon) {
				this.ym_syugyo_hon = from.ym_syugyo_hon;
			} else {
				this.ym_syugyo_hon = self.LPdate.fromAge(this.age_syugyo_hon, this.st_birthday_hon, null);
			}

			this.age_syugyo_hai = Number(from.age_syugyo_hai);
			if (from.ym_syugyo_hai) {
				this.ym_syugyo_hai = from.ym_syugyo_hai;
			} else {
				this.ym_syugyo_hai = self.LPdate.fromAge(this.age_syugyo_hai, this.st_birthday_hai, null);
			}

			this.age_taisyoku_hon = Number(from.age_taisyoku_hon);
			this.age_taisyoku_hai = Number(from.age_taisyoku_hai);
			this.id_lives = Number(from.id_lives);
			this.id_lives_yotei = Number(from.id_lives_yotei);
			this.sm_rent = Number(from.sm_rent);
			this.sm_assets = Number(from.sm_assets);
			this.mon_saving1_from = Number(from.mon_saving1_from);
			this.mon_saving1_to = Number(from.mon_saving1_to);
			this.sm_saving1 = Number(from.sm_saving1);
			this.mon_saving2_from = Number(from.mon_saving2_from);
			this.mon_saving2_to = Number(from.mon_saving2_to);
			this.sm_saving2 = Number(from.sm_saving2);
			this.id_invest = Number(from.id_invest);
			this.id_tai_invest = Number(from.id_tai_invest);
			this.id_gyosyu_hon = Number(from.id_gyosyu_hon);
			this.id_gyosyu_hai = Number(from.id_gyosyu_hai);
			this.id_syokusyu_hon = Number(from.id_syokusyu_hon);
			this.id_syokusyu_hai = Number(from.id_syokusyu_hai);
			this.id_kibo_hon = Number(from.id_kibo_hon);
			this.id_kibo_hai = Number(from.id_kibo_hai);
			this.sm_nensyu_hon = Number(from.sm_nensyu_hon);
			this.sm_nensyu_hai = Number(from.sm_nensyu_hai);
			this.sm_tai_nensyu_hon = Number(from.sm_tai_nensyu_hon);
			this.sm_tai_nensyu_hai = Number(from.sm_tai_nensyu_hai);
			this.ra_nensyu_hon = Number(from.ra_nensyu_hon);
			this.ra_nensyu_hai = Number(from.ra_nensyu_hai);
			this.id_kinmu_hon = Number(from.id_kinmu_hon);
			this.id_kinmu_hai = Number(from.id_kinmu_hai);
			this.age_kakosyugyo_hon = Number(from.age_kakosyugyo_hon);
			this.age_kakosyugyo_hai = Number(from.age_kakosyugyo_hai);
			this.age_kakotaisyoku_hon = Number(from.age_kakotaisyoku_hon);
			this.age_kakotaisyoku_hai = Number(from.age_kakotaisyoku_hai);
			this.sm_income1_from = Number(from.sm_income1_from);
			this.sm_income1_to = Number(from.sm_income1_to);
			this.sm_income1 = Number(from.sm_income1);
			this.sm_income2_from = Number(from.sm_income2_from);
			this.sm_income2_to = Number(from.sm_income2_to);
			this.sm_income2 = Number(from.sm_income2);
			this.sm_income3_from = Number(from.sm_income3_from);
			this.sm_income3_to = Number(from.sm_income3_to);
			this.sm_income3 = Number(from.sm_income3);
			this.sm_taisyoku_hon = Number(from.sm_taisyoku_hon);
			this.sm_taisyoku_hai = Number(from.sm_taisyoku_hai);
			this.age_saisyusyoku_st_hon = Number(from.age_saisyusyoku_st_hon);
			this.age_saisyusyoku_st_hai = Number(from.age_saisyusyoku_st_hai);
			this.age_saisyusyoku_end_hon = Number(from.age_saisyusyoku_end_hon);
			this.age_saisyusyoku_end_hai = Number(from.age_saisyusyoku_end_hai);
			this.sm_saisyu_income_hon = Number(from.sm_saisyu_income_hon);
			this.sm_saisyu_income_hai = Number(from.sm_saisyu_income_hai);
			this.sm_livingcost = Number(from.sm_livingcost);
			this.age_jyutaku = Number(from.age_jyutaku);
			this.id_prefecture = Number(from.id_prefecture);
			this.id_jyutakutype = Number(from.id_jyutakutype);
			this.sm_jyutakuyosan = Number(from.sm_jyutakuyosan);
			this.sm_jyutakukeihi = Number(from.sm_jyutakukeihi);
			this.id_jyutakuloan = Number(from.id_jyutakuloan);
			this.age_zoukaichiku = Number(from.age_zoukaichiku);
			this.sm_zoukaichiku = Number(from.sm_zoukaichiku);
			this.sm_kariire = Number(from.sm_kariire);
			this.no_hensai = Number(from.no_hensai);
			this.ra_kariirekinri1 = Number(from.ra_kariirekinri1);
			this.no_kariirekinri2 = Number(from.no_kariirekinri2);
			this.ra_kariirekinri2 = Number(from.ra_kariirekinri2);
			this.no_kariirekinri3 = Number(from.no_kariirekinri3);
			this.ra_kariirekinri3 = Number(from.ra_kariirekinri3);
			this.id_syouyo = Number(from.id_syouyo);
			this.sm_syouyo = Number(from.sm_syouyo);
			this.y_kuriage = Number(from.y_kuriage);
			this.sm_kuriage = Number(from.sm_kuriage);
			this.id_kuriage = Number(from.id_kuriage);
			this.id_dansin = Number(from.id_dansin);
			this.sm_kihon = Number(from.sm_kihon);
			/*****2014/01/20  基本生活費、退職後生活費の入力欄追加	start***********/
			this.sm_taiseikatu = Number(from.sm_taiseikatu);
			/*****2014/01/20  基本生活費、退職後生活費の入力欄追加	end***********/
			//個別データ
			this.save_kihon_gen = this.NumberWithDefault(from.save_kihon_gen, -1);
			this.save_kihon_tai = this.NumberWithDefault(from.save_kihon_tai, -1);
			this.save_ryudoshikin_gen = this.NumberWithDefault(from.save_ryudoshikin_gen, -1);
			this.save_anteishikin_gen = this.NumberWithDefault(from.save_anteishikin_gen, -1);
			this.save_yobishikin_gen = this.NumberWithDefault(from.save_yobishikin_gen, -1);
			this.save_unyoshikin_gen = this.NumberWithDefault(from.save_unyoshikin_gen, -1);
			this.save_ryudoshikin_tai = this.NumberWithDefault(from.save_ryudoshikin_tai, -1);
			this.save_anteishikin_tai = this.NumberWithDefault(from.save_anteishikin_tai, -1);
			this.save_yobishikin_tai = this.NumberWithDefault(from.save_yobishikin_tai, -1);
			this.save_unyoshikin_tai = this.NumberWithDefault(from.save_unyoshikin_tai, -1);
			this.save_kiso_bu_hon = this.NumberWithDefault(from.save_kiso_bu_hon, -1);
			this.save_kiso_to_hon = this.NumberWithDefault(from.save_kiso_to_hon, -1);
			this.save_kiso_65_hon = this.NumberWithDefault(from.save_kiso_65_hon, -1);
			this.save_kiso_70_hon = this.NumberWithDefault(from.save_kiso_70_hon, -1);
			this.save_kose_bu_hon = this.NumberWithDefault(from.save_kose_bu_hon, -1);
			this.save_kose_to_hon = this.NumberWithDefault(from.save_kose_to_hon, -1);
			this.save_kose_65_hon = this.NumberWithDefault(from.save_kose_65_hon, -1);
			this.save_kose_70_hon = this.NumberWithDefault(from.save_kose_70_hon, -1);
			this.save_tai_bu_hon = this.NumberWithDefault(from.save_tai_bu_hon, -1);
			this.save_tai_to_hon = this.NumberWithDefault(from.save_tai_to_hon, -1);
			this.save_tai_65_hon = this.NumberWithDefault(from.save_tai_65_hon, -1);
			this.save_tai_70_hon = this.NumberWithDefault(from.save_tai_70_hon, -1);
			this.save_kakyu_bu_hon = this.NumberWithDefault(from.save_kakyu_bu_hon, -1);
			this.save_kakyu_to_hon = this.NumberWithDefault(from.save_kakyu_to_hon, -1);
			this.save_kakyu_65_hon = this.NumberWithDefault(from.save_kakyu_65_hon, -1);
			this.save_kakyu_70_hon = this.NumberWithDefault(from.save_kakyu_70_hon, -1);
			this.save_furikae_bu_hon = this.NumberWithDefault(from.save_furikae_bu_hon, -1);
			this.save_furikae_to_hon = this.NumberWithDefault(from.save_furikae_to_hon, -1);
			this.save_furikae_65_hon = this.NumberWithDefault(from.save_furikae_65_hon, -1);
			this.save_furikae_70_hon = this.NumberWithDefault(from.save_furikae_70_hon, -1);
			this.save_kiso_bu_hai = this.NumberWithDefault(from.save_kiso_bu_hai, -1);
			this.save_kiso_to_hai = this.NumberWithDefault(from.save_kiso_to_hai, -1);
			this.save_kiso_65_hai = this.NumberWithDefault(from.save_kiso_65_hai, -1);
			this.save_kiso_70_hai = this.NumberWithDefault(from.save_kiso_70_hai, -1);
			this.save_kose_bu_hai = this.NumberWithDefault(from.save_kose_bu_hai, -1);
			this.save_kose_to_hai = this.NumberWithDefault(from.save_kose_to_hai, -1);
			this.save_kose_65_hai = this.NumberWithDefault(from.save_kose_65_hai, -1);
			this.save_kose_70_hai = this.NumberWithDefault(from.save_kose_70_hai, -1);
			this.save_tai_bu_hai = this.NumberWithDefault(from.save_tai_bu_hai, -1);
			this.save_tai_to_hai = this.NumberWithDefault(from.save_tai_to_hai, -1);
			this.save_tai_65_hai = this.NumberWithDefault(from.save_tai_65_hai, -1);
			this.save_tai_70_hai = this.NumberWithDefault(from.save_tai_70_hai, -1);
			this.save_kakyu_bu_hai = this.NumberWithDefault(from.save_kakyu_bu_hai, -1);
			this.save_kakyu_to_hai = this.NumberWithDefault(from.save_kakyu_to_hai, -1);
			this.save_kakyu_65_hai = this.NumberWithDefault(from.save_kakyu_65_hai, -1);
			this.save_kakyu_70_hai = this.NumberWithDefault(from.save_kakyu_70_hai, -1);
			this.save_furikae_bu_hai = this.NumberWithDefault(from.save_furikae_bu_hai, -1);
			this.save_furikae_to_hai = this.NumberWithDefault(from.save_furikae_to_hai, -1);
			this.save_furikae_65_hai = this.NumberWithDefault(from.save_furikae_65_hai, -1);
			this.save_furikae_70_hai = this.NumberWithDefault(from.save_furikae_70_hai, -1);
		};
		p.key = function() {
			return this.id_modelcase;
		};
		p.copy = function(other) {
			this.id_modelcase = other.id_modelcase;
			this.st_modelcase = other.st_modelcase;
			this.id_sex_hon = other.id_sex_hon;
			this.st_birthday_hon = other.st_birthday_hon;
			this.st_birthday_hai = other.st_birthday_hai;
			this.age_hon = other.age_hon;
			this.age_hai = other.age_hai;

			this.id_haiumu = other.id_haiumu;
			this.age_kekkon = other.age_kekkon;
			this.id_syokugyo_hon = other.id_syokugyo_hon;
			this.id_syokugyo_hai = other.id_syokugyo_hai;
			this.age_syugyo_hon = other.age_syugyo_hon;
			this.ym_syugyo_hon = other.ym_syugyo_hon;
			this.age_syugyo_hai = other.age_syugyo_hai;
			this.ym_syugyo_hai = other.ym_syugyo_hai;
			this.age_taisyoku_hon = other.age_taisyoku_hon;
			this.age_taisyoku_hai = other.age_taisyoku_hai;
			this.id_lives = other.id_lives;
			this.id_lives_yotei = other.id_lives_yotei;
			this.sm_rent = other.sm_rent;
			this.sm_assets = other.sm_assets;
			this.mon_saving1_from = other.mon_saving1_from;
			this.mon_saving1_to = other.mon_saving1_to;
			this.sm_saving1 = other.sm_saving1;
			this.mon_saving2_from = other.mon_saving2_from;
			this.mon_saving2_to = other.mon_saving2_to;
			this.sm_saving2 = other.sm_saving2;
			this.id_invest = other.id_invest;
			this.id_tai_invest = other.id_tai_invest;
			this.id_gyosyu_hon = other.id_gyosyu_hon;
			this.id_gyosyu_hai = other.id_gyosyu_hai;
			this.id_syokusyu_hon = other.id_syokusyu_hon;
			this.id_syokusyu_hai = other.id_syokusyu_hai;
			this.id_kibo_hon = other.id_kibo_hon;
			this.id_kibo_hai = other.id_kibo_hai;
			this.sm_nensyu_hon = other.sm_nensyu_hon;
			this.sm_nensyu_hai = other.sm_nensyu_hai;
			this.sm_tai_nensyu_hon = other.sm_tai_nensyu_hon;
			this.sm_tai_nensyu_hai = other.sm_tai_nensyu_hai;
			this.ra_nensyu_hon = other.ra_nensyu_hon;
			this.ra_nensyu_hai = other.ra_nensyu_hai;
			this.id_kinmu_hon = other.id_kinmu_hon;
			this.id_kinmu_hai = other.id_kinmu_hai;
			this.age_kakosyugyo_hon = other.age_kakosyugyo_hon;
			this.age_kakosyugyo_hai = other.age_kakosyugyo_hai;
			this.age_kakotaisyoku_hon = other.age_kakotaisyoku_hon;
			this.age_kakotaisyoku_hai = other.age_kakotaisyoku_hai;
			this.sm_income1_from = other.sm_income1_from;
			this.sm_income1_to = other.sm_income1_to;
			this.sm_income1 = other.sm_income1;
			this.sm_income2_from = other.sm_income2_from;
			this.sm_income2_to = other.sm_income2_to;
			this.sm_income2 = other.sm_income2;
			this.sm_income3_from = other.sm_income3_from;
			this.sm_income3_to = other.sm_income3_to;
			this.sm_income3 = other.sm_income3;
			this.sm_taisyoku_hon = other.sm_taisyoku_hon;
			this.sm_taisyoku_hai = other.sm_taisyoku_hai;
			this.age_saisyusyoku_st_hon = other.age_saisyusyoku_st_hon;
			this.age_saisyusyoku_st_hai = other.age_saisyusyoku_st_hai;
			this.age_saisyusyoku_end_hon = other.age_saisyusyoku_end_hon;
			this.age_saisyusyoku_end_hai = other.age_saisyusyoku_end_hai;
			this.sm_saisyu_income_hon = other.sm_saisyu_income_hon;
			this.sm_saisyu_income_hai = other.sm_saisyu_income_hai;
			this.sm_livingcost = other.sm_livingcost;
			this.age_jyutaku = other.age_jyutaku;
			this.id_prefecture = other.id_prefecture;
			this.id_jyutakutype = other.id_jyutakutype;
			this.sm_jyutakuyosan = other.sm_jyutakuyosan;
			this.sm_jyutakukeihi = other.sm_jyutakukeihi;
			this.id_jyutakuloan = other.id_jyutakuloan;
			this.age_zoukaichiku = other.age_zoukaichiku;
			this.sm_zoukaichiku = other.sm_zoukaichiku;
			this.sm_kariire = other.sm_kariire;
			this.no_hensai = other.no_hensai;
			this.ra_kariirekinri1 = other.ra_kariirekinri1;
			this.no_kariirekinri2 = other.no_kariirekinri2;
			this.ra_kariirekinri2 = other.ra_kariirekinri2;
			this.no_kariirekinri3 = other.no_kariirekinri3;
			this.ra_kariirekinri3 = other.ra_kariirekinri3;
			this.id_syouyo = other.id_syouyo;
			this.sm_syouyo = other.sm_syouyo;
			this.y_kuriage = other.y_kuriage;
			this.sm_kuriage = other.sm_kuriage;
			this.id_kuriage = other.id_kuriage;
			this.id_dansin = other.id_dansin;
			this.sm_kihon = other.sm_kihon;
			/*****2014/01/20  基本生活費、退職後生活費の入力欄追加	start***********/
			this.sm_taiseikatu = other.sm_taiseikatu;
			/*****2014/01/20  基本生活費、退職後生活費の入力欄追加	end***********/

			//個別データ
			this.save_kihon_gen = other.save_kihon_gen;
			this.save_kihon_tai = other.save_kihon_tai;
			this.save_ryudoshikin_gen = other.save_ryudoshikin_gen;
			this.save_anteishikin_gen = other.save_anteishikin_gen;
			this.save_yobishikin_gen = other.save_yobishikin_gen;
			this.save_unyoshikin_gen = other.save_unyoshikin_gen;
			this.save_ryudoshikin_tai = other.save_ryudoshikin_tai;
			this.save_anteishikin_tai = other.save_anteishikin_tai;
			this.save_yobishikin_tai = other.save_yobishikin_tai;
			this.save_unyoshikin_tai = other.save_unyoshikin_tai;
			this.save_kiso_bu_hon = other.save_kiso_bu_hon;
			this.save_kiso_to_hon = other.save_kiso_to_hon;
			this.save_kiso_65_hon = other.save_kiso_65_hon;
			this.save_kiso_70_hon = other.save_kiso_70_hon;
			this.save_kose_bu_hon = other.save_kose_bu_hon;
			this.save_kose_to_hon = other.save_kose_to_hon;
			this.save_kose_65_hon = other.save_kose_65_hon;
			this.save_kose_70_hon = other.save_kose_70_hon;
			this.save_tai_bu_hon = other.save_tai_bu_hon;
			this.save_tai_to_hon = other.save_tai_to_hon;
			this.save_tai_65_hon = other.save_tai_65_hon;
			this.save_tai_70_hon = other.save_tai_70_hon;
			this.save_kakyu_bu_hon = other.save_kakyu_bu_hon;
			this.save_kakyu_to_hon = other.save_kakyu_to_hon;
			this.save_kakyu_65_hon = other.save_kakyu_65_hon;
			this.save_kakyu_70_hon = other.save_kakyu_70_hon;
			this.save_furikae_bu_hon = other.save_furikae_bu_hon;
			this.save_furikae_to_hon = other.save_furikae_to_hon;
			this.save_furikae_65_hon = other.save_furikae_65_hon;
			this.save_furikae_70_hon = other.save_furikae_70_hon;
			this.save_kiso_bu_hai = other.save_kiso_bu_hai;
			this.save_kiso_to_hai = other.save_kiso_to_hai;
			this.save_kiso_65_hai = other.save_kiso_65_hai;
			this.save_kiso_70_hai = other.save_kiso_70_hai;
			this.save_kose_bu_hai = other.save_kose_bu_hai;
			this.save_kose_to_hai = other.save_kose_to_hai;
			this.save_kose_65_hai = other.save_kose_65_hai;
			this.save_kose_70_hai = other.save_kose_70_hai;
			this.save_tai_bu_hai = other.save_tai_bu_hai;
			this.save_tai_to_hai = other.save_tai_to_hai;
			this.save_tai_65_hai = other.save_tai_65_hai;
			this.save_tai_70_hai = other.save_tai_70_hai;
			this.save_kakyu_bu_hai = other.save_kakyu_bu_hai;
			this.save_kakyu_to_hai = other.save_kakyu_to_hai;
			this.save_kakyu_65_hai = other.save_kakyu_65_hai;
			this.save_kakyu_70_hai = other.save_kakyu_70_hai;
			this.save_furikae_bu_hai = other.save_furikae_bu_hai;
			this.save_furikae_to_hai = other.save_furikae_to_hai;
			this.save_furikae_65_hai = other.save_furikae_65_hai;
			this.save_furikae_70_hai = other.save_furikae_70_hai;
		};
		p.is_kekkon = function() {
			if (this.id_haiumu === 1 || this.age_kekkon > 0) {
				return true;
			}
			return false;
		};
		p.get_st_birthday = function(is_hai) {
			return is_hai ? this.st_birthday_hai : this.st_birthday_hon;
		};
		p.get_age = function(is_hai) {
			return is_hai ? this.age_hai : this.age_hon;
		};
		p.get_id_syokugyo = function(is_hai) {
			return is_hai ? this.id_syokugyo_hai : this.id_syokugyo_hon;
		};
		p.set_id_syokugyo = function(data, is_hai) {
			if (is_hai) {
				this.id_syokugyo_hai = data;
			} else {
				this.id_syokugyo_hon = data;
			}
		};
		p.get_ym_syugyo = function(is_hai) {
			return is_hai ? this.ym_syugyo_hai : this.ym_syugyo_hon;
		};
		p.set_ym_syugyo = function(data, is_hai) {
			if (is_hai) {
				this.ym_syugyo_hai = data;
			} else {
				this.ym_syugyo_hon = data;
			}
		};
		p.get_age_syugyo = function(is_hai) {
			return is_hai ? this.age_syugyo_hai : this.age_syugyo_hon;
		};
		p.set_age_syugyo = function(data, is_hai) {
			if (is_hai) {
				this.age_syugyo_hai = data;
			} else {
				this.age_syugyo_hon = data;
			}
		};
		p.get_age_taisyoku = function(is_hai) {
			return is_hai ? this.age_taisyoku_hai : this.age_taisyoku_hon;
		};
		p.set_age_taisyoku = function(data, is_hai) {
			if (is_hai) {
				this.age_taisyoku_hai = data;
			} else {
				this.age_taisyoku_hon = data;
			}
		};
		p.get_id_gyosyu = function(is_hai) {
			return is_hai ? this.id_gyosyu_hai : this.id_gyosyu_hon;
		};
		p.set_id_gyosyu = function(data, is_hai) {
			if (is_hai) {
				this.id_gyosyu_hai = data;
			} else {
				this.id_gyosyu_hon = data;
			}
		};
		p.get_id_syokusyu = function(is_hai) {
			return is_hai ? this.id_syokusyu_hai : this.id_syokusyu_hon;
		};
		p.set_id_syokusyu = function(data, is_hai) {
			if (is_hai) {
				this.id_syokusyu_hai = data;
			} else {
				this.id_syokusyu_hon = data;
			}
		};
		p.get_id_kibo = function(is_hai) {
			return is_hai ? this.id_kibo_hai : this.id_kibo_hon;
		};
		p.set_id_kibo = function(data, is_hai) {
			if (is_hai) {
				this.id_kibo_hai = data;
			} else {
				this.id_kibo_hon = data;
			}
		};
		p.get_sm_nensyu = function(is_hai) {
			return is_hai ? this.sm_nensyu_hai : this.sm_nensyu_hon;
		};
		p.set_sm_nensyu = function(data, is_hai) {
			if (is_hai) {
				this.sm_nensyu_hai = data;
			} else {
				this.sm_nensyu_hon = data;
			}
		};
		p.get_sm_tai_nensyu = function(is_hai) {
			return is_hai ? this.sm_tai_nensyu_hai : this.sm_tai_nensyu_hon;
		};
		p.set_sm_tai_nensyu = function(data, is_hai) {
			if (is_hai) {
				this.sm_tai_nensyu_hai = data;
			} else {
				this.sm_tai_nensyu_hon = data;
			}
		};
		p.get_ra_nensyu = function(is_hai) {
			return is_hai ? this.ra_nensyu_hai : this.ra_nensyu_hon;
		};
		p.set_ra_nensyu = function(data, is_hai) {
			if (is_hai) {
				this.ra_nensyu_hai = data;
			} else {
				this.ra_nensyu_hon = data;
			}
		};
		p.get_id_kinmu = function(is_hai) {
			return is_hai ? this.id_kinmu_hai : this.id_kinmu_hon;
		};
		p.set_id_kinmu = function(data, is_hai) {
			if (is_hai) {
				this.id_kinmu_hai = data;
			} else {
				this.id_kinmu_hon = data;
			}
		};
		p.get_sm_taisyoku = function(is_hai) {
			return is_hai ? this.sm_taisyoku_hai : this.sm_taisyoku_hon;
		};
		p.set_sm_taisyoku = function(data, is_hai) {
			if (is_hai) {
				this.sm_taisyoku_hai = data;
			} else {
				this.sm_taisyoku_hon = data;
			}
		};
		p.get_age_saisyusyoku_st = function(is_hai) {
			return is_hai ? this.age_saisyusyoku_st_hai : this.age_saisyusyoku_st_hon;
		};
		p.set_age_saisyusyoku_st = function(data, is_hai) {
			if (is_hai) {
				this.age_saisyusyoku_st_hai = data;
			} else {
				this.age_saisyusyoku_st_hon = data;
			}
		};
		p.get_age_saisyusyoku_end = function(is_hai) {
			return is_hai ? this.age_saisyusyoku_end_hai : this.age_saisyusyoku_end_hon;
		};
		p.set_age_saisyusyoku_end = function(data, is_hai) {
			if (is_hai) {
				this.age_saisyusyoku_end_hai = data;
			} else {
				this.age_saisyusyoku_end_hon = data;
			}
		};
		p.get_age_kakosyugyo = function(is_hai) {
			return is_hai ? this.age_kakosyugyo_hai : this.age_kakosyugyo_hon;
		};
		p.get_age_kakotaisyoku = function(is_hai) {
			return is_hai ? this.age_kakotaisyoku_hai : this.age_kakotaisyoku_hon;
		};
		p.get_sm_saisyu_income = function(is_hai) {
			return is_hai ? this.sm_saisyu_income_hai : this.sm_saisyu_income_hon;
		};
		p.set_sm_saisyu_income = function(data, is_hai) {
			if (is_hai) {
				this.sm_saisyu_income_hai = data;
			} else {
				this.sm_saisyu_income_hon = data;
			}
		};
		p.get_kyouiku = function(no_child) {
			for (var i = 0; i < self.mc.s_modelcase.m_modelcase_kyouiku.length; i++) {
				var item = self.mc.s_modelcase.m_modelcase_kyouiku[i];
				if (item.no_child === no_child) {
					return item;
				}
			}
			return null;
		};
		//子供の数の取得
		p.get_child_count = function() {
			return self.mc.s_modelcase.m_modelcase_kyouiku.length;
		};
		p.get_hoken_list = function(id_honhai) {
			var ret = [];
			for (var i = 0; i < this.m_modelcase_hoken.length; i++) {
				var row = this.m_modelcase_hoken[i];
				if (row.id_honhai !== id_honhai) {
					continue;
				}
				ret.push(row);
			}
			return ret;
		};
		p.add_hoken = function(hoken) {
			hoken.id_modelcase = this.id_modelcase;
			this.m_modelcase_hoken.push(hoken);
		};
		p.get_event_list = function() {
			return this.m_modelcase_event;
		};
		p.add_event = function(event) {
			event.id_modelcase = this.id_modelcase;
			if (!this.is_invalid_add_event(event)) {
				return false;
			}
			this.m_modelcase_event.push(event);
			return true;
		};
		/**
		 * 追加可否判定
		 * @param event
		 * @return
		 */
		p.is_invalid_add_event = function(event) {
			return true;
		};

		return Lp_modelcase;
	})();

	/**
	 lp_modelcase_kyouiku - モデルケース（教育プラン）
	 */
	// class extends TableBase
	var Lp_modelcase_kyouiku = (function() {

		var Lp_modelcase_kyouiku = function() {
			this.clear();
		};

		LIFEPLAN.module.inherits(Lp_modelcase_kyouiku, TableBase);
		var p = Lp_modelcase_kyouiku.prototype;

		p.fromjson = function(from) {
			this.id_modelcase = Number(from.id_modelcase);
			this.no_child = Number(from.no_child);
			this.ymd_birth_from = self.LPdate.fromjson(from.ymd_birth_from);
			this.age_child = Number(from.age_child);
			this.ymd_child = (from.ymd_child === "") ? self.LPdate.fromAge(this.age_child, null, null) : Number(from.ymd_child);
			this.id_kindergarten = Number(from.id_kindergarten);
			this.no_kindergarten = Number(from.no_kindergarten);
			this.id_primary_school = Number(from.id_primary_school);
			this.id_junior_high_school = Number(from.id_junior_high_school);
			this.id_high_school = Number(from.id_high_school);
			this.id_college = Number(from.id_college);
			this.id_college_course = Number(from.id_college_course);
			this.id_college_from = Number(from.id_college_from);
			this.age_enjo = this.NumberWithDefault(from.age_enjo, 0);
			this.sm_enjo = this.NumberWithDefault(from.sm_enjo, 0);
		};
		p.key = function() {
			return this.id_modelcase * 10 + this.no_child;
		};
		p.copy = function(other) {
			this.id_modelcase = other.id_modelcase;
			this.no_child = other.no_child;
			this.age_child = other.age_child;
			this.ymd_child.copy(other.ymd_child);
			this.id_kindergarten = other.id_kindergarten;
			this.no_kindergarten = other.no_kindergarten;
			this.id_primary_school = other.id_primary_school;
			this.id_junior_high_school = other.id_junior_high_school;
			this.id_high_school = other.id_high_school;
			this.id_college = other.id_college;
			this.id_college_course = other.id_college_course;
			this.id_college_from = other.id_college_from;
			this.age_enjo = other.age_enjo;
			this.sm_enjo = other.sm_enjo;
		};
		p.clear = function() {
			this.id_modelcase = 0;
			this.no_child = 0;
			this.age_child = 0;
			this.ymd_child = new LPdate();
			this.id_kindergarten = 0;
			this.no_kindergarten = 0;
			this.id_primary_school = 0;
			this.id_junior_high_school = 0;
			this.id_high_school = 0;
			this.id_college = 0;
			this.id_college_course = 0;
			this.id_college_from = 0;
			this.age_enjo = 0;
			this.sm_enjo = 0;
		};

		return Lp_modelcase_kyouiku;
	})();

	/**
	 lp_modelcase_event - モデルケース（イベント）
	 */
	// class extends TableBase
	var Lp_modelcase_event = (function() {

		var Lp_modelcase_event = function() {
			this.id_modelcase = 0;
			this.no_age = 0;
			this.id_line = 0;
			this.id_event = 0;
			this.sm_yosan = 0;
		};

		LIFEPLAN.module.inherits(Lp_modelcase_event, TableBase);
		var p = Lp_modelcase_event.prototype;

		p.key = function() {
			return this.id_modelcase;
		};
		p.fromjson = function(from) {
			this.id_modelcase = Number(from.id_modelcase);
			this.no_age = Number(from.no_age);
			this.id_line = Number(from.id_line);
			this.id_event = Number(from.id_event);
			this.sm_yosan = Number(from.sm_yosan);
		};
		p.copy = function(other) {
			this.id_modelcase = other.id_modelcase;
			this.no_age = other.no_age;
			this.id_line = other.id_line;
			this.id_event = other.id_event;
			this.sm_yosan = other.sm_yosan;
		};

		return Lp_modelcase_event;
	})();

	/**
	 lp_modelcase_hoken - モデルケース（保険プラン）
	 */
	// class extends TableBase
	var Lp_modelcase_hoken = (function() {

		var Lp_modelcase_hoken = function() {
			this.id_modelcase = 0;
			this.id_honhai = 0;
			this.id_goods = 0;
			this.id_policy = 0;
			this.age_keiyaku = 0;
			this.sm_hokenryo = 0;
			this.sm_hokenkin = 0;
			this.id_kikan1 = 0;
			this.id_kikan2 = 0;
			this.id_haraikomi = 0;
			this.age_haraikomi = 0;
		};

		LIFEPLAN.module.inherits(Lp_modelcase_hoken, TableBase);
		var p = Lp_modelcase_hoken.prototype;

		p.key = function() {
			return id_modelcase * 10 + id_honhai;
		};
		p.fromjson = function(from) {
			this.id_modelcase = Number(from.id_modelcase);
			this.id_honhai = Number(from.id_honhai);
			this.id_goods = Number(from.id_goods);
			this.id_policy = Number(from.id_policy);
			this.age_keiyaku = Number(from.age_keiyaku);
			this.sm_hokenryo = Number(from.sm_hokenryo);
			this.sm_hokenkin = Number(from.sm_hokenkin);
			this.id_kikan1 = Number(from.id_kikan1);
			this.id_kikan2 = Number(from.id_kikan2);
			this.id_haraikomi = Number(from.id_haraikomi);
			this.age_haraikomi = Number(from.age_haraikomi);
		};
		p.copy = function(other) {
			this.id_modelcase = other.id_modelcase;
			this.id_honhai = other.id_honhai;
			this.id_goods = other.id_goods;
			this.id_policy = other.id_policy;
			this.age_keiyaku = other.age_keiyaku;
			this.sm_hokenryo = other.sm_hokenryo;
			this.sm_hokenkin = other.sm_hokenkin;
			this.id_kikan1 = other.id_kikan1;
			this.id_kikan2 = other.id_kikan2;
			this.id_haraikomi = other.id_haraikomi;
			this.age_haraikomi = other.age_haraikomi;
		};
		p.clear = function() {
			this.id_honhai = 0;
			this.id_goods = 0;
			this.id_policy = 0;
			this.age_keiyaku = 20;
			this.sm_hokenryo = 0;
			this.sm_hokenkin = 0;
			this.id_kikan1 = 0;
			this.id_kikan2 = "";
			this.id_haraikomi = 0;
			this.age_haraikomi = 20;
		};

		return Lp_modelcase_hoken;
	})();

	/**
	 lp_modelcase_calc - モデルケース（計算用）
	 */
	// class extends TableBase
	var Lp_modelcase_calc = (function() {

		var Lp_modelcase_calc = function() {
			this.AvgHousyu1;
			this.AvgHousyu2;
			this.KanyuTsukisu1;
			this.KanyuTsukisu2;
			this.KokuKanyuTsukisu;
			this.KyousaiKanyuTsukisu;   // 共済加入月数（被用者の年金制度の一元化2015/10/01施行までの）      2021/03/03 追加 被用者保険一元化対応
			this.JyukyuStAge;
			this.BubunStAge;
			this.TeigakuRate;
			this.KoseiRate;
			this.SyokuikiRate;
			this.HaiguToku;
			this.Furikae;
			this.TeigakuMaxMon;
			this.Tokureikikan;
			this.has_bu;
			this.has_to;
			this.has_65;
			this.has_70;
			this.year_70;
		};

		LIFEPLAN.module.inherits(Lp_modelcase_calc, TableBase);
		var p = Lp_modelcase_calc.prototype;

		p.clear = function() {
			this.KanyuTsukisu1 = 0;
			this.KanyuTsukisu2 = 0;
			this.KokuKanyuTsukisu = 0;
			this.KyousaiKanyuTsukisu = 0;
			this.JyukyuStAge = 0;
			this.BubunStAge = 0;
			this.TeigakuRate = 0;
			this.KoseiRate = 0;
			this.SyokuikiRate = 0;
			this.HaiguToku = 0;
			this.Furikae = 0;
			this.TeigakuMaxMon = 0;
			this.Tokureikikan = 0;
			this.has_bu = false;
			this.has_to = false;
			this.has_65 = true;
			this.has_to = false;
			this.year_70 = 0;
		};

		return Lp_modelcase_calc;
	})();

	/**
	 lp_modelcase_lifestyle - モデルケース（ライフスタイル文言）
	 */
	// class extends TableBase
	var Lp_modelcase_lifestyle = (function() {

		var Lp_modelcase_lifestyle = function() {
			this.id_screen = 0;
			this.id_modelcase = 0;
			this.st_message = "";
		};

		LIFEPLAN.module.inherits(Lp_modelcase_lifestyle, TableBase);
		var p = Lp_modelcase_lifestyle.prototype;

		p.fromjson = function(from) {
			this.id_screen = Number(from.id_screen);
			this.id_modelcase = Number(from.id_modelcase);
			this.st_message = from.st_message;
		};
		p.key = function() {
			return this.id_modelcase * 1000 + this.id_screen;
		};

		return Lp_modelcase_lifestyle;
	})();

	/**
	 lp_cmninfo - 共通設定情報
	 */
	// class extends TableBase
	var Lp_cmninfo = (function() {

		var Lp_cmninfo = function() {
			this.sm_roureikiso = 0;
			this.sm_teigakutanka = 0;
			this.sm_kakyunenkin = 0;
			this.sm_kakyunenkin3 = 0;
			this.sm_kahukasan = 0;
			this.ra_sibokousei = 0.0;
			this.ra_sibokyousai = 0.0;
			this.ra_sibokyousai_tanki = 0.0;
			this.sm_kisokojo_syotoku = 0;
			this.sm_kisokojo_jyu = 0;
			this.sm_haikojo_syotoku = 0;
			this.sm_haikojo_jyu = 0;
			this.sm_koreihaikojo_syotoku = 0;
			this.sm_koreihaikojo_jyu = 0;
			this.sm_huyokojo_syotoku_un16 = 0;
			this.sm_huyokojo_jyu_un16 = 0;
			this.sm_huyokojo_syotoku_un23 = 0;
			this.sm_huyokojo_jyu_un23 = 0;
			this.sm_nenkinhoken = 0;
			this.sm_koreihoken = 0;
			this.sm_kokuminhoken_hon = 0;
			this.sm_kokuhoken_hai = 0;
			this.ra_kokuminhoken = 0.0;
			this.ra_kenpo = 0.0;
			this.ra_kaigo1 = 0.0;
			this.ra_kaigo2 = 0.0;
			this.ra_koyou = 0.0;
			this.ra_kousei = 0.0;
			this.sm_koseihyoho_lower = 0;
			this.sm_koseihyoho_upper = 0;
			this.sm_kenpohyoho_lower = 0;
			this.sm_kenpohyoho_upper = 0;
			this.ra_hukkousyotoku = 0.0;
		};

		LIFEPLAN.module.inherits(Lp_cmninfo, TableBase);
		var p = Lp_cmninfo.prototype;

		p.fromjson = function(from) {
			this.sm_roureikiso = Number(from.sm_roureikiso);
			this.sm_teigakutanka = Number(from.sm_teigakutanka);
			this.sm_kakyunenkin = Number(from.sm_kakyunenkin);
			this.sm_kakyunenkin3 = Number(from.sm_kakyunenkin3);
			this.sm_kahukasan = Number(from.sm_kahukasan);
			this.ra_sibokousei = Number(from.ra_sibokousei);
			this.ra_sibokyousai = Number(from.ra_sibokyousai);
			this.ra_sibokyousai_tanki = Number(from.ra_sibokyousai_tanki);
			this.sm_kisokojo_syotoku = Number(from.sm_kisokojo_syotoku);
			this.sm_kisokojo_jyu = Number(from.sm_kisokojo_jyu);
			this.sm_haikojo_syotoku = Number(from.sm_haikojo_syotoku);
			this.sm_haikojo_jyu = Number(from.sm_haikojo_jyu);
			this.sm_koreihaikojo_syotoku = Number(from.sm_koreihaikojo_syotoku);
			this.sm_koreihaikojo_jyu = Number(from.sm_koreihaikojo_jyu);
			this.sm_huyokojo_syotoku_un16 = Number(from.sm_huyokojo_syotoku_un16);
			this.sm_huyokojo_jyu_un16 = Number(from.sm_huyokojo_jyu_un16);
			this.sm_huyokojo_syotoku_un23 = Number(from.sm_huyokojo_syotoku_un23);
			this.sm_huyokojo_jyu_un23 = Number(from.sm_huyokojo_jyu_un23);
			this.sm_nenkinhoken = Number(from.sm_nenkinhoken);
			this.sm_koreihoken = Number(from.sm_koreihoken);
			this.sm_kokuminhoken_hon = Number(from.sm_kokuminhoken_hon);
			this.sm_kokuhoken_hai = Number(from.sm_kokuhoken_hai);
			this.ra_kokuminhoken = Number(from.ra_kokuminhoken);
			this.ra_kenpo = Number(from.ra_kenpo);
			this.ra_kaigo1 = Number(from.ra_kaigo1);
			this.ra_kaigo2 = Number(from.ra_kaigo2);
			this.ra_koyou = Number(from.ra_koyou);
			this.ra_kousei = Number(from.ra_kousei);
			this.sm_koseihyoho_lower = Number(from.sm_koseihyoho_lower);
			this.sm_koseihyoho_upper = Number(from.sm_koseihyoho_upper);
			this.sm_kenpohyoho_lower = Number(from.sm_konpohyoho_lower);
			this.sm_kenpohyoho_upper = Number(from.sm_kenpohyoho_upper);
			this.ra_hukkousyotoku = Number(from.ra_hukkousyotoku);
		};

		return Lp_cmninfo;
	})();

	/**
	 lp_banksetupinfo - 個別設定情報
	 */
	// class extends TableBase
	var Lp_banksetupinfo = (function() {

		var Lp_banksetupinfo = function() {
			this.age_life_m = 0;
			this.age_life_w = 0;
			this.ra_cpi = 0.0;
			this.ra_cpi_kyouiku = 0.0;
			this.ra_cpi_chika = 0.0;
			this.ra_baseup_kako = 0.0;
			this.ra_baseup_fu = 0.0;
			this.ra_yield = 0.0;
			this.sm_rent = 0;
			this.no_rent_exp = 0;
			this.sm_housecost = 0;
			this.ra_loan = 0.0;
			this.ra_housecost_early = 0.0;
			this.ra_housecost_year = 0.0;
			this.sm_marriagehelp = 0;
			this.ra_livingcost_many = 0.0;
			this.ra_livingcost_normal = 0.0;
			this.ra_livingcost_few = 0.0;
			this.ra_livingcost_alone = 0.0;
			this.age_upper = 0;
			this.age_lower = 0;
			this.sm_yobi = 0;
			this.ra_kotei = 0.0;
		};
		LIFEPLAN.module.inherits(Lp_banksetupinfo, TableBase);
		var p = Lp_banksetupinfo.prototype;

		p.fromjson = function(from) {
			this.age_life_m = Number(from.age_life_m);
			this.age_life_w = Number(from.age_life_w);
			this.ra_cpi = Number(from.ra_cpi);
			this.ra_cpi_kyouiku = Number(from.ra_cpi_kyouiku);
			this.ra_cpi_chika = Number(from.ra_cpi_chika);
			this.ra_baseup_kako = Number(from.ra_baseup_kako);
			this.ra_baseup_fu = Number(from.ra_baseup_fu);
			this.ra_yield = Number(from.ra_yield);
			this.sm_rent = Number(from.sm_rent);
			this.no_rent_exp = Number(from.no_rent_exp);
			this.sm_housecost = Number(from.sm_housecost);
			this.ra_loan = Number(from.ra_loan);
			this.ra_housecost_early = Number(from.ra_housecost_early);
			this.ra_housecost_year = Number(from.ra_housecost_year);
			this.sm_marriagehelp = Number(from.sm_marriagehelp);
			this.ra_livingcost_many = Number(from.ra_livingcost_many);
			this.ra_livingcost_normal = Number(from.ra_livingcost_normal);
			this.ra_livingcost_few = Number(from.ra_livingcost_few);
			this.ra_livingcost_alone = Number(from.ra_livingcost_alone);
			this.age_upper = Number(from.age_upper);
			this.age_lower = Number(from.age_lower);
			this.sm_yobi = Number(from.sm_yobi);
			this.ra_kotei = Number(from.ra_kotei);
		};

		return Lp_banksetupinfo;
	})();

	/**
	 lp_screenmessage - 留意事項文言
	 */
	var Lp_screenmessage = (function() {

		var Lp_screenmessage = function() {
			this.id_message = 0;
			this.no_display = 0;
			this.st_title1 = "";
			this.st_title2 = "";
			this.st_message = "";
		};

		LIFEPLAN.module.inherits(Lp_screenmessage, TableBase);
		var p = Lp_screenmessage.prototype;

		p.key = function() {
			return no_display * 10 + this.id_message;
		};

		p.fromjson = function(from) {
			if (from.id_message === "R") {
				this.id_message = 1;
			} else {
				this.id_message = 0;
			}
			this.no_display = Number(from.no_display);
			this.st_title1 = from.st_title1;
			this.st_title2 = from.st_title2;
			this.st_message = from.st_message;
		};

		return Lp_screenmessage;
	})();

	/*****2014/01/20  診断結果画面作成	start***********/
	/**
	 lp_result_msg - 診断結果情報
	 */
	var Lp_result_msg = (function() {

		var Lp_result_msg = function() {
			this.id_result = 0;
			this.sm_assets = 0;
			this.st_mark = "";
			this.st_message = "";
		};

		LIFEPLAN.module.inherits(Lp_result_msg, TableBase);
		var p = Lp_result_msg.prototype;

		p.fromjson = function(from) {
			this.id_result = Number(from.id_result);
			this.sm_assets = Number(from.sm_assets);
			this.st_mark = from.st_mark;
			this.st_message = from.st_message;
		};

		return Lp_result_msg;
	})();
	/*****2014/01/20  診断結果画面作成	end***********/

	/**
	 lp_investstyle - 投資スタイル
	 */
	// class extends TableBase
	var Lp_investstyle = (function() {

		var Lp_investstyle = function() {
			this.id_invest = 0;
			this.st_invest = "";
			this.ra_invest = 0.0;
		};

		LIFEPLAN.module.inherits(Lp_investstyle, TableBase);
		var p = Lp_investstyle.prototype;

		p.key = function() {
			return this.id_invest;
		};
		p.fromjson = function(from) {
			this.id_invest = Number(from.id_invest);
			this.st_invest = from.st_invest;
			this.ra_invest = Number(from.ra_invest);
		};

		return Lp_investstyle;
	})();

	/**
	 lp_gyosyu - 業種区分
	 */
	var Lp_gyosyu = (function() {

		var Lp_gyosyu = function() {
			this.id_gyosyu = 0;
			this.st_gyosyu = "";
			this.no_display = 0;
		};

		LIFEPLAN.module.inherits(Lp_gyosyu, TableBase);
		var p = Lp_gyosyu.prototype;

		p.key = function() {
			return this.id_gyosyu;
		};
		p.fromjson = function(from) {
			this.id_gyosyu = Number(from.id_gyosyu);
			this.st_gyosyu = from.st_gyosyu;
			this.no_display = Number(from.no_display);
		};
		return Lp_gyosyu;
	})();

	/**
	 lp_syokusyu - 職種区分
	 */
	var Lp_syokusyu = (function() {

		var Lp_syokusyu = function() {
			this.id_syokusyu = 0;
			this.st_syokusyu = "";
			this.no_display = 0;
		};
		LIFEPLAN.module.inherits(Lp_syokusyu, TableBase);
		var p = Lp_syokusyu.prototype;

		p.key = function() {
			return this.id_syokusyu;
		};
		p.fromjson = function(from) {
			this.id_syokusyu = Number(from.id_syokusyu);
			this.st_syokusyu = from.st_syokusyu;
			this.no_display = Number(from.no_display);
		};

		return Lp_syokusyu;
	})();

	/**
	 lp_kibo - 規模区分
	 */
	var Lp_kibo = (function() {

		var Lp_kibo = function() {
			this.id_kibo = 0;
			this.st_kibo = "";
			this.no_display = 0;
		};
		LIFEPLAN.module.inherits(Lp_kibo, TableBase);
		var p = Lp_kibo.prototype;

		p.key = function() {
			return this.id_kibo;
		};
		p.fromjson = function(from) {
			this.id_kibo = Number(from.id_kibo);
			this.st_kibo = from.st_kibo;
			this.no_display = Number(from.no_display);
		};

		return Lp_kibo;
	})();

	/**
	 lp_incomestatistics - 年収統計値
	 */
	// class extends TableBase
	var Lp_incomestatistics = (function() {

		var Lp_incomestatistics = function() {
			this.id_gyosyu = 0;
			this.id_syokusyu = 0;
			this.no_age = 0;
			this.sm_income1 = 0;
			this.sm_income2 = 0;
			this.sm_income3 = 0;
		};
		LIFEPLAN.module.inherits(Lp_incomestatistics, TableBase);
		var p = Lp_incomestatistics.prototype;

		p.key = function() {
			return this.id_gyosyu * 100000 + this.id_syokusyu * 1000 + this.no_age;
		};
		p.fromjson = function(from) {
			this.id_gyosyu = Number(from.id_gyosyu);
			this.id_syokusyu = Number(from.id_syokusyu);
			this.no_age = Number(from.no_age);
			this.sm_income1 = Number(from.sm_income1);
			this.sm_income2 = Number(from.sm_income2);
			this.sm_income3 = Number(from.sm_income3);
		};

		return Lp_incomestatistics;
	})();

	/**
	 lp_syokugyo - 職業区分
	 */
	// class extends TableBase
	var Lp_syokugyo = (function() {

		var Lp_syokugyo = function() {
			this.id_syokugyo = 0;
			this.st_syokugyo = "";
			this.no_display = 0;
		};
		LIFEPLAN.module.inherits(Lp_syokugyo, TableBase);
		var p = Lp_syokugyo.prototype;

		p.key = function() {
			return this.id_syokugyo;
		};
		p.fromjson = function(from) {
			this.id_syokugyo = Number(from.id_syokugyo);
			this.st_syokugyo = from.st_syokugyo;
			this.no_display = Number(from.no_display);
		};

		return Lp_syokugyo;
	})();

	/**
	 lp_nenkin - 年齢・性別年金テーブル
	 */
	// class extends TableBase
	var Lp_nenkin = (function() {

		var Lp_nenkin = function() {
			this.id_nenkin = 0;
			this.ymd_birth_from = new LPdate();
			this.ymd_birth_to = new LPdate();
			this.y_birth = 0;
			this.age_jkyustart_m = 0;
			this.age_jkyustart_w = 0;
			this.age_bubunstart_m = 0;
			this.age_bubunstart_w = 0;
			this.ra_teiritu = 0.0;
			this.ra_kouseiritu = 0.0;
			this.ra_syokuikiritu_19 = 0.0;
			this.ra_syokuikiritu_20 = 0.0;
			this.sm_haigukasan = 0;
			this.sm_hurikasan = 0;
			this.sm_teigakumonths = 0;
			this.sm_tokureikikan = 0;
		};

		LIFEPLAN.module.inherits(Lp_nenkin, TableBase);
		var p = Lp_nenkin.prototype;

		p.key = function() {
			return this.id_nenkin;
		};
		p.fromjson = function(from) {
			this.id_nenkin = Number(from.id_nenkin);
			this.ymd_birth_from = self.LPdate.fromjson(from.ymd_birth_from);
			this.ymd_birth_to = self.LPdate.fromjson(from.ymd_birth_to);
			this.y_birth = Number(from.y_birth);
			this.age_jkyustart_m = Number(from.age_jkyustart_m);
			this.age_jkyustart_w = Number(from.age_jkyustart_w);
			this.age_bubunstart_m = Number(from.age_bubunstart_m);
			this.age_bubunstart_w = Number(from.age_bubunstart_w);
			this.ra_teiritu = Number(from.ra_teiritu);
			this.ra_kouseiritu = Number(from.ra_kouseiritu);
			this.ra_syokuikiritu_19 = Number(from.ra_syokuikiritu_19);
			this.ra_syokuikiritu_20 = Number(from.ra_syokuikiritu_20);
			this.sm_haigukasan = Number(from.sm_haigukasan);
			this.sm_hurikasan = Number(from.sm_hurikasan);
			this.sm_teigakumonths = Number(from.sm_teigakumonths);
			this.sm_tokureikikan = Number(from.sm_tokureikikan);
		};

		return Lp_nenkin;
	})();

	/**
	 lp_jyutaku - 住宅購入費
	 */
	var Lp_jyutaku = (function() {

		var Lp_jyutaku = function() {
			this.id_prefecture = 0;
			this.st_prefecture = "";
			this.sm_house = 0;
			this.sm_apartment = 0;
		};

		LIFEPLAN.module.inherits(Lp_jyutaku, TableBase);
		var p = Lp_jyutaku.prototype;

		p.key = function() {
			return this.id_prefecture;
		};
		p.fromjson = function(from) {
			this.id_prefecture = Number(from.id_prefecture);
			this.st_prefecture = from.st_prefecture;
			this.sm_house = Number(from.sm_house);
			this.sm_apartment = Number(from.sm_apartment);
		};

		return Lp_jyutaku;
	})();

	/**
	 lp_kyouikuhi - 教育費
	 */
	var Lp_kyouikuhi = (function() {

		var Lp_kyouikuhi = function() {
			this.id_school = 0;
			this.id_koushi = 0;
			this.no_nenji = 0;
			this.id_bunri = 0;
			this.st_name = "";
			this.sm_nyugaku = 0;
			this.sm_nyugakuroom = 0;
			this.sm_year = 0;
			this.sm_room = 0;
		};

		LIFEPLAN.module.inherits(Lp_kyouikuhi, TableBase);
		var p = Lp_kyouikuhi.prototype;

		p.key = function() {
			return this.id_school * 1000 + this.id_koushi * 100 + this.no_nenji * 10 + this.id_bunri;
		};
		p.fromjson = function(from) {
			this.id_school = Number(from.id_school);
			this.id_koushi = Number(from.id_koushi);
			this.no_nenji = Number(from.no_nenji);
			this.id_bunri = Number(from.id_bunri);
			this.st_name = from.st_name;
			this.sm_nyugaku = Number(from.sm_nyugaku);
			this.sm_nyugakuroom = Number(from.sm_nyugakuroom);
			this.sm_year = Number(from.sm_year);
			this.sm_room = Number(from.sm_room);
		};

		return Lp_kyouikuhi;
	})();

	/**
	 lp_insgoods - 保険商品
	 */
	// class extends TableBase
	var Lp_insgoods = (function() {

		var Lp_insgoods = function() {
			this.id_goods = 0;
			this.st_goodsname = "";
			this.id_insclass = 0;
			this.id_hengaku = 0;
			this.id_syushin = 0;
			this.id_haraikomi = 0;
			this.st_hokenkin = "";
			this.st_kikan1 = "";
			this.st_kikan2 = "";
			this.ra_henrei = 0.0;
		};

		LIFEPLAN.module.inherits(Lp_insgoods, TableBase);
		var p = Lp_insgoods.prototype;

		p.key = function() {
			return this.id_goods;
		};
		p.fromjson = function(from) {
			this.id_goods = Number(from.id_goods);
			this.st_goodsname = from.st_goodsname;
			this.id_insclass = Number(from.id_insclass);
			this.id_hengaku = Number(from.id_hengaku);
			this.id_syushin = Number(from.id_syushin);
			this.id_haraikomi = Number(from.id_haraikomi);
			this.st_hokenkin = from.st_hokenkin;
			this.st_kikan1 = from.st_kikan1;
			this.st_kikan2 = from.st_kikan2;
			this.ra_henrei = Number(from.ra_henrei);
		};

		return Lp_insgoods;
	})();

	/**
	 lp_jyutakuloan - 住宅ローン減税
	 */
	// class extends TableBase
	var Lp_jyutakuloan = (function() {

		var Lp_jyutakuloan = function() {
			this.y_buyyear = 0;
			this.sm_kikan = 0;
			this.ra_syotokukojo = 0.0;
			this.sm_syotokugendo = 0;
			this.ra_jyukojo = 0.0;
			this.sm_jyugendo = 0;
		};

		LIFEPLAN.module.inherits(Lp_jyutakuloan, TableBase);
		var p = Lp_jyutakuloan.prototype;

		p.key = function() {
			return this.y_buyyear;
		};
		p.fromjson = function(from) {
			this.y_buyyear = Number(from.y_buyyear);
			this.sm_kikan = Number(from.sm_kikan);
			this.ra_syotokukojo = Number(from.ra_syotokukojo);
			this.sm_syotokugendo = Number(from.sm_syotokugendo);
			this.ra_jyukojo = Number(from.ra_jyukojo);
			this.sm_jyugendo = Number(from.sm_jyugendo);
		};

		return Lp_jyutakuloan;
	})();

	/**
	 lp_event - イベント区分
	 */
	var Lp_event = (function() {

		var Lp_event = function() {
			this.id_event = 0;
			this.st_event = "";
			this.st_message = "";
		};

		LIFEPLAN.module.inherits(Lp_event, TableBase);
		var p = Lp_event.prototype;

		p.key = function() {
			return this.id_event;
		};
		p.fromjson = function(from) {
			this.id_event = Number(from.id_event);
			this.st_event = from.st_event;
			this.st_message = from.st_message;
		};

		return Lp_event;
	})();

	var Wording = (function() {

		var Wording = function() {
			this.MISETTEI = "-";
			this.MISENTAKU = "(未選択)";
		};

		return Wording;
	})();

	return LifePlanDB;
})();