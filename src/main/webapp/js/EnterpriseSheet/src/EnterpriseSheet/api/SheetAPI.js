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
Ext.define('EnterpriseSheet.api.SheetAPI', {
	
	requires: [
        'EnterpriseSheet.lang.Language',
        'EnterpriseSheet.sheet.action.HotKey',
        'EnterpriseSheet.sheet.menu.ContextMenu',
        'EnterpriseSheet.sheet.data.RollingStore',
                         
        'EnterpriseSheet.sheet.toolbar.MenuTitlebar',
        'EnterpriseSheet.sheet.toolbar.SheetTabbar',
        'EnterpriseSheet.sheet.toolbar.Toolbar',
        'EnterpriseSheet.sheet.toolbar.Sidebar',
        'EnterpriseSheet.sheet.toolbar.Contentbar',
        'EnterpriseSheet.sheet.floating.Arrow',
        'EnterpriseSheet.sheet.floating.CalculateHint',
        'EnterpriseSheet.sheet.plugin.SequenceNumber',
        'EnterpriseSheet.sheet.plugin.DropList',
        'EnterpriseSheet.sheet.RollingSheet'
    ],
	
	constructor : function(config){
        Ext.apply(this, config);
        
        Ext.tip.QuickTipManager.init();
        SQTIP.init();
        
        /*
         * set the open file flag, if true then only load the data not refresh the url
         */
        SABOX.updateConfig({
            openFileByOnlyLoadDataFlag: this.openFileByOnlyLoadDataFlag
        });

        /*
         * set the timeout
         */
        if(SCONST.PULLING_TIMEOUT){
           Ext.Ajax.timeout = SCONST.PULLING_TIMEOUT;
        }
        if(Ext.isIE){
           /*
            * for an css issue in IE10
            */
           Ext.getBody().addCls('x-ie');
        }
           
        if(!Ext.isMac && Ext.isWebKit){
           Ext.getBody().addCls('iScroll');
        }
           
        this.callParent(arguments);
		
	},
           
    /**
     * _public
     * create Sheet app based the passed config
     * @param {Object} config: the configuration of the SheetApp to create,
     { 
       withoutTitlebar: true,
       withoutSheetbar: true,
       withoutToolbar: true,
       withoutContentbar: true,
       withoutSidebar: true
     },
     set true/false to show/hide some element of sheet
     * @return {Object}: the handle of the app just created
     {
        appCt: the container of the sheet app, which contains the sheet and some toolbar
        sheet: the sheet itself
        store: the store of sheet app
     }
     */
    createSheetApp : function(config){
        //window['startCounting'] = new Date();
        config = config || {};
        /*
        var store = Ext.create('EnterpriseSheet.sheet.data.SheetStore', {
            fileId: config.fileId
        });*/
        
        var store = Ext.create('EnterpriseSheet.sheet.data.RollingStore', {
            fileId: config.fileId
        });
        
        var plugins = [], lookup = {}, dockedItems = [];
        var arrowConfig = config.arrowConfig || {};
        Ext.applyIf(arrowConfig, {
        	itemsInMenu: SCONFIG.arrowmenu_items
        });
        var arrow = new EnterpriseSheet.sheet.floating.Arrow(arrowConfig);
        plugins.push(arrow);
        lookup['arrow'] = arrow;
        
        var dropListConfig = config.dropListConfig || {};
        var dropList = new EnterpriseSheet.sheet.plugin.DropList(dropListConfig);
        plugins.push(dropList);
        lookup['dropList'] = dropList;
           
        var hint = new EnterpriseSheet.sheet.floating.CalculateHint();
        plugins.push(hint);
        lookup['hint'] = hint;
           
        var contextMenuConfig = config.contextMenuConfig || {};
        Ext.applyIf(contextMenuConfig, {
        	itemsInMenu: SCONFIG.contextmenu_items
        });
        var contextMenu = new EnterpriseSheet.sheet.menu.ContextMenu(contextMenuConfig);
        plugins.push(contextMenu);
        lookup['contextMenu'] = contextMenu;
           
        var seqNumber = Ext.create('EnterpriseSheet.sheet.plugin.SequenceNumber');
        plugins.push(seqNumber);
        lookup['seqNumber'] = seqNumber;
        
          
        
        if(!config.withoutTitlebar){
           var titlebar = new EnterpriseSheet.sheet.toolbar.MenuTitlebar({
                dock: 'top'
            });
           plugins.push(titlebar);
           dockedItems.push(titlebar);
           lookup['titlebar'] = titlebar;
        }
           
        if(!config.withoutSheetbar){
            var sheetbar = new EnterpriseSheet.sheet.toolbar.SheetTabbar({
                dock: SCONFIG.sheet_tab_bar_position
            });
            plugins.push(sheetbar);
            dockedItems.push(sheetbar);
            lookup['sheetbar'] = sheetbar;
        }

        if(!config.withoutToolbar){
            var toolbar = new EnterpriseSheet.sheet.toolbar.Toolbar({
                dock: 'top'
            });
            plugins.push(toolbar);
            dockedItems.push(toolbar);
            lookup['toolbar'] = toolbar;
        }

        if(!config.withoutSidebar){
            var sidebar = new EnterpriseSheet.sheet.toolbar.Sidebar({
                dock: 'right',
                bodyStyle: 'border-right:none;'
            });
            plugins.push(sidebar);
            dockedItems.push(sidebar);
            lookup['sidebar'] = sidebar;
        }
        if(!config.withoutContentbar){
            var contentbar = new EnterpriseSheet.sheet.toolbar.Contentbar({
                dock: 'top'
            });
            plugins.push(contentbar);
            lookup['contentbar'] = contentbar;
        }

        var sheet = new EnterpriseSheet.sheet.RollingSheet({
            style: 'border:none;',
            loadMask: {
                msg: SLANG['processing']
            },
            store: store,
            plugins: plugins,
            disableCalEditorStyle: config.disableCalEditorStyle,
            scrollerAlwaysVisible: config.scrollerAlwaysVisible
        });
        
        var inner;
        if(!config.withoutContentbar){
            inner = {
                border: false,
                layout: 'fit',
                bodyStyle: 'border:none;',
                items: [sheet],
                dockedItems: [contentbar]
            };
        }else{
            inner = sheet;
        }

        var panel = Ext.create('Ext.panel.Panel', Ext.applyIf({
            border: false,
            layout: 'fit',
            bodyStyle: 'border:none;',
            items: [inner],
            dockedItems: dockedItems
        }, config));
        
        if(sidebar && titlebar){
            var me = this;
            var findReplace = function(){
                sidebar.toggleOption(sidebar.searchBtn);
            };
           
            var showcellstyles = function() {
                sidebar.toggleOption(sidebar.cellStyleBtn);
            };
           
            var showCharts = function() {
                sidebar.toggleOption(sidebar.chartBtn);
            };
           
            var showTables = function() {
                sidebar.toggleOption(sidebar.tableStyleBtn);
            };
           
            var showinsertimage = function() {
                sidebar.toggleOption(sidebar.pictureBtn);
            };
            
            var showconditionmgr = function() {
                sidebar.toggleOption(sidebar.conditionStyleBtn);
            };
           
            titlebar.on('findreplace', findReplace);
            titlebar.on('showcellstyles', showcellstyles);
            titlebar.on('showCharts', showCharts);
            titlebar.on('showTables', showTables);
            titlebar.on('showconditionmgr', showconditionmgr);
            titlebar.on('showinsertimage', showinsertimage);
           
            PHKey.bindHotKey(70, true, false, false, findReplace);
        }
        this.checkBeforeUnload(store);
        
        store.on('reportservererror', this.reportServerError, this);
           
        return Ext.apply({
            appCt: panel,
            sheet: sheet,
            store: store
        }, lookup);
    },
           
    /**
     * _public
     * create a window instance contains the sheet app and return the handle
     * @param {Object} sheetConfig: the configuration object for create the sheet app
     * @param {Object} winConfig: the configuration object for the Ext.window.Window
     * @return {Object}: the handle of this sheet app created
     */
    createSheetWin : function(sheetConfig, winConfig){
        sheetConfig = sheetConfig || {};
        winConfig = winConfig || {};
        delete(sheetConfig.renderTo);
        delete(winConfig.items);
        delete(winConfig.layout);
        var hd = this.createSheetApp(sheetConfig);
        var win = Ext.create('Ext.window.Window', Ext.apply({
            layout: 'fit',
            items: [hd.appCt]
        }, winConfig, {
            modal: true,
            closeAction: 'hide',
            width: 1000,
            height: 700
        }));
        hd.appWin = win;
        return hd;
    },
           
    /*
     * _private
     * check before refresh or close the browser
     */
    checkBeforeUnload : function(store){
        try{
            if(!window.onbeforeunload)
                window.onbeforeunload = function(){
                if(!store.isEmptyQueue()){
                    store.doPulling();
                    return SLANG['save_change_before_reload'];
                }else if(store.isPulling()){
                    return SLANG['save_change_before_reload'];
                }
            };
        }catch(e){}
    },
           
    /**
     * _public
     * load file to the passed sheet app
     * @param {Object} hd: the sheet app handle
     * @param {Integer/String} fileId: the file id to load
     * @param {Function} callback: the callback function which will be called after the file is loaded
     * @param {Object} scope: the scope for the callback function
     */
    loadFile : function(hd, fileId, callback, scope){
        hd.store.loadFile({
            fileId: fileId
        }, callback, scope);
    },
           
    /**
     * _public
     * load json for the sheet app
     * @param {Object} hd: the sheet app handle
     * @param {Object} json: the json data to load to this sheet
     */
    loadData : function(hd, json, callback, scope){
        if(json){        	
            hd.store.loadJsonFile(json);           
        }
        
	    if(callback){
	        callback.call(scope);
	    }
    },
    
    /**
     * _public
     * load json for the sheet tab
     * @param {Object} hd: the sheet app handle
     * @param {Object} json: the json data to load to this sheet
     */
    loadTabData : function(hd, json, callback, scope){
        if(json){  
        	var sheet = hd.sheet;   
            hd.store.loadTabJsonFile(json, function(){
            	
            }, this); 
            sheet.refresh();
        }
        
	    if(callback){
	        callback.call(scope);
	    }
    },
    
    loadMoreData : function(hd, json, callback, scope){
        if(json){ 
            var sheet = hd.sheet;      	
            hd.store.loadMoreJsonFile(json);    
            sheet.refresh();    
        }
        
	    if(callback){
	        callback.call(scope);
	    }
    },
    
    refreshSheet : function(hd) {
    	var sheet = hd.sheet;
    	sheet.refresh();  	
    },
           
    /**
     * _public
     * update cells for the passed sheet
     * @param {Object} hd: the sheet app handle
     * @param {Array} cellObjs: an array of the cells need to be update, every item of this array will be an object, which like this:
     {
        sheet:1, //the sheetId of the cell you want to update
        row:1, //the row index of the cell you want to update
        col:1, //the column index of the cell you want to update
        json:{//json property contains all the style and setting of the cell
            data:"ABC", //the data in this cell, it can be a calculate such as "=SUM(A1,B1)"
            cal: false, //if true means this cell is a calculate, the sheet will try to parse the data and calculate it
            bgc: 'black', //the background-color of this cell
            color: 'white' //the font-color of this cell
            ...
        },
        applyWay: 'clear'//could be ['apply', 'applyIf', 'clear'], default to 'clear'. 'apply' means it will use the property in json to replace these propety in the current cell; 'applyIf' means it will use the property in json to add to the current cell if the current cell doesn't have that property; 'clear' means clear all the property of the cell first and then apply json to this cell
     }
     * @param {Function} callback: the callback function which will be called after the cells are updated
     * @param {Object} scope: the scope for the callback function
     */
    updateCells : function(hd, cellObjs, callback, scope){
        var len = cellObjs.length;
        var fn = function(){
            var sheet = hd.sheet, store = sheet.getStore();
            var calculate = sheet.getCalculate();
            for(var i = 0; i < len; i++){
                var data = cellObjs[i], sheetId = data.sheet, row = data.row, col = data.col;
                if(!Ext.isDefined(sheetId)){
                    sheetId = sheet.getSheetId();
                }
                var json = data.json;
                
                // check to see whether json is string ...
            	if (typeof json === 'string' || json instanceof String) json = Ext.decode(json);
                
                if(json.cal && !json.arg){
                    calculate.transferCalculate(json, store, sheetId, row, col);
                }
                store.setCell(sheetId, row, col, json, undefined, false, data.applyWay || 'clear');
            }
            
            sheet.refresh();
        };
        
        if(1000 < len){
            hd.sheet.loadMask.show();
            Ext.Function.defer(function(){
                fn();
                hd.sheet.loadMask.hide();
                if(callback){
                    callback.call(scope);
                }
            }, 50, this);
        }else{
            fn();
            if(callback){
                callback.call(scope);
            }
        }
       
    },
           
    /**
     * _public
     * save the current sheet to backend, it will popup a window to ask input a file name if this sheet is not created in the backend, or it will save all data into the backend
     * @param {Object} hd: the sheet app handle
     * @param {Function} callback: the callback function which will be called after the data are saved
     * @param {Object} scope: the scope for the callback function
     */
    saveData : function(hd, callback, scope){
        var sheet = hd.sheet, store = hd.store;
        SSAVE.popup({
            callback: function(fileName, exname, fileId){
                sheet.saveJsonFile({
                    id: fileId,
                    name: fileName,
                    exname: exname
                }, function(newFileId){
                    store.loadFile({
                        fileId: newFileId
                    });
                    Ext.Msg.alert(SLANG['hint'], SLANG['all_changes_are_saved']);
                }, this);
            },
            scope: this
        });
    },
           
    setReadOnly : function(hd, readOnly){
        hd.sheet.setReadOnly(readOnly);
    },
           
    /**
     * _public
     * get the json data of the passed sheet
     * @param {Object} hd: the sheet app handle
     * @return {Object}: the json data of this sheet
     */
    getJsonData : function(hd, compress){
        var json = hd.sheet.getJsonData(compress);
        
        return json;
    },
    
    /**
     * _public
     * add the passed calculates to the sheet calculate system, so user can use these calculates in the cell
     * @param {Object} calculates: all the customized calculates want to add to the sheet calculate system
     * @return {Array} an array contains the names of these calculates which are failed to add to sheet calculate system, the reason for failure is there is already existed a calculate with the same name in the system
     */
    addCalculates : function(calculates){
        var calculate = EnterpriseSheet.sheet.calculate.Calculate.prototype,
            hint = EnterpriseSheet.sheet.floating.CalculateHint.prototype,
           fails = [];
        for(var p in calculates){
            if(calculates.hasOwnProperty(p)){
                var it = calculates[p], calFun = it.fn, calHint = it.hint;
                if(calculate.addCalculate(p, calFun)){
                    if(calHint){
                        hint.addHint(calHint);
                    }
                }else{
                    fails.push(p);
                }
            }
        }
        if(0 < fails.length){
            return fails;
        }
    },
    
    /**
     * _public
     * add the passed calculate exceptions to the sheet calculate system, so when there is a matched exception happened during the calculating, there will be a red tip on the cell to show some exception information to the user
     * @param {Object} calExceptions: all the customized calculate exceptions want to add to the sheet calculate system
     * @return {Array} an array contains the names of these calculate exceptions which are failed to add to sheet calculate system, the reason for failure is there is already existed a calculate exception with the same name in the system
    */
    addCalculateExceptions : function(calExceptions){
        var fails = [];
        for(var p in calExceptions){
            if(calExceptions.hasOwnProperty(p)){
                var it = calExceptions[p];
                if(!SCALEXP.addExceptionInfo(p, it)){
                    fails.push(p);
                }
            }
        }
        if(0 < fails.length){
           return fails;
        }
    },
           
    /**
     * _public
     * get the sheet json data of the passed sheet
     * @param {Object} hd: the sheet app handle
     * @return {Object}: the json data of this sheet
     */
    getSheetTabData : function(hd){
        var store = hd.sheet.getStore();
        var sheets = store.getSheets(), arr = [], activedSheetId = store.getActivedSheetId();
        for(var i = 0, len = sheets.length; i < len; i++){
            var it = sheets[i];
            arr.push({
                id: it.id,
                name: it.name,
                actived: activedSheetId === it.id,
                color: it.color
            });
        }
        return arr;
    },
           
    getActivedSheetId : function(hd){
        var store = hd.sheet.getStore();
        return store.getActivedSheetId();
    },
    
    getTabnameById : function(hd, tabId){
    	var store = hd.sheet.getStore();
        var sheets = store.getSheets();
        for(var i = 0, len = sheets.length; i < len; i++){
            var it = sheets[i];
            if (it.id == tabId) return it.name;
        }
        return null;
    },
           
    /**
     * _public
     * add a new sheet tab
     * @param {Object} hd: the sheet app handle
     * @param {Object} sheetTabConfig: the configuration of the new sheet tab to add
     * @param {Function} callback: the callback function which will be called after the new sheet tab is added
     * @param {Object} scope: the scope for the callback function
     * @param {Boolean} notSwitchToNewSheet: true means not switch to the sheet tab after added
     */
    addSheetTab : function(hd, sheetTabConfig, callback, scope, notSwitchToNewSheet){
        var sheet = hd.sheet, store = hd.store;
        store.addSheet(sheetTabConfig, function(data){
            var sheetId = data.id;
            if(!notSwitchToNewSheet){
                sheet.loadSwitchSheet(sheetId, function(){
                    if(callback){
                        callback.call(scope, sheetId, hd);
                    }
                }, this);
            }else if(callback){
                callback.call(scope, sheetId, hd);
            }
        }, this);

    },
	
    /**
     * _public
     * update the passed tab, rename it or change the color
     * @param {Object} hd: the sheet app handle
     * @param {Object} sheetTabConfig: the tabConfig to update
     {
        sheetId: sheetId, // the id of sheet tab to update, if undefined then use the actived sheet tab id as default
        name: name, // the new tab name to update
        color: color, // the new tab color to update
        position: position // the new position of this tab to update
     }
     * @param {Function} callback: the callback function which will be called after the tab is updated
     * @param {Object} scope: the scope for the callback function
     * @param {Boolean} notSwitchToNewSheet: true means not switch to the sheet tab after updated     
     */
    updateSheetTab : function(hd, sheetTabConfig, callback, scope, notSwitchToNewSheet){
        var sheet = hd.sheet, store = hd.store;
        store.updateSheetTab(sheetTabConfig.sheetId, sheetTabConfig, function(sheetId){
            if(!notSwitchToNewSheet){
                sheet.loadSwitchSheet(sheetId, function(){
                    if(callback){
                        callback.call(scope, sheetId, hd);
                    }
                }, this);
        }else{
                if(callback){
                    callback.call(scope, sheetId, hd);
                }
        }
        }, this);
    },
	
	/**
     * _public
     * delete the passed tab
     * @param {Object} hd: the sheet app handle
     * @param {Integer} sheetTabId: id of the sheet tab need to be updated
     * @param {Function} callback: the callback function which will be called after the tab is updated
     * @param {Object} scope: the scope for the callback function
     */
    deleteSheetTab : function(hd, sheetTabId, callback, scope){
        var sheet = hd.sheet, store = hd.store;
        store.deleteSheet(sheetTabId, function(){
            var activedSheetId = store.getActivedSheetId();
            sheet.loadSwitchSheet(activedSheetId, function(){
                if(callback){
                    callback.call(scope, hd);
                }
            }, this);
        }, this);
    },
        
    /**
     * _public
     * copy the passed tab
     * @param {Object} hd: the sheet app handle
     * @param {Integer} sheetTabId: id of the sheet tab to copy
     * @param {String} newName: the new name for the copied sheet
     * @param {Function} callback: the callback function which will be called after the tab is updated
     * @param {Object} scope: the scope for the callback function
     */
    copySheetTab : function(hd, sheetTabId, newName, callback, scope){
        var sheet = hd.sheet, store = hd.store;
        return store.copySheet(sheetTabId, newName, function(newSheet){
            if(callback){
                callback.call(scope, newSheet.id, hd);
            }
        }, this);
    },
	
	/**
     * _public
     * Show or hide gridline
     * @param {Object} hd: the sheet app handle
	 * @param {Boolean} hideLine: true means hide gridline.     
     * @param {Integer} sheetId: the id of the sheet to toggle the grid line, if not defined then use the actived sheet
     */
	toggleGridLine : function(hd, hideLine, sheetId) {
		var sheet = hd.sheet;

        if (hideLine) {
            sheet.hideGridLine(undefined, sheetId);
        }else{
            sheet.showGridLine(undefined, sheetId);
        }
	},
           
    /**
     * _public
     * get the cell by sheetId, rowIndex and colIndex
     * @param {Object} hd: the sheet app handle
     * @param {Integer} sheetId: the sheet id of the cell, if undefined then use the actived sheet id as default
     * @param {Integer} rowIndex: the row index of the cell
     * @param {Integer} colIndex: the column index of the cell
     */
    getCell : function(hd, sheetId, rowIndex, colIndex) {
        var sheet = hd.sheet;
        if(!Ext.isDefined(sheetId)){
            sheetId = sheet.getSheetId();
	    }
        return sheet.getCellData(sheetId, rowIndex, colIndex);
    },
    
    /**
     * _public
     * get the cell by sheetId, rowIndex and colIndex - not need process the format
     * @param {Object} hd: the sheet app handle
     * @param {Integer} sheetId: the sheet id of the cell, if undefined then use the actived sheet id as default
     * @param {Integer} rowIndex: the row index of the cell
     * @param {Integer} colIndex: the column index of the cell
     */ 
    getCellValue : function(hd, sheetId, rowIndex, colIndex) {
        var sheet = hd.sheet;
        if(!Ext.isDefined(sheetId)){
            sheetId = sheet.getSheetId();
	    }
        return sheet.getCellValue(sheetId, rowIndex, colIndex);
    },
	
    /**
     * _public
     * insert floating item
     * @param {Object} hd: the sheet app handle
     * @param {Integer} sheetTabId: id of the sheet tab to insert the floating item
     * @param {Object} config: config of the floating item to insert
     * @param {Function} callback: the callback function which will be called after the tab is updated
     * @param {Object} scope: the scope for the callback function
     */
    insertFloatingItem : function(hd, sheetTabId, config, callback, scope){
        var sheet = hd.sheet, store = hd.store;
        if(!Ext.isDefined(sheetTabId)){
            sheetTabId = store.getActivedSheetId();
        }
        var ftype = config.ftype;
        delete(config.ftype);
        if('wedgit' === ftype){
            var url = config.url;
            delete(config.url);
            sheet.createWedgit(url, Ext.apply({
                sheetId: sheetTabId
            }, config));
        }else if('picture' === ftype){
            var url = config.url;
            delete(config.url);
            sheet.createPicture(url, Ext.apply({
                sheetId: sheetTabId
            }, config));
        }else if('chart' === ftype){
           var source = config.source;
           config.sheetId = sheetTabId;
           source.seriesPosition = config.seriesPosition;
           source.cacheFields = SCOM.copy(source.cacheFields);
           sheet.prepareSource(source);
           var rangeStore = sheet.createRangeStore(source);
           sheet.createChart(config.chartType, rangeStore, config, true, true);
        }
        sheet.refreshFloor();
    },
    
    /**
     * action to update floating in the sheet tab.
     * @param {Object} hd: the sheet app handle
     * @param {Object} floatings: the floatings item to be inserted.
     *                 Ex: [{sheet: _sheetId, name:"merge1", ftype:"meg", json:"[1,3,1,6]"}]
     * @param {Function} callback: the callback function which will be called after the tab is updated
     * @param {Object} scope: the scope for the callback function
     */
    updateFloatings : function(hd, floatings, callback, scope) {
    	var sheet = hd.sheet, store = hd.store;        
        var len = floatings.length;
        for(var i = 0; i < len; i++){
            var data = floatings[i], ftype = data.ftype, sheetId = parseInt(data.sheet);
            
        	// check whether this is merge 
            if (ftype === "meg") {  
            	var span = data.json;
            	if (typeof span === 'string' || span instanceof String) span = Ext.decode(span);
            	span = [sheetId].concat(span);
            	sheet.mergeCellForSpan(span, false, false);
            }
        }
        sheet.refresh();
        
        if(callback){
             callback.call(scope, false);
         }
    },
           
    /**
     * _public
     * add dropdown store
     * @param {Object} hd: the sheet app handle
     * @param {String} storeName: the dropdown store name
     * @param {Object} config: the config obj for the dropdown store
     * @param {Function} callback: the callback function which will be called after add this dropdown store
     *  callback(success), the param passed to callback is a flag for whether the dropdown store is add successfully
     * @param {Object} scope: the scope for the callback function
     */
    addDropdownStore : function(hd, storeName, config, callback, scope){
        var sheet = hd.sheet;
        sheet.addDropdownStore(storeName, config, callback, scope);
    },
    
    /**
     * _public
     * get file name
     * @param {Object} hd: the sheet app handle
     */
    getFilename : function(hd) {
    	var store = hd.sheet.getStore();
    	return store.getLoadedFileName();
    },
    
    /**
     * _public
     * toggle freeze
     * @param {Object} hd: the sheet app handle
     * 
     */
    toggleFreeze : function(hd) {
    	var ss = hd.sheet;
    	if (ss.isFreezed()) ss.unfreeze();
    	else {
    		var sm = ss.getSelectionModel();
			var pos = sm.getMinMaxPos();
			ss.freeze(pos.minrow, pos.mincol);
			return ss.freezePos;
    	}
    },
    
    /**
     * _public
     * insert row
     * @param {Object} hd: the sheet app handle
     * @param {Integer} sheetId: the identified sheet tab
     * @param {Integer} row: the place to insert new row
     * @param {Integer} rowSpan: the new row number to be inserted
     */
    insertRow : function(hd, sheetId, row, rowSpan) {
    	var sheet = hd.sheet, store = sheet.getStore();
    	var insertedRowNo = 1;
    	if (rowSpan && rowSpan > 1) insertedRowNo = rowSpan;
		store.insertRow(sheetId, row, insertedRowNo);
		sheet.refreshFocus();
    },
    
    /**
     * _public
     * insert column
     * @param {Object} hd: the sheet app handle
     * @param {Integer} sheetId: the identified sheet tab
     * @param {Integer} row: the place to insert new row
     * @param {Integer} column: the new row number to be inserted
     */
    insertColumn : function(hd, sheetId, column, colSpan) {
    	var sheet = hd.sheet, store = sheet.getStore();
    	var insertedColNo = 1;
    	if (colSpan && colSpan > 1) insertedColNo = colSpan;
		store.insertColumn(sheetId, column, insertedColNo);
		sheet.refreshFocus();
    },
    
    /**
     * _public
     * freeze sheet
     * @param {Object} hd: the sheet app handle
     * @param {Integer} row
     * @param {Integer} column
     */
    freezeSheet : function(hd, row, column) {
    	var ss = hd.sheet;
    	if (ss.isFreezed()) ss.unfreeze();    	
		ss.freeze(row+1, column+1);
		return ss.freezePos;
    },
    
    /**
     * @ Depreciated
     * 
     * Try to use applyCellsBorder method for better parameters
     * 
     * this method will be used to apply border condition to the cells
     * @param {Object} hd: the sheet app handle
     * @param {Integer} sheetId: id of the sheet tab to insert the floating item
     * @param {Integer} startRow
     * @param {Integer} startCol
     * @param {Integer} endRow
     * @param {Integer} endCol
     * @param {String} position: 'outside', 'all', 'top', 'bottom', 'left', 'right', 'topbottom'
     * @param {String} color: red, blue etc 
     * @param {Integer} width: 1 or 2, default is 1
     * @param {String} lineType: dotted, dashed or solid (default is solid)
     */
    applyRangeBorder : function(hd, sheetId, startRow, startCol, endRow, endCol, position, color, width, lineType) {  
    	var sheet = hd.sheet;  	
    	var coord = [[sheetId, startRow, startCol, endRow, endCol]];		
		var range = new EnterpriseSheet.sheet.range.Range({
    		sheet: sheet,
    		coord: coord
    	});
		if (!width) width = 1;
		if (!lineType) lineType = 'solid';
		if (!color) color = 'black';
		range.setRangeBorder(position, color, width, lineType);
    },
    
     /**
     * this method will be used to apply border condition to the cells
     * @param {Object} hd: the sheet app handle
     * @param {Array} cood
     * @param {Object} conf
     *     position: 'outside', 'all', 'top', 'bottom', 'left', 'right', 'topbottom'
     *     color: red, blue etc 
     *     width: 1 or 2, default is 1
     *     lineType: dotted, dashed or solid (default is solid)
     */
    applyCellsBorder : function(hd, coord, conf) {  
    	var sheet = hd.sheet;  		
		var range = new EnterpriseSheet.sheet.range.Range({
    		sheet: sheet,
    		coord: coord
    	});
		
		var width = conf.width, lineType = conf.lineType, color = conf.color;
		if (!width) width = 1;
		if (!lineType) lineType = 'solid';
		if (!color) color = 'black';
		range.setRangeBorder(conf.position, color, width, lineType);
    },
    
    /**
     * action to clean cells border
     * @param {Object} hd: the sheet app handle
     * @param {Array} cood
     */
    clearCellsBorder : function(hd, coord) {  
    	var sheet = hd.sheet;  		
		var range = new EnterpriseSheet.sheet.range.Range({
    		sheet: sheet,
    		coord: coord
    	});
		
		range.setRangeBorder("all", "", 1, 'solid');
    },
    
    /**
     * this method will be used to apply table template to the cells
     * @param {Object} hd: the sheet app handle
     * @param {Integer} sheetId: id of the sheet tab to insert the floating item
     * @param {Integer} startRow
     * @param {Integer} startCol
     * @param {Integer} endRow
     * @param {Integer} endCol
     * @param {String} tpl: tpl_0 --- tpl_59
     * @param {boolean} trigger: true or false to show / hide trigger
     */
    applyTableTpl : function(hd, sheetId, startRow, startCol, endRow, endCol, tpl, trigger) {  
    	var sheet = hd.sheet;  	
    	if (trigger == null) trigger = true;

    	var tpl = {id: tpl, span:[sheetId, startRow, startCol, endRow, endCol]};
    	var cellObjs = [];
    	for (var i=startRow; i<=endRow; i++) {
    		for (var j=startCol; j<=endCol; j++) {
    			if (trigger == false && i == startRow) 
    				cellObjs.push({sheet:sheetId, row:i, col:j, json:{tpl: Ext.encode(tpl), trigger: false}, applyWay:"apply"});
    			else 
    		        cellObjs.push({sheet:sheetId, row:i, col:j, json:{tpl: Ext.encode(tpl)}, applyWay:"apply"});	
    		}
    	}
    	
    	this.updateCells(hd, cellObjs);
    },
    
    /**
     * Method to clean the table template
     */
    clearTableTpl : function(hd, span){
    	var sheet = hd.sheet;  
		var tableTpl = sheet.getTableTpl();
		if(tableTpl){		
			tableTpl.clearTplForSpan(span);
		}		
	},
    
    setWholeRowHeight : function(hd) {
    	var sheet = hd.sheet, pos = {minrow: 0};
    	sheet.setRowHeight(50, pos);
    },
    
    /**
     *  _private
     */
    reportServerError : function(serverFailure, comment){
        if(!SCONFIG['NOT_REPORT_ERROR2SERVER']){
            Ext.Ajax.request({
                url: SCONFIG.urls['createServerErrorReport'],
                params: {
                    action: serverFailure.action,
                    params: Ext.encode(serverFailure.params),
                    comment: comment
                }
            });
        }
    },
           
    /**
     * _public
     * show the related sidebar button
     * @param {Object} hd: the sheet app handle
     * @param {String} btn: should be one of them:
     *              chart, cellStyle, tableStyle, search, picture, widget, condition    
     * @param {Function} callback: the callback function which will be called after show the chart sidebar
     *  callback(success), the param passed to callback is the sidebar reference
     * @param {Object} scope: the scope for the callback function
    */
    showSidebarBtnWin : function(hd, btn, callback, scope){
        var sidebar = hd.sidebar;
        if(sidebar){
        	if (btn == "chart") btn = sidebar.chartBtn;
        	else if (btn == "cellStyle") btn = sidebar.cellStyleBtn;
        	else if (btn == "tableStyle") btn = sidebar.tableStyleBtn;
        	else if (btn == "search") btn = sidebar.searchBtn;
        	else if (btn == "picture") btn = sidebar.pictureBtn;
        	else if (btn == "widget") btn = sidebar.wedgitBtn;
        	else if (btn == "condition") btn = sidebar.conditionStyleBtn;
        	
            sidebar.toggleOption(btn, undefined, function(){
                if(callback){
                    callback.call(scope, sidebar, hd);
                }
            });
        }
    },
           
    /**
     * _public
     * hide rows
     * @param {Object} hd: the sheet app handle
     * @param {Integer} startRow: the start row to show
     * @param {Integer} endRow: the end row to show
     * @param {Integer} sheetId: the identified sheet tab, if not defined, then use the current tab
     */
    showRow : function(hd, startRow, endRow, sheetId) {
        var sheet = hd.sheet, store = sheet.getStore();
        sheet.showRow({
            minrow: startRow,
            maxrow: endRow
        }, sheetId);
        sheet.refreshFocus();
    },
           
    /**
     * _public
     * hide rows
     * @param {Object} hd: the sheet app handle
     * @param {Integer} startRow: the start row to hide
     * @param {Integer} endRow: the end row to hide
     * @param {Integer} sheetId: the identified sheet tab, if not defined, then use the current tab
     */
    hideRow : function(hd, startRow, endRow, sheetId) {
        var sheet = hd.sheet, store = sheet.getStore();
        sheet.hideRow({
            minrow: startRow,
            maxrow: endRow
        }, sheetId);
        sheet.refreshFocus();
    },
           
    /**
     * _public
     * hide columns
     * @param {Object} hd: the sheet app handle
     * @param {Integer} startCol: the start col to hide
     * @param {Integer} endCol: the end col to hide
     * @param {Integer} sheetId: the identified sheet tab, if not defined, then use the current tab
     */
    hideColumn : function(hd, startCol, endCol, sheetId) {
        var sheet = hd.sheet, store = sheet.getStore();
        sheet.hideColumn({
            mincol: startCol,
            maxcol: endCol
        }, sheetId);
        sheet.refreshFocus();
    },
           
           
    /**
     * _public
     * hide columns
     * @param {Object} hd: the sheet app handle
     * @param {Integer} startCol: the start col to show
     * @param {Integer} endCol: the end col to show
     * @param {Integer} sheetId: the identified sheet tab, if not defined, then use the current tab
     */
    showColumn : function(hd, startCol, endCol, sheetId) {
        var sheet = hd.sheet, store = sheet.getStore();
        sheet.showColumn({
            mincol: startCol,
            maxcol: endCol
        }, sheetId);
        sheet.refreshFocus();
    },
           
    /**
     * _public
     * set condition
     * @param {Object} hd: the sheet app handle
     * @param {Array} coord: the coordinate array
     * @param {String} cdtName: the condition name
     * @param {Object} config: the config of condition
     */
    setCondition : function(hd, coord, cdtName, config) {
        var sheet = hd.sheet;
        var range = new EnterpriseSheet.sheet.range.Range({
            sheet: sheet,
            coord: coord
        });
        range.setCondition(cdtName, config);
        sheet.refreshFocus();
    },

    /**
     * _public
     * clear condition
     * @param {Object} hd: the sheet app handle
     * @param {Array} coord: the coordinate array
     */
    clearCondition : function(hd, coord) {
        var sheet = hd.sheet;
        var range = new EnterpriseSheet.sheet.range.Range({
            sheet: sheet,
            coord: coord
        });
        range.clearCondition();
        sheet.refreshFocus();
    },
           
    /**
     * _public
     * update groups
     * @param {Object} hd: the sheet app handle
     * @param {Array} groups: the group array
     */
    updateGroups : function(hd, groups) {
        var sheet = hd.sheet;
        sheet.applyGroups(groups);
        sheet.refreshFocus();
    },
    
    /**
     * _public
     * cancel the first group in the selected area
     * @param {Object} hd: the sheet app handle
     * @param {String} dir: row or col
     * @param {String} start: start row or column
     * @param {String} end: end row or column
     */
    cancelGroup : function(hd, dir, start, end) {
        var sheet = hd.sheet;
        
        if( "col" == dir){
            sheet.updateColGroup("cancel", start, end);
		}else if("row" == dir){
            sheet.updateRowGroup("cancel", start, end);
		}
        
        sheet.refreshFocus();
    },
    
    /**
     * _public
     * Get a list of data on the selected range
     * @param {Object} hd: the sheet app handle
     */
    getSelectedRangeData : function(hd) {
    	var ss = hd.sheet, sm = ss.getSelectionModel(), pos = sm.getMinMaxPos();
    	var minX = pos.minrow, minY = pos.mincol, maxX = pos.maxrow, maxY = pos.maxcol;
    	var sheetId = ss.getSheetId();
    	
    	var result = [];
    	for (var i=minX; i<= maxX; i++) {
    		for (var j=minY; j<= maxY; j++) {
    			var cell = ss.getCellData(sheetId, i, j);
    			var cellObj = {row: i, col: j, val: cell.data};
    			result.push(cellObj);
    		}
    	}
    	
    	return result;
    },
    
    
    /**
     * _public
     * Get a list of cell comments information for the file
     * @param {Object} hd: the sheet app handle
     * @param {Integer} sheetId: the identified sheet tab, if not defined, then use the current tab
     */
    getCellsComment : function(hd, sheetId) {
    	var sheet = hd.sheet, store = hd.store, result = [];
    	
    	if (sheetId == null) sheetId = sheet.getSheetId(); 
    	
    	var coord = [[sheetId, 0, 0, 0, 0]];
    	store.walkRange(coord, function(rd){
			var row = rd.data.row, col = rd.data.col, currentSheetId = rd.data.sheet;
			if(0 !== row && 0 !== col && rd.data.json.comment) {	
				// calculate cell result if it is formula
				var data = rd.data.json.data;
				if (rd.data.json.cal) {
					var cell = SHEET_API.getCellValue(SHEET_API_HD, sheetId, row, col);
					data = cell.data;
				}
				
				var cellObj = {sheetId: currentSheetId, x: row, y: col, comment: rd.data.json.comment, result: data};
    			result.push(cellObj);
			}
		}, this);
    	
    	return result;
    },

    /**
     * _public
     * set value to the variable
     * @param {Object} hd: the sheet app handle
     * @param {Object} vnVals: an object contains all the variable values
     */
    setValueToVariable : function(hd, vnVals){
        var sheet = hd.sheet;
        sheet.fireEvent('disablehistory', sheet);
        sheet.setValueToVariable(vnVals, true);        
        sheet.fireEvent('enablehistory', sheet);
    },
           
    /**
     * _public
     * get all variable values
     * @param {Object} hd: the sheet app handle
     */
    getCellVariables : function(hd){
        var sheet = hd.sheet;
        return sheet.getCellVariables();
    },
    
    /**
     * _public
     * clear all variables
     * @param {Object} hd: the sheet app handle
     */
    clearAllVariables : function(hd){
        hd.sheet.clearAllVariables();
    },
           
    /**
     * _public
     * copy the range and paste to another range
     * @param {Object} hd: the sheet app handle
     * @param {Array} fromCoord: the coord to copy
     * @param {Array} toCoord: the coord to paste, if not define then use the selection coord
     * @param {String} pasteType: the paste type, can be one of "default", "data", "style" or "reverse", if empty then means "default"
     * @param {Boolean} cutFlag: true then will clear the copy coord after pasted
     */
    copyPasteRange : function(hd, fromCoord, toCoord, pasteType, cutFlag){
        var sheet = hd.sheet;
        var clipboard = sheet.getClipboard();
        clipboard.copy(fromCoord, cutFlag);
        clipboard.paste(undefined, pasteType, true, toCoord, true);
    },
    
    /**
     * _public
     * add filter function to a list of span 
     * @param {Object} hd: the sheet app handle
     * @param {span} coord: the coordinate array [sheetId, x1, y1, x2, y2]
     */
    addFilter2Span : function(hd, span) {
    	var sheet = hd.sheet, filter = sheet.getFilter();
    	filter.createFilterForSpan(span, false);
    },
    
    removeFilter : function(hd, sheetId) {
        var sheet = hd.sheet, filter = sheet.getFilter();
    	filter.cleanFilterForSheet(sheetId);
    },
    
    sortCellByAsc : function(hd, span) {
    	var sheet = hd.sheet;
    	sheet.checkSortSpan(span, null, "asc");
    },
    
    sortCellByDesc : function(hd, span) {
    	var sheet = hd.sheet;
    	sheet.checkSortSpan(span, null, "desc");
    },
    
    /**
     * _public
     * Check whether cell is merged or not
     * @param {Object} hd: the sheet app handle
     * @param {sheetId} sheetId: the sheet id
     * @param {Integer} row: the checked cell row
     * @param {Integer} col: the checked cell col
     */
    isMergedCell : function(hd, sheetId, row, col) {
    	var sheet = hd.sheet, store = hd.store;
    	var cell = store.getCell(sheetId, row, col);
    	return store.isMergedCell(cell);
    },

    /**
     * _public
     * merge the cells in the passed coord span
     * @param {Object} hd: the sheet app handle
     * @param {Array} span: the coordinate span array, it would like [sheetId, minrow, mincol, maxrow, maxcol],
     * @param {boolean} suspendEvent: true to not fire event
     * @param {boolean} suspendRefresh: true to not refresh the cells
     */
    mergeCellForSpan : function(hd, span, suspendEvent, suspendRefresh) {
        var sheet = hd.sheet;
        sheet.mergeCellForSpan(span, suspendEvent, suspendRefresh);
    },
           
    /**
     * _public
     * delete the comment in the passed coord
     * @param {Object} hd: the sheet app handle
     * @param {Array} coord: the coordinate array
     * @param {boolean} suspendEvent: true to not fire event
     * @param {boolean} suspendRefresh: true to not refresh the cells
     */
    deleteCommentForCoord : function(hd, coord, suspendEvent, suspendRefresh) {
        var sheet = hd.sheet;
        sheet.deleteComment(coord, suspendEvent, suspendRefresh);
    },
     
    /**
     * _public
     * get the item (radio or checkbox) value by the passed name
     * @param {Object} hd: the sheet app handle
     * @param {String} name: item name
     */
    getItemValueByName : function(hd, name){
        var sheet = hd.sheet;
        return sheet.getItemValueByName(name);
    },
    
    setFocus : function(hd, row, col) {  	
    	var sm = hd.sheet.getSelectionModel();
    	sm.selectRange({row:row, col:col}, {row:row, col:col}, false);
		sm.setFocusCell(row, col, false);
    },
    
    setMaxRowNumber : function(maxRow) {
    	if (Ext.isNumber(Number(maxRow)) && maxRow > 20) SCONST.MAX_ROW_NUMBER = maxRow;
    },
    
    setMaxColNumber : function(maxCol) {
    	if (Ext.isNumber(Number(maxCol)) && maxCol > 5) SCONST.MAX_COLUMN_NUMBER = maxCol;
    }

}, function(){
    
});
