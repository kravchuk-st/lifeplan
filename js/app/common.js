/*
 * LMPS共通クラス
 * LMPSの各画面で共通で使用する処理を定義
 */
var LMPS = LMPS || (function () {
	'use strict';

	// ユーザーエージェントの判定
	var ua = navigator.userAgent.toLowerCase();

	/*
	 * 複数の画面（パネル）からなる一連のコンテンツの表示の出しわけを制御
	 */
	var ContentPanel = (function () {

		function ContentPanel() {
			this.initialize();
		}

		ContentPanel.prototype.initialize = function () {
			this.$panel = $('.wrapper .main .content-panel');

			var $filter = this.$panel.filter('.current');
			if ($filter.size() === 0) {
				this.showFirstPanel();
			} else {
				this.displayNo = $filter.index();
			}
		};

		ContentPanel.prototype.showFirstPanel = function () {
			this.$panel.removeClass('current');
			this.$panel.eq(0).addClass('current');
			this.displayNo = 0;
		};

		ContentPanel.prototype.showLastPanel = function () {
			var targetNo = this.$panel.size() - 1;
			if (targetNo < 0) {
				targetNo = 0;
			}

			this.$panel.removeClass('current');
			this.$panel.eq(targetNo).addClass('current');
			this.displayNo = targetNo;
		};

		ContentPanel.prototype.showNextPanel = function () {
			var targetNo = this.displayNo + 1;
			if (this.$panel.size() <= targetNo) {
				return;
			}

			this.$panel.removeClass('current');
			this.$panel.eq(targetNo).addClass('current');
			this.displayNo = targetNo;
		};

		ContentPanel.prototype.showPrevPanel = function () {
			var targetNo = this.displayNo - 1;
			if (targetNo < 0) {
				return;
			}

			this.$panel.removeClass('current');
			this.$panel.eq(targetNo).addClass('current');
			this.displayNo = targetNo;
		};

		ContentPanel.prototype.selectPanel = function (arg) {
			var targetNo = arg.no;
			var targetName = arg.name;

			if (targetNo !== undefined) {
				if (isNaN(targetNo)) {
					return;
				}
				if (targetNo < 0) {
					return;
				}
				if (this.$panel.size() <= targetNo) {
					return;
				}
			} else if (targetName !== undefined) {
				var $matchPanel = this.$panel.filter('[data-panelname=' + targetName + ']');
				if ($matchPanel.size() === 0) {
					return;
				}
				targetNo = $matchPanel.index();
			} else {
				return;
			}

			this.$panel.removeClass('current');
			this.$panel.eq(targetNo).addClass('current');
			this.displayNo = targetNo;
		};


		return ContentPanel;
	})();

	/*
	 * モーダル（オーバーレイ）を制御
	 */
	var Modal = (function () {

		function Modal() {
			this.initialize();
		}

		Modal.prototype.initialize = function () {
			this.$modal = $('.wrapper .modal');

			if (this.$modal.size() === 0) {
				return;
			}

			var $_selfModal = this.$modal;

			$(window).on('resize', function () {


				var winH = $(window).height();
				if (!LMPS.isValidityViewport()) {
					if (Math.abs(window.orientation) === 0) {
						winH = winH * 1920 / LMPS.portraitWidth;
					} else {
						winH = winH * 1920 / LMPS.landscapeWidth;
					}
				}

				$_selfModal.each(function() {
					var $_self = $(this);

					var top = $_self.find('.modal-frame').offset().top,
							titleH = $_self.find('.modal-title').outerHeight();

					top = 10;	// CSS上、ここはいったん10pxで決めうち


					var frameH = winH - top * 2,
							contentH = frameH - titleH;

					// $_self.height(Math.abs(winH));
					// $_self.find('.modal-frame').outerHeight(Math.abs(frameH));
					// $_self.find('[class^="modal-content"]').outerHeight(Math.abs(contentH))
				});

			}).trigger('resize');
		};

		Modal.prototype.open = function (id) {
			var $modal = this.$modal.filter(id);
			if ($modal.size() === 0) {
				$modal = this.$modal.eq(0);
			}

			$(window).trigger('resize');

			$modal.addClass('show');
			setTimeout(function () {
				$modal.addClass('is-open');
			}, 10);
		};

		Modal.prototype.close = function () {
			var $modal = this.$modal.filter('.is-open');
			if ($modal.size() === 0) {
				return;
			}

			$modal.removeClass('is-open');
			setTimeout(function () {
				$modal.removeClass('show');
			}, 250);
		};

		return Modal;
	})();

	return {
		// 表示中のブラウザがViewport（ピクセル単位での幅指定）が可能か否かを返す
		isValidityViewport: function () {
			var isValidity = false;
			if (-1 < ua.indexOf("iphone") || -1 < ua.indexOf("ipod") || -1 < ua.indexOf("ipad") || -1 < ua.indexOf("macintosh") || -1 < ua.indexOf("msie") || -1 < ua.indexOf("trident")) {
				isValidity = true;
			}
			return isValidity;
		},
		// 表示中のデバイスのOSがAndroidか否かを返す
		isAndroid: function () {
			if (-1 < ua.indexOf("android")) {
				return true;
			}
			return false;
		},
		isTrident: function () {
      if (-1 < ua.indexOf("trident")) {
        return true;
      }
      return false;
    },
		isFirefox: function () {
			if (-1 < ua.indexOf("firefox")) {
				return true;
			}
			return false;
		},
		isTouchDevice: function () {
      if (window.ontouchstart) {
        return true;
      }
      return false;
    },
		// パネル情報を格納
		setPanel: function () {
			this.panel = new ContentPanel();
		},
		// 最初のパネルを表示
		firstPanel: function () {
			this.panel.showFirstPanel();
		},
		// 最後のパネルを表示
		lastPanel: function () {
			this.panel.showLastPanel();
		},
		// 次のパネルを表示
		nextPanel: function () {
			this.panel.showNextPanel();
		},
		// 前のパネルを表示
		prevPanel: function () {
			this.panel.showPrevPanel();
		},
		// 指定のパネルを表示
		selectPanel: function (arg) {
			this.panel.selectPanel(arg);
		},
		// モーダル情報を格納
		setModal: function () {
			this.modal = new Modal();
		},
		// モーダルを表示
		openModal: function (id) {
			this.modal.open(id);
		},
		// モーダルを非表示
		closeModal: function () {
			this.modal.close();
		}

	};
}());

if (LMPS.isValidityViewport()) {
	$('meta[name="viewport"]').attr('content', 'width=1920, user-scalable=no');
}
if (LMPS.isAndroid()) {
	// android用css追加
	var link = '<link rel="stylesheet" href="assets/css/android.css" />';
	$('link:last').after(link);
}

/*
 * ページのドキュメント読み込みが完了した時の処理
 */
$(function () {

	// Viewportを出力していない時の処理
	if (!LMPS.isValidityViewport()) {

		$(window).on('resize', function () {
			if (Math.abs(window.orientation) === 0) {

				if (LMPS.isAndroid()) {
					if (!LMPS.portraitWidth) {
						LMPS.portraitWidth = $(window).width();
					}
				} else {
					LMPS.portraitWidth = $(window).width();
				}

				// if (LMPS.isFirefox()) {
				// 	$('html').css({
				// 		'transform-origin': 'left top',
				// 		'transform': 'scale(' + (LMPS.portraitWidth / 1920) + ')',
				// 	});
				// } else {
				// 	$('html').css('zoom', LMPS.portraitWidth / 1920);
				// }

			} else {

				if (LMPS.isAndroid()) {
					if (!LMPS.landscapeWidth) {
						LMPS.landscapeWidth = $(window).width();
					}
				} else {
					LMPS.landscapeWidth = $(window).width();
				}

				// if (LMPS.isFirefox()) {
				// 	$('html').css({
				// 		'transform-origin': 'left top',
				// 		'transform': 'scale(' + (LMPS.landscapeWidth / 1920) + ')',
				// 	});
				// } else {
				// 	$('html').css('zoom', LMPS.landscapeWidth / 1920);
				// }

			}
		}).trigger('resize');
	}

	// 対象デバイスがAndroidの時の処理
	if (LMPS.isAndroid()) {
		var ua = navigator.userAgent.toLowerCase();
		var version = parseFloat(ua.slice(ua.toLowerCase().indexOf("android") + 8));
		if (version < 4.4) {
			$('.wrapper').addClass('no-flex')

			$('.grid').each(function () {
				var $grid = $(this);
				var $column = $grid.find('> .column');
				if (0 < $column.size()) {
					$grid.addClass('grid-' + $column.size());
				}
			});
		}
	}
	
	// 対象デバイスがタッチデバイスの場合
  if (LMPS.isTouchDevice()) {
    $('body').addClass('is-touch');
  }

	// パネル切り替え処理をセット
	// （別途開発側で実装する場合は削除してください）
	LMPS.setPanel();

	setTimeout(function() {

		$(window).on('resize', function () {
			var $wrapper = $('.wrapper');
			var $header = $wrapper.find(' > .header');
			var $nav = $wrapper.find(' > .navigation');
			var $main = $wrapper.find(' > .main');
			var $topContent = $('.main.top');

			var winH = $(window).height(),
							bodyH = $('body').height(),
							headerH = $header.height(),
							navH = (0 < $nav.size()) ? $nav.height() : 0;

			if (!LMPS.isValidityViewport()) {
				if (Math.abs(window.orientation) === 0) {
					winH = winH * 1920 / LMPS.portraitWidth;
				} else {
					winH = winH * 1920 / LMPS.landscapeWidth;
				}
			}

			if (bodyH < winH) {
				// $wrapper.css('height', winH + 'px');
				// $main.css('height', (winH - headerH - navH) + 'px');

				if (0 < $topContent.size()) {
					var offset = $topContent.offset().top;
					$topContent.css('height', (winH - offset) + 'px');
				}
			}
		}).trigger('resize');

		// モーダルの情報をセット
		// （別途開発側で実装する場合は削除してください）
		LMPS.setModal();

	}, 250);

	// リンクやボタンがクリックされた時の処理（体裁を変更）
	$('.wrapper > .header a, .wrapper > .header button, .wrapper > .navigation a, .wrapper > .navigation button, .wrapper > .main a, .wrapper > .main button, .wrapper > .modal a, .wrapper > .modal button').on({
		'touchstart mousedown': function (e) {
			$(this).addClass('is-on');
		},
		'touchend mouseup': function (e) {
			$(this).removeClass('is-on');
		},
	});

	// メニューの開閉ボタンがクリックされた時の処理
	LMPS.isOpeningMenu = false;
	$('.wrapper > .header .button-menu.menu').on('click', function () {
		if (LMPS.isOpeningMenu) {
			return;
		}

		LMPS.isOpeningMenu = true;

		if (!$('.wrapper > .header').hasClass('is-open')) {

			// メニューが存在する場合は、表示幅に合わせてメニューの表示エリア（幅・高さ）を定義する
			var $menuWrap = $('.wrapper > .header .menu-wrap');
			if ($menuWrap.size() > 0) {
				var defW = $menuWrap.width();
				var h = $('body').outerHeight(),
								winH = window.innerHeight;

				if (!LMPS.isValidityViewport()) {
					if (Math.abs(window.orientation) === 0) {
						winH = winH * 1920 / LMPS.portraitWidth;
					} else {
						winH = winH * 1920 / LMPS.landscapeWidth;
					}
				}

				if (h < winH) {
					h = winH;
				}

				var offset = $('.wrapper > .header .header-frame').offset().left;
				$menuWrap.css({
					'width': (offset + defW) + 'px',
					// 'height': h + 'px'
				});
			}
		}

		$('.wrapper > .header').toggleClass('is-open');

		setTimeout(function () {
			LMPS.isOpeningMenu = false;
		}, 500);
	});

	// ホームボタンがクリックされた時の処理
	$('.wrapper > .header .button-menu.home').on('click', function (e) {
		// メニューが表示されている場合は、イベントをキャンセル
		if ($('.wrapper > .header').hasClass('is-open')) {
			e.preventDefault();
			return;
		}
	});

	// 表示中のナビゲーションメニューがクリックされた時の処理
	$('.wrapper > .navigation .grid a').on('click', function (e) {
		if ($(this).hasClass('current')) {
			e.preventDefault();
			return;
		}
	});

	// 表示中のヘッダーナビゲーションメニューがクリックされた時の処理
	$('.wrapper .header-navigation .navigation-links a').on('click', function (e) {
		if ($(this).hasClass('current')) {
			e.preventDefault();
			return;
		}
	});

	// タブがクリックされた時の処理
	$('.wrapper > .main .js-tab').each(function () {
		var $tab = $(this);
		var $tabButton = $tab.find('.tab-button-wrap .tab-button');
		var $tabContent = $tab.find('.tab-content-wrap .tab-content');

		var checkTabExist = function (name) {
			if (name === undefined) {
				return false;
			}

			if ($tabContent.filter('[data-tabcontent=' + name + ']').size() === 0) {
				return false;
			}
			return true;
		}

		// 初期値を設定
		if ($tabButton.filter('.current').size() === 0) {
			var $firstTab = $tabButton.eq(0);
			var tabName = $firstTab.data('tabname');

			if (!checkTabExist(tabName)) {
				return;
			}

			$tabButton.eq(0).addClass('current');
			$tabContent.removeClass('current');
			$tabContent.filter('[data-tabcontent=' + tabName + ']').addClass('current');

			var maxH = 0;
			$tabContent.each(function () {
				var h = $(this).outerHeight();
				if (maxH < h) {
					maxH = h;
				}
			});
			if (maxH !== 0) {
			}
		}

		// タブクリック時のイベントを定義
		$tabButton.on('click', function (e) {
			var $clickTab = $(this);
			var tabName = $clickTab.data('tabname');

			// 表示中のタブの場合は処理を中止
			if ($clickTab.hasClass('current')) {
				return;
			}

			if (!checkTabExist(tabName)) {
				return;
			}

			$tabButton.removeClass('current');
			$clickTab.addClass('current');
			$tabContent.removeClass('current');
			$tabContent.filter('[data-tabcontent=' + tabName + ']').addClass('current');
		});
	});

	$(window).load(function () {
		// ページ内に簡易カルーセルが存在する時の処理
		$('.wrapper > .main .js-carousel').each(function () {
			var $carousel = $(this);

			var $wrapper = $carousel.find('.carousel-wrapper'),
							$items = $carousel.find('.carousel-item'),
							$btnPrev = $carousel.find('.carousel-button-prev'),
							$btnNext = $carousel.find('.carousel-button-next');

			if ($wrapper.size() === 0 || $items.size() === 0) {
				return;
			}

			var w = $carousel.width();
			$wrapper.width(w * $items.size());

			var defItem = $items.filter('.current').index();
			if (defItem < 0) {
				defItem = 0;
			}

			var showNo = 0;
			var isSlide = false;

			// カルーセル整形処理
			var setCarouselItem = function (no) {
				isSlide = true;

				$wrapper.css({
					'-webkit-transform': 'translate3d(' + (-1 * w * no) + 'px, 0, 0)',
					'transform': 'translate3d(' + (-1 * w * no) + 'px, 0, 0)'
				});

				if (no === 0) {
					$btnPrev.addClass('hide');
				} else {
					$btnPrev.removeClass('hide');
				}

				if (no === $items.size() - 1) {
					$btnNext.addClass('hide');
				} else {
					$btnNext.removeClass('hide');
				}

// 20180523_将来資金収支分析_グラフ表示の不具合対応_start
                // 表示していない方のエリアを取得
				var $panel_list = $('.wrapper .main .content-panel');
				var $panel_f = $panel_list.not('.current');

				var $wrapper_f = $panel_f.find('.carousel-wrapper'),
									$items_f = $panel_f.find('.carousel-item'),
									$btnPrev_f = $panel_f.find('.carousel-button-prev'),
									$btnNext_f = $panel_f.find('.carousel-button-next');

                // 保守型、安定型、成長型の同期を取る
				$wrapper_f.css({
					'-webkit-transform': 'translate3d(' + (-1 * w * no) + 'px, 0, 0)',
					'transform': 'translate3d(' + (-1 * w * no) + 'px, 0, 0)'
				});

				if (no === 0) {
					$btnPrev_f.addClass('hide');
				} else {
					$btnPrev_f.removeClass('hide');
				}

				if (no === $items_f.size() - 1) {
					$btnNext_f.addClass('hide');
				} else {
					$btnNext_f.removeClass('hide');
				}
// 20180523_将来資金収支分析_グラフ表示の不具合対応_end
				showNo = no;

				setTimeout(function () {
					isSlide = false;
				}, 250);

				// 選択した情報をどこかしらに格納する場合は、ここから処理を追記

// 20180523_将来資金収支分析_グラフ表示の不具合対応_start
/**
				if ($carousel[0].id === "c1") {
					LIFEPLAN.carousel_1 = no;
				} else if ($carousel[0].id === "c2") {
					LIFEPLAN.carousel_2 = no;
				}
*/
				// セッションストレージに選択値を保存
				LIFEPLAN.carousel = no;
// 20180523_将来資金収支分析_グラフ表示の不具合対応_end

				// 2021/03/31 「将来資金収支分析」画面を表示すると、3回ずつ計算ロジックが実行される不具合の対応。changeInvest()をここでは呼ばないよう変更。
				//LIFEPLAN.changeInvest();

			};

			setCarouselItem(defItem);

			$btnPrev.on('click', function () {
				if (isSlide) {
					return;
				}

// 20180523_将来資金収支分析_グラフ表示の不具合対応_start
//				var setNo = showNo - 1;
				// セッションストレージから選択値を取得
				var setNo = LIFEPLAN.carousel - 1;
// 20180523_将来資金収支分析_グラフ表示の不具合対応_end
				if (setNo < 0) {
					return;
				}

				setCarouselItem(setNo);
				// 2021/03/31 「将来資金収支分析」画面を表示すると、3回ずつ計算ロジックが実行される不具合の対応。changeInvest()を前へボタンクリック時に呼ぶように変更。
				LIFEPLAN.changeInvest();
			});

			$btnNext.on('click', function () {
				if (isSlide) {
					return;
				}

// 20180523_将来資金収支分析_グラフ表示の不具合対応_start
//				var setNo = showNo + 1;
				// セッションストレージから選択値を取得
				var setNo = LIFEPLAN.carousel + 1;
// 20180523_将来資金収支分析_グラフ表示の不具合対応_end
				if ($items.size() <= setNo) {
					return;
				}
				setCarouselItem(setNo);
				// 2021/03/31 「将来資金収支分析」画面を表示すると、3回ずつ計算ロジックが実行される不具合の対応。changeInvest()を次へボタンクリック時に呼ぶように変更。
				LIFEPLAN.changeInvest();
			});
		});
	});
});
