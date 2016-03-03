(function($) {
	$.fn.canimate = function(options) {
		var defaults = {
			beginIndex : 1,		//默认从第1张图片开始
			totalFrames : 100,		//定义图片的张数
			fps : 30,
			preload : false,
			touchStop : true,
			reverse: false,
		};

		var nameOptions = {
			numbersFirst : false,
			imagePrefix : 'frame',
			filetype : 'png'
		};

		var options = $.extend(defaults, nameOptions, options),
			updaterPic = 0,
			touchMoveLocation = 0,
			afterMove = false,
			startPoint = 1,
			touch = {};
			
		return this.each(function() {
			if (typeof (window['updater']) != "undefined") {
				updater.stop();
			}

			isPlaying = true;

			$totalFrames = options.totalFrames;
			$filetype = '.' + options.filetype;
			$image = $(this).find('img');
			$interval = 1000 / options.fps;

			$currentFrame = $(this).find('img').attr('src');	//images/360/test0001.png
			$buildFrame = $currentFrame.replace(options.imagePrefix, '');	//images/360/0001.png
			$buildFrame = $buildFrame.replace('.' + options.filetype, '');	//images/360/0001
			$buildFrame = $buildFrame.split('/');	//images,360,0001
			$numberIndex = $buildFrame.length;
			$builtFrame = parseInt($buildFrame[$numberIndex - 1]);	//$buildFrame[$numberIndex - 1] : 0001
			$nextFrameLocation = "";	// 获取下一张图片的位置
			$currentLocation = 1;
			for ($directory = 0, $max = $buildFrame.length - 1; $directory < $max; $directory++) {
				$nextFrameLocation = $nextFrameLocation + $buildFrame[$directory] + '/';
			}

			if (options.preload == false) {
				updater($builtFrame, $nextFrameLocation, $filetype, options, $interval);
			} else {
				preload($builtFrame, $nextFrameLocation, $filetype, options, $interval);
			}
			
			if (options.touchStop) {
				$(document).bind('touchstart', onHandler);
				$(document).bind('touchmove', onHandler);
				$(document).bind('touchend', onHandlerEnd);
			}
		});

        function onHandler(event){
            if(event.type == 'touchstart'){
            	touch.x1 = touch.x2 = 0;
                updaterPic.stop();
                afterMove = false;
            }else if(event.type == 'touchmove'){
                if(event.touches.length == 1){
                	event.preventDefault();
                	updaterPic.stop();
                	afterMove = true;
                	touch.x1 = event.changedTouches[0].clientX;
                	touchMoveLocation = setTimeout(function() {
                		touch.x2 = event.changedTouches[0].clientX;
                		clearTimeout(touchMoveLocation);
                	}, 5);
                	
                    if(touch.x2 < touch.x1){
        				options.reverse = true;
        				imageUpdate(startPoint, $nextFrameLocation, $filetype, options);
						if(startPoint > options.beginIndex) {
							startPoint --;
						} else {
							startPoint = options.totalFrames;
						}
                    }else if(touch.x2 > touch.x1) {
        				options.reverse = false;
        				imageUpdate(startPoint, $nextFrameLocation, $filetype, options);
						if(startPoint < options.totalFrames) {
							startPoint ++;
						}else{
							startPoint = options.beginIndex;
						}
                    }
                }
            }
        }
        
        function onHandlerEnd(){
        	if(afterMove){
        		updater(startPoint, $nextFrameLocation, $filetype, options, $interval / 3);
        	}
        }
		
		function zeroPad(num, count) {
			var numZeropad = num + '';
			while (numZeropad.length < count) {
				numZeropad = "0" + numZeropad;
			}
			return numZeropad;
		}

		function preload($builtFrame, $nextFrameLocation, $filetype, options, $interval) {
			$('body').prepend('<div class="canimate_preloader"></div>');
			for ($zeroFrame = 0, $zeroFrame = $builtFrame; $zeroFrame <= options.totalFrames; $zeroFrame++) {
				$nextFrameNumber = zeroPad($zeroFrame, 4);
				$nextFrame = $nextFrameLocation + options.imagePrefix + $nextFrameNumber + $filetype;
				$('.canimate_preloader').append('<img class="' + $zeroFrame + '" src="' + $nextFrame + '"/>');
				$('.canimate_preloader img').css({height : 0, width : 1});
			}

			$('.canimation').prepend('<div style="text-align:center;" class="canimate_loadMessage">加载中...</div>');
			$image.css({
				opacity : 0
			});

			var totalLoaded = 0;
			$('.canimate_preloader img').bind('load', function() {
				totalLoaded++;
				$('.canimate_loadMessage').text('加载' + totalLoaded + ' / ' + options.totalFrames + '图片');
				if (totalLoaded >= options.totalFrames) {
					$('.canimate_loadMessage').hide();
					if (typeof (window['updater']) == "undefined") {
						updater($builtFrame, $nextFrameLocation, $filetype, options, $interval);
					}
					$image.animate({
						opacity : 1
					}, 200);
				}
			});
		}

		function updater($builtFrame, $nextFrameLocation, $filetype, options, $interval) {
			updaterPic = $.timer(function() {
				imageUpdate($builtFrame, $nextFrameLocation, $filetype, options);
				if(options.reverse == false){
					if ($builtFrame < options.totalFrames) {
						$builtFrame++;
					} else {
						$builtFrame = options.beginIndex;
					}
				} else {
					if ($builtFrame > options.beginIndex) {
						$builtFrame--;
					} else {
						$builtFrame = options.totalFrames;
					}
				}
			}, $interval, true);
		}

		function imageUpdate($builtFrame, $nextFrameLocation, $filetype, options) {
			$nextFrameNumber = zeroPad($builtFrame, 4);
			$nextFrame = $nextFrameLocation + options.imagePrefix + $nextFrameNumber + $filetype;
			$image.attr('src', $nextFrame);
			startPoint = $builtFrame;
		}
	};
})(Zepto);