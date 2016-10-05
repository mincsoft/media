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
Ext.define('EnterpriseSheet.pop.AboutWin', {
    extend: 'Ext.window.Window',
	
	requires: [
	    'Ext.layout.container.Form'	    
	],
		    
    iconCls : 'icon-sheet',
    title : 'Enterprise Spreadsheet Solution',
    bodyStyle: 'background:white;padding:20px;',
    closable : true,
    closeAction: 'hide',
    resizable : false,
    modal : true,
    layout:'anchor',
    border: true,
    layoutConfig: {
        animate:false,
        deferredRender:true
    },

    initComponent: function () {

        var myHtml = '<div style="float:left;width: 321px;padding:1px 45px 10px 2px;"><img src="resource/images/enterpriseLogo.png"/></div>'
                    + '<div style="float:left;width: 225px;padding-top:5px;">'
                    + '    <span style="font-size:16px;"><b>EnterpriseSheet</b></span><br/><span style="font-size:12px;">Enterprise Spreadsheet Solution</span><br/>'
                    + '    <font color="grey">' 
                    +         SCONST.version
                    + '    </font>'
                    + '    <br/><br/>'               
                    + '</div>'
                    + '<div style="clear:left;padding: 1px 2px 10px 0px; font-size:12px;">'
                    + '    EnterpriseSheet provides an enterprise solution to integrate and build your business spreadsheet. It is an online spreadsheet running on your server. EnterpriseSheet makes your data visualization easier, and pop with colorful charts and graphs. Its Excel-like functions, build-in formulas, table templates, validation and conditional formatting features save your time and simplify your spreadsheet tasks.<br/><br/>'
                    + '    To process integration, please visit <a href="http://www.enterpriseSheet.com" TARGET=_BLANK>www.enterpriseSheet.com</a>. Any issues, please '
                    + '    contact us <a href="mailto: info@enterpriseSheet.com">info@enterpriseSheet.com</a>.'
                    + '    <br><br>EnterpriseSheet and EnterpriseSheet logos are the trademarks of the Feyasoft Inc.<br/><br/>'
                    + '    Copyright &copy; 2015 Feyasoft Inc. All right reserved.'

	    '</div>';
	
        this.html = myHtml;
	    
	    this.buttons = [{
            text: SLANG['close'],
            handler: function() {
                this.hide();
            },
            scope: this
        }];

        this.callParent();
    },
    
    /**
	 * popup the window
	 */
	popup : function(){	
		this.show();	    
	}
},  function(){
    SABOUT = new EnterpriseSheet.pop.AboutWin({
        width: 600
    });
});
