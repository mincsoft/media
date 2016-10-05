/**
 * Enterprise Spreadsheet Solutions
 * Copyright(c) CubeDrive Inc. All right reserved.
 * info@enterpriseSheet.com
 * http://www.enterpriseSheet.com
 * 
 * Licensed under the EnterpriseSheet Commercial License.
 * http://enterprisesheet.com/license.jsp
 * 
 * You need to have a valid license key to access this file.
 */
if(!Ext.isIE){
	/*		 
	 * EXT 4.2.1 or EXT 4.2.2 can not set isIE rightly in IE11 and edge, we need check again
	 */
	var userAgent = navigator.userAgent;
				
	if(/(Edge\/)|(MSIE)/gi.test(userAgent) || /(Trident\/)/gi.test(navigator.appVersion)) {
		Ext.isIE = true;
		Ext.isChrome = false;
		Ext.isSafari = false;
		Ext.isWebKit = false;
		Ext.isGecko = false;
		Ext.isOpera = false;
	}
}

Ext.override(Ext.menu.Menu, {
    onMouseLeave: function(e) {
	    var me = this;
	
	    var visibleSubmenu = false;
	    me.items.each(function(item) { 
	        if(item.menu && item.menu.isVisible()) { 
	            visibleSubmenu = true;
	        }
	    })
	    if(visibleSubmenu) {
	        return;
	    }
	
	    me.deactivateActiveItem();
	
	    if (me.disabled) {
	        return;
	    }
	
	    me.fireEvent('mouseleave', me, e);
    }
});


