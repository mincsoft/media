//页面的dom节点和销售易代码准备完毕后触发
rkclient.on('init:page', function () {
    console.log(' 页面的dom节点和销售易代码准备完毕后触发:' + this);
});

//等待控件类型为xsyCustomizeRefer的数据加载完后触发
rkclient.on('data:xsyCustomizeRefer', function () {
    // alert('xsyOpportunityRefer控件数据加载完后触发')
    console.log(' xsyOpportunityRefer控件数据加载完后触发:' + this);
    var ul = $(".xsy_su_refer_buttonset ul");
    $('<li><a href="javascript:;" class="xsy_su_refer_expand" act="editSpot"><span>编辑排期</span></a></li>').prependTo(ul);

    $("[act=editSpot]").click(function () {
        var access_token = request.getParam("access_token");
        console.log('选择的数据:' + access_token);
        var contractId = $(".xsy_su_refer_buttonset .xsy_su_refer_create").attr("businessid");
        window.open('custom_menu.action?menuId=2002&id=' + contractId+'&op=edit', '编辑排期');
    });

});
//等待id为1003的控件数据加载完后触发
rkclient.on('data:#8530728', function () {
    console.log(' 8530728控件数据加载完后触发');
    // alert('#1003控件数据加载完后触发')
});
//crm列表渲染完成，未请求数据时触发
rkclient.on('init:crmGrid', function () {
    console.log(' 在crmGrid初始化后触发');
    // alert('在crmGrid初始化后触发')
});
//crm列表页数据加载后触发
rkclient.on('data:crmGrid', function (gridId, appName) {
    if (gridId == 'div_main_content' && appName == 'contract') {
        var ul = $(".grid_operate ul");
        $('<li><a href="javascript:;" target="_blank" class="change" act="viewMediaSpot">查看排期</a></li>').appendTo(ul);
        // $("#crm_toolbar .grid_tool").prepend('<div class="create-entity-toolbar lfloat prelative"> <a style="" class="create-entity-btn dinline-block lfloat" href="895a/37a0/media/mediaSpot.html"> <i class="dinline-block lfloat"></i>查看排期</a> </div>');
    }

    // $("[act=viewMediaSpot]").click(function () {
    //     var access_token = request.getParam("access_token");
    //     console.log('选择的数据:' + access_token);
    //     var selectArray = $('#div_main_content').customerList('getSelectedData');
    //     if (selectArray.length == 1) {
    //         var data = selectArray[0];
    //         console.log('选择的数据:' + data);
    //         window.open('custom_menu.action?menuId=2002&id=' + data.id+'&op=view', '查看排期');
    //     }
    // });


    console.log('crmGrid数据加载完后触发:grid:' + gridId + " app:" + appName);
});


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
    }
};

console.log(' init binding js');
