var urlTitle = "https://api.xiaoshouyi.com";
var urlSearchMedia="/script-api/customopenapi/search-mediaspot";//查询媒体数据
var belongId = "100019547";
var access_token;
var refresh_token;
var code;
var users = {};
var access_user;
var client_id = "e3829850419b7ec442b0314c3cf2ff58";
var client_secret = "562e34991cd545d5f499a3331b5cb592";
var debug="";
var mediaId;

$(function(){
    hideAll();
    code = request.getParam("code");
    access_token = request.getParam("access_token");
    debug = request.getParam("debug");
    mediaId = request.getParentParam("mediaId");

    //本地测试
    if ("dev"==debug){
        urlTitle = "http://localhost:8081/media";
        urlSearchMedia="/json/mediaspot.jsp";
    }
    initHtml();

    if (mediaId != null){
        $("#mediaSelect").hide();
        loadMediaSpotData();
    }
});

var initHtml = function(){
    var now = new Date();

    var year = now.getFullYear() + "";       //年
    var month = (now.getMonth() + 1) + "";     //月
    var day = now.getDate() + "";
    if(month.length == 1){
        month = "0" + month;
    }
    if(day.length == 1){
        day = "0" + day;
    }
    $("#dateinfo").val(year + "-" + month + "-" + day);

    var nextMonth = (now.getMonth() + 2) + "";     //月
    if(nextMonth.length == 1){
        nextMonth = "0" + nextMonth;
    }
    $("#dateend").val(year + "-" + nextMonth + "-" + day);


    var cleanHtmls = function(){
        $(".room-list").html("");
        meettingsObjectArray = [];
        //users = {};
        meetingDetails = {};
    }
    $("[act=search_meetting]").click(function(){
        loadMediaSpotData();
    });

};

var loadMediaSpotData = function () {
    var array = $("[act=query_form]").serializeArray();
    var data = {};
    for(var i=0 ; i < array.length;i++){
        data[array[i].name] = array[i].value;
    }

    var beginDate = $("[act=beginTime]").val();
    var endDate = $("[act=endTime]").val();

    if(beginDate >= endDate){
        alert("开始日期一定要小于结束日期");
        return;
    }
    var start = new Date(Date.parse(beginDate));
    var end = new Date(Date.parse(endDate));
    var diff = parseInt((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (diff>=365){
        alert("时间范围最多1年");
        return;
    }

    data["begin"] = beginDate;
    data["end"] = endDate;
    data["mediaId"] = mediaId;
    tokenAjax({
//                url: urlTitle + "/script-api/customopenapi/search-mediaspot",    //请求的url地址
        url:  urlTitle+urlSearchMedia,    //请求的url地址
//                dataType: "json",   //返回格式为json
        data: data ,   //参数值
        type: "POST",   //请求方式
        beforeSend: function(request) {
            //request.setRequestHeader("Authorization", access_token);
        },
        success: function(req) {
            var result = JSON.parse(req.result);
//                    var result = req.result;
            if (result){
                var sheet = result.sheet;
//                    cleanHtmls();
                //请求成功时处理
                loadSpot(sheet)
            }
        }
    });
}

//加载排期控件
var loadSpot = function(json){
//        alert(json.sheets);
    //JSON
    var jsonTitle = {
        fileName: "排期",
        sheets: json.sheets,
        floatings:json.floatings,
        cells:json.cells
    };
    var maxCol = json.columnSize;
    if (sheet_iframe.window && $.isFunction(sheet_iframe.window.loadData)){
        sheet_iframe.window.loadData(jsonTitle);
        ////最大列数
        sheet_iframe.window.setMaxCol(maxCol);
    } else{
        //alert("正在加载控件");
    }
}



var tokenAjax = function(obj){
    showLoading();
    var success = function(o,req){
        if(!o.data.access_token){
            o.data.access_token = req.access_token;
        }
        $.ajax({
            url: o.url,    //请求的url地址
            beforeSend: o.beforeSend,
            //dataType: "json",   //返回格式为json
            headers: {'Authorization': "Bearer " + access_token},         data: o.data,   //参数值 ,   //参数值
            type: o.type,   //请求方式
            contentType:o.contentType,
            success: function(req) {
                //请求成功时处理
                o.success(req);
                hideLoading();
            }
        });
    };

    $.ajax({
        url: obj.url,    //请求的url地址
        beforeSend: obj.beforeSend,
//            dataType: "json",   //返回格式为json
        headers: {'Authorization': "Bearer " + access_token},         data: obj.data,   //参数值 ,   //参数值
        type: obj.type,   //请求方式
        contentType:obj.contentType,
        success: function(req) {
            if(req.error_code == 20000002 && req.message == "invalid access token"){
                if(refresh_token){
                    getToken({
                        type:'refresh_token',
                        success:function(req){
                            success(obj,req);
                            hideLoading();
                        }
                    });
                } else if(code){
                    getToken({
                        type:'code',
                        success:function(req){
                            success(obj,req);
                            hideLoading();
                        }
                    });
                }
            }else{
                //请求成功时处理
                obj.success(req);
                hideLoading();
            }
        },
        error:function(data){
            alert('error');
            hideLoading();
        }
    });
}

var getToken = function(obj){
    var pathName= request.pathName();
    var url = urlTitle + "/oauth2/token.action?grant_type=authorization_code&client_id="+client_id+"&client_secret="+client_secret+"&redirect_uri=https://lapp.ingageapp.com"+pathName+"&code="+code;
    if(obj.type != "code"){
        url = urlTitle + "/oauth2/token.action?grant_type=refresh_token&client_id="+client_id+"&client_secret="+client_secret+"&redirect_uri=https://lapp.ingageapp.com"+pathName+"&refresh_token="+refresh_token;
    }
    $.ajax({
        url: url,    //请求的url地址
        //dataType: "json",   //返回格式为json
        data: {} ,   //参数值
        type: "GET",   //请求方式
        success: function(req) {
            req.access_token = "Bearer " + req.access_token;
            access_token = req.access_token;
            refresh_token = req.refresh_token;
            //请求成功时处理
            obj.success(req);
        }
    });
}
var hideAll = function(){
    $("[act=infoSuccess]").hide();
    $("[act=infoFailed]").hide();
    $("#rk-panel_loading").hide();
}

var alertSuccess = function(title){
    $("[act=infoSuccess]").show();
    setInterval('$("[act=infoSuccess]").hide()',3000);
}

var alertFailed = function(title){
    if(title){
        $("[act=infoFailed]").find("p").html(title);
    }else{
        $("[act=infoFailed]").find("p").html('预定失败');
    }
    $("[act=infoFailed]").show();
    setInterval('$("[act=infoFailed]").hide()',3000);
}

var showLoading = function(){
    $("#rk-panel_loading").show();
}
var hideLoading = function(){
    $("#rk-panel_loading").hide();
}

var request = {
    getParam:function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    },
    pathName:function () {
        return window.location.pathname;
    },
    path:function () {
        var pa = window.location.pathname.lastIndexOf("/");
        return window.location.pathname.substr(0,pa);
    },
    getParentParam:function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = getParentUrl().substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
};

var getParentUrl = function () {
    var isInframe = (parent !== window);
    var parentUrl = null;

    if(isInframe){
        parentUrl = document.referrer;
    }

    return parentUrl;
}