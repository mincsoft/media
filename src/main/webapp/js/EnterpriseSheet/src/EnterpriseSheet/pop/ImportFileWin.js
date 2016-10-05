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
Ext.define('EnterpriseSheet.pop.ImportFileWin', {
	
	extend : 'Ext.window.Window',
	
	requires: [
        'Ext.form.field.Text',
        'Ext.form.field.File',
        'Ext.form.Panel'
    ],

    bodyStyle : 'background-color:white;padding:10px;',
           
	width : 450,    	
	
	height: 220,
	
    plain: true,
           
    modal: true,
        
    resizable: false,
           
    shim : true,
           
	prepareButton : Ext.emptyFn,
        
	layout: 'fit',
	
	title: SLANG['importFile'],
	
	closeAction: 'hide',
	
	initComponent : function(){
		
		this.fileLabel = Ext.create('Ext.form.field.Display', { 
	        hideLabel:true,
	        labelSeparator:'',
	        value: SLANG['file_name'],
	        anchor:'95%'
	    });
		
		this.fileField = Ext.create('Ext.form.field.File', {
	        emptyText: SLANG['supportImportFormat'],
	        hideLabel:true,
	        labelSeparator:'',
	        name: 'filePath',
	        allowBlank: false,
	        style:'margin-bottom:50px;',
	        anchor: '95%'
	    });
	
	    this.tipLabel = Ext.create('Ext.form.field.Display', { 
	        hideLabel:true,
	        labelSeparator:'',
	        value: SLANG['uploadHint'],
	        anchor:'95%'
	    });
	    
	    // this is the label need to be hidden at initial time ...
	    this.okLabel = Ext.create('Ext.form.field.Display', { 
	    	hidden: true,
	        hideLabel:true,
	        labelSeparator:'',
	        style:'font-size:13px; margin-top: 10px;',
	        value: SLANG['importedSuccess'],
	        anchor:'95%'
	    });
	
	    this.importForm = Ext.create('Ext.form.Panel', {
	        fileUpload: true,
	        baseCls: 'x-plain',
	        labelWidth: 70,
	        url: SCONFIG.urls['importExcelUpload'],
	        items: [this.fileLabel, this.fileField, this.tipLabel, this.okLabel]
	    });
		
		this.items = [this.importForm];
		
		this.dockedItems = [{
			xtype: 'container',
			dock: 'right',
			width: 100,
			style: 'padding:0px 10px;',
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			items: [{
				xtype: 'button',
				text: SLANG['import'],
				handler: this.onOK,
				scope: this
			}, {
				xtype: 'button',
				text: SLANG['cancel'],
				style: 'margin-top:10px;',
				handler: this.onCancel,
				scope: this
			}]
		}];
				
		this.callParent();		
	},

	popup : function(){		
		this.show();
	},
	
	onCancel : function(){		
		this.hide();
	},
	
	onOK : function() {
		if (this.importForm.form.isValid()) {
            this.importForm.form.submit({
                waitMsg:'In processing',
                failure: function(form, action) {
                    Ext.MessageBox.alert('Error Message', action.result.info);
                },
                // everything ok...
                success: function(form, action) {
                    var jsonData = action.result;
                    if (jsonData.success) {
                        // ok now need open this file by id ...
                        var fileId = jsonData.fileId;
                        
                        this.tipLabel.hide();
                        this.okLabel.show();
                        
                        if (jsonData.status == "ok") {
                            this.hide();
                            if(this.callback){
                                this.callback.call(this.scope, fileId);
                            }
                        } else {
                        	/**
                        	this.okLabel.setValue(SLANG['importedError']);                                                             
                            Ext.fly(this.okLabel.el).on('click', function(e){
	                           var tg = e.target;
	                           if((tg.className).indexOf('x-import-open') > -1){
	                                this.onViewFile(fileId);
	                           }
	                           if((tg.className).indexOf('x-import-error') > -1){
	                                this.openErrorFile(fileId);
	                           }
	                        }, this);
	                        **/
                        }
                        
                    } else {
                        Ext.MessageBox.alert('Failed', jsonData.info);
                    }
                },
                scope: this
            });
        }
	},
	
	onKeyPress : function(field, e){
		var key = e.getKey();
		if(Ext.EventObject.ENTER == key){
			this.onOK();
		}
	}
    
}, function(){
    SIMPORT = (function(){
        var win;
        return {
            popup : function(config){
                if(!win){
                    win = new EnterpriseSheet.pop.ImportFileWin({});
                }
                Ext.apply(win, config);
                win.popup();
            }
        }
    })();
});