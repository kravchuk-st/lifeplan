"use strict";

LIFEPLAN.graph.GraphEvent = (function () {

	//=======================================
	var self;
	// required constructor
	var GraphEvent = function () {
  
		self = this;
		// 継承
		LIFEPLAN.module.inherits(GraphEvent, LIFEPLAN.graph.Graph);
	};
	var p = GraphEvent.prototype;
	//=======================================
	
	// サイズなど
	var canvasWidth = 1570;
	var canvasHeight = 360;
	var graphWidth = 1430;
	var graphBarStartX = canvasWidth - graphWidth;

	var graphXItemLength = 36;
	var eventCaptionWidth = 125;
	var eventBarHeight = 60;

	// イベントボックスのサイズ
	var eventBoxWidth = 80;
	var eventBoxHeight = 50;
	
	// 「ご家族のイベント」の描画処理
	p.drawGraphFamilyEvents = function (canvasName, familyEventsData, startAge) {

//		// サイズなど
//		var canvasWidth = 1570;
//		var canvasHeight = 360;
//		var graphWidth = 1430;
//		var graphBarStartX = canvasWidth - graphWidth;
//		
//		var graphXItemLength = 36;
//		var eventCaptionWidth = 125;
//		var eventBarHeight = 60;
//    
//    // イベントボックスのサイズ
//    var eventBoxWidth = 80;
//    var eventBoxHeight = 50;
    

		//=======================================
		// コンテキスト取得
		var canvas = document.getElementById(canvasName);
		var context = canvas.getContext("2d");
		// canvas初期化
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		//=======================================

		// 年齢一年あたりの幅
		var widthByYear = graphWidth / graphXItemLength;

		// 罫線描画
		context.beginPath();
		context.strokeStyle = self.black;
		context.lineWidth = 1;
		context.moveTo(eventCaptionWidth, 0);
		context.lineTo(eventCaptionWidth, canvasHeight);
		context.stroke();

		context.beginPath();
		context.strokeStyle = self.black;
		context.lineWidth = 1;
		context.moveTo(eventCaptionWidth, eventBarHeight);
		context.lineTo(canvasWidth, eventBarHeight);
		context.stroke();

		for (var i = 2; i < 6; i++) {
			context.beginPath();
			context.strokeStyle = self.black;
			context.lineWidth = 1;
			context.moveTo(0, eventBarHeight * i);
			context.lineTo(canvasWidth, eventBarHeight * i);
			context.stroke();
		};

		// ラベルの描画
		context.beginPath();
		context.fillStyle = self.black;
		context = self.setFont2(context, 28);
		context.fillText("ご家族の", 3, 43);
		context.fillText("イベント", 3, 77);

		var koLabel = ["第１子", "第２子", "第３子", "第４子"];
		for (var i = 2; i < 6; i++) {
			context.beginPath();
			context.fillStyle = self.black;
			context = self.setFont2(context, 28);
			context.fillText(koLabel[i - 2], 10, eventBarHeight * i + 30);
		};

		// 「ご家族のイベント」の描画
		var familyEvent = familyEventsData.familyEvent;
		for (var i = 0; i < familyEvent.length; i++) {

			// イベント名称
			var event = familyEvent[i].event;
			// イベント発生時本人年齢
			var age_hon = familyEvent[i].age_hon;
			// 行数
			var line = familyEvent[i].line;
			// m_modelcase_event キー
			var key = familyEvent[i].m_modelcase_event_key;

			var scaleAge = age_hon - startAge;
			if (scaleAge > -1 && scaleAge < 37) {

        // Rectの座標
        var eventBoxX = (scaleAge) * widthByYear + graphBarStartX;
        var eventBoxY = 0;
        // Textの座標
        var eventTextX = (scaleAge) * widthByYear + graphBarStartX  + (eventBoxWidth / 2);
        var eventTextY = 0;
        
        // ご家族のイベントの描画
				if (line === 1) {
					// ご家族のイベント1行目のY座標計算
					eventBoxY = 5;
					eventTextY = 18 + (eventBoxHeight / 2) - 11;
					
					// M_add_start
					if (event === "結婚") {
						context.beginPath();
						context.fillStyle = self.graphLinePaint;
						context.fillRect(eventBoxX, eventBoxY, eventBoxWidth, eventBoxHeight);
	
						context.beginPath();
						context.fillStyle = self.white;
						context = self.setFont5(context, 28);
						context.fillText(event, eventTextX, eventTextY);
						
						// M_add_start
						buttonFamilyEvent(eventBoxX, eventBoxY, event, context, canvas, age_hon, -1);
						//buttonFamilyEvent(eventBoxX, eventBoxY, event, context, canvas, age_hon, key);
						// M_add_end
					} else {
						context.beginPath();
						context.fillStyle = self.fixedEventBgPaint;
						context.fillRect(eventBoxX, eventBoxY, eventBoxWidth, eventBoxHeight);
	
						context.beginPath();
						context.fillStyle = self.black;
						context = self.setFont5(context, 28);
						context.fillText(event, eventTextX, eventTextY);
					}
					// M_add_end
					
				} else {
          // ご家族のイベント2行目のY座標計算
					eventBoxY = 65;
					eventTextY = 78 + (eventBoxHeight / 2) - 11;
					
					context.beginPath();
					context.fillStyle = self.editableEventBgPaint;
					context.fillRect(eventBoxX, eventBoxY, eventBoxWidth, eventBoxHeight);

					context.beginPath();
					context.fillStyle = self.editableEventTextPaint;
					context = self.setFont5(context, 28);
					context.fillText(event, eventTextX, eventTextY);

					// 2行目のイベントにはクリックイベントの追加
					buttonFamilyEvent(eventBoxX, eventBoxY, event, context, canvas, age_hon, key);
				};
			};
		};

		// 「第１子」〜「第４子」の描画
		var childEvent = familyEventsData.childEvent;
		for (var i = 0; i < childEvent.length; i++) {

			// イベント名称
			var school = childEvent[i].school;
			// イベント発生時本人年齢
			var age_hon = childEvent[i].age_hon;
			// 行数
			var no_child = childEvent[i].no_child;

			var scaleAge = age_hon - startAge;
			if (scaleAge > -1 && scaleAge < 37) {
				
				// Rectの座標
        var eventBoxX = (scaleAge) * widthByYear + graphBarStartX + 14;
        var eventBoxY = 65 + eventBarHeight * no_child;
        // Textの座標
        var eventTextX = (scaleAge) * widthByYear + graphBarStartX + 14 + (eventBoxWidth / 2);
        var eventTextY = 91 + eventBarHeight * no_child;

				context.beginPath();
				context.fillStyle = self.fixedEventBgPaint;
				context.fillRect(eventBoxX, eventBoxY, eventBoxWidth, eventBoxHeight);

				context.beginPath();
				context.fillStyle = self.fixedEventTextPaint;
				context = self.setFont5(context, 28);
				context.fillText(school, eventTextX, eventTextY);

			};
		};
	};

	// ご家族のイベントボタン
	var buttonFamilyEvent = function (x, y, event, ctx, canvas, age_hon, key) {

		// ボタン描画
		var width = eventBoxWidth;
		var height = eventBoxHeight;

		canvas.addEventListener('click', function (e) {
			var rect = e.target.getBoundingClientRect();
			var zoomer = document.body.clientWidth / window.innerWidth;

			var mouseX = e.clientX * zoomer - rect.left;
			var mouseY = e.clientY * zoomer - rect.top;

			if (x < mouseX && mouseX < x + width) {
				if (y < mouseY && mouseY < y + height) {

					LIFEPLAN.openEventModal(event, age_hon, key);

				}
			}
		}, false);
	};

	// required
	return GraphEvent;
})();