"use strict";

LIFEPLAN.graph.GraphInsurance = (function () {

	//=======================================
	var self;
	// required constructor
	var GraphInsurance = function () {

		self = this;
		// 継承
		LIFEPLAN.module.inherits(GraphInsurance, LIFEPLAN.graph.Graph);
	};
	var p = GraphInsurance.prototype;
	//=======================================

	// 加入保険のグラフを描画する
	p.drawGraphInsurance = function (canvasName, DB, mTab, MC) {

		// グラフ全体サイズ
		var baseWidth = 728;
		var baseHeight = 912;

		// コンテキスト取得
		var canvas = document.getElementById(canvasName);
		var context = canvas.getContext("2d");

		// グラフクリア
		context.clearRect(0, 0, baseWidth, baseHeight);

		// BAR start Point
		var barXStart = 150;
		var barYStart = 60;
		var barMarginRight = 50;

		// BARサイズ
		var barNameWidth = barXStart;
		var barWidth = baseWidth;
		var barHeight = 94;
		var perHeight = (baseHeight - barYStart) / 8;
		
		// グラフの開始X座標
//		var graphStartPoint = barNameWidth;

		context.beginPath();
		context.fillStyle = self.white;
		context.fillRect(0, 0, baseWidth, baseHeight);

		// データ取得
		var dataInsurance = MC.m_modelcase_hoken;
		dataInsurance = dataInsurance.filter(function (element) {
			return (Number(element.id_honhai) === mTab);
		});

		// グラフの色を定義
		// (id_insclass - 1)とarray.indexを同じにすること
		var colortbl = [
			'rgb(153,153,255)', //終身保険
			'rgb(153,204,0)', //定期保険
			'rgb(204,255,204)', //収入保障保険
			'rgb(255,153,153)', //養老・学資保険
			'rgb(255,255,0)', //年金保険
			'rgb(255,192,0)', //医療保険
			'rgb(255,153,0)'		//がん保険
		];

		// グラフの目盛り年齢の定義
		var startAge = [30, 40, 50, 60, 70, 80, 90, 100];
		
		// グラフキャプションの描画
		// (年齢) の描画
		context.beginPath();
		context.fillStyle = self.black;
		context = self.setFont4(context, 26);
		context.closePath();
		context.fillText("(年齢)", 0, 0);

		// 目盛り描画
		startAge.some(function (v, i, a) {

			var xPoint = barWidth / (a.length - 1) * i + barNameWidth;
			var yPoint = 30;

			// 最後の年齢のラベルは表示しない
			if (i > 6) {
				return false;
			}

			// 年齢ラベル
			context.beginPath();
			context.fillStyle = self.black;
			context = self.setFont3(context, 26);
			context.fillText(v, xPoint, yPoint);

			// 年齢ラベル ▼装飾
			var decoTriangle = 16;
			var decoXPoint = xPoint - (decoTriangle / 2);
			var decoYPoint = yPoint + decoTriangle;
			context.beginPath();
			context.lineWidth = 0;
			context.strokeStyle = self.black;
			context.fillStyle = self.black;
			context.moveTo(decoXPoint, decoYPoint);
			context.lineTo(decoXPoint + decoTriangle, decoYPoint);
			context.lineTo(decoXPoint + (decoTriangle / 2), decoYPoint + decoTriangle);
			context.closePath();
			context.fill();
			context.stroke();
		});

		// 加入保険分ループ
		dataInsurance.some(function (v, i) {

			// 保険データ変換
			var hoken = DB.get_insgoods(v.id_goods);

			// 保険表示セル座標
			var xPoint = 0;
			var yPoint = perHeight * i;

			// 保険金
			var sm_hokenkin = v.sm_hokenkin;

			// 保険表示セル文字情報
			var label1 = "";
			var label2 = "";

			// 開始年齢と終了年齢（保険によってかわる）
			var insuranceStartAge = 0;
			var insuranceEndAge = 0;
			var barArrow = false;
			// 2021/02/24 終身の矢印は lp_insgoods.json:id_syushin > 0 の場合に表示するように修正
			if (hoken.id_syushin > 0) {
				insuranceEndAge = startAge[startAge.length - 1];
				barArrow = true;
			} else {
				insuranceEndAge = v.id_kikan1;
			}

			// 保険IDにより値を変更する
			// エクセルツールとAndroidでIDが異なる。
			// ここではAndroidと同じ値を使っています。
			switch (hoken.id_insclass) {

				case 1:	//終身保険

					insuranceStartAge = v.age_keiyaku;
					label1 = "死亡保障 " + self.roundFormatKeta(sm_hokenkin / 10000, 0) + "万円";
					label2 = "";

					break;
				case 2:	//定期保険

					insuranceStartAge = v.age_keiyaku;
					// 2021/02/24 種類毎に集約しないで個別に表示するようにする対応
					//label1 = "死亡保障 " + self.roundFormatKeta(hoken2_teiki_val1 / 10000, 0) + "万円";
					label1 = "死亡保障 " + self.roundFormatKeta(sm_hokenkin / 10000, 0) + "万円";
					label2 = "";

					// 2021/02/24 種類毎に集約しないで個別に表示するようにする対応
					//if (hoken2_teiki_age > 0) {
					//	label2 = "(" + hoken2_teiki_age;
					//	label2 += "歳以降";
					//	label2 += self.roundFormatKeta(hoken2_teiki_val2 / 10000, 0) + "万円";
					//	label2 += ")";
					//}

					break;
				case 3:	//収入保障保険

					insuranceStartAge = v.age_keiyaku;

					label1 = "死亡保障 " + self.roundFormatKeta(sm_hokenkin * (v.id_kikan1 - v.age_keiyaku) / 10000, 0) + "万円";
					label2 = "(年 " + self.roundFormatKeta(sm_hokenkin / 10000, 0) + "万円" + "減額)";

					break;
				case 4:	//養老・学資保険

					insuranceStartAge = v.age_keiyaku;

					label1 = "保険金 " + self.roundFormatKeta(sm_hokenkin / 10000, 0) + "万円";
					label2 = "";

					break;
				case 5:	//個人年金保険

					// 2021/02/05 開始年　契約年→受取開始年
					//insuranceStartAge = v.age_keiyaku;
					insuranceStartAge = v.id_kikan1;

					if (hoken.id_syushin === 0) {
						insuranceEndAge = v.id_kikan2;
					}

					var labelval = 0;
					// 2021/02/05 年額　0万円　→　受取年額
					//if (!is_hai) {
					//	labelval = Logic09.vKojin_hon[v.age_keiyaku + index];
					//} else {
					//	labelval = Logic09.vKojin_hai[v.age_keiyaku + index];
					//}
					labelval = sm_hokenkin;
					label1 = "年額 " + self.roundFormatKeta(labelval / 10000, 0) + "万円";
					label2 = "";

					break;
				case 6:	//医療保険

					insuranceStartAge = v.age_keiyaku;

					// 2021/02/24 種類毎に集約しないで個別に表示するようにする対応
					//var labelval = 0;
					//if (!is_hai) {
					//	labelval = Logic09.vNyukyu_hon[v.age_keiyaku + index];
					//} else {
					//	labelval = Logic09.vNyukyu_hai[v.age_keiyaku + index];
					//}
					var labelval = sm_hokenkin;
					label1 = "入院日額 " + self.roundFormatKeta(labelval, 0) + "円";
					label2 = "";

					break;
				case 7:	//がん保険

					insuranceStartAge = v.age_keiyaku;

					// 2021/02/24 種類毎に集約しないで個別に表示するようにする対応
					//var labelval = 0;
					//if (!is_hai) {
					//	labelval = Logic09.vGankyu_hon[v.age_keiyaku + index];
					//} else {
					//	labelval = Logic09.vGankyu_hai[v.age_keiyaku + index];
					//}
					var labelval = sm_hokenkin;
					label1 = "入院日額 " + self.roundFormatKeta(labelval, 0) + "円";
					label2 = "";

					break;
			}

			// canvasへの描画処理
			var drawCellInsurance = function () {

				var xCellPonint = barNameWidth;
				var yCellPoint = yPoint + 80;

				// グラフの描画
				// 幅を取得
				// 一年当たりの幅
				var minMeter = startAge[0];
				var maxMeter = startAge[startAge.length - 1];

				// 年齢をpixcelでグラフ上のx,widthに変換する処理
				var convertAgeToPixelHorizontalBarGraph = function (
								graphSizeWidth,
								maxValue,
								minValue,
								startValue,
								endValue) {

					// 単位あたりのPixcelを計算
					var perUnitPX = graphSizeWidth / (maxValue - minValue);

					// 開始年齢と終了年齢の座標をPixcelで計算
					var startValuePX =  perUnitPX * (startValue - minValue) + barXStart;
					var endValuePX = perUnitPX * (endValue - minValue) + barXStart;

					// 開始年齢と終了年齢の座標が、0以下だと0に、グラフサイズより大きいとグラフサイズに変更する
					startValuePX = (startValuePX < barXStart) ? barXStart : startValuePX;
					endValuePX = (endValuePX > graphSizeWidth) ? graphSizeWidth : endValuePX;

					// グラフの幅を計算する
					var barWidthPX = endValuePX - startValuePX;
					
					// グラフが描画対象外の年齢の場合は描画しない
					barWidthPX = (barWidthPX < 0) ? 0 : barWidthPX;

					return {
						x: startValuePX,
						width: barWidthPX
					};
				};

				// 保険 BAR HORIZONTALの描画
				// BARに矢印を付加する
				if (barArrow && hoken.id_insclass != 3) {

					// 矢印を付加する

					// BAR GRAPH HORIZONTAL 幅を計算する
					var barSize = convertAgeToPixelHorizontalBarGraph(
									barWidth,
									maxMeter,
									minMeter,
									insuranceStartAge,
									insuranceEndAge
									);

					// 矢印開始位置 x座標
					var arrowXStartPoint = barSize.x;
					var arrowXEndPoint = xCellPonint + barWidth - barXStart - 50;


					context.beginPath();
					context.lineWidth = 0;
					context.strokeStyle = colortbl[hoken.id_insclass - 1];
					context.fillStyle = colortbl[hoken.id_insclass - 1];
					context.moveTo(arrowXStartPoint, yCellPoint);
					context.lineTo(arrowXEndPoint, yCellPoint);
					context.lineTo(arrowXEndPoint + 50, yCellPoint + (barHeight / 2));
					context.lineTo(arrowXEndPoint, yCellPoint + barHeight);
					context.lineTo(arrowXStartPoint, yCellPoint + barHeight);
					context.closePath();
					context.fill();
					context.stroke();

					// '終身'という文字を入れる
					context.beginPath();
					context.fillStyle = self.black;
					context = self.setFont(context, 28);
					context.closePath();
					context.fillText("終身", baseWidth - 40, yPoint + barYStart + 64);

				} else if (hoken.id_insclass == 3) {

					// BAR GRAPH HORIZONTAL 幅を計算する
					var barSize = convertAgeToPixelHorizontalBarGraph(
									barWidth,
									maxMeter,
									minMeter,
									insuranceStartAge,
									insuranceEndAge
									);

					// 漸減グラフにする
					var startXPoint = barSize.x;
					var endXPoint = barSize.x + barSize.width;

					context.beginPath();
					context.lineWidth = 0;
					context.strokeStyle = colortbl[hoken.id_insclass - 1];
					context.fillStyle = colortbl[hoken.id_insclass - 1];
					context.moveTo(startXPoint, yCellPoint);
					context.lineTo(endXPoint, yCellPoint + barHeight);
					context.lineTo(startXPoint, yCellPoint + barHeight);
					context.closePath();
					context.fill();
					context.stroke();

				} else {
					// そのまま

					// BAR GRAPH HORIZONTAL 幅を計算する
					var barSize = convertAgeToPixelHorizontalBarGraph(
									barWidth,
									maxMeter,
									minMeter,
									insuranceStartAge,
									insuranceEndAge
									);
					context.beginPath();
					context.fillStyle = colortbl[hoken.id_insclass - 1];
					context.fillRect(
									barSize.x,
									yCellPoint,
									barSize.width,
									barHeight);
				}

				// 保険名称、保険内容を描画する
				var drawInsuranceText = function () {

					var textTitleXPoint = xPoint + 20;
					var textTitleYPoint = yPoint + barYStart + 64;

					// 保険名称の表示
					context.beginPath();
					context.fillStyle = self.black;
					context = self.setFont2(context, 28);
					context.closePath();
					context.fillText(hoken.st_goodsname, textTitleXPoint, textTitleYPoint);

					// 保険内容の表示
					context.beginPath();
					context = self.setFont2(context, 28);
					context.closePath();

					var textDetailXPoint = textTitleXPoint + 260;
					var textDetailYOPoint = textTitleYPoint;

					if (label2.length === 0) {

						context.fillText(label1, textDetailXPoint, textDetailYOPoint);

					} else {

						context.fillText(label1, textDetailXPoint, textDetailYOPoint - 18);
						context.fillText(label2, textDetailXPoint, textDetailYOPoint + 18);
					}
				};
				drawInsuranceText();


			};
			drawCellInsurance();

			// 8個以上だとループ処理終了
			if (i > 8) {
				return true;
			}
		});
	};
	// required
	return GraphInsurance;
})();