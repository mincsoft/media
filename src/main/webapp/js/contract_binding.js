var grid_saleMediaSpot_menuId = 10418;
var widget_saleMediaSpot_menuId = 2002;
var widget_purMediaSpot_menuId = 2002;

//页面的dom节点和销售易代码准备完毕后触发
rkclient.on('init:page', function () {
    // console.log(' 页面的dom节点和销售易代码准备完毕后触发:' + request.path());
});

//1 标准的crm列表页数据加载后触发
rkclient.on('data:crmGrid', function (gridId, appName) {
    console.log('crmGrid数据加载完后触发:grid:' + gridId + " app:" + appName);

    if (gridId == 'div_main_content') {
        var ul = $(".grid_operate ul");

        if (appName == 'contractMediaPaint'){
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

        if (appName == 'media'){
            // a 绘制按钮
            $('<li><a href="javascript:;" target="_blank" class="change" act="viewMediaSpot">查看排期</a></li>').appendTo(ul);
            $("#crm_toolbar .grid_tool").prepend('<div class="create-entity-toolbar lfloat prelative"> <a style="" class="create-entity-btn dinline-block lfloat" target="_blank" act="viewMediaSpot"> <i class="dinline-block lfloat"></i>查看排期</a> </div>');

            // b 绑定事件
            // $("[act=viewMediaSpot]").attr("href",'saleContractSpotSearch.html?&id=' + data.id+'&op=view');
            $("[act=viewMediaSpot]").click(function () {
                // var access_token = request.getParam("access_token");
                // console.log('选择的数据:' + access_token);
                var selectArray = $('#div_main_content').customerList('getSelectedData');
                if (selectArray.length == 1) {
                    var data = selectArray[0];
                    var menuId = grid_saleMediaSpot_menuId;
                    var url = "custom_menu.action?menuId=" + menuId + "&id=" + data.id + "&op=view";
                    window.open(url, '查看排期');
                } else {
                    alert("请选择单条合同数据");
                }
            });
        }
    }

});

//2 详细页 等待控件类型为xsyCustomizeRefer的数据加载完后触发
rkclient.on('data:xsyCustomizeRefer', function (id, entityName, entityInfo, widgetInfo, data) {
    // console.log('crmGrid数据加载完后触发:grid:' + id + " appName:" + entityName + " appInfo:" + entityInfo + " widgetInfo:" + widgetInfo);
    var entityIsTrue = entityName == 'contract' || entityName == 'purchasingContract';
    var widgetIsTrue = data.name == '采购媒体排期明细' || data.name == '外购媒体排期明细' || data.name == '销售媒体排期明细';
    if (entityIsTrue && widgetIsTrue) {
        // a 绘制按钮
        var ul = $(".xsy_su_refer_buttonset ul");
        $('<li><a href="javascript:;" target="_blank" class="xsy_su_refer_expand" act="editSpot"><span>编辑排期</span></a></li>').prependTo(ul);
        // b 绑定事件
        // var contractId = $(".xsy_su_refer_buttonset .xsy_su_refer_create").attr("businessid");
        // $("[act=editSpot]").attr("href",'saleContractSpotSearch.html?&id=' + contractId+'&op=edit');
        $("[act=editSpot]").click(function () {
            // var access_token = request.getParam("access_token");
            // console.log('选择的数据:' + access_token);
            var contractId = $(".xsy_su_refer_buttonset .xsy_su_refer_create").attr("businessid");
            var menuId = widget_saleMediaSpot_menuId;
            if (entityName == 'purchasingContract') {
                menuId = widget_purMediaSpot_menuId;
            }
            var url = "custom_menu.action?menuId=" + menuId + "&id=" + contractId + "&op=edit";
            window.open(url, '编辑排期');
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
    // console.log(' 在crmGrid初始化后触发');
    // alert('在crmGrid初始化后触发')
});

// console.log(' init binding js');
