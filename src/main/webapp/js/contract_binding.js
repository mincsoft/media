var grid_saleMediaSpot_menuId = 10418;
var widget_saleMediaSpot_menuId = 10702;
var widget_purMediaSpot_menuId = 10703;
var viewSpotIsExits=false;


var addCookie = function (name,value,expiresHours){
    var cookieString=name+"="+escape(value);
//判断是否设置过期时间,0代表关闭浏览器时失效
    if(expiresHours>0){
        var date=new Date();
        date.setTime(date.getTime+expiresHours*3600*1000);
        cookieString=cookieString+"; expires="+date.getTime()+"; path=/;";
    }
    document.cookie=cookieString+";domain=lapp.ingageapp.com";
}

var deleteCookie = function (name){
    var date=new Date();
    date.setTime(date.getTime()-10000); //设定一个过去的时间即可
    document.cookie=name+"=v; expires="+date.toGMTString();
}


//页面的dom节点和销售易代码准备完毕后触发
rkclient.on('init:page', function () {
    // console.log(' 页面的dom节点和销售易代码准备完毕后触发:' + id);
});

//1 标准的crm列表页数据加载后触发
rkclient.on('data:crmGrid', function (gridId, entityName) {
    console.log('crmGrid数据加载完后触发:grid:' + gridId + " app:" + entityName);

    var viewName = $(".js-smartview-tab .view_name").attr("title");

    if (gridId == 'div_main_content') {
        var ul = $(".grid_operate ul");

        if (entityName == 'contractMediaPaint'||viewName.indexOf('媒体上画') > -1){
            $('<li><a href="javascript:;" target="_blank" class="change" act="paint">批量上画</a></li>').appendTo(ul);
            $("[act=paint]").click(function () {
                // var access_token = request.getParam("access_token");
                // console.log('选择的数据:' + access_token);
                var selectArray = $('#div_main_content').customerList('getSelectedData');
                var ids="";
                $.each(selectArray, function(i,val){
                    ids = ids+val+",";
                });
                var urlTitle = "https://api.xiaoshouyi.com";
                var batchPaint = "/script-api/customopenapi/batch-paint";//查询媒体数据
                $.ajax({
                    url: urlTitle+batchPaint,    //请求的url地址
                    beforeSend: function (request) {
                        //request.setRequestHeader("Authorization", access_token);
                    },
                    dataType: "json",   //返回格式为json
                    data: {ids:ids},   //参数值
                    type: "POST",   //请求方式
                    success: function (req) {
                        var result = JSON.parse(req.result);
                        if (result.status == 0 ) {
                            alert("上画成功");
                        } else {
                            alert("上画失败："+req.message);
                        }
                    }
                });
            });

        }

        if (entityName == 'media'||viewName.indexOf('媒体库') > -1){
            // a 绘制按钮
            $('<li><a href="javascript:;"  class="change" act="viewMediaSpot">查看排期</a></li>').appendTo(ul);
            $("#crm_toolbar .grid_tool").prepend('<div class="create-entity-toolbar lfloat prelative"> <a style="" class="create-entity-btn dinline-block lfloat" act="viewMediaSpot"> <i class="dinline-block lfloat"></i>查看排期</a> </div>');

            //b 绑定事件
            $("[act=viewMediaSpot]").click(function () {
                // var access_token = request.getParam("access_token");
                // console.log('选择的数据:' + access_token);
                var menuId;
                var url;
                var selectArray = $('#div_main_content').customerList('getSelectedData');
                if (selectArray.length > 1) {
                    alert("请选择单条数据");

                } else if(selectArray.length == 1){
                    var data = selectArray[0];
                    var menuId = grid_saleMediaSpot_menuId;
                    url = "custom_menu.action?menuId=" + menuId + "&mediaId=" + data.id;
                }else if(selectArray.length == 0){
                    var menuId = grid_saleMediaSpot_menuId;
                    url = "custom_menu.action?menuId=" + menuId;
                }


                window.open(url, '查看排期');
            });
        }
    }

});

//2 详细页 等待控件类型为xsyCustomizeRefer的数据加载完后触发
rkclient.on('data:xsyCustomizeRefer', function (id, entityName, entityInfo, widgetInfo, data) {
    // console.log('crmGrid数据加载完后触发:grid:' + id + " entityName:" + entityName + " entityInfo:" + entityInfo + " widgetInfo:" + widgetInfo+" data:"+data);
    var entityId = entityInfo.id;

    var entityIsTrue = (entityName == 'contract') || (entityName == 'purchasingContract'||entityId == 100018099);
    var isMedia = (entityName == 'media'||entityId == 100018286);
    var widgetIsTrue = data.name == '采购媒体排期明细' || data.name == '外购媒体排期明细' || data.name == '销售媒体排期明细';
    if (entityIsTrue && widgetIsTrue) {
        // a 绘制按钮
        var ul;
        $.each($(".xsy_su_refer_header ul"),function (i,val) {
            var title = $(val).parent().parent().prev().find(".xsy_su_refer_name").html();
            if(title!=undefined){
                if(title.indexOf("采购媒体排期明细")>-1 || title.indexOf("外购媒体排期明细")>-1 || title.indexOf("销售媒体排期明细")>-1 ){
                    ul = val;
                }
            }

        });


        // 一 、 采购合同、销售合同 编辑排期
        if ((entityName == 'contract') || (entityName == 'purchasingContract'||entityId == 100018099)){
            if(ul == null|| ul == undefined){
                return;
            }

            $('<li><a href="javascript:;" target="_blank" class="xsy_su_refer_expand" act="editSpot"><span>编辑排期</span></a></li>').prependTo(ul);
            // b 绑定事件
            // var contractId = $(".xsy_su_refer_buttonset .xsy_su_refer_create").attr("businessid");
            // $("[act=editSpot]").attr("href",'saleContractSpotSearch.html?&id=' + contractId+'&op=edit');
            $("[act=editSpot]").click(function () {
                // var access_token = request.getParam("access_token");
                // console.log('选择的数据:' + access_token);
                var contractId = $(".xsy_su_refer_buttonset .xsy_su_refer_create").attr("businessid");
                var menuId = widget_saleMediaSpot_menuId;
                if (entityName == 'purchasingContract'||entityId == 100018099) {
                    menuId = widget_purMediaSpot_menuId;
                }
                var urlTitle = "https://crm.xiaoshouyi.com";
                var url = "custom_menu.action?menuId=" + menuId + "&contractId=" + contractId + "&op=edit";
                window.open(url, '编辑排期');
            });
        }


    }

    if(isMedia&&data.name == '媒体上画'){// 二、媒体库 查看排期
        // $('<li><a href="javascript:;" target="_blank" class="xsy_su_refer_expand" act="viewSpot"><span>查看排期</span></a></li>').prependTo(ul);
        var ul = $(".xsy_buttonbar_list");
        $('<li> <a href="javascript:;" act="viewSpot" class="xsy_buttonbar_link edit">查看排期</a>  </li>').prependTo(ul);
        viewSpotIsExits = true;
        $("[act=viewSpot]").click(function () {
            var mediaId = $(".xsy_su_refer_buttonset .xsy_su_refer_create").attr("businessid");
            var menuId = grid_saleMediaSpot_menuId;
            var url = "custom_menu.action?menuId=" + menuId + "&mediaId=" + mediaId;
            window.open(url, '查看排期');
        });
    }

});





//----------------------暂时用不上---------------------//
//等待id为1003的控件数据加载完后触发
rkclient.on('data:#1003', function () {
    // console.log(' 1003控件数据加载完后触发');
    // alert('#1003控件数据加载完后触发')
});
//crm列表渲染完成，未请求数据时触发
rkclient.on('init:crmGrid', function () {
    console.log(' 在crmGrid初始化后触发');
    // alert('在crmGrid初始化后触发')
});

// console.log(' init binding js');
