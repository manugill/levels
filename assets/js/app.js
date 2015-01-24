(function ($, sr, undefined) {
	"use strict";

	/* Smooth State Setup --- */
	var $body = $('html, body'),
	$main = $('#main'),
	content = $main.smoothState({
		prefetch: false,
		pageCacheSize: 3,
		blacklist : ".no-ss, .no-smoothstate, [target]",
		onStart: {
			duration:800,
			render: function (url, $container) {
				$body.animate({
					scrollTop: 0
				}, 600, function(){
					content.toggleAnimationClass('exiting');
				});

				$('.container').addClass('out');
				$('.post-nav').addClass('out');

			}
		},
		onProgress: {
			duration:0,
			render: function (url, $container) {
				content.toggleAnimationClass('exiting');
			}
		},
		callback: function() {
			initEverything();
		}
	}).data('smoothState');


	/* Ghost Post Nav Hack --- */
	var NextPrevLinksModule = function(){
		var curr,
				$prevLink,
				$nextLink;
 
		return {
			init: function(){
				curr = $('.post-uuid').html();
				$prevLink = $('.post-nav.next a');
				$nextLink = $('.post-nav.prev a');
 
				this.parseRss();
			},
			// creates previous and next links
			createLinks: function(items){
				for (var i = 0; i < items.length; i++){
					var uuid = $(items[i]).find('guid').text();
					if (uuid === curr){
						console.log();
						if (i < items.length - 1) {
							var link = $(items[i+1]).find('link').text(),
									title = $(items[i+1]).find('title').text();
							$prevLink.attr('href', link);
							$prevLink.find('h2').html(title);

							$prevLink.find('.bg').load(link + ' .post-bg', function(){
								$(this).attr('style', $prevLink.find('.post-bg').attr('style'));
							});

							$prevLink.show();
						}
						if (i > 0) {
							var link = $(items[i-1]).find('link').text(),
									title = $(items[i-1]).find('title').text();
							$nextLink.attr('href', link);
							$nextLink.find('h2').html(title);

							$nextLink.find('.bg').load(link + ' .post-bg', function(){
								$(this).attr('style', $nextLink.find('.post-bg').attr('style'));
							});

							$nextLink.show();
						}
					}
				}
			},
			// iteratively parses rss feeds to generate posts object
			parseRss: function(page, items, lastId){
				var self = this,
						page = page || 1
						items = items || undefined,
						lastId = lastId || '';
				$.get('/rss/' + page, function(data){
					var posts = $(data).find('item');
					var currId;
					if (posts.length > 0) currId = $(posts[0]).find('guid').text();
 
					if (currId === lastId){
						// if this page has already been parsed, create links
						self.createLinks(items);
					} else {
						// if not, continue parsing posts
						items = items ? items.add(posts) : posts;
						lastId = currId;
						self.parseRss(page+1, items, lastId);
					}
				});
			}
		};
	}();

	/* Make image full width if size is larger than screen --- */
	function updateImageWidth() {
		var $this = $(this),
				$postContent = $(".post-content"),
				contentWidth = $postContent.outerWidth(), // Width of the content
				imageWidth = this.naturalWidth; // Original image resolution
		if (imageWidth >= contentWidth)
			$this.addClass('full-img');
		else
			$this.removeClass('full-img');
	}

	function updateAllImages() {
		var $img = $("img").on('load', updateImageWidth);
		$img.each(updateImageWidth);
	}
	$(document).ready(function() {
		$(window).resize(updateAllImages);
	});

	/* Init Everything Together (to use with smoothstate callbacks) */
	function initEverything() {
		updateAllImages();

		$('.post-content').fitVids();

		// Custom Post Nav
		if ( $('.wrapper').hasClass('post-template') )
			NextPrevLinksModule.init();

		// Animated Scroll
		$('a[href*=#]:not([href=#])').click(function() {
			if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') || location.hostname == this.hostname) {
				var target = $(this.hash);
				target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
				
				if (target.length) {
					$('html,body').animate({
						scrollTop: target.offset().top
					}, 1200);
					return false;
				}
			}
		});
	}
	initEverything();

})(jQuery, 'smartresize');