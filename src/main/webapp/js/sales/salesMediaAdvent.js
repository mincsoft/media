var urlTitle = "https://api.xiaoshouyi.com";
var purMedia_advent_list = "/script-api/customopenapi/search-adventmedia";//查询媒体数据
var dept_list = "/script-api/customopenapi/search-deptlist";//查询部门
var cust_list = "/script-api/customopenapi/search-custlist";//查询部门
var belongId = "100019547";
var access_token;
var refresh_token;
var code;
var users = {};
var access_user;
var client_id = "e3829850419b7ec442b0314c3cf2ff58";
var client_secret = "562e34991cd545d5f499a3331b5cb592";
var debug = "dev";

$(function () {
    access_token = request.getParam("access_token");
    debug = request.getParam("debug");
    //本地测试
    if ("dev" == debug) {
        urlTitle = "http://localhost:8081/media";
        purMedia_advent_list = "/json/mediaAdvent.jsp";
        dept_list = "/json/deptList.jsp";
        cust_list = "/json/custList.jsp";
    }


    $(".work-report-div ul li").on("click", function (event) {
        var _this = this;
        $(".goal_top_title span.view_name").attr("data-value", $(_this).find("a").attr("data-value")).html($(_this).find("a").text());
        loadMediaData();
    });

    $(".goal_top_title .view_now").on("click", function (event) {
        $(".goal_top_title .work-report-div").toggle();
        return false;
    });


    //查询按钮响应事件
    $("[act=search_media]").click(function () {
        loadMediaData();
    });

    //初始化部门列表
    initDeptTreeComb();
    //初始化客户列表
    initCustomerComb();

});

var initDeptTreeComb = function () {
    var data = {};
    data['access_token'] = access_token;

    tokenAjax({
        url: urlTitle + dept_list,    //请求的url地址
        //dataType: "json",   //返回格式为json
        type: "GET",   //请求方式
        data: data,
        beforeSend: function (request) {
            //request.setRequestHeader("Authorization", access_token);
        },
        success: function (req) {
            //请求成功时处理
            var datar = JSON.parse(req.result);
            $.each(datar, function(i,val){
                var deptlist = $("#dept_tree");
                if(i==0){
                    $('<option value="'+val.id+'" selected>'+val.name+'</option>').appendTo(deptlist);
                }else {
                    $('<option value="'+val.id+'">'+val.name+'</option>').appendTo(deptlist);
                }
            });
        }
    });
}

var initCustomerComb = function () {
    var data = {};
    data['access_token'] = access_token;

    tokenAjax({
        url: urlTitle + cust_list,    //请求的url地址
        //dataType: "json",   //返回格式为json
        data:data,
        type: "GET",   //请求方式
        beforeSend: function (request) {
            //request.setRequestHeader("Authorization", access_token);
        },
        success: function (req) {
            //请求成功时处理
            var datar = JSON.parse(req.result);
            $.each(datar, function(i,val){
                var customerSelect = $("#customerSelect");
                // if(i==0){
                //     $('<option value="'+val.id+'" selected>'+val.accountName+'</option>').appendTo(customerSelect);
                // }else {
                    $('<option value="'+val.id+'">'+val.accountName+'</option>').appendTo(customerSelect);
                // }
            });
        }
    });
}

var loadMediaData = function () {
    var data = {};
    data['access_token'] = access_token;
    data["time"] = $(".goal_top_title span.view_name").attr("data-value");
    data["dept"] = $("#dept_tree").val();
    data["customer"] = $("#customerSelect").val();
    data["operator"] = $("#operatorSelect").val();
    data["mediaForms"] = $("#mediaForms").val();
    data["op"] = "sales";
    // data["keyword"] = $("#keywordSelect").val();
    tokenAjax({
        url: urlTitle + purMedia_advent_list,    //请求的url地址
        //dataType: "json",   //返回格式为json
        data: data,   //参数值
        type: "POST",   //请求方式
        beforeSend: function (request) {
            //request.setRequestHeader("Authorization", access_token);
        },
        success: function (req) {
            var datar = JSON.parse(req.result);
            cleanHtmls();
            //请求成功时处理
            $.each(datar, function(i,val){
                var body = $("#spot-list");
                var tr = $('<tr class="'+val.color+'">').appendTo(body);
                var td = $('<td width="10%"><a target="_blank" href="https://crm.xiaoshouyi.com/final/customize.action?id='+val.id+'&belongId=100018388"><span>'+val.mediaCode+'</span></a></td>').appendTo(tr);
                var td = $('<td width="30%"><span>'+val.mediaName+'</span></td>').appendTo(tr);
                var td = $('<td width="10%"><span>'+val.customer+'</span></td>').appendTo(tr);
                var td = $('<td width="10%"><span>'+val.operator+'</span></td>').appendTo(tr);
                var td = $('<td width="15%"><span>'+val.endAt+'</span></td>').appendTo(tr);
                var td = $('<td width="10%"><span>'+val.dayQty+'</span></td>').appendTo(tr);
            });
            // showUsers();
        }
    });
}

var tokenAjax = function (obj) {
    showLoading();
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
                hideLoading();
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
                            hideLoading();
                        }
                    });
                } else if (code) {
                    getToken({
                        type: 'code',
                        success: function (req) {
                            success(obj, req);
                            hideLoading();
                        }
                    });
                }
            } else {
                //请求成功时处理
                obj.success(req);
                hideLoading();
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
var hideAll = function () {
    $("[act=infoSuccess]").hide();
    $("[act=infoFailed]").hide();
    $("#rk-panel_loading").hide();
}

var alertSuccess = function (title) {
    $("[act=infoSuccess]").show();
    setInterval('$("[act=infoSuccess]").hide()', 3000);
}

var alertFailed = function (title) {
    if (title) {
        $("[act=infoFailed]").find("p").html(title);
    } else {
        $("[act=infoFailed]").find("p").html('预定失败');
    }
    $("[act=infoFailed]").show();
    setInterval('$("[act=infoFailed]").hide()', 3000);
}

var showLoading = function () {
    $("#rk-panel_loading").show();
}
var hideLoading = function () {
    $("#rk-panel_loading").hide();
}


var request = {
    getParam: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
};

var cleanHtmls = function () {
    $("#spot-list").html("");
}