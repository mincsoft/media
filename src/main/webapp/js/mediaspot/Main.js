/**
 * Enterprise Spreadsheet Solutions
 * Copyright(c) FeyaSoft Inc. All right reserved.
 * info@enterpriseSheet.com
 * http://www.enterpriseSheet.com
 *
 * Licensed under the EnterpriseSheet Commercial License.
 * http://enterprisesheet.com/license.jsp
 *
 * You need to have a valid license key to access this file.
 */
Ext.onReady(function() {

	Ext.QuickTips.init();

	/**
	 * Define those 2 methods as global variable
	 */
	SHEET_API = Ext.create('EnterpriseSheet.api.SheetAPI', {
		openFileByOnlyLoadDataFlag: true
	});

	SHEET_API_HD = SHEET_API.createSheetApp({
		withoutTitlebar: true,
		withoutSheetbar: true,
		withoutToolbar: false,
		withoutContentbar: false,
		withoutSidebar: true


	});



	// this is tab panel include main and details
	var centralPanel = Ext.create('enterpriseSheet.templates.CenterPanel', {
	});

	Ext.create('Ext.Viewport', {
		layout: 'border',
		items: [ centralPanel],
		listeners: {
			afterlayout: function(v, layout, eOpts) {
				// westPanel.selectNode();
			}
		}
	});

	// =============================================================================================
	// ok inject data now ...
	var json = {
		fileName: "Employee Directory",
		sheets:[{id:1, name:"Main view", actived:true, color:"orange"}],
		floatings: [
			{ sheet:1, name:"colGroups", ftype:"colgroup", json: "[{level:1, span:[2,3]}, {level:1, span:[4,6]}]" },
		],
		cells:[
			{ sheet: 1, row: 0, col: 0, json: { height: 20, va: "middle"} },
			{ sheet: 1, row: 0, col: 1, json: { data: "ID", width: 50, dcfg: "{dt:0, io:true, min:0, max:10000, op:0, ignoreBlank: true, titleIcon: \"number\"}", ticon:"number" } },
			{ sheet: 1, row: 0, col: 2, json: { data: "Name", width: 100, ticon:"profile"} },
			{ sheet: 1, row: 0, col: 3, json: { data: "Dept.(Remote)", width: 130, drop: "list", dcfg: "{dt:15, url: \"fakeData/dropdownList\", titleIcon:  \"remoteList\"}", ticon:"remoteList" } },
			{ sheet: 1, row: 0, col: 4, json: { data: "Email", width: 110, dcfg: "{dt:9}", ticon:"email" } },
			{ sheet: 1, row: 0, col: 5, json: { data: "Phone", width: 100, dcfg: "{dt:8}", ticon:"phone" } },
			{ sheet: 1, row: 0, col: 6, json: { data: "Gender", width: 80, drop: "list", dcfg: "{dt:13, list: [\"Male\",\"Female\"]}", ticon:"dropdown" } },
			{ sheet: 1, row: 0, col: 7, json: { data: "Birth date", width: 120, drop: "date", fm: "date", dfm: "F d, Y", ticon:"calendar"  } },
			{ sheet: 1, row: 0, col: 8, json: { data: "Contact picker", width: 170, ticon:"contact", beforeEdit: "_beforeeditcell_" } },
			{ sheet: 1, row: 0, col: 9, json: { data: "Manager?", width: 100, it: "checkbox", itchk: false, ta: "center", ticon:"checkbox" } },
			{ sheet: 1, row: 0, col: 10, json: { data: "Images", width: 130, dcfg: "{dt:7}", ticon:"image" } },
			{ sheet: 1, row: 0, col: 11, json: { data: "Salary", dcfg: "{dt:11, format: \"money|$|2|none|usd|true\"}",  ticon:"money_dollar" } },
			{ sheet: 1, row: 0, col: 12, json: { data: "Percent", dcfg: "{dt:12, format: \"0.00%\"}",  ticon:"percent" } },
			{ sheet: 1, row: 0, col: 13, json: { data: "Notes", dcfg: "{dt:14, titleIcon: \"textLong\"}",  ticon:"textLong" } },

			{ sheet: 1, row: 1, col: 1, json: { data: 1 } },
			{ sheet: 1, row: 1, col: 2, json: { data: 'Jerry Marc' } },
			{ sheet: 1, row: 1, col: 3, json: { render:'dropRender', data: 'HR Dept', dropId: 1} },
			{ sheet: 1, row: 1, col: 4, json: { data: 'john.marc@abc.com'} },
			{ sheet: 1, row: 1, col: 5, json: { data: '1 (888) 456-7654'} },
			{ sheet: 1, row: 1, col: 6, json: { data: 'Female'} },
			{ sheet: 1, row: 1, col: 7, json: { data: '1982-01-15', fm: "date", dfm: "F d, Y" } },
			{ sheet: 1, row: 1, col: 8, json: { render:'contactRender', data: "Eva Mat, John Marc", itms: '[{name: "Eva Mat", email: "eva@gmail.com", id: 8}, {name: "John Marc", email: "john@abc.com", id: 9}]' } },
			{ sheet: 1, row: 1, col: 10, json: { render:'attachRender', itms: '[{aid: "rT7KfpHA8cI_", url: "sheetAttach/downloadFile?attachId=rT7KfpHA8cI_", type: "img", name: "blue.jpg"},{aid: "2ZisVQ1-*Lo_", url: "sheetAttach/downloadFile?attachId=2ZisVQ1-*Lo_", type: "img", name: "green.jpg"}]' } },
			{ sheet: 1, row: 1, col: 11, json: { data: 82334.5678 } },
			{ sheet: 1, row: 1, col: 12, json: { data: 0.96 } },
			{ sheet: 1, row: 1, col: 13, json: { data: 'This is notes, it is a long text. Double click to edit it.' } },

			{ sheet: 1, row: 2, col: 1, json: { data: 2 } },
			{ sheet: 1, row: 2, col: 2, json: { data: 'Dave Smith' } },
			{ sheet: 1, row: 2, col: 3, json: { render:'dropRender', data: 'Software Dept', dropId: 2} },
			{ sheet: 1, row: 2, col: 4, json: { data: 'dave.smith@abc.com'} },
			{ sheet: 1, row: 2, col: 5, json: { data: '1 (888) 231-7654'} },
			{ sheet: 1, row: 2, col: 6, json: { data: 'Male'} },
			{ sheet: 1, row: 2, col: 7, json: { data: '1980-01-15', fm: "date", dfm: "F d, Y" } },
			{ sheet: 1, row: 2, col: 8, json: { render:'contactRender', data: "Christina Angela, Marina Chris", itms: '[{name: "Christina Angela", email: "christina@gmail.com", id: 4}, {name: "Marina Chris", email: "marina@abc.com", id: 6}]' } },
			{ sheet: 1, row: 2, col: 10, json: { render:'attachRender', itms: '[{aid: "CIBHu3ffG8Q_", url: "sheetAttach/downloadFile?attachId=CIBHu3ffG8Q_", type: "img", name: "admin.png"},{aid: "VcrhEYAyrzA_", url: "sheetAttach/downloadFile?attachId=VcrhEYAyrzA_", type: "img", name: "asset.png"}]' } },
			{ sheet: 1, row: 2, col: 11, json: { data: 81234.5678 } },
			{ sheet: 1, row: 2, col: 12, json: { data: 0.95 } },
			{ sheet: 1, row: 2, col: 13, json: { data: 'This is notes, it is a long text. Double click to edit it.' } },

			{ sheet: 1, row: 3, col: 1, json: { data: 3 } },
			{ sheet: 1, row: 3, col: 2, json: { data: 'Kevin Featherstone' } },
			{ sheet: 1, row: 3, col: 3, json: { render:'dropRender', data: 'Software Dept', dropId: 2} },
			{ sheet: 1, row: 3, col: 4, json: { data: 'kevin@abc.com'} },
			{ sheet: 1, row: 3, col: 5, json: { data: '1 (888) 232-7654'} },
			{ sheet: 1, row: 3, col: 6, json: { data: 'Male'} },
			{ sheet: 1, row: 3, col: 7, json: { data: '1990-01-15', fm: "date", dfm: "F d, Y" } },
			{ sheet: 1, row: 3, col: 8, json: { render:'contactRender', data: "Christina Angela, Marina Chris", itms: '[{name: "Christina Angela", email: "christina@gmail.com", id: 4}, {name: "Marina Chris", email: "marina@abc.com", id: 6}]' } },
			{ sheet: 1, row: 3, col: 10, json: { render:'attachRender', itms: '[{aid: "CIBHu3ffG8Q_", url: "sheetAttach/downloadFile?attachId=CIBHu3ffG8Q_", type: "img", name: "admin.png"},{aid: "VcrhEYAyrzA_", url: "sheetAttach/downloadFile?attachId=VcrhEYAyrzA_", type: "img", name: "asset.png"}]' } },
			{ sheet: 1, row: 3, col: 11, json: { data: 81934.5678 } },
			{ sheet: 1, row: 3, col: 12, json: { data: 0.98 } },
			{ sheet: 1, row: 3, col: 13, json: { data: 'This is notes, it is a long text. Double click to edit it.' } }
		]
	};

	var json1 = {
		fileName: "排期",
		sheets:[{id:1, name:"媒体排期", actived:true, color:"orange"}],
		floatings:[{sheet:1,name:"2015-09",ftype:"meg",json:"[1,7,1,16]"},
			{sheet:1,name:"2015-09Group",ftype:"colgroup",json:"[{level:3, span:[1,9]}]"},
			{sheet:1,name:"beforeHead",ftype:"meg",json:"[1,1,1,6]"},
			{sheet:1,name:"afterHead",ftype:"meg",json:"[1,17,1,26]"}],
		cells:[{sheet:1,row:0,col:1,json:{width:150,beforeEdit: "_beforeeditmedia_"}},
			{sheet:1,row:0,col:2,json:{width:150,beforeEdit: "_beforeeditvendor_"}},
			{sheet:1,row:0,col:3,json:{width:150}},
			{sheet:1,row:0,col:4,json:{width:100}},
			{sheet:1,row:0,col:5,json:{width:100}},
			{sheet:1,row:0,col:6,json:{width:100, drop: Ext.encode({data: ["天","CPC","CPM","次"]})}},
			{sheet:1,row:0,col:7,json:{width:20}},
			{sheet:1,row:0,col:8,json:{width:20}},
			{sheet:1,row:0,col:9,json:{width:20}},
			{sheet:1,row:0,col:10,json:{width:20}},
			{sheet:1,row:0,col:11,json:{width:20}},
			{sheet:1,row:0,col:12,json:{width:20}},
			{sheet:1,row:0,col:13,json:{width:20}},
			{sheet:1,row:0,col:14,json:{width:20}},
			{sheet:1,row:0,col:15,json:{width:20}},
			{sheet:1,row:0,col:16,json:{width:20}},
			{sheet:1,row:0,col:17,json:{width:100,fm: "money||2|none"}},
			{sheet:1,row:0,col:18,json:{width:100,fm: "money||2|none" }},
			{sheet:1,row:0,col:19,json:{width:100,fm: "percent"}},
			{sheet:1,row:0,col:20,json:{width:100,fm: "money||2|none"}},
			{sheet:1,row:0,col:21,json:{width:150,fm: "money||2|none"}},
			{sheet:1,row:0,col:22,json:{width:100,fm: "money||2|none"}},
			{sheet:1,row:0,col:23,json:{width:100,fm: "money||2|none"}},
			{sheet:1,row:0,col:24,json:{width:80,it: "checkbox", itn: "ps",itchk: false,ta: "center"}},
			{sheet:1,row:0,col:25,json:{width:150,drop: Ext.encode({data: ["展示类营销","搜索引擎营销","精准营销","内容营销"]})}},
			{sheet:1,row:0,col:26,json:{width:150}},
			{sheet:1,row:2,col:1,json:{data: 'Media', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:1,json:{data: '媒体', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:2,json:{data: 'Vendor', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:2,json:{data: '供应商', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:3,json:{data: 'colChannels', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:3,json:{data: '频道/位置', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:4,json:{data: 'Format', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:4,json:{data: '形式', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:5,json:{data: 'Size', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:5,json:{data: '尺寸', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:6,json:{data: 'BoughtUnit', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:6,json:{data: '购买方式', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:7,json:{data: '2015-09-21', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed',fm:"date",dfm:"d"} },
			{sheet:1,row:3,col:7,json:{data: '一', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:8,json:{data: '2015-09-22', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed',fm:"date",dfm:"d"} },
			{sheet:1,row:3,col:8,json:{data: '二', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:9,json:{data: '2015-09-23', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed',fm:"date",dfm:"d"} },
			{sheet:1,row:3,col:9,json:{data: '三', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:10,json:{data: '2015-09-24', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed',fm:"date",dfm:"d"} },
			{sheet:1,row:3,col:10,json:{data: '四', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:11,json:{data: '25', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:11,json:{data: '五', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:12,json:{data: '26', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:12,json:{data: '六', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:13,json:{data: '27', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:13,json:{data: '日', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:14,json:{data: '28', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:14,json:{data: '一', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:15,json:{data: '29', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:15,json:{data: '二', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:16,json:{data: '30', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:16,json:{data: '三', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:1,col:7,json:{data: '2015-09', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:17,json:{data: 'Total Insertion', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:17,json:{data: '总数', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:18,json:{data: 'Rate Card/day', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:18,json:{data: '刊例单价', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:19,json:{data: 'Discount', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:19,json:{data: '扣率(%)', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:20,json:{data: 'Net Cost/day', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:20,json:{data: '折后单价', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },

			{sheet:1,row:2,col:21,json:{data: 'Total Ratecard Cost', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:21,json:{data: '刊例总价', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },

			{sheet:1,row:2,col:22,json:{data: 'Total Net Cost', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:22,json:{data: '折后总价', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },

			{sheet:1,row:2,col:23,json:{data: 'Total Order Cost', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:23,json:{data: '下单总价', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },

			{sheet:1,row:2,col:24,json:{data: 'Free', bgc: '#DFE3E8',it:"", ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:24,json:{data: '配送', bgc: '#DFE3E8',it:"",  ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:25,json:{data: 'Connunication Tactics', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:25,json:{data: '推广方式', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:2,col:26,json:{data: 'Remarks', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:3,col:26,json:{data: '备注', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:1,col:1,json:{data: '', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },
			{sheet:1,row:1,col:17,json:{data: '', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} },


			{sheet:1,row:4,col:0,json:{json:{data:"uuid1122"}}},
			{sheet:1,row:4,col:1,json:{data: "新浪",onCellDoubleClickFn:"HY_MEDIA" } },
			{sheet:1,row:4,col:2,json:{data: "北京新浪xx公司" ,id:"112233",onCellDoubleClickFn:"HY_VENDOR" } },
			{sheet:1,row:4,col:3,json:{data: "首页"} },
			{sheet:1,row:4,col:4,json:{data: "形式"} },
			{sheet:1,row:4,col:5,json:{data: "尺寸1111"} },
			{sheet:1,row:4,col:6,json:{data: "CPC"} },
			{sheet:1,row:4,col:7,json:{data: "1"} },
			{sheet:1,row:4,col:8,json:{data: "1"} },
			//{sheet:1,row:4,col:17,json:{data: "=SUM(G4:P4)", cal:true, value:2} },
			{sheet:1,row:4,col:17,json:{data: "2"}  },
			//{sheet:1,row:4,col:17,json:{data: "=SUM(G4:P4)", cal:true, value:2,arg:"SUM({\"span\":[\"\",0,-10,0,-1],\"type\":2})"}  },
			//{sheet:1,row:4,col:18,json:{data: 10000.12, onCellBlurFn:"HY_RATE" } },
			{sheet:1,row:4,col:18,json:{data: 10000.12 } },
			{sheet:1,row:4,col:19,json:{data: 1 } },
			{sheet:1,row:4,col:20,json:{data: 10000.12 } },
			{sheet:1,row:4,col:21,json:{data: 20000.24 } },
			{sheet:1,row:4,col:22,json:{data: 20000.24} },
			{sheet:1,row:4,col:23,json:{data: 0} },
			{sheet:1,row:4,col:24,json:{itchk: true} },
			{sheet:1,row:4,col:25,json:{data: "展示类营销" } },
			{sheet:1,row:4,col:26,json:{data: "备注1" } },
			{sheet:1,row:4,col:27,json:{ data: "Orange", it: "checkbox", itn: "fruit", itchk: false} },



			{sheet:1,row:10,col:4,json:{data: "addMaxRow", it: "button", btnStyle: "color: #900; font-weight: bold;", onBtnClickFn: "addRow" } },
			{sheet:1,row:11,col:4,json:{data: "小计", it: "button", btnStyle: "color: #900; font-weight: bold;", onBtnClickFn: "subTotal" } },

			{sheet:1,row:10,col:1,json:{data: "getCell", it: "button", btnStyle: "color: #900; font-weight: bold;", onBtnClickFn: "getCell" } },
			{sheet:1,row:10,col:2,json:{data: "getDataFromGrid", it: "button", btnStyle: "color: #900; font-weight: bold;", onBtnClickFn: "getDataFromGrid" } },
			{sheet:1,row:10,col:3,json:{data: "submitData", it: "button", btnStyle: "color: #900; font-weight: bold;", onBtnClickFn: "submitData" } }

		],


		columnSize:26};



	var jsonTitle = {
		fileName: "排期",
		sheets: [{id: 1, name: "排期", actived: true, color: "orange"}],
		cells:[
			{sheet:1,row:0,col:0,json:{data: "点击查询加载数据"} }

		]
	};


	loadParentData=function(){
		//从父对象中加载数据
		if (window.parent){
			if (Ext.isDefined( window.parent.getSheetData) ) {
				console.info("Main.js= getSheetData");
				SHEET_API_HD.sheet.loadMask.show();
				var sheetData = window.parent.getSheetData();
				if (sheetData) {
					console.info("Main.js= defer load");
					var sheetJson = {
						fileName: "排期",
						sheets: sheetData.sheets,
						floatings: sheetData.floatings,
						cells: sheetData.cells
					};
					//console.info(JSON.stringify(sheetJson));
					SHEET_API.loadData(SHEET_API_HD, sheetJson);
					////最大列数
					SHEET_API.setMaxColNumber(sheetData.columnSize);
				}
				SHEET_API_HD.sheet.loadMask.hide();
			}
		}
	}


	//SHEET_API.loadData(SHEET_API_HD, jsonTitle, null, this);
	////最大列数
	//SHEET_API.setMaxColNumber(json1.columnSize);

	//this.pageSize = 20;
	////点位开始位置
	//this.spotStartCol=7;
	////点位结束位置
	//this.spotEndCol=16;

	var cellsJson= {
		cells: [
			{sheet: 1, row: 5, col: 1, json: {data: "新浪", onCellDoubleClickFn: "HY_MEDIA"}},
			{sheet: 1, row: 5, col: 2, json: {data: "北京新浪xx公司", id: "112233", onCellDoubleClickFn: "HY_VENDOR"}},
			{sheet: 1, row: 5, col: 3, json: {data: "首页"}},
			{sheet: 1, row: 5, col: 4, json: {data: "形式"}},
			{sheet: 1, row: 5, col: 5, json: {data: "尺寸1111"}},
			{sheet: 1, row: 5, col: 6, json: {data: "CPC"}},
			{sheet: 1, row: 5, col: 7, json: {data: "1"}},
			{sheet: 1, row: 5, col: 8, json: {data: "1"}},
			{sheet: 1, row: 5, col: 9, json: {data: "1"}},
			//{sheet:1,row:5,col:17,json:{data: "=SUM(G4:P4)", cal:true, value:2} },
			{
				sheet: 1,
				row: 5,
				col: 17,

				json:{data: "=SUM(G5:P5)", "refs":[[1,5,7,5,16]], cal:true, value:2,arg:"SUM({\"span\":[1,0,-17,0,-1],\"type\":2})"}
			}

		]
	};
	//SHEET_API.loadMoreData(SHEET_API_HD, cellsJson, null,this);

	//return;
	//每次加载点位条数
	this.pageSize = 20;
	//点位开始位置
	this.spotStartCol=7;
	//点位结束位置
	this.spotEndCol=23;


	//Ext.Ajax.request({
	//	url: SPOT_SHEET_URL,
	//	params: {
	//		puuid: SPOT_UUID,
	//		sheetId: 1,
	//		startDate: SPOT_StartDate,
	//		endDate: SPOT_EndDate,
	//		count:this.pageSize
	//	},
	//	method: 'POST',
	//	success: function (response, options) {
	//		var responseJson = Ext.JSON.decode(response.responseText);
	//		var floatings = responseJson.floatings;
	//		var cells = responseJson.cells;
	//		//var sheetName = responseJson.sheetName;
	//		var columnSize = responseJson.columnSize;
	//		var groups = responseJson.groups;
	//		var total = responseJson.total;//总页数
	//		var sheets = responseJson.sheets;//Sheet信息
	//		var spotEndCol = responseJson.spotEndCol;//点位结束位置
    //
    //
	//		if (Ext.isNumber(Number(spotEndCol))){
	//			this.spotEndCol = spotEndCol;
	//		}
    //
	//		//JSON
	//		var jsonTitle = {
	//			fileName: "排期",
	//			sheets: sheets,
	//			cells:cells,
	//			floatings:floatings
	//		};
    //
	//		//console.log(jsonTitle);
	//		//console.log(response.responseText);
    //
	//		//加载数据
	//		SHEET_API.loadData(SHEET_API_HD, jsonTitle,function (){
    //
	//			//SHEET_API.loadMoreData(SHEET_API_HD, floatings, null,this);
	//			//SHEET_API.updateFloatings(SHEET_API_HD, floatings, null, this);
    //
	//			//设置边框 bug ，加载就串行了。
	//			//SHEET_API.applyCellsBorder(SHEET_API_HD, [[1, 1, 1, 3, columnSize]], {
	//			//	position: "all",
	//			//	color: "#BBB"
	//			//});
    //
	//			//批量加载
	//			if (total>=1){
	//				SHEET_API_HD.sheet.loadMask.show();
	//			}
    //
	//			//加载cell数据分页加载
	//			for(var page =1; page<=total;page++){
	//				var curPage=page;//页
	//				var curStart=this.pageSize*(page-1);//开始
    //
	//				var endCell = curPage==total;
	//				var endFun = function(){
	//					//延迟一秒加载
	//					Ext.Function.defer(function(){
    //
	//						//冻结窗体：row，col
	//						//SHEET_API.freezeSheet(SHEET_API_HD, 3, 2);
    //
	//						SHEET_API.setFocus(SHEET_API_HD,4,1);
	//						SHEET_API_HD.sheet.loadMask.hide();
	//					}, 1000, this);
    //
	//				};
	//				//console.log("----curStart---"+curStart+";curPage:"+curPage+";endCell="+endCell);
	//				var json ={
	//					url: CELL_URL,
	//					endCell:endCell,
	//					params:{
	//						puuid: SPOT_UUID,
	//						sheetId: 1,
	//						startDate: SPOT_StartDate,
	//						endDate: SPOT_EndDate,
	//						count:this.pageSize,
	//						start:curStart,
	//						page:curPage
	//					},
	//					method: 'POST',
	//					success: function (response, options) {
	//						var responseJson = Ext.JSON.decode(response.responseText);
	//						//var cells = responseJson.cells;
	//						//console.log("----endCell:"+options.endCell+";page:"+options.params.page);
	//						//最后一页加载返回
	//						if (options.endCell){
	//							SHEET_API.loadMoreData(SHEET_API_HD, responseJson, endFun, this);
	//						} else {
	//							SHEET_API.loadMoreData(SHEET_API_HD, responseJson, null, this);
	//						}
	//					}
    //
	//				};
	//				Ext.Ajax.request(json);
	//			}
    //
	//			//SHEET_API_HD.sheet.loadMask.hide();
	//		},this);
	//		//最大列数
	//		SHEET_API.setMaxColNumber(columnSize);
    //
	//	},
	//	failure: function (response, options) {
	//		Ext.MessageBox.alert('失败', '请求超时或网络故障,错误编号：' + response.status);
	//	},
	//	scope: this
	//});





	//SHEET_API.loadFile(SHEET_API_HD, "GBbjQnAr1zs_", function(data){
	//
	//},this);



	//SHEET_API.updateCells(SHEET_API_HD, json1.cells, function(){
	//	SHEET_API.updateFloatings(SHEET_API_HD, json1.floatings, null, this);
	//	if (json1.groups){
	//		SHEET_API.updateGroups(SHEET_API_HD, json1.groups)
	//	}
	//	//设置边框
	//	SHEET_API.applyCellsBorder(SHEET_API_HD, [[1, 1, 1, 3, json1.columnSize]], {
	//		position: "all",
	//		color: "#BBB"
	//	});
	//}, this);

	//
	//SHEET_API.loadData(SHEET_API_HD, json1);







	/**
	 * 设置编辑后算法
	 */
	//var editor = SHEET_API_HD.sheet.getEditor();
	//editor.on('quit', function(editor, sheetId, row, col) {
	//	//console.log("----row---"+row+";col:"+col);
	//	//标题行忽略
	//	if(row<4){
	//		return;
	//	}
	//	//点位自动汇总
	//	if (col === this.spotEndCol+2){//刊例单价
	//		HY_RATE_PRICE(sheetId,null,row, col);
	//	} else if (col === this.spotEndCol+3){//折扣
	//		HY_DISCOUNT(sheetId,null,row, col);
	//	} else if (col === this.spotEndCol+6){//折后总价
	//		HY_DISCOUNT_TOTALPRICE(sheetId,null,row, col);
	//	}
    //
	//}, this);
	//点位可以设置为空，此时也要设置公式得需求
	//var store = SHEET_API_HD.store;
	//store.on({
	//	scope: this,
    //
	//	'aftercellchange': function(modified, deleted, origin, current, store, sheetId, row, col) {
	//		if(row<4 ){
	//			return;
	//		}
	//		if(this.spotStartCol<= col && col <= this.spotEndCol ){
	//			HY_TOTALSPOT(sheetId, row, this.spotStartCol,this.spotEndCol);
	//		}
    //
	//	}
	//});
	//复制前预处理
	//var sheet = SHEET_API_HD.sheet;
	//sheet.on({
	//	scope: this,
	//	'beforepaste': function(range, sheet) {
	//		var store = sheet.getStore();
	//		var coord = range.getCoord(), arr = [];
	//		var startRow = 4;
	//		var endRow =4;
	//		for(var i = 0, len = coord.length; i < len; i++){
	//			var span = coord[i];
	//			var str = store.getColName(span[2])+span[1]+':'+store.getColName(span[4])+span[3];
	//			var col = span[2];
	//			startRow = span[1];
	//			 endRow = span[3];
	//			//arr.push(str);
	//		}
	//		loadCalTotalCells(startRow,(endRow-startRow+1));
	//		//alert('Paste at '+ arr.join(', '));
	//	}
	//});
	//加载公式列
	loadCalTotalCells=function(startRow,total){
		//console.log("loadCalTotalCells---"+startRow+";;"+total);
		var sheetId = SHEET_API_HD.sheet.getSheetId();
		//单位小计 没有设置公式
		var spotTotalCol = spotEndCol+1;
		var JsonCells=[];
		//已经加载公式，则返回
		//if(SHEET_API.getCell(SHEET_API_HD,sheetId,startRow,spotEndCol+1).cal) {
		//	return;
		//}
		for(var i=0;i<total;i++){
			var row = startRow+i;
			JsonCells.push({sheet: sheetId, row: row, col: spotTotalCol, json: {data: "SUM(" + SCOM.number2Letter(spotStartCol) + row + ":" + SCOM.number2Letter(spotEndCol - 1) + row + ")", cal:true, "refs":[[sheetId,row,spotStartCol,row,spotEndCol]],arg:"SUM({\"span\":["+sheetId+",0,-"+(spotEndCol-spotStartCol+1)+",0,-1],\"type\":2})"}});

		}
		var Json= {
			cells:JsonCells
		}
		SHEET_API.loadMoreData(SHEET_API_HD, Json,null,this);
		//SHEET_API.loadData(SHEET_API_HD, Json, function() {
		//	SHEET_API.insertRow(SHEET_API_HD, 1, row, total);
		//}, this);
	};




	////设置边框
	//SHEET_API.applyCellsBorder(SHEET_API_HD, [[1, 1, 1, 3, json1.columnSize]], {
	//	position: "all",
	//	color: "#BBB"
	//});

	//SHEET_API.setMaxRowNumber(30);
	// add event listener - this shows the code to add customer function 
	//var sheet = SHEET_API_HD.sheet;
	//var editor = sheet.getEditor();
	//editor.on('quit', function(editor, sheetId, row, col) {
	//	if (col === 1) {
	//		// this is the method to query customer existing backend and auto fill data
	//		var employeeId = SHEET_API.getCellValue(SHEET_API_HD, sheetId, row, col).data;
	//		if (employeeId) AUTO_FILL_CUSTOMER_DATA_BY_EMPLOYEEID(employeeId, sheetId, row, col);
	//	}
	//}, this);
	//
	//// add cell on select event ...
	//var sm = sheet.getSelectionModel();
	//sm.on('selectionchange', function(startPos, endPos, region, sm) {
	//    if (startPos.row == endPos.row && startPos.col == endPos.col && startPos.col == 8) {
	//    	this.customEditor = Ext.create('customer.CellEditor', {
	//    		sheetId: region.sheetId,
	//    		row: startPos.row,
	//    		col: startPos.col
	//    	});
	//    	this.customEditor.popup();
	//    }
	//}, this);
	/**
	 * this method will get data from panel as Json format
	 * you can call your method to submit it to your server.
	 */
	submitData = function() {
		var json = SHEET_API.getJsonData(SHEET_API_HD);
		var cells = json.cells;

		//console.log(Ext.encode(json));
		//alert(Ext.encode(json));
		return Ext.encode(json);
	};

	/**
	 * this method will get data from panel as Json format
	 * you can call your method to submit it to your server.
	 */
	loadData = function(inJson) {
		//var json =Ext.JSON.decode(inJson);
		SHEET_API.loadData(SHEET_API_HD, inJson);
		//SHEET_API.loadData(SHEET_API_HD, inJson, function() {
		//	SHEET_API.insertRow(SHEET_API_HD, 1,33, 30);
		//}, this);
	};

	setMaxCol = function(maxCol) {
		////最大列数
		SHEET_API.setMaxColNumber(maxCol);
	};

	/**
	 * this method will get data from panel as Json format
	 * you can call your method to submit it to your server.
	 */
	loadUuidData = function(cells) {
		//console.log("----cells---"+cells);
		SHEET_API.updateCells(SHEET_API_HD, cells,null,this);
		SHEET_API.loadMoreData(SHEET_API_HD, inJson,null,this);
		//SHEET_API.loadData(SHEET_API_HD, inJson, function() {
		//	SHEET_API.insertRow(SHEET_API_HD, 1,33, 30);
		//}, this);
	};


	/**
	 * This function prove how to use EnterpriseSheet getJsonData API.
	 *
	 * By using EnterpriseSheet getJsonData API, you can generate the
	 * json data and save it into your backend. You can use this saved
	 * jsondata for load later.
	 */
	getDataFromGrid = function() {
		var retrieveWin = Ext.create('enterpriseSheet.example.GetDataWin', {});
		retrieveWin.show();
	};

	addRow= function(){
		var maxRow = SCONST.MAX_ROW_NUMBER +10;
		//alert(maxRow);
		SHEET_API.setMaxRowNumber(maxRow);
	}
	var getCellWin;
	getCell = function(){
		if(!getCellWin){
			getCellWin = Ext.create('Ext.window.Window', {
				title: 'Input row index and column index to get cell data',
				modal: true,
				width: 400,
				height: 300,
				layout: 'form',
				closeAction: 'hide',
				bodyStyle: 'padding: 20px;background:white;',
				items: [{
					xtype: 'numberfield',
					fieldLabel: 'Row index',
					name: 'rowIndex',
					allowBlank: false,
					minValue: 0,
					anchor: '100%'
				}, {
					xtype: 'numberfield',
					fieldLabel: 'Column index',
					name: 'colIndex',
					allowBlank: false,
					minValue: 0,
					anchor: '100%'
				}, {
					xtype: 'textarea',
					name: 'cellData',
					fieldLabel: 'Cell data',
					anchor: '100%',
					height: 150
				}],
				buttons: [{
					text: 'Get cell data',
					handler: function(){
						var rowField = getCellWin.query('numberfield[name=rowIndex]')[0];
						var colField = getCellWin.query('numberfield[name=colIndex]')[0];
						if(rowField.isValid() && colField.isValid()){
							var data = SHEET_API.getCell(SHEET_API_HD, undefined, rowField.getValue(), colField.getValue());
							getCellWin.query('textarea[name=cellData]')[0].setValue(Ext.encode(data));
						}
					}
				}]
			});
		}
		getCellWin.show();
	};
});
	