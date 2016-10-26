var mapCount = 0;
var mapObj;
var urlTitle = "https://api.xiaoshouyi.com";
var media_map = "/script-api/customopenapi/media-map";//查询媒体数据
var belongId = "100019547";
var access_token;
var refresh_token;
var code;
var users = {};
var access_user;
var client_id = "e3829850419b7ec442b0314c3cf2ff58";
var client_secret = "562e34991cd545d5f499a3331b5cb592";
var debug = "dev";
var mapMarkerIndex = 101;
var pic_pre = "/static/img/v3.0/industryFMCG";
var currLnglat;


$(function(){
    access_token = request.getParam("access_token");
    debug = request.getParam("debug");
    //本地测试
    if ("dev" == debug) {
        urlTitle = "http://localhost:8081/media";
        media_map = "/json/mediaMap.jsp";
        pic_pre = "img";
    }

    mapObj = new AMap.Map("mapContainer", {resizeEnable: true, view: new AMap.View2D({zoom: 12})});
    mapObj.plugin(["AMap.ToolBar"], function () {
        var toolBar = new AMap.ToolBar;
        mapObj.addControl(toolBar)
    });

    AMap.plugin(['AMap.Autocomplete','AMap.PlaceSearch'],function(){
        var autoOptions = {
            city: "北京", //城市，默认全国
            input: "userTree"//使用联想输入的input的id
        };
        autocomplete= new AMap.Autocomplete(autoOptions);
        var placeSearch = new AMap.PlaceSearch({
            city:'北京',
            map:mapObj
        });

        AMap.event.addListener(autocomplete, "select", function(e){
            //TODO 针对选中的poi实现自己的功能
            commonSearch(e.poi.location);
            // placeSearch.search(e.poi.name)
        });
    });

    AMap.plugin('AMap.Geocoder',function(){
        var geocoder = new AMap.Geocoder({
            city: "010"//城市，默认：“全国”
        });
        var marker = new AMap.Marker({
            map:mapObj,
            bubble:true
        })
        mapObj.on('click',function(e){
            marker.setPosition(e.lnglat);
            commonSearch(e.lnglat);
            geocoder.getAddress(e.lnglat,function(status,result){
                if(status=='complete'){
                    $("#userTree").val(result.regeocode.formattedAddress);
                }else{
                }
            })
        })

        // $("#userTree").change(function (e) {
        //     var address = $("#userTree").val();
        //     geocoder.getLocation(address,function(status,result){
        //         if(status=='complete'&&result.geocodes.length){
        //             marker.setPosition(result.geocodes[0].location);
        //             mapObj.setCenter(marker.getPosition());
        //             commonSearch();
        //         }
        //     })
        // });

    });

    // //查询按钮响应事件
    // $("[act=search_media]").click(function () {
    //
    // });
     $("#meterSelect").change(function (e) {
         commonSearch(currLnglat);
    });

});


function commonSearch(lnglat,flag) {
    currLnglat = lnglat;
    var startDate;
    var userId = $("#userTree").val();
    var inputValue = $("#analysisChartCalendar").val();
    var today = moment((new Date).getTime()).format("YYYY-MM-DD");
    if (inputValue == "今天") {
        if (flag == "after") {
            startDate = _DateAfter(today);
            $("#analysisChartCalendar").val(startDate)
        } else if (flag == "prev") {
            $("#analysisChartCalendar").val("昨天");
            startDate = _DatePrev(today);
        } else {
            startDate = today;
        }
    } else if (inputValue == "昨天") {
        if (flag == "after") {
            $("#analysisChartCalendar").val("今天");
            startDate = today
        } else if (flag == "prev") {
            startDate = _DatePrev(_DatePrev(today));
            $("#analysisChartCalendar").val(startDate);
        } else {
            startDate = _DatePrev(today);
        }
    } else {
        var newValue = $("#analysisChartCalendar").val();
        var newInputValue2 = new Date(newValue.replace(/-/g, "/"));
        var minus = (new Date).getTime() - newInputValue2.getTime();
        var time = parseInt(minus / (1e3 * 60 * 60 * 24));
        if (flag == "after") {
            if (time == 2) {
                startDate = _DateAfter(newValue);
                $("#analysisChartCalendar").val("昨天");
            } else {
                startDate = _DateAfter(newValue);
                $("#analysisChartCalendar").val(startDate);
            }
        } else if (flag == "prev") {
            if (time == 0) {
                startDate = today;
                $("#analysisChartCalendar").val("今天");
            } else {
                startDate = _DatePrev(newValue);
                $("#analysisChartCalendar").val(startDate);
            }
        } else {
            startDate = inputValue;
        }
    }
    _searchTrackPosition(lnglat, startDate,$("#meterSelect").val());
    if ($("#analysisChartCalendar").val() == _DatePrev(today)) {
        $("#analysisChartCalendar").val("昨天");
    } else if ($("#analysisChartCalendar").val() == today) {
        $("#analysisChartCalendar").val("今天");
    }
}

var _searchTrackPosition = function (lnglat, startDate,distance) {
    startDate = new Date(startDate.replace(new RegExp("-", "gm"), "/")).getTime();
    if(mapObj != null&&mapObj!=undefined){
        // mapObj.clearMap();
        // mapObj.setZoom(12);
    }
    // mapObj = new AMap.Map("mapContainer", {resizeEnable: true, view: new AMap.View2D({zoom: 12})});
    openLoading();
    var data = {lng: lnglat.lng,lat: lnglat.lat,  startDate: startDate,distance:distance};
    tokenAjax({
        url: urlTitle + media_map,    //请求的url地址
        //dataType: "json",   //返回格式为json
        data: data,   //参数值
        type: "POST",   //请求方式
        beforeSend: function (request) {
            //request.setRequestHeader("Authorization", access_token);
        },
        success: function (json) {
            closeLoading();
            if (json.status != 0) {
                $.msg("查询出错了");
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
                n2.innerHTML = "当天无媒体信息";
                parentDio.append(n2);
                mapObj.clearMap();
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
                        _drawDialogs(parentDio, k - count, track)
                    }
                }
                u2.innerHTML = "共发现媒体数：" + originalLength + "";
                _addTrackPoints(checkinLength, json.data)
            }
            $(".user-info-detail .checkin-map-div  a").on("mouseover", function (event) {
                var index = this.firstChild.innerHTML;
                $(".checkin-map-div-span1").css("background", "url("+pic_pre+"/checkinmap_map_left_1.png) center center no-repeat");
                this.firstChild.style.backgroundImage = "url("+pic_pre+"/checkinmap_map_left_2.png)";
                var allTrack = $(".track-point-green");
                $.each(allTrack, function (i, track) {
                    if ($(allTrack[i]).html().trim() == index) {
                        this.style.backgroundImage = "url("+pic_pre+"/checkinmap_map_right_2.png)";
                        $(this).parent().parent().css("z-index", "9999")
                    }
                });
                var dir = $(this.childNodes[3]).attr("dir");
                var lastMarker = dir.split("###");
                if (lastMarker[0] != "" && lastMarker[1] != "") {
                    mapObj.setCenter(lastMarker);
                    mapObj.setZoom(18)
                }
            }).on("mouseout", function () {
                this.firstChild.style.backgroundImage = "url("+pic_pre+"/checkinmap_map_left_1.png)";
                var allTrack = $(".track-point-green");
                $.each(allTrack, function (i, track) {
                    this.style.backgroundImage = "url("+pic_pre+"/checkinmap_map_right_1.png)";
                    $(this).parent().parent().css("z-index", "1")
                })
            });
        }
    });

}


var _addTrackPoints = function (checkinLength, visitRecords) {
    if (mapCount>0) {
        mapObj.clearMap();
        // mapObj = new AMap.Map("mapContainer", {resizeEnable: true, view: new AMap.View2D({zoom: 12})});
        // mapObj.plugin(["AMap.ToolBar"], function () {
        //     var toolBar = new AMap.ToolBar;
        //     mapObj.addControl(toolBar)
        // });
    }
    var currMarkers = {};
    var allPointMap = {};
    var lastMarker = [];
    var count = 0;
    $.map(visitRecords.trackData, function (visitRecord, index) {
        if (visitRecord.longitude != "" && visitRecord.latitude != "") {
            var pointHtml = _getTrackHtml(visitRecord, checkinLength - count++);
            var infoHtml = _getInfoWindow(visitRecord);
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
                map: mapObj,
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
            currMarkers["track_" + visitRecord.id] = infoWindow;

            var bindMouseOverEvent = function (e) {
                $(".checkinmap-track-content").css("display", "inline-block");
                currMarker.setzIndex(mapMarkerIndex++);
                infoWindow.open(mapObj, currMarker.getPosition());
                $($(this.He.content).get(0)).css("backgroundImage", "url("+pic_pre+"/checkinmap_map_right_2.png)");
                // var selectedIndex = $(this.He.content).html().trim();
                // var allTrack = $(".track-point-green");
                // $.each(allTrack, function (i, track) {
                //     if ($(allTrack[i]).html().trim() == selectedIndex) {
                //         this.style.backgroundImage = "url(/static/img/v3.0/industryFMCG/checkinmap_map_right_2.png)";
                //         $(this).parent().parent().css("z-index", "9999")
                //     }
                // })
            };
            var bindMouseOutEvent = function (e) {
                $(".checkinmap-track-content").css("display", "none");
                var allTrack = $(".track-point-green");
                $.each(allTrack, function (i, track) {
                    this.style.backgroundImage = "url("+pic_pre+"/checkinmap_map_right_1.png)";
                    $(this).parent().parent().css("z-index", "1")
                })
            };
            AMap.event.addListener(currMarker, "mouseover", bindMouseOverEvent);
            AMap.event.addListener(currMarker, "mouseout", bindMouseOutEvent)
        }
    });
    if (lastMarker.length > 0) {
        mapObj.setCenter(lastMarker)
    }
    mapCount = 1;
}

var _getTrackHtml = function (visitRecord, index) {
    return '<div class="track-point-green  track-point-map" >' + index + " </div>"
}

var _getInfoWindow = function (track) {
    var html = "";
    html += '<div class="checkinmap-track-content"><div class="industry-track-content">';
    html += '<div class="industry-track-body">';
    html += '<div class="industry-track-mes ">';
    html += '<span class="track-ico track-time-ico lfloat"></span>';
    html += '<span class="track-des lfloat industry-track-mes-bottom">' + track.media + "</span>";
    html += "</div>";
    html += '<div class="industry-track-mes">';
    html += '<span class="track-ico track-adress-ico lfloat"></span><span class="track-des lfloat">' + track.locationDetail + "</span>";
    html += "</div>";
    html += '</div></div><div class="checkinmap-triangle-down"></div></div>';
    return html
}

var _drawDialogs = function (parentDio, index, track) {
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
    n2.title = $("#userTree").val();
    n2.innerHTML = $("#userTree").val();
    a.appendChild(n2);
    var n3 = document.createElement("span");
    n3.className = "checkin-map-div-span3";
    n3.innerHTML = track.media;
    a.appendChild(n3);
    var n4 = document.createElement("span");
    n4.dir = track.longitude + "###" + track.latitude;
    n4.className = "checkin-map-div-span4";
    n4.innerHTML = track.locationDetail;
    a.appendChild(n4);

    root.append(m);
    return root
}

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

var openLoading = function () {
    // $("#oa-shade").after('<div class="large-loading">' + '<div ><div class="f_circleG" id="frotateG_01"></div><div class="f_circleG" id="frotateG_02"></div><div class="f_circleG" id="frotateG_03"></div><div class="f_circleG" id="frotateG_04"></div><div class="f_circleG" id="frotateG_05"></div><div class="f_circleG" id="frotateG_06"></div><div class="f_circleG" id="frotateG_07"></div><div class="f_circleG" id="frotateG_08"></div></div>' + "</div>");
    // $("#oa-shade").show()
}

var closeLoading = function () {
    // var after = $("#oa-shade").next();
    // if (after.hasClass("large-loading")) {
    //     after.remove()
    // }
    // $("#oa-shade").hide()
}

var tokenAjax = function (obj) {
    openLoading();
    var success = function (o, req) {
        if (!o.data.access_token) {
            o.data.access_token = req.access_token;
        }
        $.ajax({
            url: o.url,    //请求的url地址
            beforeSend: o.beforeSend,
            //dataType: "json",   //返回格式为json
            data: o.data,   //参数值
            type: o.type,   //请求方式
            contentType: o.contentType,
            success: function (req) {
                //请求成功时处理
                o.success(req);
                closeLoading();
            }
        });
    };

    $.ajax({
        url: obj.url,    //请求的url地址
        beforeSend: obj.beforeSend,
        //dataType: "json",   //返回格式为json
        data: obj.data,   //参数值
        type: obj.type,   //请求方式
        contentType: obj.contentType,
        success: function (req) {
            if (req.error_code == 20000002 && req.message == "invalid access token") {
                if (refresh_token) {
                    getToken({
                        type: 'refresh_token',
                        success: function (req) {
                            success(obj, req);
                            closeLoading();
                        }
                    });
                } else if (code) {
                    getToken({
                        type: 'code',
                        success: function (req) {
                            success(obj, req);
                            closeLoading();
                        }
                    });
                }
            } else {
                //请求成功时处理
                obj.success(req);
                closeLoading();
            }
        }
    });
}

var getToken = function (obj) {
    var url = urlTitle + "/oauth2/token.action?grant_type=authorization_code&client_id=" + client_id + "&client_secret=" + client_secret + "&redirect_uri=http://lapp.ingageapp.com/d3e6/f901/meet/meetingroom.html&code=" + code;
    if (obj.type != "code") {
        url = urlTitle + "/oauth2/token.action?grant_type=refresh_token&client_id=" + client_id + "&client_secret=" + client_secret + "&redirect_uri=http://lapp.ingageapp.com/d3e6/f901/meet/meetingroom.html&refresh_token=" + refresh_token;
    }
    $.ajax({
        url: url,    //请求的url地址
        //dataType: "json",   //返回格式为json
        data: {},   //参数值
        type: "GET",   //请求方式
        success: function (req) {
            req.access_token = "Bearer " + req.access_token;
            access_token = req.access_token;
            refresh_token = req.refresh_token;
            //请求成功时处理
            obj.success(req);
        }
    });
}

var request = {
    getParam: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
};