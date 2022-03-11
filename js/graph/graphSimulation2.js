"use strict";

LIFEPLAN.graph.GraphSimulation2 = (function () {

	//=======================================
	var self;
	// required constructor
	var GraphSimulation2 = function () {

		self = this;
		// 継承
		LIFEPLAN.module.inherits(GraphSimulation2, LIFEPLAN.graph.Graph);
	};
	var p = GraphSimulation2.prototype;
	//=======================================

	// 「必要保障額分析」グラフの描画処理
	p.drawGraph = function (canvasName, age_hon, target, is_kekkon, ageC) {

		
		// サイズなど
		var canvaSize = 1570;
		var graphHeightOrigin = 530;
		var outsideLineWidth = 5;
		var graphWidth = 1430;
		var graphHeight = graphHeightOrigin - outsideLineWidth;
		var graphMarginLeft = 149;
		var graphMarginTop = 32;
		// 表示する金額の幅
		var graphXItemLength = 36;
		
		// ==================================================
		// コンテキスト取得
		var canvas = document.getElementById(canvasName);
		var context = canvas.getContext("2d");
		// canvas初期化
		context.clearRect(0, 0, canvaSize, graphHeightOrigin);
		// ==================================================

		var data = self.getGraphDataCoverage(target);

		// 背景を白にする
		context.beginPath();
		context.fillStyle = self.white;
		context.fillRect(140, graphMarginTop, graphWidth, graphHeightOrigin);

		// 年齢一年あたりの幅
		var widthByYear = graphWidth / graphXItemLength;

		// 必要保障額の最大を取得する
		var vMax = 0;
		for (var i = 0; i < data.vHitsuho.length; i++) {
			var vNow = data.vHitsuho[i];
			if (vNow > vMax) {
				vMax = vNow;
			}
			;
		}

		// 1万円あたりの金額の幅を取得する
		var heightByYear = 0;
		if (vMax > 99999999) {
			heightByYear = 200000000;
		} else {
			heightByYear = 100000000;
		}

		// 罫線の描画処理

		// 1目盛り単位の高さ
		var y500 = graphHeightOrigin * (heightByYear / 5) / heightByYear;

		// Y軸ラベル、横罫線の描画
		var labelY = heightByYear / 10000 - (heightByYear / 10000 / 5);
		for (i = 1; i < 5; i++) {
			var y = y500 * i + graphMarginTop;

			context.beginPath();
			context.strokeStyle = self.brown;
			context.lineWidth = 1;
			context.moveTo(140, y);
			context.lineTo(canvaSize, y);
			context.stroke();

			context.beginPath();
			context.fillStyle = self.brown;
			context = self.setFont(context, 24);
			context.fillText(String(labelY).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'), 110, y);
			labelY = labelY - (heightByYear / 10000 / 5);
			
			if (i === 4) {
				context.beginPath();
				context.fillStyle = self.brown;
				context = self.setFont(context, 24);
				context.fillText(String(labelY).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'), 110, y500 * (i + 1) + graphMarginTop);
				labelY = 0;
			}
		}
		
		// ラベル表示
		context.beginPath();
		context.fillStyle = self.brown;
		context = self.setFont(context, 30);
		context.fillText("（万円）", 150, 17);

		// X軸ラベル、縦罫線の描画
		// グラフの年齢ラベルを作成する
		var drawVarticalLine = function (con, num, color, p) {
			con.beginPath();
			con.fillStyle = color;
			context = self.setFont(context, 24);
			con.fillText(String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'), x + 20, graphHeightOrigin + graphMarginTop + p);
		};

		// グラフ一年あたりの幅
		var startAge = age_hon;
		var x5 = graphWidth * 5 / graphXItemLength;
		for (i = 0; i < (graphXItemLength / 5); i++) {
			// グラフの縦線（年齢）を表示する
			var x = x5 * i + 140;
			context.beginPath();
			context.moveTo(x, graphMarginTop);
			context.lineTo(x, graphHeightOrigin + graphMarginTop);
			context.stroke();

			startAge = startAge + 5;
		}

		// 本人の年齢からグラフを開始する
		context.beginPath();
		context.strokeStyle = self.red;
		context.lineWidth = 6;

		// 各種保険の棒グラフ描画処理
		// 終身保険>定期保険・特約>養老・学資保険>収入保障保険 の順で下から足していく
		for (var i = 0; i < 37; i++) {

			var vSyushin = data.vSyushin[age_hon - 20 + i] * graphHeightOrigin / heightByYear;
			var vTeiki = data.vTeiki[age_hon - 20 + i] * graphHeightOrigin / heightByYear;
			var vYourou = data.vYourou[age_hon - 20 + i] * graphHeightOrigin / heightByYear;
			var vSyunyuHo = data.vSyunyuHo[age_hon - 20 + i] * graphHeightOrigin / heightByYear;

			var yPoint1 = 562;
			var yPoint2 = yPoint1 - vSyushin;
			var yPoint3 = yPoint2 - vTeiki;
			var yPoint4 = yPoint3 - vYourou;
			
			context.beginPath();
			context.fillStyle = self.lightBlue;
			context.closePath();
			context.fillRect(140 + widthByYear * i, yPoint1, widthByYear + 1, vSyushin * -1);

			context.beginPath();
			context.fillStyle = self.green;
			context.closePath();
			context.fillRect(140 + widthByYear * i, yPoint2, widthByYear + 1, vTeiki * -1);

			context.beginPath();
			context.fillStyle = self.yellow;
			context.closePath();
			context.fillRect(140 + widthByYear * i, yPoint3, widthByYear + 1, vYourou * -1);

			context.beginPath();
			context.fillStyle = self.blue;
			context.closePath();
			context.fillRect(140 + widthByYear * i, yPoint4, widthByYear + 1, vSyunyuHo * -1);
		};

		// 必要保障額の折れ線グラフを描画する
		for (var i = 0; i < 37; i++) {
			var age_diff = (0 > ageC) ? age_hon - ageC : age_hon;
			var val = data.vHitsuho[age_diff - 20 + i];
			if (0 == val) {
				continue;
			}
			val = val * graphHeightOrigin / heightByYear;
			val = graphHeightOrigin - val + graphMarginTop;

			if (i === 0) {
				context.moveTo(140, val);
			} else {
				context.lineTo(140 + widthByYear * i, val);
			}
		}

		context.stroke();

		// 上下にはみ出た部分を消す
		p.drawMask(context);

		// グラフ一年あたりの幅
		startAge = age_hon;
		for (i = 0; i < (graphXItemLength / 5); i++) {
			// グラフの縦線（年齢）を表示する
			var x = x5 * i + 140;

			// 本人の年齢のラベルを表示する
			drawVarticalLine(context, startAge, self.blueHonnin, 35);

			if (is_kekkon > 0) {
				// 配偶者がいる場合は配偶者xの年齢のラベルを表示する
				drawVarticalLine(context, startAge - ageC, self.redHaigusya, 75);
			}
			startAge = startAge + 5;
		};

		// ご本人年齢ラベル
		context.beginPath();
		context.fillStyle = self.blueHonnin;
		context.fillRect(0, 576, 120, 38);

		context.beginPath();
		context.fillStyle = self.white;
		context = self.setFont(context, 22);
		context.fillText("ご本人年齢", 113, 658 - 62);

		if (is_kekkon > 0) {
			// 配偶者年齢ラベル
			context.beginPath();
			context.fillStyle = self.redHaigusya;
			context.fillRect(0, 658 - 38, 120, graphXItemLength);

			context.beginPath();
			context.fillStyle = self.white;
			context = self.setFont(context, 22);
			context.fillText("配偶者年齢", 114, 658 - 20);
		}

		// 枠線を引く
		context.beginPath();
		context.strokeStyle = self.brown;
		context.lineWidth = 5;
		context.moveTo(140, graphMarginTop);
		context.lineTo(140, 562);
		context.lineTo(canvaSize, 562);
		context.stroke();

		// グラフ内ラベルを作成する
		var inGraphLabelY = 50;
		var inGraphLabelTY = inGraphLabelY + 7;
		// 収入保障保険
		context.beginPath();
		context.fillStyle = self.blue;
		context.fillRect(440, inGraphLabelY, 20, 20);

		context.beginPath();
		context.fillStyle = self.brown;
		context = self.setFont2(context, 24);
		context.fillText("収入保障保険", 464, inGraphLabelTY);

		// 養老・学資保険
		context.beginPath();
		context.fillStyle = self.yellow;
		context.fillRect(650, inGraphLabelY, 20, 20);

		context.beginPath();
		context.fillStyle = self.brown;
		context = self.setFont2(context, 24);
		context.fillText("養老・学資保険", 674, inGraphLabelTY);

		// 終身保険
		context.beginPath();
		context.fillStyle = self.lightBlue;
		context.fillRect(890, inGraphLabelY, 20, 20);

		context.beginPath();
		context.fillStyle = self.brown;
		context = self.setFont2(context, 24);
		context.fillText("終身保険", 914, inGraphLabelTY);

		// 定期保険・特約
		context.beginPath();
		context.fillStyle = self.green;
		context.fillRect(1070, inGraphLabelY, 20, 20);

		context.beginPath();
		context.fillStyle = self.brown;
		context = self.setFont2(context, 24);
		context.fillText("定期保険・特約", 1094, inGraphLabelTY);

		// 必要保障額
		context.beginPath();
		context.strokeStyle = self.red;
		context.lineWidth = 7;
		context.moveTo(1365, inGraphLabelTY);
		context.lineTo(1395, inGraphLabelTY);
		context.stroke();

		context.beginPath();
		context.fillStyle = self.brown;
		context = self.setFont2(context, 24);
		context.fillText("必要保障額", 1400, inGraphLabelTY);

	};

	// required
	return GraphSimulation2;
})();