$(function(){
    var mapObj = new AMap.Map("mapContainer", {resizeEnable: true, view: new AMap.View2D({zoom: 12})});
    mapObj.plugin(["AMap.ToolBar"], function () {
        var toolBar = new AMap.ToolBar;
        mapObj.addControl(toolBar)
    });

    //查询按钮响应事件
    $("[act=search_media]").click(function () {

    });


});

var mapCount = 0;

var _addTrackPoints = function (checkinLength, visitRecords) {
    if (!mapCount) {
        var mapObj = new AMap.Map("mapContainer", {resizeEnable: true, view: new AMap.View2D({zoom: 12})});
        mapObj.plugin(["AMap.ToolBar"], function () {
            var toolBar = new AMap.ToolBar;
            mapObj.addControl(toolBar)
        });
        mapCount = 1
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
        }
    });
    if (lastMarker.length > 0) {
        me.mapObj.setCenter(lastMarker)
    }
}

var _getTrackHtml = function (visitRecord, index) {
    return '<div class="track-point-green  track-point-map" >' + index + " </div>"
}

var _getInfoWindow = function (track) {
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
}