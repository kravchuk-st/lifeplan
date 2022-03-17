"use strict";

LIFEPLAN.graph.Graph = (function () {

	//=======================================
	var self;
	var Graph = function () {
		self = this;
		return self;
	};

	var p = Graph.prototype;
	//=======================================

	var fontName = "'Hiragino Kaku Gothic ProN', 'メイリオ', sans-serif";

	// 色設定
	p.brown = 'rgba(165,114,78,1)';
  p.black = 'rgb(0,0,0)';
	p.blueHonnin = 'rgb(102,186,211)';
	p.redHaigusya = 'rgb(238,156,153)';
	p.yellow = 'rgb(256,225, 76)';
	p.green = 'rgb(167,211,76)';
	p.white = 'rgb(255,255,255)';
	p.redNenkanShushi = 'rgb(210,83,77)';
	p.blueKinyuShisanZandaka = 'rgb(128,165,217)';
	p.cream = 'rgb(255,255,255)';
	p.purple = 'rgb(175,134,211)';
	p.red = 'rgb(183,38,25)';
	p.blue = 'rgb(82,179,233)';
	p.lightBlue = 'rgb(203,212,231)';

	// 表組の線用ペイント情報の作成
	p.graphLinePaint = 'rgb(164,100,62)';
	// 表組のテキスト用ペイント情報の作成
	p.graphTextPaint = 'rgb(164,100,62)';
	// 編集可能なイベント用ペイント情報
//	p.editableEventBgPaint = 'rgb(164,100,62)';
	p.editableEventBgPaint = 'rgb(174,121,2111)';
	p.editableEventTextPaint = 'rgb(255,255,255)';
	// 編集不可なイベント用ペイント情報
	p.fixedEventBgPaint = 'rgb(246,230,205)';
	p.fixedEventTextPaint = 'rgb(164,100,62)';

	// フォント設定
	p.setFont = function (con, size) {
		con.font = "bold " + size + "px " + fontName;
		con.textAlign = "right";
		con.textBaseline = "middle";
		return con;
	};

	// フォント設定
	p.setFont2 = function (con, size) {
		con.font = "bold " + size + "px " + fontName;
		con.textAlign = "left";
		con.textBaseline = "middle";
		return con;
	};

	// フォント設定
	p.setFont3 = function (con, size) {
		con.font = "bold " + size + "px " + fontName;
		con.textAlign = "center";
		con.textBaseline = "middle";
		return con;
	};

	// フォント設定
	p.setFont4 = function (con, size) {
		con.font = "bold " + size + "px " + fontName;
		con.textAlign = "left";
		con.textBaseline = "top";
		return con;
	};
	
	p.setFont5 = function (con, size) {
		con.font = "bold " + size + "px " + fontName;
		con.textAlign = "center";
		con.textBaseline = "middle";
		return con;
	};

	// 必要保障額、収入保障保険、養老学資保険、終身保険、定期保険の結果のjson
	p.getGraphDataCoverage = function (target) {

		// json取得
		var res_logic08 = JSON.parse(LIFEPLAN.conf.storage.getItem("Logic08"));
		var res_logic09 = JSON.parse(LIFEPLAN.conf.storage.getItem("Logic09"));

		// target:0 本人
		// target:1 配偶者
		if (target == 0) {

			var data = {
				vHitsuho: res_logic08.vHitsuho_hon, //ご本人様:必要保障額
				vSyunyuHo: res_logic09.vSyunyuHo_hon, //ご本人様:収入保障保険
				vYourou: res_logic09.vYourou_hon, //ご本人様:養老・学資保険
				vSyushin: res_logic09.vSyushin_hon, //ご本人様:終身保険
				vTeiki: res_logic09.vTeiki_hon				//ご本人様:定期保険
			};
			return data;

		} else if (target == 1) {

			var data = {
				vHitsuho: res_logic08.vHitsuho_hai, //配偶者様:必要保障額
				vSyunyuHo: res_logic09.vSyunyuHo_hai, //配偶者様:収入保障保険
				vYourou: res_logic09.vYourou_hai, //配偶者様:養老・学資保険
				vSyushin: res_logic09.vSyushin_hai, //配偶者様:終身保険
				vTeiki: res_logic09.vTeiki_hai				//配偶者様:定期保険
			};
			return data;

		}
	};

	// 将来資金収支分析のjson
	p.getGraphDataFutureCashFlowAnalysis = function () {

		// 計算結果をセッションストレージから読み込み
		var res_logic06 = JSON.parse(LIFEPLAN.conf.storage.getItem("Logic06"));

		var data = {
			vSyunyu: res_logic06.vSyunyu,
			vShisyutsu: res_logic06.vShisyutsu,
			vSyushi: res_logic06.vSyushi,
			vShikin: res_logic06.vShikin
		};

		return data;
	};


	// 加入保険のjson取得
	p.getGraphDataInsurance = function (target) {

		// 計算結果をセッションストレージから読み込み
		var data = JSON.parse(LIFEPLAN.conf.storage.getItem("lp_modelcase_hoken"));

		return data;
	};

	// 将来資金収支分析グラフと必要保障額分析グラフでのはみ出た部分を消すマスク処理
	p.drawMask = function (context) {
		// 上下のはみ出た部分を消す
		context.beginPath();
		context.fillStyle = p.cream;
		context.fillRect(140, 0, 1430, 32);

		context.beginPath();
		context.fillStyle = p.cream;
		context.fillRect(140, 562, 1430, 96);
	};

	p.roundFormatKeta = function (num, n) {

		var tgt = Math.pow(10, n);

		return String(Math.round(num * tgt) / tgt).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');

	};

	// required
	return Graph;
})();