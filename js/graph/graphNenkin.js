"use strict";

LIFEPLAN.graph.GraphNenkin = (function () {

	//=======================================
	var self;
	// required constructor
	var GraphNenkin = function () {

		self = this;
		// 継承
		LIFEPLAN.module.inherits(GraphNenkin, LIFEPLAN.graph.Graph);
	};
	var p = GraphNenkin.prototype;
	//=======================================

	// 年金グラフの作成処理
	p.drawGraphNenkin = function(canvasName, vNenkinHon, vNenkinHai, ageC, is_kekkon) {

		// PIXCEL
		var canvasSizeWidth = 1216;
		var canvasSizeHeight = 439;

		// コンテキスト取得
		var canvas = document.getElementById(canvasName);
		var context = canvas.getContext("2d");

		// canvas初期化
		context.clearRect(0, 0, canvasSizeWidth, canvasSizeHeight);

		// グラフの色
		var colortbl = ['rgb(102,186,211)', 'rgb(238,156,153)'];

		// グラフラベル 金額（万円）
		var meterAmount = [50, 40, 30, 20, 10, 0];

		// グラフラベル 年齢
		var meterAge = [60, 65, 70, 75];

		// グラフ部分のマージン
		var graphMargintTop = 20;
		var graphMargintLeft = 76;
		var graphMargintRight = 0;
		var graphMargintButtom = 100;

		// グラフ部分のサイズ
		var graphSizeWidth = canvasSizeWidth - graphMargintLeft - graphMargintRight;
		var graphSizeHeight = canvasSizeHeight - graphMargintTop - graphMargintButtom;

		// 目盛りのサイズ
		var meterWidth = graphSizeWidth / (meterAge.length - 1);
		var meterHeight = graphSizeHeight / (meterAmount.length - 1);

		// Unit Scaleのサイズ
		var unitWidth = graphSizeWidth / (meterAge[meterAge.length - 1] - meterAge[0]);
		var unitHeight = graphSizeHeight / (meterAmount[0] - meterAmount[meterAmount.length - 1]);

		// グラフ部分の背景色設定
		context.beginPath();
		context.fillStyle = self.white;
		context.closePath();
		context.fillRect(graphMargintLeft, graphMargintTop, graphSizeWidth, graphSizeHeight);
		
		//年金を先に受給する人を判定
		var iFirstPerson = -1;	// -1:未判定、0:本人が先、1：配偶者が先
		if (ageC >= 0) {
			iFirstPerson = 0;
		} else if (ageC < 0) {
			iFirstPerson = 1;
		}
		
		vNenkinHon.some(function (v, i) {

			// 60歳〜75歳以外は処理をしない
			if (i < 40 || 123 < i) {
				return false;
			}

			// 本人と配偶者の金額データ
			// 配列のデータは20歳から入っている
			var nenkinHon = v;
			var nenkinHai = vNenkinHai[i];
		});

		// グラフのラベルを作成する
		var drawLabel = function () {

			// X軸
			context.beginPath();
			context.fillStyle = self.brown;
			context = self.setFont2(context, 20);
			context.fillText("（万円）", 0, graphMargintTop);
			meterAmount.some(function (v, i) {

				if (i == 0) {
					return false;
				}

				var xPoint = graphMargintLeft;
				var yPoint = meterHeight * i + graphMargintTop;

				// 罫線
				context.beginPath();
				context.lineWidth = 1;
				context.strokeStyle = self.brown;
				context.moveTo(xPoint, yPoint);
				context.lineTo(xPoint + graphSizeWidth, yPoint);
				context.closePath();
				context.stroke();

				// ラベル
				context.beginPath();
				context.fillStyle = self.brown;
				context = self.setFont(context, 26);
				context.fillText(v, xPoint - 10, yPoint);

			});

			// Y軸
			meterAge.some(function (v, i) {

				if (i == meterAge.length - 1) {
					return false;
				}

				var xPoint = meterWidth * i + graphMargintLeft;
				var yPoint = graphMargintTop;

				// 罫線
				context.beginPath();
				context.lineWidth = 1;
				context.strokeStyle = self.brown;
				context.moveTo(xPoint, yPoint);
				context.lineTo(xPoint, yPoint + graphSizeHeight);
				context.closePath();
				context.stroke();

				if (0 < i) {
					context.beginPath();
					context.lineWidth = 4;
					context.strokeStyle = self.brown;
					context.moveTo(xPoint, yPoint + graphSizeHeight);
					context.lineTo(xPoint, yPoint + graphSizeHeight + 20);
					context.closePath();
					context.stroke();
				}

				// ラベル
				// ご本人年齢ラベル
				context.beginPath();
				context.fillStyle = self.blueHonnin;
				context = self.setFont2(context, 26);
				context.closePath();
				context.fillText(v, xPoint + 10, yPoint + graphSizeHeight + 30);

				if (is_kekkon) {
					// 配偶者年齢ラベル
					context.beginPath();
					context.fillStyle = self.redHaigusya;
					context = self.setFont2(context, 26);
					context.closePath();
					context.fillText(v - ageC, xPoint + 10, yPoint + graphSizeHeight + 66);
				}

				// ご本人年齢キャプションラベル
				context.beginPath();
				context.fillStyle = self.blueHonnin;
				context.fillRect(canvasSizeWidth - 120, yPoint + graphSizeHeight + 12, 120, 34);

				context.beginPath();
				context.fillStyle = self.white;
				context = self.setFont3(context, 22);
				context.fillText("ご本人年齢", canvasSizeWidth - 60, yPoint + graphSizeHeight + 30);

				if (is_kekkon) {
					// 配偶者年齢キャプションラベル
					context.beginPath();
					context.fillStyle = self.redHaigusya;
					context.fillRect(canvasSizeWidth - 120, yPoint + graphSizeHeight + 50, 120, 36);

					context.beginPath();
					context.fillStyle = self.white;
					context = self.setFont3(context, 22);
					context.fillText("配偶者年齢", canvasSizeWidth - 60, yPoint + graphSizeHeight + 69);
				}
			});
		};
		drawLabel();

		// 年単位で変わる部分の描画（年金額）
		vNenkinHon.some(function (v, i) {

			// 60歳〜75歳以外は処理をしない
			if (i < 40 || 123 < i) {
				return false;
			}

			// 本人と配偶者の金額データ
			// 配列のデータは20歳から入っている
			var nenkinHon = v;
			var nenkinHai = vNenkinHai[i];

			// 実データを座標（picel）に変換する
			var convertToPointFromVal = function (nenkinHon, ageDiff) {
				var widthPx = unitWidth + 1;
				var heightPx = nenkinHon * unitHeight / 10000 / 12;
				var xPoint = (unitWidth * (i - 40 + ageDiff)) + graphMargintLeft;
				var yPoint = (graphMargintTop + graphSizeHeight) - heightPx;

				return {
					x: xPoint,
					y: yPoint,
					width: widthPx,
					height: heightPx
				};
			};
			
			if (0 == iFirstPerson) {

				// 本人のグラフデータ取得
				var rectHon = convertToPointFromVal(nenkinHon, 0);
	
				// 本人のグラフ描画
				context.beginPath();
				context.fillStyle = colortbl[0];
				context.closePath();
				context.fillRect(
								rectHon.x,
								rectHon.y,
								rectHon.width,
								rectHon.height);
	
				if (is_kekkon) {
					// 配偶者のグラフデータ取得
					var rectHai = convertToPointFromVal(nenkinHai, 0);
	
					// 配偶者のグラフ描画
					context.beginPath();
					context.fillStyle = colortbl[1];
					context.closePath();
					context.fillRect(
									rectHai.x,
									rectHai.y - rectHon.height,
									rectHai.width,
									rectHai.height);
				}
			} else if (1 == iFirstPerson) {
				
				if (is_kekkon) {
					// 配偶者のグラフデータ取得
					var rectHai = convertToPointFromVal(nenkinHai, ageC);
					
					if (rectHai.x < graphMargintLeft || 0 === nenkinHai) {
						return false;
					}
	
					// 配偶者のグラフ描画
					context.beginPath();
					context.fillStyle = colortbl[1];
					context.closePath();
					context.fillRect(
									rectHai.x,
									rectHai.y,
									rectHai.width,
									rectHai.height);
									
					// 本人のグラフデータ取得
					var rectHon = convertToPointFromVal(nenkinHon, ageC);
					// 本人のグラフ描画
					context.beginPath();
					context.fillStyle = colortbl[0];
					context.closePath();
					context.fillRect(
								rectHon.x,
								rectHon.y - rectHai.height,
								rectHon.width,
								rectHon.height);
				} else {
					// 本人のグラフデータ取得
					var rectHon = convertToPointFromVal(nenkinHon, 0);
					// 本人のグラフ描画
					context.beginPath();
					context.fillStyle = colortbl[0];
					context.closePath();
					context.fillRect(
								rectHon.x,
								rectHon.y,
								rectHon.width,
								rectHon.height);
				}
			}
		});

		// 外枠線を引く
		context.beginPath();
		context.strokeStyle = self.brown;
		context.lineWidth = 5;
		context.moveTo(graphMargintLeft, graphMargintTop);
		context.lineTo(graphMargintLeft, graphMargintTop + graphSizeHeight);
		context.lineTo(graphMargintLeft + graphSizeWidth, graphMargintTop + graphSizeHeight);
		context.stroke();
	};

	// required
	return GraphNenkin;
})();