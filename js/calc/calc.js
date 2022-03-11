/**
 * 計算ロジック
 * １～９の依存関係

 * 1 -> 2 -> 3 -> 9 -> 4 -> 6 -> 5 -> 7 -> 8
 * 右にある計算ロジックを取得する際には左にあるロジックが全て必要

 */
"use strict";

// public class Calc extends BaseCalc
LIFEPLAN.calc.Calc = (function() {

	var self;

	var Calc = function(db, context) {
		self = this;
		LIFEPLAN.calc.BaseCalc.call(self, db);
		self.mContext = context;
		self.mLogic01 = new LIFEPLAN.calc.Logic01(db);
		self.mLogic02 = new LIFEPLAN.calc.Logic02(db);
		self.mLogic03 = new LIFEPLAN.calc.Logic03(db);
		self.mLogic04 = new LIFEPLAN.calc.Logic04(db);
		self.mLogic05 = new LIFEPLAN.calc.Logic05(db);
		self.mLogic06 = new LIFEPLAN.calc.Logic06(db);
		self.mLogic07 = new LIFEPLAN.calc.Logic07(db);
		self.mLogic08 = new LIFEPLAN.calc.Logic08(db);
		self.mLogic09 = new LIFEPLAN.calc.Logic09(db);
	};

	LIFEPLAN.module.inherits(Calc, LIFEPLAN.calc.BaseCalc);

	var p = Calc.prototype;

	p.L1 = function() {
		return self.mLogic01;
	};
	p.L2 = function() {
		return self.mLogic02;
	};
	p.L3 = function() {
		return self.mLogic03;
	};
	p.L4 = function() {
		return self.mLogic04;
	};
	p.L5 = function() {
		return self.mLogic05;
	};
	p.L6 = function() {
		return self.mLogic06;
	};
	p.L7 = function() {
		return self.mLogic07;
	};
	p.L8 = function() {
		return self.mLogic08;
	};
	p.L9 = function() {
		return self.mLogic09;
	};

	//Logic01
	p.logic_init = function() {
		self.mLogic01.setupData();
		self.mLogic02.setupData();
		self.mLogic03.setupData();
		self.mLogic04.setupData();
		self.mLogic05.setupData();
		self.mLogic06.setupData();
		self.mLogic07.setupData();
		self.mLogic08.setupData();
		self.mLogic09.setupData();
		// 他ロジック呼び出し用変数をセット
		self.mLogic01.mDataLength = self.mLogic09.mDataLength;
		self.mLogic02.mDataLength = self.mLogic09.mDataLength;
		self.mLogic03.mDataLength = self.mLogic09.mDataLength;
		self.mLogic04.mDataLength = self.mLogic09.mDataLength;
		self.mLogic05.mDataLength = self.mLogic09.mDataLength;
		self.mLogic06.mDataLength = self.mLogic09.mDataLength;
		self.mLogic07.mDataLength = self.mLogic09.mDataLength;
		self.mLogic08.mDataLength = self.mLogic09.mDataLength;
		//Logic02
		self.mLogic02.L1 = self.L1();
		//Logic03
		self.mLogic03.L2 = self.L2();
		self.mLogic03.L3 = self.L3();
		//Logic04
		self.mLogic04.L1 = self.L1();
		self.mLogic04.L2 = self.L2();
		self.mLogic04.L3 = self.L3();
		self.mLogic04.L4 = self.L4();
		self.mLogic04.L5 = self.L5();
		self.mLogic04.L5.mYYYYStart = self.mLogic09.mYYYYStart;
		self.mLogic04.L5.mDataLength = self.mLogic09.mDataLength;
		self.mLogic04.L9 = self.L9();
		//Logic05
		self.mLogic05.L6 = self.L6();
		// 2021/03/26 logic06の中でlogic09 の変数を参照できるように設定する。
		self.mLogic05.L9 = self.L9();
		//Logic06
		self.mLogic06.L1 = self.L1();
		self.mLogic06.L3 = self.L3();
		self.mLogic06.L4 = self.L4();
		self.mLogic06.L5 = self.L5();
		self.mLogic06.L6 = self.L6();
		self.mLogic06.L6.mDataLength = self.mLogic09.mDataLength;
		self.mLogic06.L9 = self.L9();
		//Logic07
		self.mLogic07.L1 = self.L1();
		self.mLogic07.L3 = self.L3();
		self.mLogic07.L6 = self.L6();
		//Logic08
		self.mLogic08.L1 = self.L1();
		self.mLogic08.L3 = self.L3();
		self.mLogic08.L4 = self.L4();
		self.mLogic08.L5 = self.L5();
		self.mLogic08.L6 = self.L6();
		self.mLogic08.L7 = self.L7();
		self.mLogic08.L9 = self.L9();
	};

	p.dump_all = function() {
		if (self.DB.get_setupinfo().fg_debug === 0) {
			return;
		}
		var log = "";
		log += self.mLogic01.dump(self.mContext, false);
		log += "\n";
		log += self.mLogic02.dump(self.mContext, false);
		log += "\n";
		log += self.mLogic03.dump(self.mContext, false);
		log += "\n";
		log += self.mLogic04.dump(self.mContext, false);
		log += "\n";
		log += self.mLogic05.dump(self.mContext);
		log += "\n";
		log += self.mLogic06.dump(self.mContext);
		log += "\n";
		log += self.mLogic07.dump(self.mContext, false);
		log += "\n";
		log += self.mLogic08.dump(self.mContext, false);
		log += "\n";
		log += self.mLogic09.dump(self.mContext, false);
		log += "\n";

		log += self.mLogic01.dump(self.mContext, true);
		log += "\n";
		log += self.mLogic02.dump(self.mContext, true);
		log += "\n";
		log += self.mLogic03.dump(self.mContext, true);
		log += "\n";
		log += self.mLogic04.dump(self.mContext, true);
		log += "\n";
		log += self.mLogic07.dump(self.mContext, true);
		log += "\n";
		log += self.mLogic08.dump(self.mContext, true);
		log += "\n";
		log += self.mLogic09.dump(self.mContext, true);
		log += "\n";
	};

	p.setStorage_all = function() {
		self.mLogic01.setStorage(false);
		self.mLogic02.setStorage(false);
		self.mLogic03.setStorage(false);
		self.mLogic04.setStorage(false);
		self.mLogic05.setStorage(false);
		self.mLogic06.setStorage(false);
		self.mLogic07.setStorage(false);
		self.mLogic08.setStorage(false);
		self.mLogic09.setStorage(false);
	};

	p.logicALL_Go = function() {
		//【出力】前回の表示内容をクリア
		self.logic_init();
		//【計算】全計算式：8章を実行すると、依存関係により全計算式が実行される。

		self.logic08_Go();
		self.setStorage_all();
		self.dump_all();
	};

	p.logic01_fast = function() {
		self.mLogic01.setupData();
		self.mLogic01.logic01_Go();
	};

	//Logic01
	p.logic01_Go = function() {
		self.mLogic01.logic01_Go();
	};
	//Logic02
	p.logic02_Go = function() {
		self.logic01_Go();

		self.mLogic02.logic02_Go();
	};
	//Logic03
	p.logic03_Go = function() {
		self.logic02_Go();

		self.mLogic03.logic03_Go();
	};
	//Logic04
	p.logic04_Go = function() {
		self.logic03_Go();
		self.L5().Calc26_LoanHensai();
		self.L5().Calc27_LoanGenzei();

		self.mLogic04.logic04_Go();
	};
	//Logic05
	p.logic05_Go = function() {
		// 2021/03/31 税金、社会保険料計算（logic04）と加入保険料計算（logic09）の処理順序を入れ替える
		//self.logic04_Go();
		//self.logic09_Go();
		self.logic09_Go();
		self.logic04_Go();
		self.L6().Calc35_Tsumitate();
		self.L6().Calc31_Sonota();
		self.L6().Calc30_Syunyu();

		self.mLogic05.logic05_Go();
	};
	//Logic06
	p.logic06_Go = function() {
		self.L3().GetPersonalInfoNenkin();
		self.logic05_Go();

		self.mLogic06.logic06_Go();
	};
	//Logic07
	p.logic07_Go = function() {
		self.logic06_Go();

		self.mLogic07.logic07_Go();
	};
	//Logic08
	p.logic08_Go = function() {
		self.logic07_Go();

		self.mLogic08.logic08_Go();
	};
	//Logic09
	p.logic09_Go = function() {
		self.mLogic09.logic09_Go();
	};

	return Calc;
})();
