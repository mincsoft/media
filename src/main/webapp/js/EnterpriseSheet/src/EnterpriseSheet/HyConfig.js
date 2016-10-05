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
Ext.define('EnterpriseSheet.Config', {

    singleton : true,

    constructor : function() {

        this.callParent(arguments);

        this.setupDir('');

        Ext.apply(this, {
            // please select one of the following currency code:
            //    'usd', 'rmb', 'eur', 'ars' , 'aud', 'brl', 'cad', 'clp', 'cop', 'dkk', 'hkd', 'isk', 'inr', 'idr', 'ils', 'jpy'
            //	  'won', 'mxn', 'myr', 'nzd', 'nok', 'pln', 'rub', 'sar', 'sgd', 'zar', 'sek', 'chf', 'twd', 'try', 'gbp', 'afn'
            //    'bob', 'bgn', 'egp', 'ltl', 'vnd', 'uah', 'irr', 'huf', 'cup', 'ron', 'jmd', 'kzt', 'lbp', 'thb', 'ngn', 'zwd'
            //    'all', ''
            default_currency: 'usd',

            // Please select one of the following items:
            //       english_us, chinese
            default_locale: 'chinese',

            // this is for chinese character
            fontFamilyStore_cn : new Ext.data.ArrayStore({
                fields:['id', 'text'],
                data:[
                    ['\u5B8B\u4F53', '<font face="STXihei">\u5B8B\u4F53</font>'],
                    ['\u6977\u4F53', '<font face="STSong">\u6977\u4F53</font>'],
                    ['\u4EFF\u5B8B\u4F53', '<font face="STKaiti">\u4EFF\u5B8B\u4F53</font>'],
                    ['\u65B0\u5B8B\u4F53', '<font face="STHeiti">\u65B0\u5B8B\u4F53</font>'],
                    ['\u9ED1\u4F53', '<font face="Hiragino Sans GB">\u9ED1\u4F53</font>'],
                    ['Arial', '<font face="arial">Arial</font>'],
                    ['Antiqua', '<font face="antiqua">Antiqua</font>'],
                    ['Calibri', '<font face="calibri">Calibri</font>'],
                    ['Comic Sans MS', '<font face="Comic Sans MS">Comic Sans MS</font>'],
                    ['Courier New', '<font face="courier">Courier New</font>'],
                    ['Garamond', '<font face="Garamond">Garamond</font>'],
                    ['Georgia', '<font face="Georgia">Georgia</font>'],
                    ['Helvetica', '<font face="helvetica">Helvetica</font>'],
                    ['Lucida Console', '<font face="Lucida Console">Lucida Console</font>'],
                    ['MS Serif', '<font face="MS Serif">MS Serif</font>'],
                    ['Monospace', '<font face="Monospace">Monospace</font>'],
                    ['Tahoma', '<font face="tahoma">Tahoma</font>'],
                    ['Times New Roman', '<font face="times">Times New Roman</font>'],
                    ['Verdana', '<font face="verdana">Verdana</font>']
                ]
            }),

            fontFamilyStore_en : new Ext.data.ArrayStore({
                fields:['id', 'text'],
                data:[
                    ['Arial', '<font face="arial">Arial</font>'],
                    ['Antiqua', '<font face="antiqua">Antiqua</font>'],
                    ['Calibri', '<font face="calibri">Calibri</font>'],
                    ['Comic Sans MS', '<font face="Comic Sans MS">Comic Sans MS</font>'],
                    ['Courier New', '<font face="courier">Courier New</font>'],
                    ['Garamond', '<font face="Garamond">Garamond</font>'],
                    ['Georgia', '<font face="Georgia">Georgia</font>'],
                    ['Helvetica', '<font face="helvetica">Helvetica</font>'],
                    ['Lucida Console', '<font face="Lucida Console">Lucida Console</font>'],
                    ['MS Serif', '<font face="MS Serif">MS Serif</font>'],
                    ['Monospace', '<font face="Monospace">Monospace</font>'],
                    ['Tahoma', '<font face="tahoma">Tahoma</font>'],
                    ['Times New Roman', '<font face="times">Times New Roman</font>'],
                    ['Verdana', '<font face="verdana">Verdana</font>'],
                    ['\u5B8B\u4F53', '<font face="STXihei">\u5B8B\u4F53</font>'],
                    ['\u6977\u4F53', '<font face="STSong">\u6977\u4F53</font>'],
                    ['\u4EFF\u5B8B\u4F53', '<font face="STKaiti">\u4EFF\u5B8B\u4F53</font>'],
                    ['\u65B0\u5B8B\u4F53', '<font face="STHeiti">\u65B0\u5B8B\u4F53</font>'],
                    ['\u9ED1\u4F53', '<font face="Hiragino Sans GB">\u9ED1\u4F53</font>']
                ]
            }),

            // Please contact us for add more date, time format
            english_us_moreDateTimeFm: ['M d, Y, H:i:s', 'M d, Y, H:i', 'M d, Y, g:i:s A', 'l, M d, Y, g:i:s A', 'Y/m/d H:i', 'Y/m/d H:i:s'],
            chinese_moreDateTimeFm: ['Y\u5E74m\u6708j\u65E5', 'y\u5E74m\u6708j\u65E5', 'm\u6708j\u65E5', 'Y\u5E74m\u6708j\u65E5 G\u70B9i\u5206', 'Y\u5E74m\u6708j\u65E5 H\u70B9i\u5206', 'Y\u5E74m\u6708j\u65E5 G\u70B9i\u5206s\u79D2',
                'M d, Y, H:i:s', 'M d, Y, H:i', 'M d, Y, g:i:s A', 'l, M d, Y, g:i:s A', 'Y/m/d H:i', 'Y/m/d H:i:s'],

            // set sheet tab bar position: top OR bottom
            sheet_tab_bar_position: 'top',

            // hide or show language menu
            language_menu_hide: false,

            // disable file menu if set as false
            file_menu_hide: false,

            // disable import / export
            enableExport : false,
            enableImport : false,

            // Set the contextmenu items - here list the default list, please update the list as your needed.
            // Default are those actions:
            //        ["freeze", "split", "-", "insert", "insertCopied", "delete", "clean", "-", "hideRow", "showRow", "rowHeight", "hideColumn", "showColumn", "columnWidth", "-", "insertComment", "markRange", "insertVariable", "-", "addGroup", "cancelGroup", "hyperlink", "validate"],
            // If you want add your customized item, follow this example:
            //        {text: 'My customized item', handler: function() { alert("ok"); } }
            contextmenu_items : [ // {text: 'My customized item',handler: function() { alert("ok"); } }, 
                "freeze", "split", "-",  "delete", "clean", "-",
                "hideRow", "showRow", "rowHeight", "hideColumn", "showColumn", "columnWidth",  "-", "addGroup", "cancelGroup",
                 "hideTitle", "showTitle"],

            // this is used for set arrow menu
            // Default are those actions:
            //     ['sortAsc', 'sortDesc', 'filter', 'columnWidth', 'rowHeight', '-', 'hide', 'delete']
            arrowmenu_items : ['config', "colTitle", "icon", "hideTitle", "showTitle", '-', 'sortAsc', 'sortDesc', 'filter', 'columnWidth', 'rowHeight', '-', 'hide', 'delete'],

            // this flag is set to see whether it is standalone version - only js code
            js_standalone: false,

            /*
             * can be one of below value, if empty or '' then means default
             * default: means paste everything from the copied cells, included data and style
             * data: only paste the data from the copied cells
             * style: only paste the style from the copied cells
             * reverse: paste the copied cells in the reverse way
             */
            DEFAULT_PASTE_TYPE: '',

            // during popup sort 
            DISABLE_SORT_CURRENT_RANGE: false,

            // this is the check whether scroll bar always show ...
            SCROLLER_ALWAYS_VISIBLE: false
        })
    },

    setupDir : function(dir){
        Ext.apply(this, {
            baseDir: dir,

            IMAGES_PATH : dir+'js/EnterpriseSheet/resources/images',

            ICONS_PATH : dir+'js/EnterpriseSheet/resources/images/icons',

            TITLE_ICONS_PATH : dir+'js/EnterpriseSheet/resources/images/icons/title',

            CONDITION_ICONS_PATH: dir+'js/EnterpriseSheet/resources/images/icons/conditional_icons',

            urls: {
                'list': dir+'document/list',
                'changeFileName': dir+'document/changeFileName',
                'changeFileStared': dir+'document/changeFileStared',
                'createFile': dir+'document/createFile',
                'updateLang': dir + 'userSetting/updateLang',

                'findCells': dir+'sheet/findCells',
                'findCells2': dir+'sheet/findCells2',
                'loadCells': dir+'sheet/loadCells',
                'loadSheetInfo': dir+'sheet/loadSheetInfo',
                'loadSheet': dir+'sheet/loadSheet',
                'loadSheet2': dir+'sheet/loadSheet2',
                'loadSheet3': dir+'sheet/loadSheet3',
                'loadSheet4': dir+'sheet/loadSheet4',
                'loadActivedSheetOfFile': dir+'sheet/loadActivedSheetOfFile',
                'loadActivedSheetOfFile2': dir+'sheet/loadActivedSheetOfFile2',
                'loadActivedSheetOfFile3': dir+'sheet/loadActivedSheetOfFile3',
                'loadSheetsOfFile': dir+'sheet/loadSheetsOfFile',
                'loadSheetsOfFile2': dir+'sheet/loadSheetsOfFile2',
                'loadSheetsOfFile3': dir+'sheet/loadSheetsOfFile3',
                'loadRange': dir+'sheet/loadRange',
                'loadRange2': dir+'sheet/loadRange2',
                'loadRange3': dir+'sheet/loadRange3',
                'loadCellOnDemand': dir+'sheet/loadCellOnDemand',
                'loadCellOnDemand2': dir+'sheet/loadCellOnDemand2',
                'loadCellOnDemand3': dir+'sheet/loadCellOnDemand3',
                'loadCellOnDemand4': dir+'sheet/loadCellOnDemand4',
                'loadElementOnDemand': dir+'sheet/loadElementOnDemand',
                'loadCalCellOnDemand': dir+'sheet/loadCalCellOnDemand',
                'loadFile': dir+'sheet/loadFile',
                'copyFromTpl': dir+'sheet/copyFromTpl',
                'importExcelUpload': dir+'sheet/uploadFile',
                'exportExcel': dir+'sheet/export',
                'uploadImage': dir+'sheet/uploadImage',

                'update': dir+'sheetCell/updateBatchCells',
                'createSheet': dir+'sheetTab/create',
                'renameSheet': dir+'sheetTab/renameSheet',
                'changeSheetColor': dir+'sheetTab/changeSheetColor',
                'deleteSheet': dir+'sheetTab/deleteSheet',
                'copySheet': dir+'sheetTab/copySheet',
                'changeSheetOrder': dir+'sheetTab/changeSheetOrder',
                'updateSheetTab': dir+'sheetTab/update',

                'listCustom': dir+'sheetCustom/list',
                'addCustom': dir+'sheetCustom/create',
                'deleteCustom': dir+'sheetCustom/delete',
                'listDataset': dir+'sheetDropdown/list',
                'createDataset': dir+'sheetDropdown/createUpdate',
                'loadDataset': dir+'sheetDropdown/load',
                'deleteDataset': dir+'sheetDropdown/delete',
                'saveJsonFile': dir+'sheetapi/saveJsonFile',
                'saveFileAs': dir+'sheet/saveFileAs',
                'createServerErrorReport': dir+'forumPosting/createServerErrorReport',
                'uploadFile': dir+'sheetAttach/uploadFile',
                'downloadFile': dir+'sheetAttach/downloadFile',
                'deleteAttach': dir+'sheetAttach/deleteFile',
                'loadRangeStyle': dir+'sheet/loadRangeStyle',
                'updateExtraInfo': dir+'sheetTab/updateExtraInfo'
            },
            BLANK_PHOTO: dir+'js/EnterpriseSheet/resources/images/photo_.png',
            ATTACH_ICON16: dir+'js/EnterpriseSheet/resources/images/icons/attach1.png',
            ATTACH_ICON32: dir+'js/EnterpriseSheet/resources/images/icons/32px/attach.png'
        });
    }
}, function(){
    SCONFIG = EnterpriseSheet.Config;
});