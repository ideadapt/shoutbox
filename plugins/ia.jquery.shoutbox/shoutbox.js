/**
 * shoutbox
 * Copyright (C) 2010 Ueli Kunz
 *
 * This program is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation, either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this program. If not, please visit the Free
 * Software Foundation website at http://www.gnu.org/licenses/.
 *
 * PHP version 6
 * @copyright  Ueli Kunz 2011
 * @author     Ueli Kunz <kunz@ideadapt.net>
 * @package    ia.jquery.shoutbox
 * @license    LGPL
 */
;
(function($) {
	var s;
	var cId;
	var latestId = -1;
	var timer;
	var isInit = true;

	var defaults = {
		serverScript : '/shoutbox.php',
		interval : 3000,
		isVisible : true,
		cId : "shoutbox_outer",
		cookieName : "shoutbox",
		labels : {
			validation : {
				missingText : "enter message text first"
			}
		}
	};
	$.iaShoutbox = function(settings) {
		
		function init() {
			s = $.extend( {}, defaults, settings);
			cId = "#" + s.cId;

			// get container html from server and add it to document
			sendRequest( {
				'act' : 'init'
			});
		}

		function postMessage(e) {
			if (validate()) {
				disableInput();

				sendRequest( {
					'act' : 'post',
					'text' : $(cId + " #txt_text").val()
				});
			}
			e.preventDefault();
			return false;
		}

		function createContainer(res) {
			// add html to body
			$("body").append($(res.content).attr("id", s.cId));
			latestId = res.maxId;
			$(cId + " form").submit(postMessage);
			/*$(cId + " form #txt_text").focus(function() {
				if (s.isVisible == false) {
					showHide();
				}
			});*/
			$(cId + " #show_hide_button a").click(showHide);
			$(cId).mouseover(activate).mouseout(deactivate);

			if ($.cookie(s.cookieName)) {
				safedVisibility = $.cookie(s.cookieName) == "isVisible";
				if (s.isVisible != safedVisibility) {
					showHide(true);
				}
			}
			isInit = false;
			setTimer();
		}

		function updateHistory(res) {
			enableInput();
			// only insert html message in shoutbox container if there are new
			// messages
			if (res.content != '') {
				latestId = res.maxId;

				$(res.content).hide().addClass("entry_new").prependTo(
						cId + " #msg_history").fadeIn("slow");
				setTimeout(function() {
					$(cId + " #msg_history .entry.entry_new").removeClass(
							"entry_new");
				}, 3000);

				$(cId + " form #txt_text").val("");
			}
			setTimer();
		}

		function setTimer() {
			timer = setTimeout(function() {
				sendRequest( {
					'act' : 'load',
					'minId' : latestId
				});
			}, s.interval);
		}

		function notify(res) {
			if (res.status == 'error') {
				// stop polling if error occured
				clearTimeout(timer);
				res.content = "server error";
			}		
		
			// display server message
			$(cId + " #notification").html(
					$("<span>").html(res.content).addClass(
							"status_" + res.status));
		}

		function ajaxError(req, status, err) {
			notify( {
				'status' : 'error',
				'content' : status || 'server error'
			});
		}

		function handleResponse(content, res) {

			var o = JSON.parse(content);
			var act = o.act;
			var callback;

			if (o.status != 'ok') {
				notify(o);
			} else {
				if (act == 'init') {
					callback = createContainer;
				} else if (act == 'load') {
					callback = updateHistory;
				} else if (act == 'post') {
					callback = notify;
				}
				callback(o);
			}
		}

		function sendRequest(params) {
					
			$.ajax( {
				type : "POST",
				url : s.serverScript,
				data : {
					'data' : JSON.stringify(params)
				},
				success  : handleResponse,
				error    : ajaxError,
				dataType : "text"
			});
		}

		function activate() {
			$(cId).removeClass("sb_inactive");
		}
		function deactivate() {
			$(cId).addClass("sb_inactive");
		}
		function showHide() {

			if (s.isVisible == true) {
				if(!isInit){
					$(cId).animate( {
						right: "-=311px"
					}, 1000, 'swing');
				}
				$(cId).addClass("sb_hidden");
			} else {
				if(!isInit){
					$(cId).animate( {
						right: "+=311px"
					}, 600, 'swing');
				}
				$(cId).removeClass("sb_hidden");
				
				$(cId + " form #txt_text").focus();
			}
			s.isVisible = !s.isVisible;
			// save visibility to cookie
			$.cookie(s.cookieName, s.isVisible ? "isVisible" : "isNotVisible");
		}

		function validate() {
			$(cId + " #notification").html("");
			if ($(cId + " #txt_text").val() == "") {
				notify( {
					'status' : 'validation_error',
					'content' : s.labels.validation.missingText
				});
			}
			return $(cId + " #notification span").length == 0;
		}

		function disableInput() {
			$(cId + " form input").attr("disabled", "disabled");
			$(cId + " form").addClass("disabled");
		}

		function enableInput() {
			if ($(cId + " form.disabled").length > 0) {
				$(cId + " form input").removeAttr("disabled");
				$(cId + " form").removeClass("disabled");
				
				// hack to reenable textbox cursor blinking
				$(cId + " form #btn_save").focus();
				$(cId + " form #txt_text").focus();				
			}
		}

		init();
	};

})(jQuery);

/*
 * usage: 1 filter all select (i.e., their options) in document and only show
 * option if its text matches the pattern entered in txtFilter
 * $(document).ready(function(){ $.iaShoutbox({}); });
 */