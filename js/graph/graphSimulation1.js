"use strict";

LIFEPLAN.graph.GraphSimulation1 = (function () {

	//=======================================
	var self;
	// required constructor
	var GraphSimulation1 = function () {

		self = this;
		// 継承
		LIFEPLAN.module.inherits(GraphSimulation1, LIFEPLAN.graph.Graph);
	};
	var p = GraphSimulation1.prototype;
	//=======================================

	// 「将来資金収支分析」グラフの描画処理
	p.drawGraph = function (canvasName, startAge, is_kekkon, ageC, id_modelcase, age_hon) {

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
		var amountRangeTT = 4200;
		var amountRangeNum = 42000000;
		var startIndex = startAge - 20;
		if (0 > ageC) {
			// 配偶者が年上の場合は年齢差分グラフをずらす
			startIndex = startIndex - ageC;
			age_hon = age_hon - ageC;
		}
		var endIndex = startIndex + graphXItemLength;
		var labelYstartAmount = 3000;
		var amountPerScale = 500;
		// 500万円単位の高さ
		var xAmountScale = graphHeight * amountPerScale / amountRangeTT;
		// 100万円単位の高さ
		var y100 = graphHeight * 100 / amountRangeTT;
		// 0円のY座標
		var yZero = xAmountScale * 6 + y100 + graphMarginTop;
		// 計算用
		var rectX = 0;
		var rectY = 0;
		var rectWidth = 0;
		var rectHeight = 0;

		// ==================================================
		var canvas = document.getElementById(canvasName);
		var context = canvas.getContext("2d");
		// canvas初期化
		context.clearRect(0, 0, canvaSize, graphHeightOrigin + outsideLineWidth + graphMarginTop);
		// ==================================================

		// データ取得
		var data = self.getGraphDataFutureCashFlowAnalysis();
		var vSyunyu = data.vSyunyu;
		var vShisyutsu = data.vShisyutsu;
		var vSyushi = data.vSyushi;
		var vShikin = data.vShikin;
		
		// グラフ要素が3,000万円を超えるものがある場合、最大値を6,000万円のグラフにスケールアウトする
		var checkStartIndex	= ( id_modelcase === 4 ) ? startIndex : 0; 
		var checkEndIndex		= ( id_modelcase === 4 ) ? 79 : 79; 
		var amoutCheckList = [vSyunyu,vShisyutsu,vSyushi,vShikin];
		amoutCheckList.some(function (v) {
			var chkReturn = false;
			v.some(function (vv, i) {
				if (checkStartIndex <= i && i <= checkEndIndex) {
					if (vv > labelYstartAmount * 10000) {
						// scaleを倍にする
						amountRangeTT = amountRangeTT * 2;
						amountRangeNum = amountRangeNum * 2;
						labelYstartAmount = labelYstartAmount * 2;
						amountPerScale = amountPerScale * 2;
						xAmountScale = graphHeight * amountPerScale / amountRangeTT;
						chkReturn = true;
						return true;
					}
				}
			});
			if (chkReturn) {
				return true;
			}
		});
		
		// グラフの背景色設定
		context.beginPath();
		context.fillStyle = self.white;
		context.fillRect(graphMarginLeft, graphMarginTop, graphWidth, graphHeightOrigin);

		// グリッド線を引く
		context.beginPath();
		context.strokeStyle = self.brown;
		context.lineWidth = 1;

		// グラフ縦のラベル表示金額
		var labelY = labelYstartAmount;
		for (i = 0; i < 9; i++) {
			var y = xAmountScale * i + y100 + graphMarginTop;
			context.beginPath();
			context.moveTo(graphMarginLeft, y);
			context.lineTo(canvaSize, y);
			context.stroke();

			context.beginPath();
			context.fillStyle = self.brown;
			context = self.setFont(context, 24);
			context.fillText(String(labelY).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'), 110, y);
			labelY = labelY - amountPerScale;
		};

		// キャプションラベル表示
		context.beginPath();
		context.fillStyle = self.brown;
		context = self.setFont(context, 22);
		context.fillText("（万円）", 125, 17);

		// グラフの年齢ラベルを作成する
		var drawVarticalLine = function (con, num, color, p, xPoint) {
			con.beginPath();
			con.fillStyle = color;
			context = self.setFont(context, 24);
			con.fillText(String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'), xPoint + 20, graphHeightOrigin + graphMarginTop + p);
		};

		// グラフ一年あたりの幅
		var x5 = graphWidth * 5 / graphXItemLength;
		for (i = 0; i < (graphXItemLength / 5); i++) {
			// グラフの縦線（年齢）を表示する
			var x = x5 * i + graphMarginLeft;
			context.beginPath();
			context.moveTo(x, graphMarginTop);
			context.lineTo(x, graphHeightOrigin + graphMarginTop);
			context.stroke();
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
			// 配偶者がいる場合の処理
			// 
			// 配偶者年齢ラベル
			context.beginPath();
			context.fillStyle = self.redHaigusya;
			context.fillRect(0, 658 - 38, 120, 36);

			context.beginPath();
			context.fillStyle = self.white;
			context = self.setFont(context, 22);
			context.fillText("配偶者年齢", 114, 658 - 20);
		}

		// 収入
		context.beginPath();
		context.fillStyle = self.yellow;
		var iIndex = 0;
		for (var i = startIndex; i <= endIndex; i++) {

			rectX = graphWidth / graphXItemLength * iIndex + graphMarginLeft + 10;
			rectWidth = 22;

			var tmpM = vSyunyu[i] * graphHeight / amountRangeNum;

			rectY = yZero;
			rectHeight = tmpM * -1;

			context.fillRect(rectX, rectY, rectWidth, rectHeight);
			
			iIndex++;
		}
		;

		// 支出
		context.beginPath();
		context.fillStyle = self.green;
		iIndex = 0;
		for (var i = startIndex; i <= endIndex; i++) {

			rectX = graphWidth / graphXItemLength * iIndex + graphMarginLeft;
			var width = 22;

			var tmpM = vShisyutsu[i] * graphHeight / amountRangeNum;

			rectY = yZero;
			var height = tmpM * -1;

			context.fillRect(rectX, rectY, width, height);

			iIndex++;
		};

		// 年間収支
		context.beginPath();
		context.strokeStyle = self.redNenkanShushi;
		context.lineWidth = 5;
		iIndex = 0;
		for (var i = startIndex; i <= endIndex; i++) {

				if (i >= age_hon - 20 ){

				var tmpM = vSyushi[i] * graphHeight / amountRangeNum;

				rectX = graphWidth / graphXItemLength * iIndex + graphMarginLeft;
				rectY = yZero - tmpM;

				if (i === startIndex) {
					context.moveTo(rectX, rectY);
				} else {
					context.lineTo(rectX, rectY);
				};
				
			};

			iIndex++;
		};
		context.stroke();

		// 金融資産残高
		context.beginPath();
		context.strokeStyle = self.blueKinyuShisanZandaka;
		context.lineWidth = 5;
		iIndex = 0;
		for (var i = startIndex; i <= endIndex; i++) {

			if (i >= age_hon - 20 ){
				var tmpM = vShikin[i] * graphHeight / amountRangeNum;

				rectX = graphWidth / graphXItemLength * iIndex + graphMarginLeft;
				rectY = yZero - tmpM;

				if (i === startIndex) {
					context.moveTo(rectX, rectY);
				} else {
					context.lineTo(rectX, rectY);
				};
			}
			iIndex++;
		}
		context.stroke();

		var fg_debug = LIFEPLAN.db.LifePlanDB.prototype.get_setupinfo().fg_debug;

// 2021/04/07 デバッグ用に安定資金残高をグラフに表示するときはコメントアウトをはずす
//		// 2021/04/06 安定資金残高の線をグラフに追加（デバッグフラグの4bit目が1の場合）
//		// 安定資金残高
//		if ((fg_debug & 8) >> 3 === 1) { // デバッグフラグの4bit目が1
//			var vAntei = JSON.parse(LIFEPLAN.conf.storage.getItem("Logic06")).vAntei;
//			context.beginPath();
//			context.strokeStyle = 'rgb(255,0,255)';  // ピンク
//			context.setLineDash([5, 5]);  // 点線
//			context.lineWidth = 2;
//			iIndex = 0;
//			for (var i = startIndex; i <= endIndex; i++) {
//	
//				if (i >= age_hon - 20 ){
//					var tmpM = vAntei[i] * graphHeight / amountRangeNum;
//
//					rectX = graphWidth / graphXItemLength * iIndex + graphMarginLeft;
//					rectY = yZero - tmpM;
//
//					if (i === startIndex) {
//						context.moveTo(rectX, rectY);
//					} else {
//						context.lineTo(rectX, rectY);
//					};
//				}
//				iIndex++;
//			}
//			context.stroke();
//			context.setLineDash([]);  // 実線に戻す
//		}

// 2021/04/07 デバッグ用に運用資金残高をグラフに表示するときはコメントアウトをはずす
//		// 2021/04/06 運用資金残高の線をグラフに追加（デバッグフラグの4bit目が1の場合）
//		// 運用資金残高
//		if ((fg_debug & 8) >> 3 === 1) { // デバッグフラグの4bit目が1
//			var vUnyou = JSON.parse(LIFEPLAN.conf.storage.getItem("Logic06")).vUnyou;
//			context.beginPath();
//			context.strokeStyle = 'rgb(0,0,255)';  // 青
//			context.setLineDash([5, 5]);  // 点線
//			context.lineWidth = 2;
//			iIndex = 0;
//			for (var i = startIndex; i <= endIndex; i++) {
//
//				if (i >= age_hon - 20 ){
//					var tmpM = vUnyou[i] * graphHeight / amountRangeNum;
//	
//					rectX = graphWidth / graphXItemLength * iIndex + graphMarginLeft;
//					rectY = yZero - tmpM;
//
//					if (i === startIndex) {
//						context.moveTo(rectX, rectY);
//					} else {
//						context.lineTo(rectX, rectY);
//					};
//				}
//				iIndex++;
//			}
//			context.stroke();
//			context.setLineDash([]);  // 実線に戻す
//		}

		// 上下にはみ出た部分を消す
		p.drawMask(context);

		// グラフ一年あたりの幅
		var ageLabel = startAge;
		for (i = 0; i < (graphXItemLength / 5); i++) {
			var x = x5 * i + graphMarginLeft;
			// 本人の年齢のラベルを表示する
			drawVarticalLine(context, ageLabel, self.blueHonnin, 35, x);

			if (is_kekkon > 0) {
				// 配偶者がいる場合は配偶者の年齢のラベルを表示する
				drawVarticalLine(context, ageLabel - ageC, self.redHaigusya, 75, x);
			}
			// ５歳ずつ表示する
			ageLabel = ageLabel + 5;
		};

		// 枠線を引く
		context.beginPath();
		context.strokeStyle = self.brown;
		context.lineWidth = outsideLineWidth;
		context.moveTo(graphMarginLeft, graphMarginTop);
		context.lineTo(graphMarginLeft, (graphHeightOrigin + graphMarginTop));
		context.lineTo(canvaSize, (graphHeightOrigin + graphMarginTop));
		context.stroke();

		// グラフ内ラベルを作成する
		// 支出
		context.beginPath();
		context.fillStyle = self.green;
		context.fillRect(970, 508, 20, 20);

		context.beginPath();
		context.fillStyle = self.brown;
		context = self.setFont(context, 24);
		context.fillText("支出", 1047, 517);

		// 収入
		context.beginPath();
		context.fillStyle = self.yellow;
		context.fillRect(1080, 508, 20, 20);

		context.beginPath();
		context.fillStyle = self.brown;
		context = self.setFont(context, 24);
		context.fillText("収入", 1157, 517);

		// 年間収支
		context.beginPath();
		context.strokeStyle = self.redNenkanShushi;
		context.lineWidth = 7;
		context.moveTo(1195, 517);
		context.lineTo(1225, 517);
		context.stroke();

		context.beginPath();
		context.fillStyle = self.brown;
		context = self.setFont(context, 24);
		context.fillText("年間収支", 1330, 517);

		// 金融資産残高
		context.beginPath();
		context.strokeStyle = self.blueKinyuShisanZandaka;
		context.lineWidth = 7;
		context.moveTo(1365, 517);
		context.lineTo(1395, 517);
		context.stroke();

		context.beginPath();
		context.fillStyle = self.brown;
		context = self.setFont(context, 24);
		context.fillText("金融資産残高", 1550, 517);

// 2021/04/07 デバッグ用に安定資金残高をグラフに表示するときはコメントアウトをはずす
//		// 2021/04/06 安定資金残高の線をグラフに追加（デバッグフラグの4bit目が1の場合）
//		// 安定資金残高
//		if ((fg_debug & 8) >> 3 === 1) { // デバッグフラグの4bit目が1
//			context.beginPath();
//			context.strokeStyle = 'rgb(255,0,255)';  // ピンク
//			context.lineWidth = 2;
//			context.setLineDash([5, 5]);  // 点線
//			context.moveTo(1195, 542);
//			context.lineTo(1225, 542);
//			context.stroke();
//
//			context.beginPath();
//			context.fillStyle = self.brown;
//			context = self.setFont(context, 24);
//			context.fillText("安定資金", 1330, 542);
//			context.setLineDash([]);  // 実線に戻す
//		}

// 2021/04/07 デバッグ用に運用資金残高をグラフに表示するときはコメントアウトをはずす
//		// 2021/04/06 運用資金残高の線をグラフに追加（デバッグフラグの4bit目が1の場合）
//		// 運用資金残高
//		if ((fg_debug & 8) >> 3 === 1) { // デバッグフラグの4bit目が1
//			context.beginPath();
//			context.strokeStyle = 'rgb(0,0,255)';  // 青
//			context.lineWidth = 2;
//			context.setLineDash([5, 5]);  // 点線
//			context.moveTo(1365, 542);
//			context.lineTo(1395, 542);
//			context.stroke();
//
//			context.beginPath();
//			context.fillStyle = self.brown;
//			context = self.setFont(context, 24);
//			context.fillText("運用資金", 1500, 542);
//			context.setLineDash([]);  // 実線に戻す
//		}

		buttonDiagnosis(1260, 117, 80, 80, context, canvas);

	};

	// 診断結果ボタン
	var buttonDiagnosis = function (x, y, width, height, ctx, canvas) {

		/* 円 #1 */
		ctx.beginPath();
		ctx.globalAlpha = 0.3;
		ctx.fillStyle = self.brown;
		ctx.arc(x, y, 80, 0, Math.PI * 2, false);
		ctx.fill();

		ctx.beginPath();
		ctx.globalAlpha = 1.0;
		ctx.fillStyle = self.brown;
		ctx = self.setFont(ctx, 28);
		ctx.fillText("診断", x + 28, y - 18);
		ctx.fillText("結果", x + 28, y + 18);

		canvas.addEventListener('click', function (e) {
			var rect = e.target.getBoundingClientRect();
			var zoomer = document.body.clientWidth / window.innerWidth;

			var mouseX = e.clientX * zoomer - rect.left;
			var mouseY = e.clientY * zoomer - rect.top;

			if (x - width < mouseX && mouseX < x + width) {
				if (y - height < mouseY && mouseY < y + height) {
					// 診断結果画面の表示
					LMPS.openModal('#modal-1');
				}
			}
		}, false);
	};

	// required
	return GraphSimulation1;
})();