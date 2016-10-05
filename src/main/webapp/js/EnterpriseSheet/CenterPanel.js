/**
 * Enterprise Spreadsheet Solutions
 * Copyright(c) FeyaSoft Inc. All right reserved.
 * info@enterpriseSheet.com
 * http://www.enterpriseSheet.com
 * 
 * Licensed under the EnterpriseSheet Commercial License.
 * http://enterprisesheet.com/license.jsp
 * 
 * You need have a valid license key before you can access this piece 
 * of code.
 */
Ext.define('enterpriseSheet.templates.CenterPanel', {
	
	extend : 'Ext.Panel',	
	region: 'center',
	layout : 'fit',
    defaults: {
        flex: 0.8
    },
	
	initComponent : function(){
		
		this.items = [SHEET_API_HD.appCt];		
		this.callParent();	
	}
    
});