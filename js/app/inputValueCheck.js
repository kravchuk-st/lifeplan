/* global LIFEPLAN */

"use strict";

LIFEPLAN.app.InputValueCheck = (function() {
	var self;
	var DB = new LIFEPLAN.db.LifePlanDB();
	var LPdate = DB.LPdate;

	var InputValueCheck = function() {
		self = this;
	};
	var p = InputValueCheck.prototype;

	p.settingJob_S0_isValid = function(MC) {
		if (false === self.settingJob_S1_isValid(MC, true)) {
			return false;
		}
		if (false === self.settingJob_S1_isValid(MC, false)) {
			return false;
		}
		if (false === self.settingJob_S2_isValid(MC, true)) {
			return false;
		}
		if (false === self.settingJob_S2_isValid(MC, false)) {
			return false;
		}
		return true;
	};

	p.settingJob_S1_isValid = function(_mc, is_hai) {
		var nensyu = _mc.get_sm_nensyu(is_hai);
		var tai_nensyu = _mc.get_sm_tai_nensyu(is_hai);
		var syugyo = _mc.get_ym_syugyo(is_hai);
		var y, m;
		y = LPdate.getYear(syugyo);
		m = LPdate.getMon(syugyo);
		// 配偶者なしの場合は配偶者側のチェックをしない

		if (_mc.is_kekkon() || !is_hai) {
			// 受入No.30,40 職業：会社員、会社役員の場合

			if (_mc.get_id_syokugyo(is_hai) < 3) {
				// 業種、職種、規模が未設定の場合

				if ((0 === _mc.get_id_gyosyu(is_hai)) || (0 === _mc.get_id_syokusyu(is_hai)) || (0 === _mc.get_id_kibo(is_hai))) {
					alert("業種、職種、規模を入力してください。");
					return false;
				}
			}
			/**
			 * 受入No.31,41 職業：会社員、会社役員の場合、現在の年収が未入力の場合

			 * 受入No.32,42 職業：公務員の場合、現在の年収が未入力の場合

			 * 受入No.33,43 職業：自営業の場合、現在の年収が未入力の場合

			 */
			if (_mc.get_id_syokugyo(is_hai) < 4 || _mc.get_id_syokugyo(is_hai) === DB.G_syokugyo.JIEIGYO) {
				if (nensyu < 0 || nensyu > 99990000) {
					alert("現在の年収を入力してください。");
					return false;
				}
			}
			if (_mc.get_id_syokugyo(is_hai) === DB.G_syokugyo.JIEIGYO) {
				if (0 === _mc.get_id_kinmu(is_hai)) {
					/**
					 * 受入No.34,44 職業：自営業の場合

					 *              過去の勤務経験：なしかつ、

					 *              過去の就業年齢、過去の退職年齢、退職時の年収が未設定以外の場合

					 */
					if (_mc.get_age_kakosyugyo(is_hai) !== 0 || _mc.get_age_kakotaisyoku(is_hai) !== 0) {
						alert("過去の勤務経験を見直してください。");
						return false;
					}
					if (tai_nensyu !== 0) {
						alert("退職時の年収を入力してください。");
						return false;
					}
				} else {
					/**
					 * 受入No.35,45 職業：自営業の場合

					 *              過去の勤務経験：会社員 or 公務員 かつ、

					 *              過去の就業年齢、過去の退職年齢、退職時の年収が未入力の場合

					 */
					if (_mc.get_age_kakosyugyo(is_hai) === 0 || _mc.get_age_kakotaisyoku(is_hai) === 0 || _mc.get_age_kakosyugyo(is_hai) > _mc.get_age_kakotaisyoku(is_hai)) {
						alert("過去の勤務経験を見直してください。");
						return false;
					}
					if (tai_nensyu < 0 || tai_nensyu > 99990000) {
						alert("退職時の年収を入力してください。");
						return false;
					}
				}
			}
			if (_mc.get_id_syokugyo(is_hai) === DB.G_syokugyo.MUSYOKU) {
				//				受入No.38,39,48,49 職業：無職の場合

				if (is_hai) {
					_mc.sm_tai_nensyu_hai = 0;
					_mc.age_kakosyugyo_hai = 0;
					_mc.age_kakotaisyoku_hai = 0;
				} else {
					_mc.sm_tai_nensyu_hon = 0;
					_mc.age_kakosyugyo_hon = 0;
					_mc.age_kakotaisyoku_hon = 0;
				}
			}
			if (_mc.get_id_syokugyo(is_hai) === DB.G_syokugyo.TAI_KAISYAIN) {
				/**
				 * 受入No.36,46 職業：退職（会社員）の場合

				 *              過去の就業年月、過去の業種、職種、規模、退職時の年収が未入力の場合

				 */
				if (m < 1 || y < 1 || 0 === _mc.get_id_gyosyu(is_hai) || 0 === _mc.get_id_syokusyu(is_hai) || 0 === _mc.get_id_kibo(is_hai) || tai_nensyu < 0 || tai_nensyu > 99990000) {
					alert("退職時の年収を入力してください。");
					return false;
				}
			} else if (_mc.get_id_syokugyo(is_hai) === DB.G_syokugyo.TAI_KOMUIN) {
				/**
				 * 受入No.37,47 職業：退職（公務員）の場合

				 *              過去の就業年月、退職時の年収が未入力の場合

				 */
				if (m < 1 || y < 1 || tai_nensyu < 0 || tai_nensyu > 99990000) {
					alert("退職時の年収を入力してください。");
					return false;
				}
			}
		}
		return true;
	};

	p.settingJob_S2_isValid = function(_mc, is_hai) {
		var tai_age = _mc.get_age_taisyoku(is_hai);
		var st = _mc.get_age_saisyusyoku_st(is_hai);
		var ed = _mc.get_age_saisyusyoku_end(is_hai);
		var taisyoku = _mc.get_sm_taisyoku(is_hai);
		var saisyusyoku = _mc.get_sm_saisyu_income(is_hai);

		// 受入No.59,64 職業：会社員、会社役員、公務員の場合、退職年齢が未選択の場合

		// 受入No.62,67 職業：自営業の場合、退職年齢が未選択の場合

		if (_mc.get_id_syokugyo(is_hai) === DB.G_syokugyo.KAISYAIN ||
				_mc.get_id_syokugyo(is_hai) === DB.G_syokugyo.YAKUIN ||
				_mc.get_id_syokugyo(is_hai) === DB.G_syokugyo.KOMUIN ||
				_mc.get_id_syokugyo(is_hai) === DB.G_syokugyo.JIEIGYO) {
			if (tai_age === 0) {
				alert("退職年齢を入力してください。");
				return false;
			}
		}
		/** 受入No.60,61,63,65,66,68
		 *  職業：会社員、会社役員、公務員、退職（会社員）、退職（公務員）、無職の場合、

		 *  再就職による収入の開始年齢、終了年齢、収入額全て選択 or 全て未選択以外の場合

		 */
		if (_mc.get_id_syokugyo(is_hai) !== DB.G_syokugyo.JIEIGYO) {
			if (taisyoku < 0) {
				alert("入力内容を見直してください。");
				return false;
			}
			if (taisyoku > 999990000) {
				alert("退職金は999990000を超えない金額を入力してください");
				return false;
			}
			if (st > 0 || ed > 0 || saisyusyoku > 0) {
				if (tai_age > st || st > ed || st === 0 || ed === 0) {
					alert("過去の勤務経験を見直してください。");
					return false;
				}
				if (saisyusyoku <= 0) {
					alert("入力内容を見直してください。");
					return false;
				} else if (saisyusyoku > 99990000) {
					alert("再就職収入額は99990000を超えない金額を入力してください");
					return false;
				}
			}
		}
		return true;
	};

	return InputValueCheck;
})();