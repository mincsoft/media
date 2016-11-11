define("oldcrm/js/apps/checkinmap/checkinmap", ["core/services/2.0/rk_userService", "core/utils/menuUtil", "platform/manager/formMgr_designer", "platform/manager/formMgr_mdesigner", "platform/manager/tpl/status_300001.tpl", "platform/manager/tpl/status_300002.tpl", "platform/manager/formMgr", "platform/manager/dataMgr", "core/i18n/all_{locale}", "core/rk", "core/widgets/xsspanel/xssUtil", "page/tmpl/tpl_loading_large.tpl", "core/rk.jq", "oa/tmpl/tpl_oa_curtain.tpl", "oa/tmpl/tpl_oa_content.tpl", "core/rk.oa", "core/rk.error", "core/rk.bizcode", "core/rk.crm", "core/rkloader", "core/widgets/tmpl/twinCalendar.tpl", "core/widgets/input/statisticCalendar", "oldcrm/tmpl/scrpt_tmpl_checkinmap.tpl"], function (require, exports, module) {
    "use strict";
    var rk = require("core/rkloader");
    var statisticCalendar = require("core/widgets/input/statisticCalendar");
    var startDate = "";
    var userId = "";
    $.widget("rk.checkinmapmodel", {
        _create: function () {
            var me = this;
            me._render();
            me._bind()
        }, _bind: function () {
            this.mapMarkerIndex = 101;
            var me = this;
            var elem = me.element;
            $("#wrStatisticUser").multipeopleselector();
            elem.find(".goal_top_title .view_now").on("click", function (event) {
                elem.find(".goal_top_title .work-report-div").toggle();
                return false
            });
            var $chartCal = $("#analysisChartCalendar").datepicker({
                changeMonth: true,
                changeYear: true,
                dateFormat: "yy-mm-dd",
                onSelect: function () {
                    commonSearch()
                }
            });
            var time = moment((new Date).getTime()).format("YYYY-MM-DD");
            $("#analysisChartCalendar").val(time);
            elem.find("#checkin_date_after").on("click", function (event) {
                commonSearch("after")
            });
            elem.find("#checkin_date_prev").on("click", function (event) {
                commonSearch("prev")
            });
            $("#userTree").singlepeopleselector({position: {my: "left top+2"}, menuWidth: 300});
            $(".ui-autocomplete-input").val(SESSION.user.name);
            document.onkeydown = function () {
                if (event.keyCode == 13) {
                    commonSearch()
                }
            };
            elem.find(".search-current-position").on("click", function (event) {
                commonSearch()
            });
            elem.find("#mapContainer").on("click", function (event) {
                var $target = $(event.target);
                var markerClose = $target.closest(".track_close");
                if (markerClose.length > 0) {
                    var trackId = markerClose.attr("data");
                    var currMarkers = me.currMarkers[trackId];
                    if (currMarkers) {
                        currMarkers.close()
                    }
                }
            });
            function _DateAfter(d) {
                d = new Date(d);
                d = +d + 1e3 * 60 * 60 * 24;
                d = new Date(d);
                d = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + (d.getDate() + 0)).slice(-2);
                return d
            }

            function _DatePrev(d) {
                d = new Date(d);
                d = +d - 1e3 * 60 * 60 * 24;
                d = new Date(d);
                d = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + (d.getDate() + 0)).slice(-2);
                return d
            }

            function commonSearch(flag) {
                var startDate;
                var user = $("#userTree").singlepeopleselector("val");
                userId = "";
                if (user == null) {
                    if ($("#userTree").val() == SESSION.user.name) {
                        userId = SESSION.user.id
                    }
                } else {
                    userId = user.value
                }
                var inputValue = $("#analysisChartCalendar").val();
                var today = moment((new Date).getTime()).format("YYYY-MM-DD");
                if (inputValue == rk.i18n("CHECK_IN_MAP_TODAY")) {
                    if (flag == "after") {
                        startDate = _DateAfter(today);
                        $("#analysisChartCalendar").val(startDate)
                    } else if (flag == "prev") {
                        $("#analysisChartCalendar").val(rk.i18n("CHECK_IN_MAP_YESTERDAY"));
                        startDate = _DatePrev(today)
                    } else {
                        startDate = today
                    }
                } else if (inputValue == rk.i18n("CHECK_IN_MAP_YESTERDAY")) {
                    if (flag == "after") {
                        $("#analysisChartCalendar").val(rk.i18n("CHECK_IN_MAP_TODAY"));
                        startDate = today
                    } else if (flag == "prev") {
                        startDate = _DatePrev(_DatePrev(today));
                        $("#analysisChartCalendar").val(startDate)
                    } else {
                        startDate = _DatePrev(today)
                    }
                } else {
                    var newValue = $("#analysisChartCalendar").val();
                    var newInputValue2 = new Date(newValue.replace(/-/g, "/"));
                    var minus = (new Date).getTime() - newInputValue2.getTime();
                    var time = parseInt(minus / (1e3 * 60 * 60 * 24));
                    if (flag == "after") {
                        if (time == 2) {
                            startDate = _DateAfter(newValue);
                            $("#analysisChartCalendar").val(rk.i18n("CHECK_IN_MAP_YESTERDAY"))
                        } else {
                            startDate = _DateAfter(newValue);
                            $("#analysisChartCalendar").val(startDate)
                        }
                    } else if (flag == "prev") {
                        if (time == 0) {
                            startDate = today;
                            $("#analysisChartCalendar").val(rk.i18n("CHECK_IN_MAP_TODAY"))
                        } else {
                            startDate = _DatePrev(newValue);
                            $("#analysisChartCalendar").val(startDate)
                        }
                    } else {
                        startDate = inputValue
                    }
                }
                me._searchTrackPosition(userId, startDate);
                if ($("#analysisChartCalendar").val() == _DatePrev(today)) {
                    $("#analysisChartCalendar").val(rk.i18n("CHECK_IN_MAP_YESTERDAY"))
                } else if ($("#analysisChartCalendar").val() == today) {
                    $("#analysisChartCalendar").val(rk.i18n("CHECK_IN_MAP_TODAY"))
                }
            }

            commonSearch()
        }, openLoading: function () {
            $("#oa-shade").after('<div class="large-loading">' + '<div ><div class="f_circleG" id="frotateG_01"></div><div class="f_circleG" id="frotateG_02"></div><div class="f_circleG" id="frotateG_03"></div><div class="f_circleG" id="frotateG_04"></div><div class="f_circleG" id="frotateG_05"></div><div class="f_circleG" id="frotateG_06"></div><div class="f_circleG" id="frotateG_07"></div><div class="f_circleG" id="frotateG_08"></div></div>' + "</div>");
            $("#oa-shade").show()
        }, closeLoading: function () {
            var after = $("#oa-shade").next();
            if (after.hasClass("large-loading")) {
                after.remove()
            }
            $("#oa-shade").hide()
        }, _searchTrackPosition: function (userIds, startDate) {
            startDate = new Date(startDate.replace(new RegExp("-", "gm"), "/")).getTime();
            this.mapObj.clearMap();
            this.mapObj.setZoom(12);
            this.mapObj = new AMap.Map("mapContainer", {resizeEnable: true, view: new AMap.View2D({zoom: 12})});
            var me = this;
            var url = "/json/crm_checkinmap/searchCheckinTrack.action";
            this.openLoading();
            $.postJson(url, {userIds: userIds, startDate: startDate}).done(function (json) {
                me.closeLoading();
                if (json.status != 0) {
                    $.msg(rk.i18n("REQUEST_ERROR"));
                    return
                }
                var parentDiv = document.getElementsByClassName("user-info-detail");
                var childDiv = $(parentDiv)[0].getElementsByClassName("checkin-map-div");
                var childDivLen = childDiv.length;
                var parentDio = $(".user-info-detail");
                if (childDivLen > 0) {
                    for (var i = 0; i < childDivLen; i++) {
                        $(parentDiv)[0].removeChild(childDiv[0])
                    }
                }
                if (json.data.trackData.length == 0) {
                    var n2 = document.createElement("div");
                    n2.className = "checkin-map-div checkin-map-count";
                    n2.innerHTML = "无签到信息";
                    parentDio.append(n2)
                } else {
                    var userinfo = document.createElement("div");
                    userinfo.className = "checkin-map-div  checkin-map-count";
                    var u2 = document.createElement("span");
                    userinfo.appendChild(u2);
                    parentDio.append(userinfo);
                    var originalLength = json.data.trackData.length;
                    var checkinLength = json.data.trackData.length;
                    var count = 0;
                    var trackData = json.data.trackData;
                    for (var k = 0; k < originalLength; k++) {
                        var track = $(trackData).get(originalLength - k - 1);
                        if (track.longitude == "" && track.latitude == "") {
                            checkinLength--;
                            count++
                        } else {
                            me._drawDialogs(parentDio, k - count, track)
                        }
                    }
                    u2.innerHTML = "共签到" + originalLength + "次";
                    me._addTrackPoints(checkinLength, json.data)
                }
                $(".user-info-detail .checkin-map-div  a").on("mouseover", function (event) {
                    var index = this.firstChild.innerHTML;
                    $(".checkin-map-div-span1").css("background", "url(/static/img/v3.0/industryFMCG/checkinmap_map_left_1.png) center center no-repeat");
                    this.firstChild.style.backgroundImage = "url(/static/img/v3.0/industryFMCG/checkinmap_map_left_2.png)";
                    var allTrack = $(".track-point-green");
                    $.each(allTrack, function (i, track) {
                        if ($(allTrack[i]).html().trim() == index) {
                            this.style.backgroundImage = "url(/static/img/v3.0/industryFMCG/checkinmap_map_right_2.png)";
                            $(this).parent().parent().css("z-index", "9999")
                        }
                    });
                    var dir = $(this.childNodes[2]).attr("dir");
                    var lastMarker = dir.split("###");
                    if (lastMarker[0] != "" && lastMarker[1] != "") {
                        me.mapObj.setCenter(lastMarker);
                        me.mapObj.setZoom(18)
                    }
                }).on("mouseout", function () {
                    this.firstChild.style.backgroundImage = "url(/static/img/v3.0/industryFMCG/checkinmap_map_left_1.png)";
                    var allTrack = $(".track-point-green");
                    $.each(allTrack, function (i, track) {
                        this.style.backgroundImage = "url(/static/img/v3.0/industryFMCG/checkinmap_map_right_1.png)";
                        $(this).parent().parent().css("z-index", "1")
                    })
                })
            })
        }, _drawDialogs: function (parentDio, index, track) {
            var root = parentDio;
            var m = document.createElement("div");
            m.className = "checkin-map-div";
            var a = document.createElement("a");
            a.className = "checkin-map-a-small";
            m.appendChild(a);
            var n1 = document.createElement("span");
            n1.className = "checkin-map-div-span1";
            n1.innerHTML = index + 1;
            a.appendChild(n1);
            var n2 = document.createElement("span");
            n2.className = "checkin-map-div-span2";
            n2.title = rk.htmlEscape(track.location);
            n2.innerHTML = rk.htmlEscape(track.location);
            a.appendChild(n2);
            var n3 = document.createElement("span");
            n3.dir = track.longitude + "###" + track.latitude;
            n3.className = "checkin-map-div-span3";
            n3.innerHTML = rk.htmlEscape(track.locationDetail);
            a.appendChild(n3);
            var n4 = document.createElement("span");
            n4.className = "checkin-map-div-span4";
            n4.innerHTML = Globalize.format(new Date(eval(track.startTime)), "yyyy-MM-dd HH:mm");
            a.appendChild(n4);
            root.append(m);
            return root
        }, _getTrackHtml: function (visitRecord, index) {
            return '<div class="track-point-green  track-point-map" >' + index + " </div>"
        }, _addTrackPoints: function (checkinLength, visitRecords) {
            var me = this;
            if (!this.mapCount) {
                this.mapObj = new AMap.Map("mapContainer", {resizeEnable: true, view: new AMap.View2D({zoom: 12})});
                this.mapObj.plugin(["AMap.ToolBar"], function () {
                    var toolBar = new AMap.ToolBar;
                    me.mapObj.addControl(toolBar)
                });
                this.mapCount = 1
            }
            me.currMarkers = {};
            var allPointMap = {};
            var lastMarker = [];
            var count = 0;
            $.map(visitRecords.trackData, function (visitRecord, index) {
                if (visitRecord.longitude != "" && visitRecord.latitude != "") {
                    var pointHtml = me._getTrackHtml(visitRecord, checkinLength - count++);
                    var infoHtml = me._getInfoWindow(visitRecord);
                    var lng = Number(visitRecord.longitude) * 1e6;
                    var lat = Number(visitRecord.latitude) * 1e6;
                    var lngString = lng + "";
                    var latString = lat + "";
                    var lenLng = lngString.length == 9 ? 7 : 6;
                    var lenLat = latString.length == 9 ? 7 : 6;
                    var lngString = lngString.substr(0, lenLng);
                    var latString = latString.substr(0, lenLat);
                    if (allPointMap[lngString + "," + latString]) {
                        lng += Math.round(Math.random() * 150);
                        lat += Math.round(Math.random() * 150)
                    }
                    allPointMap[lngString + "," + latString] = 1;
                    lng = lng / 1e6;
                    lat = lat / 1e6;
                    var lngLat = new AMap.LngLat(lng, lat);
                    lastMarker[0] = lng;
                    lastMarker[1] = lat;
                    var currMarker = new AMap.Marker({
                        map: me.mapObj,
                        content: pointHtml,
                        animation: "AMAP_ANIMATION_DROP",
                        position: lngLat,
                        offset: {x: -23, y: -63}
                    });
                    var infoWindow = new AMap.InfoWindow({
                        isCustom: true,
                        content: infoHtml,
                        autoMove: false,
                        offset: {x: 0, y: -55}
                    });
                    me.currMarkers["track_" + visitRecord.id] = infoWindow;
                    var bindMouseOverEvent = function (e) {
                        $(".checkinmap-track-content").css("display", "inline-block");
                        currMarker.setzIndex(me.mapMarkerIndex++);
                        infoWindow.open(me.mapObj, currMarker.getPosition());
                        $($(this.He.content).get(0)).css("backgroundImage", "url(/static/img/v3.0/industryFMCG/checkinmap_map_right_2.png)");
                        var selectedIndex = $(this.He.content).html().trim();
                        var allTrack = $(".track-point-green");
                        $.each(allTrack, function (i, track) {
                            if ($(allTrack[i]).html().trim() == selectedIndex) {
                                this.style.backgroundImage = "url(/static/img/v3.0/industryFMCG/checkinmap_map_right_2.png)";
                                $(this).parent().parent().css("z-index", "9999")
                            }
                        })
                    };
                    var bindMouseOutEvent = function (e) {
                        $(".checkinmap-track-content").css("display", "none");
                        var allTrack = $(".track-point-green");
                        $.each(allTrack, function (i, track) {
                            this.style.backgroundImage = "url(/static/img/v3.0/industryFMCG/checkinmap_map_right_1.png)";
                            $(this).parent().parent().css("z-index", "1")
                        })
                    };
                    AMap.event.addListener(currMarker, "mouseover", bindMouseOverEvent);
                    AMap.event.addListener(currMarker, "mouseout", bindMouseOutEvent)
                }
            });
            if (lastMarker.length > 0) {
                me.mapObj.setCenter(lastMarker)
            }
        }, _getInfoWindow: function (track) {
            var html = "";
            html += '<div class="checkinmap-track-content"><div class="industry-track-content">';
            html += '<div class="industry-track-body">';
            html += '<div class="industry-track-mes ">';
            html += '<span class="track-ico track-adress-ico lfloat"></span>';
            html += '<span class="track-des lfloat industry-track-mes-bottom">' + rk.htmlEscape(track.locationDetail) + "</span>";
            html += "</div>";
            html += '<div class="industry-track-mes">';
            var time = Globalize.format(new Date(eval(track.startTime)), "yyyy-MM-dd HH:mm");
            html += '<span class="track-ico track-time-ico lfloat"></span><span class="track-des lfloat">' + time + "</span>";
            html += "</div>";
            html += '</div></div><div class="checkinmap-triangle-down"></div></div>';
            return html
        }, _render: function () {
            var me = this;
            var elem = me.element;
            elem.html(rk.templateText(require("oldcrm/tmpl/scrpt_tmpl_checkinmap.tpl"), {}));
            this.mapObj = new AMap.Map("mapContainer", {resizeEnable: true, view: new AMap.View2D({zoom: 12})});
            this.mapObj.plugin(["AMap.ToolBar"], function () {
                var toolBar = new AMap.ToolBar;
                me.mapObj.addControl(toolBar)
            })
        }
    });
    return {
        init: function () {
            var $crmPanel = rk.showPageView("crm-panel");
            var $contentPanel = $crmPanel.find(".container_content");
            $contentPanel.checkinmapmodel()
        }
    }
});