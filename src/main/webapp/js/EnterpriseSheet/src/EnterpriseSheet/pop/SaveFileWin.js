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
Ext.define('EnterpriseSheet.pop.SaveFileWin', {
	
	/* Begin Definitions */
		
	extend : 'Ext.window.Window',
	
	/* End Definitions */
    requires: [
        'Ext.form.field.Text',
        'Ext.layout.container.Form'
    ],
           
    bodyStyle : 'background-color:white;',
           
    title: SLANG['save_sheet_as'],
           
    plain: true,
           
    modal: true,
           
    resizable: false,
           
    shim : true,
           
    closeAction: 'hide',
           
    layout: 'fit',
           
    buttonAlign: 'right',
           
    initComponent : function(){
           
        // create the Data Store
	    this.fileStore = Ext.create('Ext.data.Store', {
	        pageSize: 50,
	        model: EnterpriseSheet.model.FileModel,
	        remoteSort: true,
	        proxy: {
	            type: 'ajax',
                url: SCONFIG.urls['list'],
	            reader: {
	                root: 'results',
	                totalProperty: 'totalCount'
	            }
	        }
	    });
        
        
        this.saveBtn = Ext.create('Ext.button.Button', {
            text: SLANG['save'],
            style: 'margin-left:10px;',
            minWidth: 65,
            handler: this.onSaveFn,
            scope: this
        });
         
        this.fileNameField = Ext.create('Ext.form.field.Text', {
            flex: 1,
            labelWidth: 60,
            fieldLabel: SLANG['file_name'],
            allowBlank: false
        });
        
        this.exnameField = Ext.create('Ext.form.ComboBox', {
            flex: 1,
            labelWidth: 60,
            fieldLabel: SLANG['save_as'],
            queryMode: 'local',
            displayField: 'name',
            valueField: 'name',
            value: 'xls',
            allowBlank: false,
            store: Ext.create('Ext.data.Store', {
                fields: ['name'],
                data: [{'name': 'xls'}, {'name': 'xlt'}]
            })
        });
        this.fileGrid = Ext.create('Ext.grid.Panel', {
	        store: this.fileStore,
	        loadMask: true,
            border: false,
	        columns:[{
				width: 56,
				dataIndex: 'exname',
				menuDisabled: true,
				resizable: false,
				draggable: false,
				renderer: this.renderIcon
			},{
	            text: SLANG['file_name'],
	            dataIndex: 'name',
	            flex: 1,
	            sortable: true
	        }, {
				text: SLANG['update_date'],
				dataIndex: 'updateDate',
                style: 'border-right:none;',
				minWidth: 150,
	            maxWidth: 250,
				menuDisabled: true,
				resizable: false,
				draggable: false
			}],
	        dockedItems: [{
                dock: 'top',
                xtype: 'container',
                style: 'padding:0px 30px;background:white;',
                height: 36,
                layout: {
                    type: 'hbox',
                    align: 'bottom'
                },
                items: [this.fileNameField, this.saveBtn]
            }, {
                dock: 'top',
                xtype: 'container',
                style: 'padding:0px 105px 10px 30px;background:white;',
                height: 50,
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [this.exnameField]
            }],
	        // paging bar on the bottom
	        bbar: Ext.create('Ext.PagingToolbar', {
	            store: this.fileStore,
	            displayInfo: true,
	            displayMsg: 'Displaying items {0} - {1} of {2}',
	            emptyMsg: "No items to display"
	        })
	    });
        this.fileStore.load();
           
        this.items = [this.fileGrid];
           
        this.callParent(arguments);
           
        this.on({
            scope: this,
            'hide': this.onHideFn
        });
        
        this.fileGrid.on({
            scope: this,
            'itemclick': this.onRowSelectFn,
            'itemdblclick': this.onRowDblClickFn
        });
    },
    
    /**
	 * render the photo
	 */
	renderIcon : function(val, meta, rec, rowIndex, colIndex, store, view){
		var result = '<img src="' + SCONFIG.IMAGES_PATH + '/icons/open.png' + '"></img>';

		if (rec.data.exname == 'xls') {
			result = '<img src="' + SCONFIG.IMAGES_PATH + '/sheet_darkgreen.png' + '"></img>';
		} else if (rec.data.exname == 'xlt') {
			result = '<img src="' + SCONFIG.IMAGES_PATH + '/sheet_tpl.png' + '"></img>';
		} 
		return result;
	},       
           
    onHideFn : function(){
        if(this.hideCallback){
           this.hideCallback.call(this.scope, this);
        }
    },
           
    setTitle : function(title){
        this.titleBox.update(title);
    },
           
    /**
     * setup the config and show
     */
    popup : function(config){
        if(config){
            Ext.apply(this, config);
        }
        this.show();
    },
           
    /**
     * on save the file
     */
    onSaveFn : function() {
        var sels = this.fileGrid.getSelectionModel().getSelection();
        this.doSaving(0 < sels.length ? sels[0].data : undefined);
    },
           
    doSaving : function(data){
        if(this.fileNameField.isValid() && this.exnameField.isValid()){
            var sels = this.fileGrid.getSelectionModel().getSelection();
            var fileId, fileName = this.fileNameField.getValue(), exname = this.exnameField.getValue();
            if(data && data.name === fileName && exname === data.exname){
                fileId = sels[0].data.id;
            }
            this.hide();
            if(this.callback){
                this.callback.call(this.scope, fileName, exname, fileId);
            }
        }
    },
           
    onCancelFn : function(){
        this.hide();
    },
           
    /**
     * when select a node in dir tree
     */
    onRowSelectFn : function(list, rec, item, index, e){
        var selectedId = rec.data.id;
        var exname = rec.data.exname;
        
        if (exname == 'xls' || exname == 'xlt'){
            this.saveBtn.enable();
            this.fileNameField.setValue(rec.data.name);
        }else{
            this.saveBtn.disable();
        }
    },
    
    onRowDblClickFn : function(list, rec, item, index, e) {
        this.doSaving(rec.data);
    },
           
    // this is for search function ...
    onQueryKeyDown : function(field, e){
        var key = e.getKey();
           if(Ext.EventObject.ENTER === key){
                this.onSearchFn();
           }else if(Ext.EventObject.ESC === key){
                if('' !== this.queryField.getValue()){
                this.queryField.setValue('');
                this.onSearchFn();
           }
        }
    },
           
    /**
     * search files ...
     */
    onSearchFn : function(){
        var query = this.queryField.getValue();
        this.fileStore.load({
            params:{
                query: query
            }
        });
    }
}, function(){
    SSAVE = (function(){
        var win;
        return {
            popup : function(config){
                if(!win){
                    win = new EnterpriseSheet.pop.SaveFileWin({
                        width: 550,
                        height: 400
                    });
                }
                Ext.apply(win, config);
                win.popup();
             }
        }
    })();
});