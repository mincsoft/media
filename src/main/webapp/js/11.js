define("core/widgets/itemsCRU/editWidgets.js", ["core/rkloader.js"], function (require, exports, module) {
    'use strict';
    var t = require('rk'), e = {
        phone: function (t) {
            return /^\+?[\d\-]{4,30}$/.test($.trim(t));
        }, email: function (t) {
            return /^[\w-|\u4E00-\u9FA5]+(\.[\w-|\u4E00-\u9FA5]+)*@[\w-|\u4E00-\u9FA5]+(\.[\w-|\u4E00-\u9FA5]+)+$/.test($.trim(t));
        }
    };
    return $.widget('rk.textinput', {
        options: {attrs: {type: 'text'}, autoTrim: !0}, _create: function () {
            var n = this, i = e[n.options.attrs.type];
            this._on({
                blur: function (e) {
                    return 'text' !== n.options.attrs.type && n.val() && !i(n.val()) ? void $.msg(t.i18n('OLDCRM_CORE_2')) : void n._trigger('blur', null, {value: n.val()});
                }, keydown: function (e) {
                    var a = e.keyCode;
                    if (13 !== a || n.element.is('textarea') && 'list' != n.options.from) {
                        if (27 === a) {
                            if ('text' !== n.options.attrs.type && n.val() && !i(n.val()))return void $.msg(t.i18n('OLDCRM_CORE_2'));
                            n._trigger('cancel', null, {value: n.val()});
                        }
                    } else {
                        if ('text' !== n.options.attrs.type && n.val() && !i(n.val()))return void $.msg(t.i18n('OLDCRM_CORE_2'));
                        n._trigger('blur', null, {value: n.val()});
                    }
                }
            }), window.seajs && seajs.data.dev && this._on({
                keydown: function (t) {
                    var e = t.keyCode, n = $(t.target);
                    if (119 === e && t.ctrlKey) {
                        var i = new Array($.r(new Array(50).fill(0).map(function (t, e) {
                            return e + 1;
                        }))).fill(0).map(function () {
                            return String.fromCharCode($.r(13312, 40959));
                        }).join('');
                        n.is(':input') && n.val(i);
                    }
                }
            }), this.element.attr(this.options.attrs).val(this.options.defaultValue || '').focus().select();
        }, val: function (t) {
            return void 0 !== t ? this.element.val(t) : this.options.autoTrim ? $.trim(this.element.val()) : this.element.val();
        }, destroy: function () {
            this._off(this.element), this.element.remove();
        }
    }), ['email', 'number', 'tel', 'url'].forEach(function (t) {
        $.widget('rk.' + t + 'input', $.rk.textinput, {attrs: {type: t}});
    }), $.widget('rk.textarea', $.rk.textinput, {}), $.widget('ech.multiselect', $.ech.multiselect, {
        _bindEvents: function () {
            this._super(), this.val(this.options.defaultValue);
        }, val: function (t) {
            var e = this.options.multiple;
            if (!arguments.length) {
                var n = this.element.find('option:selected'), i = n.map(function (t, e, n) {
                    return e = $(e), n = e.val(), {label: e.text(), value: n ? +n : null};
                }).get();
                return e ? i : i.length ? i[0] : null;
            }
            e && $.isArray(t) && this.element.val(t.map(function (t) {
                return t.value;
            })) && this.refresh(!0), !e && $.isPlainObject(t) && this.element.val(t.value) && this.refresh(!0);
        }, _bindLeaveHandler: function () {
            var t = this;
            $(document).unbind('mousedown' + t.eventNamespace).bind('mousedown' + t.eventNamespace, function (e) {
                $.contains(t.menu[0], e.target) || $.contains(t.button[0], e.target) || e.target === t.button[0] || (t._isOpen ? t.close() : t._trigger('blur', null, {value: t.val()}), t.options && t.options.from && 'list' == t.options.from && $(document).unbind('mousedown' + t.eventNamespace));
            });
        }, destroy: function () {
            this._super(), $(document).off('mousedown' + this.eventNamespace);
        }
    }), function () {
        var t = {
            options: {}, _create: function () {
                var t = this;
                this.dpInstance = this.element.val(this.options.defaultValue ? Globalize.format(new Date(this.options.defaultValue - 0), 'yyyy-MM-dd') : '').datepicker($.extend({
                    changeMonth: !0,
                    changeYear: !0,
                    onClose: function (e) {
                        t._trigger('close', null, {value: t.val()});
                    }
                }, this.options, {defaultDate: new Date(this.options.defaultValue)}));
            }, val: function (t) {
                if (!arguments.length) {
                    var e = this.element.datepicker('getDate');
                    return e ? e : void 0;
                }
                this.element.datepicker('setDate', new Date(t));
            }
        };
        'destroy,dialog,getDate,hide,isDisabled,option,refresh,setDate,show,widget'.split(',').forEach(function (e) {
            t[e] = function () {
                this.element.datepicker.apply(this.dpInstance, [e].concat(Array.prototype.slice.call(arguments)));
            };
        }), $.widget('rk.datepickerwidget', t);
    }(), $.widget('rk.administrative', {
        options: {
            selectmenu: {showTitle: !0},
            require: !1,
            tmpl: '<select></select><select></select><select></select>',
            defaultValue: '',
            blur: null
        }, _create: function () {
            var t = this;
            require.async(['core/data/province_data.js'], function (e) {
                t.init(e);
            });
        }, init: function (t) {
            var e = this, n = e.options;
            this.mkDataMap(t.root.province), 9 != n.belongId ? (this.selects = $(this.options.tmpl), this.state = this.selects.eq(0), this.city = this.selects.eq(1), this.area = this.selects.eq(2), this.state.on('selectmenuchange' + this.eventNamespace, function (t) {
                var n = e.state.val();
                e.refreshOptions(e.city, e.stateCityMap[n]);
            }), this.city.on('selectmenuchange' + this.eventNamespace, function (t) {
                var n = e.state.val(), i = e.city.val();
                e.refreshOptions(e.area, e.cityAeraMap[n + '_' + i]);
            }), this.selects.appendTo(this.element.empty()), this.selects.selectmenu(this.options.selectmenu), this.refreshOptions(this.state, this.arState), this._bindLeaveHandler()) : $('<input class=\"text\" type=\"text\" maxlength=\"500\" placeholder=\"\">').appendTo(this.element.empty()), this.options.defaultValue && this.val(this.options.defaultValue);
        }, mkDataMap: function (t) {
            var e = this;
            this.stateCityMap = {}, this.cityAeraMap = {}, this.arState = t.map(function (t) {
                return e.stateCityMap[t.n] = t.c.map(function (n) {
                    return e.cityAeraMap[t.n + '_' + n.n] = n.d.map(function (t) {
                        return t.n;
                    }), n.n;
                }), t.n;
            });
        }, refreshOptions: function (t, e) {
            var n = ['<option value=\"', '\">', '</option>'], i = (e || []).map(function (t) {
                return n.join(t);
            });
            this.options.require ? t.empty() : t.html('<option value=\"\">请选择</option>'), t.append(i).selectmenu('refresh').trigger('selectmenuchange');
        }, val: function (t) {
            return arguments.length ? (t = t || '', t = String(t).split('/'), void this.selects.each(function (e, n) {
                t[e] && $(this).val(t[e]).selectmenu('refresh').trigger('selectmenuchange');
            })) : this.selects.map(function () {
                return $(this).val();
            }).get().filter(function (t) {
                return !!t;
            }).join('/');
        }, _bindLeaveHandler: function () {
            var t = this, e = this.state.selectmenu('instance'), n = e.button[0], i = e.menuWrap[0], a = this.city.selectmenu('instance'), s = a.button[0], r = a.menuWrap[0], o = this.area.selectmenu('instance'), l = o.button[0], u = o.menuWrap[0];
            $(document).unbind('mousedown' + t.eventNamespace).bind('mousedown' + t.eventNamespace, function (e) {
                $.contains(n, e.target) || e.target === n || $.contains(i, e.target) || e.target === i || $.contains(s, e.target) || e.target === s || $.contains(r, e.target) || e.target === r || $.contains(l, e.target) || e.target === l || $.contains(u, e.target) || e.target === u || (t._trigger('blur', null, {value: t.val()}), t.options && t.options.from && 'list' == t.options.from && $(document).unbind('mousedown' + t.eventNamespace));
            });
        }, destroy: function () {
            this._super(), $(document).off('mousedown' + this.eventNamespace), this.selects.selectmenu('destroy'), this.selects.off();
        }
    }), $.widget('rk.multipic', $.rk.multipictureupload, {
        _init: function () {
            var e = this, n = (e.options, e.element);
            this._super(), n.find('.upload_more_frame').append('<div style=\"margin-top:10px;\"><a class=\"pg-btn-blue pic_confirm btn dinline-block border-radius0 lfloat\">' + t.i18n('CRM_CORE_SAVE') + '</a><a class=\"pg-btn-cancel pic_cancel btn dinline-block border-radius0 lfloat\" style=\"margin-left:20px;\">' + t.i18n('CRM_CORE_CANCEL') + '</a></div>'), n.on('click', 'a.pic_confirm', function () {
                e._trigger('blur', null, {value: e.val()});
            }), n.on('click', 'a.pic_cancel', function () {
                e._trigger('blur', null, {value: e.orignalVal()});
            });
        }
    }), $.widget('rk.useCondition', {
        _create: function () {
            var t = this;
            t._on({
                blur: function (e) {
                    t._trigger('blur', null, {value: t.val()});
                }
            });
        }, val: function () {
            var t = this, e = t.element, n = {}, i = {};
            n.departs = [i], i.item = 0, i.type = 10;
            var a = $.extend(!0, {}, n);
            return i.value = e.multitreeselector('val').map(function (t) {
                return {value: t.value, label: t.label};
            }), a.departs[0].value = e.multitreeselector('val').map(function (t) {
                return t.value;
            }).join(','), {label: JSON.stringify(n), value: JSON.stringify(a)};
        }, _init: function () {
            var t = this, e = t.element;
            $.postJson('/json/crm_customize/tree.action', function (n) {
                e.multitreeselector({source: n});
                var i = t.options.defaultValue;
                i = $.isPlainObject(i) ? JSON.parse(i.label) : JSON.parse(i);
                var a = i.departs, s = [];
                $.isArray(a) && $.isArray(a[0].value) && (s = a[0].value), s.length > 0 && e.multitreeselector('val', s);
            });
        }
    }), module.exports = $;
})
define("core/widgets/itemsCRU/inplaceEditors.js", ["core/rkloader.js", "core/widgets/itemsCRU/editWidgets.js"], function (require, exports, module) {
    'use strict';
    var e = require('rk');
    require('./editWidgets');
    var t = e.i18n('CRM_CORE_PLEASE_INPUT_2'), n = e.i18n('CRM_CORE_PLEASE_SELECT'), a = {
        singleselect: function (t, a, i, c) {
            var o = [{
                value: '',
                label: n + a.itemName
            }].concat(a.options.slice()), r = '<select>' + o.map(function (e) {
                    return ['<option value=\"', e.value, '\">', $.htmlEncode(e.label), '</option>'].join('');
                }).join('') + '</select>', l = $(r).appendTo(t), u = o.length > 10;
            return l.multiselect({
                header: !!u,
                multiple: !1,
                selectedList: 1,
                autoOpen: i,
                noneSelectedText: n + a.itemName,
                position: {my: 'left top', at: 'left bottom', collision: 'flipfit flip'},
                appendTo: l.scrollParent()
            }, c), u && l.multiselectfilter({
                label: '',
                width: null,
                placeholder: e.i18n('CRM_CORE_FILTER_ENTER_KEYWORD'),
                autoReset: !1
            }), l.multiselect('instance');
        }, useCondition: function (e, n, a, i) {
            var c = '<input class=\"text\" ' + (i.compWidth ? 'style=\"width:' + i.compWidth + 'px\"' : '') + '/>', o = 'useCondition', r = $(c).appendTo(e)[o]({
                attrs: {
                    maxlength: +n.inputMaxLength ? n.inputMaxLength : void 0,
                    placeholder: n.placeholder || t + n.itemName
                }
            }, i);
            return r[o]('instance');
        }, multiselect: function (t, a, i, c) {
            var o = a.options.slice(), r = '<select multiple=\"true\">' + o.map(function (e) {
                    return ['<option value=\"', e.value, '\">', $.htmlEncode(e.label), '</option>'].join('');
                }).join('') + '</select>', l = $(r).appendTo(t);
            return l.multiselect({
                selectedList: 9,
                autoOpen: i,
                checkAllText: e.i18n('SELECTALL'),
                uncheckAllText: e.i18n('UNSELECTALL'),
                noneSelectedText: n + a.itemName,
                selectedText: e.i18n('SELECTEDNUM'),
                position: {my: 'left top', at: 'left bottom', collision: 'flipfit flip'},
                appendTo: l.scrollParent()
            }, c), l.multiselect('instance');
        }, integerInput: function (e, n, a, i) {
            var c = $('<input class=\"text\" ' + (i.compWidth ? 'style=\"width:' + i.compWidth + 'px\"' : '') + '>').attr({placeholder: n.placeholder || t + n.itemName}).appendTo(e);
            return void 0 !== i.defaultValue && c.val(i.defaultValue), c.integerInput({
                numberFormat: 'd',
                create: a ? function (e, t) {
                    $(this).focus().select();
                } : void 0
            }, i), c.integerInput('instance');
        }, numberInput: function (e, n, a, i) {
            var c = $('<input class=\"text\" ' + (i.compWidth ? 'style=\"width:' + i.compWidth + 'px\"' : '') + '>').attr({placeholder: n.placeholder || t + n.itemName}).appendTo(e);
            return void 0 !== i.defaultValue && c.val(i.defaultValue), c.numberInput({
                numberFormat: 'n',
                decimals: n.resolution,
                isCurrency: n.currencyFlg,
                create: a ? function (e, t) {
                    $(this).focus().select();
                } : void 0
            }, i), c.numberInput('instance');
        }, datepickerwidget: function (e, t, a, i) {
            var c = $('<input class=\"text\" ' + (i.compWidth ? 'style=\"width:' + i.compWidth + 'px\"' : '') + '>').attr({placeholder: t.placeholder || n + t.itemName}).appendTo(e);
            return c.datepickerwidget({
                create: function (e, t) {
                    a && $(this).datepickerwidget('show');
                }
            }, i), c.datepickerwidget('instance');
        }, startDate: function (e, t, n, i) {
            var c = e.parent().parent().parent().find('div[data-item-primary=endDate]').text();
            i.maxDate = c, a.datepickerwidget(e, t, n, i);
        }, endDate: function (e, t, n, i) {
            var c = e.parent().parent().parent().find('div[data-item-primary=startDate]').text();
            i.minDate = c, a.datepickerwidget(e, t, n, i);
        }, datetimepicker: function (e, t, n, a) {
            var i = $('<span></span>').appendTo(e);
            return i.datetimepicker({
                create: function (e, t) {
                    n && $(':data(datepicker)', this).datepicker('show');
                }
            }, a, {datetime: a.defaultValue ? new Date(a.defaultValue) : null}), i.datetimepicker('instance');
        }, relation: function (t, a, i, c) {
            var o, r = {
                1: '/json/crm_search/all-accounts.action?accountTypes=1',
                2: '/json/oa_search/search-contact.action',
                3: '/json/crm_search/opportunity.action',
                4: '/json/crm_search/product.action',
                5: '/json/crm_search/users.action',
                6: '/json/oa_search/fcbk-campaign.action?pageNo=1',
                9: '/json/crm_search/accounts.action?accountType=2',
                10: '/json/crm_search/accounts.action?accountType=3',
                11: '/json/oa_search/search-lead.action',
                15: '/json/oa_search/search-contract.action',
                16: '',
                35: '/json/crm_search/order.action',
                111: '/json/crm_search/activityrecord.action',
                50: ''
            };
            if (o = a.relationBelongId > 999 ? '/json/crm_search/customize.action' : r[a.relationBelongId]) {
                if (6 != a.relationBelongId) {
                    var l = {pageNo: 1, belongId: a.relationBelongId};
                    o += (~o.indexOf('?') ? '&' : '?') + $.param(l);
                }
                var u = $('<input class=\"text\" ' + (c.compWidth ? 'style=\"width:' + c.compWidth + 'px\"' : '') + '>').attr({placeholder: a.placeholder || n + a.itemName}).appendTo(t);
                if (r[a.relationBelongId] || a.relationBelongId > 999) {
                    var s = 'picker_add';
                    c.from && 'list' == c.from && (s = 'picker_add_list');
                    var d = $('<a class=\"' + s + '\" href=\"javascript:void(0)\">查找</a>');
                    d.appendTo(t);
                    var p = {};
                    if ('contract.opportunityId' == a.entryPropertyName && (c.entityData.accountId.value || c.entityData.accountId)) {
                        var m = c.entityData.accountId.value || c.entityData.accountId;
                        p = {item: 'accountId', value: m}, o += (~o.indexOf('?') ? '&' : '?') + 'accountId=' + m;
                    }
                    if ('opportunity.campaignId' == a.entryPropertyName && (c.entityData.accountId.value || c.entityData.accountId)) {
                        var m = c.entityData.accountId.value || c.entityData.accountId;
                        p = {
                            item: 'accountId',
                            value: m
                        }, o = '/json/crm_campaign/search-for-create-opportunity.action?auto=1&accountId=' + m;
                    }
                    d.off('click').on('click', function () {
                        $('body').gridPicker({
                            item: a,
                            singleSelect: 'singlerow',
                            searchCondition: p,
                            onConfirm: function (t) {
                                if (t.length > 0) {
                                    var n, i = e.queryBelong(a.relationBelongId > 999 ? 999 : a.relationBelongId);
                                    n = 'contract' == i.name ? 'title' : 'activityrecord' == i.name ? 'content' : i.name + 'Name';
                                    var c = {
                                        id: t[0].id,
                                        key: t[0].id,
                                        value: t[0].id,
                                        name: a.relationBelongId > 999 ? t[0].name : t[0][n],
                                        label: a.relationBelongId > 999 ? t[0].name : t[0][n],
                                        icon: a.relationBelongId > 999 ? 'auto_select_ico account_ico' : 'auto_select_ico custom_ico'
                                    };
                                    e.closeDialog(), u.acSingleAddPicker('val', c);
                                } else e.closeDialog();
                            }
                        });
                    });
                }
                return u.acSingleAddPicker({
                    source: o, create: function (e, t) {
                        $(this).focus();
                    }
                }, c).acSingleAddPicker('val', c.defaultValue), u.acSingleAddPicker('instance');
            }
        }, administrative: function (e, t, n, a) {
            var i = $('<span class=\"ui-select-buttonset\"></span>').appendTo(e);
            return i.administrative({
                belongId: t.belongId,
                require: t.mustEnterFlg,
                selectmenu: {appendTo: e.scrollParent()},
                create: function (e, t) {
                    $('select:first', this).selectmenu('open');
                }
            }, a), i.administrative('instance');
        }, singletreeselector: function (e, t, n, a) {
            var i = $('<input/>').appendTo(e), c = t.belongId, o = {
                departId: 1,
                dimDepart: 1,
                dimProduct: 2,
                dimArea: 3,
                dimIndustry: 4,
                dimBusiness: 5
            }[t.entryPropertyNameOnly];
            return i.singletreeselector({source: '/json/crm_dimension/dim-tree.action?belongId=' + c + '&dimType=' + o}, a), i.singletreeselector('instance');
        }, singleproducttreeselector: function (e, t, n, a) {
            var i = $('<input/>').appendTo(e);
            t.belongId;
            return i.singletreeselector({source: '/json/crm_product/canViewTree.action'}, a), i.singletreeselector('instance');
        }, multiAutocomplete: function (e, t, n, a) {
            var i = ($('<div class=\"name_select\"><input class=\"js-input\"></div></br>').appendTo(e), e.find('.js-input'));
            return i.infoAcMulti({
                source: '/json/crm_search/product.action?pageNo=1', create: function (e, t) {
                    $(this).focus();
                }
            }, a), a.defaultValue.length && i.infoAcMulti('val', $.map(a.defaultValue, function (e) {
                return e.icon ? {label: e.label, value: e.value, icon: e.icon} : {label: e.label, value: e.value};
            })), i.infoAcMulti('instance');
        }, singlepeopleselector: function (e, t, n, a) {
            var i = $('<input/>').appendTo(e);
            return i.singlepeopleselector({
                create: function (e, t) {
                    $(this).focus();
                }
            }, a), i.singlepeopleselector('instance');
        }, multipic: function (e, t, n, a) {
            var i = $('<div></div>').appendTo(e);
            return i.multipic({maxLength: t.inputMaxLength || 1}, a), a.defaultValue.length && i.multipic('val', $.parseJSON(a.defaultValue)), i.multipic('instance');
        }
    };
    ['textinput', 'emailinput', 'numberinput', 'telinput', 'urlinput', 'textarea'].forEach(function (e) {
        a[e] = function (n, a, i, c) {
            var o = 'textarea' == e ? '<textarea ' + (c.compWidth ? 'style=\"width:' + c.compWidth + 'px\"' : '') + '></textarea>' : '<input class=\"text\" ' + (c.compWidth ? 'style=\"width:' + c.compWidth + 'px\"' : '') + '/>', r = 'text';
            22 == a.searchType ? r = 'phone' : 23 == a.searchType && (r = 'email');
            var l = $(o).appendTo(n)[e]({
                attrs: {
                    maxlength: +a.inputMaxLength ? a.inputMaxLength : void 0,
                    placeholder: a.placeholder || t + a.itemName,
                    type: r
                }
            }, c);
            return l[e]('instance');
        };
    }), module.exports = a;
})
define("crm/js/core/grid/gridEditor.js", ["core/rkloader.js", "core/widgets/itemsCRU/inplaceEditors.js"], function (require, exports, module) {
    'use strict';
    var e = require('rk'), t = require('core/widgets/itemsCRU/inplaceEditors'), i = (e.i18n('CRM_CORE_PLEASE_INPUT_2'), e.i18n('CRM_CORE_PLEASE_SELECT'));
    t.singleselect = function (t, n, o, l) {
        var c = n.options ? n.options.slice() : [];
        n.options || $.each(n.values, function (e, t) {
            c.push(t);
        });
        var s = [{
            id: '',
            name: i + n.itemName
        }].concat(c), p = '<select style=\"width:' + l.compWidth + 'px\">' + s.map(function (e) {
                return ['<option value=\"', e.id, '\">', $.htmlEncode(e.name), '</option>'].join('');
            }).join('') + '</select>', a = $(p).appendTo(t), m = s.length > 10;
        return a.multiselect({
            header: !!m,
            minWidth: l.compWidth,
            multiple: !1,
            selectedList: 1,
            autoOpen: o,
            noneSelectedText: i + n.itemName,
            position: {my: 'left top', at: 'left bottom', collision: 'flipfit flip'},
            appendTo: a.scrollParent()
        }, l), m && a.multiselectfilter({
            label: '',
            width: null,
            placeholder: e.i18n('CRM_CORE_FILTER_ENTER_KEYWORD'),
            autoReset: !1
        }), a.multiselect('instance');
    }, t.multiselect = function (t, n, o, l) {
        var c = n.options ? n.options.slice() : [];
        n.options || $.each(n.values, function (e, t) {
            c.push(t);
        });
        var s = '<select multiple=\"true\" style=\"width:' + l.compWidth + 'px\">' + c.map(function (e) {
                return ['<option value=\"', e.id, '\">', $.htmlEncode(e.name), '</option>'].join('');
            }).join('') + '</select>', p = $(s).appendTo(t);
        return p.multiselect({
            selectedList: 9,
            minWidth: l.compWidth,
            autoOpen: o,
            checkAllText: e.i18n('SELECTALL'),
            uncheckAllText: e.i18n('UNSELECTALL'),
            noneSelectedText: i + n.itemName,
            selectedText: e.i18n('SELECTEDNUM'),
            position: {my: 'left top', at: 'left bottom', collision: 'flipfit flip'},
            appendTo: p.scrollParent()
        }, l), p.multiselect('instance');
    }, module.exports = t;
})
define("crm/js/core/grid/tmpl/gridFilterPop.tpl", [], "<div class=\"crm-filter-thumbnail border-radius0\"> <div class=\"crm-filter-thumbnail-arrow pabsolute\"> <div class=\"crm-filter-thumbnail-inside pabsolute\"></div> </div> <div class=\"crm-filter-thumbnail-content\"> <div class=\"crm-filter-sort-list\"> <ul> <li><a href=\"javascript:;\"><i class=\"asc-ico\"></i>{{ 'CRM_CORE_FILTER_SORT_ASC' | i18n }}A-Z</a></li> <li><a href=\"javascript:;\"><i class=\"desc-ico\"></i>{{ 'CRM_CORE_FILTER_SORT_DESC' | i18n }}Z-A</a></li> </ul> </div> <div class=\"crm-filter-divider\"></div> <div class=\"crm-filter-detail-content\"> <div class=\"crm-filter-detail-header overflow-hidden\"> <div class=\"title lfloat\">{{ 'CRM_CORE_FILTER_FILTERS' | i18n }}</div> <a href=\"javascript:;\" class=\"remove-filter rfloat dblock\">{{ 'CRM_CORE_FILTER_CLEAR' | i18n }}</a> </div> <div class=\"crm-filter-detail-body\"> </div> <div class=\"crm-filter-detail-footer clear\"> <a href=\"javascript:;\" class=\"pop-grid-link lfloat\" style=\"display:none;margin-top:10px;margin-left:20px;\">更多选择</a> <div class=\"crm-filter-footer-btn-group overflow-hidden rfloat\"> <a href=\"javascript:;\" class=\"btn pg-btn-blue ablock lfloat\">{{ 'CRM_CORE_CONFIRM' | i18n }}</a> <a href=\"javascript:;\" class=\"btn pg-btn-white ablock lfloat\">{{ 'CRM_CORE_CANCEL' | i18n }}</a> </div> </div> </div> </div> </div>")
define("crm/js/core/grid/tmpl/subgridPopup.tpl", [], "<div id=\"crmSubGridPopup\" class=\"crm-subgrid-popup\"> <div class=\"title\"> <span>{{title}}</span> </div> <div class=\"subgrid\"></div> </div>")
define("crm/js/core/grid/tmpl/cascadeItem.tpl", [], "<div class=\"add_new_list clear\" id=\"cascadeEdit\"> <form> {{each items as item i}} <div class=\"field clear editable\"> {{if item.mustEnterFlg == 1}}<span class=\"necessary\">*</span>{{/if}} <div class=\"field_name\">{{item.itemName}}</div> <div class=\"\"> <select style=\"width:200px;height:30px;\" class=\"tixin\" itemId=\"{{item.itemId}}\" name=\"'{{item.itemCode}}__{{item.itemId}}'\" mustEnterFlg=\"{{item.mustEnterFlg}}\" {{if !item.isEdit}} disabled=\"disabled\"{{/if}}> <option value=\"\">请选择</option> {{each item.dependentOptions as option j}} <option value=\"{{option.optionCode}}\" {{if option.optionCode == item.itemValue}}selected{{/if}}>{{option.optionName}}</option> {{/each}} <select> <span  style=\"color:red;display:none;\">&nbsp;&nbsp;必填项</span> </div> </div> {{/each}} </form> </div>")
define("lib/fullcalendar/fullcalendar.js", [], function (require, exports, module) {
    (function (factory) {
        factory($, moment);
    }(function ($, moment) {
        ;
        ;
        var defaults = {
            lang: 'en',
            defaultTimedEventDuration: '02:00:00',
            defaultAllDayEventDuration: {days: 1},
            forceEventDuration: false,
            nextDayThreshold: '09:00:00',
            defaultView: 'month',
            aspectRatio: 1.35,
            header: {left: 'title', center: '', right: 'today prev,next'},
            weekends: true,
            weekNumbers: false,
            weekNumberTitle: 'W',
            weekNumberCalculation: 'local',
            lazyFetching: true,
            startParam: 'start',
            endParam: 'end',
            timezoneParam: 'timezone',
            timezone: false,
            titleFormat: {month: 'MMMM YYYY', week: 'll', day: 'LL'},
            columnFormat: {month: 'ddd', week: generateWeekColumnFormat, day: 'dddd'},
            timeFormat: {'default': generateShortTimeFormat},
            displayEventEnd: {month: false, basicWeek: false, 'default': true},
            isRTL: false,
            defaultButtonText: {
                prev: 'prev',
                next: 'next',
                prevYear: 'prev year',
                nextYear: 'next year',
                today: 'today',
                month: 'month',
                week: 'week',
                day: 'day'
            },
            buttonIcons: {
                prev: 'left-single-arrow',
                next: 'right-single-arrow',
                prevYear: 'left-double-arrow',
                nextYear: 'right-double-arrow'
            },
            theme: false,
            themeButtonIcons: {
                prev: 'circle-triangle-w',
                next: 'circle-triangle-e',
                prevYear: 'seek-prev',
                nextYear: 'seek-next'
            },
            unselectAuto: true,
            dropAccept: '*',
            handleWindowResize: true,
            windowResizeDelay: 200
        };

        function generateShortTimeFormat(options, langData) {
            return langData.longDateFormat('LT').replace(':mm', '(:mm)').replace(/(\Wmm)$/, '($1)').replace(/\s*a$/i, 't');
        }

        function generateWeekColumnFormat(options, langData) {
            var format = langData.longDateFormat('L');
            format = format.replace(/^Y+[^\w\s]*|[^\w\s]*Y+$/g, '');
            if (options.isRTL) {
                format += ' ddd';
            } else {
                format = 'ddd ' + format;
            }
            return format;
        }

        var langOptionHash = {en: {columnFormat: {week: 'ddd M/D'}}};
        var rtlDefaults = {
            header: {left: 'next,prev today', center: '', right: 'title'},
            buttonIcons: {
                prev: 'right-single-arrow',
                next: 'left-single-arrow',
                prevYear: 'right-double-arrow',
                nextYear: 'left-double-arrow'
            },
            themeButtonIcons: {
                prev: 'circle-triangle-e',
                next: 'circle-triangle-w',
                nextYear: 'seek-prev',
                prevYear: 'seek-next'
            }
        };
        ;
        ;
        var fc = $.fullCalendar = {version: '2.0.2'};
        var fcViews = fc.views = {};
        $.fn.fullCalendar = function (options) {
            var args = Array.prototype.slice.call(arguments, 1);
            var res = this;
            this.each(function (i, _element) {
                var element = $(_element);
                var calendar = element.data('fullCalendar');
                var singleRes;
                if (typeof options === 'string') {
                    if (calendar && $.isFunction(calendar[options])) {
                        singleRes = calendar[options].apply(calendar, args);
                        if (!i) {
                            res = singleRes;
                        }
                        if (options === 'destroy') {
                            element.removeData('fullCalendar');
                        }
                    }
                } else if (!calendar) {
                    calendar = new Calendar(element, options);
                    element.data('fullCalendar', calendar);
                    calendar.render();
                }
            });
            return res;
        };
        function setDefaults(d) {
            mergeOptions(defaults, d);
        }

        function mergeOptions(target) {
            function mergeIntoTarget(name, value) {
                if ($.isPlainObject(value) && $.isPlainObject(target[name]) && !isForcedAtomicOption(name)) {
                    target[name] = mergeOptions({}, target[name], value);
                } else if (value !== undefined) {
                    target[name] = value;
                }
            }

            for (var i = 1; i < arguments.length; i++) {
                $.each(arguments[i], mergeIntoTarget);
            }
            return target;
        }

        function isForcedAtomicOption(name) {
            return /(Time|Duration)$/.test(name);
        };
        ;
        fc.langs = langOptionHash;
        fc.datepickerLang = function (langCode, datepickerLangCode, options) {
            var langOptions = langOptionHash[langCode];
            if (!langOptions) {
                langOptions = langOptionHash[langCode] = {};
            }
            mergeOptions(langOptions, {
                isRTL: options.isRTL,
                weekNumberTitle: options.weekHeader,
                titleFormat: {month: options.showMonthAfterYear ? 'YYYY[' + options.yearSuffix + '] MMMM' : 'MMMM YYYY[' + options.yearSuffix + ']'},
                defaultButtonText: {
                    prev: stripHTMLEntities(options.prevText),
                    next: stripHTMLEntities(options.nextText),
                    today: stripHTMLEntities(options.currentText)
                }
            });
            if ($.datepicker) {
                $.datepicker.regional[datepickerLangCode] = $.datepicker.regional[langCode] = options;
                $.datepicker.regional.en = $.datepicker.regional[''];
                $.datepicker.setDefaults(options);
            }
        };
        fc.lang = function (langCode, options) {
            var langOptions;
            if (options) {
                langOptions = langOptionHash[langCode];
                if (!langOptions) {
                    langOptions = langOptionHash[langCode] = {};
                }
                mergeOptions(langOptions, options || {});
            }
            defaults.lang = langCode;
        };
        ;
        ;
        function Calendar(element, instanceOptions) {
            var t = this;
            instanceOptions = instanceOptions || {};
            var options = mergeOptions({}, defaults, instanceOptions);
            var langOptions;
            if (options.lang in langOptionHash) {
                langOptions = langOptionHash[options.lang];
            } else {
                langOptions = langOptionHash[defaults.lang];
            }
            if (langOptions) {
                options = mergeOptions({}, defaults, langOptions, instanceOptions);
            }
            if (options.isRTL) {
                options = mergeOptions({}, defaults, rtlDefaults, langOptions || {}, instanceOptions);
            }
            t.options = options;
            t.render = render;
            t.destroy = destroy;
            t.refetchEvents = refetchEvents;
            t.reportEvents = reportEvents;
            t.reportEventChange = reportEventChange;
            t.rerenderEvents = rerenderEvents;
            t.changeView = changeView;
            t.select = select;
            t.unselect = unselect;
            t.prev = prev;
            t.next = next;
            t.prevYear = prevYear;
            t.nextYear = nextYear;
            t.today = today;
            t.gotoDate = gotoDate;
            t.incrementDate = incrementDate;
            t.getDate = getDate;
            t.getCalendar = getCalendar;
            t.getView = getView;
            t.option = option;
            t.trigger = trigger;
            var langData = createObject(moment.langData(options.lang));
            if (options.monthNames) {
                langData._months = options.monthNames;
            }
            if (options.monthNamesShort) {
                langData._monthsShort = options.monthNamesShort;
            }
            if (options.dayNames) {
                langData._weekdays = options.dayNames;
            }
            if (options.dayNamesShort) {
                langData._weekdaysShort = options.dayNamesShort;
            }
            if (options.firstDay != null) {
                var _week = createObject(langData._week);
                _week.dow = options.firstDay;
                langData._week = _week;
            }
            t.defaultAllDayEventDuration = moment.duration(options.defaultAllDayEventDuration);
            t.defaultTimedEventDuration = moment.duration(options.defaultTimedEventDuration);
            t.moment = function () {
                var mom;
                if (options.timezone === 'local') {
                    mom = fc.moment.apply(null, arguments);
                    if (mom.hasTime()) {
                        mom.local();
                    }
                } else if (options.timezone === 'UTC') {
                    mom = fc.moment.utc.apply(null, arguments);
                } else {
                    mom = fc.moment.parseZone.apply(null, arguments);
                }
                mom._lang = langData;
                return mom;
            };
            t.getIsAmbigTimezone = function () {
                return options.timezone !== 'local' && options.timezone !== 'UTC';
            };
            t.rezoneDate = function (date) {
                return t.moment(date.toArray());
            };
            t.getNow = function () {
                var now = options.now;
                if (typeof now === 'function') {
                    now = now();
                }
                return t.moment(now);
            };
            t.calculateWeekNumber = function (mom) {
                var calc = options.weekNumberCalculation;
                if (typeof calc === 'function') {
                    return calc(mom);
                } else if (calc === 'local') {
                    return mom.week();
                } else if (calc.toUpperCase() === 'ISO') {
                    return mom.isoWeek();
                }
            };
            t.getEventEnd = function (event) {
                if (event.end) {
                    return event.end.clone();
                } else {
                    return t.getDefaultEventEnd(event.allDay, event.start);
                }
            };
            t.getDefaultEventEnd = function (allDay, start) {
                var end = start.clone();
                if (allDay) {
                    end.stripTime().add(t.defaultAllDayEventDuration);
                } else {
                    end.add(t.defaultTimedEventDuration);
                }
                if (t.getIsAmbigTimezone()) {
                    end.stripZone();
                }
                return end;
            };
            t.formatRange = function (m1, m2, formatStr) {
                if (typeof formatStr === 'function') {
                    formatStr = formatStr.call(t, options, langData);
                }
                return formatRange(m1, m2, formatStr, null, options.isRTL);
            };
            t.formatDate = function (mom, formatStr) {
                if (typeof formatStr === 'function') {
                    formatStr = formatStr.call(t, options, langData);
                }
                return formatDate(mom, formatStr);
            };
            EventManager.call(t, options);
            var isFetchNeeded = t.isFetchNeeded;
            var fetchEvents = t.fetchEvents;
            var _element = element[0];
            var header;
            var headerElement;
            var content;
            var tm;
            var currentView;
            var elementOuterWidth;
            var suggestedViewHeight;
            var resizeUID = 0;
            var ignoreWindowResize = 0;
            var date;
            var events = [];
            var _dragElement;
            if (options.defaultDate != null) {
                date = t.moment(options.defaultDate);
            } else {
                date = t.getNow();
            }
            function render(inc) {
                if (!content) {
                    initialRender();
                } else if (elementVisible()) {
                    calcSize();
                    _renderView(inc);
                }
            }

            function initialRender() {
                tm = options.theme ? 'ui' : 'fc';
                element.addClass('fc');
                if (options.isRTL) {
                    element.addClass('fc-rtl');
                } else {
                    element.addClass('fc-ltr');
                }
                if (options.theme) {
                    element.addClass('ui-widget');
                }
                content = $('<div class=\'fc-content\' />').prependTo(element);
                header = new Header(t, options);
                headerElement = header.render();
                if (headerElement) {
                    element.prepend(headerElement);
                }
                changeView(options.defaultView);
                if (options.handleWindowResize) {
                    $(window).resize(windowResize);
                }
                if (!bodyVisible()) {
                    lateRender();
                }
            }

            function lateRender() {
                setTimeout(function () {
                    if (!currentView.start && bodyVisible()) {
                        renderView();
                    }
                }, 0);
            }

            function destroy() {
                if (currentView) {
                    trigger('viewDestroy', currentView, currentView, currentView.element);
                    currentView.triggerEventDestroy();
                }
                $(window).unbind('resize', windowResize);
                if (options.droppable) {
                    $(document).off('dragstart', droppableDragStart).off('dragstop', droppableDragStop);
                }
                if (currentView.selectionManagerDestroy) {
                    currentView.selectionManagerDestroy();
                }
                header.destroy();
                content.remove();
                element.removeClass('fc fc-ltr fc-rtl ui-widget');
            }

            function elementVisible() {
                return element.is(':visible');
            }

            function bodyVisible() {
                return $('body').is(':visible');
            }

            function changeView(newViewName) {
                if (!currentView || newViewName != currentView.name) {
                    _changeView(newViewName);
                }
            }

            function _changeView(newViewName) {
                ignoreWindowResize++;
                if (currentView) {
                    trigger('viewDestroy', currentView, currentView, currentView.element);
                    unselect();
                    currentView.triggerEventDestroy();
                    freezeContentHeight();
                    currentView.element.remove();
                    header.deactivateButton(currentView.name);
                }
                header.activateButton(newViewName);
                currentView = new fcViews[newViewName]($('<div class=\'fc-view fc-view-' + newViewName + '\' />').appendTo(content), t);
                renderView();
                unfreezeContentHeight();
                ignoreWindowResize--;
            }

            function renderView(inc) {
                if (!currentView.start || inc || !date.isWithin(currentView.intervalStart, currentView.intervalEnd)) {
                    if (elementVisible()) {
                        _renderView(inc);
                    }
                }
            }

            function _renderView(inc) {
                ignoreWindowResize++;
                if (currentView.start) {
                    trigger('viewDestroy', currentView, currentView, currentView.element);
                    unselect();
                    clearEvents();
                }
                freezeContentHeight();
                if (inc) {
                    date = currentView.incrementDate(date, inc);
                }
                currentView.render(date.clone());
                setSize();
                unfreezeContentHeight();
                (currentView.afterRender || noop)();
                updateTitle();
                updateTodayButton();
                trigger('viewRender', currentView, currentView, currentView.element);
                ignoreWindowResize--;
                getAndRenderEvents();
            }

            function updateSize() {
                if (elementVisible()) {
                    unselect();
                    clearEvents();
                    calcSize();
                    setSize();
                    renderEvents();
                }
            }

            function calcSize() {
                if (options.contentHeight) {
                    suggestedViewHeight = options.contentHeight;
                } else if (options.height) {
                    suggestedViewHeight = options.height - (headerElement ? headerElement.height() : 0) - vsides(content);
                } else {
                    suggestedViewHeight = Math.round(content.width() / Math.max(options.aspectRatio, 0.5));
                }
            }

            function setSize() {
                if (suggestedViewHeight === undefined) {
                    calcSize();
                }
                ignoreWindowResize++;
                currentView.setHeight(suggestedViewHeight);
                currentView.setWidth(content.width());
                ignoreWindowResize--;
                elementOuterWidth = element.outerWidth();
            }

            function windowResize(ev) {
                if (!ignoreWindowResize && ev.target === window) {
                    if (currentView.start) {
                        var uid = ++resizeUID;
                        setTimeout(function () {
                            if (uid == resizeUID && !ignoreWindowResize && elementVisible()) {
                                if (elementOuterWidth != (elementOuterWidth = element.outerWidth())) {
                                    ignoreWindowResize++;
                                    updateSize();
                                    currentView.trigger('windowResize', _element);
                                    ignoreWindowResize--;
                                }
                            }
                        }, options.windowResizeDelay);
                    } else {
                        lateRender();
                    }
                }
            }

            function refetchEvents() {
                clearEvents();
                fetchAndRenderEvents();
            }

            function rerenderEvents(modifiedEventID) {
                clearEvents();
                renderEvents(modifiedEventID);
            }

            function renderEvents(modifiedEventID) {
                if (elementVisible()) {
                    currentView.renderEvents(events, modifiedEventID);
                    currentView.trigger('eventAfterAllRender');
                }
            }

            function clearEvents() {
                currentView.triggerEventDestroy();
                currentView.clearEvents();
                currentView.clearEventData();
            }

            function getAndRenderEvents() {
                if (!options.lazyFetching || isFetchNeeded(currentView.start, currentView.end)) {
                    fetchAndRenderEvents();
                } else {
                    renderEvents();
                }
            }

            function fetchAndRenderEvents() {
                fetchEvents(currentView.start, currentView.end);
            }

            function reportEvents(_events) {
                events = _events;
                renderEvents();
            }

            function reportEventChange(eventID) {
                rerenderEvents(eventID);
            }

            function updateTitle() {
                header.updateTitle(currentView.title);
            }

            function updateTodayButton() {
                var now = t.getNow();
                if (now.isWithin(currentView.intervalStart, currentView.intervalEnd)) {
                    header.disableButton('today');
                } else {
                    header.enableButton('today');
                }
            }

            function select(start, end) {
                currentView.select(start, end);
            }

            function unselect() {
                if (currentView) {
                    currentView.unselect();
                }
            }

            function prev() {
                renderView(-1);
            }

            function next() {
                renderView(1);
            }

            function prevYear() {
                date.add('years', -1);
                renderView();
            }

            function nextYear() {
                date.add('years', 1);
                renderView();
            }

            function today() {
                date = t.getNow();
                renderView();
            }

            function gotoDate(dateInput) {
                date = t.moment(dateInput);
                renderView();
            }

            function incrementDate(delta) {
                date.add(moment.duration(delta));
                renderView();
            }

            function getDate() {
                return date.clone();
            }

            function freezeContentHeight() {
                content.css({width: '100%', height: content.height(), overflow: 'hidden'});
            }

            function unfreezeContentHeight() {
                content.css({width: '', height: '', overflow: ''});
            }

            function getCalendar() {
                return t;
            }

            function getView() {
                return currentView;
            }

            function option(name, value) {
                if (value === undefined) {
                    return options[name];
                }
                if (name == 'height' || name == 'contentHeight' || name == 'aspectRatio') {
                    options[name] = value;
                    updateSize();
                }
            }

            function trigger(name, thisObj) {
                if (options[name]) {
                    return options[name].apply(thisObj || _element, Array.prototype.slice.call(arguments, 2));
                }
            }

            if (options.droppable) {
                $(document).on('dragstart', droppableDragStart).on('dragstop', droppableDragStop);
            }
            function droppableDragStart(ev, ui) {
                var _e = ev.target;
                var e = $(_e);
                if (!e.parents('.fc').length) {
                    var accept = options.dropAccept;
                    if ($.isFunction(accept) ? accept.call(_e, e) : e.is(accept)) {
                        _dragElement = _e;
                        currentView.dragStart(_dragElement, ev, ui);
                    }
                }
            }

            function droppableDragStop(ev, ui) {
                if (_dragElement) {
                    currentView.dragStop(_dragElement, ev, ui);
                    _dragElement = null;
                }
            }
        };
        ;
        function Header(calendar, options) {
            var t = this;
            t.render = render;
            t.destroy = destroy;
            t.updateTitle = updateTitle;
            t.activateButton = activateButton;
            t.deactivateButton = deactivateButton;
            t.disableButton = disableButton;
            t.enableButton = enableButton;
            var element = $([]);
            var tm;

            function render() {
                tm = options.theme ? 'ui' : 'fc';
                var sections = options.header;
                if (sections) {
                    element = $('<table class=\'fc-header\' style=\'width:100%\'/>').append($('<tr/>').append(renderSection('left')).append(renderSection('center')).append(renderSection('right')));
                    return element;
                }
            }

            function destroy() {
                element.remove();
            }

            function renderSection(position) {
                var e = $('<td class=\'fc-header-' + position + '\'/>');
                var buttonStr = options.header[position];
                if (buttonStr) {
                    $.each(buttonStr.split(' '), function (i) {
                        if (i > 0) {
                            e.append('<span class=\'fc-header-space\'/>');
                        }
                        var prevButton;
                        $.each(this.split(','), function (j, buttonName) {
                            if (buttonName == 'title') {
                                e.append('<span class=\'fc-header-title\'><h2>&nbsp;</h2></span>');
                                if (prevButton) {
                                    prevButton.addClass(tm + '-corner-right');
                                }
                                prevButton = null;
                            } else {
                                var buttonClick;
                                if (calendar[buttonName]) {
                                    buttonClick = calendar[buttonName];
                                } else if (fcViews[buttonName]) {
                                    buttonClick = function () {
                                        button.removeClass(tm + '-state-hover');
                                        calendar.changeView(buttonName);
                                    };
                                }
                                if (buttonClick) {
                                    var themeIcon = smartProperty(options.themeButtonIcons, buttonName);
                                    var normalIcon = smartProperty(options.buttonIcons, buttonName);
                                    var defaultText = smartProperty(options.defaultButtonText, buttonName);
                                    var customText = smartProperty(options.buttonText, buttonName);
                                    var html;
                                    if (customText) {
                                        html = htmlEscape(customText);
                                    } else if (themeIcon && options.theme) {
                                        html = '<span class=\'ui-icon ui-icon-' + themeIcon + '\'></span>';
                                    } else if (normalIcon && !options.theme) {
                                        html = '<span class=\'fc-icon fc-icon-' + normalIcon + '\'></span>';
                                    } else {
                                        html = htmlEscape(defaultText || buttonName);
                                    }
                                    var button = $('<span class=\'fc-button fc-button-' + buttonName + ' ' + tm + '-state-default\'>' + html + '</span>').click(function () {
                                        if (!button.hasClass(tm + '-state-disabled')) {
                                            buttonClick();
                                        }
                                    }).mousedown(function () {
                                        button.not('.' + tm + '-state-active').not('.' + tm + '-state-disabled').addClass(tm + '-state-down');
                                    }).mouseup(function () {
                                        button.removeClass(tm + '-state-down');
                                    }).hover(function () {
                                        button.not('.' + tm + '-state-active').not('.' + tm + '-state-disabled').addClass(tm + '-state-hover');
                                    }, function () {
                                        button.removeClass(tm + '-state-hover').removeClass(tm + '-state-down');
                                    }).appendTo(e);
                                    disableTextSelection(button);
                                    if (!prevButton) {
                                        button.addClass(tm + '-corner-left');
                                    }
                                    prevButton = button;
                                }
                            }
                        });
                        if (prevButton) {
                            prevButton.addClass(tm + '-corner-right');
                        }
                    });
                }
                return e;
            }

            function updateTitle(html) {
                element.find('h2').html(html);
            }

            function activateButton(buttonName) {
                element.find('span.fc-button-' + buttonName).addClass(tm + '-state-active');
            }

            function deactivateButton(buttonName) {
                element.find('span.fc-button-' + buttonName).removeClass(tm + '-state-active');
            }

            function disableButton(buttonName) {
                element.find('span.fc-button-' + buttonName).addClass(tm + '-state-disabled');
            }

            function enableButton(buttonName) {
                element.find('span.fc-button-' + buttonName).removeClass(tm + '-state-disabled');
            }
        };
        ;
        fc.sourceNormalizers = [];
        fc.sourceFetchers = [];
        var ajaxDefaults = {dataType: 'json', cache: false};
        var eventGUID = 1;

        function EventManager(options) {
            var t = this;
            t.isFetchNeeded = isFetchNeeded;
            t.fetchEvents = fetchEvents;
            t.addEventSource = addEventSource;
            t.removeEventSource = removeEventSource;
            t.updateEvent = updateEvent;
            t.renderEvent = renderEvent;
            t.removeEvents = removeEvents;
            t.clientEvents = clientEvents;
            t.mutateEvent = mutateEvent;
            var trigger = t.trigger;
            var getView = t.getView;
            var reportEvents = t.reportEvents;
            var getEventEnd = t.getEventEnd;
            var stickySource = {events: []};
            var sources = [stickySource];
            var rangeStart, rangeEnd;
            var currentFetchID = 0;
            var pendingSourceCnt = 0;
            var loadingLevel = 0;
            var cache = [];
            $.each((options.events ? [options.events] : []).concat(options.eventSources || []), function (i, sourceInput) {
                var source = buildEventSource(sourceInput);
                if (source) {
                    sources.push(source);
                }
            });
            function isFetchNeeded(start, end) {
                return !rangeStart || start.clone().stripZone() < rangeStart.clone().stripZone() || end.clone().stripZone() > rangeEnd.clone().stripZone();
            }

            function fetchEvents(start, end) {
                rangeStart = start;
                rangeEnd = end;
                cache = [];
                var fetchID = ++currentFetchID;
                var len = sources.length;
                pendingSourceCnt = len;
                for (var i = 0; i < len; i++) {
                    fetchEventSource(sources[i], fetchID);
                }
            }

            function getEvents(start, end) {
            }

            function fetchEventSource(source, fetchID) {
                _fetchEventSource(source, function (events) {
                    var isArraySource = $.isArray(source.events);
                    var i;
                    var event;
                    if (fetchID == currentFetchID) {
                        if (events) {
                            for (i = 0; i < events.length; i++) {
                                event = events[i];
                                if (!isArraySource) {
                                    event = buildEvent(event, source);
                                }
                                if (event) {
                                    cache.push(event);
                                }
                            }
                        }
                        pendingSourceCnt--;
                        if (!pendingSourceCnt) {
                            reportEvents(cache);
                        }
                    }
                });
            }

            function _fetchEventSource(source, callback) {
                var i;
                var fetchers = fc.sourceFetchers;
                var res;
                for (i = 0; i < fetchers.length; i++) {
                    res = fetchers[i].call(t, source, rangeStart.clone(), rangeEnd.clone(), options.timezone, callback);
                    if (res === true) {
                        return;
                    } else if (typeof res == 'object') {
                        _fetchEventSource(res, callback);
                        return;
                    }
                }
                var events = source.events;
                if (events) {
                    if ($.isFunction(events)) {
                        pushLoading();
                        events.call(t, rangeStart.clone(), rangeEnd.clone(), options.timezone, function (events) {
                            callback(events);
                            popLoading();
                        });
                    } else if ($.isArray(events)) {
                        callback(events);
                    } else {
                        callback();
                    }
                } else {
                    var url = source.url;
                    if (url) {
                        var success = source.success;
                        var error = source.error;
                        var complete = source.complete;
                        var customData;
                        if ($.isFunction(source.data)) {
                            customData = source.data();
                        } else {
                            customData = source.data;
                        }
                        var data = $.extend({}, customData || {});
                        var startParam = firstDefined(source.startParam, options.startParam);
                        var endParam = firstDefined(source.endParam, options.endParam);
                        var timezoneParam = firstDefined(source.timezoneParam, options.timezoneParam);
                        if (startParam) {
                            data[startParam] = rangeStart.format();
                        }
                        if (endParam) {
                            data[endParam] = rangeEnd.format();
                        }
                        if (options.timezone && options.timezone != 'local') {
                            data[timezoneParam] = options.timezone;
                        }
                        pushLoading();
                        $.ajax($.extend({}, ajaxDefaults, source, {
                            data: data, success: function (events) {
                                events = events || [];
                                var res = applyAll(success, this, arguments);
                                if ($.isArray(res)) {
                                    events = res;
                                }
                                callback(events);
                            }, error: function () {
                                applyAll(error, this, arguments);
                                callback();
                            }, complete: function () {
                                applyAll(complete, this, arguments);
                                popLoading();
                            }
                        }));
                    } else {
                        callback();
                    }
                }
            }

            function addEventSource(sourceInput) {
                var source = buildEventSource(sourceInput);
                if (source) {
                    sources.push(source);
                    pendingSourceCnt++;
                    fetchEventSource(source, currentFetchID);
                }
            }

            function buildEventSource(sourceInput) {
                var normalizers = fc.sourceNormalizers;
                var source;
                var i;
                if ($.isFunction(sourceInput) || $.isArray(sourceInput)) {
                    source = {events: sourceInput};
                } else if (typeof sourceInput === 'string') {
                    source = {url: sourceInput};
                } else if (typeof sourceInput === 'object') {
                    source = $.extend({}, sourceInput);
                    if (typeof source.className === 'string') {
                        source.className = source.className.split(/\s+/);
                    }
                }
                if (source) {
                    if ($.isArray(source.events)) {
                        source.events = $.map(source.events, function (eventInput) {
                            return buildEvent(eventInput, source);
                        });
                    }
                    for (i = 0; i < normalizers.length; i++) {
                        normalizers[i].call(t, source);
                    }
                    return source;
                }
            }

            function removeEventSource(source) {
                sources = $.grep(sources, function (src) {
                    return !isSourcesEqual(src, source);
                });
                cache = $.grep(cache, function (e) {
                    return !isSourcesEqual(e.source, source);
                });
                reportEvents(cache);
            }

            function isSourcesEqual(source1, source2) {
                return source1 && source2 && getSourcePrimitive(source1) == getSourcePrimitive(source2);
            }

            function getSourcePrimitive(source) {
                return (typeof source == 'object' ? source.events || source.url : '') || source;
            }

            function updateEvent(event) {
                event.start = t.moment(event.start);
                if (event.end) {
                    event.end = t.moment(event.end);
                }
                mutateEvent(event);
                propagateMiscProperties(event);
                reportEvents(cache);
            }

            var miscCopyableProps = ['title', 'url', 'allDay', 'className', 'editable', 'color', 'backgroundColor', 'borderColor', 'textColor'];

            function propagateMiscProperties(event) {
                var i;
                var cachedEvent;
                var j;
                var prop;
                for (i = 0; i < cache.length; i++) {
                    cachedEvent = cache[i];
                    if (cachedEvent._id == event._id && cachedEvent !== event) {
                        for (j = 0; j < miscCopyableProps.length; j++) {
                            prop = miscCopyableProps[j];
                            if (event[prop] !== undefined) {
                                cachedEvent[prop] = event[prop];
                            }
                        }
                    }
                }
            }

            function renderEvent(eventData, stick) {
                var event = buildEvent(eventData);
                if (event) {
                    if (!event.source) {
                        if (stick) {
                            stickySource.events.push(event);
                            event.source = stickySource;
                        }
                        cache.push(event);
                    }
                    reportEvents(cache);
                }
            }

            function removeEvents(filter) {
                var eventID;
                var i;
                if (filter == null) {
                    filter = function () {
                        return true;
                    };
                } else if (!$.isFunction(filter)) {
                    eventID = filter + '';
                    filter = function (event) {
                        return event._id == eventID;
                    };
                }
                cache = $.grep(cache, filter, true);
                for (i = 0; i < sources.length; i++) {
                    if ($.isArray(sources[i].events)) {
                        sources[i].events = $.grep(sources[i].events, filter, true);
                    }
                }
                reportEvents(cache);
            }

            function clientEvents(filter) {
                if ($.isFunction(filter)) {
                    return $.grep(cache, filter);
                } else if (filter != null) {
                    filter += '';
                    return $.grep(cache, function (e) {
                        return e._id == filter;
                    });
                }
                return cache;
            }

            function pushLoading() {
                if (!loadingLevel++) {
                    trigger('loading', null, true, getView());
                }
            }

            function popLoading() {
                if (!--loadingLevel) {
                    trigger('loading', null, false, getView());
                }
            }

            function buildEvent(data, source) {
                var out = {};
                var start;
                var end;
                var allDay;
                var allDayDefault;
                if (options.eventDataTransform) {
                    data = options.eventDataTransform(data);
                }
                if (source && source.eventDataTransform) {
                    data = source.eventDataTransform(data);
                }
                start = t.moment(data.start || data.date);
                if (!start.isValid()) {
                    return;
                }
                end = null;
                if (data.end) {
                    end = t.moment(data.end);
                    if (!end.isValid()) {
                        return;
                    }
                }
                allDay = data.allDay;
                if (allDay === undefined) {
                    allDayDefault = firstDefined(source ? source.allDayDefault : undefined, options.allDayDefault);
                    if (allDayDefault !== undefined) {
                        allDay = allDayDefault;
                    } else {
                        allDay = !start.hasTime() && (!end || !end.hasTime());
                    }
                }
                if (allDay) {
                    if (start.hasTime()) {
                        start.stripTime();
                    }
                    if (end && end.hasTime()) {
                        end.stripTime();
                    }
                } else {
                    if (!start.hasTime()) {
                        start = t.rezoneDate(start);
                    }
                    if (end && !end.hasTime()) {
                        end = t.rezoneDate(end);
                    }
                }
                $.extend(out, data);
                if (source) {
                    out.source = source;
                }
                out._id = data._id || (data.id === undefined ? '_fc' + eventGUID++ : data.id + '');
                if (data.className) {
                    if (typeof data.className == 'string') {
                        out.className = data.className.split(/\s+/);
                    } else {
                        out.className = data.className;
                    }
                } else {
                    out.className = [];
                }
                out.allDay = allDay;
                out.start = start;
                out.end = end;
                if (options.forceEventDuration && !out.end) {
                    out.end = getEventEnd(out);
                }
                backupEventDates(out);
                return out;
            }

            function mutateEvent(event, newStart, newEnd) {
                var oldAllDay = event._allDay;
                var oldStart = event._start;
                var oldEnd = event._end;
                var clearEnd = false;
                var newAllDay;
                var dateDelta;
                var durationDelta;
                var undoFunc;
                if (!newStart && !newEnd) {
                    newStart = event.start;
                    newEnd = event.end;
                }
                if (event.allDay != oldAllDay) {
                    newAllDay = event.allDay;
                } else {
                    newAllDay = !(newStart || newEnd).hasTime();
                }
                if (newAllDay) {
                    if (newStart) {
                        newStart = newStart.clone().stripTime();
                    }
                    if (newEnd) {
                        newEnd = newEnd.clone().stripTime();
                    }
                }
                if (newStart) {
                    if (newAllDay) {
                        dateDelta = dayishDiff(newStart, oldStart.clone().stripTime());
                    } else {
                        dateDelta = dayishDiff(newStart, oldStart);
                    }
                }
                if (newAllDay != oldAllDay) {
                    clearEnd = true;
                } else if (newEnd) {
                    durationDelta = dayishDiff(newEnd || t.getDefaultEventEnd(newAllDay, newStart || oldStart), newStart || oldStart).subtract(dayishDiff(oldEnd || t.getDefaultEventEnd(oldAllDay, oldStart), oldStart));
                }
                undoFunc = mutateEvents(clientEvents(event._id), clearEnd, newAllDay, dateDelta, durationDelta);
                return {dateDelta: dateDelta, durationDelta: durationDelta, undo: undoFunc};
            }

            function mutateEvents(events, clearEnd, forceAllDay, dateDelta, durationDelta) {
                var isAmbigTimezone = t.getIsAmbigTimezone();
                var undoFunctions = [];
                $.each(events, function (i, event) {
                    var oldAllDay = event._allDay;
                    var oldStart = event._start;
                    var oldEnd = event._end;
                    var newAllDay = forceAllDay != null ? forceAllDay : oldAllDay;
                    var newStart = oldStart.clone();
                    var newEnd = !clearEnd && oldEnd ? oldEnd.clone() : null;
                    if (newAllDay) {
                        newStart.stripTime();
                        if (newEnd) {
                            newEnd.stripTime();
                        }
                    } else {
                        if (!newStart.hasTime()) {
                            newStart = t.rezoneDate(newStart);
                        }
                        if (newEnd && !newEnd.hasTime()) {
                            newEnd = t.rezoneDate(newEnd);
                        }
                    }
                    if (!newEnd && (options.forceEventDuration || +durationDelta)) {
                        newEnd = t.getDefaultEventEnd(newAllDay, newStart);
                    }
                    newStart.add(dateDelta);
                    if (newEnd) {
                        newEnd.add(dateDelta).add(durationDelta);
                    }
                    if (isAmbigTimezone) {
                        if (+dateDelta || +durationDelta) {
                            newStart.stripZone();
                            if (newEnd) {
                                newEnd.stripZone();
                            }
                        }
                    }
                    event.allDay = newAllDay;
                    event.start = newStart;
                    event.end = newEnd;
                    backupEventDates(event);
                    undoFunctions.push(function () {
                        event.allDay = oldAllDay;
                        event.start = oldStart;
                        event.end = oldEnd;
                        backupEventDates(event);
                    });
                });
                return function () {
                    for (var i = 0; i < undoFunctions.length; i++) {
                        undoFunctions[i]();
                    }
                };
            }
        }

        function backupEventDates(event) {
            event._allDay = event.allDay;
            event._start = event.start.clone();
            event._end = event.end ? event.end.clone() : null;
        };
        ;
        fc.applyAll = applyAll;
        function createObject(proto) {
            var f = function () {
            };
            f.prototype = proto;
            return new f();
        }

        function extend(a, b) {
            for (var i in b) {
                if (b.hasOwnProperty(i)) {
                    a[i] = b[i];
                }
            }
        }

        var dayIDs = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

        function dayishDiff(d1, d0) {
            return moment.duration({
                days: d1.clone().stripTime().diff(d0.clone().stripTime(), 'days'),
                ms: d1.time() - d0.time()
            });
        }

        function isNativeDate(input) {
            return Object.prototype.toString.call(input) === '[object Date]' || input instanceof Date;
        }

        function lazySegBind(container, segs, bindHandlers) {
            container.unbind('mouseover').mouseover(function (ev) {
                var parent = ev.target, e, i, seg;
                while (parent != this) {
                    e = parent;
                    parent = parent.parentNode;
                }
                if ((i = e._fci) !== undefined) {
                    e._fci = undefined;
                    seg = segs[i];
                    bindHandlers(seg.event, seg.element, seg);
                    $(ev.target).trigger(ev);
                }
                ev.stopPropagation();
            });
        }

        function setOuterWidth(element, width, includeMargins) {
            for (var i = 0, e; i < element.length; i++) {
                e = $(element[i]);
                e.width(Math.max(0, width - hsides(e, includeMargins)));
            }
        }

        function setOuterHeight(element, height, includeMargins) {
            for (var i = 0, e; i < element.length; i++) {
                e = $(element[i]);
                e.height(Math.max(0, height - vsides(e, includeMargins)));
            }
        }

        function hsides(element, includeMargins) {
            return hpadding(element) + hborders(element) + (includeMargins ? hmargins(element) : 0);
        }

        function hpadding(element) {
            return (parseFloat($.css(element[0], 'paddingLeft', true)) || 0) + (parseFloat($.css(element[0], 'paddingRight', true)) || 0);
        }

        function hmargins(element) {
            return (parseFloat($.css(element[0], 'marginLeft', true)) || 0) + (parseFloat($.css(element[0], 'marginRight', true)) || 0);
        }

        function hborders(element) {
            return (parseFloat($.css(element[0], 'borderLeftWidth', true)) || 0) + (parseFloat($.css(element[0], 'borderRightWidth', true)) || 0);
        }

        function vsides(element, includeMargins) {
            return vpadding(element) + vborders(element) + (includeMargins ? vmargins(element) : 0);
        }

        function vpadding(element) {
            return (parseFloat($.css(element[0], 'paddingTop', true)) || 0) + (parseFloat($.css(element[0], 'paddingBottom', true)) || 0);
        }

        function vmargins(element) {
            return (parseFloat($.css(element[0], 'marginTop', true)) || 0) + (parseFloat($.css(element[0], 'marginBottom', true)) || 0);
        }

        function vborders(element) {
            return (parseFloat($.css(element[0], 'borderTopWidth', true)) || 0) + (parseFloat($.css(element[0], 'borderBottomWidth', true)) || 0);
        }

        function noop() {
        }

        function dateCompare(a, b) {
            return a - b;
        }

        function arrayMax(a) {
            return Math.max.apply(Math, a);
        }

        function smartProperty(obj, name) {
            obj = obj || {};
            if (obj[name] !== undefined) {
                return obj[name];
            }
            var parts = name.split(/(?=[A-Z])/), i = parts.length - 1, res;
            for (; i >= 0; i--) {
                res = obj[parts[i].toLowerCase()];
                if (res !== undefined) {
                    return res;
                }
            }
            return obj['default'];
        }

        function htmlEscape(s) {
            return (s + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#039;').replace(/\"/g, '&quot;').replace(/\n/g, '<br />');
        }

        function stripHTMLEntities(text) {
            return text.replace(/&.*?;/g, '');
        }

        function disableTextSelection(element) {
            element.attr('unselectable', 'on').css('MozUserSelect', 'none').bind('selectstart.ui', function () {
                return false;
            });
        }

        function markFirstLast(e) {
            e.children().removeClass('fc-first fc-last').filter(':first-child').addClass('fc-first').end().filter(':last-child').addClass('fc-last');
        }

        function getSkinCss(event, opt) {
            var source = event.source || {};
            var eventColor = event.color;
            var sourceColor = source.color;
            var optionColor = opt('eventColor');
            var backgroundColor = event.backgroundColor || eventColor || source.backgroundColor || sourceColor || opt('eventBackgroundColor') || optionColor;
            var borderColor = event.borderColor || eventColor || source.borderColor || sourceColor || opt('eventBorderColor') || optionColor;
            var textColor = event.textColor || source.textColor || opt('eventTextColor');
            var statements = [];
            if (backgroundColor) {
                statements.push('background-color:' + backgroundColor);
            }
            if (borderColor) {
                statements.push('border-color:' + borderColor);
            }
            if (textColor) {
                statements.push('color:' + textColor);
            }
            return statements.join(';');
        }

        function applyAll(functions, thisObj, args) {
            if ($.isFunction(functions)) {
                functions = [functions];
            }
            if (functions) {
                var i;
                var ret;
                for (i = 0; i < functions.length; i++) {
                    ret = functions[i].apply(thisObj, args) || ret;
                }
                return ret;
            }
        }

        function firstDefined() {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] !== undefined) {
                    return arguments[i];
                }
            }
        };
        ;
        var ambigDateOfMonthRegex = /^\s*\d{4}-\d\d$/;
        var ambigTimeOrZoneRegex = /^\s*\d{4}-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?)?$/;
        fc.moment = function () {
            return makeMoment(arguments);
        };
        fc.moment.utc = function () {
            var mom = makeMoment(arguments, true);
            if (mom.hasTime()) {
                mom.utc();
            }
            return mom;
        };
        fc.moment.parseZone = function () {
            return makeMoment(arguments, true, true);
        };
        function makeMoment(args, parseAsUTC, parseZone) {
            var input = args[0];
            var isSingleString = args.length == 1 && typeof input === 'string';
            var isAmbigTime;
            var isAmbigZone;
            var ambigMatch;
            var output;
            if (moment.isMoment(input)) {
                output = moment.apply(null, args);
                if (input._ambigTime) {
                    output._ambigTime = true;
                }
                if (input._ambigZone) {
                    output._ambigZone = true;
                }
            } else if (isNativeDate(input) || input === undefined) {
                output = moment.apply(null, args);
            } else {
                isAmbigTime = false;
                isAmbigZone = false;
                if (isSingleString) {
                    if (ambigDateOfMonthRegex.test(input)) {
                        input += '-01';
                        args = [input];
                        isAmbigTime = true;
                        isAmbigZone = true;
                    } else if (ambigMatch = ambigTimeOrZoneRegex.exec(input)) {
                        isAmbigTime = !ambigMatch[5];
                        isAmbigZone = true;
                    }
                } else if ($.isArray(input)) {
                    isAmbigZone = true;
                }
                if (parseAsUTC) {
                    output = moment.utc.apply(moment, args);
                } else {
                    output = moment.apply(null, args);
                }
                if (isAmbigTime) {
                    output._ambigTime = true;
                    output._ambigZone = true;
                } else if (parseZone) {
                    if (isAmbigZone) {
                        output._ambigZone = true;
                    } else if (isSingleString) {
                        output.zone(input);
                    }
                }
            }
            return new FCMoment(output);
        }

        function FCMoment(internalData) {
            extend(this, internalData);
        }

        FCMoment.prototype = createObject(moment.fn);
        FCMoment.prototype.clone = function () {
            return makeMoment([this]);
        };
        FCMoment.prototype.time = function (time) {
            if (time == null) {
                return moment.duration({
                    hours: this.hours(),
                    minutes: this.minutes(),
                    seconds: this.seconds(),
                    milliseconds: this.milliseconds()
                });
            } else {
                delete this._ambigTime;
                if (!moment.isDuration(time) && !moment.isMoment(time)) {
                    time = moment.duration(time);
                }
                var dayHours = 0;
                if (moment.isDuration(time)) {
                    dayHours = Math.floor(time.asDays()) * 24;
                }
                return this.hours(dayHours + time.hours()).minutes(time.minutes()).seconds(time.seconds()).milliseconds(time.milliseconds());
            }
        };
        FCMoment.prototype.stripTime = function () {
            var a = this.toArray();
            moment.fn.utc.call(this);
            this.year(a[0]).month(a[1]).date(a[2]).hours(0).minutes(0).seconds(0).milliseconds(0);
            this._ambigTime = true;
            this._ambigZone = true;
            return this;
        };
        FCMoment.prototype.hasTime = function () {
            return !this._ambigTime;
        };
        FCMoment.prototype.stripZone = function () {
            var a = this.toArray();
            var wasAmbigTime = this._ambigTime;
            moment.fn.utc.call(this);
            this.year(a[0]).month(a[1]).date(a[2]).hours(a[3]).minutes(a[4]).seconds(a[5]).milliseconds(a[6]);
            if (wasAmbigTime) {
                this._ambigTime = true;
            }
            this._ambigZone = true;
            return this;
        };
        FCMoment.prototype.hasZone = function () {
            return !this._ambigZone;
        };
        FCMoment.prototype.zone = function (tzo) {
            if (tzo != null) {
                delete this._ambigTime;
                delete this._ambigZone;
            }
            return moment.fn.zone.apply(this, arguments);
        };
        FCMoment.prototype.local = function () {
            var a = this.toArray();
            var wasAmbigZone = this._ambigZone;
            delete this._ambigTime;
            delete this._ambigZone;
            moment.fn.local.apply(this, arguments);
            if (wasAmbigZone) {
                this.year(a[0]).month(a[1]).date(a[2]).hours(a[3]).minutes(a[4]).seconds(a[5]).milliseconds(a[6]);
            }
            return this;
        };
        FCMoment.prototype.utc = function () {
            delete this._ambigTime;
            delete this._ambigZone;
            return moment.fn.utc.apply(this, arguments);
        };
        FCMoment.prototype.format = function () {
            if (arguments[0]) {
                return formatDate(this, arguments[0]);
            }
            if (this._ambigTime) {
                return momentFormat(this, 'YYYY-MM-DD');
            }
            if (this._ambigZone) {
                return momentFormat(this, 'YYYY-MM-DD[T]HH:mm:ss');
            }
            return momentFormat(this);
        };
        FCMoment.prototype.toISOString = function () {
            if (this._ambigTime) {
                return momentFormat(this, 'YYYY-MM-DD');
            }
            if (this._ambigZone) {
                return momentFormat(this, 'YYYY-MM-DD[T]HH:mm:ss');
            }
            return moment.fn.toISOString.apply(this, arguments);
        };
        FCMoment.prototype.isWithin = function (start, end) {
            var a = commonlyAmbiguate([this, start, end]);
            return a[0] >= a[1] && a[0] < a[2];
        };
        $.each(['isBefore', 'isAfter', 'isSame'], function (i, methodName) {
            FCMoment.prototype[methodName] = function (input, units) {
                var a = commonlyAmbiguate([this, input]);
                return moment.fn[methodName].call(a[0], a[1], units);
            };
        });
        function commonlyAmbiguate(inputs) {
            var outputs = [];
            var anyAmbigTime = false;
            var anyAmbigZone = false;
            var i;
            for (i = 0; i < inputs.length; i++) {
                outputs.push(fc.moment(inputs[i]));
                anyAmbigTime = anyAmbigTime || outputs[i]._ambigTime;
                anyAmbigZone = anyAmbigZone || outputs[i]._ambigZone;
            }
            for (i = 0; i < outputs.length; i++) {
                if (anyAmbigTime) {
                    outputs[i].stripTime();
                } else if (anyAmbigZone) {
                    outputs[i].stripZone();
                }
            }
            return outputs;
        };
        ;
        function momentFormat(mom, formatStr) {
            return moment.fn.format.call(mom, formatStr);
        }

        function formatDate(date, formatStr) {
            return formatDateWithChunks(date, getFormatStringChunks(formatStr));
        }

        function formatDateWithChunks(date, chunks) {
            var s = '';
            var i;
            for (i = 0; i < chunks.length; i++) {
                s += formatDateWithChunk(date, chunks[i]);
            }
            return s;
        }

        var tokenOverrides = {
            t: function (date) {
                return momentFormat(date, 'a').charAt(0);
            }, T: function (date) {
                return momentFormat(date, 'A').charAt(0);
            }
        };

        function formatDateWithChunk(date, chunk) {
            var token;
            var maybeStr;
            if (typeof chunk === 'string') {
                return chunk;
            } else if (token = chunk.token) {
                if (tokenOverrides[token]) {
                    return tokenOverrides[token](date);
                }
                return momentFormat(date, token);
            } else if (chunk.maybe) {
                maybeStr = formatDateWithChunks(date, chunk.maybe);
                if (maybeStr.match(/[1-9]/)) {
                    return maybeStr;
                }
            }
            return '';
        }

        function formatRange(date1, date2, formatStr, separator, isRTL) {
            date1 = fc.moment.parseZone(date1);
            date2 = fc.moment.parseZone(date2);
            formatStr = date1.lang().longDateFormat(formatStr) || formatStr;
            separator = separator || ' - ';
            return formatRangeWithChunks(date1, date2, getFormatStringChunks(formatStr), separator, isRTL);
        }

        fc.formatRange = formatRange;
        function formatRangeWithChunks(date1, date2, chunks, separator, isRTL) {
            var chunkStr;
            var leftI;
            var leftStr = '';
            var rightI;
            var rightStr = '';
            var middleI;
            var middleStr1 = '';
            var middleStr2 = '';
            var middleStr = '';
            for (leftI = 0; leftI < chunks.length; leftI++) {
                chunkStr = formatSimilarChunk(date1, date2, chunks[leftI]);
                if (chunkStr === false) {
                    break;
                }
                leftStr += chunkStr;
            }
            for (rightI = chunks.length - 1; rightI > leftI; rightI--) {
                chunkStr = formatSimilarChunk(date1, date2, chunks[rightI]);
                if (chunkStr === false) {
                    break;
                }
                rightStr = chunkStr + rightStr;
            }
            for (middleI = leftI; middleI <= rightI; middleI++) {
                middleStr1 += formatDateWithChunk(date1, chunks[middleI]);
                middleStr2 += formatDateWithChunk(date2, chunks[middleI]);
            }
            if (middleStr1 || middleStr2) {
                if (isRTL) {
                    middleStr = middleStr2 + separator + middleStr1;
                } else {
                    middleStr = middleStr1 + separator + middleStr2;
                }
            }
            return leftStr + middleStr + rightStr;
        }

        var similarUnitMap = {
            Y: 'year',
            M: 'month',
            D: 'day',
            d: 'day',
            A: 'second',
            a: 'second',
            T: 'second',
            t: 'second',
            H: 'second',
            h: 'second',
            m: 'second',
            s: 'second'
        };

        function formatSimilarChunk(date1, date2, chunk) {
            var token;
            var unit;
            if (typeof chunk === 'string') {
                return chunk;
            } else if (token = chunk.token) {
                unit = similarUnitMap[token.charAt(0)];
                if (unit && date1.isSame(date2, unit)) {
                    return momentFormat(date1, token);
                }
            }
            return false;
        }

        var formatStringChunkCache = {};

        function getFormatStringChunks(formatStr) {
            if (formatStr in formatStringChunkCache) {
                return formatStringChunkCache[formatStr];
            }
            return formatStringChunkCache[formatStr] = chunkFormatString(formatStr);
        }

        function chunkFormatString(formatStr) {
            var chunks = [];
            var chunker = /\[([^\]]*)\]|\(([^\)]*)\)|(LT|(\w)\4*o?)|([^\w\[\(]+)/g;
            var match;
            while (match = chunker.exec(formatStr)) {
                if (match[1]) {
                    chunks.push(match[1]);
                } else if (match[2]) {
                    chunks.push({maybe: chunkFormatString(match[2])});
                } else if (match[3]) {
                    chunks.push({token: match[3]});
                } else if (match[5]) {
                    chunks.push(match[5]);
                }
            }
            return chunks;
        };
        ;
        fcViews.month = MonthView;
        function MonthView(element, calendar) {
            var t = this;
            t.incrementDate = incrementDate;
            t.render = render;
            BasicView.call(t, element, calendar, 'month');
            function incrementDate(date, delta) {
                return date.clone().stripTime().add('months', delta).startOf('month');
            }

            function render(date) {
                t.intervalStart = date.clone().stripTime().startOf('month');
                t.intervalEnd = t.intervalStart.clone().add('months', 1);
                t.start = t.intervalStart.clone();
                t.start = t.skipHiddenDays(t.start);
                t.start.startOf('week');
                t.start = t.skipHiddenDays(t.start);
                t.end = t.intervalEnd.clone();
                t.end = t.skipHiddenDays(t.end, -1, true);
                t.end.add('days', (7 - t.end.weekday()) % 7);
                t.end = t.skipHiddenDays(t.end, -1, true);
                var rowCnt = Math.ceil(t.end.diff(t.start, 'weeks', true));
                if (t.opt('weekMode') == 'fixed') {
                    t.end.add('weeks', 6 - rowCnt);
                    rowCnt = 6;
                }
                t.title = calendar.formatDate(t.intervalStart, t.opt('titleFormat'));
                t.renderBasic(rowCnt, t.getCellsPerWeek(), true);
            }
        };
        ;
        fcViews.basicWeek = BasicWeekView;
        function BasicWeekView(element, calendar) {
            var t = this;
            t.incrementDate = incrementDate;
            t.render = render;
            BasicView.call(t, element, calendar, 'basicWeek');
            function incrementDate(date, delta) {
                return date.clone().stripTime().add('weeks', delta).startOf('week');
            }

            function render(date) {
                t.intervalStart = date.clone().stripTime().startOf('week');
                t.intervalEnd = t.intervalStart.clone().add('weeks', 1);
                t.start = t.skipHiddenDays(t.intervalStart);
                t.end = t.skipHiddenDays(t.intervalEnd, -1, true);
                t.title = calendar.formatRange(t.start, t.end.clone().subtract(1), t.opt('titleFormat'), ' \u2014 ');
                t.renderBasic(1, t.getCellsPerWeek(), false);
            }
        };
        ;
        fcViews.basicDay = BasicDayView;
        function BasicDayView(element, calendar) {
            var t = this;
            t.incrementDate = incrementDate;
            t.render = render;
            BasicView.call(t, element, calendar, 'basicDay');
            function incrementDate(date, delta) {
                var out = date.clone().stripTime().add('days', delta);
                out = t.skipHiddenDays(out, delta < 0 ? -1 : 1);
                return out;
            }

            function render(date) {
                t.start = t.intervalStart = date.clone().stripTime();
                t.end = t.intervalEnd = t.start.clone().add('days', 1);
                t.title = calendar.formatDate(t.start, t.opt('titleFormat'));
                t.renderBasic(1, 1, false);
            }
        };
        ;
        setDefaults({weekMode: 'fixed'});
        function BasicView(element, calendar, viewName) {
            var t = this;
            t.renderBasic = renderBasic;
            t.setHeight = setHeight;
            t.setWidth = setWidth;
            t.renderDayOverlay = renderDayOverlay;
            t.defaultSelectionEnd = defaultSelectionEnd;
            t.renderSelection = renderSelection;
            t.clearSelection = clearSelection;
            t.reportDayClick = reportDayClick;
            t.dragStart = dragStart;
            t.dragStop = dragStop;
            t.getHoverListener = function () {
                return hoverListener;
            };
            t.colLeft = colLeft;
            t.colRight = colRight;
            t.colContentLeft = colContentLeft;
            t.colContentRight = colContentRight;
            t.getIsCellAllDay = function () {
                return true;
            };
            t.allDayRow = allDayRow;
            t.getRowCnt = function () {
                return rowCnt;
            };
            t.getColCnt = function () {
                return colCnt;
            };
            t.getColWidth = function () {
                return colWidth;
            };
            t.getDaySegmentContainer = function () {
                return daySegmentContainer;
            };
            View.call(t, element, calendar, viewName);
            OverlayManager.call(t);
            SelectionManager.call(t);
            BasicEventRenderer.call(t);
            var opt = t.opt;
            var trigger = t.trigger;
            var renderOverlay = t.renderOverlay;
            var clearOverlays = t.clearOverlays;
            var daySelectionMousedown = t.daySelectionMousedown;
            var cellToDate = t.cellToDate;
            var dateToCell = t.dateToCell;
            var rangeToSegments = t.rangeToSegments;
            var formatDate = calendar.formatDate;
            var calculateWeekNumber = calendar.calculateWeekNumber;
            var table;
            var head;
            var headCells;
            var body;
            var bodyRows;
            var bodyCells;
            var bodyFirstCells;
            var firstRowCellInners;
            var firstRowCellContentInners;
            var daySegmentContainer;
            var viewWidth;
            var viewHeight;
            var colWidth;
            var weekNumberWidth;
            var rowCnt, colCnt;
            var showNumbers;
            var coordinateGrid;
            var hoverListener;
            var colPositions;
            var colContentPositions;
            var tm;
            var colFormat;
            var showWeekNumbers;
            disableTextSelection(element.addClass('fc-grid'));
            function renderBasic(_rowCnt, _colCnt, _showNumbers) {
                rowCnt = _rowCnt;
                colCnt = _colCnt;
                showNumbers = _showNumbers;
                updateOptions();
                if (!body) {
                    buildEventContainer();
                }
                buildTable();
            }

            function updateOptions() {
                tm = opt('theme') ? 'ui' : 'fc';
                colFormat = opt('columnFormat');
                showWeekNumbers = opt('weekNumbers');
            }

            function buildEventContainer() {
                daySegmentContainer = $('<div class=\'fc-event-container\' style=\'position:absolute;z-index:8;top:0;left:0\'/>').appendTo(element);
            }

            function buildTable() {
                var html = buildTableHTML();
                if (table) {
                    table.remove();
                }
                table = $(html).appendTo(element);
                head = table.find('thead');
                headCells = head.find('.fc-day-header');
                body = table.find('tbody');
                bodyRows = body.find('tr');
                bodyCells = body.find('.fc-day');
                bodyFirstCells = bodyRows.find('td:first-child');
                firstRowCellInners = bodyRows.eq(0).find('.fc-day > div');
                firstRowCellContentInners = bodyRows.eq(0).find('.fc-day-content > div');
                markFirstLast(head.add(head.find('tr')));
                markFirstLast(bodyRows);
                bodyRows.eq(0).addClass('fc-first');
                bodyRows.filter(':last').addClass('fc-last');
                bodyCells.each(function (i, _cell) {
                    var date = cellToDate(Math.floor(i / colCnt), i % colCnt);
                    trigger('dayRender', t, date, $(_cell));
                });
                dayBind(bodyCells);
            }

            function buildTableHTML() {
                var html = '<table class=\'fc-border-separate\' style=\'width:100%\' cellspacing=\'0\'>' + buildHeadHTML() + buildBodyHTML() + '</table>';
                return html;
            }

            function buildHeadHTML() {
                var headerClass = tm + '-widget-header';
                var html = '';
                var col;
                var date;
                html += '<thead><tr>';
                if (showWeekNumbers) {
                    html += '<th class=\'fc-week-number ' + headerClass + '\'>' + htmlEscape(opt('weekNumberTitle')) + '</th>';
                }
                for (col = 0; col < colCnt; col++) {
                    date = cellToDate(0, col);
                    html += '<th class=\'fc-day-header fc-' + dayIDs[date.day()] + ' ' + headerClass + '\'>' + htmlEscape(formatDate(date, colFormat)) + '</th>';
                }
                html += '</tr></thead>';
                return html;
            }

            function buildBodyHTML() {
                var contentClass = tm + '-widget-content';
                var html = '';
                var row;
                var col;
                var date;
                html += '<tbody>';
                for (row = 0; row < rowCnt; row++) {
                    html += '<tr class=\'fc-week\'>';
                    if (showWeekNumbers) {
                        date = cellToDate(row, 0);
                        html += '<td class=\'fc-week-number ' + contentClass + '\'>' + '<div>' + htmlEscape(calculateWeekNumber(date)) + '</div>' + '</td>';
                    }
                    for (col = 0; col < colCnt; col++) {
                        date = cellToDate(row, col);
                        html += buildCellHTML(date);
                    }
                    html += '</tr>';
                }
                html += '</tbody>';
                return html;
            }

            function buildCellHTML(date) {
                var month = t.intervalStart.month();
                var today = calendar.getNow().stripTime();
                var html = '';
                var contentClass = tm + '-widget-content';
                var classNames = ['fc-day', 'fc-' + dayIDs[date.day()], contentClass];
                if (date.month() != month) {
                    classNames.push('fc-other-month');
                }
                if (date.isSame(today, 'day')) {
                    classNames.push('fc-today', tm + '-state-highlight');
                } else if (date < today) {
                    classNames.push('fc-past');
                } else {
                    classNames.push('fc-future');
                }
                html += '<td' + ' class=\'' + classNames.join(' ') + '\'' + ' data-date=\'' + date.format() + '\'' + '>' + '<div>';
                if (showNumbers) {
                    html += '<div class=\'fc-day-number\'>' + date.date() + '</div>';
                }
                html += '<div class=\'fc-day-content\'>' + '<div style=\'position:relative\'>&nbsp;</div>' + '</div>' + '</div>' + '</td>';
                return html;
            }

            function setHeight(height) {
                viewHeight = height;
                var bodyHeight = Math.max(viewHeight - head.height(), 0);
                var rowHeight;
                var rowHeightLast;
                var cell;
                if (opt('weekMode') == 'variable') {
                    rowHeight = rowHeightLast = Math.floor(bodyHeight / (rowCnt == 1 ? 2 : 6));
                } else {
                    rowHeight = Math.floor(bodyHeight / rowCnt);
                    rowHeightLast = bodyHeight - rowHeight * (rowCnt - 1);
                }
                bodyFirstCells.each(function (i, _cell) {
                    if (i < rowCnt) {
                        cell = $(_cell);
                        cell.find('> div').css('min-height', (i == rowCnt - 1 ? rowHeightLast : rowHeight) - vsides(cell));
                    }
                });
            }

            function setWidth(width) {
                viewWidth = width;
                colPositions.clear();
                colContentPositions.clear();
                weekNumberWidth = 0;
                if (showWeekNumbers) {
                    weekNumberWidth = head.find('th.fc-week-number').outerWidth();
                }
                colWidth = Math.floor((viewWidth - weekNumberWidth) / colCnt);
                setOuterWidth(headCells.slice(0, -1), colWidth);
            }

            function dayBind(days) {
                days.click(dayClick).mousedown(daySelectionMousedown);
            }

            function dayClick(ev) {
                if (!opt('selectable')) {
                    var date = calendar.moment($(this).data('date'));
                    trigger('dayClick', this, date, ev);
                }
            }

            function renderDayOverlay(overlayStart, overlayEnd, refreshCoordinateGrid) {
                if (refreshCoordinateGrid) {
                    coordinateGrid.build();
                }
                var segments = rangeToSegments(overlayStart, overlayEnd);
                for (var i = 0; i < segments.length; i++) {
                    var segment = segments[i];
                    dayBind(renderCellOverlay(segment.row, segment.leftCol, segment.row, segment.rightCol));
                }
            }

            function renderCellOverlay(row0, col0, row1, col1) {
                var rect = coordinateGrid.rect(row0, col0, row1, col1, element);
                return renderOverlay(rect, element);
            }

            function defaultSelectionEnd(start) {
                return start.clone().stripTime().add('days', 1);
            }

            function renderSelection(start, end) {
                renderDayOverlay(start, end, true);
            }

            function clearSelection() {
                clearOverlays();
            }

            function reportDayClick(date, ev) {
                var cell = dateToCell(date);
                var _element = bodyCells[cell.row * colCnt + cell.col];
                trigger('dayClick', _element, date, ev);
            }

            function dragStart(_dragElement, ev, ui) {
                hoverListener.start(function (cell) {
                    clearOverlays();
                    if (cell) {
                        var d1 = cellToDate(cell);
                        var d2 = d1.clone().add(calendar.defaultAllDayEventDuration);
                        renderDayOverlay(d1, d2);
                    }
                }, ev);
            }

            function dragStop(_dragElement, ev, ui) {
                var cell = hoverListener.stop();
                clearOverlays();
                if (cell) {
                    trigger('drop', _dragElement, cellToDate(cell), ev, ui);
                }
            }

            coordinateGrid = new CoordinateGrid(function (rows, cols) {
                var e, n, p;
                headCells.each(function (i, _e) {
                    e = $(_e);
                    n = e.offset().left;
                    if (i) {
                        p[1] = n;
                    }
                    p = [n];
                    cols[i] = p;
                });
                p[1] = n + e.outerWidth();
                bodyRows.each(function (i, _e) {
                    if (i < rowCnt) {
                        e = $(_e);
                        n = e.offset().top;
                        if (i) {
                            p[1] = n;
                        }
                        p = [n];
                        rows[i] = p;
                    }
                });
                p[1] = n + e.outerHeight();
            });
            hoverListener = new HoverListener(coordinateGrid);
            colPositions = new HorizontalPositionCache(function (col) {
                return firstRowCellInners.eq(col);
            });
            colContentPositions = new HorizontalPositionCache(function (col) {
                return firstRowCellContentInners.eq(col);
            });
            function colLeft(col) {
                return colPositions.left(col);
            }

            function colRight(col) {
                return colPositions.right(col);
            }

            function colContentLeft(col) {
                return colContentPositions.left(col);
            }

            function colContentRight(col) {
                return colContentPositions.right(col);
            }

            function allDayRow(i) {
                return bodyRows.eq(i);
            }
        };
        ;
        function BasicEventRenderer() {
            var t = this;
            t.renderEvents = renderEvents;
            t.clearEvents = clearEvents;
            DayEventRenderer.call(t);
            function renderEvents(events, modifiedEventId) {
                t.renderDayEvents(events, modifiedEventId);
            }

            function clearEvents() {
                t.getDaySegmentContainer().empty();
            }
        };
        ;
        fcViews.agendaWeek = AgendaWeekView;
        function AgendaWeekView(element, calendar) {
            var t = this;
            t.incrementDate = incrementDate;
            t.render = render;
            AgendaView.call(t, element, calendar, 'agendaWeek');
            function incrementDate(date, delta) {
                return date.clone().stripTime().add('weeks', delta).startOf('week');
            }

            function render(date) {
                t.intervalStart = date.clone().stripTime().startOf('week');
                t.intervalEnd = t.intervalStart.clone().add('weeks', 1);
                t.start = t.skipHiddenDays(t.intervalStart);
                t.end = t.skipHiddenDays(t.intervalEnd, -1, true);
                t.title = calendar.formatRange(t.start, t.end.clone().subtract(1), t.opt('titleFormat'), ' \u2014 ');
                t.renderAgenda(t.getCellsPerWeek());
            }
        };
        ;
        fcViews.agendaDay = AgendaDayView;
        function AgendaDayView(element, calendar) {
            var t = this;
            t.incrementDate = incrementDate;
            t.render = render;
            AgendaView.call(t, element, calendar, 'agendaDay');
            function incrementDate(date, delta) {
                var out = date.clone().stripTime().add('days', delta);
                out = t.skipHiddenDays(out, delta < 0 ? -1 : 1);
                return out;
            }

            function render(date) {
                t.start = t.intervalStart = date.clone().stripTime();
                t.end = t.intervalEnd = t.start.clone().add('days', 1);
                t.title = calendar.formatDate(t.start, t.opt('titleFormat'));
                t.renderAgenda(1);
            }
        };
        ;
        setDefaults({
            allDaySlot: true,
            allDayText: 'all-day',
            scrollTime: '06:00:00',
            slotDuration: '00:30:00',
            axisFormat: generateAgendaAxisFormat,
            timeFormat: {agenda: generateAgendaTimeFormat},
            dragOpacity: {agenda: 0.5},
            minTime: '00:00:00',
            maxTime: '24:00:00',
            slotEventOverlap: true
        });
        function generateAgendaAxisFormat(options, langData) {
            return langData.longDateFormat('LT').replace(':mm', '(:mm)').replace(/(\Wmm)$/, '($1)').replace(/\s*a$/i, 'a');
        }

        function generateAgendaTimeFormat(options, langData) {
            return langData.longDateFormat('LT').replace(/\s*a$/i, '');
        }

        function AgendaView(element, calendar, viewName) {
            var t = this;
            t.renderAgenda = renderAgenda;
            t.setWidth = setWidth;
            t.setHeight = setHeight;
            t.afterRender = afterRender;
            t.computeDateTop = computeDateTop;
            t.getIsCellAllDay = getIsCellAllDay;
            t.allDayRow = function () {
                return allDayRow;
            };
            t.getCoordinateGrid = function () {
                return coordinateGrid;
            };
            t.getHoverListener = function () {
                return hoverListener;
            };
            t.colLeft = colLeft;
            t.colRight = colRight;
            t.colContentLeft = colContentLeft;
            t.colContentRight = colContentRight;
            t.getDaySegmentContainer = function () {
                return daySegmentContainer;
            };
            t.getSlotSegmentContainer = function () {
                return slotSegmentContainer;
            };
            t.getSlotContainer = function () {
                return slotContainer;
            };
            t.getRowCnt = function () {
                return 1;
            };
            t.getColCnt = function () {
                return colCnt;
            };
            t.getColWidth = function () {
                return colWidth;
            };
            t.getSnapHeight = function () {
                return snapHeight;
            };
            t.getSnapDuration = function () {
                return snapDuration;
            };
            t.getSlotHeight = function () {
                return slotHeight;
            };
            t.getSlotDuration = function () {
                return slotDuration;
            };
            t.getMinTime = function () {
                return minTime;
            };
            t.getMaxTime = function () {
                return maxTime;
            };
            t.defaultSelectionEnd = defaultSelectionEnd;
            t.renderDayOverlay = renderDayOverlay;
            t.renderSelection = renderSelection;
            t.clearSelection = clearSelection;
            t.reportDayClick = reportDayClick;
            t.dragStart = dragStart;
            t.dragStop = dragStop;
            View.call(t, element, calendar, viewName);
            OverlayManager.call(t);
            SelectionManager.call(t);
            AgendaEventRenderer.call(t);
            var opt = t.opt;
            var trigger = t.trigger;
            var renderOverlay = t.renderOverlay;
            var clearOverlays = t.clearOverlays;
            var reportSelection = t.reportSelection;
            var unselect = t.unselect;
            var daySelectionMousedown = t.daySelectionMousedown;
            var slotSegHtml = t.slotSegHtml;
            var cellToDate = t.cellToDate;
            var dateToCell = t.dateToCell;
            var rangeToSegments = t.rangeToSegments;
            var formatDate = calendar.formatDate;
            var calculateWeekNumber = calendar.calculateWeekNumber;
            var dayTable;
            var dayHead;
            var dayHeadCells;
            var dayBody;
            var dayBodyCells;
            var dayBodyCellInners;
            var dayBodyCellContentInners;
            var dayBodyFirstCell;
            var dayBodyFirstCellStretcher;
            var slotLayer;
            var daySegmentContainer;
            var allDayTable;
            var allDayRow;
            var slotScroller;
            var slotContainer;
            var slotSegmentContainer;
            var slotTable;
            var selectionHelper;
            var viewWidth;
            var viewHeight;
            var axisWidth;
            var colWidth;
            var gutterWidth;
            var slotDuration;
            var slotHeight;
            var snapDuration;
            var snapRatio;
            var snapHeight;
            var colCnt;
            var slotCnt;
            var coordinateGrid;
            var hoverListener;
            var colPositions;
            var colContentPositions;
            var slotTopCache = {};
            var tm;
            var rtl;
            var minTime;
            var maxTime;
            var colFormat;
            disableTextSelection(element.addClass('fc-agenda'));
            function renderAgenda(c) {
                colCnt = c;
                updateOptions();
                if (!dayTable) {
                    buildSkeleton();
                } else {
                    buildDayTable();
                }
            }

            function updateOptions() {
                tm = opt('theme') ? 'ui' : 'fc';
                rtl = opt('isRTL');
                colFormat = opt('columnFormat');
                minTime = moment.duration(opt('minTime'));
                maxTime = moment.duration(opt('maxTime'));
                slotDuration = moment.duration(opt('slotDuration'));
                snapDuration = opt('snapDuration');
                snapDuration = snapDuration ? moment.duration(snapDuration) : slotDuration;
            }

            function buildSkeleton() {
                var s;
                var headerClass = tm + '-widget-header';
                var contentClass = tm + '-widget-content';
                var slotTime;
                var slotDate;
                var minutes;
                var slotNormal = slotDuration.asMinutes() % 15 === 0;
                buildDayTable();
                slotLayer = $('<div style=\'position:absolute;z-index:2;left:0;width:100%\'/>').appendTo(element);
                if (opt('allDaySlot')) {
                    daySegmentContainer = $('<div class=\'fc-event-container\' style=\'position:absolute;z-index:8;top:0;left:0\'/>').appendTo(slotLayer);
                    s = '<table style=\'width:100%\' class=\'fc-agenda-allday\' cellspacing=\'0\'>' + '<tr>' + '<th class=\'' + headerClass + ' fc-agenda-axis\'>' + (opt('allDayHTML') || htmlEscape(opt('allDayText'))) + '</th>' + '<td>' + '<div class=\'fc-day-content\'><div style=\'position:relative\'/></div>' + '</td>' + '<th class=\'' + headerClass + ' fc-agenda-gutter\'>&nbsp;</th>' + '</tr>' + '</table>';
                    allDayTable = $(s).appendTo(slotLayer);
                    allDayRow = allDayTable.find('tr');
                    dayBind(allDayRow.find('td'));
                    slotLayer.append('<div class=\'fc-agenda-divider ' + headerClass + '\'>' + '<div class=\'fc-agenda-divider-inner\'/>' + '</div>');
                } else {
                    daySegmentContainer = $([]);
                }
                slotScroller = $('<div style=\'position:absolute;width:100%;overflow-x:hidden;overflow-y:auto\'/>').appendTo(slotLayer);
                slotContainer = $('<div style=\'position:relative;width:100%;overflow:hidden\'/>').appendTo(slotScroller);
                slotSegmentContainer = $('<div class=\'fc-event-container\' style=\'position:absolute;z-index:8;top:0;left:0\'/>').appendTo(slotContainer);
                s = '<table class=\'fc-agenda-slots\' style=\'width:100%\' cellspacing=\'0\'>' + '<tbody>';
                slotTime = moment.duration(+minTime);
                slotCnt = 0;
                while (slotTime < maxTime) {
                    slotDate = t.start.clone().time(slotTime);
                    minutes = slotDate.minutes();
                    s += '<tr class=\'fc-slot' + slotCnt + ' ' + (!minutes ? '' : 'fc-minor') + '\'>' + '<th class=\'fc-agenda-axis ' + headerClass + '\'>' + (!slotNormal || !minutes ? htmlEscape(formatDate(slotDate, opt('axisFormat'))) : '&nbsp;') + '</th>' + '<td class=\'' + contentClass + '\'>' + '<div style=\'position:relative\'>&nbsp;</div>' + '</td>' + '</tr>';
                    slotTime.add(slotDuration);
                    slotCnt++;
                }
                s += '</tbody>' + '</table>';
                slotTable = $(s).appendTo(slotContainer);
                slotBind(slotTable.find('td'));
            }

            function buildDayTable() {
                var html = buildDayTableHTML();
                if (dayTable) {
                    dayTable.remove();
                }
                dayTable = $(html).appendTo(element);
                dayHead = dayTable.find('thead');
                dayHeadCells = dayHead.find('th').slice(1, -1);
                dayBody = dayTable.find('tbody');
                dayBodyCells = dayBody.find('td').slice(0, -1);
                dayBodyCellInners = dayBodyCells.find('> div');
                dayBodyCellContentInners = dayBodyCells.find('.fc-day-content > div');
                dayBodyFirstCell = dayBodyCells.eq(0);
                dayBodyFirstCellStretcher = dayBodyCellInners.eq(0);
                markFirstLast(dayHead.add(dayHead.find('tr')));
                markFirstLast(dayBody.add(dayBody.find('tr')));
            }

            function buildDayTableHTML() {
                var html = '<table style=\'width:100%\' class=\'fc-agenda-days fc-border-separate\' cellspacing=\'0\'>' + buildDayTableHeadHTML() + buildDayTableBodyHTML() + '</table>';
                return html;
            }

            function buildDayTableHeadHTML() {
                var headerClass = tm + '-widget-header';
                var date;
                var html = '';
                var weekText;
                var col;
                html += '<thead>' + '<tr>';
                if (opt('weekNumbers')) {
                    date = cellToDate(0, 0);
                    weekText = calculateWeekNumber(date);
                    if (rtl) {
                        weekText += opt('weekNumberTitle');
                    } else {
                        weekText = opt('weekNumberTitle') + weekText;
                    }
                    html += '<th class=\'fc-agenda-axis fc-week-number ' + headerClass + '\'>' + htmlEscape(weekText) + '</th>';
                } else {
                    html += '<th class=\'fc-agenda-axis ' + headerClass + '\'>&nbsp;</th>';
                }
                for (col = 0; col < colCnt; col++) {
                    date = cellToDate(0, col);
                    html += '<th class=\'fc-' + dayIDs[date.day()] + ' fc-col' + col + ' ' + headerClass + '\'>' + htmlEscape(formatDate(date, colFormat)) + '</th>';
                }
                html += '<th class=\'fc-agenda-gutter ' + headerClass + '\'>&nbsp;</th>' + '</tr>' + '</thead>';
                return html;
            }

            function buildDayTableBodyHTML() {
                var headerClass = tm + '-widget-header';
                var contentClass = tm + '-widget-content';
                var date;
                var today = calendar.getNow().stripTime();
                var col;
                var cellsHTML;
                var cellHTML;
                var classNames;
                var html = '';
                html += '<tbody>' + '<tr>' + '<th class=\'fc-agenda-axis ' + headerClass + '\'>&nbsp;</th>';
                cellsHTML = '';
                for (col = 0; col < colCnt; col++) {
                    date = cellToDate(0, col);
                    classNames = ['fc-col' + col, 'fc-' + dayIDs[date.day()], contentClass];
                    if (date.isSame(today, 'day')) {
                        classNames.push(tm + '-state-highlight', 'fc-today');
                    } else if (date < today) {
                        classNames.push('fc-past');
                    } else {
                        classNames.push('fc-future');
                    }
                    cellHTML = '<td class=\'' + classNames.join(' ') + '\'>' + '<div>' + '<div class=\'fc-day-content\'>' + '<div style=\'position:relative\'>&nbsp;</div>' + '</div>' + '</div>' + '</td>';
                    cellsHTML += cellHTML;
                }
                html += cellsHTML;
                html += '<td class=\'fc-agenda-gutter ' + contentClass + '\'>&nbsp;</td>' + '</tr>' + '</tbody>';
                return html;
            }

            function setHeight(height) {
                if (height === undefined) {
                    height = viewHeight;
                }
                viewHeight = height;
                slotTopCache = {};
                var headHeight = dayBody.position().top;
                var allDayHeight = slotScroller.position().top;
                var bodyHeight = Math.min(height - headHeight, slotTable.height() + allDayHeight + 1);
                dayBodyFirstCellStretcher.height(bodyHeight - vsides(dayBodyFirstCell));
                slotLayer.css('top', headHeight);
                slotScroller.height(bodyHeight - allDayHeight - 1);
                var slotHeight0 = slotTable.find('tr:first').height() + 1;
                var slotHeight1 = slotTable.find('tr:eq(1)').height();
                slotHeight = (slotHeight0 + slotHeight1) / 2;
                snapRatio = slotDuration / snapDuration;
                snapHeight = slotHeight / snapRatio;
            }

            function setWidth(width) {
                viewWidth = width;
                colPositions.clear();
                colContentPositions.clear();
                var axisFirstCells = dayHead.find('th:first');
                if (allDayTable) {
                    axisFirstCells = axisFirstCells.add(allDayTable.find('th:first'));
                }
                axisFirstCells = axisFirstCells.add(slotTable.find('th:first'));
                axisWidth = 0;
                setOuterWidth(axisFirstCells.width('').each(function (i, _cell) {
                    axisWidth = Math.max(axisWidth, $(_cell).outerWidth());
                }), axisWidth);
                var gutterCells = dayTable.find('.fc-agenda-gutter');
                if (allDayTable) {
                    gutterCells = gutterCells.add(allDayTable.find('th.fc-agenda-gutter'));
                }
                var slotTableWidth = slotScroller[0].clientWidth;
                gutterWidth = slotScroller.width() - slotTableWidth;
                if (gutterWidth) {
                    setOuterWidth(gutterCells, gutterWidth);
                    gutterCells.show().prev().removeClass('fc-last');
                } else {
                    gutterCells.hide().prev().addClass('fc-last');
                }
                colWidth = Math.floor((slotTableWidth - axisWidth) / colCnt);
                setOuterWidth(dayHeadCells.slice(0, -1), colWidth);
            }

            function resetScroll() {
                var top = computeTimeTop(moment.duration(opt('scrollTime'))) + 1;

                function scroll() {
                    slotScroller.scrollTop(top);
                }

                scroll();
                setTimeout(scroll, 0);
            }

            function afterRender() {
                resetScroll();
            }

            function dayBind(cells) {
                cells.click(slotClick).mousedown(daySelectionMousedown);
            }

            function slotBind(cells) {
                cells.click(slotClick).mousedown(slotSelectionMousedown);
            }

            function slotClick(ev) {
                if (!opt('selectable')) {
                    var col = Math.min(colCnt - 1, Math.floor((ev.pageX - dayTable.offset().left - axisWidth) / colWidth));
                    var date = cellToDate(0, col);
                    var match = this.parentNode.className.match(/fc-slot(\d+)/);
                    if (match) {
                        var slotIndex = parseInt(match[1], 10);
                        date.add(minTime + slotIndex * slotDuration);
                        date = calendar.rezoneDate(date);
                        trigger('dayClick', dayBodyCells[col], date, ev);
                    } else {
                        trigger('dayClick', dayBodyCells[col], date, ev);
                    }
                }
            }

            function renderDayOverlay(overlayStart, overlayEnd, refreshCoordinateGrid) {
                if (refreshCoordinateGrid) {
                    coordinateGrid.build();
                }
                var segments = rangeToSegments(overlayStart, overlayEnd);
                for (var i = 0; i < segments.length; i++) {
                    var segment = segments[i];
                    dayBind(renderCellOverlay(segment.row, segment.leftCol, segment.row, segment.rightCol));
                }
            }

            function renderCellOverlay(row0, col0, row1, col1) {
                var rect = coordinateGrid.rect(row0, col0, row1, col1, slotLayer);
                return renderOverlay(rect, slotLayer);
            }

            function renderSlotOverlay(overlayStart, overlayEnd) {
                overlayStart = overlayStart.clone().stripZone();
                overlayEnd = overlayEnd.clone().stripZone();
                for (var i = 0; i < colCnt; i++) {
                    var dayStart = cellToDate(0, i);
                    var dayEnd = dayStart.clone().add('days', 1);
                    var stretchStart = dayStart < overlayStart ? overlayStart : dayStart;
                    var stretchEnd = dayEnd < overlayEnd ? dayEnd : overlayEnd;
                    if (stretchStart < stretchEnd) {
                        var rect = coordinateGrid.rect(0, i, 0, i, slotContainer);
                        var top = computeDateTop(stretchStart, dayStart);
                        var bottom = computeDateTop(stretchEnd, dayStart);
                        rect.top = top;
                        rect.height = bottom - top;
                        slotBind(renderOverlay(rect, slotContainer));
                    }
                }
            }

            coordinateGrid = new CoordinateGrid(function (rows, cols) {
                var e, n, p;
                dayHeadCells.each(function (i, _e) {
                    e = $(_e);
                    n = e.offset().left;
                    if (i) {
                        p[1] = n;
                    }
                    p = [n];
                    cols[i] = p;
                });
                p[1] = n + e.outerWidth();
                if (opt('allDaySlot')) {
                    e = allDayRow;
                    n = e.offset().top;
                    rows[0] = [n, n + e.outerHeight()];
                }
                var slotTableTop = slotContainer.offset().top;
                var slotScrollerTop = slotScroller.offset().top;
                var slotScrollerBottom = slotScrollerTop + slotScroller.outerHeight();

                function constrain(n) {
                    return Math.max(slotScrollerTop, Math.min(slotScrollerBottom, n));
                }

                for (var i = 0; i < slotCnt * snapRatio; i++) {
                    rows.push([constrain(slotTableTop + snapHeight * i), constrain(slotTableTop + snapHeight * (i + 1))]);
                }
            });
            hoverListener = new HoverListener(coordinateGrid);
            colPositions = new HorizontalPositionCache(function (col) {
                return dayBodyCellInners.eq(col);
            });
            colContentPositions = new HorizontalPositionCache(function (col) {
                return dayBodyCellContentInners.eq(col);
            });
            function colLeft(col) {
                return colPositions.left(col);
            }

            function colContentLeft(col) {
                return colContentPositions.left(col);
            }

            function colRight(col) {
                return colPositions.right(col);
            }

            function colContentRight(col) {
                return colContentPositions.right(col);
            }

            function getIsCellAllDay(cell) {
                return opt('allDaySlot') && !cell.row;
            }

            function realCellToDate(cell) {
                var date = cellToDate(0, cell.col);
                var snapIndex = cell.row;
                if (opt('allDaySlot')) {
                    snapIndex--;
                }
                if (snapIndex >= 0) {
                    date.time(moment.duration(minTime + snapIndex * snapDuration));
                    date = calendar.rezoneDate(date);
                }
                return date;
            }

            function computeDateTop(date, startOfDayDate) {
                return computeTimeTop(moment.duration(date.clone().stripZone() - startOfDayDate.clone().stripTime()));
            }

            function computeTimeTop(time) {
                if (time < minTime) {
                    return 0;
                }
                if (time >= maxTime) {
                    return slotTable.height();
                }
                var slots = (time - minTime) / slotDuration;
                var slotIndex = Math.floor(slots);
                var slotPartial = slots - slotIndex;
                var slotTop = slotTopCache[slotIndex];
                if (slotTop === undefined) {
                    slotTop = slotTopCache[slotIndex] = slotTable.find('tr').eq(slotIndex).find('td div')[0].offsetTop;
                }
                var top = slotTop - 1 + slotPartial * slotHeight;
                top = Math.max(top, 0);
                return top;
            }

            function defaultSelectionEnd(start) {
                if (start.hasTime()) {
                    return start.clone().add(slotDuration);
                } else {
                    return start.clone().add('days', 1);
                }
            }

            function renderSelection(start, end) {
                if (start.hasTime() || end.hasTime()) {
                    renderSlotSelection(start, end);
                } else if (opt('allDaySlot')) {
                    renderDayOverlay(start, end, true);
                }
            }

            function renderSlotSelection(startDate, endDate) {
                var helperOption = opt('selectHelper');
                coordinateGrid.build();
                if (helperOption) {
                    var col = dateToCell(startDate).col;
                    if (col >= 0 && col < colCnt) {
                        var rect = coordinateGrid.rect(0, col, 0, col, slotContainer);
                        var top = computeDateTop(startDate, startDate);
                        var bottom = computeDateTop(endDate, startDate);
                        if (bottom > top) {
                            rect.top = top;
                            rect.height = bottom - top;
                            rect.left += 2;
                            rect.width -= 5;
                            if ($.isFunction(helperOption)) {
                                var helperRes = helperOption(startDate, endDate);
                                if (helperRes) {
                                    rect.position = 'absolute';
                                    selectionHelper = $(helperRes).css(rect).appendTo(slotContainer);
                                }
                            } else {
                                rect.isStart = true;
                                rect.isEnd = true;
                                selectionHelper = $(slotSegHtml({
                                    title: '',
                                    start: startDate,
                                    end: endDate,
                                    className: ['fc-select-helper'],
                                    editable: false
                                }, rect));
                                selectionHelper.css('opacity', opt('dragOpacity'));
                            }
                            if (selectionHelper) {
                                slotBind(selectionHelper);
                                slotContainer.append(selectionHelper);
                                setOuterWidth(selectionHelper, rect.width, true);
                                setOuterHeight(selectionHelper, rect.height, true);
                            }
                        }
                    }
                } else {
                    renderSlotOverlay(startDate, endDate);
                }
            }

            function clearSelection() {
                clearOverlays();
                if (selectionHelper) {
                    selectionHelper.remove();
                    selectionHelper = null;
                }
            }

            function slotSelectionMousedown(ev) {
                if (ev.which == 1 && opt('selectable')) {
                    unselect(ev);
                    var dates;
                    hoverListener.start(function (cell, origCell) {
                        clearSelection();
                        if (cell && cell.col == origCell.col && !getIsCellAllDay(cell)) {
                            var d1 = realCellToDate(origCell);
                            var d2 = realCellToDate(cell);
                            dates = [d1, d1.clone().add(snapDuration), d2, d2.clone().add(snapDuration)].sort(dateCompare);
                            renderSlotSelection(dates[0], dates[3]);
                        } else {
                            dates = null;
                        }
                    }, ev);
                    $(document).one('mouseup', function (ev) {
                        hoverListener.stop();
                        if (dates) {
                            if (+dates[0] == +dates[1]) {
                                reportDayClick(dates[0], ev);
                            }
                            reportSelection(dates[0], dates[3], ev);
                        }
                    });
                }
            }

            function reportDayClick(date, ev) {
                trigger('dayClick', dayBodyCells[dateToCell(date).col], date, ev);
            }

            function dragStart(_dragElement, ev, ui) {
                hoverListener.start(function (cell) {
                    clearOverlays();
                    if (cell) {
                        var d1 = realCellToDate(cell);
                        var d2 = d1.clone();
                        if (d1.hasTime()) {
                            d2.add(calendar.defaultTimedEventDuration);
                            renderSlotOverlay(d1, d2);
                        } else {
                            d2.add(calendar.defaultAllDayEventDuration);
                            renderDayOverlay(d1, d2);
                        }
                    }
                }, ev);
            }

            function dragStop(_dragElement, ev, ui) {
                var cell = hoverListener.stop();
                clearOverlays();
                if (cell) {
                    trigger('drop', _dragElement, realCellToDate(cell), ev, ui);
                }
            }
        };
        ;
        function AgendaEventRenderer() {
            var t = this;
            t.renderEvents = renderEvents;
            t.clearEvents = clearEvents;
            t.slotSegHtml = slotSegHtml;
            DayEventRenderer.call(t);
            var opt = t.opt;
            var trigger = t.trigger;
            var isEventDraggable = t.isEventDraggable;
            var isEventResizable = t.isEventResizable;
            var eventElementHandlers = t.eventElementHandlers;
            var setHeight = t.setHeight;
            var getDaySegmentContainer = t.getDaySegmentContainer;
            var getSlotSegmentContainer = t.getSlotSegmentContainer;
            var getHoverListener = t.getHoverListener;
            var computeDateTop = t.computeDateTop;
            var getIsCellAllDay = t.getIsCellAllDay;
            var colContentLeft = t.colContentLeft;
            var colContentRight = t.colContentRight;
            var cellToDate = t.cellToDate;
            var getColCnt = t.getColCnt;
            var getColWidth = t.getColWidth;
            var getSnapHeight = t.getSnapHeight;
            var getSnapDuration = t.getSnapDuration;
            var getSlotHeight = t.getSlotHeight;
            var getSlotDuration = t.getSlotDuration;
            var getSlotContainer = t.getSlotContainer;
            var reportEventElement = t.reportEventElement;
            var showEvents = t.showEvents;
            var hideEvents = t.hideEvents;
            var eventDrop = t.eventDrop;
            var eventResize = t.eventResize;
            var renderDayOverlay = t.renderDayOverlay;
            var clearOverlays = t.clearOverlays;
            var renderDayEvents = t.renderDayEvents;
            var getMinTime = t.getMinTime;
            var getMaxTime = t.getMaxTime;
            var calendar = t.calendar;
            var formatDate = calendar.formatDate;
            var getEventEnd = calendar.getEventEnd;
            t.draggableDayEvent = draggableDayEvent;
            function renderEvents(events, modifiedEventId) {
                var i, len = events.length, dayEvents = [], slotEvents = [];
                for (i = 0; i < len; i++) {
                    if (events[i].allDay) {
                        dayEvents.push(events[i]);
                    } else {
                        slotEvents.push(events[i]);
                    }
                }
                if (opt('allDaySlot')) {
                    renderDayEvents(dayEvents, modifiedEventId);
                    setHeight();
                }
                renderSlotSegs(compileSlotSegs(slotEvents), modifiedEventId);
            }

            function clearEvents() {
                getDaySegmentContainer().empty();
                getSlotSegmentContainer().empty();
            }

            function compileSlotSegs(events) {
                var colCnt = getColCnt(), minTime = getMinTime(), maxTime = getMaxTime(), cellDate, i, j, seg, colSegs, segs = [];
                for (i = 0; i < colCnt; i++) {
                    cellDate = cellToDate(0, i);
                    colSegs = sliceSegs(events, cellDate.clone().time(minTime), cellDate.clone().time(maxTime));
                    colSegs = placeSlotSegs(colSegs);
                    for (j = 0; j < colSegs.length; j++) {
                        seg = colSegs[j];
                        seg.col = i;
                        segs.push(seg);
                    }
                }
                return segs;
            }

            function sliceSegs(events, rangeStart, rangeEnd) {
                rangeStart = rangeStart.clone().stripZone();
                rangeEnd = rangeEnd.clone().stripZone();
                var segs = [], i, len = events.length, event, eventStart, eventEnd, segStart, segEnd, isStart, isEnd;
                for (i = 0; i < len; i++) {
                    event = events[i];
                    eventStart = event.start.clone().stripZone();
                    eventEnd = getEventEnd(event).stripZone();
                    if (eventEnd > rangeStart && eventStart < rangeEnd) {
                        if (eventStart < rangeStart) {
                            segStart = rangeStart.clone();
                            isStart = false;
                        } else {
                            segStart = eventStart;
                            isStart = true;
                        }
                        if (eventEnd > rangeEnd) {
                            segEnd = rangeEnd.clone();
                            isEnd = false;
                        } else {
                            segEnd = eventEnd;
                            isEnd = true;
                        }
                        segs.push({event: event, start: segStart, end: segEnd, isStart: isStart, isEnd: isEnd});
                    }
                }
                return segs.sort(compareSlotSegs);
            }

            function renderSlotSegs(segs, modifiedEventId) {
                var i, segCnt = segs.length, seg, event, top, bottom, columnLeft, columnRight, columnWidth, width, left, right, html = '', eventElements, eventElement, triggerRes, titleElement, height, slotSegmentContainer = getSlotSegmentContainer(), isRTL = opt('isRTL');
                for (i = 0; i < segCnt; i++) {
                    seg = segs[i];
                    event = seg.event;
                    top = computeDateTop(seg.start, seg.start);
                    bottom = computeDateTop(seg.end, seg.start);
                    columnLeft = colContentLeft(seg.col);
                    columnRight = colContentRight(seg.col);
                    columnWidth = columnRight - columnLeft;
                    columnRight -= columnWidth * 0.025;
                    columnWidth = columnRight - columnLeft;
                    width = columnWidth * (seg.forwardCoord - seg.backwardCoord);
                    if (opt('slotEventOverlap')) {
                        width = Math.max((width - 20 / 2) * 2, width);
                    }
                    if (isRTL) {
                        right = columnRight - seg.backwardCoord * columnWidth;
                        left = right - width;
                    } else {
                        left = columnLeft + seg.backwardCoord * columnWidth;
                        right = left + width;
                    }
                    left = Math.max(left, columnLeft);
                    right = Math.min(right, columnRight);
                    width = right - left;
                    seg.top = top;
                    seg.left = left;
                    seg.outerWidth = width;
                    seg.outerHeight = bottom - top;
                    html += slotSegHtml(event, seg);
                }
                slotSegmentContainer[0].innerHTML = html;
                eventElements = slotSegmentContainer.children();
                for (i = 0; i < segCnt; i++) {
                    seg = segs[i];
                    event = seg.event;
                    eventElement = $(eventElements[i]);
                    triggerRes = trigger('eventRender', event, event, eventElement);
                    if (triggerRes === false) {
                        eventElement.remove();
                    } else {
                        if (triggerRes && triggerRes !== true) {
                            eventElement.remove();
                            eventElement = $(triggerRes).css({
                                position: 'absolute',
                                top: seg.top,
                                left: seg.left
                            }).appendTo(slotSegmentContainer);
                        }
                        seg.element = eventElement;
                        if (event._id === modifiedEventId) {
                            bindSlotSeg(event, eventElement, seg);
                        } else {
                            eventElement[0]._fci = i;
                        }
                        reportEventElement(event, eventElement);
                    }
                }
                lazySegBind(slotSegmentContainer, segs, bindSlotSeg);
                for (i = 0; i < segCnt; i++) {
                    seg = segs[i];
                    if (eventElement = seg.element) {
                        seg.vsides = vsides(eventElement, true);
                        seg.hsides = hsides(eventElement, true);
                        titleElement = eventElement.find('.fc-event-title');
                        if (titleElement.length) {
                            seg.contentTop = titleElement[0].offsetTop;
                        }
                    }
                }
                for (i = 0; i < segCnt; i++) {
                    seg = segs[i];
                    if (eventElement = seg.element) {
                        eventElement[0].style.width = Math.max(0, seg.outerWidth - seg.hsides) + 'px';
                        height = Math.max(0, seg.outerHeight - seg.vsides);
                        eventElement[0].style.height = height + 'px';
                        event = seg.event;
                        if (seg.contentTop !== undefined && height - seg.contentTop < 10) {
                            eventElement.find('div.fc-event-time').text(formatDate(event.start, opt('timeFormat')) + ' - ' + event.title);
                            eventElement.find('div.fc-event-title').remove();
                        }
                        trigger('eventAfterRender', event, event, eventElement);
                    }
                }
            }

            function slotSegHtml(event, seg) {
                var html = '<';
                var url = event.url;
                var skinCss = getSkinCss(event, opt);
                var classes = ['fc-event', 'fc-event-vert'];
                if (isEventDraggable(event)) {
                    classes.push('fc-event-draggable');
                }
                if (seg.isStart) {
                    classes.push('fc-event-start');
                }
                if (seg.isEnd) {
                    classes.push('fc-event-end');
                }
                classes = classes.concat(event.className);
                if (event.source) {
                    classes = classes.concat(event.source.className || []);
                }
                if (url) {
                    html += 'a href=\'' + htmlEscape(event.url) + '\'';
                } else {
                    html += 'div';
                }
                html += ' class=\'' + classes.join(' ') + '\'' + ' style=' + '\'' + 'position:absolute;' + 'top:' + seg.top + 'px;' + 'left:' + seg.left + 'px;' + skinCss + '\'' + '>' + '<div class=\'fc-event-inner\'>' + '<div class=\'fc-event-time\'>' + htmlEscape(t.getEventTimeText(event)) + '</div>' + '<div class=\'fc-event-title\'>' + htmlEscape(event.title || '') + '</div>' + '</div>' + '<div class=\'fc-event-bg\'></div>';
                if (seg.isEnd && isEventResizable(event)) {
                    html += '<div class=\'ui-resizable-handle ui-resizable-s\'>=</div>';
                }
                html += '</' + (url ? 'a' : 'div') + '>';
                return html;
            }

            function bindSlotSeg(event, eventElement, seg) {
                var timeElement = eventElement.find('div.fc-event-time');
                if (isEventDraggable(event)) {
                    draggableSlotEvent(event, eventElement, timeElement);
                }
                if (seg.isEnd && isEventResizable(event)) {
                    resizableSlotEvent(event, eventElement, timeElement);
                }
                eventElementHandlers(event, eventElement);
            }

            function draggableDayEvent(event, eventElement, seg) {
                var isStart = seg.isStart;
                var origWidth;
                var revert;
                var allDay = true;
                var dayDelta;
                var hoverListener = getHoverListener();
                var colWidth = getColWidth();
                var minTime = getMinTime();
                var slotDuration = getSlotDuration();
                var slotHeight = getSlotHeight();
                var snapDuration = getSnapDuration();
                var snapHeight = getSnapHeight();
                eventElement.draggable({
                    opacity: opt('dragOpacity', 'month'),
                    revertDuration: opt('dragRevertDuration'),
                    start: function (ev, ui) {
                        trigger('eventDragStart', eventElement[0], event, ev, ui);
                        hideEvents(event, eventElement);
                        origWidth = eventElement.width();
                        hoverListener.start(function (cell, origCell) {
                            clearOverlays();
                            if (cell) {
                                revert = false;
                                var origDate = cellToDate(0, origCell.col);
                                var date = cellToDate(0, cell.col);
                                dayDelta = date.diff(origDate, 'days');
                                if (!cell.row) {
                                    renderDayOverlay(event.start.clone().add('days', dayDelta), getEventEnd(event).add('days', dayDelta));
                                    resetElement();
                                } else {
                                    if (isStart) {
                                        if (allDay) {
                                            eventElement.width(colWidth - 10);
                                            setOuterHeight(eventElement, calendar.defaultTimedEventDuration / slotDuration * slotHeight);
                                            eventElement.draggable('option', 'grid', [colWidth, 1]);
                                            allDay = false;
                                        }
                                    } else {
                                        revert = true;
                                    }
                                }
                                revert = revert || allDay && !dayDelta;
                            } else {
                                resetElement();
                                revert = true;
                            }
                            eventElement.draggable('option', 'revert', revert);
                        }, ev, 'drag');
                    },
                    stop: function (ev, ui) {
                        hoverListener.stop();
                        clearOverlays();
                        trigger('eventDragStop', eventElement[0], event, ev, ui);
                        if (revert) {
                            resetElement();
                            eventElement.css('filter', '');
                            showEvents(event, eventElement);
                        } else {
                            var eventStart = event.start.clone().add('days', dayDelta);
                            var snapTime;
                            var snapIndex;
                            if (!allDay) {
                                snapIndex = Math.round((eventElement.offset().top - getSlotContainer().offset().top) / snapHeight);
                                snapTime = moment.duration(minTime + snapIndex * snapDuration);
                                eventStart = calendar.rezoneDate(eventStart.clone().time(snapTime));
                            }
                            eventDrop(eventElement[0], event, eventStart, ev, ui);
                        }
                    }
                });
                function resetElement() {
                    if (!allDay) {
                        eventElement.width(origWidth).height('').draggable('option', 'grid', null);
                        allDay = true;
                    }
                }
            }

            function draggableSlotEvent(event, eventElement, timeElement) {
                var coordinateGrid = t.getCoordinateGrid();
                var colCnt = getColCnt();
                var colWidth = getColWidth();
                var snapHeight = getSnapHeight();
                var snapDuration = getSnapDuration();
                var origPosition;
                var origCell;
                var isInBounds, prevIsInBounds;
                var isAllDay, prevIsAllDay;
                var colDelta, prevColDelta;
                var dayDelta;
                var snapDelta, prevSnapDelta;
                var eventStart, eventEnd;
                eventElement.draggable({
                    scroll: false,
                    grid: [colWidth, snapHeight],
                    axis: colCnt == 1 ? 'y' : false,
                    opacity: opt('dragOpacity'),
                    revertDuration: opt('dragRevertDuration'),
                    start: function (ev, ui) {
                        trigger('eventDragStart', eventElement[0], event, ev, ui);
                        hideEvents(event, eventElement);
                        coordinateGrid.build();
                        origPosition = eventElement.position();
                        origCell = coordinateGrid.cell(ev.pageX, ev.pageY);
                        isInBounds = prevIsInBounds = true;
                        isAllDay = prevIsAllDay = getIsCellAllDay(origCell);
                        colDelta = prevColDelta = 0;
                        dayDelta = 0;
                        snapDelta = prevSnapDelta = 0;
                        eventStart = null;
                        eventEnd = null;
                    },
                    drag: function (ev, ui) {
                        var cell = coordinateGrid.cell(ev.pageX, ev.pageY);
                        isInBounds = !!cell;
                        if (isInBounds) {
                            isAllDay = getIsCellAllDay(cell);
                            colDelta = Math.round((ui.position.left - origPosition.left) / colWidth);
                            if (colDelta != prevColDelta) {
                                var origDate = cellToDate(0, origCell.col);
                                var col = origCell.col + colDelta;
                                col = Math.max(0, col);
                                col = Math.min(colCnt - 1, col);
                                var date = cellToDate(0, col);
                                dayDelta = date.diff(origDate, 'days');
                            }
                            if (!isAllDay) {
                                snapDelta = Math.round((ui.position.top - origPosition.top) / snapHeight);
                            }
                        }
                        if (isInBounds != prevIsInBounds || isAllDay != prevIsAllDay || colDelta != prevColDelta || snapDelta != prevSnapDelta) {
                            if (isAllDay) {
                                eventStart = event.start.clone().stripTime().add('days', dayDelta);
                                eventEnd = eventStart.clone().add(calendar.defaultAllDayEventDuration);
                            } else {
                                eventStart = event.start.clone().add(snapDelta * snapDuration).add('days', dayDelta);
                                eventEnd = getEventEnd(event).add(snapDelta * snapDuration).add('days', dayDelta);
                            }
                            updateUI();
                            prevIsInBounds = isInBounds;
                            prevIsAllDay = isAllDay;
                            prevColDelta = colDelta;
                            prevSnapDelta = snapDelta;
                        }
                        eventElement.draggable('option', 'revert', !isInBounds);
                    },
                    stop: function (ev, ui) {
                        clearOverlays();
                        trigger('eventDragStop', eventElement[0], event, ev, ui);
                        if (isInBounds && (isAllDay || dayDelta || snapDelta)) {
                            eventDrop(eventElement[0], event, eventStart, ev, ui);
                        } else {
                            isInBounds = true;
                            isAllDay = false;
                            colDelta = 0;
                            dayDelta = 0;
                            snapDelta = 0;
                            updateUI();
                            eventElement.css('filter', '');
                            eventElement.css(origPosition);
                            showEvents(event, eventElement);
                        }
                    }
                });
                function updateUI() {
                    clearOverlays();
                    if (isInBounds) {
                        if (isAllDay) {
                            timeElement.hide();
                            eventElement.draggable('option', 'grid', null);
                            renderDayOverlay(eventStart, eventEnd);
                        } else {
                            updateTimeText();
                            timeElement.css('display', '');
                            eventElement.draggable('option', 'grid', [colWidth, snapHeight]);
                        }
                    }
                }

                function updateTimeText() {
                    if (eventStart) {
                        timeElement.text(t.getEventTimeText(eventStart, event.end ? eventEnd : null));
                    }
                }
            }

            function resizableSlotEvent(event, eventElement, timeElement) {
                var snapDelta, prevSnapDelta;
                var snapHeight = getSnapHeight();
                var snapDuration = getSnapDuration();
                var eventEnd;
                eventElement.resizable({
                    handles: {s: '.ui-resizable-handle'},
                    grid: snapHeight,
                    start: function (ev, ui) {
                        snapDelta = prevSnapDelta = 0;
                        hideEvents(event, eventElement);
                        trigger('eventResizeStart', eventElement[0], event, ev, ui);
                    },
                    resize: function (ev, ui) {
                        snapDelta = Math.round((Math.max(snapHeight, eventElement.height()) - ui.originalSize.height) / snapHeight);
                        if (snapDelta != prevSnapDelta) {
                            eventEnd = getEventEnd(event).add(snapDuration * snapDelta);
                            var text;
                            if (snapDelta) {
                                text = t.getEventTimeText(event.start, eventEnd);
                            } else {
                                text = t.getEventTimeText(event);
                            }
                            timeElement.text(text);
                            prevSnapDelta = snapDelta;
                        }
                    },
                    stop: function (ev, ui) {
                        trigger('eventResizeStop', eventElement[0], event, ev, ui);
                        if (snapDelta) {
                            eventResize(eventElement[0], event, eventEnd, ev, ui);
                        } else {
                            showEvents(event, eventElement);
                        }
                    }
                });
            }
        }

        function placeSlotSegs(segs) {
            var levels = buildSlotSegLevels(segs);
            var level0 = levels[0];
            var i;
            computeForwardSlotSegs(levels);
            if (level0) {
                for (i = 0; i < level0.length; i++) {
                    computeSlotSegPressures(level0[i]);
                }
                for (i = 0; i < level0.length; i++) {
                    computeSlotSegCoords(level0[i], 0, 0);
                }
            }
            return flattenSlotSegLevels(levels);
        }

        function buildSlotSegLevels(segs) {
            var levels = [];
            var i, seg;
            var j;
            for (i = 0; i < segs.length; i++) {
                seg = segs[i];
                for (j = 0; j < levels.length; j++) {
                    if (!computeSlotSegCollisions(seg, levels[j]).length) {
                        break;
                    }
                }
                (levels[j] || (levels[j] = [])).push(seg);
            }
            return levels;
        }

        function computeForwardSlotSegs(levels) {
            var i, level;
            var j, seg;
            var k;
            for (i = 0; i < levels.length; i++) {
                level = levels[i];
                for (j = 0; j < level.length; j++) {
                    seg = level[j];
                    seg.forwardSegs = [];
                    for (k = i + 1; k < levels.length; k++) {
                        computeSlotSegCollisions(seg, levels[k], seg.forwardSegs);
                    }
                }
            }
        }

        function computeSlotSegPressures(seg) {
            var forwardSegs = seg.forwardSegs;
            var forwardPressure = 0;
            var i, forwardSeg;
            if (seg.forwardPressure === undefined) {
                for (i = 0; i < forwardSegs.length; i++) {
                    forwardSeg = forwardSegs[i];
                    computeSlotSegPressures(forwardSeg);
                    forwardPressure = Math.max(forwardPressure, 1 + forwardSeg.forwardPressure);
                }
                seg.forwardPressure = forwardPressure;
            }
        }

        function computeSlotSegCoords(seg, seriesBackwardPressure, seriesBackwardCoord) {
            var forwardSegs = seg.forwardSegs;
            var i;
            if (seg.forwardCoord === undefined) {
                if (!forwardSegs.length) {
                    seg.forwardCoord = 1;
                } else {
                    forwardSegs.sort(compareForwardSlotSegs);
                    computeSlotSegCoords(forwardSegs[0], seriesBackwardPressure + 1, seriesBackwardCoord);
                    seg.forwardCoord = forwardSegs[0].backwardCoord;
                }
                seg.backwardCoord = seg.forwardCoord - (seg.forwardCoord - seriesBackwardCoord) / (seriesBackwardPressure + 1);
                for (i = 0; i < forwardSegs.length; i++) {
                    computeSlotSegCoords(forwardSegs[i], 0, seg.forwardCoord);
                }
            }
        }

        function flattenSlotSegLevels(levels) {
            var segs = [];
            var i, level;
            var j;
            for (i = 0; i < levels.length; i++) {
                level = levels[i];
                for (j = 0; j < level.length; j++) {
                    segs.push(level[j]);
                }
            }
            return segs;
        }

        function computeSlotSegCollisions(seg, otherSegs, results) {
            results = results || [];
            for (var i = 0; i < otherSegs.length; i++) {
                if (isSlotSegCollision(seg, otherSegs[i])) {
                    results.push(otherSegs[i]);
                }
            }
            return results;
        }

        function isSlotSegCollision(seg1, seg2) {
            return seg1.end > seg2.start && seg1.start < seg2.end;
        }

        function compareForwardSlotSegs(seg1, seg2) {
            return seg2.forwardPressure - seg1.forwardPressure || (seg1.backwardCoord || 0) - (seg2.backwardCoord || 0) || compareSlotSegs(seg1, seg2);
        }

        function compareSlotSegs(seg1, seg2) {
            return seg1.start - seg2.start || seg2.end - seg2.start - (seg1.end - seg1.start) || (seg1.event.title || '').localeCompare(seg2.event.title);
        };
        ;
        function View(element, calendar, viewName) {
            var t = this;
            t.element = element;
            t.calendar = calendar;
            t.name = viewName;
            t.opt = opt;
            t.trigger = trigger;
            t.isEventDraggable = isEventDraggable;
            t.isEventResizable = isEventResizable;
            t.clearEventData = clearEventData;
            t.reportEventElement = reportEventElement;
            t.triggerEventDestroy = triggerEventDestroy;
            t.eventElementHandlers = eventElementHandlers;
            t.showEvents = showEvents;
            t.hideEvents = hideEvents;
            t.eventDrop = eventDrop;
            t.eventResize = eventResize;
            var reportEventChange = calendar.reportEventChange;
            var eventElementsByID = {};
            var eventElementCouples = [];
            var options = calendar.options;
            var nextDayThreshold = moment.duration(options.nextDayThreshold);

            function opt(name, viewNameOverride) {
                var v = options[name];
                if ($.isPlainObject(v) && !isForcedAtomicOption(name)) {
                    return smartProperty(v, viewNameOverride || viewName);
                }
                return v;
            }

            function trigger(name, thisObj) {
                return calendar.trigger.apply(calendar, [name, thisObj || t].concat(Array.prototype.slice.call(arguments, 2), [t]));
            }

            function isEventDraggable(event) {
                var source = event.source || {};
                return firstDefined(event.startEditable, source.startEditable, opt('eventStartEditable'), event.editable, source.editable, opt('editable'));
            }

            function isEventResizable(event) {
                var source = event.source || {};
                return firstDefined(event.durationEditable, source.durationEditable, opt('eventDurationEditable'), event.editable, source.editable, opt('editable'));
            }

            function clearEventData() {
                eventElementsByID = {};
                eventElementCouples = [];
            }

            function reportEventElement(event, element) {
                eventElementCouples.push({event: event, element: element});
                if (eventElementsByID[event._id]) {
                    eventElementsByID[event._id].push(element);
                } else {
                    eventElementsByID[event._id] = [element];
                }
            }

            function triggerEventDestroy() {
                $.each(eventElementCouples, function (i, couple) {
                    t.trigger('eventDestroy', couple.event, couple.event, couple.element);
                });
            }

            function eventElementHandlers(event, eventElement) {
                eventElement.click(function (ev) {
                    if (!eventElement.hasClass('ui-draggable-dragging') && !eventElement.hasClass('ui-resizable-resizing')) {
                        return trigger('eventClick', this, event, ev);
                    }
                }).hover(function (ev) {
                    trigger('eventMouseover', this, event, ev);
                }, function (ev) {
                    trigger('eventMouseout', this, event, ev);
                });
            }

            function showEvents(event, exceptElement) {
                eachEventElement(event, exceptElement, 'show');
            }

            function hideEvents(event, exceptElement) {
                eachEventElement(event, exceptElement, 'hide');
            }

            function eachEventElement(event, exceptElement, funcName) {
                var elements = eventElementsByID[event._id], i, len = elements.length;
                for (i = 0; i < len; i++) {
                    if (!exceptElement || elements[i][0] != exceptElement[0]) {
                        elements[i][funcName]();
                    }
                }
            }

            t.getEventTimeText = function (event) {
                var start;
                var end;
                if (arguments.length === 2) {
                    start = arguments[0];
                    end = arguments[1];
                } else {
                    start = event.start;
                    end = event.end;
                }
                if (end && opt('displayEventEnd')) {
                    return calendar.formatRange(start, end, opt('timeFormat'));
                } else {
                    return calendar.formatDate(start, opt('timeFormat'));
                }
            };
            function eventDrop(el, event, newStart, ev, ui) {
                var mutateResult = calendar.mutateEvent(event, newStart, null);
                trigger('eventDrop', el, event, mutateResult.dateDelta, function () {
                    mutateResult.undo();
                    reportEventChange(event._id);
                }, ev, ui);
                reportEventChange(event._id);
            }

            function eventResize(el, event, newEnd, ev, ui) {
                var mutateResult = calendar.mutateEvent(event, null, newEnd);
                trigger('eventResize', el, event, mutateResult.durationDelta, function () {
                    mutateResult.undo();
                    reportEventChange(event._id);
                }, ev, ui);
                reportEventChange(event._id);
            }

            t.isHiddenDay = isHiddenDay;
            t.skipHiddenDays = skipHiddenDays;
            t.getCellsPerWeek = getCellsPerWeek;
            t.dateToCell = dateToCell;
            t.dateToDayOffset = dateToDayOffset;
            t.dayOffsetToCellOffset = dayOffsetToCellOffset;
            t.cellOffsetToCell = cellOffsetToCell;
            t.cellToDate = cellToDate;
            t.cellToCellOffset = cellToCellOffset;
            t.cellOffsetToDayOffset = cellOffsetToDayOffset;
            t.dayOffsetToDate = dayOffsetToDate;
            t.rangeToSegments = rangeToSegments;
            var hiddenDays = opt('hiddenDays') || [];
            var isHiddenDayHash = [];
            var cellsPerWeek;
            var dayToCellMap = [];
            var cellToDayMap = [];
            var isRTL = opt('isRTL');
            (function () {
                if (opt('weekends') === false) {
                    hiddenDays.push(0, 6);
                }
                for (var dayIndex = 0, cellIndex = 0; dayIndex < 7; dayIndex++) {
                    dayToCellMap[dayIndex] = cellIndex;
                    isHiddenDayHash[dayIndex] = $.inArray(dayIndex, hiddenDays) != -1;
                    if (!isHiddenDayHash[dayIndex]) {
                        cellToDayMap[cellIndex] = dayIndex;
                        cellIndex++;
                    }
                }
                cellsPerWeek = cellIndex;
                if (!cellsPerWeek) {
                    throw'invalid hiddenDays';
                }
            }());
            function isHiddenDay(day) {
                if (moment.isMoment(day)) {
                    day = day.day();
                }
                return isHiddenDayHash[day];
            }

            function getCellsPerWeek() {
                return cellsPerWeek;
            }

            function skipHiddenDays(date, inc, isExclusive) {
                var out = date.clone();
                inc = inc || 1;
                while (isHiddenDayHash[(out.day() + (isExclusive ? inc : 0) + 7) % 7]) {
                    out.add('days', inc);
                }
                return out;
            }

            function cellToDate() {
                var cellOffset = cellToCellOffset.apply(null, arguments);
                var dayOffset = cellOffsetToDayOffset(cellOffset);
                var date = dayOffsetToDate(dayOffset);
                return date;
            }

            function cellToCellOffset(row, col) {
                var colCnt = t.getColCnt();
                var dis = isRTL ? -1 : 1;
                var dit = isRTL ? colCnt - 1 : 0;
                if (typeof row == 'object') {
                    col = row.col;
                    row = row.row;
                }
                var cellOffset = row * colCnt + (col * dis + dit);
                return cellOffset;
            }

            function cellOffsetToDayOffset(cellOffset) {
                var day0 = t.start.day();
                cellOffset += dayToCellMap[day0];
                return Math.floor(cellOffset / cellsPerWeek) * 7 + cellToDayMap[(cellOffset % cellsPerWeek + cellsPerWeek) % cellsPerWeek] - day0;
            }

            function dayOffsetToDate(dayOffset) {
                return t.start.clone().add('days', dayOffset);
            }

            function dateToCell(date) {
                var dayOffset = dateToDayOffset(date);
                var cellOffset = dayOffsetToCellOffset(dayOffset);
                var cell = cellOffsetToCell(cellOffset);
                return cell;
            }

            function dateToDayOffset(date) {
                return date.clone().stripTime().diff(t.start, 'days');
            }

            function dayOffsetToCellOffset(dayOffset) {
                var day0 = t.start.day();
                dayOffset += day0;
                return Math.floor(dayOffset / 7) * cellsPerWeek + dayToCellMap[(dayOffset % 7 + 7) % 7] - dayToCellMap[day0];
            }

            function cellOffsetToCell(cellOffset) {
                var colCnt = t.getColCnt();
                var dis = isRTL ? -1 : 1;
                var dit = isRTL ? colCnt - 1 : 0;
                var row = Math.floor(cellOffset / colCnt);
                var col = (cellOffset % colCnt + colCnt) % colCnt * dis + dit;
                return {row: row, col: col};
            }

            function rangeToSegments(start, end) {
                var rowCnt = t.getRowCnt();
                var colCnt = t.getColCnt();
                var segments = [];
                var rangeDayOffsetStart = dateToDayOffset(start);
                var rangeDayOffsetEnd = dateToDayOffset(end);
                var endTimeMS = +end.time();
                if (endTimeMS && endTimeMS >= nextDayThreshold) {
                    rangeDayOffsetEnd++;
                }
                rangeDayOffsetEnd = Math.max(rangeDayOffsetEnd, rangeDayOffsetStart + 1);
                var rangeCellOffsetFirst = dayOffsetToCellOffset(rangeDayOffsetStart);
                var rangeCellOffsetLast = dayOffsetToCellOffset(rangeDayOffsetEnd) - 1;
                for (var row = 0; row < rowCnt; row++) {
                    var rowCellOffsetFirst = row * colCnt;
                    var rowCellOffsetLast = rowCellOffsetFirst + colCnt - 1;
                    var segmentCellOffsetFirst = Math.max(rangeCellOffsetFirst, rowCellOffsetFirst);
                    var segmentCellOffsetLast = Math.min(rangeCellOffsetLast, rowCellOffsetLast);
                    if (segmentCellOffsetFirst <= segmentCellOffsetLast) {
                        var segmentCellFirst = cellOffsetToCell(segmentCellOffsetFirst);
                        var segmentCellLast = cellOffsetToCell(segmentCellOffsetLast);
                        var cols = [segmentCellFirst.col, segmentCellLast.col].sort();
                        var isStart = cellOffsetToDayOffset(segmentCellOffsetFirst) == rangeDayOffsetStart;
                        var isEnd = cellOffsetToDayOffset(segmentCellOffsetLast) + 1 == rangeDayOffsetEnd;
                        segments.push({row: row, leftCol: cols[0], rightCol: cols[1], isStart: isStart, isEnd: isEnd});
                    }
                }
                return segments;
            }
        };
        ;
        function DayEventRenderer() {
            var t = this;
            t.renderDayEvents = renderDayEvents;
            t.draggableDayEvent = draggableDayEvent;
            t.resizableDayEvent = resizableDayEvent;
            var opt = t.opt;
            var trigger = t.trigger;
            var isEventDraggable = t.isEventDraggable;
            var isEventResizable = t.isEventResizable;
            var reportEventElement = t.reportEventElement;
            var eventElementHandlers = t.eventElementHandlers;
            var showEvents = t.showEvents;
            var hideEvents = t.hideEvents;
            var eventDrop = t.eventDrop;
            var eventResize = t.eventResize;
            var getRowCnt = t.getRowCnt;
            var getColCnt = t.getColCnt;
            var allDayRow = t.allDayRow;
            var colLeft = t.colLeft;
            var colRight = t.colRight;
            var colContentLeft = t.colContentLeft;
            var colContentRight = t.colContentRight;
            var getDaySegmentContainer = t.getDaySegmentContainer;
            var renderDayOverlay = t.renderDayOverlay;
            var clearOverlays = t.clearOverlays;
            var clearSelection = t.clearSelection;
            var getHoverListener = t.getHoverListener;
            var rangeToSegments = t.rangeToSegments;
            var cellToDate = t.cellToDate;
            var cellToCellOffset = t.cellToCellOffset;
            var cellOffsetToDayOffset = t.cellOffsetToDayOffset;
            var dateToDayOffset = t.dateToDayOffset;
            var dayOffsetToCellOffset = t.dayOffsetToCellOffset;
            var calendar = t.calendar;
            var getEventEnd = calendar.getEventEnd;

            function renderDayEvents(events, modifiedEventId) {
                var segments = _renderDayEvents(events, false, true);
                segmentElementEach(segments, function (segment, element) {
                    reportEventElement(segment.event, element);
                });
                attachHandlers(segments, modifiedEventId);
                segmentElementEach(segments, function (segment, element) {
                    trigger('eventAfterRender', segment.event, segment.event, element);
                });
            }

            function renderTempDayEvent(event, adjustRow, adjustTop) {
                var segments = _renderDayEvents([event], true, false);
                var elements = [];
                segmentElementEach(segments, function (segment, element) {
                    if (segment.row === adjustRow) {
                        element.css('top', adjustTop);
                    }
                    elements.push(element[0]);
                });
                return elements;
            }

            function _renderDayEvents(events, doAppend, doRowHeights) {
                var finalContainer = getDaySegmentContainer();
                var renderContainer = doAppend ? $('<div/>') : finalContainer;
                var segments = buildSegments(events);
                var html;
                var elements;
                calculateHorizontals(segments);
                html = buildHTML(segments);
                renderContainer[0].innerHTML = html;
                elements = renderContainer.children();
                if (doAppend) {
                    finalContainer.append(elements);
                }
                resolveElements(segments, elements);
                segmentElementEach(segments, function (segment, element) {
                    segment.hsides = hsides(element, true);
                });
                segmentElementEach(segments, function (segment, element) {
                    element.width(Math.max(0, segment.outerWidth - segment.hsides));
                });
                segmentElementEach(segments, function (segment, element) {
                    segment.outerHeight = element.outerHeight(true);
                });
                setVerticals(segments, doRowHeights);
                return segments;
            }

            function buildSegments(events) {
                var segments = [];
                for (var i = 0; i < events.length; i++) {
                    var eventSegments = buildSegmentsForEvent(events[i]);
                    segments.push.apply(segments, eventSegments);
                }
                return segments;
            }

            function buildSegmentsForEvent(event) {
                var segments = rangeToSegments(event.start, getEventEnd(event));
                for (var i = 0; i < segments.length; i++) {
                    segments[i].event = event;
                }
                return segments;
            }

            function calculateHorizontals(segments) {
                var isRTL = opt('isRTL');
                for (var i = 0; i < segments.length; i++) {
                    var segment = segments[i];
                    var leftFunc = (isRTL ? segment.isEnd : segment.isStart) ? colContentLeft : colLeft;
                    var rightFunc = (isRTL ? segment.isStart : segment.isEnd) ? colContentRight : colRight;
                    var left = leftFunc(segment.leftCol);
                    var right = rightFunc(segment.rightCol);
                    segment.left = left;
                    segment.outerWidth = right - left;
                }
            }

            function buildHTML(segments) {
                var html = '';
                for (var i = 0; i < segments.length; i++) {
                    html += buildHTMLForSegment(segments[i]);
                }
                return html;
            }

            function buildHTMLForSegment(segment) {
                var html = '';
                var isRTL = opt('isRTL');
                var event = segment.event;
                var url = event.url;
                var classNames = ['fc-event', 'fc-event-hori'];
                if (isEventDraggable(event)) {
                    classNames.push('fc-event-draggable');
                }
                if (segment.isStart) {
                    classNames.push('fc-event-start');
                }
                if (segment.isEnd) {
                    classNames.push('fc-event-end');
                }
                classNames = classNames.concat(event.className);
                if (event.source) {
                    classNames = classNames.concat(event.source.className || []);
                }
                var skinCss = getSkinCss(event, opt);
                if (url) {
                    html += '<a href=\'' + htmlEscape(url) + '\'';
                } else {
                    html += '<div';
                }
                html += ' class=\'' + classNames.join(' ') + '\'' + ' style=' + '\'' + 'position:absolute;' + 'left:' + segment.left + 'px;' + skinCss + '\'' + '>' + '<div class=\'fc-event-inner\'>';
                if (!event.allDay && segment.isStart) {
                    html += '<span class=\'fc-event-time\'>' + htmlEscape(t.getEventTimeText(event)) + '</span>';
                }
                html += '<span class=\'fc-event-title\'>' + htmlEscape(event.title || '') + '</span>' + '</div>';
                if (event.allDay && segment.isEnd && isEventResizable(event)) {
                    html += '<div class=\'ui-resizable-handle ui-resizable-' + (isRTL ? 'w' : 'e') + '\'>' + '&nbsp;&nbsp;&nbsp;' + '</div>';
                }
                html += '</' + (url ? 'a' : 'div') + '>';
                return html;
            }

            function resolveElements(segments, elements) {
                for (var i = 0; i < segments.length; i++) {
                    var segment = segments[i];
                    var event = segment.event;
                    var element = elements.eq(i);
                    var triggerRes = trigger('eventRender', event, event, element);
                    if (triggerRes === false) {
                        element.remove();
                    } else {
                        if (triggerRes && triggerRes !== true) {
                            triggerRes = $(triggerRes).css({position: 'absolute', left: segment.left});
                            element.replaceWith(triggerRes);
                            element = triggerRes;
                        }
                        segment.element = element;
                    }
                }
            }

            function setVerticals(segments, doRowHeights) {
                var rowContentHeights = calculateVerticals(segments);
                var rowContentElements = getRowContentElements();
                var rowContentTops = [];
                var i;
                if (doRowHeights) {
                    for (i = 0; i < rowContentElements.length; i++) {
                        rowContentElements[i].height(rowContentHeights[i]);
                    }
                }
                for (i = 0; i < rowContentElements.length; i++) {
                    rowContentTops.push(rowContentElements[i].position().top);
                }
                segmentElementEach(segments, function (segment, element) {
                    element.css('top', rowContentTops[segment.row] + segment.top);
                });
            }

            function calculateVerticals(segments) {
                var rowCnt = getRowCnt();
                var colCnt = getColCnt();
                var rowContentHeights = [];
                var segmentRows = buildSegmentRows(segments);
                var colI;
                for (var rowI = 0; rowI < rowCnt; rowI++) {
                    var segmentRow = segmentRows[rowI];
                    var colHeights = [];
                    for (colI = 0; colI < colCnt; colI++) {
                        colHeights.push(0);
                    }
                    for (var segmentI = 0; segmentI < segmentRow.length; segmentI++) {
                        var segment = segmentRow[segmentI];
                        segment.top = arrayMax(colHeights.slice(segment.leftCol, segment.rightCol + 1));
                        for (colI = segment.leftCol; colI <= segment.rightCol; colI++) {
                            colHeights[colI] = segment.top + segment.outerHeight;
                        }
                    }
                    rowContentHeights.push(arrayMax(colHeights));
                }
                return rowContentHeights;
            }

            function buildSegmentRows(segments) {
                var rowCnt = getRowCnt();
                var segmentRows = [];
                var segmentI;
                var segment;
                var rowI;
                for (segmentI = 0; segmentI < segments.length; segmentI++) {
                    segment = segments[segmentI];
                    rowI = segment.row;
                    if (segment.element) {
                        if (segmentRows[rowI]) {
                            segmentRows[rowI].push(segment);
                        } else {
                            segmentRows[rowI] = [segment];
                        }
                    }
                }
                for (rowI = 0; rowI < rowCnt; rowI++) {
                    segmentRows[rowI] = sortSegmentRow(segmentRows[rowI] || []);
                }
                return segmentRows;
            }

            function sortSegmentRow(segments) {
                var sortedSegments = [];
                var subrows = buildSegmentSubrows(segments);
                for (var i = 0; i < subrows.length; i++) {
                    sortedSegments.push.apply(sortedSegments, subrows[i]);
                }
                return sortedSegments;
            }

            function buildSegmentSubrows(segments) {
                segments.sort(compareDaySegments);
                var subrows = [];
                for (var i = 0; i < segments.length; i++) {
                    var segment = segments[i];
                    for (var j = 0; j < subrows.length; j++) {
                        if (!isDaySegmentCollision(segment, subrows[j])) {
                            break;
                        }
                    }
                    if (subrows[j]) {
                        subrows[j].push(segment);
                    } else {
                        subrows[j] = [segment];
                    }
                }
                return subrows;
            }

            function getRowContentElements() {
                var i;
                var rowCnt = getRowCnt();
                var rowDivs = [];
                for (i = 0; i < rowCnt; i++) {
                    rowDivs[i] = allDayRow(i).find('div.fc-day-content > div');
                }
                return rowDivs;
            }

            function attachHandlers(segments, modifiedEventId) {
                var segmentContainer = getDaySegmentContainer();
                segmentElementEach(segments, function (segment, element, i) {
                    var event = segment.event;
                    if (event._id === modifiedEventId) {
                        bindDaySeg(event, element, segment);
                    } else {
                        element[0]._fci = i;
                    }
                });
                lazySegBind(segmentContainer, segments, bindDaySeg);
            }

            function bindDaySeg(event, eventElement, segment) {
                if (isEventDraggable(event)) {
                    t.draggableDayEvent(event, eventElement, segment);
                }
                if (event.allDay && segment.isEnd && isEventResizable(event)) {
                    t.resizableDayEvent(event, eventElement, segment);
                }
                eventElementHandlers(event, eventElement);
            }

            function draggableDayEvent(event, eventElement) {
                var hoverListener = getHoverListener();
                var dayDelta;
                var eventStart;
                eventElement.draggable({
                    delay: 50,
                    opacity: opt('dragOpacity'),
                    revertDuration: opt('dragRevertDuration'),
                    start: function (ev, ui) {
                        trigger('eventDragStart', eventElement[0], event, ev, ui);
                        hideEvents(event, eventElement);
                        hoverListener.start(function (cell, origCell, rowDelta, colDelta) {
                            eventElement.draggable('option', 'revert', !cell || !rowDelta && !colDelta);
                            clearOverlays();
                            if (cell) {
                                var origCellDate = cellToDate(origCell);
                                var cellDate = cellToDate(cell);
                                dayDelta = cellDate.diff(origCellDate, 'days');
                                eventStart = event.start.clone().add('days', dayDelta);
                                renderDayOverlay(eventStart, getEventEnd(event).add('days', dayDelta));
                            } else {
                                dayDelta = 0;
                            }
                        }, ev, 'drag');
                    },
                    stop: function (ev, ui) {
                        hoverListener.stop();
                        clearOverlays();
                        trigger('eventDragStop', eventElement[0], event, ev, ui);
                        if (dayDelta) {
                            eventDrop(eventElement[0], event, eventStart, ev, ui);
                        } else {
                            eventElement.css('filter', '');
                            showEvents(event, eventElement);
                        }
                    }
                });
            }

            function resizableDayEvent(event, element, segment) {
                var isRTL = opt('isRTL');
                var direction = isRTL ? 'w' : 'e';
                var handle = element.find('.ui-resizable-' + direction);
                var isResizing = false;
                disableTextSelection(element);
                element.mousedown(function (ev) {
                    ev.preventDefault();
                }).click(function (ev) {
                    if (isResizing) {
                        ev.preventDefault();
                        ev.stopImmediatePropagation();
                    }
                });
                handle.mousedown(function (ev) {
                    if (ev.which != 1) {
                        return;
                    }
                    isResizing = true;
                    var hoverListener = getHoverListener();
                    var elementTop = element.css('top');
                    var dayDelta;
                    var eventEnd;
                    var helpers;
                    var eventCopy = $.extend({}, event);
                    var minCellOffset = dayOffsetToCellOffset(dateToDayOffset(event.start));
                    clearSelection();
                    $('body').css('cursor', direction + '-resize').one('mouseup', mouseup);
                    trigger('eventResizeStart', element[0], event, ev, {});
                    hoverListener.start(function (cell, origCell) {
                        if (cell) {
                            var origCellOffset = cellToCellOffset(origCell);
                            var cellOffset = cellToCellOffset(cell);
                            cellOffset = Math.max(cellOffset, minCellOffset);
                            dayDelta = cellOffsetToDayOffset(cellOffset) - cellOffsetToDayOffset(origCellOffset);
                            eventEnd = getEventEnd(event).add('days', dayDelta);
                            if (dayDelta) {
                                eventCopy.end = eventEnd;
                                var oldHelpers = helpers;
                                helpers = renderTempDayEvent(eventCopy, segment.row, elementTop);
                                helpers = $(helpers);
                                helpers.find('*').css('cursor', direction + '-resize');
                                if (oldHelpers) {
                                    oldHelpers.remove();
                                }
                                hideEvents(event);
                            } else {
                                if (helpers) {
                                    showEvents(event);
                                    helpers.remove();
                                    helpers = null;
                                }
                            }
                            clearOverlays();
                            renderDayOverlay(event.start, eventEnd);
                        }
                    }, ev);
                    function mouseup(ev) {
                        trigger('eventResizeStop', element[0], event, ev, {});
                        $('body').css('cursor', '');
                        hoverListener.stop();
                        clearOverlays();
                        if (dayDelta) {
                            eventResize(element[0], event, eventEnd, ev, {});
                        }
                        setTimeout(function () {
                            isResizing = false;
                        }, 0);
                    }
                });
            }
        }

        function isDaySegmentCollision(segment, otherSegments) {
            for (var i = 0; i < otherSegments.length; i++) {
                var otherSegment = otherSegments[i];
                if (otherSegment.leftCol <= segment.rightCol && otherSegment.rightCol >= segment.leftCol) {
                    return true;
                }
            }
            return false;
        }

        function segmentElementEach(segments, callback) {
            for (var i = 0; i < segments.length; i++) {
                var segment = segments[i];
                var element = segment.element;
                if (element) {
                    callback(segment, element, i);
                }
            }
        }

        function compareDaySegments(a, b) {
            return b.rightCol - b.leftCol - (a.rightCol - a.leftCol) || b.event.allDay - a.event.allDay || a.event.start - b.event.start || (a.event.title || '').localeCompare(b.event.title);
        };
        ;
        function SelectionManager() {
            var t = this;
            t.select = select;
            t.unselect = unselect;
            t.reportSelection = reportSelection;
            t.daySelectionMousedown = daySelectionMousedown;
            t.selectionManagerDestroy = destroy;
            var calendar = t.calendar;
            var opt = t.opt;
            var trigger = t.trigger;
            var defaultSelectionEnd = t.defaultSelectionEnd;
            var renderSelection = t.renderSelection;
            var clearSelection = t.clearSelection;
            var selected = false;
            if (opt('selectable') && opt('unselectAuto')) {
                $(document).on('mousedown', documentMousedown);
            }
            function documentMousedown(ev) {
                var ignore = opt('unselectCancel');
                if (ignore) {
                    if ($(ev.target).parents(ignore).length) {
                        return;
                    }
                }
                unselect(ev);
            }

            function select(start, end) {
                unselect();
                start = calendar.moment(start);
                if (end) {
                    end = calendar.moment(end);
                } else {
                    end = defaultSelectionEnd(start);
                }
                renderSelection(start, end);
                reportSelection(start, end);
            }

            function unselect(ev) {
                if (selected) {
                    selected = false;
                    clearSelection();
                    trigger('unselect', null, ev);
                }
            }

            function reportSelection(start, end, ev) {
                selected = true;
                trigger('select', null, start, end, ev);
            }

            function daySelectionMousedown(ev) {
                var cellToDate = t.cellToDate;
                var getIsCellAllDay = t.getIsCellAllDay;
                var hoverListener = t.getHoverListener();
                var reportDayClick = t.reportDayClick;
                if (ev.which == 1 && opt('selectable')) {
                    unselect(ev);
                    var dates;
                    hoverListener.start(function (cell, origCell) {
                        clearSelection();
                        if (cell && getIsCellAllDay(cell)) {
                            dates = [cellToDate(origCell), cellToDate(cell)].sort(dateCompare);
                            renderSelection(dates[0], dates[1].clone().add('days', 1));
                        } else {
                            dates = null;
                        }
                    }, ev);
                    $(document).one('mouseup', function (ev) {
                        hoverListener.stop();
                        if (dates) {
                            if (+dates[0] == +dates[1]) {
                                reportDayClick(dates[0], ev);
                            }
                            reportSelection(dates[0], dates[1].clone().add('days', 1), ev);
                        }
                    });
                }
            }

            function destroy() {
                $(document).off('mousedown', documentMousedown);
            }
        };
        ;
        function OverlayManager() {
            var t = this;
            t.renderOverlay = renderOverlay;
            t.clearOverlays = clearOverlays;
            var usedOverlays = [];
            var unusedOverlays = [];

            function renderOverlay(rect, parent) {
                var e = unusedOverlays.shift();
                if (!e) {
                    e = $('<div class=\'fc-cell-overlay\' style=\'position:absolute;z-index:3\'/>');
                }
                if (e[0].parentNode != parent[0]) {
                    e.appendTo(parent);
                }
                usedOverlays.push(e.css(rect).show());
                return e;
            }

            function clearOverlays() {
                var e;
                while (e = usedOverlays.shift()) {
                    unusedOverlays.push(e.hide().unbind());
                }
            }
        };
        ;
        function CoordinateGrid(buildFunc) {
            var t = this;
            var rows;
            var cols;
            t.build = function () {
                rows = [];
                cols = [];
                buildFunc(rows, cols);
            };
            t.cell = function (x, y) {
                var rowCnt = rows.length;
                var colCnt = cols.length;
                var i, r = -1, c = -1;
                for (i = 0; i < rowCnt; i++) {
                    if (y >= rows[i][0] && y < rows[i][1]) {
                        r = i;
                        break;
                    }
                }
                for (i = 0; i < colCnt; i++) {
                    if (x >= cols[i][0] && x < cols[i][1]) {
                        c = i;
                        break;
                    }
                }
                return r >= 0 && c >= 0 ? {row: r, col: c} : null;
            };
            t.rect = function (row0, col0, row1, col1, originElement) {
                var origin = originElement.offset();
                return {
                    top: rows[row0][0] - origin.top,
                    left: cols[col0][0] - origin.left,
                    width: cols[col1][1] - cols[col0][0],
                    height: rows[row1][1] - rows[row0][0]
                };
            };
        };
        ;
        function HoverListener(coordinateGrid) {
            var t = this;
            var bindType;
            var change;
            var firstCell;
            var cell;
            t.start = function (_change, ev, _bindType) {
                change = _change;
                firstCell = cell = null;
                coordinateGrid.build();
                mouse(ev);
                bindType = _bindType || 'mousemove';
                $(document).bind(bindType, mouse);
            };
            function mouse(ev) {
                _fixUIEvent(ev);
                var newCell = coordinateGrid.cell(ev.pageX, ev.pageY);
                if (Boolean(newCell) !== Boolean(cell) || newCell && (newCell.row != cell.row || newCell.col != cell.col)) {
                    if (newCell) {
                        if (!firstCell) {
                            firstCell = newCell;
                        }
                        change(newCell, firstCell, newCell.row - firstCell.row, newCell.col - firstCell.col);
                    } else {
                        change(newCell, firstCell);
                    }
                    cell = newCell;
                }
            }

            t.stop = function () {
                $(document).unbind(bindType, mouse);
                return cell;
            };
        }

        function _fixUIEvent(event) {
            if (event.pageX === undefined) {
                event.pageX = event.originalEvent.pageX;
                event.pageY = event.originalEvent.pageY;
            }
        };
        ;
        function HorizontalPositionCache(getElement) {
            var t = this, elements = {}, lefts = {}, rights = {};

            function e(i) {
                return elements[i] = elements[i] || getElement(i);
            }

            t.left = function (i) {
                return lefts[i] = lefts[i] === undefined ? e(i).position().left : lefts[i];
            };
            t.right = function (i) {
                return rights[i] = rights[i] === undefined ? t.left(i) + e(i).width() : rights[i];
            };
            t.clear = function () {
                elements = {};
                lefts = {};
                rights = {};
            };
        };
        ;
    }));
})
define("lib/fullcalendar/lang/zh-cn.rkhd.js", [], function (require, exports, module) {
    'use strict';
    (function (e) {
        'function' == typeof define && define.amd ? define(['jquery', 'moment'], e) : e(jQuery, moment);
    }(function (e, t) {
        t.locale('zh-cn', {
            months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
            monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
            weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
            weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
            weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
            longDateFormat: {
                LT: 'Ah点mm',
                L: 'YYYY-MM-DD',
                LL: 'YYYY年M月',
                LLL: 'YYYY年MMMD日dddd',
                LLLL: 'YYYY年MMMD日LT',
                l: 'YYYY-MM-DD',
                ll: 'YYYY年MMMD日',
                lll: 'YYYY年MMMD日LT',
                llll: 'YYYY年MMMD日ddddLT'
            },
            meridiem: function (e, t) {
                var a = 100 * e + t;
                return 600 > a ? '凌晨' : 900 > a ? '早上' : 1130 > a ? '上午' : 1230 > a ? '中午' : 1800 > a ? '下午' : '晚上';
            },
            calendar: {
                sameDay: function () {
                    return 0 === this.minutes() ? '[今天]Ah[点整]' : '[今天]LT';
                }, nextDay: function () {
                    return 0 === this.minutes() ? '[明天]Ah[点整]' : '[明天]LT';
                }, lastDay: function () {
                    return 0 === this.minutes() ? '[昨天]Ah[点整]' : '[昨天]LT';
                }, nextWeek: function () {
                    var e, a;
                    return e = t().startOf('week'), a = this.unix() - e.unix() >= 604800 ? '[下]' : '[本]', 0 === this.minutes() ? a + 'dddAh点整' : a + 'dddAh点mm';
                }, lastWeek: function () {
                    var e, a;
                    return e = t().startOf('week'), a = this.unix() < e.unix() ? '[上]' : '[本]', 0 === this.minutes() ? a + 'dddAh点整' : a + 'dddAh点mm';
                }, sameElse: 'LL'
            },
            ordinal: function (e, t) {
                switch (t) {
                    case'd':
                    case'D':
                    case'DDD':
                        return e + '日';
                    case'M':
                        return e + '月';
                    case'w':
                    case'W':
                        return e + '周';
                    default:
                        return e;
                }
            },
            relativeTime: {
                future: '%s内',
                past: '%s前',
                s: '几秒',
                m: '1分钟',
                mm: '%d分钟',
                h: '1小时',
                hh: '%d小时',
                d: '1天',
                dd: '%d天',
                M: '1个月',
                MM: '%d个月',
                y: '1年',
                yy: '%d年'
            },
            week: {dow: 1, doy: 4}
        }), e.fullCalendar.datepickerLang('zh-cn', 'zh-CN', {
            closeText: '关闭',
            prevText: '&#x3C;上月',
            nextText: '下月&#x3E;',
            currentText: '今天',
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
            weekHeader: '周',
            dateFormat: 'yy-mm-dd',
            firstDay: 1,
            isRTL: !1,
            showMonthAfterYear: !0,
            yearSuffix: '年'
        }), e.fullCalendar.lang('zh-cn', {
            defaultButtonText: {month: '月', week: '周', day: '日', list: '日程'},
            allDayText: '全天'
        });
    }));
})
define("crm/js/apps/visitplan/visitplanrule.js", ["core/rkloader.js", "lib/fullcalendar/fullcalendar.js", "lib/fullcalendar/fullcalendar.css", "oa/css/schedule/schedule.css", "lib/fullcalendar/lang/zh-cn.rkhd.js"], function (require, exports, module) {
    'use strict';
    function e(e) {
        $('body').gridPicker({
            item: {relationBelongId: 1, itemName: SESSION.keywords.account},
            searchCondition: {},
            onConfirm: function (t) {
                $.isFunction(e) && e(t), t.length > 0 ? ($('body').popupGrid('destroy'), l.closeDialog()) : ($('body').popupGrid('destroy'), l.closeDialog());
            }
        });
    }

    function t(e, t) {
        var a = '';
        switch (parseInt(e)) {
            case 1:
                a = moment(t).format('YYYY-MM-DD');
                break;
            case 2:
                a = '周' + moment(t).format('dd');
                break;
            case 3:
                a = moment(t).format('D') + '日';
        }
        return a;
    }

    function a(e, t) {
        if (3 == e) {
            var a = moment(t).format('DD');
            return n(e) + '-' + a;
        }
        return t;
    }

    function n(e) {
        return 'zh-cn' === SESSION.user.language || 2 == e ? '2016-08' : '2016-05';
    }

    var l = require('rk');
    require('lib/fullcalendar/fullcalendar'), require('lib/fullcalendar/fullcalendar.css'), require('oa/css/schedule/schedule.css'), 'zh-cn' === SESSION.user.language && require('lib/fullcalendar/lang/zh-cn.rkhd'), $.widget('rk.visitplanrule', {
        options: {
            allEvent: {},
            maxNumInTd: 4,
            $visitTemplate: $(),
            repeatRule: 1
        }, _create: function () {
        }, _setOption: function (e, t) {
            var a = this, l = a.element;
            a.options;
            if ('repeatRule' == e)switch (l.removeClass('none-repeat week-repeat month-repeat'), t) {
                case'1':
                    l.addClass('none-repeat'), l.fullCalendar('changeView', 'month'), l.fullCalendar('gotoDate', moment.now());
                    break;
                case'2':
                    l.addClass('week-repeat'), l.fullCalendar('changeView', 'basicWeek'), l.fullCalendar('gotoDate', n(2));
                    break;
                case'3':
                    l.addClass('month-repeat'), l.fullCalendar('changeView', 'month'), l.fullCalendar('gotoDate', n());
            }
            a._super(e, t);
        }, detailItemsToAllEvent: function () {
            var e = this, t = e.options, a = (e.element, t.data);
            a && a.forEach(function (e) {
                !t.allEvent[e.start] && (t.allEvent[e.start] = {}), t.allEvent[e.start][e.visitobject.id] = {
                    id: e.visitobject.id,
                    title: e.visitobject.label,
                    start: e.start,
                    allDay: !0
                };
            });
        }, _init: function () {
            var t = this, a = t.element, n = t.options;
            t.bindEvent(), t.detailItemsToAllEvent();
            var l = a.fullCalendar({
                header: {left: '', center: 'prev title next ', right: ''},
                lang: 'zh-cn',
                editable: !0,
                columnFormat: {month: 'dddd', week: 'dddd', day: 'dddd'},
                firstDay: 1,
                titleFormat: {month: 'LL'},
                weekMode: 'variable',
                dayRender: function (e, t, a) {
                    t.append('<div class=\"calendar-td-mask\"><span class=\"add-icon\"></span></div><div class=\"calendar-td-more\"><span class=\"more\">1家</span></div>');
                },
                viewRender: function (e, l) {
                    $.isEmptyObject(n.allEvent) && t.clearDetailRow(a.parent().find('div[entityId]')), l.find('td[data-date]').each(function (e, l) {
                        var i = $(l), d = i.attr('data-date'), r = n.allEvent[d];
                        if (r) {
                            var o = Object.keys(r), s = o.length;
                            if (s > n.maxNumInTd)t.showNum(i, s); else for (var c in r)!function (e) {
                                setTimeout(function () {
                                    a.fullCalendar('renderEvent', {
                                        id: r[e].id,
                                        title: r[e].title,
                                        start: moment(d).format('YYYY-MM-DD'),
                                        allDay: !0
                                    });
                                });
                            }(c);
                        }
                    });
                },
                dayClick: function (i, d, r) {
                    var o = $(d.target), s = moment(i).format('YYYY-MM-DD'), c = o.closest('td.fc-widget-content');
                    o.closest('span.add-icon').size() > 0 && e(function (e) {
                        var d = l.fullCalendar('clientEvents', function (e) {
                            return s == moment(e.start).format('YYYY-MM-DD');
                        }), r = d.length, o = _.keyBy(d, '_id');
                        !n.allEvent[s] && (n.allEvent[s] = {}), e.forEach(function (e, d) {
                            n.allEvent[s][e.id] = {
                                id: e.id,
                                title: e.accountName,
                                start: moment(i).format('YYYY-MM-DD'),
                                allDay: !0
                            }, o[e.id] || (t.addDetailRow(a.parent().find('div[entityId]'), n.allEvent[s][e.id]), r < n.maxNumInTd ? (l.fullCalendar('renderEvent', n.allEvent[s][e.id]), r++) : r >= n.maxNumInTd && (r++, t.showNum(c, r)));
                        }), r > n.maxNumInTd && l.fullCalendar('removeEvents', function (e) {
                            return s == moment(e.start).format('YYYY-MM-DD');
                        });
                    });
                }
            });
            t._setOption('repeatRule', n.repeatRule);
        }, showNum: function (e, t) {
            var a = e.offset();
            e.closest('div.fc-view').hasClass('fc-view-basicWeek') ? a.left += 1 : (a.top += 13, a.left += 1), e.find('div.calendar-td-more').offset(a), e.find('div.calendar-td-more span.more').html(t + '家');
        }, bindEvent: function () {
            var e = this, t = e.element, a = e.options;
            t.on('mouseenter', 'td.fc-widget-content', function () {
                var e = $(this);
                return (3 != a.repeatRule || moment(e.attr('data-date')).format('YYYY-MM') == moment(n(a.repeatRule)).format('YYYY-MM')) && (e.css('background-color', '#f2f4f7'), e.find('div.calendar-td-more').css('background-color', '#f2f4f7'), void e.find('div.calendar-td-mask').offset(e.offset()));
            }), t.on('mouseleave', 'td.fc-widget-content', function () {
                var e = $(this);
                e.css('background-color', 'inherit'), e.find('div.calendar-td-more').css('background-color', 'inherit'), e.find('div.calendar-td-mask').offset({left: -100});
            });
        }, clearDetailRow: function (e) {
            e.detailgrid('clear');
        }, addDetailRow: function (e, a) {
            var n = this, l = (n.element, n.options), i = l.repeatRule, d = {};
            d.start = a.start, d.repetitionday = t(i, a.start), d.visitobject = {
                value: a.id,
                id: a.id,
                label: a.title,
                name: a.title
            };
            var r = l.$visitTemplate;
            r.size() > 0 && (d.visit_model = {value: r.val()}), d.entityType = l.entityType, e.detailgrid('addNewRow', d);
        }, removeCalendarEvent: function (e) {
            var t = this, a = t.element, n = t.options, l = e.date, i = e.id;
            if (l && i && n.allEvent[l] && n.allEvent[l][i]) {
                delete n.allEvent[l][i], a.fullCalendar('removeEvents', function (t) {
                    return moment(t.start).format('YYYY-MM-DD') == l && t.id == e.id;
                });
                var d = Object.keys(n.allEvent[l]), r = d.length, o = a.find('[data-date=' + l + ']');
                r == n.maxNumInTd ? (d.forEach(function (e) {
                    a.fullCalendar('renderEvent', n.allEvent[l][e]);
                }), o.find('div.calendar-td-mask').offset({left: -100}), o.find('div.calendar-td-more').offset({left: -100})) : r > n.maxNumInTd && o.find('div.calendar-td-more span.more').text(r + '家');
            }
        }
    }), module.exports = {dataToRepeatRuleStr: t, transformDate: a};
})
define("crm/js/apps/activityrecord/render.js", [], function (require, exports, module) {
    'use strict';
    module.exports = {
        render: {
            activityRecordFrom: function (t) {
                if (t && t.systemId)return '510' == t.systemId ? '<div class=\"jqx_grid_td jqx_grid_td_activityrecord\"><a href=\"/final/account.action?id=' + t.entityId + '\" target=\"_blank\" class=\"entry_name\"><span class=\"name\">' + $.htmlEncode(SESSION.keywords.account) + '\u3010' + $.htmlEncode(t.entityName) + '\u3011</span></a></div>' : '515' == t.systemId ? '<div class=\"jqx_grid_td jqx_grid_td_activityrecord\"><a href=\"/final/partner.action?id=' + t.entityId + '\" target=\"_blank\" class=\"entry_name\"><span class=\"name\">' + $.htmlEncode(SESSION.keywords.partner) + '\u3010' + $.htmlEncode(t.entityName) + '\u3011</span></a></div>' : '518' == t.systemId ? '' == t.fromAccount || void 0 == t.fromAccount ? '<div class=\"jqx_grid_td jqx_grid_td_activityrecord\"><a href=\"/final/contact.action?id=' + t.entityId + '\" target=\"_blank\" class=\"entry_name\"><span class=\"name\">' + $.htmlEncode(SESSION.keywords.contact) + '\u3010' + $.htmlEncode(t.entityName) + '\u3011</span></a></div>' : '<div class=\"jqx_grid_td jqx_grid_td_activityrecord\"><a href=\"/final/contact.action?id=' + t.entityId + '\" target=\"_blank\" class=\"entry_name\"><span class=\"name\">' + $.htmlEncode(SESSION.keywords.contact) + '\u3010' + $.htmlEncode(t.entityName) + '\u3011</span></a><span class=\"entry_form\" title=\"' + t.fromAccount + '\">' + $.htmlEncode(t.fromAccount) + '</span></div>' : '522' == t.systemId ? '<div class=\"jqx_grid_td jqx_grid_td_activityrecord\"><a href=\"/final/lead.action?id=' + t.entityId + '\" target=\"_blank\" class=\"entry_name\"><span class=\"name\">' + $.htmlEncode(SESSION.keywords.lead) + '\u3010' + $.htmlEncode(t.entityName) + '\u3011</span></a></div>' : '511' == t.systemId ? '' == t.fromAccount || void 0 == t.fromAccount ? '<div class=\"jqx_grid_td jqx_grid_td_activityrecord\"><a href=\"/final/opportunity.action?id=' + t.entityId + '\" target=\"_blank\" class=\"entry_name\"><span class=\"name\">' + $.htmlEncode(SESSION.keywords.opportunity) + '\u3010' + $.htmlEncode(t.entityName) + '\u3011</span></a></div>' : '<div class=\"jqx_grid_td jqx_grid_td_activityrecord\"><a href=\"/final/opportunity.action?id=' + t.entityId + '\" target=\"_blank\" class=\"entry_name\"><span class=\"name\">' + $.htmlEncode(SESSION.keywords.opportunity) + '\u3010' + $.htmlEncode(t.entityName) + '\u3011</span></a><span class=\"entry_form\" title=\"' + t.fromAccount + '\">' + $.htmlEncode(t.fromAccount) + '</span></div>' : '516' == t.systemId ? '<div class=\"jqx_grid_td jqx_grid_td_activityrecord\"><a href=\"/final/campaign.action?id=' + t.entityId + '\" target=\"_blank\" class=\"entry_name\"><span class=\"name\">' + $.htmlEncode(SESSION.keywords.campaign) + '\u3010' + $.htmlEncode(t.entityName) + '\u3011</span></a></div>' : '999' == t.systemId ? '<div class=\"jqx_grid_td jqx_grid_td_activityrecord\"><a href=\"/final/customize.action?belongId=' + t.belongId + '&id=' + t.entityId + '\" target=\"_blank\" class=\"entry_name\"><span class=\"name\">' + $.htmlEncode(void 0 == t.belongName ? t.about : t.belongName) + '\u3010' + $.htmlEncode(t.entityName) + '\u3011</span></a></div>' : '<div class=\"jqx_grid_td jqx_grid_td_activityrecord\"><span class=\"name\">' + $.htmlEncode(t.entityName) + '</span></div>';
            }
        }
    };
})
define("core/widgets/itemsCRU/filters.js", ["core/rkloader.js", "crm/js/apps/activityrecord/render.js", "crm/js/apps/visitplan/visitplanrule.js"], function (require, exports, module) {
    'use strict';
    var e = require('rk'), r = require('crm/js/apps/activityrecord/render'), n = require('crm/js/apps/visitplan/visitplanrule'), t = /((?:https?|ftp):\/\/[\w-]+(\.[\w-]+)?\S*)/g, a = /(@(\S+))(\s+|$)/g, l = function (e) {
        return e.replace(t, function (e) {
            return ['<a href=\"', e, '\" target=\"_blank\">', e, '</a>'].join('');
        });
    }, i = {
        auto: function (e, r) {
            var n = $.isArray(r), t = $.isPlainObject(r);
            return t && r.icon && ~r.icon.indexOf('/') ? i.user(e, r) : n || t ? e.hasOwnProperty('relationBelongId') ? i.relation(e, r) : 'accountId' == e.entryPropertyNameOnly ? (e.relationBelongId = 1, i.relation(e, r)) : 'opportunityId' == e.entryPropertyNameOnly ? (e.relationBelongId = 3, i.relation(e, r)) : 'contractId' == e.entryPropertyNameOnly ? (e.relationBelongId = 15, i.relation(e, r)) : 'orderId' == e.entryPropertyNameOnly ? (e.relationBelongId = 35, i.relation(e, r)) : 'contactId' == e.entryPropertyNameOnly ? (e.relationBelongId = 2, i.relation(e, r)) : i.options(e, r) : 'product.url' == e.entryPropertyName ? (r = $.htmlEncode(r), r = '<img src=\"' + r + '\" width=\"30px\" height=\"30px\" />') : i.text(e, r);
        }, text: function (r, a, l, i) {
            if ('use_condition' == r.entryPropertyNameOnly && (a = $.isPlainObject(a) ? JSON.parse(a.label) : JSON.parse(a), $.isArray(a.departs) && a.departs[0] && $.isArray(a.departs[0].value) && (a = a.departs[0].value.map(function (e) {
                    return e.label;
                }).join(','))), 'repetitionday' == r.entryPropertyNameOnly) {
                var o = i && i.repetition_rule ? i.repetition_rule : 1;
                a = n.dataToRepeatRuleStr(o, a);
            }
            return a = String($.htmlEncode(a)), (~a.indexOf('http:') || ~a.indexOf('https:') || ~a.indexOf('ftp:')) && (a = a.replace(t, '<a href=\"$1\" target=\"_blank\" class=\"item-url\" title=\"$1\">$1</a>')), 'phone' == r.entryPropertyNameOnly && window.SESSION.callCenterObj && 1 == $.parseJSON(window.SESSION.callCenterObj).phone && (a += '<a><span mobile=' + a + ' class=\"account-phone-dialout js-icall-act\" title=\"' + e.i18n('CALLCENTER_TITLE') + '\"></span></a>'), a;
        }, options: function (e, r) {
            return $.isArray(r) ? r.map(function (e, r) {
                return $.htmlEncode(e.label);
            }).join(', ') : $.htmlEncode(r) && ($.htmlEncode(r.value) || 0 == r.value) ? $.htmlEncode(r.label) : '';
        }, number: function (e, r) {
            return $.isNumeric(r) || (r = r ? r.replace(/,/gi, '') : r), $.isNumeric(r) ? $.formatNumber(r, e.resolution, !0) : '';
        }, percent: function (e, r) {
            return $.isNumeric(r) ? $.formatNumber(r, e.resolution, !0) + '%' : '';
        }, currency: function (e, r) {
            return $.isNumeric(r) || (r = r ? r.replace(/,/gi, '') : r), $.isNumeric(r) ? $.formatNumber(r, e.resolution, !0) + $.htmlEncode(SESSION.currencyUnit) : '';
        }, date: function (e, r) {
            return r ? 26 != e.itemTypeEntry || Number(r) ? Globalize.format(new Date(r - 0), 'yyyy-MM-dd') : r : '';
        }, datetime: function (e, r) {
            return r ? 26 != e.itemTypeEntry || Number(r) ? Globalize.format(new Date(r - 0), 'yyyy-MM-dd HH:mm') : r : '';
        }, user: function (e, r) {
            var n = $.htmlEncode(r.label);
            return r ? ['<a href=\"/final/user.action?id=', r.value, '\" ucard=\"uid=', r.value, '\" target=\"_blank\" class=\"item-user\" title=\"', n, '\"><img src=\"', $.htmlEncode(r.icon), '\" class=\"item-user-icon\"><span class=\"item-user-name\">', n, '</span></a>'].join('') : '';
        }, relation: function (r, n) {
            var t = r.relationBelongId > 999 && 'customize' || 50 != r.relationBelongId && e.queryBelong(r.relationBelongId, 'name'), a = $.htmlEncode(n.label);
            return t ? ['<a href=\"', $.pages(t, '/final/'), '?id=', n.value, 'customize' === t ? '&belongId=' + r.relationBelongId : '', '\" target=\"_blank\" class=\"item-relation\" title=\"', a, '\"><span class=\"item-user-name\">', a, '</span></a>'].join('') : i.options(r, n);
        }, image: function (e, r) {
            var n = '';
            return 'object' != typeof r && (r = $.parseJSON(r)), r.length ? (n += '<ul class=\"feed-show-more-img js-album-box clear\">', $.each(r, function (e, r) {
                n += e < 3 ? '<li><a class=\"js-album\" href=\"' + r.fileUrl + '\" lurl=\"' + r.fileLUrl + '\" surl=\"' + r.fileSUrl + '\"><img src=\"' + r.fileUrl + '\" class=\"mCS_img_loaded\"></a></li>' : '<li style=\"display:none;\"><a class=\"js-album\" href=\"' + r.fileUrl + '\" lurl=\"' + r.fileLUrl + '\" surl=\"' + r.fileSUrl + '\"><img src=\"' + r.fileUrl + '\" class=\"mCS_img_loaded\"></a></li>';
            }), r.length > 3 && (n += '<li class=\'more_img\' title=\'more\'><span class=\'more_dot\'></span></li>'), n += '</ul>') : '';
        }, email: function (e, r) {
            return r = $.htmlEncode(r), r ? '<a href=\"mailto:' + r + '\" class=\"item-url\">' + r + '</a>' : '';
        }, urllink: function (e, r) {
            r = $.htmlEncode(r);
            var n = r ? r.indexOf('https://') != -1 || r.indexOf('http://') != -1 ? r : 'http://' + r : '';
            return r ? '<a target=\"_blank\" rel=\"noopener noreferrer\" href=\"' + n + '\" class=\"item-url\">' + r + '</a>' : '';
        }, phone: function (r, n) {
            n = $.htmlEncode(n);
            var t = n.replace(/-/g, '').replace(/\+/g, '');
            return window.SESSION.callCenterObj && 1 == $.parseJSON(window.SESSION.callCenterObj).callcenterFlag && (n = n ? n + '<a><span mobile=' + t + ' class=\"account-phone-dialout js-icall-act\" title=\"' + e.i18n('CALLCENTER_TITLE') + '\"></span></a>' : ''), n;
        }, voice: function (r, n) {
            return n = $.htmlEncode(n), n && '[]' != n ? '<span title=\"' + e.i18n('APPS_FEED_CLICK_PLAY') + '\" class=\"item-player\" style=\"margin-top:5px;\"><span class=\"item-player-inner\"><span class=\"item-player-length\"></span></span><span class=\"item-player-btn\"></span><span class=\"item-player-corner\"></span></span><audio class=\"hidden js-audio\" src=\"' + n + '\"></audio>' : '';
        }, activityRecordFrom: function (e, n) {
            var t = r.render.activityRecordFrom;
            return t(n);
        }, content: function (r, n, t) {
            var i;
            if (1 == t.length) {
                var o = t[0].content;
                return o = l(o), o = ~o.indexOf('@') ? o.replace(a, function (r, n, a, l) {
                    if (t[0].ats && (i = t[0].ats[a]))return i.id || (i.id = i.uid), ['<a href=\"/final/user.action?uid=', i.id, '\" ucard=\"uid=', i.id, '\" target=\"_blank\">', n, '</a>', l].join('');
                    var o = t[0].atDeparts;
                    return o && o[a] ? ['<a href=\"/final/depart.action?id=', o[a].id, '\" target=\"_blank\">', '@' + e.htmlEscape(o[a].realName) || o[a].name, '</a>', l].join('') : r;
                }) : o, o.replace(/\n/g, '<br>');
            }
        }
    };
    module.exports = i;
})
define("core/widgets/itemsCRU/item.js", ["core/rkloader.js", "core/widgets/itemsCRU/filters.js", "core/widgets/itemsCRU/inplaceEditors.js", "crm/js/core/grid/tmpl/cascadeItem.tpl"], function (require, exports, module) {
    'use strict';
    var t = require('rk'), e = {
        auto: function (t, e) {
            return e instanceof Date && (e = +e), e;
        }
    }, i = {
        auto: function (e, i, n, s) {
            return 1 == n.mustEnterFlg && ('' === i || null == i || $.isArray(i) && 0 == i.length || $.isPlainObject(i) && null == i.value) ? t.i18n('CRM_CORE_PLEASE_INPUT_2') + n.itemName : 29 == n.searchType && '[]' == i && 1 == n.mustEnterFlg ? t.i18n('CRM_CORE_PLEASE_INPUT_2') + n.itemName : ('phone' != n.entryPropertyNameOnly || /^\+?[\d\-]{4,30}$|/.test($.trim(i))) && ('fax' != n.entryPropertyNameOnly || /^\+?[\d\-]{4,30}$|/.test($.trim(i))) ? void 0 : n.itemName + t.i18n('OLDCRM_CORE_2');
        }
    }, n = {
        auto: function (t) {
            return !t.hasOwnProperty('isVisible') || t.isVisible;
        }
    }, s = {
        auto: function (t) {
            return !!t.hasOwnProperty('isEdit') && t.isEdit;
        }
    }, a = function (t) {
        var e, i = ['{{each entities as entity x}}', '<div class=\"xsy_su_info\" data-entity-primary=\"{{entity.id}}\">', '    {{each itemsTree as group i}}', '    <section class=\"xsy_su_info_sec\">', '        {{if group.itemName}}<h2 class=\"xsy_su_info_title\">{{group.itemName}}</h2>{{/if}}', '        <ul class=\"xsy_su_info_list\">', '            {{each group._children as item j}}', '                <li class=\"xsy_su_info_item js-item {{if item.itemType == 2 || item.itemType == 29 || item.entryPropertyNameOnly == \"state\"}}single-column{{/if}} {{item.isEdit ? \'\' : \'noneeditable\'}}\">', '                    <div class=\"xsy_su_info_label\">{{item.itemName}}</div>', '                    <div class=\"xsy_su_info_data\" data-item-primary=\"{{item.entryPropertyName}}\"></div>', '                </li>', '            {{/each}}', '        </ul>', '    </section>', '    {{/each}}', '</div>', '{{/each}}'].join(''), n = this, s = [], a = n.items, r = n.entities;
        return a.forEach(function (t, i) {
            8 == t.searchType ? (e = t._children = [], s.push(t)) : n.getVisible(t) && (e || (e = {itemName: ''}, s.push(e), e = e._children = []), e.push(t));
        }), s = s.filter(function (t) {
            return t._children.some(function (t) {
                return n.getVisible(t);
            });
        }), template.compile(i)({itemsTree: s, entities: r});
    }, r = {
        buildHtml: a,
        entities: null,
        entityPrimaryKey: 'id',
        items: [],
        itemPrimaryKey: 'entryPropertyName',
        itemSearchKeys: ['entryPropertyNameOnly', 'searchType'],
        dataKey: 'entryPropertyNameOnly',
        itemsProcessor: {
            cvtOptsToVals: function (t) {
                var e = -1;
                t.forEach(function (t, i) {
                    t.options && !t.values && (t.values = {}, t.options.forEach(function (e) {
                        t.values[e.value] = e;
                    })), 'comment' == t.entryPropertyNameOnly && (e = i);
                }), e > -1 && t.push(t.splice(e, 1)[0]);
            }, moveCommentEnd: function (t) {
                var e = t.findIndex(function (t) {
                    return 'comment' == t.entryPropertyNameOnly;
                });
                e > -1 && t.push(t.splice(e, 1)[0]);
            }
        },
        filters: require('./filters'),
        filtersMap: {
            1: 'text', 2: 'text', 5: 'number', 6: function (t) {
                return 'order.paymentPercent' == t.entryPropertyName || 'contract.paymentPercent' == t.entryPropertyName ? 'percent' : t.currencyFlg ? 'currency' : 'number';
            }, 7: function (t) {
                return 2 != t.dateMode ? 'date' : 'datetime';
            }, 8: 'text', 9: 'text', 27: function (t) {
                if (6 == t.formulaDataType || 28 == t.formulaDataType)return 'number';
            }, 22: 'phone', 23: 'email', 24: 'urllink', 29: 'image', 30: 'voice'
        },
        widgets: require('./inplaceEditors'),
        widgetsMap: {
            1: 'textinput',
            2: 'textarea',
            3: 'singleselect',
            4: 'multiselect',
            5: 'integerInput',
            6: 'numberInput',
            7: function (t) {
                return 2 != t.dateMode ? 'datepickerwidget' : 'datetimepicker';
            },
            10: 'relation',
            99: function (t, e) {
                return t.hasOwnProperty('relationBelongId') ? {
                    1: 'relation',
                    3: 'relation',
                    5: 'relation',
                    6: 'relation',
                    16: 'relation',
                    35: 'relation',
                    50: 'singletreeselector',
                    120: 'singletreeselector',
                    121: 'singletreeselector',
                    122: 'singletreeselector',
                    123: 'singletreeselector'
                }[t.relationBelongId] || t.relationBelongId > 999 && 'relation' : 'contract.opportunityId' == t.entryPropertyName ? (t.relationBelongId = 3, 'relation') : 'product.parentId' == t.entryPropertyName ? 'singleproducttreeselector' : 'products' == t.entryPropertyNameOnly ? 'multiAutocomplete' : 'visitPlanNew' == e.currEntityName && 'ownerId' == t.entryPropertyName || 'product.ownerId' == t.entryPropertyName || 'payment.ownerId' == t.entryPropertyName || 'paymentplan.ownerId' == t.entryPropertyName ? 'singlepeopleselector' : 'payment.orderId' == t.entryPropertyName ? (t.relationBelongId = 35, 'relation') : void 0;
            },
            29: 'multipic',
            22: 'telinput',
            23: 'emailinput',
            24: 'urlinput',
            industryId: 'singleselect',
            visit_model: 'singleselect',
            state: 'administrative',
            sourceId: 'singleselect',
            signerId: 'singlepeopleselector',
            use_condition: 'useCondition',
            startDate: 'startDate',
            endDate: 'endDate'
        },
        standards: e,
        standardsMap: {},
        invalids: i,
        invalidsMap: {},
        visibles: n,
        visiblesMap: {},
        editables: s,
        editablesMap: {},
        entityDataProp: 'entity-primary',
        itemDataProp: 'item-primary'
    }, o = {
        options: r, _create: function () {
            var t = this.options;
            this.entityDataAttr = 'data-' + t.entityDataProp, this.itemDataAttr = 'data-' + t.itemDataProp, this.items = this._cloneItems(), this.itemsMap = $.searchIndex(this.items, t.itemPrimaryKey), this.entities = this._cloneEntities(), this.parentEntity = $.extend(!0, {}, t.parentEntity), this.entitiesMap = $.searchIndex(this.entities, t.entityPrimaryKey), this._elCache = {}, this._fill();
        }, _cloneItems: function () {
            var t = $.extend(!0, [], this.options.items);
            return this._processItems(t), t;
        }, _cloneEntities: function () {
            var t = this.options, e = t.entities;
            return e ? $.isArray(e) ? $.extend(!0, [], e) : [$.extend(!0, {}, e)] : [];
        }, _fill: function () {
            var t = this.options;
            this.element.empty().html(t.buildHtml.call(this, t)), this._mkElemCache();
        }, _mkElemCache: function () {
            var t = this.options, e = this.itemElementMap = {};
            this.element.find(t.itemDataProp).each(function () {
                e[$(this).data(t.itemDataProp)] = el;
            });
        }, _processItems: function (t) {
            var e = this.options.itemsProcessor;
            Object.keys(e, function (i) {
                var n = e[i];
                $.isFunction(n) && n(t);
            });
        }, _getMapping: function (t, e) {
            var i = this.options, n = i[e], s = i[e + 'Map'], a = 9 == t.belongId && 'state' == t.entryPropertyNameOnly && s[t.searchType] || s[t[i.itemPrimaryKey]] || $.isArray(i.itemSearchKeys) && i.itemSearchKeys.length && $.map(i.itemSearchKeys, function (e) {
                    return s['searchType' === e && t.joinItem ? t.joinItem[e] : t[e]] || null;
                })[0] || 'auto', a = $.isFunction(a) ? a.call(this, t, i.entityData) || 'auto' : a;
            return n[a];
        }, _blockRender: function () {
            this.element.css('visibility', 'hidden');
        }, _restoreRender: function () {
            this.element.css('visibility', 'visible');
        }, _getItem: function (t) {
            return this.itemsMap[t];
        }, _getEntity: function (t) {
            return this.entitiesMap[t];
        }, _getRelateItems: function (t) {
            if (t.hasOwnProperty('referLinkId')) {
                var e = t.referLinkId;
                return this.items.filter(function (t) {
                    return t.joinLinkId === e;
                });
            }
        }, viewItem: function (e, i, n) {
            var s = this.options, a = this._getEntity(e), n = n || this._getEntityEl(e), r = this._getItem(i), o = this._getItemEl(e, i);
            if (o.size()) {
                var l = this.getFilter(r.joinItem || r), c = 'orderId' == r[s.dataKey] ? a.po && a.orderId : a[r[s.dataKey]], u = this._notNull(c, r) ? l(r, c, this.entities, this.parentEntity) : this.getEditable(r)(r) && this.options.evtType ? '<span class=\"xsy_su_info_null\">' + (29 == r.searchType ? t.i18n('CRM_CLICK_TO_UPLOAD_PIC') : t.i18n('OLDCRM_CORE_COMMON_108')) + '</span>' : '';
                o.empty().html(u), !!~u.indexOf('<') && o.attr('title', ''), !~u.indexOf('<') && o.attr('title', u), 29 == r.searchType && (o.find('.js-album-box').album(), o.off('click', 'li.more_img').on('click', 'li.more_img', function () {
                    var t = $(this).parent();
                    t.find('li').size() && t.album('showLightBox', t, t.find('li:first'));
                })), 30 == r.searchType && o.off('click', '.item-player').on('click', '.item-player', function () {
                    var t = $(this), e = t.find('span.item-player-btn'), i = t.nextAll('audio'), n = i.get(0), s = 'item-btn-play', a = 'item-btn-pause';
                    e.hasClass(s) ? (e.removeClass(s).addClass(a), n.pause()) : (e.removeClass(a).addClass(s), n.play());
                });
            }
        }, viewEntity: function (t) {
            var e = this, i = this.options, n = this._getEntityEl(t);
            this.items.forEach(function (s) {
                e.viewItem(t, s[i.itemPrimaryKey], n);
            });
        }, _getEntityEl: function (t) {
            return this._elCache[t] || (this._elCache[t] = this.element.find('[' + this.entityDataAttr + '=\"' + t + '\"]'));
        }, _getItemEl: function (t, e) {
            var i = [t, e].join('_');
            return this._elCache[i] || (this._elCache[i] = this._getEntityEl(t).find('[' + this.itemDataAttr + '=\"' + e + '\"]'));
        }, _notNull: function (t, e) {
            return 'activityRecordFrom' == e.entryPropertyNameOnly || (29 != e.searchType || '[]' != t) && !(0 !== t && !t || $.isPlainObject(t) && !t.value && 0 != t.value || $.isArray(t) && !t.length);
        }, _setValue: function (t, e, i) {
            t[e[this.options.dataKey]] = i;
        }, update: function (t) {
            var e = this, i = this.options;
            if (t) {
                $.isArray(t) || (t = [t]);
                var n, s, a, r, o, l, c, u = $.searchIndex(e.items, i.dataKey);
                t.forEach(function (t, m) {
                    m = t[i.entityPrimaryKey], l = e._getEntity(m), m && l && Object.keys(t).forEach(function (d, p) {
                        if (p = u[d]) {
                            if (o = p[i.itemPrimaryKey], s = e._getItemEl(t[i.entityPrimaryKey], p[i.itemPrimaryKey]), $.isFunction(r = e.getInvalid(p)) && (n = r.call(s, l[d], t[d], p, l)))return;
                            if (a = t[d], _.isEqual(a, l[d]))return;
                            e._setValue(l, p, a), e.getEditable(p)(p) && 'rk.itemsform' === e.widgetFullName ? (c = e.itemInsMap[o]) && c.val(a) : e.viewItem(m, o);
                        }
                    });
                });
            }
        }, _destroy: function () {
            this.itemElementMap = null, this.element.empty(), this.items = this.itemsMap = this.entities = this.entitiesMap = null;
        }
    };
    Object.keys(r).forEach(function (t) {
        r.hasOwnProperty(t + 'Map') && (o['get' + t.charAt(0).toUpperCase() + t.slice(1, -1)] = function (e) {
            return this._getMapping(e, t);
        });
    }), $.widget('rk.items', o), $.widget('rk.itemsform', $.rk.items, {
        options: {
            reject: function (t, e) {
            }
        }, _init: function () {
            this.itemInsMap = {}, this.editAll();
        }, _cloneEntities: function () {
            var t = this, e = this.options, i = this._super();
            return i = i.map(function (i) {
                return i || (i = {}), i.hasOwnProperty(e.entityPrimaryKey) || (i[e.entityPrimaryKey] = t._getTmpId()), i;
            });
        }, _getTmpId: function () {
            return String(this.uuid) + String(this._tmpId--);
        }, _tmpId: -1000, editItem: function (t, e, i) {
            var n = this.options, s = this._getEntity(t), i = i || this._getEntityEl(t), a = this._getItem(e), r = this._getItemEl(t, e);
            if (r.size()) {
                var o = this.getWidget(a), l = s[a[n.dataKey]];
                this._cacheInstance(t, e, o && o(r.empty(), a, !1, {defaultValue: l}));
            }
        }, _cacheInstance: function (t, e, i) {
            this.itemInsMap[t] || (this.itemInsMap[t] = {}), this.itemInsMap[t][e] = i;
        }, _getInstance: function (t, e) {
            return this.itemInsMap[t] ? this.itemInsMap[t][e] : null;
        }, editEntity: function (t) {
            var e = this, i = this.options, n = this._getEntityEl(t);
            this.items.forEach(function (s) {
                e.getEditable(s)(s) ? e.editItem(t, s[i.itemPrimaryKey], n) : e.viewItem(t, s[i.itemPrimaryKey], n);
            });
        }, editAll: function () {
            var t = this, e = this.options;
            this._blockRender(), this.entities.forEach(function (i) {
                t.editEntity(i[e.entityPrimaryKey]);
            }), this._restoreRender();
        }, val: function (t) {
            var e, i, n, s, a, r, o, l, c, i, u, m = this, d = this.options, p = !1;
            return arguments.length ? void this.update(t) : (u = new RegExp('^' + m.uuid + '-\\d{4,}$'), m.entities.forEach(function (t) {
                m.items.forEach(function (u) {
                    if (s = t[d.entityPrimaryKey], a = u[d.itemPrimaryKey], n = m._getInstance(s, a), m.getEditable(u)(u) && n) {
                        if (r = n.val(), r = $.isFunction(c = m.getStandard(u)) ? c(u, r) : r, o = m._getItemEl(s, a), e = u[d.dataKey], $.isFunction(i = m.getInvalid(u)) && (l = i.call(o, t[e], r, u, t)))return p = !0, m._trigger('reject', null, {
                            element: o,
                            item: u,
                            newValue: r,
                            message: l
                        });
                        t[e] = r;
                    }
                });
            }), p ? null : m.entities);
        }, _destroy: function () {
            this._super();
            var t, e, i;
            for (e in this.itemInsMap)for (i in this.itemInsMap[e])t = this.itemInsMap[e][i], t && $.isFunction(t.destroy) && t.destroy();
            this.itemInsMap = null;
        }
    }), $.widget('rk.itemsinplace', $.rk.items, {
        options: {
            data: [],
            evtHandle: 'li.js-item',
            evtType: 'click',
            ignore: 'a, li.more_img',
            changeValue: function (e, i, n, s) {
                var a = $.isArray(i) ? i.map(function (t) {
                    return t && t.hasOwnProperty('value') ? t.value : t;
                }).join(',') : i && i.hasOwnProperty('value') ? i.value : i, r = t.queryBelong(n.belongId, 'name') || 'customize';
                return $.post('/json/crm_' + r + '/update.action', {
                    belongTypeId: s.entityType ? s.entityType.value : void 0,
                    belongId: n.belongId > 999 ? n.belongId : void 0,
                    entityId: s.id,
                    itemId: n.id,
                    itemValue: a
                }, null, 'json');
            },
            isRequestSuccess: function (t) {
                return 0 == t.status;
            },
            cancel: null,
            equal: null,
            reject: function (t, e) {
                $.msgNo(e.message);
            },
            local: null,
            savefail: null,
            savestart: null,
            savesuccess: null,
            begin: null,
            end: null,
            editingClass: 'editing',
            loadingClass: 'loading'
        }, _init: function () {
            this.viewAll(), this.options.evtType && this._bindHandler();
        }, _find: function (t) {
            var e, i = (this.options, ['[', ']'].join(this.itemDataAttr));
            return (e = t.closest(i)).size() ? e : (e = t.find(i)).size() ? e : (t = t.parent(), t[0] != this.element[0] && t.size() ? this._find(t) : void 0);
        }, viewAll: function () {
            var t = this, e = this.options;
            this._blockRender(), this.entities.forEach(function (i) {
                t.viewEntity(i[e.entityPrimaryKey]);
            }), this._restoreRender();
        }, _bindHandler: function () {
            var e = this, i = this.options;
            this.editEvtName = i.evtType + this.eventNamespace, this.element.on(this.editEvtName, i.evtHandle || this.itemDataAttr, function (n) {
                var s = $(n.target), a = $(this), r = e._find(a);
                if (r && r.size() && !s.closest(i.ignore).size() && !r.hasClass(i.editingClass)) {
                    var o = r.closest(['[', ']'].join(e.entityDataAttr)), l = o.data(i.entityDataProp), c = e._getEntity(l), u = r.data(i.itemDataProp), m = e._getItem(u), d = {
                        element: r,
                        entity: c,
                        item: m
                    };
                    if (!$.isFunction(e.getEditable(m)) || e.getEditable(m)(m)) {
                        var p = function (i) {
                            for (var n = e.items, s = [], a = 0; a < i.length; a++) {
                                for (var r = !1, o = 0; o < n.length; o++)if (n[o].id == i[a].itemId) {
                                    i[a].isEdit = n[o].isEdit, i[a].mustEnterFlg = n[o].mustEnterFlg, r = !0;
                                    break;
                                }
                                r && s.push(i[a]);
                            }
                            var c = function () {
                                var t, i = $('#cascadeEdit'), n = {}, s = !0;
                                if ($.each(i.find('select'), function (t, e) {
                                        var i = $(e).attr('name'), a = $(e).val();
                                        h < 999 && (i = '\'' + i.split('__')[0].split('.')[1] + '\''), n[i] = a, a || 1 != $(e).attr('mustEnterFlg') || ($(e).next().show(), s = !1);
                                    }), !s)return !1;
                                var a = '';
                                1 == h ? (a = 'account', t = {accountId: l}) : 3 == h ? (a = 'opportunity', t = {opportunityId: l}) : 15 == h ? (a = 'contract', t = {contractId: l}) : 35 == h ? (a = 'order', t = {orderId: l}) : h > 999 && (a = 'customize', t = {
                                    customizeId: l,
                                    belongId: h
                                }), t.paramMap = n;
                                var r = '/json/crm_' + a + '/update-all.action';
                                return $.post(r, t, function (t) {
                                    e._trigger('cascadeSavesuccess', null, {});
                                }), !0;
                            }, u = function (e, i) {
                                t.i18n('CRM_CORE_PLEASE_SELECT');
                                $.postJson('/json/crm_dependency/dependent-by-control.action?decorator=ajaxformat&confirm=true', {
                                    entityId: h,
                                    controlItemId: e,
                                    controlOptionCode: i
                                }, function (t) {
                                    for (var e = 0; e < t.length; e++) {
                                        var i = t[e].itemId, n = (t[e].itemName.replace('.', '_'), t[e].itemLabel, t[e].dependentOptions), s = $('#cascadeEdit').find('select[itemId=' + i + ']'), a = '<option value=\"\">请选择</option>';
                                        if (n)for (var r = 0; r < n.length; r++)a += '<option value=\"' + n[r].optionCode + '\">' + n[r].optionName + '</option>';
                                        s.html(a);
                                    }
                                });
                            };
                            $.widget('rk.relatedItemDialogCtrl', $.rk.oaDialogCtrl, {
                                _init: function () {
                                    var t = this;
                                    t.getBtn('ok').on('click', $.proxy(t.okClicked, t)), t.getBtn('cancel').on('click', $.proxy(t.cancelClicked, t)), $('#cascadeEdit select').on('change', function () {
                                        $(this).next().hide();
                                        var t = $(this).attr('itemId'), e = $(this).val();
                                        u(t, e);
                                    });
                                }, okClicked: function () {
                                    var t = this, e = (t.element, c());
                                    e && t.closeMe();
                                }, cancelClicked: function () {
                                    var t = this;
                                    t.element;
                                    t.closeMe();
                                }
                            });
                            var m = require('../../../crm/js/core/grid/tmpl/cascadeItem.tpl');
                            t.dialog({
                                title: '级联选择',
                                html: t.templateText(m, {items: s}),
                                footer: ['cancel', 'ok'],
                                width: 400,
                                success: function (t, e) {
                                    t.relatedItemDialogCtrl();
                                }
                            });
                        }, y = function () {
                            r.addClass(i.editingClass), e._trigger('begin', null, d);
                            var t, n = c[m[i.dataKey]], s = e.getWidget(m), a = function (n) {
                                r.removeClass([i.loadingClass, i.editingClass].join(' ')), y && (y.destroy && y.destroy(), y = null), t = null, e.viewItem(l, u, o), e._trigger('end', null, d);
                            }, p = function (s, o) {
                                var l, u, p, y = $.isFunction(u = e.getStandard(m)) ? u(m, o.value) : o.value;
                                if (!t || !$.isFunction(t.state) || 'pending' !== t.state()) {
                                    if ($.isFunction(p = e.getInvalid(m)) && (l = p.call(r, n, y, m, i.data)))return e._trigger('reject', null, $.extend({
                                        newValue: y,
                                        message: l
                                    }, d));
                                    if (_.isEqual(n, y))return e._trigger('equal', null, d), a();
                                    if ($.isFunction(i.changeValue)) {
                                        if (t = i.changeValue.call(r, n, y, m, c), t && $.isFunction(t.state) && 'pending' === t.state()) {
                                            e._trigger('savestart', null, $.extend({newValue: y}, d)), r.addClass(i.loadingClass);
                                            var h = function (t) {
                                                e._setValue(c, m, y), e._trigger('savesuccess', null, $.extend({
                                                    response: t,
                                                    newValue: y,
                                                    relation: e._getRelateItems(m)
                                                }, d)), a();
                                            }, f = function (t) {
                                                e._trigger('savefail', null, $.extend({
                                                    response: t,
                                                    newValue: y,
                                                    relation: e._getRelateItems(m)
                                                }, d)), a();
                                            };
                                            t.done(function (t) {
                                                !$.isFunction(i.isRequestSuccess) || i.isRequestSuccess(t) ? h(t) : f(t);
                                            }), t.fail(f);
                                        }
                                    } else e._setValue(c, m, y), e._trigger('local', null, $.extend({
                                        newValue: y,
                                        relation: e._getRelateItems(m)
                                    }, d)), a();
                                }
                            }, y = s && s(r.empty(), m, !0, {
                                    defaultValue: n,
                                    entityData: c,
                                    blur: p,
                                    close: p,
                                    cancel: function () {
                                        e._trigger('cancel', null, d), a();
                                    }
                                });
                        }, h = m.belongId;
                        3 == m.itemType ? $.postJson('/json/crm_dependency/cascade-items.action?decorator=ajaxformat&confirm=true', {
                            entityId: m.belongId,
                            itemId: m.id,
                            dataId: l
                        }, function (t) {
                            var e = $.parseJSON(t.data);
                            e.hasCascade ? p(e.items) : y();
                        }) : y();
                    }
                }
            });
        }, _destroy: function () {
            this_super(), this.editEvtName && this.element.off(this.editEvtName);
        }
    });
})
define("crm/js/core/grid/editorWidgets.js", ["core/rkloader.js", "core/widgets/itemsCRU/item.js"], function (require, exports, module) {
    'use strict';
    require('rk');
    require('core/widgets/itemsCRU/item'), $.rk.items.prototype.options.widgetsMap[99] = function (e) {
        return e.hasOwnProperty('relationBelongId') && '' != e.relationBelongId ? {
            1: 'relation',
            3: 'relation',
            5: 'relation',
            6: 'relation',
            15: 'relation',
            16: 'relation',
            35: 'relation',
            50: 'singletreeselector',
            120: 'singletreeselector',
            121: 'singletreeselector',
            122: 'singletreeselector',
            123: 'singletreeselector'
        }[e.relationBelongId] || e.relationBelongId > 999 && 'relation' : 'lead.leadSourceId' == e.entryPropertyName ? 'singleselect' : 'products' == e.entryPropertyNameOnly ? 'multiAutocomplete' : 'signerId' == e.entryPropertyNameOnly ? 'singlepeopleselector' : 'singletreeselector';
    };
})
define("crm/js/core/grid/tmpl/dateRange.tpl", [], "<div class=\"filter-thumbnail-list filter-thumbnail-datelist overflow-hidden\"> <div class=\"filter-date lfloat\"> <label class=\"dinline-block\">{{ 'SCRPT_TMPL_CONTAINER_CONTENT_ACTIVITYRECORD_9' | i18n }}<span></span></label> <label class=\"invalid-error\"></label> <div id=\"start_date\" class=\"crmDatepicker\" act=\"start\"></div> </div> <div class=\"filter-date lfloat\"> <label class=\"dinline-block\">{{ 'SCRPT_TMPL_CONTAINER_CONTENT_ACTIVITYRECORD_10' | i18n }}<span></span></label> <label class=\"invalid-error\"></label> <div id=\"end_date\" class=\"crmDatepicker\" act=\"end\"></div> </div> </div>")
define("crm/js/core/grid/fieldFilterPop.js", ["core/rkloader.js", "crm/js/core/grid/tmpl/dateRange.tpl"], function (require, exports, module) {
    'use strict';
    function e(e) {
        e.find('.filter-thumbnail-searchlist').beLoading({
            fixedPosition: !0,
            size: 'default',
            bgColor: 'light'
        }), e.find('div.crm-filter-footer-btn-group').hide();
    }

    function t(e) {
        e.find('.filter-thumbnail-searchlist').unLoading(), e.find('div.crm-filter-footer-btn-group').show();
    }

    function a(e, t, a) {
        if (e.indexOf('u.action') == -1 || r.indexOf(a) == -1)return t;
        var i = {customData: $('#div_main_content').customerList('option', 'customData')};
        return $.extend(!0, {}, t, i);
    }

    function i(e, t, a) {
        return e.indexOf('u.action') == -1 || r.indexOf(t) == -1 ? e : (e.indexOf('u.action') >= 0 && ('/highsea.action' == window.location.pathname ? e = e.replace('crm_search', 'crm_highsea') : 'participants' != a && (t = t > 999 ? 999 : t, e = e.replace('crm_search', 'crm_' + n.queryBelong(t, 'name')))), e);
    }

    var n = require('rk');
    $.widget('rk.fieldFilterPop', {
        options: {filterItem: null, initData: null, storeData: null},
        _dataStore: [],
        _ck_store: [],
        _init_ck_store: [],
        _dim_source_store: [],
        _dimItemName: ['dimDepart', 'dimArea', 'dimIndustry', 'dimProduct', 'dimBusiness'],
        _dummyUrl: {
            createdBy: 'json/crm_search/u.action?pageNo=1',
            applicantId: '/json/crm_search/u.action?pageNo=1',
            recentActivityCreatedBy: 'json/crm_search/u.action?pageNo=1',
            participants: 'json/crm_search/u.action?pageNo=1',
            ownerId: 'json/crm_search/u.action?pageNo=1' + (100 == window.SESSION.pcCode ? '&focusmedia=1' : ''),
            updatedBy: '/json/crm_search/u.action?pageNo=1',
            lastOwnerId: '/json/crm_search/u.action?pageNo=1',
            memberId: 'json/crm_search/u.action?pageNo=1',
            signerId: 'json/crm_search/u.action?pageNo=1',
            accountId: '/json/crm_search/accounts.action?pageNo=1',
            contactId: '/json/oa_search/search-contact.action?pageNo=1',
            parentAccountId: '/json/crm_search/accounts.action?pageNo=1',
            lockUser: 'json/crm_search/u.action?pageNo=1',
            product: '/json/crm_search/product.action?pageNo=1',
            products: '/json/crm_search/product.action?pageNo=1',
            campaignId: 'json/oa_search/search-campaign.action?pageNo=1',
            dimDepart: '/json/crm_dimension/dim-tree.action?dimType=1',
            dimArea: '/json/crm_dimension/dim-tree.action?dimType=3',
            dimBusiness: '/json/crm_dimension/dim-tree.action?dimType=5',
            dimIndustry: '/json/crm_dimension/dim-tree.action?dimType=4',
            dimProduct: '/json/crm_dimension/dim-tree.action?dimType=2',
            opportunity: '/json/crm_search/opportunity.action?pageNo=1',
            order: '/json/crm_search/order.action?pageNo=1',
            orderId: '/json/crm_search/order.action?pageNo=1',
            customize: '/json/crm_search/customize.action?pageNo=1&s=fcbk',
            contract: '/json/oa_search/search-contract.action?pageNo=1',
            contractId: '/json/oa_search/search-contract.action?pageNo=1',
            expenseAccountId: '/json/oa_search/search-expenseaccount.action?pageNo=1',
            targetUserId: 'json/crm_search/u.action?pageNo=1',
            approvalTargetId: 'json/crm_search/u.action?pageNo=1',
            'product.parentId': '/json/crm_product/canViewTree.action'
        },
        _belongIdUrl: {
            1: '/json/crm_search/accounts.action?pageNo=1',
            2: '/json/oa_search/search-contact.action?pageNo=1',
            3: '/json/crm_search/opportunity.action?pageNo=1',
            4: '/json/crm_search/product.action?pageNo=1',
            5: '/json/crm_search/u.action?pageNo=1',
            6: '/json/oa_search/search-campaign.action?pageNo=1',
            9: '/json/crm_search/accounts.action?pageNo=1&accountType=2',
            10: '/json/crm_search/accounts.action?pageNo=1&accountType=3',
            11: '/json/oa_search/search-lead.action?pageNo=1',
            15: '/json/oa_search/search-contract.action?pageNo=1',
            35: '/json/crm_search/order.action?pageNo=1',
            50: '/json/crm_dimension/dim-tree.action?dimType=1',
            63: '/json/oa_search/search-expenseaccount.action?pageNo=1',
            111: '/json/crm_search/activityrecord.action?pageNo=1',
            120: '/json/crm_dimension/dim-tree.action?dimType=2',
            121: '/json/crm_dimension/dim-tree.action?dimType=3',
            122: '/json/crm_dimension/dim-tree.action?dimType=4',
            123: '/json/crm_dimension/dim-tree.action?dimType=5',
            999: '/json/crm_search/customize.action?pageNo=1&s=fcbk'
        },
        _create: function () {
            var e = this, t = (e.element, e.options);
            t.filterItem, t.initData;
        },
        _bindEvent: function () {
            var a = this, i = a.element, r = a.options, c = !1, o = r.filterItem;
            r.lastPosition = 0, r.haveBind || (i.find('div.crm-filter-detail-body ul.ui-check-buttonset').on('scroll', function () {
                var s = $(this);
                if (r.checkOption)return r.checkOption = !1, void s.scrollTop(r.lastPosition);
                var d = this.scrollHeight, l = s.scrollTop(), _ = s.height(), m = d - _ - l, p = r.lastPosition;
                if (r.lastPosition = l, m < 50 && !c && p < l) {
                    var u = r.searchData ? r.searchData : {key: ''}, f = r.dataUrl;
                    if (!f)return;
                    var h = n.getStringUrlParam(f, 'pageNo') ? parseInt(n.getStringUrlParam(f, 'pageNo')) : '';
                    if (!h)return;
                    r.dataUrl = f = n.changeUrlParam(f, 'pageNo', ++h), e(i), c = !0, $.postJson(f, u, function (e, r) {
                        var r = [];
                        f.indexOf('tree') != -1 ? r = e.data.tree : f.indexOf('accounts.action') != -1 || f.indexOf('oa_search') != -1 || f.indexOf('product.action') != -1 || f.indexOf('customize.action') != -1 || f.indexOf('order.action') != -1 || f.indexOf('opportunity.action') != -1 ? r = e : e && 0 == e.status && (r = e.data), $.each(r, function (e, t) {
                            f.indexOf('oa_search') != -1 ? f.indexOf('contract') != -1 ? a._init_ck_store[o.id].push({
                                id: t.id,
                                name: t.label
                            }) : a._init_ck_store[o.id].push({
                                id: t.value,
                                name: t.label
                            }) : a._init_ck_store[o.id].push({id: t.id, name: t.name});
                        });
                        var s = '';
                        $.each(r, function (e, t) {
                            s += f.indexOf('oa_search') != -1 ? '<li pinyin=' + n.htmlEscape(t.label) + '><span><input type=\"checkbox\" id=\"checkbox_' + t.value + '\"/><label for=\"checkbox_' + t.value + '\" title=\"' + n.htmlEscape(t.label) + '\">' + n.htmlEscape(t.label) + '</label></span></li>' : '<li pinyin=' + n.htmlEscape(t.name) + '><span><input type=\"checkbox\" id=\"checkbox_' + t.id + '\"/><label for=\"checkbox_' + t.id + '\" title=\"' + n.htmlEscape(t.name) + '\">' + n.htmlEscape(t.name) + '</label></span></li>';
                        }), i.find('.crm-filter-detail-body').find('.ui-check-buttonset:first').append($(s).buttonset()), c = !1, t(i);
                    });
                }
            }), r.haveBind = !0);
        },
        _init: function () {
            var e = this, t = (e.element, e.options), a = t.filterItem;
            t.initData;
            return 26 == a.searchType || a.joinItemId && 1 != a.searchType && 3 != a.searchType ? (e._renderNullComponent(), void(t.storeData ? e._ck_store = t.storeData.value : e._ck_store = [])) : (1 == a.quickSearchFlg ? 1 == a.searchType || 2 == a.searchType || 9 == a.searchType || 11 == a.searchType || 22 == a.searchType || 23 == a.searchType || 24 == a.searchType ? e._renderTextComponent() : 3 == a.searchType || 4 == a.searchType || 99 == a.searchType || 10 == a.searchType ? 'activityRecordFrom' === a.entryPropertyNameOnly || 'relateEntity' == a.entryPropertyNameOnly ? e._renderActiveRecordComponent() : 'product.parentId' === a.entryPropertyName ? e._renderTreeSelectComponent() : e._renderSelectComponent() : 7 == a.searchType ? e._renderDateRangeComponent() : 5 != a.searchType && 6 != a.searchType || e._renderNumberFromToComponent() : e._renderNullComponent(), t.storeData ? e._ck_store = t.storeData.value : e._ck_store = [], void e._bindEvent());
        },
        _renderTextComponent: function () {
            var e = this, t = e.element, a = e.options, i = a.filterItem, r = '<div class=\"filter-thumbnail-list\"><div class=\"filter-thumbnail-formlist\"><label class=\"dblock\">' + n.i18n('CRM_CORE_FILTER_TEXT_SEARCH') + '</label><input type=\"text\" class=\"text\" id=\"smartView_txt\" placeholder=\"' + n.i18n('CRM_CORE_FILTER_ENTER_KEYWORD') + '\"></div></div>';
            if (t.find('div.crm-filter-detail-body').append(r), 0 === i.mustEnterFlg) {
                var c = '<ul class=\"ui-check-buttonset\"><li><span><input type=\"checkbox\" id=\"smartView_cb\"/><label for=\"smartView_cb\">' + n.i18n('CRM_CORE_FILTER_NO_VALUE') + '</label></span></li></ul>';
                t.find('div.crm-filter-detail-body').find('.filter-thumbnail-list').append(c);
            }
            t.find('.ui-check-buttonset').buttonset(), t.find('#smartView_txt').on('keyup', function (a) {
                var i = t.find('#smartView_txt').val();
                '' !== i ? (t.find('#smartView_cb').attr('checked', !1), t.find('#smartView_cb').next().attr('aria-pressed', !1), t.find('#smartView_cb').next().removeClass('ui-state-active'), e._filterDataChange({
                    type: 'in',
                    value: [{data: i, show: i}]
                })) : e._filterDataChange({type: 'eq', value: ''}), 13 === a.keyCode && e._trigger('applyFilter');
            }), t.find('#smartView_cb').bind('click', function () {
                var a = $(this);
                a[0].checked ? (e._filterDataChange({
                    type: 'in',
                    value: [{data: '', show: n.i18n('CRM_CORE_FILTER_NULL')}]
                }), t.find('#smartView_txt').val('')) : (e._filterDataChange({
                    type: 'eq',
                    value: ''
                }), t.find('#smartView_txt').val(''));
            });
        },
        _renderTextComponentData: function () {
            var e = this, t = e.element;
            e.options;
            e._storeData ? '' === e._storeData.value[0].data ? (t.find('#smartView_cb').attr('checked', !0), t.find('#smartView_cb').next().attr('aria-pressed', !0), t.find('#smartView_cb').next().addClass('ui-state-active'), t.find('#smartView_txt').val('')) : t.find('#smartView_txt').val(e._storeData.value[0].data) : (t.find('#smartView_cb').attr('checked', !1), t.find('#smartView_cb').next().attr('aria-pressed', !1), t.find('#smartView_cb').next().removeClass('ui-state-active'), t.find('#smartView_txt').val(''), e._dataStore = []);
        },
        _renderSelectComponent: function (r) {
            var c = this, o = c.element, s = c.options, d = s.filterItem, l = s.initData;
            if ($.inArray(d.entryPropertyNameOnly, ['createdBy', 'participants', 'ownerId', 'lastOwnerId', 'memberId', 'signerId', 'updatedBy', 'accountId', 'parentAccountId', 'opportunity', 'product', 'products', 'campaignId', 'expenseAccountId', 'recentActivityCreatedBy', 'applicantId', 'lockUser']) !== -1 || 10 == d.searchType || $.inArray(d.entryPropertyNameOnly, c._dimItemName) !== -1)var _ = '<div class=\"filter-thumbnail-list filter-thumbnail-searchlist\"><div class=\"crm-filterfield-header crm-filter-detail-serach\"><div class=\"crm-filterfield-search-box overflow-hidden border-radius0\"><input class=\"text border-none lfloat\" type=\"text\" placeholder=\"' + n.i18n('CRM_CORE_FILTER_FIELD_SEARCH') + '\" data=\"search\"><a class=\"search-btn\" href=\"javascript:void(0);\"></a></div></div><ul class=\"ui-check-buttonset\"></ul></div>'; else var _ = '<div class=\"filter-thumbnail-list filter-thumbnail-searchlist\"><div class=\"crm-filterfield-header crm-filter-detail-serach\"><div class=\"crm-filterfield-search-box overflow-hidden border-radius0\"><input class=\"text border-none lfloat localSearch\" type=\"text\" placeholder=\"' + n.i18n('CRM_CORE_FILTER_FIELD_SEARCH') + '\" data=\"search\"><a class=\"search-btn\" href=\"javascript:void(0);\"></a></div></div><ul class=\"ui-check-buttonset\"></ul></div>';
            o.find('.crm-filter-detail-body').append(_);
            var m = '';
            if ('expense.expenseType' == d.entryPropertyName ? m = '/json/crm_expense/expense-type-tree.action' : 'opportunity.saleStageId' == d.entryPropertyName && 0 == l.opportunityTypeNotEnabled ? m = '/json/crm_entitybelongtype/stage-tree.action' : $.inArray(d.entryPropertyNameOnly, c._dimItemName) != -1 ? m = c._dummyUrl[d.entryPropertyNameOnly] + '&belongId=' + d.belongId : c._dummyUrl[d.entryPropertyNameOnly] ? (m = c._dummyUrl[d.entryPropertyNameOnly], 'accountId' != d.entryPropertyNameOnly && 'parentAccountId' != d.entryPropertyNameOnly || (m = c._dummyUrl[d.entryPropertyNameOnly] + '&accountTypes=1', ('1' == SESSION.tenantType && s.orderAccountType || '0' == s.orderAccountType) && (m = c._dummyUrl[d.entryPropertyNameOnly] + '&accountTypes=' + s.orderAccountType))) : 'product.parentId' == d.entryPropertyName ? m = c._dummyUrl['product.parentId'] : d.entryPropertyNameOnly.indexOf('dbcRelation') != -1 || d.belongId > 999 && 10 == d.searchType ? (m = c._belongIdUrl[d.relationBelongId], d.relationBelongId > 999 && (m = c._belongIdUrl[999] + '&belongId=' + d.relationBelongId)) : 'industryId' == d.entryPropertyNameOnly ? c._init_ck_store[d.id] = d.options : c._init_ck_store[d.id] = d.values, void 0 !== c._init_ck_store[d.id] && 0 !== c._init_ck_store[d.id].length || '' === m)c._renderItems(m); else {
                c._init_ck_store[d.id] = [], c._dim_source_store[d.id] = [], o.css('min-height', '300px');
                var p = {key: '', searchItem: d.entryPropertyNameOnly, searchItemId: d.id};
                e(o), s.dataUrl = m = i(m, d.belongId, d.entryPropertyNameOnly), s.searchData = p = a(m, p, d.belongId), $.postJson(m, p, function (e, a) {
                    t(o);
                    var i = [];
                    m.indexOf('tree') != -1 ? i = e.data.tree : m.indexOf('accounts.action') != -1 || m.indexOf('oa_search') != -1 || m.indexOf('product.action') != -1 || m.indexOf('customize.action') != -1 || m.indexOf('order.action') != -1 || m.indexOf('opportunity.action') != -1 ? i = e : m.indexOf('crm_product') != -1 ? (e.data.tree.forEach(function (e) {
                        e.name = e.text;
                    }), i = e.data.tree) : e && 0 == e.status && (i = e.data);
                    var n = [];
                    m.indexOf('stage-tree') == -1 && m.indexOf('expense-type-tree') == -1 || $.each(i, function (e, t) {
                        '#' == t.parent && (n[t.id] = t.name);
                    }), $.each(i, function (e, t) {
                        if (m.indexOf('oa_search') != -1)m.indexOf('contract') != -1 ? c._init_ck_store[d.id].push({
                            id: t.id,
                            name: t.label
                        }) : c._init_ck_store[d.id].push({
                            id: t.value,
                            name: t.label
                        }); else if ($.inArray(d.entryPropertyNameOnly, c._dimItemName) !== -1)c._dim_source_store[d.id].push({
                            id: t.id,
                            name: t.name,
                            pinyin: t.pinyin
                        }), c._init_ck_store[d.id].length < 50 && c._init_ck_store[d.id].push({
                            id: t.id,
                            name: t.name
                        }); else {
                            m.indexOf('stage-tree') != -1 || m.indexOf('expense-type-tree') != -1 ? '#' != t.parent && c._init_ck_store[d.id].push({
                                id: t.id,
                                name: n[t.parent] + '-' + t.name
                            }) : c._init_ck_store[d.id].push({id: t.id, name: t.name});
                        }
                    }), c._renderItems(m);
                });
            }
        },
        _renderItems: function (r) {
            function c(e, t, a) {
                d.checkOption = !0, e[0].checked ? (o._ck_store.push({
                    data: t,
                    show: a
                }), o._filterDataChange({
                    type: 'eq',
                    value: o._ck_store
                })) : (o._ck_store = o._removeArrayItem(o._ck_store, t), o._ck_store.length > 0 ? o._filterDataChange({
                    type: 'eq',
                    value: o._ck_store
                }) : o._filterDataChange({type: 'eq', value: ''}));
            }

            var o = this, s = o.element, d = o.options, l = d.filterItem;
            d.initData;
            o.dataUrl = r, s.find('.crm-filter-detail-body').find('.ui-check-buttonset:first').empty();
            var _ = [];
            if ($.inArray(l.entryPropertyNameOnly, ['createdBy', 'participants', 'ownerId', 'lastOwnerId', 'memberId', 'signerId', 'updatedBy', 'accountId', 'parentAccountId', 'opportunity', 'product', 'products', 'campaignId', 'expenseAccountId', 'recentActivityCreatedBy', 'applicantId', 'lockUser']) === -1 && 10 != l.searchType && $.inArray(l.entryPropertyNameOnly, o._dimItemName) === -1 || o._storeData && (o._storeData.value.length > 1 || '' !== o._storeData.value[0].data) && $.each(o._storeData.value, function (e, t) {
                    s.find('.crm-filter-detail-body').find('.ui-check-buttonset:first').append('<li pinyin=\"' + n.htmlEscape(t.show) + '\"><span><input type=\"checkbox\" id=\"checkbox_' + t.data + '\"/><label for=\"checkbox_' + t.data + '\" title=\"' + n.htmlEscape(t.show) + '\">' + n.htmlEscape(t.show) + '</label></span></li>'), _.push(parseInt(t.data));
                }), o._init_ck_store[l.id] && $.each(o._init_ck_store[l.id], function (e, t) {
                    $.inArray(parseInt(t.id), _) === -1 && s.find('.crm-filter-detail-body').find('.ui-check-buttonset:first').append('<li pinyin=\"' + n.htmlEscape(t.name) + '\"><span><input type=\"checkbox\" id=\"checkbox_' + t.id + '\"/><label for=\"checkbox_' + t.id + '\" title=\"' + n.htmlEscape(t.name) + '\">' + n.htmlEscape(t.name) + '</label></span></li>');
                }), 0 === l.mustEnterFlg) {
                var m = '<ul class=\"ui-check-buttonset\"><li><span><input type=\"checkbox\" id=\"smartView_cb\"/><label for=\"smartView_cb\">' + n.i18n('CRM_CORE_FILTER_NO_VALUE') + '</label></span></li></ul>';
                s.find('div.crm-filter-detail-body').find('.filter-thumbnail-list').append(m);
            }
            s.find('.ui-check-buttonset').buttonset(), s.find('.ui-check-buttonset:first').delegate('[type=\"checkbox\"]', 'click', function (e) {
                e.stopPropagation();
                var t = $(this), a = t.attr('id').slice(9), i = t.next().find('span').html();
                a = parseInt(a), c(t, a, i);
            }), s.find('#smartView_cb').bind('click', function () {
                var e = $(this);
                c(e, '', n.i18n('CRM_CORE_FILTER_NULL'));
            });
            var p = null;
            s.delegate('[data=\"search\"]', 'keyup', function () {
                var n = s.find('[data=\"search\"]').val(), c = {key: n}, _ = s.find('[data=\"search\"]').hasClass('localSearch');
                try {
                    clearTimeout(p);
                } catch (e) {
                }
                _ ? s.find('.ui-check-buttonset:first li').each(function (e, t) {
                    var a = $(t), i = a.attr('pinyin');
                    i && i.indexOf(n) >= 0 ? a.show() : a.hide();
                }) : p = setTimeout(function () {
                    $.inArray(l.entryPropertyNameOnly, o._dimItemName) !== -1 ? (s.find('.crm-filter-detail-body').find('.ui-check-buttonset:first').empty(), o._init_ck_store[l.id] = [], $.each(o._dim_source_store[l.id], function (e, t) {
                        (t.name.indexOf(n) != -1 || t.pinyin.indexOf(n.toLocaleLowerCase()) != -1) && o._init_ck_store[l.id].length < 50 && o._init_ck_store[l.id].push({
                            id: t.id,
                            name: t.name
                        });
                    }), o._handleData()) : (c.searchItem = l.entryPropertyNameOnly, c.searchItemId = l.id, d.searchData = c = a(r, c, l.belongId), d.dataUrl = r = i(r, l.belongId, l.entryPropertyNameOnly), d.lastPosition = 0, e(s), $.postJson(r, c, function (e, a) {
                        t(s);
                        var i = [];
                        r.indexOf('tree') != -1 ? i = e.data.tree : r.indexOf('accounts.action') != -1 || r.indexOf('oa_search') != -1 || r.indexOf('product.action') != -1 || r.indexOf('customize.action') != -1 || r.indexOf('order.action') != -1 || r.indexOf('opportunity.action') != -1 ? i = e : e && 0 == e.status && (i = e.data), s.find('.crm-filter-detail-body').find('.ui-check-buttonset:first').empty(), o._init_ck_store[l.id] = [], $.each(i, function (e, t) {
                            r.indexOf('oa_search') != -1 ? r.indexOf('contract') != -1 ? o._init_ck_store[l.id].push({
                                id: t.id,
                                name: t.label
                            }) : o._init_ck_store[l.id].push({
                                id: t.value,
                                name: t.label
                            }) : o._init_ck_store[l.id].push({id: t.id, name: t.name});
                        }), o._handleData();
                    }));
                }, 500);
            });
        },
        _handleData: function () {
            var e = this, t = e.element, a = e.options, i = a.filterItem, r = (a.initData, []);
            $.inArray(i.entryPropertyNameOnly, ['createdBy', 'participants', 'ownerId', 'lastOwnerId', 'memberId', 'signerId', 'updatedBy', 'accountId', 'parentAccountId', 'opportunity', 'product', 'products', 'campaignId', 'expenseAccountId', 'recentActivityCreatedBy', 'applicantId']) === -1 && 10 != i.searchType && $.inArray(i.entryPropertyNameOnly, e._dimItemName) === -1 || e._storeData && (e._storeData.value.length > 1 || '' !== e._storeData.value[0].data) && $.each(e._storeData.value, function (e, a) {
                $.isNumeric(a.data) && (t.find('.crm-filter-detail-body').find('.ui-check-buttonset:first').append('<li pinyin=' + n.htmlEscape(a.show) + '><span><input type=\"checkbox\" id=\"checkbox_' + a.data + '\"/><label for=\"checkbox_' + a.data + '\" title=\"' + n.htmlEscape(a.show) + '\">' + n.htmlEscape(a.show) + '</label></span></li>'), r.push(parseInt(a.data)));
            }), e._init_ck_store[i.id] && $.each(e._init_ck_store[i.id], function (e, a) {
                $.inArray(parseInt(a.id), r) === -1 && t.find('.crm-filter-detail-body').find('.ui-check-buttonset:first').append('<li pinyin=' + n.htmlEscape(a.name) + '><span><input type=\"checkbox\" id=\"checkbox_' + a.id + '\"/><label for=\"checkbox_' + a.id + '\" title=\"' + n.htmlEscape(a.name) + '\">' + n.htmlEscape(a.name) + '</label></span></li>');
            }), t.find('.ui-check-buttonset').buttonset(), $.each(e._ck_store, function (e, a) {
                var i = 'checkbox_' + a.data;
                t.find('[id=' + i + ']').attr('checked', !0), t.find('[id=' + i + ']').next().attr('aria-pressed', !0), t.find('[id=' + i + ']').next().addClass('ui-state-active');
            });
        },
        _removeArrayItem: function (e, t) {
            for (var a = 0; a < e.length; a++) {
                var i = e[a];
                '' === t && i.data === t ? e.splice(a, 1) : parseInt(i.data) === t && e.splice(a, 1);
            }
            return e;
        },
        _renderSelectComponentData: function () {
            var e = this, t = e.element;
            if (e._storeData)if (1 === e._storeData.value.length && '' === e._storeData.value[0].data)e._ck_store = e._storeData.value, t.find('#smartView_cb').attr('checked', !0), t.find('#smartView_cb').next().attr('aria-pressed', !0), t.find('#smartView_cb').next().addClass('ui-state-active'); else {
                e._ck_store = e._storeData.value;
                var a = !0;
                $.each(e._ck_store, function (i, n) {
                    var r = 'checkbox_' + n.data;
                    t.find('[id=' + r + ']').size() > 0 ? (t.find('[id=' + r + ']').attr('checked', !0), t.find('[id=' + r + ']').next().attr('aria-pressed', !0), t.find('[id=' + r + ']').next().addClass('ui-state-active')) : a = !1, !a && e.dataUrl && t.find('[data=\"search\"]').trigger('keyup');
                });
            } else e._dataStore = [], t.find('#smartView_cb').attr('checked', !1), t.find('#smartView_cb').next().attr('aria-pressed', !1), t.find('#smartView_cb').next().removeClass('ui-state-active'), t.find('[data=\"search\"]').val(''), t.find('[data=\"search\"]').trigger('keyup'), t.find('.ui-check-buttonset:first').find('[type=\"checkbox\"]').each(function () {
                var e = $(this);
                e.attr('checked', !1), e.next().attr('aria-pressed', !1), e.next().removeClass('ui-state-active');
            });
        },
        _renderDateRangeComponent: function () {
            var e = this, t = e.element, a = e.options, i = a.filterItem, r = require('./tmpl/dateRange.tpl'), c = n.templateText(r);
            t.find('.crm-filter-detail-body').append(c);
            var o = function (e) {
                var t = e.siblings('.dinline-block');
                t = t.find('span'), t.html() || window.setTimeout(function () {
                    e.find('.ui-state-active').removeClass('ui-state-active');
                }, 10);
            };
            if (t.find('#start_date').datepicker({
                    changeYear: !1,
                    changeMonth: !1,
                    onChangeMonthYear: function (e, t, a) {
                        var i = $(a.input);
                        o(i);
                    },
                    onSelect: function (a) {
                        t.find('#smartView_cb').attr('checked', !1), t.find('#smartView_cb').next().attr('aria-pressed', !1), t.find('#smartView_cb').next().removeClass('ui-state-active'), t.find('#start_date').prev().text(''), t.find('#end_date').prev().text('');
                        var i = moment(a).format('YYYY-MM-DD');
                        t.find('#start_date').prev().prev().find('span').text(i);
                        var r = t.find('#end_date').prev().prev().find('span').text();
                        return '' != r && moment(i).isAfter(moment(r)) ? (t.find('#start_date').prev().text(n.i18n('CRM_CORE_FILTER_UNVALID_DATE_2')), !1) : void e._filterDataChange({
                            type: 'fromTo',
                            value: [{data: i, show: i}, {data: r, show: r}]
                        });
                    }
                }), t.find('#end_date').datepicker({
                    changeYear: !1,
                    changeMonth: !1,
                    onChangeMonthYear: function (e, t, a) {
                        var i = $(a.input);
                        o(i);
                    },
                    onSelect: function (a) {
                        t.find('#smartView_cb').attr('checked', !1), t.find('#smartView_cb').next().attr('aria-pressed', !1), t.find('#smartView_cb').next().removeClass('ui-state-active'), t.find('#end_date').prev().text(''), t.find('#start_date').prev().text('');
                        var i = moment(a).format('YYYY-MM-DD');
                        t.find('#end_date').prev().prev().find('span').text(i);
                        var r = t.find('#start_date').prev().prev().find('span').text();
                        return '' != r && moment(r).isAfter(moment(i)) ? (t.find('#end_date').prev().text(n.i18n('CRM_CORE_FILTER_UNVALID_DATE_1')), !1) : void e._filterDataChange({
                            type: 'fromTo',
                            value: [{data: r, show: r}, {data: i, show: i}]
                        });
                    }
                }), 0 === i.mustEnterFlg) {
                var s = '<ul class=\"ui-check-buttonset filter-date-check\"><li><span><input type=\"checkbox\" id=\"smartView_cb\"/><label for=\"smartView_cb\">' + n.i18n('CRM_CORE_FILTER_NO_VALUE') + '</label></span></li></ul>';
                t.find('div.crm-filter-detail-body').find('.filter-thumbnail-list').append(s);
            }
            t.find('.ui-check-buttonset').buttonset(), t.find('#smartView_cb').bind('click', function () {
                var a = $(this);
                a[0].checked ? (e._filterDataChange({
                    type: 'fromTo',
                    value: [{data: '', show: n.i18n('CRM_CORE_FILTER_NULL')}]
                }), t.find('#start_date').prev().prev().find('span').text(''), t.find('#end_date').prev().prev().find('span').text(''), t.find('#start_date').prev().text(''), t.find('#end_date').prev().text('')) : e._filterDataChange({
                    type: 'eq',
                    value: ''
                });
            });
        },
        _renderDateRangeComponentData: function () {
            var e = this, t = e.element;
            t.find('#start_date').prev().text(''), t.find('#end_date').prev().text(''), e._storeData ? 1 === e._storeData.value.length && '' === e._storeData.value[0].data ? (t.find('#smartView_cb').attr('checked', !0), t.find('#smartView_cb').next().attr('aria-pressed', !0), t.find('#smartView_cb').next().addClass('ui-state-active')) : ($('#start_date').datepicker('setDate', e._storeData.value[0].show), $('#end_date').datepicker('setDate', e._storeData.value[1].show), t.find('#start_date').prev().prev().find('span').text(e._storeData.value[0].show), t.find('#end_date').prev().prev().find('span').text(e._storeData.value[1].show)) : (e._dataStore = [], t.find('#smartView_cb').attr('checked', !1), t.find('#smartView_cb').next().attr('aria-pressed', !1), t.find('#smartView_cb').next().removeClass('ui-state-active'), t.find('#start_date').prev().prev().find('span').text(''), t.find('#end_date').prev().prev().find('span').text(''), $('#start_date').datepicker('setDate', null), $('#end_date').datepicker('setDate', null));
        },
        _renderNumberFromToComponent: function () {
            var e = this, t = e.element, a = e.options, i = a.filterItem, r = '<div class=\"filter-thumbnail-list\"><div class=\"filter-thumbnail-formlist\"><label class=\"dblock\">' + n.i18n('CRM_CORE_FILTER_FROM') + '</label><input type=\"text\" class=\"text\" id=\"smartView_from\"><label class=\"dblock\">' + n.i18n('CRM_CORE_FILTER_NUMBER_TO') + '</label><input type=\"text\" class=\"text\" id=\"smartView_to\"></div></div>';
            if (t.find('.crm-filter-detail-body').append(r), 0 === i.mustEnterFlg) {
                var c = '<ul class=\"ui-check-buttonset\"><li><span><input type=\"checkbox\" id=\"smartView_cb\"/><label for=\"smartView_cb\">' + n.i18n('CRM_CORE_FILTER_NO_VALUE') + '</label></span></li></ul>';
                t.find('div.crm-filter-detail-body').find('.filter-thumbnail-list').append(c);
            }
            t.find('.ui-check-buttonset').buttonset(), t.find('#smartView_from').on('keyup', function (a) {
                var i = t.find('#smartView_from').val();
                '' === i && t.find('#smartView_from').removeClass('error');
                var r = /^(-?\d+)(\.\d+)?$/;
                if (r.test(i) && '' != i && (i = e._formatNumber(i), t.find('#smartView_from').val(i)), !r.test(i) && '' !== i)return t.find('#smartView_from').addClass('error'), 13 === a.keyCode && n.noticeError(n.i18n('CRM_CORE_FILTER_INVALID_INPUT')), !1;
                t.find('#smartView_from').removeClass('error'), t.find('#smartView_cb').attr('checked', !1), t.find('#smartView_cb').next().attr('aria-pressed', !1), t.find('#smartView_cb').next().removeClass('ui-state-active');
                var c = t.find('#smartView_to').val();
                return r.test(c) && '' != c && (c = e._formatNumber(c), t.find('#smartView_to').val(c)), '' === c || r.test(c) ? ('' === i && '' === c ? e._filterDataChange({
                    type: 'eq',
                    value: ''
                }) : e._filterDataChange({
                    type: 'fromTo',
                    value: [{data: i, show: i}, {data: c, show: c}]
                }), void(13 === a.keyCode && e._trigger('applyFilter'))) : (13 === a.keyCode && n.noticeError(n.i18n('CRM_CORE_FILTER_INVALID_INPUT')), !1);
            }), t.find('#smartView_to').on('keyup', function (a) {
                var i = t.find('#smartView_to').val();
                t.find('#smartView_cb').attr('checked', !1), t.find('#smartView_cb').next().attr('aria-pressed', !1), t.find('#smartView_cb').next().removeClass('ui-state-active'), '' === i && t.find('#smartView_to').removeClass('error');
                var r = /^(-?\d+)(\.\d+)?$/;
                if (r.test(i) && '' != i && (i = e._formatNumber(i), t.find('#smartView_to').val(i)), !r.test(i) && '' !== i)return t.find('#smartView_to').addClass('error'), 13 === a.keyCode && n.noticeError(n.i18n('CRM_CORE_FILTER_INVALID_INPUT')), !1;
                t.find('#smartView_to').removeClass('error');
                var c = t.find('#smartView_from').val();
                return r.test(c) && '' != c && (c = e._formatNumber(c), t.find('#smartView_from').val(c)), '' === c || r.test(c) ? ('' === c && '' === i ? e._filterDataChange({
                    type: 'eq',
                    value: ''
                }) : e._filterDataChange({
                    type: 'fromTo',
                    value: [{data: c, show: c}, {data: i, show: i}]
                }), void(13 === a.keyCode && e._trigger('applyFilter'))) : (13 === a.keyCode && n.noticeError(n.i18n('CRM_CORE_FILTER_INVALID_INPUT')), !1);
            }), t.find('#smartView_cb').bind('click', function (a) {
                a.stopPropagation();
                var i = $(this);
                i[0].checked ? (e._filterDataChange({
                    type: 'fromTo',
                    value: [{data: '', show: n.i18n('CRM_CORE_FILTER_NULL')}]
                }), t.find('#smartView_from').val(''), t.find('#smartView_to').val('')) : (e._filterDataChange({
                    type: 'eq',
                    value: ''
                }), t.find('#smartView_from').val(''), t.find('#smartView_to').val(''));
            });
        },
        _renderNumberFromToComponentData: function () {
            var e = this, t = e.element;
            t.find('#smartView_to').removeClass('error'), t.find('#smartView_from').removeClass('error'), e._storeData ? 1 === e._storeData.value.length && '' === e._storeData.value[0].data ? (t.find('#smartView_cb').attr('checked', !0), t.find('#smartView_cb').next().attr('aria-pressed', !0), t.find('#smartView_cb').next().addClass('ui-state-active'), t.find('#smartView_from').val(''), t.find('#smartView_to').val('')) : (t.find('#smartView_from').val(e._storeData.value[0].data), t.find('#smartView_to').val(e._storeData.value[1].data)) : (e._dataStore = [], t.find('#smartView_cb').attr('checked', !1), t.find('#smartView_cb').next().attr('aria-pressed', !1), t.find('#smartView_cb').next().removeClass('ui-state-active'), t.find('#smartView_from').val(''), t.find('#smartView_to').val(''));
        },
        _formatNumber: function (e) {
            if (e.indexOf('.') != -1) {
                var t = e.indexOf('.'), a = e.slice(0, t), i = e.slice(t + 1);
                return '-' == a.slice(0, 1) ? a.slice(0, 19) + '.' + i.slice(0, 5) : a.slice(0, 18) + '.' + i.slice(0, 5);
            }
            return '-' == e.slice(0, 1) ? e.slice(0, 19) : e.slice(0, 18);
        },
        _renderActiveRecordComponent: function () {
            var e = this, t = e.element, a = e.options, i = a.filterItem, r = (a.initData, {
                510: {
                    url: '/json/oa_search/search-account.action',
                    name: SESSION.keywords.account
                },
                511: {url: '/json/oa_search/search-opp.action', name: SESSION.keywords.opportunity},
                515: {url: '/json/oa_search/search-account.action', name: SESSION.keywords.partner},
                516: {url: '/json/oa_search/search-campaign.action', name: SESSION.keywords.campaign},
                518: {url: '/json/oa_search/search-contact.action', name: SESSION.keywords.contact},
                522: {url: '/json/oa_search/search-lead.action', name: SESSION.keywords.lead}
            });
            e.relUrl = r;
            var c = '<div class=\"crm-filterfield-header filter-thumbnail-formlist\"><label class=\"dblock\">' + n.i18n('CRM_CORE_FILTER_ENTITYTYPE') + '</label><div class=\"entitytypeSelect ui-select-buttonset\"><select name=\"\" id=\"\"></select></div></div>', o = '<div class=\"filter-thumbnail-list filter-thumbnail-searchlist\">' + c + '<div class=\"crm-filterfield-header crm-filter-detail-serach\"><div class=\"crm-filterfield-search-box overflow-hidden border-radius0\"><input class=\"text border-none lfloat\" type=\"text\" placeholder=\"' + n.i18n('CRM_CORE_FILTER_FIELD_SEARCH') + '\" data=\"search\"><a class=\"search-btn\" href=\"javascript:void(0);\"></a></div></div><ul class=\"ui-check-buttonset\"></ul></div>';
            t.find('.crm-filter-detail-body').append(o);
            var s = t.find('.crm-filter-detail-body').find('.entitytypeSelect select');
            $.each(i.values, function (e, t) {
                s.append('<option value=\"' + t.id + '\">' + n.htmlEscape(t.name) + '</option>');
            });
            var s = t.find('.crm-filter-detail-body').find('.entitytypeSelect select');
            if (s.selectmenu({
                    change: function (a, n) {
                        e.dataUrl = r[n.item.value] ? r[n.item.value].url : '/json/crm_search/customize.action', e.entityBelongId = n.item.value, t.find('[data=\"search\"]').val(''), e._dataStore = [], e._ck_store = [], e._searchEntityItems(''), $('.ui-selectmenu-button').removeClass('ui-state-focus'), e._filterDataChange({
                            type: 'eq',
                            value: e._ck_store,
                            s_value: {belongId: e.entityBelongId, objectId: '', objectName: ''},
                            belongId: e.entityBelongId,
                            belongName: i.values[e.entityBelongId].name
                        });
                    }
                }), $('.ui-selectmenu-menu').addClass('crm-filter-selectmenu').css('z-index', 999999), 0 === i.mustEnterFlg || '' == i.mustEnterFlg) {
                var d = '<ul class=\"ui-check-buttonset\"><li><span><input type=\"checkbox\" id=\"smartView_cb\"/><label for=\"smartView_cb\">' + n.i18n('CRM_CORE_FILTER_NO_VALUE') + '</label></span></li></ul>';
                t.find('div.crm-filter-detail-body').find('.filter-thumbnail-list').append(d);
            }
            e.dataUrl = '/json/oa_search/search-account.action', e.entityBelongId = 510, t.css('min-height', '300px'), e._searchEntityItems('');
            var l = null;
            t.delegate('[data=\"search\"]', 'keyup', function () {
                var a = t.find('[data=\"search\"]').val();
                try {
                    clearTimeout(l);
                } catch (e) {
                }
                l = setTimeout(function () {
                    e._searchEntityItems(a);
                }, 500);
            }), t.find('.ui-check-buttonset:first').delegate('[type=\"checkbox\"]', 'click', function (a) {
                a.stopPropagation(), t.find('#smartView_cb').attr('checked') && (e._ck_store = []), t.find('#smartView_cb').attr('checked', !1), t.find('#smartView_cb').next().attr('aria-pressed', !1), t.find('#smartView_cb').next().removeClass('ui-state-active');
                var n = $(this), r = n.attr('id').slice(9), c = n.next().find('span').text();
                r = parseInt(r);
                var o = '', s = '';
                n[0].checked ? (e._ck_store.push({data: r, show: c}), $.each(e._ck_store, function (e, t) {
                    o += t.data + ',', s += t.show + ',';
                }), e._filterDataChange({
                    type: 'eq',
                    value: e._ck_store,
                    s_value: {belongId: e.entityBelongId, objectId: o.slice(0, -1), objectName: s.slice(0, -1)},
                    belongId: e.entityBelongId,
                    belongName: i.values[e.entityBelongId].name
                })) : (e._ck_store = e._removeArrayItem(e._ck_store, r), e._ck_store.length > 0 ? ($.each(e._ck_store, function (e, t) {
                    o += t.data + ',', s += t.show + ',';
                }), e._filterDataChange({
                    type: 'eq',
                    value: e._ck_store,
                    s_value: {belongId: e.entityBelongId, objectId: o.slice(0, -1), objectName: s.slice(0, -1)},
                    belongId: e.entityBelongId,
                    belongName: i.values[e.entityBelongId].name
                })) : e._filterDataChange({type: 'eq', value: ''}));
            }), t.find('#smartView_cb').bind('click', function () {
                var a = $(this);
                a[0].checked ? (e._filterDataChange({
                    type: 'eq',
                    value: [{data: '', show: n.i18n('CRM_CORE_FILTER_NULL')}],
                    s_value: {belongId: e.entityBelongId, objectId: '', objectName: ''},
                    belongId: e.entityBelongId,
                    belongName: i.values[e.entityBelongId].name
                }), t.find('.ui-check-buttonset:first').find('[type=\"checkbox\"]').each(function () {
                    $(this).attr('checked', !1), $(this).next().attr('aria-pressed', !1), $(this).next().removeClass('ui-state-active');
                }), e._ck_store = []) : e._filterDataChange({type: 'eq', value: ''});
            });
        },
        _renderTreeSelectComponent: function () {
            var e = this, t = e.element, a = e.options, i = a.filterItem, n = '<div class=\"filter-thumbnail-list filter-thumbnail-searchlist\"><div class=\"crm-filterfield-header crm-filter-detail-serach\"></div><div class=\"menutree\"></div></div>';
            t.find('div.crm-filter-detail-body').append(n), e._renderTree(), t.delegate('.ui-check-buttonset:first [type=\"checkbox\"]', 'click', function (t) {
                t.stopPropagation();
                var a = $(this), i = a.attr('id').slice(9), n = a.next().find('span').html();
                i = parseInt(i), a[0].checked ? (e._ck_store.push({data: i, show: n}), e._filterDataChange({
                    type: 'eq',
                    value: e._ck_store
                })) : (e._ck_store = e._removeArrayItem(e._ck_store, i), e._ck_store.length > 0 ? e._filterDataChange({
                    type: 'eq',
                    value: e._ck_store
                }) : e._filterDataChange({type: 'eq', value: ''}));
            });
            var r = null;
            t.delegate('[data=\"search\"]', 'keyup', function () {
                var a = t.find('[data=\"search\"]').val();
                if ('' === a)t.find('.crm-filter-detail-body').find('.ui-check-buttonset:first').replaceWith('<div class=\"menutree\"></div>'), e._renderTree(); else {
                    var n = {productName: a};
                    try {
                        clearTimeout(r);
                    } catch (e) {
                    }
                    r = setTimeout(function () {
                        $.postJson('/json/crm_product/search-directory.action', n, function (a, n) {
                            if ('' !== t.find('[data=\"search\"]').val()) {
                                t.find('.crm-filter-detail-body').find('div.menutree').replaceWith('<ul class=\"ui-check-buttonset\"></ul>');
                                var r = a;
                                t.find('.crm-filter-detail-body').find('.ui-check-buttonset:first').empty(), e._init_ck_store[i.id] = [], $.each(r, function (t, a) {
                                    e._init_ck_store[i.id].push({id: a.id, name: a.text});
                                }), e._handleData();
                            }
                        });
                    }, 500);
                }
            });
        },
        _searchEntityItems: function (e) {
            var t = this, a = (t.element, t.options), i = a.filterItem;
            a.initData;
            t._init_ck_store[i.id] = [];
            var n = {};
            510 != t.entityBelongId && 511 != t.entityBelongId && 515 != t.entityBelongId && 516 != t.entityBelongId && 518 != t.entityBelongId && 522 != t.entityBelongId ? (n.belongId = t.entityBelongId, n.s = 'fcbk', n.key = e) : (n.pageNo = 1, n.key = e), 510 == t.entityBelongId && (n.accountTypes = 1), 515 == t.entityBelongId && (n.accountTypes = 2), $.postJson(t.dataUrl, n).done(function (e, a) {
                var n = e;
                $.each(n, function (e, a) {
                    510 != t.entityBelongId && 511 != t.entityBelongId && 515 != t.entityBelongId && 516 != t.entityBelongId && 518 != t.entityBelongId && 522 != t.entityBelongId ? t._init_ck_store[i.id].push({
                        id: a.id,
                        name: a.name
                    }) : t._init_ck_store[i.id].push({id: a.value, name: a.label});
                }), t._renderEntityItems();
            });
        },
        _renderTree: function () {
            var e = this, t = e.element, a = e.options;
            a.filterItem;
            t.find('div.menutree').hasClass('jstree') || t.find('div.menutree').jstree({
                core: {
                    check_callback: !1,
                    themes: {
                        name: 'default',
                        url: !0,
                        dir: seajs.data.base + 'lib/jstree/3.0.9/themes',
                        icons: !1,
                        dots: !1,
                        stripes: !1,
                        variant: !1,
                        responsive: !1
                    },
                    force_text: !0,
                    data: {
                        url: function (e) {
                            var t = '#' == e.id ? -1 : e.id;
                            return '/json/crm_product/search-directory.action?pid=' + t;
                        }, data: function (e) {
                            return {id: e.id};
                        }
                    }
                }, plugins: ['checkbox'], checkbox: {visible: !0, tie_selection: !1, three_state: !1}
            });
        },
        _renderTreeSelectComponentData: function () {
            var e = this, t = e.element;
            if (e._storeData) {
                e._ck_store = e._storeData.value;
                var a = [];
                $.each(e._storeData.value, function (e, t) {
                    var i = t.data ? t.data : -100;
                    a.push(i);
                }), t.find('div.menutree').hasClass('jstree') && (t.find('div.menutree').jstree('uncheck_all'), t.find('div.menutree').jstree('check_node', a));
            } else e._dataStore = [], e._ck_store = [], t.find('div.menutree').hasClass('jstree') && t.find('div.menutree').jstree('uncheck_all');
        },
        _renderEntityItems: function () {
            var e = this, t = e.element, a = e.options, i = a.filterItem;
            a.initData;
            t.find('.crm-filter-detail-body').find('.ui-check-buttonset:first').empty();
            var r = [];
            $.inArray(i.entryPropertyNameOnly, ['createdBy', 'participants', 'ownerId', 'lastOwnerId', 'memberId', 'signerId', 'updatedBy', 'accountId', 'parentAccountId', 'opportunity', 'product', 'products', 'campaignId', 'expenseAccountId', 'recentActivityCreatedBy', 'applicantId', 'dimDepart']) === -1 && 10 != i.searchType || e._storeData && (e._storeData.value.length > 1 || '' !== e._storeData.value[0].data) && $.each(e._storeData.value, function (e, a) {
                t.find('.crm-filter-detail-body').find('.ui-check-buttonset:first').append('<li><span><input type=\"checkbox\" id=\"checkbox_' + a.data + '\"/><label for=\"checkbox_' + a.data + '\" title=\"' + n.htmlEscape(a.show) + '\">' + n.htmlEscape(a.show) + '</label></span></li>'), r.push(parseInt(a.data));
            }), e._init_ck_store[i.id] && $.each(e._init_ck_store[i.id], function (e, a) {
                $.inArray(parseInt(a.id), r) === -1 && t.find('.crm-filter-detail-body').find('.ui-check-buttonset:first').append('<li><span><input type=\"checkbox\" id=\"checkbox_' + a.id + '\"/><label for=\"checkbox_' + a.id + '\" title=\"' + n.htmlEscape(a.name) + '\">' + n.htmlEscape(a.name) + '</label></span></li>');
            }), t.find('.ui-check-buttonset').buttonset();
        },
        _renderActiveRecordComponentData: function () {
            var e = this, t = e.element, a = e.options, i = a.filterItem, n = t.find('.crm-filter-detail-body').find('.entitytypeSelect select');
            if (e._storeData)n.val(e._storeData.value.belongId), n.selectmenu('refresh'), 1 === e._storeData.b_value.length && '' === e._storeData.b_value[0].data ? (t.find('#smartView_cb').attr('checked', !0), t.find('#smartView_cb').next().attr('aria-pressed', !0), t.find('#smartView_cb').next().addClass('ui-state-active')) : (e._ck_store = e._storeData.b_value, $.each(e._ck_store, function (e, a) {
                var i = 'checkbox_' + a.data;
                t.find('[id=' + i + ']').attr('checked', !0), t.find('[id=' + i + ']').next().attr('aria-pressed', !0), t.find('[id=' + i + ']').next().addClass('ui-state-active');
            })); else {
                e._dataStore = [], e._ck_store = [], t.find('#smartView_cb').attr('checked', !1), t.find('#smartView_cb').next().attr('aria-pressed', !1), t.find('#smartView_cb').next().removeClass('ui-state-active'), t.find('[data=\"search\"]').val('');
                var r = 0;
                $.each(i.values, function (e, t) {
                    0 == r && (r = e);
                }), e.entityBelongId != r && (n.val(r), n.selectmenu('refresh'), e.dataUrl = e.relUrl[r] ? e.relUrl[r].url : '/json/crm_search/customize.action', e.entityBelongId = r, e._searchEntityItems('')), t.find('.ui-check-buttonset:first').find('[type=\"checkbox\"]').each(function () {
                    var e = $(this);
                    e.attr('checked', !1), e.next().attr('aria-pressed', !1), e.next().removeClass('ui-state-active');
                }), e._filterDataChange({
                    type: 'eq',
                    value: e._ck_store,
                    s_value: {belongId: e.entityBelongId, objectId: '', objectName: ''},
                    belongId: e.entityBelongId,
                    belongName: i.values[e.entityBelongId].name
                });
            }
        },
        _renderNullComponent: function () {
            var e = this, t = e.element, a = (e.options, '<div class=\"filter-thumbnail-formlist\"><span class=\"no-filter dinline-block\">' + n.i18n('CRM_CORE_FILTER_DISABLE') + '</span></div>');
            t.find('.crm-filter-detail-body').append(a);
        },
        destroy: function () {
            var e = this, t = e.elements;
            t.remove(), e._ck_store = [], e._init_ck_store = [];
        },
        setData: function (e) {
            var t = this, a = (t.element, t.options), i = a.filterItem;
            a.initData;
            t._storeData = e, 1 === i.quickSearchFlg && (1 == i.searchType || 2 == i.searchType || 9 == i.searchType || 11 == i.searchType || 22 == i.searchType || 23 == i.searchType || 24 == i.searchType ? t._renderTextComponentData() : 3 == i.searchType || 4 == i.searchType || 99 == i.searchType || 10 == i.searchType ? 'activityRecordFrom' === i.entryPropertyNameOnly || 'relateEntity' === i.entryPropertyNameOnly ? t._renderActiveRecordComponentData() : 'product.parentId' === i.entryPropertyName ? t._renderTreeSelectComponentData() : (a.storeData ? t._ck_store = a.storeData.value : t._ck_store = [], t._renderSelectComponentData()) : 7 == i.searchType ? t._renderDateRangeComponentData() : 5 != i.searchType && 6 != i.searchType || t._renderNumberFromToComponentData());
        },
        getData: function () {
            var e = this, t = e.element, a = e.options, i = a.filterItem;
            if (1 == i.searchType || 2 == i.searchType || 9 == i.searchType || 11 == i.searchType) {
                var n = t.find('#smartView_txt').val();
                '' !== n && e._filterDataChange({type: 'in', value: [{data: n, show: n}]});
            }
            if (5 == i.searchType || 6 == i.searchType) {
                var r = t.find('#smartView_to').val(), c = t.find('#smartView_from').val();
                if ('' !== r || '' != c) {
                    var o = /^(-?\d+)(\.\d+)?$/;
                    if (!o.test(r) && '' !== r || '' !== c && !o.test(c))return !1;
                    e._filterDataChange({type: 'fromTo', value: [{data: c, show: c}, {data: r, show: r}]});
                }
            }
            if (7 == i.searchType && ('' != t.find('#start_date').prev().text() || '' != t.find('#end_date').prev().text()))return !1;
            if ('product.parentId' === i.entryPropertyName) {
                if (!t.find('div.menutree').hasClass('jstree'))return !1;
                var s = t.find('div.menutree').jstree('get_checked', !0), d = [];
                $.each(s, function (e, t) {
                    d.push({data: t.id > 0 ? t.id : 0, show: t.text});
                }), e._dataStore = {}, e._filterDataChange({type: 'eq', value: d});
            }
            return e._dataStore;
        },
        _filterDataChange: function (e) {
            var t = this;
            t.options;
            '' !== e.value ? t._updateStoreData(e) : t._removeStoreData();
        },
        _updateStoreData: function (e) {
            var t = this;
            e.belongId ? t._dataStore = {
                type: e.type,
                value: e.value,
                s_value: e.s_value,
                belongId: e.belongId,
                belongName: e.belongName
            } : t._dataStore = {type: e.type, value: e.value};
        },
        _removeStoreData: function (e) {
            var t = this;
            t._dataStore = {};
        },
        getSearchType: function () {
            var e = this, t = e.options, a = t.filterItem;
            return a.searchType;
        }
    });
    var r = [1, 2, 3, 35, 15];
    module.exports = $;
})
define("crm/js/core/grid/gridConfig.js", ["core/rkloader.js", "crm/js/apps/activityrecord/render.js"], function (require, exports, module) {
    var a = require('rk'), e = require('../../apps/activityrecord/render'), t = {
        '-10': {iconClass: ' task'},
        '-11': {iconClass: ' record'},
        11: {iconClass: ' sign_in'},
        12: {iconClass: ' note'},
        13: {iconClass: ' call'},
        14: {iconClass: ' mail'},
        '-12': {iconClass: ' message'},
        getByKey: function (a) {
            return this[a] || {iconClass: 'custom'};
        }
    }, n = {
        createdBy: function (a, e, t, n, s, d) {
            return t ? '<div class=\"jqx_grid_td\"><a href=\"/final/user.action?uid=' + t + '\" target=\"_blank\"><span class=\"avatar\"><span class=\"avatar_masker\" ucard=\"uid=' + t + '\"></span><img   src=\"' + d.createdByIcon + '\"></span><span class=\"name\" ucard=\"uid=' + t + '\">' + $.htmlEncode(d.createdByName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
        }, updatedBy: function (a, e, t, n, s, d) {
            return t ? '<div class=\"jqx_grid_td\"><a href=\"/final/user.action?uid=' + t + '\" target=\"_blank\"><span class=\"avatar\"><span class=\"avatar_masker\" ucard=\"uid=' + t + '\"></span><img src=\"' + d.updatedByIcon + '\"></span><span class=\"name\" ucard=\"uid=' + t + '\">' + $.htmlEncode(d.updatedByName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
        }, ownerId: function (a, e, t, n, s, d) {
            return 100 == SESSION.pcCode ? t ? '<div class=\"jqx_grid_td\"><span class=\"avatar\"><span class=\"avatar_masker\"\"></span><img src=\"' + DEFAULTS.USER_DEFAULT_ICON + '\"></span><span class=\"name\">系统管理员</span></div>' : '<div class=\"jqx_grid_td\"></div>' : t ? '<div class=\"jqx_grid_td\"><a target=\"_blank\" href=\"/final/user.action?uid=' + t + '\"><span class=\"avatar\"><span class=\"avatar_masker\" ucard=\"uid=' + t + '\"></span><img src=\"' + (d.ownerIcon || DEFAULTS.USER_DEFAULT_ICON) + '\"></span><span class=\"name\" ucard=\"uid=' + t + '\">' + $.htmlEncode(d.ownerName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
        }, recentActivityCreatedBy: function (a, e, t, n, s, d) {
            return t ? '<div class=\"jqx_grid_td\"><a href=\"/final/user.action?uid=' + t + '\" target=\"_blank\"><span class=\"avatar\"><span class=\"avatar_masker\" ucard=\"uid=' + t + '\"></span><img src=\"' + d.recentActivityCreatedByIcon + '\"></span><span class=\"name\">' + $.htmlEncode(d.recentActivityCreatedByName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
        }, recentActivityRecordTime: function (a, e, n, s, d, c) {
            return n && c.recentActivityRecordId && c.recentActivityRecordType ? '<div class=\"jqx_grid_td feed_class js-recent-act\" recordid=' + c.recentActivityRecordId + '><span recordid=' + c.recentActivityRecordId + ' class=\"ico ' + t.getByKey(c.recentActivityRecordType.type).iconClass + '\"></span>' + (n instanceof Date ? Globalize.format(n, 'yyyy-MM-dd HH:mm') : n) + '</div>' : '<div class=\"jqx_grid_td\"></div>';
        }, currency: function (a, e, t, n, s, d, c, r, i) {
            return $.isNumeric(t) ? '<div class=\"jqx_grid_td\">' + $.formatNumber(t, i, !0) + $.htmlEncode(r) + '</div>' : '<div class=\"jqx_grid_td\"></div>';
        }, applicantId: function (a, e, t, n, s, d) {
            return t ? '<div class=\"jqx_grid_td\"><a href=\"/final/user.action?uid=' + t + '\" target=\"_blank\"><span class=\"avatar\"><span class=\"avatar_masker\" ucard=\"uid=' + t + '\"></span><img src=\"' + d.applicantIdIcon + '\"></span><span class=\"name\" ucard=\"uid=' + t + '\">' + $.htmlEncode(d.applicantIdName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
        }, parentAccountId: function (a, e, t, n, s, d) {
            return t instanceof Object ? (d.parentAccountId = t.accountId, t = t.value) : t = d.parentAccountName, t ? '<div class=\"jqx_grid_td\"><span class=\"name\">' + $.htmlEncode(t) + '</span></div>' : '<div class=\"jqx_grid_td\"></div>';
        }, accountId: function (a, e, t, n, s, d) {
            return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name\" customerid=\"' + d.accountId + '\" businessId=\"' + d.accountId + '\" business=\"account\"><span class=\"name\">' + $.htmlEncode(d.accountName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
        }, campaignId: function (a, e, t, n, s, d) {
            return t && t.hasOwnProperty && t.hasOwnProperty('campaignName') && (d = t), t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_campaign_name\" campaignId=\"' + d.campaignId + '\"><span class=\"name\">' + $.htmlEncode(d.campaignName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
        }, duplicateFlg: function (e, t, n, s, d, c) {
            var r = '' != c.duplicateFlg ? '<a href=\"javascript:;\" class=\"duplicate_check js-duplicate-leadhighsea js-tip\" title=\"' + a.i18n('LEADHIGHSEA_1') + '\" style=\"margin-top:15px;\" leadId=\"' + c.id + '\" leadName=\"' + c.name + '\" companyName=\"' + $.htmlEncode(c.companyName) + '\"></a>' : '<span class=\"duplicate_check\"></span>';
            return n && Number(c.duplicateFlg) ? '<div class=\"jqx_grid_td\">' + r + '</div>' : '<div class=\"jqx_grid_td\"></div>';
        }, opportunityId: function (a, e, t, n, s, d) {
            return t instanceof Object ? t.id && Number(t.id) ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_opportunity_name\" opportunityId=\"' + t.id + '\" business=\"opportunity\" businessId=\"' + t.id + '\"><span class=\"name\">' + $.htmlEncode(t.name) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>' : t && Number(t) ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_opportunity_name\" opportunityId=\"' + d.opportunityId + '\" business=\"opportunity\" businessId=\"' + d.opportunityId + '\"><span class=\"name\">' + $.htmlEncode(d.opportunityName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
        }, products: function (a, e, t, n, s, d) {
            return t && t.length && 'string' != typeof t ? '<div class=\"jqx_grid_td\">' + $.map(t, function (a) {
                return $.htmlEncode(a.name);
            }) + '</div>' : '<div class=\"jqx_grid_td\"></div>';
        }, accountName: function (a, e, t, n, s, d) {
            return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_customer_name\" customerid=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(t) + '</span></a></div>' : '';
        }, orderOrContract: function (a, e, t, n, s, d) {
            return d.orderId ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name\" orderid=\"' + d.orderId + '\" business=\"order\" businessid=\"' + d.orderId + '\"><span class=\"name\">' + $.htmlEncode(d.orderName) + '</span></a></div>' : d.contractId ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name\" contractid=\"' + d.contractId + '\" business=\"contract\" businessid=\"' + d.contractId + '\"><span class=\"name\">' + $.htmlEncode(d.contractName) + '</span></a></div>' : void 0;
        }, planPayments: function (a, e, t, n, s, d) {
            return '<div class=\"jqx_grid_td\">' + numeral(d.planPayments).format('0,0.[00]') + SESSION.currencyUnit + '</div>';
        }, balance: function (e, t, n, s, d, c) {
            c.balance - 0 <= 0 && (c.paymentStatus = a.i18n('CRM_CORE_COMPLETED')), c.balance = c.balance - 0 < 0 ? 0 : c.balance;
            var r;
            return r = '逾期' == c.paymentStatus ? '<span style=\"color: red\">' + numeral(c.balance).format('0,0.[00]') + SESSION.currencyUnit + '</span>' : numeral(c.balance).format('0,0.[00]') + SESSION.currencyUnit, '<div class=\"jqx_grid_td\">' + r + '</div>';
        }, paymentStatus: function (e, t, n, s, d, c) {
            var r;
            return r = '逾期' == c.paymentStatus ? '<span style=\"color: red\">' + a.htmlEscape(c.paymentStatus) + '</span>' : a.htmlEscape(c.paymentStatus), '<div class=\"jqx_grid_td\">' + r + '</div>';
        }, payments: function (a, e, t, n, s, d) {
            return '<div class=\"jqx_grid_td\">' + numeral(d.payments).format('0,0.[00]') + SESSION.currencyUnit + '</div>';
        }, amount: function (a, e, t, n, s, d) {
            return d.orderId ? '<div class=\"jqx_grid_td\">' + numeral(d.orderAmount).format('0,0.[00]') + SESSION.currencyUnit + '</div>' : d.contractId ? '<div class=\"jqx_grid_td\">' + numeral(d.contractAmount).format('0,0.[00]') + SESSION.currencyUnit + '</div>' : void 0;
        }, relation: function (a, e, t, n, s, d, c) {
            if (!t)return '<div class=\"jqx_grid_td\"></div>';
            if (t.belongId && 5 == t.belongId)return t.id ? '<div class=\"jqx_grid_td\"><a href=\"/final/user.action?uid=' + t.id + '\" target=\"_blank\"><span class=\"avatar\"><span class=\"avatar_masker\" ucard=\"uid=' + t.id + '\"></span><img   src=\"' + t.icon + '\"></span><span class=\"name\" ucard=\"uid=' + t.id + '\">' + $.htmlEncode(t.name) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
            if (!d[e] || !d[e].id)return '<div class=\"jqx_grid_td\"></div>';
            var r = d[e].relationBelongId;
            if (1 == r)return '<div class=\"jqx_grid_td\" relationId=\"' + d[e].id + '\"><a href=\"javascript:;\" class=\"entry_name js_customer_name\" customerid=\"' + d[e].id + '\" business=\"account\" businessid=\"' + d[e].id + '\"><span class=\"name\">' + $.htmlEncode(d[e].name) + '</span></a></div>';
            if (3 == r)return '<div class=\"jqx_grid_td\" relationId=\"' + d[e].id + '\"><a href=\"javascript:;\" class=\"entry_name\" opportunityid=\"' + d[e].id + '\" business=\"opportunity\" businessid=\"' + d[e].id + '\"><span class=\"name\">' + $.htmlEncode(d[e].name || '') + '</span></a></div>';
            if (4 == r)return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"js-product-name entry_name\" productid=\"' + d[e].id + '\" businessId=\"' + d[e].id + '\" business=\"product\">' + $.htmlEncode(d[e].name || '') + '</a></div>' : '';
            if (15 == r)return t ? '<div class=\"jqx_grid_td feed_class\"><a href=\"javascript:;\" class=\"entry_name js_contract_name\" contractid=\"' + d[e].id + '\" business=\"contract\" businessId=\"' + d[e].id + '\"><span class=\"name\">' + $.htmlEncode(d[e].name || '') + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
            if (35 == r)return t ? '<div class=\"jqx_grid_td\" relationId=\"' + d[e].id + '\"><a href=\"javascript:;\" class=\"entry_name js_order_name\" orderid=\"' + d[e].id + '\" businessid=\"' + d[e].id + '\" business=\"order\" ><span class=\"name\">' + $.htmlEncode(d[e].name) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
            if (111 == r) {
                if (!t)return '<div class=\"jqx_grid_td\"></div>';
                var i = d[e].name;
                i = i.replace(/(<a target='_blank'.*'>)|(<\/a>)/gi, '');
                var o = i;
                try {
                    var l = JSON.parse(t);
                    if (l.title) {
                        o = l.title + '时间:' + l.startTime + '~' + l.endTime + ';' + l.takesTime + ';  ';
                        for (var m in l.visitData)o = o + ' ' + l.visitData[m].name;
                    }
                } catch (a) {
                }
                return '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name\"  business=\"activityrecord\" businessId=\"' + d[e].id + '\"><span class=\"name\">' + $.htmlEncode(o) + '</span></a></div>';
            }
            return t ? '<div class=\"jqx_grid_td\" relationId=\"' + d[e].id + '\"><a href=\"javascript:;\" class=\"entry_name\" belongId=\"' + d[e].relationBelongId + '\" instanceId=\"' + d[e].id + '\" business=\"customize\" businessid=\"' + d[e].id + '\"><span class=\"name\">' + $.htmlEncode(d[e].name) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
        }, showUser: function (a, e, t, n, s, d) {
            var c = $.parseJSON(t);
            return c ? '<div class=\"jqx_grid_td\"><a target=\"_blank\" href=\"/final/user.action?uid=' + c.value + '\"><span class=\"avatar\"><span class=\"avatar_masker\" ucard=\"uid=' + c.value + '\"></span><img src=\"' + (c.icon || DEFAULTS.USER_DEFAULT_ICON) + '\"></span><span class=\"name\" ucard=\"uid=' + c.value + '\">' + c.label + '</span></a></div>' : '';
        }, imageField: function (a, e, t, n, s, d) {
            var c = '';
            return t = $.parseJSON(t), t && t.length ? (c += '<ul class=\"feed-show-more-img js-album-box clear\" style=\"display:none;\">', $.each(t, function (a, e) {
                c += '<li><a class=\"js-album\" href=\"' + e.fileUrl + '\" lurl=\"' + e.fileLUrl + '\" surl=\"' + e.fileSUrl + '\"><img src=\"' + e.fileUrl + '\" class=\"mCS_img_loaded\"></a></li>';
            }), c += '</ul>', t.length ? '<div class=\"jqx_grid_td has_image\"><a class=\"list_image\"></a> ' + t.length + ' 张' + c + '</div>' : '') : '';
        }, voiceField: function (e, t, n, s, d, c) {
            return n && '[]' != n ? '<span title=\"' + a.i18n('APPS_FEED_CLICK_PLAY') + '\" class=\"item-player\" style=\"margin-top:5px;\"><span class=\"item-player-inner\"><span class=\"item-player-length\"></span></span><span class=\"item-player-btn\"></span><span class=\"item-player-corner\"></span></span><audio class=\"hidden js-audio\" src=\"' + n + '\"></audio>' : '<div class=\"jqx_grid_td\"></div>';
        }, phoneField: function (e, t, n, s, d, c) {
            return 1 == $.parseJSON(window.SESSION.callCenterObj).phone ? '<div class=\"jqx_grid_td icallcenter_class\">' + n + '<span mobile=' + n + ' class=\"ico-dialout js-icall-act\" title=\"' + a.i18n('CALLCENTER_TITLE') + '\"></span></div>' : '<div class=\"jqx_grid_td\">' + n + '</div>';
        }, emailField: function (a, e, t, n, s, d) {
            return t ? '<div class=\"jqx_grid_td\"><a href=\"mailto:' + t + '\">' + t + '</a></div>' : '';
        }, linkField: function (a, e, t, n, s, d) {
            var c = t ? t.indexOf('https://') != -1 || t.indexOf('http://') != -1 ? t : 'http://' + t : '';
            return t ? '<div class=\"jqx_grid_td\"><a target=\"_blank\" rel=\"noopener noreferrer\" href=\"' + c + '\">' + t + '</a></div>' : '<div class=\"jqx_grid_td\"></div>';
        }
    }, s = {
        account: {
            itemsUrl: '/json/crm_account/listNew.action',
            searchUrl: '/json/crm_account/search.action',
            dataFields: ['id', 'ownerIcon', 'ownerName', 'updatedByIcon', 'updatedByName', 'recentActivityCreatedByIcon', 'recentActivityCreatedByName', 'createdByIcon', 'createdByName', 'dataindex', 'opportunityCount', 'hasOppListPermission', 'recentActivityRecordId', 'recentActivityRecordType', 'parentAccountName', 'parentAccountId', 'applicantIdIcon', 'applicantIdName'],
            cellsRender: {
                id: function (a, e, t, n, s, d) {
                    var c = d.hasOppListPermission ? '<a act=\"popupSub\" class=\"has_opp\" customerid=\"' + d.id + '\" rowid=\"' + d.id + '\" oppcount=\"' + Number(d.opportunityCount) + '\"></a>' : '<span class=\"has_opp_down\"></span>';
                    return t && Number(d.opportunityCount) ? '<div class=\"jqx_grid_td\">' + c + '</div>' : '<div class=\"jqx_grid_td\"></div>';
                }, accountName: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" name=\"mainColumn\" class=\"entry_name\" business=\"account\" businessId=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(t) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, phone: function (e, t, n, s, d, c) {
                    return 1 == $.parseJSON(window.SESSION.callCenterObj).phone ? '<div class=\"jqx_grid_td icallcenter_class\">' + c.phone + '<span mobile=' + c.phone + ' class=\"ico-dialout js-icall-act\" title=\"' + a.i18n('CALLCENTER_TITLE') + '\"></span></div>' : '<div class=\"jqx_grid_td\">' + c.phone + '</div>';
                }
            },
            dataRoot: 'data>accounts',
            dataKeywords: 'accounts',
            belongId: 1,
            pinnedRowCount: 3
        },
        opportunity: {
            itemsUrl: '/json/crm_opportunity/listNew.action',
            searchUrl: '/json/crm_opportunity/search.action',
            dataFields: ['id', 'ownerIcon', 'ownerName', 'createdByIcon', 'createdByName', 'updatedByIcon', 'updatedByName', 'dataindex', 'accountName', 'campaignName', 'recentActivityCreatedByName', 'recentActivityRecordId', 'recentActivityRecordType', 'applicantIdIcon', 'applicantIdName'],
            cellsRender: {
                opportunityName: function (a, e, t, n, s, d) {
                    return 'kanban' == s.viewType ? t ? '<div class=\"jqx_grid_td\"><a target=\"_blank\" href=\"/opportunity_detail.action?id=' + d.id + '\" class=\"entry_name\" customerid=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(t) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>' : t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" name=\"mainColumn\" class=\"entry_name\" businessId=\"' + d.id + '\" business=\"opportunity\"><span class=\"name\">' + $.htmlEncode(t) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, winRate: function (a, e, t, n, s, d, c, r) {
                    return t || 0 == t ? '<div class=\"jqx_grid_td\">' + Globalize.format(t - 0) + '%</div>' : '<div class=\"jqx_grid_td\"></div>';
                }
            },
            dataRoot: 'data>opportunities',
            dataKeywords: 'opportunities',
            belongId: 3
        },
        contact: {
            itemsUrl: '/json/crm_contact/listNew.action',
            searchUrl: '/json/crm_contact/search.action',
            dataFields: ['id', 'ownerIcon', 'ownerName', 'updatedByIcon', 'updatedByName', 'createdByIcon', 'createdByName', 'dataindex', 'accountName', 'recentActivityRecordId', 'recentActivityRecordType', 'accountType', 'oppContactId', 'contactRoleId'],
            cellsRender: {
                contactName: function (a, e, t, n, s, d) {
                    var c = t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_contact_name\" contactid=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(t) + '</span></a>' : '<div class=\"jqx_grid_td\"></div>', r = $('#div_main_content').customerList('getSearchData').mainContact;
                    return r.contactId && r.contactId == d.id && (c += '<span class=\"xsy_contact_refer_sta\" title=\"主要联系人\">主要联系人</span>'), c += '</div>';
                }, accountId: function (a, e, t, n, s, d) {
                    return 1 == d.accountType ? t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name\"  customerid=\"' + d.accountId + '\" business=\"account\" businessId=\"' + d.accountId + '\"><span class=\"name\">' + $.htmlEncode(d.accountName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>' : 2 == d.accountType ? t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name\"  customerid=\"' + d.accountId + '\" business=\"partner\" businessId=\"' + d.accountId + '\"><span class=\"name\">' + $.htmlEncode(d.accountName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>' : t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_customer_name\" customerid=\"' + d.accountId + '\"><span class=\"name\">' + $.htmlEncode(d.accountName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, contactRoleId: function (e, t, n, s, d, c) {
                    var r = n ? n.split(',') : [], i = $('#div_main_content').customerList('getSearchData').contactRoles, o = '<div class=\"jqx_grid_td\"><div class=\"xsy_contact_refer_selectmunu\" title=\"{{contactRoleName}}\" >                  <div class=\"xsy_contact_refer_staselect\" contactRoleId=\"{{contactRoleId}}\" contactId=\"{{contactId}}\" oppContactId=\"{{oppContactId}}\">                                         <span>{{contactRoleName}}</span>                                               <i class=\"arrow\"></i>                                                      </div>                                                                      </div></div>', l = '请选择角色';
                    return r.length > 0 && (l = r.map(function (a) {
                        return i[a] ? i[a] : '';
                    }).join(',')), a.templateText(o, {
                        contactRoleName: l,
                        contactRoleId: n,
                        contactId: c.id,
                        oppContactId: c.oppContactId
                    });
                }, phone: function (e, t, n, s, d, c) {
                    return 1 == $.parseJSON(window.SESSION.callCenterObj).phone ? '<div class=\"jqx_grid_td icallcenter_class\">' + c.phone + '<span mobile=' + c.phone + ' class=\"ico-dialout js-icall-act\" title=\"' + a.i18n('CALLCENTER_TITLE') + '\"></span></div>' : '<div class=\"jqx_grid_td\">' + c.phone + '</div>';
                }, mobile: function (e, t, n, s, d, c) {
                    return 1 == $.parseJSON(window.SESSION.callCenterObj).phone ? '<div class=\"jqx_grid_td icallcenter_class\">' + c.mobile + '<span mobile=' + c.mobile + ' class=\"ico-dialout js-icall-act\" title=\"' + a.i18n('CALLCENTER_TITLE') + '\"></span></div>' : '<div class=\"jqx_grid_td\">' + c.mobile + '</div>';
                }
            },
            dataRoot: 'data>contacts',
            dataKeywords: 'contacts',
            belongId: 2
        },
        highsea: {
            itemsUrl: '/json/crm_highsea/listNew.action?highSeaId=',
            searchUrl: '/json/crm_highsea/search.action',
            dataFields: ['id', 'lastOwnerIcon', 'lastOwnerName', 'ownerIcon', 'ownerName', 'updatedByIcon', 'updatedByName', 'recentActivityCreatedByIcon', 'recentActivityCreatedByName', 'createdByIcon', 'createdByName', 'dataindex', 'opportunityCount', 'hasOppListPermission', 'recentActivityRecordId', 'recentActivityRecordType', 'parentAccountName', 'parentAccountId', 'releaseNum', 'applicantIdIcon', 'applicantIdName'],
            cellsRender: {
                accountName: function (a, e, t, n, s, d, c) {
                    return c ? t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" name=\"mainColumn\" class=\"entry_name\" businessId=\"' + d.id + '\" business=\"account\"><span class=\"name\">' + $.htmlEncode(t) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>' : t ? '<div class=\"jqx_grid_td\"><span class=\"name\">' + $.htmlEncode(t) + '</span></div>' : '';
                }, returnTimes: function (e, t, n, s, d, c) {
                    return Number(n) > 0 ? '<div class=\"jqx_grid_td feed_class\"><span >' + n + '</span><span title=\"' + a.i18n('HIGHSEA_3') + '\" class=\"ico view_return js-account_history\" customerid=\"' + c.id + '\" style=\"margin-top:12px;\"></span></div>' : '<div class=\"jqx_grid_td feed_class\"><span >' + $.htmlEncode(n) + '</span></div>';
                }, lastOwnerId: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a target=\"_blank\" href=\"/final/user.action?uid=' + t + '\"><span class=\"avatar\"><span class=\"avatar_masker\" ucard=\"uid=' + t + '\"></span><img src=\"' + (d.lastOwnerIcon || DEFAULTS.USER_DEFAULT_ICON) + '\"></span><span class=\"name\" ucard=\"uid=' + t + '\">' + $.htmlEncode(d.lastOwnerName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }
            },
            dataRoot: 'data>accounts',
            dataKeywords: 'accounts',
            belongId: 101
        },
        lead: {
            itemsUrl: '/json/crm_lead/listNew.action',
            searchUrl: '/json/crm_lead/search.action',
            dataFields: ['id', 'ownerIcon', 'ownerName', 'updatedByIcon', 'updatedByName', 'recentActivityCreatedByIcon', 'recentActivityCreatedByName', 'createdByIcon', 'createdByName', 'dataindex', 'campaignName', 'hasOppListPermission', 'recentActivityRecordId', 'recentActivityRecordType', 'duplicateFlg'],
            cellsRender: {
                name: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_customer_name\" customerid=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(t) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, phone: function (e, t, n, s, d, c) {
                    return 1 == $.parseJSON(window.SESSION.callCenterObj).phone ? '<div class=\"jqx_grid_td icallcenter_class\">' + c.phone + '<span mobile=' + c.phone + ' class=\"ico-dialout js-icall-act\" title=\"' + a.i18n('CALLCENTER_TITLE') + '\"></span></div>' : '<div class=\"jqx_grid_td\">' + c.phone + '</div>';
                }, mobile: function (e, t, n, s, d, c) {
                    return 1 == $.parseJSON(window.SESSION.callCenterObj).phone ? '<div class=\"jqx_grid_td icallcenter_class\">' + c.mobile + '<span mobile=' + c.mobile + ' class=\"ico-dialout js-icall-act\" title=\"' + a.i18n('CALLCENTER_TITLE') + '\"></span></div>' : '<div class=\"jqx_grid_td\">' + c.mobile + '</div>';
                }
            },
            dataRoot: 'data>leads',
            dataKeywords: 'leads',
            belongId: 11,
            pinnedRowCount: 3
        },
        leadhighsea: {
            itemsUrl: '/json/crm_leadhighsea/listNew.action?leadHighSeaId=',
            searchUrl: '/json/crm_leadhighsea/search.action',
            dataFields: ['id', 'lastOwnerIcon', 'lastOwnerName', 'ownerIcon', 'ownerName', 'updatedByIcon', 'updatedByName', 'recentActivityCreatedByIcon', 'recentActivityCreatedByName', 'createdByIcon', 'createdByName', 'dataindex', 'campaignName', 'opportunityCount', 'hasOppListPermission', 'recentActivityRecordId', 'recentActivityRecordType', 'releaseNum', 'duplicateFlg'],
            cellsRender: {
                name: function (a, e, t, n, s, d, c) {
                    return c ? t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_customer_name\" customerid=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(t) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>' : t ? '<div class=\"jqx_grid_td\"><span class=\"name\">' + $.htmlEncode(t) + '</span></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, returnTimes: function (e, t, n, s, d, c) {
                    return Number(n) > 0 ? '<div class=\"jqx_grid_td feed_class\"><span >' + n + '</span><span title=\"' + a.i18n('HIGHSEA_3') + '\" class=\"ico view_return js-lead_history\" customerid=\"' + c.id + '\" style=\"margin-top:12px;\"></span></div>' : '<div class=\"jqx_grid_td feed_class\"><span >' + $.htmlEncode(n) + '</span></div>';
                }, lastOwnerId: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a target=\"_blank\" href=\"/final/user.action?uid=' + t + '\"><span class=\"avatar\"><span class=\"avatar_masker\" ucard=\"uid=' + t + '\"></span><img src=\"' + (d.lastOwnerIcon || DEFAULTS.USER_DEFAULT_ICON) + '\"></span><span class=\"name\" ucard=\"uid=' + t + '\">' + $.htmlEncode(d.lastOwnerName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }
            },
            dataRoot: 'data>leads',
            dataKeywords: 'leads',
            belongId: 102,
            pinnedRowCount: 3
        },
        campaign: {
            itemsUrl: '/json/crm_campaign/listNew.action',
            searchUrl: '/json/crm_campaign/search.action',
            dataFields: ['id', 'ownerIcon', 'ownerName', 'createdByIcon', 'createdByName', 'updatedByIcon', 'updatedByName', 'dataindex', 'recentActivityCreatedByName', 'recentActivityRecordId', 'recentActivityRecordType'],
            cellsRender: {
                campaignName: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_campaign_name\" campaignid=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(t) + '</span></a></div>' : '';
                }
            },
            dataRoot: 'data>campaigns',
            dataKeywords: 'campaigns',
            belongId: 6
        },
        order: {
            itemsUrl: '/json/crm_order/listNew.action?orderType=',
            searchUrl: '/json/crm_order/search.action',
            dataFields: ['id', 'ownerIcon', 'ownerName', 'createdByIcon', 'createdByName', 'updatedByIcon', 'updatedByName', 'dataindex', 'applicantIdIcon', 'applicantIdName', 'signerIcon', 'signerName', 'accountType', 'accountName', 'opportunityName', 'contactTel', 'contactAddress', 'status_select_item_id', 'title', 'entityName', 'hasProductListPermission', 'productCount', 'contractName'],
            cellsRender: {
                id: function (a, e, t, n, s, d) {
                    var c = d.hasProductListPermission ? '<a act=\"popupSub\" class=\"has_order\" customerid=\"' + d.id + '\" rowid=\"' + d.id + '\" productcount=\"' + Number(d.productCount) + '\"></a>' : '<span class=\"has_order_column\"></span>';
                    return Number(d.productCount) > 0 ? '<div class=\"jqx_grid_td\">' + c + '</div>' : '<div class=\"jqx_grid_td\"></div>';
                }, title: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_contract_name\" customerid=\"' + d.id + '\" business=\"contract\" businessId=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(t) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, accountId: function (a, e, t, n, s, d) {
                    if (1 == SESSION.tenantType) {
                        var c = 'js_customer_name';
                        return 5 == d.accountType && (c = 'js_terminal_name'), t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name ' + c + '\" customerid=\"' + d.accountId + '\"><span class=\"name\">' + $.htmlEncode(d.accountName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                    }
                    return t && Number(t) ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name\"  customerid=\"' + d.accountId + '\" business=\"account\" businessId=\"' + d.accountId + '\"><span class=\"name\">' + $.htmlEncode(d.accountName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, contractId: function (a, e, t, n, s, d) {
                    return t instanceof Object ? t.id && Number(t.id) ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_contract_name\" contractid=\"' + t.id + '\" business=\"contract\" businessId=\"' + t.id + '\"><span class=\"name\">' + $.htmlEncode(t.name) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>' : t && Number(t) ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_contract_name\" contractid=\"' + d.contractId + '\" business=\"contract\" businessId=\"' + d.contractId + '\"><span class=\"name\">' + $.htmlEncode(d.contractName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, po: function (a, e, t, n, s, d) {
                    var c = d.id;
                    return $('#list_orders_li').is(':visible') && (c = d.orderId), t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_order_title\" orderId=\"' + c + '\"   status=\"' + d.status_select_item_id + '\" business=\"order\" businessId=\"' + c + '\"><span class=\"name\">' + $.htmlEncode(d.po) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, orderId: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_order_title\" orderId=\"' + d.orderId + '\"   status=\"' + d.status_select_item_id + '\" business=\"order\" businessId=\"' + d.orderId + '\"><span class=\"name\">' + $.htmlEncode(d.po) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, ro: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_order_title\" orderId=\"' + d.id + '\"  status=\"' + d.status_select_item_id + '\" business=\"order\" businessId=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(d.ro) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, entityType: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><span class=\"name\">' + $.htmlEncode(d.entityName) + '</span></div>' : '<div class=\"jqx_grid_td\"></div>';
                }
            },
            dataRoot: 'data>orders',
            dataKeywords: 'orders',
            belongId: 35,
            pinnedRowCount: 3
        },
        contract: {
            itemsUrl: '/json/crm_contract/listNew.action',
            searchUrl: '/json/crm_contract/search.action',
            dataFields: ['id', 'ownerIcon', 'ownerName', 'createdByIcon', 'createdByName', 'updatedByIcon', 'updatedByName', 'dataindex', 'applicantIdIcon', 'applicantIdName', 'signerIcon', 'signerName', 'accountName', 'campaignName', 'opportunityName', 'lockValue', 'lockUserName', 'lockDate', 'lockUser'],
            cellsRender: {
                lockUser: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"/final/user.action?uid=' + t + '\" target=\"_blank\"><span class=\"avatar\"><span class=\"avatar_masker\" ucard=\"uid=' + t + '\"></span></span><span class=\"name\" ucard=\"uid=' + t + '\">' + $.htmlEncode(d.lockUserName) + '</span></a></div>' : '';
                }, signerId: function (a, e, t, n, s, d) {
                    return t && t.id ? '<div class=\"jqx_grid_td\"><a href=\"/final/user.action?uid=' + t.id + '\" target=\"_blank\"><span class=\"avatar\"><span class=\"avatar_masker\" ucard=\"uid=' + t.id + '\"></span><img src=\"' + t.icon + '\"></span><span class=\"name\" ucard=\"uid=' + t.id + '\">' + $.htmlEncode(t.name) + '</span></a></div>' : t && Number(t) && d.signerName ? '<div class=\"jqx_grid_td\"><a href=\"/final/user.action?uid=' + t + '\" target=\"_blank\"><span class=\"avatar\"><span class=\"avatar_masker\" ucard=\"uid=' + t + '\"></span><img src=\"' + d.signerIcon + '\"></span><span class=\"name\" ucard=\"uid=' + t + '\">' + $.htmlEncode(d.signerName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, title: function (a, e, t, n, s, d) {
                    var c = (Number(d.lockValue) > 1, d.lockDate ? Number(d.lockDate) : 0), r = ('[' + moment(c).format('YYYY-MM-DD HH:SS') + ']<a href=\'/final/user.action?uid=' + d.lockUser + '\' target=\'_blank\'>' + d.lockUserName + '</a>已将该单据锁定\uFF0C可联系<a href=\'/final/user.action?uid=' + d.lockUser + '\' target=\'_blank\'>' + d.lockUserName + '</a>解锁\u3002', '');
                    return t ? '<div class=\"jqx_grid_td feed_class\"><a href=\"javascript:;\" class=\"entry_name js_contract_name\" contractid=\"' + d.id + '\" business=\"contract\" businessId=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(t) + r + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }
            },
            dataRoot: 'data>contracts',
            dataKeywords: 'contracts',
            belongId: 15
        },
        case: {
            itemsUrl: '/json/crm_case/listNew.action',
            searchUrl: '/json/crm_case/search.action',
            dataFields: ['id', 'ownerIcon', 'ownerName', 'createdByIcon', 'createdByName', 'updatedByIcon', 'updatedByName', 'dataindex', 'accountName', 'contactName', 'signerIcon', 'signerName', 'contactTel', 'status_id', 'contactAddress'],
            cellsRender: {
                title: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_contract_name\" customerid=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(t) + '</span></a></div>' : '';
                }, caseCode: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_case_title\" caseId=\"' + d.id + '\" status=\"' + d.status_id + '\"><span class=\"name\">' + $.htmlEncode(d.caseCode) + '</span></a></div>' : '';
                }, caseTitle: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_case_title\" caseId=\"' + d.id + '\" status=\"' + d.status_id + '\"><span class=\"name\">' + $.htmlEncode(d.caseTitle) + '</span></a></div>' : '';
                }, contactId: function (a, e, t, n, s, d) {
                    return t && Number(t) ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_contact_name\" contactId=\"' + d.contactId + '\"><span class=\"name\">' + $.htmlEncode(d.contactName) + '</span></a></div>' : '';
                }, days: function (e, t, n, s, d, c, r) {
                    var i;
                    return i = 2 == r ? a.i18n('CRM_CORE_HOURS') : a.i18n('CRM_CORE_DAYS'), n >= 0 ? '<div class=\"jqx_grid_td\">' + n + ' ' + i + '</div>' : '';
                }
            },
            dataRoot: 'data>cases',
            dataKeywords: 'cases',
            belongId: 12
        },
        expense: {
            itemsUrl: '/json/crm_expense/listNew.action',
            searchUrl: '/json/crm_expense/search.action',
            dataFields: ['id', 'ownerIcon', 'ownerName', 'createdByIcon', 'createdByName', 'updatedByIcon', 'updatedByName', 'dataindex', 'belongId', 'expenseTypeName', 'expenseAccountTitle', 'relateEntityId', 'relateEntityName', 'expenseName'],
            cellsRender: {
                relateEntity: function (a, e, t, n, s, d) {
                    var c = d.relateEntity, r = d.relateEntityId;
                    return '' != c && '' != r ? 1 == c ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name task_group\" customerid=\"' + r + '\" business=\"account\" businessId=\"' + r + '\"><span class=\"name account\">' + $.htmlEncode(d.relateEntityName) + '</span></a></div>' : 2 == c ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_contact_name task_group\" contactId=\"' + r + '\"><span class=\"name contact\">' + $.htmlEncode(d.relateEntityName) + '</span></a></div>' : 3 == c ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name task_group\" opportunityId=\"' + r + '\" business=\"opportunity\" businessId=\"' + r + '\"><span class=\"name opportunity\">' + $.htmlEncode(d.relateEntityName) + '</span></a></div>' : 6 == c ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_campaign_name task_group\" campaignid=\"' + r + '\"><span class=\"name campaign\">' + $.htmlEncode(d.relateEntityName) + '</span></a></div>' : 66 == c ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_agent_name task_group\" customerid=\"' + r + '\"><span class=\"name agent\">' + $.htmlEncode(d.relateEntityName) + '</span></a></div>' : 67 == c ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_terminal_name task_group\" customerid=\"' + r + '\"><span class=\"name terminal\">' + $.htmlEncode(d.relateEntityName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name task_group\" belongId=\"' + c + '\" business=\"customize\" businessId=\"' + r + '\"><span class=\"name custom\">' + $.htmlEncode(d.relateEntityName) + '</span></a></div>' : '';
                }, expenseType: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><span class=\"name\">' + $.htmlEncode(d.expenseTypeName) + '</span></div>' : '';
                }, expenseName: function (a, e, t, n, s, d) {
                    return '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_expense_type\" instanceId=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(d.expenseTypeName) + ' ' + $.formatNumber(d.money, null, !0) + '</span></a></div>';
                }, expenseAccountId: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_expense_account\" instanceId=\"' + d.expenseAccountId + '\"><span class=\"name\">' + $.htmlEncode(d.expenseAccountTitle) + '</span></a></div>' : '';
                }
            },
            dataRoot: 'data>entityDatas',
            dataKeywords: 'entityDatas',
            belongId: 63
        },
        expenseaccount: {
            itemsUrl: '/json/crm_expenseaccount/listNew.action',
            searchUrl: '/json/crm_expenseaccount/search.action',
            dataFields: ['id', 'ownerIcon', 'ownerName', 'createdByIcon', 'createdByName', 'updatedByIcon', 'updatedByName', 'dataindex', 'belongId', 'expenseTypeName', 'applicantIdIcon', 'applicantIdName'],
            cellsRender: {
                title: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_expenseaccount_title\" instanceId=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(t) + '</span></a></div>' : '';
                }
            },
            dataRoot: 'data>entityDatas',
            dataKeywords: 'entityDatas',
            belongId: 64
        },
        payment: {
            itemsUrl: '/json/crm_payment/listNew.action',
            searchUrl: '/json/crm_payment/search.action',
            dataFields: ['id', 'ownerIcon', 'ownerName', 'accountName', 'createdByName', 'updatedByIcon', 'updatedByName', 'orderId', 'orderName', 'dataindex', 'type', 'orderAmount', 'orderPayBack', 'contractId', 'contractName', 'contractAmount', 'contractPayBack'],
            cellsRender: {
                contractId: function (a, e, t, n, s, d) {
                    return t instanceof Object ? t.id && Number(t.id) ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_contract_name\" contractid=\"' + t.id + '\" business=\"contract\" businessId=\"' + t.id + '\"><span class=\"name\">' + $.htmlEncode(t.name) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>' : t && Number(t) ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_contract_name\" contractid=\"' + d.contractId + '\" business=\"contract\" businessId=\"' + d.contractId + '\"><span class=\"name\">' + $.htmlEncode(d.contractName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, orderId: function (a, e, t, n, s, d) {
                    return t instanceof Object ? t.id && Number(t.id) ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_order_name\" orderId=\"' + t.id + '\" business=\"order\" businessId=\"' + t.id + '\"><span class=\"name\">' + $.htmlEncode(t.name) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>' : t && Number(t) ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_order_name\" orderId=\"' + d.orderId + '\" business=\"order\" businessId=\"' + d.orderId + '\"><span class=\"name\">' + $.htmlEncode(d.orderName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, code: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name\"  business=\"payment\" businessId=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(d.code) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, paymentPercent: function (a, e, t, n, s, d) {
                    return '<div class=\"jqx_grid_td\">' + numeral(d.paymentPercent).format('0,0.[00]') + '%</div>';
                }, amount: function (a, e, t, n, s, d) {
                    return '<div class=\"jqx_grid_td\">' + numeral(d.amount).format('0,0.[00]') + SESSION.currencyUnit + '</div>';
                }
            },
            dataRoot: 'data>payments',
            dataKeywords: 'payments',
            pinnedRowCount: 1,
            belongId: 69
        },
        paymentplan: {
            itemsUrl: '/json/crm_paymentplan/listNew.action',
            searchUrl: '/json/crm_paymentplan/search.action',
            dataFields: ['id', 'ownerIcon', 'ownerName', 'accountName', 'createdByName', 'updatedByIcon', 'updatedByName', 'createdByIcon', 'orderId', 'orderName', 'dataindex', 'type', 'orderAmount', 'orderPayBack', 'contractId', 'contractName', 'contractAmount', 'contractPayBack', 'overdueStatus', 'dimDepart'],
            cellsRender: {
                contractId: function (a, e, t, n, s, d) {
                    return t instanceof Object ? t.id && Number(t.id) ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_contract_name\" contractid=\"' + t.id + '\" business=\"contract\" businessId=\"' + t.id + '\"><span class=\"name\">' + $.htmlEncode(t.name) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>' : t && Number(t) ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_contract_name\" contractid=\"' + d.contractId + '\" business=\"contract\" businessId=\"' + d.contractId + '\"><span class=\"name\">' + $.htmlEncode(d.contractName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, orderId: function (a, e, t, n, s, d) {
                    return t instanceof Object ? t.id && Number(t.id) ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_order_name\" orderId=\"' + t.id + '\" business=\"order\" businessId=\"' + t.id + '\"><span class=\"name\">' + $.htmlEncode(t.name) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>' : t && Number(t) ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_order_name\" orderId=\"' + d.orderId + '\" business=\"order\" businessId=\"' + d.orderId + '\"><span class=\"name\">' + $.htmlEncode(d.orderName) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, code: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name\"  business=\"paymentplan\" businessId=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(d.code) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, amount: function (a, e, t, n, s, d) {
                    return '<div class=\"jqx_grid_td\">' + numeral(d.amount).format('0,0.[00]') + SESSION.currencyUnit + '</div>';
                }, overdueStatus: function (e, t, n, s, d, c) {
                    var r;
                    return r = '有逾期' == c.overdueStatus && '未完成' == c.status ? '<span style=\"color: red\">' + a.htmlEscape(c.overdueStatus) + '</span>' : a.htmlEscape(c.overdueStatus), '<div class=\"jqx_grid_td\">' + r + '</div>';
                }, balance: function (a, e, t, n, s, d) {
                    return '有逾期' == d.overdueStatus && '未完成' == d.status ? innerHtm = '<span style=\"color: red\">' + numeral(d.balance).format('0,0.[00]') + SESSION.currencyUnit + '</span>' : innerHtm = numeral(d.balance).format('0,0.[00]') + SESSION.currencyUnit, '<div class=\"jqx_grid_td\">' + innerHtm + '</div>';
                }, status: function (e, t, n, s, d, c) {
                    var r;
                    return r = '有逾期' == c.overdueStatus && '未完成' == c.status ? '<span style=\"color: red\">' + a.htmlEscape(c.status) + '</span>' : a.htmlEscape(c.status), '<div class=\"jqx_grid_td\">' + r + '</div>';
                }
            },
            dataRoot: 'data>paymentPlans',
            dataKeywords: 'paymentPlans',
            belongId: 76,
            pinnedRowCount: 1
        },
        solution: {
            itemsUrl: '/json/crm_solution/listNew.action',
            searchUrl: '/json/crm_solution/search.action',
            dataRoot: 'data>solutions',
            dataKeywords: 'solutions',
            belongId: 9,
            dataFields: ['id', 'ownerIcon', 'ownerName', 'createdByIcon', 'createdByName', 'updatedByIcon', 'updatedByName', 'dataindex', 'signerIcon', 'signerName', 'accountName'],
            cellsRender: {
                title: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_solution_title\" solutionId=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(t) + '</span></a></div>' : '';
                }, updatedAt: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\">' + Globalize.format(new Date(t - 0), 'yyyy-MM-dd') + '</div>' : '';
                }
            }
        },
        product: {
            itemsUrl: '/json/crm_product/listNew.action',
            searchUrl: '/json/crm_product/search.action',
            dataFields: ['id', 'ownerIcon', 'ownerName', 'createdByIcon', 'createdByName', 'updatedByIcon', 'updatedByName', 'dataindex', 'type'],
            dataRoot: 'data>products',
            dataKeywords: 'products',
            belongId: 4,
            cellsRender: {
                id: function (a, e, t, n, s, d) {
                    return 0 == d.type ? '<span class=\"product_yellowico\"></span>' : '<span class=\"product_grayico\"></span>';
                }, productName: function (a, e, t, n, s, d) {
                    0 == d.type ? 'js-product-dir-name' : 'js-product-name entry_name';
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name\" productid=\"' + d.id + '\" businessId=\"' + d.id + '\" business=\"product\">' + $.htmlEncode(t) + '</a></div>' : '';
                }, url: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><span class=\"avatar\"><span class=\"avatar_masker\"></span><img src=\"' + $.htmlEncode(t) + '\"></span></div>' : '';
                }
            }
        },
        activityrecord: {
            itemsUrl: '/json/crm_activityrecord/record-listNew.action',
            searchUrl: '/json/crm_activityrecord/search.action?f=n',
            dataFields: ['id', 'ownerIcon', 'ownerName', 'typeName', 'entityId', 'entityType', 'entityName', 'fromAccount', 'belongName', 'belongId', 'systemId'],
            cellsRender: {
                type: function (a, e, t, n, s, d) {
                    return '<div class=\"jqx_grid_td\"><span class=\"name\">' + $.htmlEncode(d.typeName) + '</span></div>';
                }, entityType: function (a, e, t, n, s, d) {
                    return '<div class=\"jqx_grid_td\"><span class=\"name\">' + $.htmlEncode(d.typeName) + '</span></div>';
                }, content: function (a, e, t, n, s, d) {
                    t = t.replace(/(<a target='_blank'.*'>)|(<\/a>)/gi, '');
                    var c = t;
                    try {
                        var r = JSON.parse(t);
                        if (r.title) {
                            c = r.title + '时间:' + r.startTime + '~' + r.endTime + ';' + r.takesTime + ';  ';
                            for (var i in r.visitData)c = c + ' ' + r.visitData[i].name;
                        }
                    } catch (a) {
                    }
                    return '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name\"  business=\"activityrecord\" businessId=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(c) + '</span></a></div>';
                }, contactId: function (a, e, t, n, s, d) {
                    return t && $.isPlainObject(t) ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_contact_name\" contactId=\"' + t.id + '\"><span class=\"name\">' + $.htmlEncode(t.name) + '</span></a></div>' : '';
                }, activityRecordFrom: function (a, t, n, s, d, c) {
                    return e.render.activityRecordFrom(c);
                }, startTime: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\">' + Globalize.format(new Date(t - 0), 'yyyy-MM-dd HH:mm') + '</div>' : '';
                }
            },
            dataRoot: 'data>activityRecords',
            dataKeywords: 'activityRecords',
            belongId: 111,
            pinnedRowCount: 0
        },
        competitor: {
            itemsUrl: '/json/crm_competitor/listNew.action',
            searchUrl: '/json/crm_competitor/search.action',
            dataRoot: 'data>competitors',
            dataKeywords: 'competitors',
            belongId: 10,
            dataFields: ['id', 'ownerIcon', 'ownerName', 'createdByIcon', 'createdByName', 'updatedByIcon', 'updatedByName', 'dataindex', 'campaignName'],
            cellsRender: n
        },
        partner: {
            itemsUrl: '/json/crm_partner/listNew.action',
            searchUrl: '/json/crm_partner/search.action',
            dataRoot: 'data>partners',
            dataKeywords: 'partners',
            belongId: 9,
            dataFields: ['id', 'ownerIcon', 'ownerName', 'createdByIcon', 'createdByName', 'updatedByIcon', 'updatedByName', 'dataindex', 'campaignName'],
            cellsRender: {
                accountName: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" name=\"mainColumn\" class=\"entry_name\" business=\"partner\" businessId=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(t) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }
            }
        },
        orderproduct: {
            cellsRender: {
                id: function (a, e, t, n, s, d) {
                    return 0 == d.type ? '<span class=\"product_yellowico\">' : '<span class=\"product_grayico\">';
                }, 'product.productName': function (a, e, t, n, s, d) {
                    var c = 0 == d.type ? 'js-product-dir-name' : 'js-product-name';
                    return t ? '<div class=\"jqx_grid_td\"><a  href=\"javascript:;\" class=\"' + c + '\" productid=\"' + d.productId + '\">' + $.htmlEncode(t) + '</a></div>' : '';
                }, 'orderProduct.createdBy': function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"/final/user.action?uid=' + t + '\" target=\"_blank\"><span class=\"avatar\"><span class=\"avatar_masker\" ucard=\"uid=' + t + '\"></span><img src=\"' + d.createdByIcon + '\"></span><span class=\"name\">' + $.htmlEncode(d.createdByName) + '</span></a></div>' : '';
                }, 'orderProduct.updatedBy': function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"/final/user.action?uid=' + t + '\" target=\"_blank\"><span class=\"avatar\"><span class=\"avatar_masker\" ucard=\"uid=' + t + '\"></span><img src=\"' + d.updatedByIcon + '\"></span><span class=\"name\">' + $.htmlEncode(d.updatedByName) + '</span></a></div>' : '';
                }, 'product.ownerId': function (a, e, t, n, s, d) {
                    return t && t > 0 ? '<div class=\"jqx_grid_td\"><a target=\"_blank\" href=\"/final/user.action?uid=' + t + '\"><span class=\"avatar\"><span class=\"avatar_masker\" ucard=\"uid=' + t + '\"></span><img src=\"' + d.ownerIcon + '\"></span><span class=\"name\">' + $.htmlEncode(d.ownerName) + '</span></a></div>' : '';
                }, 'product.url': function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><span class=\"avatar\"><span class=\"avatar_masker\"></span><img src=\"' + t + '\"></span></div>' : '';
                }, 'orderProduct.comment': function (a, e, t, n, s, d, c, r, i) {
                    return t ? '<div class=\"jqx_grid_td\" title=\"' + $.htmlEncode(t) + '\" >' + $.htmlEncode(t) + '</div>' : '';
                }, 'orderProduct.discount': function (a, e, t, n, s, d, c, r) {
                    return t ? '<div class=\"jqx_grid_td\">' + $.formatNumber($.htmlEncode(100 * t), r, !0) + '%</div>' : '';
                }, 'orderProduct.quantity': function (a, e, t, n, s, d, c, r) {
                    return $.isNumeric(t) ? '<div class=\"jqx_grid_td\">' + $.formatNumber($.htmlEncode(t), r, !0) + '</div>' : '<div class=\"jqx_grid_td\"></div>';
                }
            }
        },
        opportunityproduct: {
            cellsRender: {
                'product.productName': function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"/product_detail.action?id=' + d['product.id'] + '\" target=\"_blank\">' + $.htmlEncode(t) + '</a></div>' : '';
                }, 'opportunityProduct.id': function (a, e, t, n, s, d) {
                    return '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"product_delete\" oppProductId=\"' + d['opportunityProduct.id'] + '\">删除</a></div>';
                }, 'opportunityProduct.discount': function (a, e, t, n, s, d, c, r) {
                    return t ? '<div class=\"jqx_grid_td\">' + $.formatNumber($.htmlEncode(100 * t), r, !0) + '%</div>' : '';
                }, 'opportunityProduct.amount': function (a, e, t, n, s, d, c, r) {
                    return $.isNumeric(t) ? '<div class=\"jqx_grid_td\">' + $.formatNumber($.htmlEncode(t), r, !0) + '</div>' : '<div class=\"jqx_grid_td\"></div>';
                }
            }
        },
        customize: {
            itemsUrl: '/json/crm_customize/listNew.action?belongId=',
            searchUrl: '/json/crm_customize/search.action?belongId=',
            dataRoot: 'data>entityDatas',
            dataKeywords: 'entityDatas',
            dataFields: ['id', 'belongId', 'entityTypeName', 'entityTypeId', 'ownerIcon', 'ownerName', 'updatedByIcon', 'updatedByName', 'recentActivityCreatedByIcon', 'recentActivityCreatedByName', 'createdByIcon', 'createdByName', 'dataindex', 'recentActivityRecordId', 'recentActivityRecordType', 'wanXueBusinessUserName', 'users'],
            cellsRender: {
                id: function (a, e, t, n, s, d) {
                    var c = d.hasOppListPermission ? '<a class=\"has_opp\" customerid=\"' + d.id + '\" oppcount=\"' + Number(d.opportunityCount) + '\"></a>' : '<span class=\"has_opp_column\"></span>';
                    return t && Number(d.opportunityCount) ? '<div class=\"jqx_grid_td\">' + c + '</div>' : '<div class=\"jqx_grid_td\"></div>';
                }, name: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" name=\"mainColumn\" class=\"entry_name\" belongId=\"' + d.belongId + '\" businessId=\"' + d.id + '\" business=\"customize\"><span class=\"name\">' + $.htmlEncode(t) + '</span></a></div>' : '<div class=\"jqx_grid_td\"></div>';
                }, entityType: function (a, e, t, n, s, d, c, r) {
                    return t ? '<div class=\"jqx_grid_td\">' + $.htmlEncode(d.entityType) + '</div>' : '<div class=\"jqx_grid_td\"></div>';
                }, multiRelation: function (a, e, t, n, s, d) {
                    var c = [];
                    if (t)if ($.isArray(t))$.each(t, function (a, e) {
                        var t = e.id, n = e.name;
                        c.push('<a class=\"entry_name\"  href=\"javascript:;\" business=\"customize\" belongId=\"' + e.relationBelongId + '\" businessId=\"' + t + '\"><span class=\"name\">' + $.htmlEncode(n) + '&nbsp;&nbsp;</span></a>');
                    }); else {
                        var r = t.id, i = t.name;
                        c.push('<a class=\"entry_name\"  href=\"javascript:;\" business=\"customize\" belongId=\"' + t.relationBelongId + '\" businessId=\"' + r + '\"><span class=\"name\">' + $.htmlEncode(i) + '&nbsp;&nbsp;</span></a>');
                    }
                    return '<div class=\"jqx_grid_td\" >' + c.join('') + '</div>';
                }, businessUser: function (a, e, t, n, s, d) {
                    var c = [];
                    if (t) {
                        var r = t.split(',');
                        $.each(r, function (a, e) {
                            var t = d.users[e].id, n = d.users[e].name;
                            c.push('<a class=\"entry_name\"  href=\"/final/user.action?uid=' + t + '\" target=\"_blank\"><span class=\"name\">' + $.htmlEncode(n) + '&nbsp;&nbsp;</span></a>');
                        });
                    }
                    return '<div class=\"jqx_grid_td\" >' + c.join('') + '</div>';
                }, use_condition: function (a, e, t, n, s, d) {
                    return t && (t = JSON.parse(t), $.isArray(t.departs) && t.departs[0] && $.isArray(t.departs[0].value) && (t = t.departs[0].value.map(function (a) {
                        return a.label;
                    }).join(','))), '<div class=\"jqx_grid_td\" >' + t + '</div>';
                }
            }
        },
        agent: {
            itemsUrl: '/json/crm_agent/listNew.action',
            searchUrl: '/json/crm_agent/search.action',
            appName: 'agent',
            belongId: 66,
            dataRoot: 'data>agents',
            dataKeywords: 'agents',
            dataFields: ['id', 'ownerIcon', 'ownerName', 'updatedByIcon', 'updatedByName', 'recentActivityCreatedByIcon', 'recentActivityCreatedByName', 'createdByIcon', 'createdByName', 'dataindex', 'opportunityCount', 'hasOppListPermission', 'recentActivityRecordId', 'recentActivityRecordType', 'parentAccountName', 'parentAccountId'],
            cellRender: {
                accountName: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_customer_name\" customerid=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(t) + '</span></a></div>' : '';
                }
            }
        },
        terminal: {
            itemsUrl: '/json/crm_terminal/listNew.action',
            searchUrl: '/json/crm_terminal/search.action',
            appName: 'terminal',
            belongId: 67,
            dataRoot: 'data>terminals',
            dataKeywords: 'terminals',
            dataFields: ['id', 'ownerIcon', 'ownerName', 'updatedByIcon', 'updatedByName', 'recentActivityCreatedByIcon', 'recentActivityCreatedByName', 'createdByIcon', 'createdByName', 'dataindex', 'opportunityCount', 'hasOppListPermission', 'recentActivityRecordId', 'recentActivityRecordType', 'parentAccountName', 'parentAccountId'],
            cellRender: {
                accountName: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\"><a href=\"javascript:;\" class=\"entry_name js_customer_name\" customerid=\"' + d.id + '\"><span class=\"name\">' + $.htmlEncode(t) + '</span></a></div>' : '';
                }
            }
        },
        schedule: {
            itemsUrl: '/json/crm_schedule/listNew.action',
            searchUrl: '/json/crm_schedule/search.action',
            appName: 'schedule',
            belongId: 31,
            dataRoot: 'data>schedules',
            dataKeywords: 'schedules',
            dataFields: ['id', 'name', 'description', 'startDate', 'createdBy', 'createdByIcon', 'createdByName', 'typeName'],
            cellRender: {
                type: function (a, e, t, n, s, d) {
                    return t ? '<div class=\"jqx_grid_td\">' + $.htmlEncode(d.typeName) + '</div>' : '';
                }
            }
        }
    };
    module.exports = {
        gridParams: function (a) {
            var e = s[a] && s[a] || {};
            return e.cellsRender = $.extend({}, n, e.cellsRender), 'order' != a && 'contract' != a || (e.cellsRender.amount = null), e.appName = a, e;
        }, gridParamsByBelongId: function (a) {
            var e = {};
            return $.each(s, function (t, n) {
                n.belongId == a && (e = n, e.appName = t);
            }), e && (e.cellsRender = $.extend({}, n, e.cellsRender), 'order' != e.appName && 'contract' != e.appName || (e.cellsRender.amount = null)), e;
        }
    };
})
define("crm/js/core/grid/grid.js", ["core/rkloader.js", "crm/js/core/grid/gridConfig.js", "crm/js/core/grid/fieldFilterPop.js", "crm/js/core/grid/editorWidgets.js", "crm/js/core/grid/gridEditor.js", "crm/js/core/grid/tmpl/cascadeItem.tpl", "crm/js/core/grid/tmpl/gridFilterPop.tpl", "crm/js/core/grid/tmpl/subgridPopup.tpl"], function (require, exports, module) {
    'use strict';
    var e = require('rk'), t = require('crm/js/core/grid/gridConfig');
    require('./fieldFilterPop'), require('./editorWidgets');
    var a = require('./gridEditor'), i = function (e) {
        if (!e)return {};
        var t, a, i = e.replace(/\?/, '').split('&'), r = {};
        for (a in i)'' !== i[a] && (t = i[a].split('='), r[decodeURIComponent(t[0])] = decodeURIComponent(t[1]));
        return r;
    }, r = {}, n = {
        1: {minwidth: 100, datatype: 'string', filtertype: 'custom', columntype: 'textbox'},
        2: {minwidth: 100, datatype: 'string', filtertype: 'custom', columntype: 'textbox'},
        3: {minwidth: 100, datatype: 'string', filtertype: 'custom', columntype: 'textbox'},
        4: {minwidth: 100, datatype: 'string', filtertype: 'custom', columntype: 'textbox'},
        5: {minwidth: 100, datatype: 'number', filtertype: 'custom', columntype: 'textbox'},
        6: {minwidth: 100, datatype: 'number', filtertype: 'custom', columntype: 'textbox'},
        7: {minwidth: 150, datatype: 'date', filtertype: 'custom', columntype: 'textbox'},
        9: {minwidth: 200, datatype: 'string', filtertype: 'custom', columntype: 'textbox'},
        10: {minwidth: 100, datatype: 'string', filtertype: 'custom', columntype: 'textbox'},
        11: {minwidth: 200, datatype: 'string', filtertype: 'custom', columntype: 'textbox'},
        26: {minwidth: 200, datatype: 'string', filtertype: 'custom', columntype: 'textbox'},
        27: {minwidth: 200, datatype: 'string', filtertype: 'custom', columntype: 'textbox'},
        22: {minwidth: 200, datatype: 'string', filtertype: 'custom', columntype: 'textbox'},
        23: {minwidth: 200, datatype: 'string', filtertype: 'custom', columntype: 'textbox'},
        24: {minwidth: 200, datatype: 'string', filtertype: 'custom', columntype: 'textbox'},
        29: {minwidth: 200, datatype: 'string', filtertype: 'custom', columntype: 'textbox'},
        30: {minwidth: 200, datatype: 'string', filtertype: 'custom', columntype: 'textbox'},
        99: {minwidth: 100, datatype: 'string', filtertype: 'custom', columntype: 'textbox'}
    };
    return n.accountId = n[1], n.accountStageId = n[3], n.createdBy = n[1], n.entityType = n[3], n.highSeaId = n[3], n.industryId = n[3], n.ownerId = n[1], n.sourceId = n[3], n.saleStageId = n[3], n.updatedBy = n[1], n.applicantId = n[1], n.campaignId = n[1], n.opportunityId = n[1], n.notPayment = n[6], n.payments = n[6], n.balance = n[6], n.amount = n[6], n.stage = n[1], n.expenseType = n[3], $.widget('rk.customerList', {
        options: {
            itemsUrl: null,
            searchUrl: null,
            dataFields: null,
            specialColumn: !1,
            dataRoot: '',
            dataKeywords: '',
            customData: null
        }, _dataStore: [], _create: function () {
            var e = this, a = e.element, i = e.options;
            e.mainElem = $('#div_main'), e.mainTopElem = e.mainElem.find('>div:first'), e.right = $('#div_main_right'), e.mainBottomElem = e.mainElem.find('>div:last'), e.rightBarElem = e.mainBottomElem.find('.rightsidetable'), e.mainTopHeight = e.mainTopElem.outerHeight(), e._spyWinResize(), $('#crm_toolbar').on('click', function () {
                try {
                    a.jqxGrid('closemenu');
                } catch (e) {
                }
            }), $('#pageleft').on('mouseenter', function () {
                try {
                    a.jqxGrid('closemenu');
                } catch (e) {
                }
            }), $('#pagehead').on('mouseenter', function () {
                try {
                    a.jqxGrid('closemenu');
                } catch (e) {
                }
            }), i.appName && (i = $.extend(i, t.gridParams(i.appName)));
        }, _setOption: function (e, t) {
            var a = this, i = a.options;
            'customData' === e && (3 == i.belongId && 'kanban' == $('header span.hover').attr('type') ? (a.sourceAdapter && (a.sourceAdapter._source.data.customData = t), i.customData = t, $('#crm-panel').opportunityKanban()) : (a.sourceAdapter && (a.sourceAdapter._source.data.customData = t), '1' == SESSION.tenantType && 'order' == i.appName && (a.data = null), a._init(), i.modifyCustomData && i.modifyCustomData(t))), a._super(e, t);
        }, repositionHeaderElems: function () {
        }, _spyWinResize: function () {
            var e, t = this;
            t.element, t.options;
            $(window).on('resize', function (a) {
                clearTimeout(e), e = setTimeout(function () {
                    t._calHeight();
                }, 100);
            }).trigger('resize');
        }, _calHeight: function () {
            var e = this, t = e.element, a = e._getHeight(), i = e._getWidth();
            e.mainBottomElem.height(a), !e.bindingComplete || t.jqxGrid('width') == i && t.jqxGrid('height') == a || t.jqxGrid({
                width: i,
                height: a
            });
        }, _getWidth: function () {
            var e = this, t = e.options;
            return 'leadhighsea' == t.appName ? e.mainBottomElem.width() - (e.rightBarElem.is(':visible') ? e.rightBarElem.outerWidth() : 0) : e.mainBottomElem.width() - (e.rightBarElem.size() ? e.rightBarElem.outerWidth() : 0);
        }, _getHeight: function () {
            var e = this;
            return e.mainElem.height() - e.mainTopHeight;
        }, _init: function () {
            var t = this, a = t.element, r = t.options;
            if (t.data)a.jqxGrid('getInstance').dataview.pagenum = 0, t._dataStore = [], a.jqxGrid('getsortcolumn') && a.jqxGrid('removesort'), $('div.grid-no-entities').hide(), $('div.loading-mask').show(), a.jqxGrid('updatebounddata', 'data'); else {
                $('div.large-loading:first').find('span').html(e.i18n('CRM_CORE_FILTER_GRID_LOADING')), $('div.loading-mask').show();
                var n = r.itemsUrl;
                r.itemsUrlParam && (n += r.itemsUrlParam);
                var o = i(window.location.search);
                t.urlParameters = o;
                var d = i(n.split('?')[1]);
                o.fromBelongId && (o.viewRelationId = o.fromBelongId, o.position = 2, o.belongId = r.belongId);
                for (var l in d)delete o[l];
                $.getJSON(n, o).done(function (a) {
                    if (0 == a.status) {
                        if ($('div.loading-mask').hide(), $('div.large-loading:first').find('span').html(e.i18n('CRM_CORE_FILTER_DATA_LOADING')), r.listNewData = t.data = a.data, t.data.items = t.data.items.sort(function (e, a) {
                                return t._itemsSort(e, a);
                            }), t.data.directoryItem && t.data.items.splice(1, 0, t.data.directoryItem), r.nameToNameOnly && $.each(t.data.items, function (e, t) {
                                t.entryPropertyNameOnly = t.entryPropertyName;
                            }), t.permission = t.data.permission, !r.customData)if (void 0 != t.urlParameters.fromBelongId && void 0 != t.urlParameters.fromDataId && void 0 != t.urlParameters.fromItemId) {
                            r.editable = !1;
                            var i = {
                                favoriteId: 0,
                                conditions: [{
                                    item: t.urlParameters.fromItemId,
                                    type: '1',
                                    value: t.urlParameters.fromDataId
                                }]
                            };
                            (!Number(t.urlParameters.fromItemId) || t.urlParameters.fromItemId <= 0) && (i.conditions = [{}], i.accountId = t.urlParameters.fromDataId), r.customData = JSON.stringify(i);
                        } else t.data.views ? t.data.views.length > 0 ? $.each(t.data.views, function (e, t) {
                            if ('true' === t.isDefault) {
                                var a = {favoriteId: t.id, conditions: t.conditions};
                                t.expression && (a.expression = t.expression), r.customData = JSON.stringify(a);
                            }
                        }) : r.customData = JSON.stringify({conditions: []}) : 'leadhighsea' == r.appName ? r.customData = JSON.stringify({
                            leadHighSeaId: t.data.entity.highSeaId,
                            conditions: []
                        }) : r.customData = JSON.stringify({highSeaId: t.data.entity.highSeaId, conditions: []});
                        t._parseColumnsInfo(), t._showCustomerTable(), r.notRefreshToolbar || t._trigger('listNewDataGet', null, t.data);
                    } else 300001 === a.status && ($('div.loading-mask').hide(), $('#crm_grid_con').append('<div style=\"text-align: center;width: 100%;height: 100%;padding-top: 200px;font-size: 16px;\">' + e.i18n('CRM_CORE_NO_ACCESS_TO_VIEW') + '</div>'));
                }).fail(function (t, a, i) {
                    0 != t.status && e.noticeError(e.i18n('REQUEST_ERROR'));
                });
            }
        }, _parseColumnsInfo: function () {
            var t = this, i = t.element, o = t.options, d = t;
            t.oValues = {}, t.oValuesRevert = {}, t.oTypes = {}, t.oIds = {}, t.dataFields = $.merge($.map(o.dataFields, function (e) {
                return {name: e};
            }), $.map(t.data.items, function (a) {
                if (o.nameToNameOnly) {
                    if (a.entryPropertyName && a.entryPropertyName.indexOf('orderProduct.') >= 0 ? a.itemName = '[' + e.i18n('CRM_CORE_ORDER_PRODUCT') + ']' + a.itemName : a.entryPropertyName && a.entryPropertyName.indexOf('product.') >= 0 && (a.itemName = '[' + e.i18n('CRM_CORE_PRODUCT') + ']' + a.itemName), a.values) {
                        d.oValues[a.entryPropertyName] = a.values;
                        var i = {};
                        $.each($.values(a.values), function (e, t) {
                            i[t.name] = t.id;
                        }), d.oValuesRevert[a.entryPropertyName] = i;
                    }
                    return d.oTypes[a.entryPropertyName] = a.searchType, d.oIds[a.entryPropertyName] = a.id, {
                        name: a.entryPropertyName,
                        type: n[a.searchType].datatype,
                        map: a.values ? a.entryPropertyName + '_value' : a.entryPropertyName
                    };
                }
                if (a.values) {
                    t.oValues[a.entryPropertyNameOnly] = a.values;
                    var i = {}, r = a.entryPropertyNameOnly;
                    $.each($.values(a.values), function (e, a) {
                        'saleStageId' == r && 0 == t.data.entityTypeNotEnabled ? i[(t.data.stageTypeNames && t.data.stageTypeNames[a.id] && t.data.stageTypeNames[a.id].typeName) + '-' + a.name] = a.id : i[a.name] = a.id;
                    }), t.oValuesRevert[a.entryPropertyNameOnly] = i;
                }
                return t.oTypes[a.entryPropertyNameOnly] = a.searchType, 10 == a.itemTypeEntry && (t.oTypes[a.entryPropertyNameOnly + '_relationBelong'] = a.relationBelongId), t.oIds[a.entryPropertyNameOnly] = a.id, {
                    name: a.entryPropertyNameOnly,
                    type: n[a.searchType || '1'].datatype,
                    map: a.values && 'expenseType' != a.entryPropertyNameOnly ? a.entryPropertyNameOnly + '_value' : a.entryPropertyNameOnly
                };
            })), o.cellsRender && (r = $.extend(r, o.cellsRender));
            var l = [];
            (o.specialColumn && 'leadhighsea' !== o.appName || o.specialColumn && 'leadhighsea' == o.appName && '174' === t.data.gridViewCase) && (l = [{
                text: o.specialColumn.text,
                datafield: o.specialColumn.datafield,
                cellsrenderer: r[o.specialColumn.datafield],
                renderer: function () {
                    return o.specialColumn.render;
                },
                menu: !1,
                sortable: !1,
                width: o.specialColumn.width,
                pinned: !0,
                filterable: !1,
                cellclassname: 'jqx_td',
                editable: !1
            }]);
            var s = $.merge(l, $.map(t.data.items, function (d) {
                var l = d.entryPropertyNameOnly, s = d.searchType, c = n[l] || n[s] || n[1], u = t.oValues[l], p = '1' == d.canSort, m = 1 == d.quickSearchFlg || '1' == d.canSort;
                return (d.joinItemId || 26 == d.searchType) && (p = !1, 3 != s && 1 != s && (m = !1)), 29 != s && 30 != s || (m = !1), Number(d.viewItemId) > 0 || '1' == d.lockFlg || 0 != Number(d.viewItemId) && o.nameToNameOnly ? {
                    text: d.itemName,
                    datafield: l,
                    itemVal: u,
                    searchType: s,
                    dateMode: d.dateMode,
                    currencyFlg: d.currencyFlg,
                    relationBelongId: d.relationBelongId,
                    renderer: function (e, t, a) {
                        return '<div class=\"jqx_grid_header_td\">' + $.htmlEncode(e) + '</div>';
                    },
                    cellsrenderer: function (e, a, i, n, c, u) {
                        if (WANXUE && ('agentRecruitTrainerId' == l || 'agentRecruitApproverId' == l || 'approvalTargetId' == l || 'targetUserId' == l || 'agentTrainingTrainerId' == l || 'agentTrainingApproverId' == l || 'memberDevelopmentTrainerId' == l || 'memberDevelopmentApproverId' == l || 'lectureInvitedTrainerId' == l || 'lectureInvitedApproverId' == l || 'publicCourseTrainerId' == l || 'publicCourseApproverId' == l || 'professionalCourseTrainerId' == l || 'diamondCardConsultingTrainerId' == l || 'diamondCardConsultingApproverId' == l || 'wanXueTangTrainerId' == l || 'wanXueTangApproverId' == l || 'professionalAbilityTrainerId' == l || 'professionalAbilityApproverId' == l || 'internetProductsTrainerId' == l || 'internetProductsApproverId' == l))return r.businessUser(e, a, i, n, c, u);
                        var p = d.joinItemKey, m = d.joinItemId;
                        return !m || 'ownerId' != p && 'createdBy' != p && 'updatedBy' != p && 'signerId' != p ? r[l] ? 'leadhighsea' == o.appName ? r[l](e, a, i, n, c, u, '174' === t.data.gridViewCase) : 'highsea' == o.appName ? r[l](e, a, i, n, c, u, '104' === t.data.gridViewCase) : 'days' == l ? r[l](e, a, i, n, c, u, t.data.caseUnhandledUnit) : r[l](e, a, i, n, c, u, 1, d.resolution) : d.currencyFlg - 0 ? r.currency(e, a, i, n, c, u, '', t.data.currencyUnit ? t.data.currencyUnit : SESSION.currencyUnit, d.resolution) : 10 == s ? d.relationBelongId > 999 && 'agent' == d.entityKey && 'dbcRelation2' == d.entryPropertyName ? r.multiRelation(e, a, i, n, c, u) : (5 == d.relationBelongId && i && !i.belongId && (i = d.users[i], i.belongId = d.relationBelongId), r.relation(e, a, i, n, c, u, d.relationBelongId)) : 5 == s ? $.isNumeric(i) ? '<div class=\"jqx_grid_td\">' + $.htmlEncode(i) + '</div>' : '<div class=\"jqx_grid_td\"></div>' : 6 == s ? $.isNumeric(i) ? '<div class=\"jqx_grid_td\">' + $.formatNumber($.htmlEncode(i), d.resolution, !0) + '</div>' : '<div class=\"jqx_grid_td\"></div>' : 22 == s ? r.phoneField(e, a, i, n, c, u) : 23 == s ? r.emailField(e, a, i, n, c, u) : 24 == s ? r.linkField(e, a, i, n, c, u) : 29 == s ? r.imageField(e, a, i, n, c, u) : 30 == s ? r.voiceField(e, a, i, n, c, u) : i ? '<div class=\"jqx_grid_td\">' + (i instanceof Date ? Globalize.format(new Date(i - 0), 2 == d.dateMode ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd') : $.htmlEncode(i)) + '</div>' : '<div class=\"jqx_grid_td\"></div>' : r.showUser(e, a, i, n, c, u);
                    },
                    minwidth: c.minwidth,
                    width: void 0 == d.dispWidth || '' == d.dispWidth ? 'auto' : d.dispWidth,
                    filterable: !0,
                    menu: m,
                    sortable: p,
                    columntype: c.columntype,
                    filtertype: c.filtertype,
                    classname: 'jqx_grid_header_td',
                    cellclassname: 'jqx_td',
                    createfilterpanel: function (e, a) {
                        t._buildFilterPanel(a, e);
                    },
                    cellsformat: 'date' == c.datatype ? 'yyyy-MM-dd' : '',
                    pinned: 1 == d.lockFlg,
                    initeditor: function (r, n, l) {
                        l.hide();
                        var s = r, c = i.jqxGrid('getrowid', s), u = d.entryPropertyNameOnly, p = l.closest('div.jqx-grid-cell');
                        return 'account.state' == d.entryPropertyName || 'account.city' == d.entryPropertyName || 'account.region' == d.entryPropertyName || 'opportunity.saleStageId' == d.entryPropertyName || 'workflowStageName' == d.entryPropertyNameOnly || 'approvalStatus' == d.entryPropertyNameOnly || 'highSeaId' == d.entryPropertyNameOnly || 'applicantId' == d.entryPropertyNameOnly || 29 == d.searchType ? (i.jqxGrid('endcelledit', s, u, !0), void t._showEditTips($(p), '此字段不支持编辑')) : void('1' == d.readOnlyFlag ? (i.jqxGrid('endcelledit', s, u, !0), t._showEditTips($(p), '您没有权限编辑此字段')) : $.postJson('/json/crm_list/validate.action', {
                            dataId: c,
                            itemId: d.id,
                            belongId: d.belongId
                        }).done(function (n) {
                            if (0 == n.status) {
                                var m = $.parseJSON(n.data);
                                if (m.canEdit)if (m.hasCascade) {
                                    i.jqxGrid('endcelledit', s, u, !0);
                                    var g = function () {
                                        var a, i = $('#cascadeEdit'), n = {}, l = !0;
                                        if ($.each(i.find('select'), function (e, t) {
                                                var a = $(t).attr('name'), i = $(t).val();
                                                d.belongId < 999 && (a = '\'' + a.split('__')[0].split('.')[1] + '\''), n[a] = i, i || 1 != $(t).attr('mustEnterFlg') || ($(t).next().show(), l = !1);
                                            }), !l)return !1;
                                        var s = '';
                                        1 == d.belongId ? (s = 'account', a = {accountId: c}) : 3 == d.belongId ? (s = 'opportunity', a = {opportunityId: c}) : 15 == d.belongId ? (s = 'contract', a = {contractId: c}) : 35 == d.belongId ? (s = 'order', a = {orderId: c}) : d.belongId > 999 && (s = 'customize', a = {
                                            customizeId: c,
                                            belongId: d.belongId
                                        }), a.paramMap = n;
                                        var u = '/json/crm_' + s + '/update-all.action';
                                        return $.post(u, a, function (a) {
                                            if (0 == a.status) {
                                                var i = {value: 'true'};
                                                t._updateCellValue(o.appName, d, i, _, I, h, r, m.mustEnterFlg);
                                            } else e.noticeError('保存失败');
                                        }), !0;
                                    }, f = function (t, a) {
                                        e.i18n('CRM_CORE_PLEASE_SELECT');
                                        $.postJson('/json/crm_dependency/dependent-by-control.action?decorator=ajaxformat&confirm=true', {
                                            entityId: d.belongId,
                                            controlItemId: t,
                                            controlOptionCode: a
                                        }, function (e) {
                                            for (var t = 0; t < e.length; t++) {
                                                var a = e[t].itemId, i = (e[t].itemName.replace('.', '_'), e[t].itemLabel, e[t].dependentOptions), r = $('#cascadeEdit').find('select[itemId=' + a + ']'), n = '<option value=\"\">请选择</option>';
                                                if (i)for (var o = 0; o < i.length; o++)n += '<option value=\"' + i[o].optionCode + '\">' + i[o].optionName + '</option>';
                                                r.html(n);
                                            }
                                        });
                                    };
                                    $.widget('rk.relatedItemDialogCtrl', $.rk.oaDialogCtrl, {
                                        _init: function () {
                                            var e = this;
                                            e.getBtn('ok').on('click', $.proxy(e.okClicked, e)), e.getBtn('cancel').on('click', $.proxy(e.cancelClicked, e)), $('#cascadeEdit select').on('change', function () {
                                                $(this).next().hide();
                                                var e = $(this).attr('itemId'), t = $(this).val();
                                                f(e, t);
                                            });
                                        }, okClicked: function () {
                                            var e = this, t = (e.element, g());
                                            t && e.closeMe();
                                        }, cancelClicked: function () {
                                            var e = this;
                                            e.element;
                                            e.closeMe();
                                        }
                                    });
                                    var y = require('./tmpl/cascadeItem.tpl');
                                    e.dialog({
                                        title: '级联选择',
                                        html: e.templateText(y, {items: m.items}),
                                        footer: ['cancel', 'ok'],
                                        width: 400,
                                        success: function (e, t) {
                                            e.relatedItemDialogCtrl();
                                        }
                                    });
                                } else {
                                    var v = $('<div style=\"position:relative;\"></div>');
                                    l.replaceWith(v);
                                    var h;
                                    'parentAccountId' == d.entryPropertyNameOnly && (d.relationBelongId = 1), 'campaignId' == d.entryPropertyNameOnly && (d.relationBelongId = 6), 'opportunityId' == d.entryPropertyNameOnly && (d.relationBelongId = 3), 'contractId' == d.entryPropertyNameOnly && (d.relationBelongId = 15), 'industryId' == d.entryPropertyNameOnly || 'sourceId' == d.entryPropertyNameOnly ? h = $.rk.items.prototype.options.widgetsMap[d.entryPropertyNameOnly] : (h = $.rk.items.prototype.options.widgetsMap[d.searchType], h = $.isFunction(h) ? h(d) : h);
                                    var I, _ = i.jqxGrid('getrowid', r);
                                    $.each(t.searchData[o.dataKeywords], function (e, t) {
                                        t.id == _ && (I = t);
                                    });
                                    var x = i.jqxGrid('getcolumnproperty', d.entryPropertyNameOnly, 'width'), b = I[d.entryPropertyNameOnly];
                                    if ('relation' == h)'parentAccountId' == d.entryPropertyNameOnly ? b = {
                                        id: I.parentAccountId,
                                        key: I.parentAccountId,
                                        value: I.parentAccountId,
                                        label: I.parentAccountName
                                    } : 'campaignId' == d.entryPropertyNameOnly ? b = {
                                        id: I.campaignId,
                                        key: I.campaignId,
                                        value: I.campaignId,
                                        label: I.campaignName
                                    } : 'opportunityId' == d.entryPropertyNameOnly ? b = {
                                        id: I.opportunityId,
                                        key: I.opportunityId,
                                        value: I.opportunityId,
                                        label: I.opportunityName
                                    } : 'contractId' == d.entryPropertyNameOnly ? b = {
                                        id: I.contractId,
                                        key: I.contractId,
                                        value: I.contractId,
                                        label: I.contractId
                                    } : 'object' == typeof b ? b.label = b.name : b = {}; else if ('multiselect' == h) {
                                        for (var w = [], N = 0; N < b.length; N++)if ('' != b[N]) {
                                            var S = d.values[b[N]];
                                            w.push({label: S.name, value: S.id});
                                        }
                                        b = w;
                                    } else if ('singleselect' == h)b = {value: b}; else if ('singlepeopleselector' == h)'signerId' == d.entryPropertyNameOnly && (b = {
                                        id: I.signerId,
                                        key: I.signerId,
                                        value: I.signerId,
                                        label: I.signerName,
                                        icon: I.signerIcon
                                    }); else if ('multiAutocomplete' == h && 'products' == d.entryPropertyNameOnly) {
                                        for (var w = [], N = 0; N < b.length; N++) {
                                            var S = b[N];
                                            w.push({label: S.name, value: S.id});
                                        }
                                        b = w;
                                    }
                                    'dimDepart' == d.entryPropertyNameOnly && (b = {
                                        value: I.dimDepartValue,
                                        label: I[d.entryPropertyNameOnly]
                                    }), 'datapickerwidget' == h || 'datetimepicker' == h ? (v.css('padding-top', '4px'), v.css('padding-left', '3px')) : 'multiselect' == h || 'singleselect' == h ? v.css('padding-top', '2px') : 'relation' == h ? (v.css('padding-top', '2px'), v.css('padding-left', '3px')) : (v.css('padding-top', '2px'), v.css('padding-left', '-2px')), a[h](v, d, !0, {
                                        from: 'list',
                                        defaultValue: b,
                                        entityData: I,
                                        compWidth: x - 10,
                                        blur: function (e, a) {
                                            var i = t._getEditValue(h, a, d);
                                            t._updateCellValue(o.appName, d, i, _, I, h, r, m.mustEnterFlg);
                                        },
                                        close: function (e, a) {
                                            var i = t._getEditValue(h, a, d);
                                            t._updateCellValue(o.appName, d, i, _, I, h, r, m.mustEnterFlg);
                                        }
                                    });
                                } else i.jqxGrid('endcelledit', s, u, !0), t._showEditTips($(p), '您没有权限编辑此字段');
                            } else i.jqxGrid('endcelledit', s, u, !0), t._showEditTips($(p), '目前无法编辑此字段');
                        }).fail(function () {
                            i.jqxGrid('endcelledit', s, u, !0), t._showEditTips($(p), '目前无法编辑此字段');
                        }));
                    }
                } : void 0;
            })), c = o.hideNullColumn ? [] : [{
                text: '',
                datafield: 'set_null',
                cellsrenderer: r.set_null,
                renderer: function () {
                    return '<div class=\"jqx_grid_header_td\"></div>';
                },
                menu: !1,
                sortable: !1,
                minwidth: 70,
                width: 'auto',
                pinned: !1,
                filterable: !1,
                cellclassname: 'jqx_td',
                editable: !1
            }], u = $.merge(o.plusColumn ? [{
                text: o.plusColumn.text,
                datafield: o.plusColumn.datafield,
                cellsrenderer: r[o.plusColumn.datafield],
                renderer: function () {
                    return o.plusColumn.render;
                },
                menu: !1,
                sortable: !1,
                width: o.plusColumn.width,
                pinned: !1,
                filterable: !1,
                cellclassname: 'jqx_td',
                editable: !1
            }] : [], c);
            t.columns = $.merge(s, u);
            var p = o.searchUrl;
            o.searchUrlParam && (p += o.searchUrlParam), t.source = {
                id: 'id',
                type: 'post',
                datatype: 'json',
                datafields: t.dataFields,
                pagenum: 0,
                pagesize: Math.max(Number(t.data.customPageSize), 20),
                url: p,
                filter: function () {
                    $('div.loading-mask').show(), i.jqxGrid('getInstance').dataview.pagenum = 0, i.jqxGrid('updatebounddata', 'filter');
                },
                sort: function (e, a) {
                    $('div.loading-mask').show(), null == a ? (t.sourceAdapter._source.data.sortdatafield = null, t.sourceAdapter._source.data.sortorder = null, i.jqxGrid('updatebounddata', 'data')) : (t.sourceAdapter._source.data.sortdatafield = e, t.sourceAdapter._source.data.sortorder = a ? 'desc' == a ? 'desc' : 'asc' : 'desc', i.jqxGrid('updatebounddata', 'sort'));
                },
                data: 'order' == o.appName ? {
                    customData: o.customData,
                    orderType: o.order_type ? o.order_type : '',
                    fromPage: 'dhd'
                } : {customData: o.customData},
                root: o.dataRoot,
                formatdata: function (e) {
                    for (var a, i, r, n, o = $.parseJSON(e.customData), d = 0, l = {
                        1: 3,
                        2: 3,
                        3: 10,
                        4: 10,
                        5: 0,
                        6: 0,
                        7: 0
                    }, s = {
                        EQUAL: 1,
                        NOT_EQUAL: 2,
                        CONTAINS: 3,
                        LESS_THAN: 8,
                        LESS_THAN_OR_EQUAL: 9,
                        GREATER_THAN: 6,
                        GREATER_THAN_OR_EQUAL: 7
                    }; e[a = 'filterdatafield' + d];)i = 'filtercondition' + d, r = 'filtervalue' + d, n = 'filteroperator' + d, o.conditions.push({
                        item: t.oIds[e[a]],
                        type: l[t.oTypes[e[a]]] || s[e[i]] || 1,
                        value: t.oValues[e[a]] ? t.oValuesRevert[e[a]][e[r]] : e[r]
                    }), delete e[a], delete e[i], delete e[r], delete e[n], d++;
                    return delete e.filterscount, e.customData = JSON.stringify(o), $.query('fromBelongId') && (e.fromBelongId = $.query('fromBelongId')), $.query('fromDataId') && (e.fromDataId = $.query('fromDataId')), $.query('fromItemId') && (e.fromItemId = $.query('fromItemId')), e;
                },
                beforeprocessing: function (a) {
                    if (0 == a.status) {
                        var i = t.searchData = a.data;
                        t.source.totalrecords = i.dataCount, $('#crm_toolbar .grid_operate ul').find('a.edit').data('valuesData', i), o.dataBeforeProcessingSingle && o.dataBeforeProcessingSingle(i), $.each(i[o.dataKeywords], function (e, a) {
                            t.formatResultData(e, a, i);
                        });
                    } else $.msg(e.i18n('REQUEST_ERROR') + '\uFF01status:' + a.status);
                }
            }, t.sourceAdapter = new $.jqx.dataAdapter(t.source, {
                loadError: function (e, t, a) {
                }
            }), t.pagerrenderer = function () {
                var a = $('<div style=\'margin-left: 10px; width: 100%; height: 100%; text-align:right\'></div>'), r = $('<div id=\'grid-data-sum\' class=\'grid-data-sum\'></div>');
                r.appendTo(a);
                var n = i.jqxGrid('getdatainformation'), o = n.paginginformation, d = $('<div style=\'font-size: 11px; margin: 8px 10px;  float: right; color:#869cb3;\'></div>');
                if (d.text(e.i18n('CRM_CORE_FILTER_DATA_COUNT_1') + n.rowscount + e.i18n('CRM_CORE_FILTER_DATA_COUNT_2')), d.appendTo(a), o.pagescount > 0) {
                    var l = $('<div style=\'padding: 0px; float: right;\'><div style=\'width: 52px; height: 16px;\' class=\'pager_size_set ui-select-buttonset\'><select style=\'width:50px;\'><option value=\'20\'>20</option><option value=\'30\'>30</option><option value=\'50\'>50</option></select></div></div>');
                    l.appendTo(a), l.find('select').val(o.pagesize), l.find('select').selectmenu({
                        change: function (e, t) {
                            i.jqxGrid({pagesize: parseInt(t.item.value)}), $('div.loading-mask').show();
                        }, position: {at: 'left top-90', collision: 'fit'}
                    });
                    var s = $('<div style=\'padding: 0px; float: right;\'><div style=\'margin-left: 8px; width: 16px; height: 16px;\'></div></div>');
                    s.find('div').addClass('jqx-icon-arrow-right'), s.width(36), s.jqxButton(), s.appendTo(a);
                    var c = '<div style=\"float: right;\" class=\"pagerArea\"></div>';
                    a.append(c);
                    var u = t._getPager(), p = $('<a class=\"jqx-grid-pager-number jqx-rc-all\" tabindex=\"-1\" href=\"javascript:;\" data-page=\"1\">1</a>');
                    if (p.appendTo(a.find('div.pagerArea')), 1 == u[0] && u.shift(), u[u.length - 1] == o.pagescount && u.pop(), u[0] - 1 > 2) {
                        var m = $('<a class=\"jqx-grid-pager-number jqx-rc-all\" tabindex=\"-1\" href=\"javascript:;\" data-page=\"\">...</a>');
                        m.appendTo(a.find('div.pagerArea')), m.on('click', function () {
                            i.jqxGrid('gotopage', u[0]);
                        });
                    }
                    for (var g = 0; g < u.length; g++) {
                        var f = $('<a class=\"jqx-grid-pager-number jqx-rc-all\" tabindex=\"-1\" href=\"javascript:;\" data-page=\"' + u[g] + '\">' + u[g] + '</a>');
                        f.appendTo(a.find('div.pagerArea'));
                    }
                    if (u[u.length - 1] + 1 < o.pagescount) {
                        var y = $('<a class=\"jqx-grid-pager-number jqx-rc-all\" tabindex=\"-1\" href=\"javascript:;\" data-page=\"\">...</a>');
                        y.appendTo(a.find('div.pagerArea')), y.on('click', function () {
                            i.jqxGrid('gotopage', u[u.length - 1]);
                        });
                    }
                    if (o.pagescount > 1) {
                        var v = $('<a class=\"jqx-grid-pager-number jqx-rc-all\" tabindex=\"-1\" href=\"javascript:;\" data-page=\"\"></a>');
                        v.html(o.pagescount), v.attr('data-page', o.pagescount), v.appendTo(a.find('div.pagerArea'));
                    }
                    var h = $('<div style=\'padding: 0px; float: right;\'><div style=\'margin-left: 7px; width: 16px; height: 16px;\'></div></div>');
                    h.find('div').addClass('jqx-icon-arrow-left'), h.width(36), h.jqxButton(), h.appendTo(a);
                    s.click(function () {
                        i.jqxGrid('gotonextpage');
                    }), h.click(function () {
                        i.jqxGrid('gotoprevpage');
                    });
                    var I = o.pagenum + 1;
                    a.find('div.pagerArea').find('a[data-page=\"' + I + '\"]').addClass('jqx-fill-state-pressed'), a.find('div.pagerArea').delegate('a', 'click', function () {
                        '' != $(this).attr('data-page') && i.jqxGrid('gotopage', parseInt($(this).attr('data-page')) - 1);
                    });
                }
                return a;
            };
        }, formatResultData: function (e, t, a, i) {
            var r = this, n = r.options;
            n.dataBeforeProcessing && n.dataBeforeProcessing(e, t, a, r.data, r.oValues, r.oTypes, i), t.ownerId && a.users[t.ownerId] && (t.ownerIcon = a.users[t.ownerId].icon || DEFAULTS.USER_DEFAULT_ICON, t.ownerName = a.users[t.ownerId].name), t.createdBy && a.users[t.createdBy] && (t.createdByIcon = a.users[t.createdBy].icon || DEFAULTS.USER_DEFAULT_ICON, t.createdByName = a.users[t.createdBy].name), t.updatedBy && a.users[t.updatedBy] && (t.updatedByIcon = a.users[t.updatedBy].icon || DEFAULTS.USER_DEFAULT_ICON, t.updatedByName = a.users[t.updatedBy].name), t.recentActivityCreatedBy && a.users[t.recentActivityCreatedBy] && (t.recentActivityCreatedByIcon = a.users[t.recentActivityCreatedBy].icon || DEFAULTS.USER_DEFAULT_ICON, t.recentActivityCreatedByName = a.users[t.recentActivityCreatedBy].name), t.dimDepartValue = Number(t.dimDepart), t.dimDepart = t.dimDepart && a.departs && a.departs[t.dimDepart] && a.departs[t.dimDepart].name, t.dimArea = t.dimArea && a.dimensions && a.dimensions[t.dimArea] && a.dimensions[t.dimArea].name, t.dimProduct = t.dimProduct && a.dimensions && a.dimensions[t.dimProduct] && a.dimensions[t.dimProduct].name, t.dimIndustry = t.dimIndustry && a.dimensions && a.dimensions[t.dimIndustry] && a.dimensions[t.dimIndustry].name, t.dimBusiness = t.dimBusiness && a.dimensions && a.dimensions[t.dimBusiness] && a.dimensions[t.dimBusiness].name, t.recentActivityRecordType = t.recentActivityRecordType && a.activityRecordTypes && a.activityRecordTypes[t.recentActivityRecordType];
        }, _getPager: function () {
            for (var e = this, t = e.element, a = t.jqxGrid('getdatainformation'), i = a.paginginformation, r = i.pagescount, n = 5, o = 0, d = []; o < n;) {
                var l = 1 + o, s = i.pagenum / n, c = Math.floor(s);
                if (l += c * n, l > r)break;
                d.push(l), o++;
            }
            if (d.length < 5) {
                var u = d[0] - 1;
                if (u > 0)for (; u > 0 && !(d.length > 5);)d.unshift(u), u--;
            }
            return d;
        }, getItems: function () {
            var e = this;
            e.element, e.options;
            return e.columns;
        }, _showCustomerTable: function () {
            var t = this, a = t.element, i = t.options, r = (a.parent(), t._getWidth()), n = t._getHeight(), o = 111523;
            +SESSION.tenantId === o;
            $('div.loading-mask').show(), a.jqxGrid({
                width: r,
                height: n,
                columnsheight: 29,
                columnsmenuwidth: 35,
                groupindentwidth: 50,
                autoshowloadelement: !1,
                rowsheight: 40,
                source: t.sourceAdapter,
                columnsresize: !0,
                columnsautoresize: !1,
                columnsreorder: !i.noSetColumn,
                selectionmode: i.selectRowDisabled ? 'none' : 'checkbox',
                editable: !!i.editable && i.editable,
                editmode: 'dblclick',
                sortable: !i.sortDisabled,
                pageable: !i.pageDisabled,
                pagesize: i.pageDisabled ? 10000 : Math.max(Number(t.data.customPageSize), 20),
                pagerrenderer: t.pagerrenderer,
                pagerheight: 50,
                filterable: !i.filterDisabled,
                enablehover: !0,
                enableanimations: !1,
                enablebrowserselection: !0,
                pagesizeoptions: ['20', '30', '50'],
                statusbarheight: 20,
                showemptyrow: !1,
                altrows: !0,
                showsortmenuitems: !1,
                scrollbarsize: 8,
                virtualmode: !i.pageDisabled,
                rendergridrows: function (e) {
                    return e.data;
                },
                columns: t.columns,
                ready: function () {
                    t.repositionHeaderElems(), t.bindingComplete = !0, i.onReady && i.onReady(t.data, i.customData), t._trigger('onGridReady'), t._dataStore = [], a.jqxGrid('clearfilters', !1), a.jqxGrid('removesort'), t._trigger('showFilterTips', null, JSON.stringify(t._dataStore));
                },
                rendered: function () {
                    e.fireEvent('init:crmGrid'), t.repositionHeaderElems(), t._trigger('resizeToolbar'), a.find('[role=\"row\"]').addClass('jqx_grid_row'), i.pinnedRowCount && 3 == i.pinnedRowCount && ('leadhighsea' == i.appName && '174' !== t.data.gridViewCase ? a.find('[role=\"row\"]').addClass('pinned_row_two') : a.find('[role=\"row\"]').addClass('pinned_row_three')), i.pinnedRowCount && 1 == i.pinnedRowCount && a.find('[role=\"row\"]').addClass('pinned_row_one'), i.pinnedRowCount || (0 == i.pinnedRowCount ? a.find('[role=\"row\"]').addClass('pinned_row_none') : a.find('[role=\"row\"]').addClass('pinned_row_two')), a.find('div.jqx-grid-column-menubutton').parent().css('margin-left', '-25px'), e.crm.jqxEventForDetail(), a.find('div.jqx-grid-cell').on('mouseenter', function () {
                        var e = $(this).index() + 1;
                        $('div.jqx-grid-column-header:nth-child(' + e + ')').trigger('mouseenter');
                    }).on('mouseleave', function () {
                        var e = $(this).index() + 1;
                        $('div.jqx-grid-column-header:nth-child(' + e + ')').trigger('mouseleave');
                    }), i.appendBottom && i.appendBottom(t.data, t.searchData, i.customData), i.detailOpenIndex && setTimeout(function () {
                        a.find('div[role=\"gridcell\"]').removeClass('jqx-grid-cell-selected'), a.find('a.entry_name[businessid=\"' + i.detailOpenIndex + '\"]').closest('div[role=\"row\"]').find('div[role=\"gridcell\"]').addClass('jqx-grid-cell-selected');
                    }, 100);
                },
                columnmenuopening: function (e, r, n) {
                    i.noSetColumn ? 0 : 60;
                    setTimeout(function () {
                        e.height('auto'), e.find('li.filter').height('auto'), e.find('li.filter').width('auto'), e.find('div.filter').css('margin-left', 0);
                        var i = a.jqxGrid('getInstance'), n = $('#pageleft_fold').is(':visible') ? 70 : 230, o = parseInt(e.attr('handler-x'));
                        e.width() + o - 60 > i.width + n ? (e.css('left', o + 60 - e.width()), e.find('.crm-filter-thumbnail-arrow').css('left', e.width() - 58)) : (e.css('left', o - 60), e.find('.crm-filter-thumbnail-arrow').css('left', 62));
                        var d = t._findStoreData(r, t.data.items), l = t._findDataStoreData(d.id), s = $('div.crm-filter-thumbnail').fieldFilterPop('getSearchType');
                        if (7 == s) {
                            var c = function (e) {
                                for (var t = 0, a = e.length; t < a; t++)$(e[t]).find('.ui-datepicker-today .ui-state-active').removeClass('ui-state-active');
                            };
                            e.hide(), window.setTimeout(function () {
                                if (l) {
                                    if (l.filters && l.filters.value)if (2 == l.filters.value.length) {
                                        var t = l.filters.value[0], a = l.filters.value[1];
                                        t.data || c($('#start_date')), a.data || c($('#end_date'));
                                    } else c($('#start_date')), c($('#end_date'));
                                } else c(e);
                                e.show();
                            }, 1);
                        }
                        l ? $('.remove-filter').show() : $('.remove-filter').hide(), $('div.crm-filter-thumbnail').fieldFilterPop('setData', l ? l.filters : null);
                    }, 0);
                },
                columnmenuclosing: function (e, t, a) {
                },
                cellhover: function (e) {
                    i.editable && $(e).find('div.jqx_grid_td').addClass('jqx_grid_td_edit');
                }
            }), a.on('bindingcomplete', function (r) {
                var n = i.appName;
                if (e.fireEvent('data:crmGrid', a.attr('id'), n), t.repositionHeaderElems(), t._trigger('resizeToolbar'), i.appendBottom && i.appendBottom(t.data, t.searchData, i.customData), $('div.loading-mask').hide(), 0 == t._dataStore.length)try {
                    a.jqxGrid('clearfilters', !1);
                } catch (e) {
                }
                t._trigger('showFilterTips', null, JSON.stringify(t._dataStore));
                var o = a.jqxGrid('getdatainformation');
                0 == o.rowscount ? t._dataStore.length > 0 ? ($('.jqx-grid-content').hide(), $('div.grid-no-entities').find('a').show(), $('div.grid-no-entities').show()) : ($('.jqx-grid-content').hide(), $('div.grid-no-entities').find('a').hide(), $('div.grid-no-entities').show()) : ($('.jqx-grid-content').show(), $('div.grid-no-entities').hide()), (i.belongId || t.data.viewCase || t.data.gridViewCase) && !i.noSetColumn && setTimeout(function () {
                    t._addEditItemsBtn();
                }, 0);
                var d = a.jqxGrid('getInstance'), l = d.vScrollBar, s = d.hScrollBar;
                l.jqxScrollBar('_triggervaluechanged', !0), s.jqxScrollBar('_triggervaluechanged', !0), l.add(s).on('valueChanged', function (e) {
                    a.find('span.js-recent-act').filter(':data(\"ui-tooltip-open\")').trigger('mouseleave'), a.find('span').filter(':data(\"ucard\")').trigger('mouseleave'), $('div.ui-tooltip[role=\"tooltip\"]:visible').hide(), i.detailOpenIndex && setTimeout(function () {
                        a.find('div[role=\"gridcell\"]').removeClass('jqx-grid-cell-selected'), a.find('a.entry_name[businessid=\"' + i.detailOpenIndex + '\"]').closest('div[role=\"row\"]').find('div[role=\"gridcell\"]').addClass('jqx-grid-cell-selected');
                    }, 100);
                }), a.find('div.jqx-grid-cell').on('mouseenter', function () {
                    var e = $(this).index() + 1;
                    $('div.jqx-grid-column-header:nth-child(' + e + ')').trigger('mouseenter');
                }).on('mouseleave', function () {
                    var e = $(this).index() + 1;
                    $('div.jqx-grid-column-header:nth-child(' + e + ')').trigger('mouseleave');
                }), a.off('click', '.has_image').on('click', '.has_image', function () {
                    var e = $(this).find('ul.js-album-box');
                    e.find('li').size() && (e.album(), e.album('showLightBox', e, e.find('li:first')));
                }), a.off('click', '.item-player').on('click', '.item-player', function () {
                    var e = $(this), t = e.find('span.item-player-btn'), a = e.nextAll('audio'), i = a.get(0), r = 'item-btn-play', n = 'item-btn-pause';
                    t.hasClass(r) ? (t.removeClass(r).addClass(n), i.pause()) : (t.removeClass(n).addClass(r), i.play());
                });
            }), a.on('rowselect rowunselect', function (e) {
                var a = t.getSelectedData();
                a.length ? t._trigger('showGridOperations', null, {rowCount: a.length}) : t._trigger('hideGridOperations');
            }), a.on('sort', function (e) {
                $('div.loading-mask').show();
                var i = a.jqxGrid('getsortinformation');
                if (i.sortcolumn) {
                    var r = t._findStoreData(i.sortcolumn, t.data.items), n = {
                        field: r.itemName,
                        order: i.sortdirection.ascending ? 'A-Z' : 'Z-A'
                    };
                    t.sortStore = n, t._trigger('showSortTips', null, n);
                } else t._trigger('showSortTips', null, {});
            }), a.on('pagechanged pagesizechanged', function (e) {
                $('div.loading-mask').show(), a.jqxGrid('clearselection', !1, !1), t._trigger('hideGridOperations');
            });
            var d = '/json/crm_item_display/save-customize-column-width.action', l = '/json/crm_item_display/save-column-width.action';
            a.on('columnresized', function (r) {
                if (i.columnResizeDisabled)return !1;
                var n = r.args, o = l;
                i.appType && 'customize' == i.appType && (o = d);
                var s = n.datafield, c = n.newwidth, u = t._findStoreData(s, t.data.items);
                if (u && u.viewItemId) {
                    var p = {viewItemId: u.viewItemId, dispWidth: c};
                    $.postJson(o, p).done(function (e) {
                        0 == e.status;
                    }).fail(function (t, a, i) {
                        0 != t.status && e.noticeError(e.i18n('REQUEST_ERROR'));
                    }), a.jqxGrid('closemenu');
                }
            }), a.on('columnreordered', function (r) {
                if (a.jqxGrid('closemenu'), r.args.oldindex === r.args.newindex)return !1;
                if ('leadhighsea' == i.appName && '174' !== t.data.gridViewCase)return !1;
                if ('highsea' == i.appName && '104' !== t.data.gridViewCase)return !1;
                var n = a.jqxGrid('getstate'), o = [], d = 0;
                if ($.query('fromBelongId') && $.query('fromDataId') && $.query('widgetId')) {
                    var l = {
                        id: $.query('configId'),
                        tenantId: window.SESSION.tenantId,
                        entityId: $.query('fromBelongId'),
                        widgets: {}
                    };
                    $.each(n.columns, function (e, a) {
                        var i = t._findStoreData(e, t.data.items);
                        i && '' !== a.text && Number(i.viewItemId) && o.push({id: i.id, name: i.name, order: d++});
                    }), l.widgets[$.query('widgetId') + ''] = {attributes: {showItem: o}};
                    var s = '/json/crm_common_detail/user-config.action';
                    return void $.post(s, {config: JSON.stringify(l)}).done(function () {
                        $.msg(e.i18n('CRM_CORE_SAVE') + e.i18n('CRM_CORE_SUCCESS'), 1);
                        $('#div_main_content').customerList('option', 'customData');
                    });
                }
                $.each(n.columns, function (e, a) {
                    var i = t._findStoreData(e, t.data.items);
                    i && '' !== a.text && Number(i.viewItemId) && o.push({
                        itemId: i.id,
                        viewItemId: i.viewItemId,
                        order: d++
                    });
                });
                var c = i.belongId, u = t.data.viewCase ? t.data.viewCase : t.data.gridViewCase, p = 'customize' == i.appName ? 1 : 0, m = 0, g = 0, f = '/json/crm_item_display/save.action', y = {
                    viewCase: u,
                    belongId: c,
                    relationId: m || 0,
                    dataJson: JSON.stringify(o)
                };
                $.query('fromBelongId') ? (f = '/json/crm_item_display/save-my-view.action', y = {
                    relationId: $.query('fromBelongId') || 0,
                    belongId: c,
                    templateId: g || 0,
                    position: 2,
                    dataJson: JSON.stringify(o)
                }) : p && !Number(u) && (f = '/json/crm_item_display/save-my-view.action', y = {
                    relationId: m || 0,
                    belongId: c,
                    templateId: g || 0,
                    position: p || 1,
                    dataJson: JSON.stringify(o)
                }), $.post(f, y, null, 'json').done(function (e) {
                    0 == e.status && a.jqxGrid('savestate');
                });
            }), a.on('cellendedit', function (e) {
            }), $('div.grid-no-entities').find('a').on('click', function () {
                $('div.grid-no-entities').hide(), t.clearAllFilter(), t._trigger('showFilterTips', null, JSON.stringify(t._dataStore));
            });
        }, _showEditTips: function (e, t) {
            var a = this;
            a.element;
            e.attr('title', t), e.beTip({
                show: !0,
                closeDelay: !1,
                hideFix: !0,
                dir: 'top'
            }), e.trigger('mouseover'), setTimeout(function () {
                e.unTip(), setTimeout(function () {
                    e.removeAttr('title');
                }, 100);
            }, 2000);
        }, _getEditValue: function (e, t, a) {
            var i, r;
            if ('multiselect' == e) {
                for (var n = [], o = [], d = 0; d < t.value.length; d++)n.push(t.value[d].value), o.push(t.value[d].label);
                i = o.toString(), r = n.toString();
            } else if ('relation' == e)t.value && t.value.id ? (i = {
                id: t.value.id,
                key: t.value.key,
                name: t.value.name,
                relationBelongId: a.relationBelongId
            }, $.inArray(a.entryPropertyNameOnly, ['parentAccountId', 'campaignId', 'opportunityId', 'contractId']) != -1 && (i.label = t.value.label), r = t.value.id) : i = r = ''; else if ('singletreeselector' == e)null != t.value ? (i = t.value.label, r = t.value.value) : i = r = ''; else if ('singleselect' == e)i = t.value.value ? t.value.label : '', r = t.value.value ? t.value.value : ''; else if ('datetimepicker' == e || 'datepickerwidget' == e) {
                var l = +t.value;
                i = r = isNaN(l) ? '' : l;
            } else if ('singlepeopleselector' == e)t.value ? (t.value.id = t.value.value, t.value.key = t.value.value, i = t.value, r = t.value.id) : (i = null, r = ''); else if ('multiAutocomplete' == e) {
                for (var n = [], o = [], d = 0; d < t.value.length; d++) {
                    var s = {
                        id: t.value[d].value,
                        name: t.value[d].label,
                        label: t.value[d].label,
                        value: t.value[d].value
                    };
                    n.push(t.value[d].value), o.push(s);
                }
                i = o, r = n.toString();
            } else null == t.value ? i = r = '' : (i = t.value, r = t.value);
            return {value: i, param: r};
        }, _updateCellValue: function (t, a, i, r, n, o, d, l) {
            var s = this, c = s.element, u = s.options;
            if (!s.isUpdating || 1 != s.isUpdating) {
                if (l && (null == i.value || '' == i.value || 0 == i.value.length || ('datetimepicker' == o || 'datepickerwidget' == o) && isNaN(i.value)))return c.jqxGrid('endcelledit', d, a.entryPropertyNameOnly, !0), e.noticeError(a.itemName + '不能为空');
                'leadhighsea' == t && (t = 'lead'), 'highsea' == t && (t = 'account');
                var p = !1;
                if ($.each(s.searchData[u.dataKeywords], function (e, t) {
                        if (t.id == r)if ('multiselect' == o)t[a.entryPropertyNameOnly].toString() != i.param && (p = !0); else if ('relation' == o)$.inArray(a.entryPropertyNameOnly, ['parentAccountId', 'campaignId', 'opportunityId', 'contractId']) != -1 ? t[a.entryPropertyNameOnly] != (i.value.id ? i.value.id : '') && (p = !0) : 'object' == typeof t[a.entryPropertyNameOnly] ? t[a.entryPropertyNameOnly].id != i.value.id && (p = !0) : i.value.id && t[a.entryPropertyNameOnly] != i.value.id && (p = !0); else if ('singlepeopleselector' == o)t[a.entryPropertyNameOnly] != (i.value ? i.value.id : '') && (p = !0); else if ('singleselect' == o)t[a.entryPropertyNameOnly] != (i.param ? i.param : '') && (p = !0); else if ('multiAutocomplete' == o) {
                            var n = $.map(t[a.entryPropertyNameOnly], function (e) {
                                return e.id;
                            }), d = $.map(i.value, function (e) {
                                return e.id;
                            });
                            n.sort().toString() != d.sort().toString() && (p = !0);
                        } else(i.value || '' == i.value || null == i.value || isNaN(i.value)) && t[a.entryPropertyNameOnly] !== i.value && (p = !0);
                    }), !p)return void s._setEditValue(a, i, r, n, o, d);
                s.isUpdating = 1, $.postJson('/json/crm_' + t + '/update.action', {
                    belongTypeId: n.entityTypeId ? n.entityTypeId : void 0,
                    belongId: a.belongId > 999 ? a.belongId : void 0,
                    entityId: r,
                    itemId: a.id,
                    itemValue: i.param
                }).done(function (t) {
                    s.isUpdating = 0, 0 == t.status ? (s._setEditValue(a, i, r, n, o, d), e.noticeSuccess('保存成功')) : 300003 == t.status ? (c.jqxGrid('endcelledit', d, a.entryPropertyNameOnly, !0), e.noticeError(a.itemName + '重复')) : (c.jqxGrid('endcelledit', d, a.entryPropertyNameOnly, !0), e.noticeError('保存失败'));
                }).fail(function (t, i, r) {
                    s.isUpdating = 0, c.jqxGrid('endcelledit', d, a.entryPropertyNameOnly, !0), e.noticeError('保存失败');
                });
            }
        }, _setEditValue: function (e, t, a, i, r, n) {
            var o = this, d = o.element, l = o.options;
            if ($.each(o.searchData[l.dataKeywords], function (i, n) {
                    n.id == a && (n[e.entryPropertyNameOnly] = t.value, 'multiselect' == r && (n[e.entryPropertyNameOnly] = t.param.split(',')), 'parentAccountId' == e.entryPropertyNameOnly && (n.parentAccountId = t.value.id, n.parentAccountName = t.value.label), 'campaignId' == e.entryPropertyNameOnly && (n.campaignId = t.value.id, n.campaignName = t.value.label), 'opportunityId' == e.entryPropertyNameOnly && (n.opportunityId = t.value.id, n.opportunityName = t.value.label), 'contractId' == e.entryPropertyNameOnly && (n.contractId = t.value.id, n.contractName = t.value.label), 'signerId' == e.entryPropertyNameOnly && (t.value ? (n.signerId = t.value.id, n.signerName = t.value.name, n.signerIcon = t.value.icon) : n.signerId = n.signerName = n.signerIcon = ''));
                }), d.jqxGrid('updatebounddata'), d.jqxGrid('endcelledit', n, e.entryPropertyNameOnly, !0), 'parentAccountId' == e.entryPropertyNameOnly) {
                var s = {value: t.value.label, accountId: t.value.id};
                d.jqxGrid('setcellvaluebyid', a, 'parentAccountId', s);
            } else if ('campaignId' == e.entryPropertyNameOnly) {
                var c = {campaignName: t.value.label, campaignId: t.value.id};
                d.jqxGrid('setcellvaluebyid', a, 'campaignId', c);
            } else if ('opportunityId' == e.entryPropertyNameOnly) {
                var u = {id: t.value.id, name: t.value.name};
                d.jqxGrid('setcellvaluebyid', a, 'opportunityId', u);
            } else if ('contractId' == e.entryPropertyNameOnly) {
                var p = {id: t.value.id, name: t.value.name};
                d.jqxGrid('setcellvaluebyid', a, 'contractId', p);
            } else if ('signerId' == e.entryPropertyNameOnly) {
                var m = {
                    id: t.value ? t.value.id : '',
                    icon: t.value ? t.value.icon : '',
                    name: t.value ? t.value.name : ''
                };
                d.jqxGrid('setcellvaluebyid', a, 'signerId', m);
            } else d.jqxGrid('setcellvaluebyid', a, e.entryPropertyNameOnly, t.value);
        }, _addEditItemsBtn: function () {
            var t = this, a = t.element, r = t.options, n = $('#contentdiv_main_content');
            if (!n.find('a.edit_items').size())if (r.addEditItemsBtn)r.addEditItemsBtn(t.data, a.attr('id')); else {
                var o = t.data.viewCase ? t.data.viewCase : t.data.gridViewCase, d = i(window.location.search), l = d.fromBelongId, s = ' viewcase=\"' + o + '\"';
                if (l) {
                    var c = l, u = 2;
                    s = ' viewcase=\"0\"', s += ' relationid=\"' + c + '\"', s += ' position=\"' + u + '\"';
                }
                l && r.itemsUrl.indexOf('/crm_order/product-list') != -1 && (s = ' viewcase=\"225\"', s += ' position=3'), $('<a act=\"editVisibleItems\" belongid=\"' + r.belongId + '\"' + s + ' class=\"edit_items\" href=\"javascript:;\" title=\"' + e.i18n('CRM_CORE_EDIT_FIELD') + '\">...</a>').appendTo('#contentdiv_main_content').data('items', t.data.items);
            }
        }, getSelectedData: function () {
            var e = this.element;
            return $.map(e.jqxGrid('getselectedrowindexes'), function (t) {
                var a;
                return void 0 == t ? null : null != (a = e.jqxGrid('getrowid', t)) ? e.jqxGrid('getrowdatabyid', a) : null;
            });
        }, getSearchData: function () {
            var e = this;
            return e.searchData;
        }, getRowDataById: function (e) {
            var t = this.element;
            return t.jqxGrid('getrowdatabyid', e);
        }, getSelectedRowId: function () {
            var e = this.element, t = e.jqxGrid('getselectedrowindex'), a = e.jqxGrid('getrowid', t);
            return a;
        }, getCurrentState: function () {
            var e = this, t = e.element, a = e.options;
            return {
                appName: a.appName,
                sort: e.sortStore ? e.sortStore : null,
                customData: e.searchConditions ? e.searchConditions : a.customData,
                pageNum: t.jqxGrid('getdatainformation').paginginformation.pagenum,
                scrollPos: t.jqxGrid('scrollposition').top,
                dataStore: JSON.stringify(e._dataStore)
            };
        }, _buildFilterPanel: function (t, a) {
            var i = this, r = i.element, n = i.options, o = t.parent().parent().parent();
            o.css('background-color', '#FFF'), o.find('[type=\"separator\"]').remove();
            var d = require('./tmpl/gridFilterPop.tpl'), l = e.templateText(d);
            t.empty(), t.append(l);
            var s = i._findStoreData(a, i.data.items);
            o.css('width', 'auto'), o.css('height', 'auto'), t.parent().css('width', 'auto'), t.parent().css('height', 'auto');
            var c = null;
            if ('1' == SESSION.tenantType && 'order' == n.appName) {
                var u = $.parseJSON(n.customData), p = u.favoriteId ? u.favoriteId : 0;
                if (p) {
                    var m = i._findStoreDataById(p, i.data.views);
                    c = m.accountType;
                }
            }
            t.find('div.crm-filter-thumbnail').fieldFilterPop({
                filterItem: s,
                initData: i.data,
                storeData: null,
                orderAccountType: c,
                applyFilter: function (e, a) {
                    t.find('div.crm-filter-detail-footer').find('.pg-btn-blue').trigger('click');
                }
            }), ('1' !== s.canSort || s.joinItemId) && (t.find('.crm-filter-sort-list').remove(), t.find('.crm-filter-divider').remove()), t.find('.crm-filter-sort-list').find('li:first').click(function () {
                r.jqxGrid('sortby', a, 'asc'), r.jqxGrid('closemenu');
            }), t.find('.crm-filter-sort-list').find('li:last').click(function () {
                r.jqxGrid('sortby', a, 'desc'), r.jqxGrid('closemenu');
            }), t.find('div.crm-filter-detail-footer').find('.pg-btn-blue').click(function () {
                var n = t.find('div.crm-filter-thumbnail').fieldFilterPop('getData');
                if (n) {
                    var o = i._findDataStoreData(s.id);
                    if (i._filterDataChange(s.id, s.itemName, n), i._findDataStoreData(s.id)) {
                        i._changeSourceCustomData();
                        var d = new $.jqx.filter();
                        r.jqxGrid('addfilter', a, d), r.jqxGrid('applyfilters');
                    } else o && (i._changeSourceCustomData(), r.jqxGrid('removefilter', a));
                    r.jqxGrid('closemenu'), i._trigger('showFilterTips', null, JSON.stringify(i._dataStore));
                } else 5 == s.searchType || 6 == s.searchType ? e.noticeError(e.i18n('CRM_CORE_FILTER_INVALID_INPUT')) : 7 == s.searchType && e.noticeError(e.i18n('CRM_CORE_FILTER_INVALID_DATE'));
            }), t.find('div.crm-filter-detail-footer').find('.pg-btn-white').click(function () {
                r.jqxGrid('closemenu');
            }), t.find('.remove-filter').click(function () {
                i._removeStoreData(s.id), i._changeSourceCustomData(), r.jqxGrid('removefilter', a), r.jqxGrid('closemenu'), i._trigger('showFilterTips', null, JSON.stringify(i._dataStore)), $('div.grid-no-entities').hide();
            }), 10 == s.searchType && (1 == s.relationBelongId || 9 == s.relationBelongId || 10 == s.relationBelongId || 11 == s.relationBelongId || s.relationBelongId > 999) && (t.find('.pop-grid-link').show(), t.find('.pop-grid-link').off('click').on('click', function () {
                r.jqxGrid('closemenu'), $('body').gridPicker({
                    item: s, onConfirm: function (t) {
                        if (t.length > 0) {
                            var n = {type: 'eq', value: []};
                            $.each(t, function (e, t) {
                                n.value.push({data: t.id, show: 1 == s.relationBelongId ? t.accountName : t.name});
                            });
                            var o = i._findDataStoreData(s.id);
                            if (i._filterDataChange(s.id, s.itemName, n), i._findDataStoreData(s.id)) {
                                i._changeSourceCustomData();
                                var d = new $.jqx.filter();
                                r.jqxGrid('addfilter', a, d), r.jqxGrid('applyfilters');
                            } else o && (i._changeSourceCustomData(), r.jqxGrid('removefilter', a));
                            i._trigger('showFilterTips', null, JSON.stringify(i._dataStore)), $('body').popupGrid('destroy'), e.closeDialog();
                        } else $('body').popupGrid('destroy'), e.closeDialog();
                    }
                });
            }));
        }, _changeSourceCustomData: function () {
            var e = this, t = e.options, a = $.parseJSON(t.customData), i = e._convertSearchData();
            a.conditions = a.conditions.concat(i), e.sourceAdapter._source.data.customData = JSON.stringify(a), e.searchConditions = JSON.stringify(a);
        }, _findStoreData: function (e, t) {
            for (var a = null, i = 0; i < t.length; i++) {
                var r = t[i];
                r.entryPropertyNameOnly === e && (a = t[i]);
            }
            return a;
        }, _findStoreDataById: function (e, t) {
            for (var a = null, i = 0; i < t.length; i++) {
                var r = t[i];
                r.id === e && (a = t[i]);
            }
            return a;
        }, _findDataStoreData: function (e) {
            for (var t = this, a = null, i = 0; i < t._dataStore.length; i++) {
                var r = t._dataStore[i];
                r.id === e && (a = t._dataStore[i]);
            }
            return a;
        }, _removeStoreData: function (e) {
            for (var t = this, a = 0; a < t._dataStore.length; a++) {
                var i = t._dataStore[a];
                i.id === e && t._dataStore.splice(a, 1);
            }
        }, _updateStoreData: function (e, t, a) {
            for (var i = this, r = 0, n = 0; n < i._dataStore.length; n++) {
                var o = i._dataStore[n];
                o.id === e && (r = 1, i._dataStore[n].filters = {
                    type: a.type,
                    value: a.belongId ? a.s_value : a.value,
                    b_value: a.value,
                    entityType: !!a.belongId,
                    belongName: a.belongName
                });
            }
            0 === r && i._dataStore.push({
                field: t,
                id: e,
                filters: {
                    type: a.type,
                    value: a.belongId ? a.s_value : a.value,
                    b_value: a.value,
                    entityType: !!a.belongId,
                    belongName: a.belongName
                }
            });
        }, _filterDataChange: function (e, t, a) {
            var i = this;
            i.options;
            void 0 === a.value ? i._removeStoreData(e) : '' !== a.value ? i._updateStoreData(e, t, a) : i._removeStoreData(e);
        }, _convertSearchData: function () {
            var e = this, t = [];
            return $.each(e._dataStore, function (e, a) {
                var i = [], r = 0;
                switch (a.filters.type) {
                    case'in':
                        r = 3;
                        break;
                    case'eq':
                        r = 10;
                        break;
                    case'fromTo':
                        r = 12;
                }
                var n;
                a.filters.entityType ? n = a.filters.value : ($.each(a.filters.value, function (e, t) {
                    i.push(t.data);
                }), n = i.toString()), t.push({item: a.id, type: r, value: n});
            }), t;
        }, _itemsSort: function (e, t) {
            return e.dispOrder - t.dispOrder;
        }, clearAllFilter: function () {
            var e = this, t = e.element, a = e.options;
            e._dataStore = [], e.sourceAdapter._source.data.customData = a.customData, t.jqxGrid('clearfilters', !1), $('div.grid-no-entities').hide();
        }, clearFilter: function (e) {
            var t = this, a = (t.options, t.element), i = parseInt(e), r = t._findStoreDataById(i, t.data.items), n = r.entryPropertyNameOnly;
            t._removeStoreData(i), t._changeSourceCustomData(), a.jqxGrid('removefilter', n, !0), $('div.loading-mask').show(), $('div.grid-no-entities').hide();
        }, clearSort: function () {
            var e = this, t = e.element;
            t.jqxGrid('removesort');
        }, getSearchConditions: function () {
            var e = this, t = e.options;
            return e.searchConditions ? e.searchConditions : t.customData;
        }, closeSubGrid: function () {
            var e = this, t = (e.element, e.options, '#crmSubGridPopup');
            $('#div_main').off('mousedown.crmSubGridPopup'), $(t).off().remove();
        }, popupSubGrid: function (e) {
            var t = this, a = t.element, i = (t.options, a.attr('id'), '#crmSubGridPopup');
            return $('#div_main').append(require('./tmpl/subgridPopup.tpl')), t.adjustSubGridPosition(e), $('#div_main').off('mousedown.crmSubGridPopup').on('mousedown.crmSubGridPopup', function (a) {
                var i = $(a.target);
                i.is(e) || i.is('.crm-subgrid-popup') || i.closest('.crm-subgrid-popup').size() > 0 || t.closeSubGrid();
            }), {
                then: function (e) {
                    var a = function () {
                        t.adjustSubGridPopupWidth();
                    };
                    $.isFunction(e) && e(i, a);
                }
            };
        }, adjustSubGridPosition: function (e) {
            var t = this, a = t.element, i = (t.options, a.attr('id')), r = '#crmSubGridPopup', n = (a.find('#columntable' + i), e.closest('div[role=\"row\"]'), e.closest('div[role=\"gridcell\"]'), $(r));
            n.position({my: 'left top', at: 'right+10 top', of: e, collision: 'fit'});
        }, adjustSubGridPopupWidth: function () {
            var e = this, t = e.element, a = (e.options, t.attr('id'), '#crmSubGridPopup'), i = parseInt($(a).css('left')), r = $(window).width(), n = $(a + ' .table_header .product_table').width(), o = r - i - 60;
            o > n && (o = n), $(a).width(o), $(window).off('resize.rk-subgrid').on('resize.rk-subgrid', function () {
                e.adjustSubGridPopupWidth();
            });
        }, setcellvaluebyid: function (e, t, a) {
            var i = this, r = i.element, n = i.options;
            if (a) {
                if (a.id) {
                    if (a.value = a, i.searchData.relations) {
                        var o = a.relationBelongId + '_' + a.id;
                        i.searchData.relations[o] = a;
                    }
                    return void r.jqxGrid('setcellvaluebyid', e, t, a);
                }
                a.isObject && (a = '');
            }
            r.jqxGrid('setcellvaluebyid', e, t, a), $.each(i.searchData[n.dataKeywords], function (i, r) {
                r.id == e && (r[t] = a);
            });
        }, getCondition: function (e) {
            var t = this, a = t.element, i = a.jqxGrid('getInstance').dataview, r = t.source, n = t.getSearchData()[e], o = n && n.map(function (e) {
                    return e.id;
                }), d = r && $.extend({}, r.data) || {};
            return d.pagenum = i.pagenum, d.pagesize = i.pagesize, d.totalRecords = i.totalrecords, d.currentPageDataIds = o, d;
        }, saveSuccess: function (e, t) {
            var a = this, i = a.element, r = $.parseJSON(e), n = i.attr('id');
            $('#' + n).jqxGrid('addrow', r.id, r, 0), $('#' + n).customerList('formatResultData', 0, r, a.searchData, 1), $('#' + n).jqxGrid('endupdate'), a.addEditItemsBtn();
        }, setRelation: function (e, t) {
            var a = this;
            $.map(e, function (e) {
                var i = t + '_' + e.id;
                a.searchData.relations[i] = {id: e.id, name: e.value, relationBelongId: t};
            });
        }, reloadRow: function (e, t) {
            var a = this, i = a.element;
            if (i.jqxGrid('getrowdatabyid', e)) {
                var r = {1: 'account', 2: 'contact', 3: 'opportunity', 6: 'campaign', 15: 'contract', 35: 'order'};
                if (!r[t])return;
                var n = '/json/crm_' + r[t] + '/detail-tab.action?' + r[t] + 'Id=' + e;
                $.postJson(n).done(function (t) {
                    i.jqxGrid('updaterow', e, t.data.entity);
                }).fail(function (e) {
                });
            }
        }
    }), $;
})
define("crm/js/apps/crm/tmpl/export_button.tpl", [], "<!-- export --> {{if entityKeyword == 'account' || entityKeyword == 'customize' || entityKeyword == 'opportunity' || entityKeyword == 'contract' || entityKeyword == 'contact' || entityKeyword == 'order' || entityKeyword == 'activityrecord'}} <div class=\"grid-view-export create-entity-toolbar lfloat\"> <a style=\"display:none;\" id=\"export\" class=\"file-csv-ico dinline-block\" href=\"javascript:;\" > <i class=\"dinline-block lfloat\"></i>{{'EXPORT' | i18n}} </a> </div> {{/if}}")
define("crm/js/apps/crm/tmpl/export_dialog.tpl", [], "<div> <div class=\"pop_up_02 entity_export_info\"> <div class=\"pop_up_content\"> <div class=\"add_new_list clear\"> <form method=\"post\" tag=\"form\"> <div class=\"field clear\"> <div class=\"field_name\">{{ 'EXPORT_ENCODING_FORMAT' | i18n}}</div> <div class=\"field_content\"> <select id=\"encodingSelect\" name=\"encodeFormat\" style=\"margin-top: 7px; width: 200px; height: 30px;\"> <option value=\"gb18030\">GB18030 ({{'EXPORT_CHINESE_SIMPLE' | i18n}})</option> <option value=\"utf8\">UTF-8 ({{'EXPORT_MULTI_LANGUAGE' | i18n}})</option> </select> </div> </div> <div class=\"field clear\"> <div class=\"field_name\">{{'EXPORT_FILE_FORMAT' | i18n}}：</div> <div class=\"field_content\" style=\"margin-top: 7px;\">CSV</div> </div> </form> </div> </div> <div class=\"pop_up_bottom\"> <div class=\"pop_up_button\"> <a href=\"javascript:;\" id=\"list_export_btn\" class=\"green_button\" act=\"exp\">{{'EXPORT_EXPORT' | i18n}}</a> </div> </div> </div> <div class=\"pop_up_02 entity_async_export\" style=\"display:none\"> <div class=\"pop_up_content\"> <div> <img src=\"/static/img/async_export.gif\"> </div> <div> <span>{{'EXPORT_ASYNC_EXPORTING' | i18n}}</span> </div> </div> <div class=\"pop_up_bottom\"> <div class=\"pop_up_button\"> <a href=\"javascript:;\" id=\"export_btn_close\" class=\"green_button\">{{'EXPORT_CLOSE' | i18n}}</a> </div> </div> </div> </div>")
define("crm/js/apps/crm/crmToolbar.js", ["core/rkloader.js", "crm/js/apps/crm/tmpl/export_button.tpl", "crm/js/apps/crm/tmpl/export_dialog.tpl"], function (require, exports, module) {
    'use strict';
    var e = require('rk'), t = {
        account: 1,
        agent: 66,
        campaign: 6,
        case: 12,
        competitor: 10,
        expense: 63,
        expenseaccount: 64,
        lead: 11,
        leadhighsea: 102,
        partner: 9,
        payment: 69,
        paymentplan: 76,
        terminal: 67,
        contact: 2,
        contract: 15,
        opportunity: 3,
        order: 35,
        activityrecord: 111
    }, a = {
        1: 'account',
        6: 'campaign',
        12: 'case',
        10: 'competitor',
        63: 'expense',
        64: 'expenseaccount',
        11: 'lead',
        2: 'contact',
        15: 'contract',
        3: 'opportunity',
        35: 'order',
        111: 'activityrecord'
    };
    $.widget('rk.crmToolbar', {
        _create: function () {
            var e = this;
            e.element;
        }, _init: function () {
            var a = this, i = a.element, n = a.options;
            n.customTitle && n.customTitle(n.initData), n.viewCase = n.initData.viewCase ? n.initData.viewCase : n.initData.gridViewCase;
            var r = '';
            switch (n.entityKeyword) {
                case'account':
                case'agent':
                case'campaign':
                case'case':
                case'competitor':
                case'customize':
                case'expense':
                case'expenseaccount':
                case'highsea':
                case'lead':
                case'leadhighsea':
                case'partner':
                case'terminal':
                case'product':
                    r = n.initData.permission;
                    break;
                case'contact':
                case'contract':
                case'opportunity':
                case'order':
                case'activityrecord':
                case'payment':
                case'paymentplan':
                    r = n.initData.userFuncPerm;
            }
            var o = {
                listData: n.initData,
                menus: n.toolbarMenuData,
                permission: r,
                EntityConfig: {businessName: n.entityName, keywords: SESSION.keywords},
                pcCode: SESSION.pcCode,
                wanxue: !!WANXUE,
                belongId: n.belongId ? n.belongId : t[n.entityKeyword]
            };
            a.data = o;
            var s = e.templateText(n.toolbarTpl, o);
            if ($('#crm_toolbar').append(s), a._initRightBtns(), a._initExportBtns(), i.find('[act=\"closeGridOperate\"]').click(function () {
                    $('.grid_operate').hide('slide');
                }), void 0 === n.initData.fromObject)n.initData.views && n.initData.views.length > 0 || 'customize' == n.entityKeyword ? i.find('#div_grid_filter').crmSmartview(n) : $('.grid_view').hasClass('js-navigation') || ($('.grid_view').find('div.view_class').html(e.i18n('SCRPT_TMPL_CONTAINER_CONTENT_COMPETITOR_1') + n.entityName), $('.grid_view').find('div.view_class').css('background', 'none'), $('.grid_view').find('div.view_class').show(), $('#div_grid_filter').remove(), $('#quickSave').remove()); else {
                $('.grid_view').hasClass('js-navigation') || ($('.grid_view').find('div.view_class').html(n.entityName), $('.grid_view').find('div.view_class').css('background', 'none'), $('.grid_view').find('div.view_class').show(), $('#div_grid_filter').remove(), $('#quickSave').remove());
                var l = SESSION.keywords[n.initData.fromObject.actionName] || n.initData.fromObject.belongLabel, d = n.initData.fromObject.belongId > 999 ? '&belongId=' + n.initData.fromObject.belongId : '', c = ['/', n.initData.fromObject.actionName, '_detail.action?id=', n.initData.fromObject.id, d].join('');
                e.setTitle([l, {title: e.htmlEscape(n.initData.fromObject.name), href: c}]);
            }
            if (i.find('.grid-view-filterresult').delegate('.filter_tip', 'click', function (e) {
                    var t = $(this), i = t.attr('filter-datafield');
                    a._trigger('clearFilter', null, i), t.unTip(), t.remove(), a.filterTipArrowAdded();
                }), i.find('.grid-view-filterresult').delegate('.sort_tip', 'click', function (e) {
                    a._trigger('clearSort'), $('.sort_tip').hide(), a.filterTipArrowAdded();
                }), i.find('.grid-view-filterresult').delegate('a.grid-sort-right-arrow', 'click', function () {
                    var e = i.find('.grid-view-filterresult').find('.filter_tip').not('.filter_hidden').first();
                    if (i.find('.grid-view-filterresult').find('.filter_box').find('.filter_tip').not('.filter_hidden').size() > 1) {
                        var t = 0;
                        if (i.find('.grid-view-filterresult').find('.filter_box').find('.filter_tip').not('.filter_hidden').each(function () {
                                t += $(this).width() + 18;
                            }), t < i.find('.grid-view-filterresult').find('.filter_box').width())return;
                        var a = 0;
                        i.find('.grid-view-filterresult').find('.filter_box').find('.filter_hidden').each(function () {
                            a += $(this).width() + 18;
                        });
                        e.width() + 18;
                        e.addClass('filter_hidden'), e.hide();
                    }
                }), i.find('.grid-view-filterresult').delegate('a.grid-sort-left-arrow', 'click', function () {
                    var e = i.find('.grid-view-filterresult').find('.filter_hidden:last'), t = 0;
                    if (i.find('.grid-view-filterresult').find('.filter_box').find('.filter_hidden').each(function () {
                            t += $(this).width() + 18;
                        }), 0 != t) {
                        e.width() + 18;
                        e.removeClass('filter_hidden'), e.show();
                    }
                }), 'leadhighsea' === n.entityKeyword || 'highsea' === n.entityKeyword) {
                $('#div_main').find('>div:first').off('click.customerList', 'div.grid_tool a[act=\"viewHistory\"]').on('click.customerList', 'div.grid_tool a[act=\"viewHistory\"]', function (t) {
                    var i = $(this), r = (i.attr('act'), $('#div_main').find('>div:first').find('div.js-navigation').find('span.js-status-name').attr('statusId'));
                    $.postJson('/json/crm_' + n.entityKeyword + '-log/members.action', {highSeaId: r}).done(function (t) {
                        if (0 == t.status) {
                            var i = t.data.members, o = '<div class=\"pop_up_02\"><div class=\"pop_up_content\"><div class=\"add_new_list clear\" style=\"margin-bottom: 0;margin-right: 0;\" ><div class=\"field clear\"><div class=\"field_content\"><input type=\"text\" class=\"text\" field=\"transferUser\"></div><div class=\"field clear js-historyDiv\" style=\"height:300px;width:100%;overflow-y: auto\"><div class=\"field_content\" ><ul class=\"all_operate_list clear nc_history_container\" ></ul></div></div></div></div></div><div class=\"pop_up_bottom\"><div class=\"pop_up_button\"><a  title=\"\" href=\"javascript:;\" class=\"green_button js-btnConfirm\" act=\"close\">' + e.i18n('CRM_CORE_CLOSE') + '</a></div></div></div>';
                            a.$dialog = $(o);
                            var s = a.$dialog.find('input[field=transferUser]').parent();
                            a.$level1Container = a.$dialog.find('.nc_history_container');
                            var l = a.$dialog.find('div.js-historyDiv');
                            a.$dialog.popup({
                                width: 520, title: e.i18n('HIGHSEA_14'), actions: {}, create: function () {
                                    function t(t) {
                                        var a = $.map(t.logs, function (a, i) {
                                            var n = a.operator == -1 ? ' ' + e.i18n('CRM_CORE_SYSTEM') + ' ' : ['<a class=\"avatar_masker all_operate_name\" ucard=\"uid=', a.operator, '\">', t.users[a.operator].name, '</a>'].join('');
                                            return '1' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_PICK_UP') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/lead.action?id=', a.leadId, ' >', a.leadName, '</a></div></li>'].join('') : '2' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_BACK_1') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/lead.action?id=', a.leadId, ' >', a.leadName, '</a><span>' + e.i18n('CRM_SPECIAL_BACK_2') + SESSION.keywords.leadhighsea + '</span></div></li>'].join('') : '3' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_BACK_1') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/lead.action?id=', a.leadId, ' >', a.leadName, '</a><span>' + e.i18n('CRM_SPECIAL_ASSIGN_2') + '</span><a class=\"avatar_masker all_operate_name\" ucard=\"uid=', a.target, '\">', t.users[a.target].name, '</a></div></li>'].join('') : '4' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_BACK_1') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/lead.action?id=', a.leadId, ' >', a.leadName, '</a><span>' + e.i18n('CRM_SPECIAL_TO_COMMON_2') + '</span></div></li>'].join('') : '5' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_BACK_1') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/lead.action?id=', a.leadId, ' >', a.leadName, '</a><span>' + e.i18n('CRM_SPECIAL_TO_HIGH_SEAS_2') + '</span></div></li>'].join('') : '6' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_DELETE') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/lead.action?id=', a.leadId, ' >', a.leadName, '</a><span></span></div></li>'].join('') : '7' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_BACK_1') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/lead.action?id=', a.leadId, ' >', a.leadName, '</a><span>' + e.i18n('CRM_SPECIAL_TRANSFER_TO_HIGH_SEAS_2') + '</span>', t.highSeas[a.target] && t.highSeas[a.target].name, '</div></li>'].join('') : '9' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_ABORT') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/lead.action?id=', a.leadId, ' >', a.leadName, '</a><span></span></div></li>'].join('') : '10' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_AUTO_GC') + SESSION.keywords.lead + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/lead.action?id=', a.leadId, ' >', a.leadName, '</a><span></span></div></li>'].join('') : '11' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_AUTO_FROZEN') + SESSION.keywords.lead + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/lead.action?id=', a.leadId, ' >', a.leadName, '</a><span></span></div></li>'].join('') : '12' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_AUTO_UNFROZEN') + SESSION.keywords.lead + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/lead.action?id=', a.leadId, ' >', a.leadNameName, '</a><span></span></div></li>'].join('') : '13' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_UNFROZEN') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/lead.action?id=', a.leadId, ' >', a.leadName, '</a></div></li>'].join('') : void 0;
                                        }).join('');
                                        return a;
                                    }

                                    function o(t) {
                                        var a = $.map(t.logs, function (a, i) {
                                            var n = a.operator == -1 ? ' ' + e.i18n('CRM_CORE_SYSTEM') + ' ' : ['<a class=\"avatar_masker all_operate_name\" ucard=\"uid=', a.operator, '\">', t.users[a.operator].name, '</a>'].join('');
                                            return '1' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_PICK_UP') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/account.action?id=', a.accountId, ' >', a.accountName, '</a></div></li>'].join('') : '2' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_BACK_1') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/account.action?id=', a.accountId, ' >', a.accountName, '</a><span>' + e.i18n('CRM_SPECIAL_BACK_2') + SESSION.keywords.highsea + '</span></div></li>'].join('') : '3' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_BACK_1') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/account.action?id=', a.accountId, ' >', a.accountName, '</a><span>' + e.i18n('CRM_SPECIAL_ASSIGN_2') + '</span><a class=\"avatar_masker all_operate_name\" ucard=\"uid=', a.target, '\">', t.users[a.target].name, '</a></div></li>'].join('') : '4' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_BACK_1') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/account.action?id=', a.accountId, ' >', a.accountName, '</a><span>' + e.i18n('CRM_SPECIAL_TO_COMMON_2') + '</span></div></li>'].join('') : '5' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_BACK_1') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/account.action?id=', a.accountId, ' >', a.accountName, '</a><span>' + e.i18n('CRM_SPECIAL_TO_HIGH_SEAS_2') + '</span></div></li>'].join('') : '6' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_DELETE') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/account.action?id=', a.accountId, ' >', a.accountName, '</a><span></span></div></li>'].join('') : '7' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_BACK_1') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/account.action?id=', a.accountId, ' >', a.accountName, '</a><span>' + e.i18n('CRM_SPECIAL_TRANSFER_TO_HIGH_SEAS_2') + '</span>', t.highSeas[a.target] && t.highSeas[a.target].name, '</div></li>'].join('') : '9' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_ABORT') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/account.action?id=', a.accountId, ' >', a.accountName, '</a><span></span></div></li>'].join('') : '10' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_AUTO_GC') + SESSION.keywords.account + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/account.action?id=', a.accountId, ' >', a.accountName, '</a><span></span></div></li>'].join('') : '11' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_AUTO_FROZEN') + SESSION.keywords.account + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/account.action?id=', a.accountId, ' >', a.accountName, '</a><span></span></div></li>'].join('') : '12' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_AUTO_UNFROZEN') + SESSION.keywords.account + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/account.action?id=', a.accountId, ' >', a.accountName, '</a><span></span></div></li>'].join('') : '13' == a.type ? ['<li><div class=\"all_operate_text\"><span class=\"all_operate_time\">[', Globalize.format(new Date(a.createdAt - 0), 'yyyy-MM-dd'), ']</span>', n, e.i18n('CRM_SPECIAL_UNFROZEN') + '<a target=\"_blank\" class=\"all_operate_object\" href=/final/account.action?id=', a.accountId, ' >', a.accountName, '</a></div></li>'].join('') : void 0;
                                        }).join('');
                                        return a;
                                    }

                                    function d() {
                                        $.getJSON('/json/crm_' + n.entityKeyword + '-log/search.action', {
                                            highSeaId: r,
                                            operator: f
                                        }).done(function (i) {
                                            if (0 != i.status && $.msg(e.i18n('ERROR_SYSTEM')), 'leadhighsea' == n.entityKeyword)var r = t(i.data); else var r = o(i.data);
                                            a.$level1Container.html(r), a.$dialog.popup('refresh'), 'true' == i.data.hasMore && (a._canscroll = !0, a._pageNo = 1);
                                        });
                                    }

                                    var c = $('<div class=\"js-jqxwidgets\">').appendTo(s.empty()), p = [];
                                    $.each(i, function (e, t) {
                                        p.push(t);
                                    }), c.jqxDropDownList({
                                        selectedIndex: 0,
                                        source: p,
                                        displayMember: 'name',
                                        valueMember: 'id',
                                        placeHolder: e.i18n('LEADHIGHSEA_6'),
                                        enableBrowserBoundsDetection: !0,
                                        autoDropDownHeight: !0,
                                        width: 250,
                                        height: 30
                                    });
                                    var f = s.find('>div.js-jqxwidgets').jqxDropDownList('val');
                                    c.on('select', function (e) {
                                        var t = e.args, a = c.jqxDropDownList('getItem', t.index);
                                        null != a && (f = a.value, d());
                                    }), d(), l.scroll(function (i) {
                                        var s = $(this);
                                        a._canscroll && s[0].scrollTop + s.height() >= s[0].scrollHeight - 100 && (a._canscroll = !1, a.$scrollLoadingEle = $('<div class=\"list_loading\"><span>' + e.i18n('CRM_CORE_LOADING') + '</span></div>'), a.$scrollLoadingEle.appendTo(a.$level1Container), $.getJSON('/json/crm_' + n.entityKeyword + '-log/search.action?pagenum=' + a._pageNo, {
                                            highSeaId: r,
                                            operator: f
                                        }).done(function (i) {
                                            a.$scrollLoadingEle.remove(), 0 != i.status && $.msg(e.i18n('ERROR_SYSTEM')), 'leadhighsea' == n.entityKeyword ? $(t(i.data)).appendTo(a.$level1Container) : $(o(i.data)).appendTo(a.$level1Container), a._pageNo = a._pageNo + 1, a._canscroll = i.data.hasMore;
                                        }));
                                    });
                                }
                            });
                        } else $.msg(e.i18n('ERROR_SYSTEM'));
                    }).fail(function (t, a, i) {
                        $.msg(e.i18n('REQUEST_ERROR'));
                    });
                }), $('#div_main').on('click', 'div.js-breadcrumb', function (e) {
                    $('div.drop_div', this).show();
                }).on('mouseleave', 'div.js-breadcrumb', function (e) {
                    $('div.drop_div', this).hide();
                });
                var p, f = '<div class=\"drop_div_area highsea-drop-div\"><div class=\"drop_div\" style=\"display: none;z-index:3000;position: absolute; width: 150px;max-height: 500px;overflow: auto;\"><ul class=\"drop_list\">', u = 0, o = n.initData;
                u = o.entity.highSeaId || 0, 0 === Number(u) ? (p = e.i18n('HIGHSEA_16'), f += '<li href=\"javascript:;\" class=\"selected\" statusId=\"0\">' + e.i18n('HIGHSEA_16') + '</li>') : f += '<li href=\"javascript:;\" statusId=\"0\">' + e.i18n('HIGHSEA_16') + '</li>', $.each(o.highSeas, function (t, a) {
                    Number(u) == a.id ? (p = a.name, f += ['<li href=\"javascript:;\" class=\"selected\" statusId=\"', a.id, '\" title=\"', e.htmlEscape(a.name), '\"> ', e.htmlEscape(a.name), '</li>'].join('')) : f += ['<li href=\"javascript:;\" statusId=\"', a.id, '\" title=\"', e.htmlEscape(a.name), '\"> ', e.htmlEscape(a.name), '</li>'].join('');
                }), void 0 == p && (u = 0, p = e.i18n('HIGHSEA_16')), f += '</ul></div>';
                var m = '<div class=\"view_now js-breadcrumb\" ><span class=\"view_name js-status-name\" statusId=' + u + '>' + e.htmlEscape(p) + '</span><span class=\"arrow\"></span>' + f + '</div></div>';
                $('#div_main').find('div.js-navigation').find('div.js-breadcrumb').remove(), $('#div_main').find('div.js-navigation').append(m);
            }
        }, _initExportBtns: function () {
            var t = e.templateText(require('crm/js/apps/crm/tmpl/export_button.tpl'), this.options);
            $('.grid_tool').prepend(t);
            var a = $('#div_main_content'), i = a.customerList('option', 'appName'), n = a.customerList('option', 'belongId'), r = this.data.permission;
            r && void 0 != r.func && (r = r.func);
            var o = !1;
            n < 999 && r && void 0 != r[i] ? o = r[i].e : r && void 0 != r[n] && (o = r[n].e);
            var s = $('#export');
            1 == o && s.show(), s.click(function (t) {
                var a = $('#div_main_content'), r = a.data('rk-customerList').getCondition(), o = parseInt(a.data('rk-customerList').searchData.dataCount), s = a.customerList('option', 'order_type'), l = o > 2000, d = e.templateText(require('crm/js/apps/crm/tmpl/export_dialog.tpl'), {export_type: l}), c = $(d);
                c.popup({width: 520, title: e.i18n('EXPORT_EXPORT')}), l ? $('#list_export_btn').click(function () {
                    var t = e.templateText('/json/crm_{{app_name}}/export.action?belongId={{belong_id}}&encoding={{encoding}}&async=true&sortdatafield={{sort_field}}&sortorder={{sort_order}}&orderType={{order_type}}&customData=', {
                            app_name: i,
                            belong_id: n,
                            sort_field: r.sortdatafield,
                            sort_order: r.sortorder,
                            order_type: s,
                            encoding: $('#encodingSelect').val()
                        }) + encodeURI(r.customData);
                    $.postJson(t, {}, function (e) {
                        $('div.entity_export_info').hide(), $('div.entity_async_export').show();
                    });
                }) : $('#list_export_btn').click(function () {
                    var t = '/json/crm_{{app_name}}/export.action?belongId={{belong_id}}&encoding={{encoding}}&sortdatafield={{sort_field}}&sortorder={{sort_order}}&orderType={{order_type}}&customData=', a = e.templateText(t, {
                            app_name: i,
                            belong_id: n,
                            sort_field: r.sortdatafield,
                            sort_order: r.sortorder,
                            order_type: s,
                            encoding: $('#encodingSelect').val()
                        }) + encodeURI(r.customData);
                    c.popup('close'), window.open(a);
                }), $('#export_btn_close').click(function () {
                    c.popup('close');
                });
            });
        }, _initRightBtns: function () {
            var e = this, i = e.element, n = e.options;
            if (0 == i.find('.create-entity-btn').size())if (i.find('.js-slave-menu ul.menu-drop-list').find('li').size() > 0) {
                var r = i.find('.js-slave-menu ul.menu-drop-list').find('li').first().html();
                0 == i.find('.create-entity-toolbar').find('a.create-entity-more').prev().size() ? (i.find('.create-entity-toolbar').prepend(r), i.find('.create-entity-toolbar').find('a:first').addClass('create-entity-btn').addClass('lfloat')) : (i.find('.create-entity-toolbar').find('a.create-entity-more').before(r), i.find('.create-entity-toolbar').find('a.create-entity-more').prev().addClass('create-entity-btn').addClass('lfloat')), i.find('.js-slave-menu ul.menu-drop-list').find('li').first().remove(), 0 == i.find('.js-slave-menu ul.menu-drop-list').find('li').size() && (i.find('.create-entity-more').remove(), i.find('.js-slave-menu').remove(), i.find('.create-entity-btn').addClass('no-drop'));
            } else i.find('.create-entity-more').remove(), i.find('.js-slave-menu').remove(); else if (n.initData.fromObject) {
                var o = i.find('.create-entity-toolbar').children();
                $.map(o, function (e) {
                    var i = $(e);
                    if (i.is('.create-entity-btn')) {
                        i.addClass('no-drop'), i.attr('pos', n.initData.fromObject.belongId);
                        var r = n.belongId ? n.belongId : t[n.entityKeyword], o = {};
                        o.belongId = r, o.relationBelongId = n.initData.fromObject.belongId;
                        var s = a[o.relationBelongId] || 'relation';
                        return o[s + 'Id'] = n.initData.fromObject.id, o.relationId = n.initData.fromObject.id, void i.attr('postdata', JSON.stringify(o));
                    }
                    i.hide();
                });
            }
            0 == i.find('.js-slave-menu ul.menu-drop-list').find('li').size() && (i.find('.create-entity-more').remove(), i.find('.js-slave-menu').remove(), i.find('.create-entity-btn').addClass('no-drop')), i.find('a.create-entity-more').click(function () {
                i.find('div.js-slave-menu').is(':visible') ? (i.find('div.js-slave-menu').hide(), i.find('a.create-entity-more').removeClass('create-entity-more-down')) : (i.find('div.js-slave-menu').show(), i.find('a.create-entity-more').addClass('create-entity-more-down'), i.find('div.js-main-menu').hide());
            }), i.find('a.create-entity-btn').click(function () {
                i.find('div.js-slave-menu').hide();
            }), $(document).on('click.create-entity-toolbar', function (e) {
                $(e.target).closest($('div.create-entity-toolbar')).size() || (i.find('div.js-main-menu').hide(), i.find('div.js-slave-menu').hide(), i.find('a.create-entity-more').removeClass('create-entity-more-down'));
            });
        }, _filterDataMap: function (t) {
            var a = {
                in: function () {
                    var e = '';
                    return $.each(t.value, function (t, a) {
                        e += a.show + '\uFF0C';
                    }), e.slice(0, -1);
                }, 'not in': function () {
                    var a = '';
                    return $.each(t.value, function (e, t) {
                        a += t.show + '\uFF0C';
                    }), e.i18n('CRM_CORE_FILTER_EXCLUDE') + ' ' + a.slice(0, -1);
                }, 'not eq': function () {
                    var a = '';
                    return $.each(t.value, function (e, t) {
                        a += t.show + '\uFF0C';
                    }), e.i18n('CRM_CORE_FILTER_NOT_EQ') + ' ' + a.slice(0, -1);
                }, eq: function () {
                    var e = '', a = t.value;
                    return t.entityType ? e += t.belongName + ' - ' + t.value.objectName : ($.each(a, function (t, a) {
                        e += a.show + '\uFF0C';
                    }), e.slice(0, -1));
                }, fromTo: function () {
                    var a = '', i = t.value;
                    return i.length > 1 ? '' !== i[0].show && i[0].show.indexOf('-') !== -1 || '' !== i[1].show && i[1].show.indexOf('-') !== -1 ? ('' !== i[0].show && (a += '' !== i[1].show ? e.i18n('CRM_CORE_FILTER_FROM') + i[0].show : e.i18n('CRM_CORE_FILTER_FROM') + i[0].show + e.i18n('CRM_CORE_FILTER_BEGIN')), '' !== i[1].show && (a += '' !== i[0].show ? e.i18n('CRM_CORE_FILTER_TO') + i[1].show : e.i18n('CRM_CORE_FILTER_TO') + i[1].show + e.i18n('CRM_CORE_FILTER_END'))) : ('' !== i[0].show && (a += '' !== i[1].show ? e.i18n('CRM_CORE_FILTER_FROM') + i[0].show : e.i18n('CRM_CORE_FILTER_MORN_THAN') + i[0].show), '' !== i[1].show && (a += '' !== i[0].show ? e.i18n('CRM_CORE_FILTER_TO') + i[1].show : e.i18n('CRM_CORE_FILTER_LESS_THAN') + i[1].show)) : a = i[0].show, a;
                }
            };
            return a[t.type]();
        }, renderFilterTip: function (e) {
            var t = this, a = t.element, i = $.parseJSON(e);
            if (i.length > 0) {
                a.find('.filter_tip').unTip(), a.find('.grid-view-filterresult').find('.filter_tip').remove(), navigator.userAgent.toLowerCase().indexOf('safari') > 0 && navigator.userAgent.toLowerCase().indexOf('chrome') == -1 && a.find('.grid-view-filterresult').find('.filter_box').addClass('grid-flex-box-safari');
                for (var n = 0; n < i.length; n++) {
                    var r = $.htmlEncode(i[n].field), o = $.htmlEncode(t._filterDataMap(i[n].filters)), s = '<div class=\"grid-sort-filter-result grid-filter-result prelative lfloat dinline-block filter_tip\" filter-datafield=\"' + i[n].id + '\" title=\"' + $.htmlEncode(r) + '-' + $.htmlEncode(o) + '\"><span class=\"grid-sort-filter-truncate dinline-block ellipsis\"><span class=\"filter-title dinline-block lfloat\">' + r + '\uFF1A</span><span class=\"filter-content dinline-block lfloat ellipsis\">' + o + '</span></span><a href=\"javascript:;\" class=\"close lfloat dinline-flex\"><i class=\"dinline-block\"></i></a></div>';
                    a.find('.grid-view-filterresult').find('.filter_box').append(s);
                }
                a.find('.filter_tip').beTip({dir: 'top'});
            } else a.find('.filter_tip').unTip(), a.find('.grid-view-filterresult').find('.filter_tip').remove();
            t.filterTipArrowAdded();
        }, filterTipArrowAdded: function () {
            var e = this, t = e.element, a = '<a href=\"javascript:;\" class=\"filterresult-arrow grid-sort-left-arrow lfloat\"><i class=\"arrow-left\"></i></a>', i = '<a href=\"javascript:;\" class=\"filterresult-arrow grid-sort-right-arrow rfloat\"><i class=\"arrow-right\"></i></a>';
            t.find('.filterresult-arrow').remove();
            var n = $('.sort_tip').is(':visible') ? $('.sort_tip').width() + 20 : 0, r = $('#quickSave').size() ? $('#quickSave').width() : 0;
            t.find('.grid-view-filterresult').find('.filter_box').css('width', t.find('.grid-view-filterresult').width() - n - r - 100);
            var o = 0;
            t.find('.grid-view-filterresult').find('.filter_box').find('.filter_tip').each(function () {
                o += $(this).width() + 18;
            }), navigator.userAgent.toLowerCase().indexOf('safari') > 0 && navigator.userAgent.toLowerCase().indexOf('chrome') == -1 && (o += 6);
            var s = t.find('.grid-view-filterresult').width() - n;
            o > 0 && o > s && (t.find('.grid-view-filterresult').find('.filter_box').before(a), t.find('.grid-view-filterresult').find('.filter_box').after(i));
        }, renderSortTip: function (t) {
            var a = this, i = a.element, n = e.htmlEscape(t.field) + ' ' + t.order;
            i.find('.sort_tip .filter-content').html(n), 'A-Z' == t.order ? i.find('.sort_tip .filter-title').find('i').removeClass('asc-ico').removeClass('desc-ico').addClass('asc-ico') : i.find('.sort_tip .filter-title').find('i').removeClass('asc-ico').removeClass('desc-ico').addClass('desc-ico'), t.field ? i.find('.sort_tip').show() : i.find('.sort_tip').hide(), a.filterTipArrowAdded();
        }, showGridOperations: function (e) {
            var t = this, a = t.element, i = t.options;
            a.find('.grid_operate').find('li.first > span').html(e.rowCount), a.find('.grid_operate').show('slide');
            var n = i.initData.fromObject;
            if (n) {
                var r = 'case' == i.entityKeyword ? 'cas' : i.entityKeyword, o = t.data.permission[r] || t.data.permission[i.belongId] || t.data.permission.func[i.belongId] || t.data.permission.func[r], s = o.u;
                if (Number(s)) {
                    var e = $('#div_main_content').customerList('getSelectedData'), l = $('#div_main_content').customerList('getSearchData');
                    if (e.length > 1)return $('#crm_toolbar .grid_operate ul').find('a.edit').parent().remove(), !1;
                    if ('order' == i.entityKeyword) {
                        var d = e[0], c = d.status_select_item_id;
                        if (2 == c || 3 == c)return void $('#crm_toolbar .grid_operate ul').find('a.edit').parent().remove();
                    }
                    $('#crm_toolbar .grid_operate ul').find('a.edit').parent().remove();
                    var p = {};
                    p[i.entityKeyword + 'Id'] = e[0].id, p.belongId = i.belongId, p.relationId = n.id, p.relationBelongId = n.belongId, $('#crm_toolbar .grid_operate ul').find('a.edit').data('valuesData', l);
                }
            }
        }, hideGridOperations: function () {
            var e = this, t = e.element;
            e.options;
            t.find('.grid_operate').find('li.first > span').html(''), t.find('.grid_operate').hide('slide');
        }
    });
    var i = '', n = ['dimDepart', 'dimArea', 'dimIndustry', 'dimProduct', 'dimBusiness'];
    return $.widget('rk.crmSmartview', {
        options: {
            tabSelector: '>span.js-smartview-tab',
            panelSelector: '>div.js-smartview-panel',
            belongId: null,
            viewCase: 101
        },
        filterConditions: {
            text: [{name: e.i18n('REPORT_21'), value: '1'}, {
                name: e.i18n('REPORT_22'),
                value: '2'
            }, {name: e.i18n('REPORT_23'), value: '3'}, {
                name: e.i18n('REPORT_24'),
                value: '4'
            }, {name: e.i18n('REPORT_25'), value: '5'}],
            range: [{name: e.i18n('REPORT_21'), value: '1'}, {
                name: e.i18n('REPORT_22'),
                value: '2'
            }, {name: e.i18n('REPORT_26'), value: '6'}, {
                name: e.i18n('REPORT_27'),
                value: '7'
            }, {name: e.i18n('REPORT_28'), value: '8'}, {name: e.i18n('REPORT_29'), value: '9'}],
            select: [{name: e.i18n('REPORT_21'), value: '10'}, {name: e.i18n('REPORT_22'), value: '14'}]
        },
        dummyUrl: {
            createdBy: '/json/crm_search/u.action?s=m&pageNo=1',
            applicantId: '/json/crm_search/u.action?s=m&pageNo=1',
            participants: '/json/crm_search/u.action?s=m&pageNo=1',
            ownerId: '/json/crm_search/u.action?s=m&pageNo=1' + (100 == window.SESSION.pcCode ? '&focusmedia=1' : ''),
            updatedBy: '/json/crm_search/u.action?s=m&pageNo=1',
            memberId: '/json/crm_search/u.action?s=m&pageNo=1',
            signerId: '/json/crm_search/u.action?s=m&pageNo=1',
            accountId: '/json/crm_search/accounts.action?pageNo=1&accountTypes=1&s=fcbk',
            contractId: '/json/crm_search/fcbkSearch-contract.action?pageNo=1',
            parentAccountId: '/json/crm_search/accounts.action?pageNo=1&accountTypes=1&s=fcbk',
            product: '/json/crm_search/fcbk-product.action?pageNo=1',
            products: '/json/crm_search/fcbk-product.action?pageNo=1',
            campaignId: '/json/crm_search/fcbk-campaign.action?pageNo=1',
            dimDepart: '/json/crm_dimension/dim-tree.action?dimType=1',
            dimArea: '/json/crm_dimension/dim-tree.action?dimType=3',
            dimBusiness: '/json/crm_dimension/dim-tree.action?dimType=5',
            dimIndustry: '/json/crm_dimension/dim-tree.action?dimType=4',
            dimProduct: '/json/crm_dimension/dim-tree.action?dimType=2',
            opportunity: '/json/crm_search/opportunity.action?pageNo=1&s=fcbk',
            order: '/json/crm_search/order.action?pageNo=1&s=fcbk',
            orderId: '/json/crm_search/order.action?pageNo=1&s=fcbk',
            activityrecord: '/json/crm_search/activityrecord.action?pageNo=1&s=fcbk',
            customize: '/json/crm_search/customize.action?pageNo=1&s=fcbk',
            contract: '/json/oa_search/search-contract.action?pageNo=1&s=fcbk',
            contactId: '/json/oa_search/fcbk-contact.action?pageNo=1',
            expenseAccountId: '/json/oa_search/fcbk-expenseaccount.action?pageNo=1',
            targetUserId: '/json/crm_search/u.action?s=m&pageNo=1',
            approvalTargetId: '/json/crm_search/u.action?s=m&pageNo=1'
        },
        _belongIdUrl: {
            1: '/json/crm_search/accounts.action?pageNo=1&accountTypes=1&s=fcbk',
            2: '/json/oa_search/fcbk-contact.action?pageNo=1',
            3: '/json/crm_search/opportunity.action?pageNo=1&s=fcbk',
            4: '/json/crm_search/fcbk-product.action?pageNo=1',
            5: '/json/crm_search/u.action?s=m&pageNo=1',
            6: '/json/crm_search/fcbk-campaign.action?pageNo=1',
            9: '/json/crm_search/accounts.action?pageNo=1&accountTypes=2&s=fcbk',
            10: '/json/crm_search/accounts.action?pageNo=1&accountTypes=3&s=fcbk',
            15: '/json/oa_search/search-contract.action?pageNo=1&s=fcbk',
            11: '/json/oa_search/fcbk-lead.action?pageNo=1&s=fcbk',
            35: '/json/crm_search/order.action?pageNo=1&s=fcbk',
            50: '/json/crm_dimension/dim-tree.action?dimType=1',
            63: '/json/oa_search/fcbk-expenseaccount.action?pageNo=1',
            111: '/json/crm_search/activityrecord.action?pageNo=1&s=fcbk',
            120: '/json/crm_dimension/dim-tree.action?dimType=2',
            121: '/json/crm_dimension/dim-tree.action?dimType=3',
            122: '/json/crm_dimension/dim-tree.action?dimType=4',
            123: '/json/crm_dimension/dim-tree.action?dimType=5',
            999: '/json/crm_search/customize.action?pageNo=1&s=fcbk'
        },
        _create: function () {
            var t = this, a = t.element, n = t.options;
            t.$tab = a.find(n.tabSelector), t.$panel = a.find(n.panelSelector), t.$panelList = t.$panel.find('ul.js-smartview-panel'), t.$panelCustom = t.$panel.find('div.js-smartview-panel'), t.$panelEdit = t.$panel.find('div.js-smartview-edit');
            var r = $('#quickSave');
            t.$tab.on('click', function (e) {
                e.preventDefault(), t.$panel.toggle('fade', 'fast'), a.toggleClass('has_drop'), a.hasClass('has_drop') && r.removeAttr('data').removeAttr('action').hide();
            });
            var o = ['ui-autocomplete', 'facebook-auto', 'ui-selectmenu-optgroup', 'ui-menu-item'];
            if ($('body').on('click', function (e) {
                    if (!$.contains(a[0], e.target)) {
                        var i = $(e.target), n = !1;
                        if ($.each(o, function (e, t) {
                                (i.hasClass(t) || i.parents('.' + t).size() > 0) && (n = !0);
                            }), n)return;
                        t.close();
                    }
                }), t.$panel.simpleTabs({
                    active: -1,
                    className: 'selected',
                    tabContainer: 'div.view_select_bg',
                    tabsElement: '.view_level_1 li',
                    tabsHolder: '.view_level_1 a',
                    panelsElement: '.view_level_2>.js-smartview-panel',
                    tabsVisible: [],
                    activate: function (a, i, n) {
                        1 == a && (t.$panelEdit.hide(), t.$panelCustom.find('input.search_name').val(e.i18n('OLDCRM_CORE_COMMON_14')), 0 == t.$panelCustom.find('div.baobiao_form_li').size() && t.$panelCustom.find('a.more_link').trigger('click'));
                    },
                    create: null
                }), 'customize' == n.entityKeyword || 'account' == n.entityKeyword || 'opportunity' == n.entityKeyword || 'contract' == n.entityKeyword || 'contact' == n.entityKeyword || 'order' == n.entityKeyword) {
                var s = '<ul class=\"tip-dashboard\"><li><span>' + e.i18n('FORMULA_FORMAT_RULE') + '</span><div class=\"tipatt_green\">\uFF081 and 2\uFF09or\uFF083 and 4\uFF09<i></i></div></li><li><span>' + e.i18n('FORMULA_FORMAT_RULE_1') + '</span><div class=\"tipatt_red\">1and2and3and4<i></i></div></li><li><span>' + e.i18n('FORMULA_FORMAT_RULE_2') + '</span><div class=\"tipatt_red\">1 and 2 or 3 and 4<i></i></div></li><li><span>' + e.i18n('FORMULA_FORMAT_RULE_3') + '</span><div class=\"tipatt_red\">\uFF081 and 2 or 3\uFF09and 4<i></i></div></li><li><span>' + e.i18n('FORMULA_FORMAT_RULE_4') + '</span><div class=\"tipatt_red\">1 and 2 and 3 and 4 and 5<i></i></div></li><li><span>' + e.i18n('FORMULA_FORMAT_RULE_5') + '</span><div class=\"tipatt_red\">\uFF081 and 2 or 3 and 4<i></i></div></li></ul> ';
                t.$panelCustom.find('span.formula_tip').qtip({
                    content: s,
                    style: {classes: 'qtip-light'},
                    position: {my: 'bottom left', at: 'top right', adjust: {x: 0, y: 0}}
                }), t.$panelCustom.off('click', 'input#useFormula').on('click', 'input#useFormula', function (e) {
                    var a = $(this);
                    if ('checked' == a.attr('checked')) {
                        if ('' == t.$panelCustom.find('input.advancedFormula').val()) {
                            var i = $.parseJSON(t.getConditions(t.$panelCustom));
                            if (i.length > 1) {
                                for (var n = [], r = 0; r < i.length; r++)n.push(r + 1);
                                var o = n.join(' and ');
                                t.$panelCustom.find('input.advancedFormula').val(o);
                            }
                        }
                        t.$panelCustom.find('div.js-advanced_formula').show(), t.$panelCustom.find('span.js-default_criteria').hide();
                    } else t.$panelCustom.find('div.js-advanced_formula').hide(), t.$panelCustom.find('span.js-default_criteria').show(), t.$panelCustom.find('input.advancedFormula').val(''), t.$panelCustom.find('.nc_error').html('').hide();
                    t.reorderNum(t.$panelCustom);
                }), t.$panelCustom.off('click', 'a.js-clear_condition').on('click', 'a.js-clear_condition', function (e) {
                    $(this);
                    t.$panelCustom.find('input.advancedFormula').val('');
                }), t.$panelEdit.find('span.edit_formula_tip').qtip({
                    content: '<img src=\"/static/img/check_rule_bg.png\" alt=\"\" />',
                    style: {classes: 'qtip-light'},
                    position: {my: 'bottom left', at: 'top right', adjust: {x: 0, y: 0}}
                }), t.$panelEdit.off('click', 'input#edit_useFormula').on('click', 'input#edit_useFormula', function (e) {
                    var a = $(this);
                    if ('checked' == a.attr('checked')) {
                        if ('' == t.$panelEdit.find('input.edit_advancedFormula').val()) {
                            var i = $.parseJSON(t.getConditions(t.$panelEdit));
                            if (i.length > 1) {
                                for (var n = [], r = 0; r < i.length; r++)n.push(r + 1);
                                var o = n.join(' and ');
                                t.$panelEdit.find('input.edit_advancedFormula').val(o);
                            }
                        }
                        t.$panelEdit.find('div.js-advanced_formula').show(), t.$panelEdit.find('span.js-default_criteria').hide();
                    } else t.$panelEdit.find('div.js-advanced_formula').hide(), t.$panelEdit.find('span.js-default_criteria').show(), t.$panelEdit.find('input.edit_advancedFormula').val(''), t.$panelEdit.find('.nc_error').html('').hide();
                    t.reorderNum(t.$panelEdit);
                }), t.$panelEdit.off('click', 'a.js-clear_condition').on('click', 'a.js-clear_condition', function (e) {
                    $(this);
                    t.$panelEdit.find('input.edit_advancedFormula').val('');
                });
            }
            r.on('click', 'a', function () {
                var a = r.attr('action'), i = r.attr('data');
                if (i && a) {
                    var o = $.parseJSON(i);
                    n.belongId && (delete o.viewCase, o.belongId = n.belongId), $.postJson('/json/crm_search-favorite/' + a + '.action', o).done(function (i) {
                        if (0 == i.status) {
                            $.msg(e.i18n('CRM_CORE_SAVE') + e.i18n('CRM_CORE_SUCCESS'), 0 == i.status), r.hide();
                            var n = i.data.favoriteId;
                            t.$panelList.find('li').removeClass('selected'), 'save' == a ? (t.$panelList.append(['<li favoriteId=', n, ' class=\"selected\"><a href=\"javascript:;\">' + $.htmlEncode(o.name), '</a><span title=\"' + e.i18n('OLDCRM_CORE_COMMON_19') + '\" class=\"delete\"></span><span title=\"' + e.i18n('OLDCRM_CORE_COMMON_18') + '\" class=\"edit\"></span></li>'].join('')), t.$panelList.find('li[favoriteId=\"' + n + '\"] > a').attr('conditions', o.searchConds), t.$panel.find('div.view_level_1').find('a:first').trigger('click')) : (t.$panelEdit.hide(), t.$panelList.show('fade', 'fast').find('li[favoriteId=' + n + ']').attr('class', 'selected').find('a').attr('conditions', o.searchConds).html(o.name)), o.expression && t.$panelList.find('li[favoriteId=\"' + n + '\"] > a').attr('expression', o.expression);
                        }
                    });
                }
            }), t.$panelList.on('click', 'span.delete', function (a) {
                if (a.preventDefault(), t.$panelList.find('li').size() <= 1)return $.msg(e.i18n('OLDCRM_CORE_COMMON_15'), !1), !1;
                var i = $(this).parent(), r = {favoriteIds: i.attr('favoriteId'), viewCase: n.viewCase};
                n.belongId && (delete r.viewCase, r.belongId = n.belongId), $.confirm(e.i18n('CRM_CORE_DELELE_CONFIRM'), function () {
                    $.postJson('/json/crm_search-favorite/delete.action', r).done(function (e) {
                        0 == e.status && (i.remove(), i.hasClass('selected') && t.$panelList.find('li:first').find('a').trigger('click'));
                    });
                });
            }), t.$panelList.on('click', 'a', function (e) {
                i = '', e.preventDefault();
                var a = $(this).parent();
                t.$panelList.find('li').removeClass('selected'), a.addClass('selected'), t.setSmartViewName($(this).html());
                var n = $(this).attr('conditions');
                $('#div_main').find('div.grid_tool').find('li.hover a').trigger('click');
                var r = {favoriteId: a.attr('favoriteId'), conditions: n ? $.parseJSON(n) : '[]'};
                $(this).attr('expression') && (r.expression = $(this).attr('expression')), t.search(JSON.stringify(r)), t.close();
            }), t.$panelEdit.on('click', 'a.cancel', function (e) {
                e.preventDefault(), t.$panelEdit.hide();
                var a = t.$panelList.find('li.selected').find('a').html();
                return t.setSmartViewName(a), t.$panelList.show('fade', 'fast'), r.removeAttr('data'), r.removeAttr('action'), !1;
            }), t.$panelEdit.on('click', 'a.del_tip', function (e) {
                return e.preventDefault(), $(this).parents('tr').remove(), t.reorderNum(t.$panelEdit), !1;
            }), t.$panelCustom.on('click', 'a.del_tip', function (e) {
                return e.preventDefault(), $(this).parents('tr').remove(), t.reorderNum(t.$panelCustom), !1;
            }), t.$panelEdit.on('click', 'a.search_button', function (a) {
                a.preventDefault();
                var o = t.$panelEdit.find('table.baobiao_form_list'), s = o.attr('favoriteId'), l = $.trim(t.$panelEdit.find('input.search_name').val());
                t.setSmartViewName(l);
                var d = t.getConditions(t.$panelEdit), c = '';
                if (t.$panelEdit.find('input#edit_useFormula').size() && 'checked' == t.$panelEdit.find('input#edit_useFormula').attr('checked')) {
                    var c = t.$panelEdit.find('input.edit_advancedFormula').val();
                    if ('' == $.trim(c))return void t.$panelEdit.find('.nc_error').html(e.i18n('PLEASE_INPUT_ADVANCED_FORMULA')).show();
                    if (!t.checkFormula(d, $.trim(c).toLowerCase(), t.$panelEdit))return;
                }
                i = d;
                var p = {favoriteId: s, viewCase: n.viewCase, name: l, searchConds: d}, f = {
                    favoriteId: s,
                    conditions: $.parseJSON(d)
                };
                '' != c && (p.expression = c.toUpperCase(), f.expression = c.toUpperCase()), r.attr('data', JSON.stringify(p)).attr('action', 'update').show().find('a').html(e.i18n('OLDCRM_CORE_COMMON_16')), t.search(JSON.stringify(f)), t.$panelList.find('li').removeClass('selected'), t.$panelList.find('li[favoriteId=' + s + ']').attr('class', 'selected'), t.close();
            }), t.$panelCustom.on('click', 'a[act=search]', function (a) {
                var n = (t.element, t.options);
                a.preventDefault();
                var o = $.trim(t.$panelCustom.find('input.search_name').val());
                t.setSmartViewName(o);
                var s = t.getConditions(t.$panelCustom), l = '';
                if (t.$panelCustom.find('input#useFormula').size() && 'checked' == t.$panelCustom.find('input#useFormula').attr('checked')) {
                    var l = t.$panelCustom.find('input.advancedFormula').val();
                    if ('' == $.trim(l))return void t.$panelCustom.find('.nc_error').html('请填写高级公式\uFF01').show();
                    if (!t.checkFormula(s, $.trim(l).toLowerCase(), t.$panelCustom))return;
                }
                i = s;
                var d = {viewCase: n.viewCase, name: o, searchConds: s}, c = {conditions: $.parseJSON(s)};
                '' != l && (d.expression = l.toUpperCase(), c.expression = l.toUpperCase()), r.attr('data', JSON.stringify(d)).attr('action', 'save').show().find('a').html(e.i18n('OLDCRM_CORE_COMMON_17')), t.search(JSON.stringify(c)), t.close();
            }), t.$panelCustom.on('click', 'a[act=save]', function (a) {
                a.preventDefault();
                var i = $.trim(t.$panelCustom.find('input.search_name').val());
                if ('' == i)return void e.noticeError('请填写自定义检索名称');
                var r = t.$panelCustom.find('table.baobiao_form_list'), o = t.getConditions(r), s = '';
                if (t.$panelCustom.find('input#useFormula').size() && 'checked' == t.$panelCustom.find('input#useFormula').attr('checked')) {
                    var s = t.$panelCustom.find('input.advancedFormula').val();
                    if ('' == $.trim(s))return void t.$panelCustom.find('.nc_error').html(e.i18n('PLEASE_INPUT_ADVANCED_FORMULA')).show();
                    if (!t.checkFormula(o, $.trim(s).toLowerCase(), t.$panelCustom))return;
                }
                var l = {viewCase: n.viewCase, name: i, searchConds: o};
                '' != s && (l.expression = s.toUpperCase()), n.belongId && (delete l.viewCase, l.belongId = n.belongId), $.postJson('/json/crm_search-favorite/save.action', l).done(function (a) {
                    0 == a.status ? (t.$panelList.append(['<li favoriteId=', a.data.favoriteId, '><a href=\"javascript:;\">' + i, '</a><span title=\"' + e.i18n('OLDCRM_CORE_COMMON_19') + '\" class=\"delete\"></span><span title=\"' + e.i18n('OLDCRM_CORE_COMMON_18') + '\" class=\"edit\"></span></li>'].join('')), t.$panelList.find('li[favoriteId=\"' + a.data.favoriteId + '\"] > a').attr('conditions', o), '' != s && t.$panelList.find('li[favoriteId=\"' + a.data.favoriteId + '\"] > a').attr('expression', s), t.$panel.find('div.view_level_1').find('a:first').trigger('click')) : $.msg(e.i18n('CRM_CORE_SAVE') + e.i18n('CRM_CORE_FAILED'));
                });
            }), t.$panelEdit.on('click', 'a.green_button', function (a) {
                a.preventDefault();
                var i = t.$panelEdit.find('table.baobiao_form_list'), r = i.attr('favoriteId'), o = t.getConditions(i), s = $.trim(t.$panelEdit.find('input.search_name').val());
                if ('' == s)return void e.noticeError('请填写自定义检索名称');
                var l = '';
                if (t.$panelEdit.find('input#edit_useFormula').size() && 'checked' == t.$panelEdit.find('input#edit_useFormula').attr('checked')) {
                    var l = t.$panelEdit.find('input.edit_advancedFormula').val();
                    if ('' == $.trim(l))return void t.$panelEdit.find('.nc_error').html('请填写高级公式\uFF01').show();
                    if (!t.checkFormula(o, $.trim(l).toLowerCase(), t.$panelEdit))return;
                }
                var d = {favoriteId: r, viewCase: n.viewCase, name: s, searchConds: o};
                d.expression = l.toUpperCase(), n.belongId && (delete d.viewCase, d.belongId = n.belongId);
                var c = $(this).loading();
                $.postJson('/json/crm_search-favorite/update.action', d).done(function (a) {
                    0 == a.status ? (t.setSmartViewName(s), t.$panelList.show('fade', 'fast').find('li[favoriteId=' + r + ']').find('a').attr('conditions', o).html(s), t.$panelList.find('li[favoriteId=\"' + a.data.favoriteId + '\"] > a').attr('expression', l), t.$panelEdit.hide(), c.loading('end')) : ($.msg(e.i18n('CRM_CORE_SAVE') + e.i18n('CRM_CORE_FAILED')), c.loading('end'));
                });
            });
        },
        _init: function () {
            var e = this, t = (e.element, e.options);
            if (t.initData.views)e.init(t.initData); else {
                var a = '/json/crm_search-favorite/smart-views.action?viewCase=' + t.viewCase;
                t.belongId && (a = '/json/crm_search-favorite/smart-views.action?belongId=' + t.belongId), $.postJson(a).done(function (t) {
                    0 == t.status && e.init(t.data);
                }).fail(function (e, t, a) {
                });
            }
        },
        init: function (t) {
            var a = this, i = (a.element, a.options, ''), n = '';
            a.data = t, $.each(a.data.views, function (t, r) {
                $.each(r.conditions, function (e, t) {
                    'string' == typeof t.value && ~t.value.indexOf('{') && (t.value = $.parseJSON(t.value));
                }), a.$panelList.append(['<li favoriteId=\"' + r.id + '\" class=\"' + ('true' == r.isDefault ? 'selected' : '') + '\"><a href=\"javascript:;\">' + $.htmlEncode(r.name), '</a>', 1 != r.systemFlg ? '<span title=\"' + e.i18n('OLDCRM_CORE_COMMON_19') + '\" class=\"delete\"></span><span title=\"' + e.i18n('OLDCRM_CORE_COMMON_18') + '\" class=\"edit\"></span>' : '', '</li>'].join('')), a.$panelList.find('li[favoriteId=\"' + r.id + '\"] > a').attr('conditions', JSON.stringify(r.conditions)), r.expression && a.$panelList.find('li[favoriteId=\"' + r.id + '\"] > a').attr('expression', r.expression), 'true' == r.isDefault && (a.$tab.find('span.view_name').text(r.name), a.$tab.find('span.view_name').attr('title', r.name), i = r.conditions, n = r.id);
            }), a.$panelCustom.on('click', 'a.more_link', function (e) {
                a._addNewFilter(a.$panelCustom, a.data);
            }), a.$panelEdit.on('click', 'a.more_link', function (e) {
                a._addNewFilter(a.$panelEdit, a.data);
            }), a.$panelList.on('click', 'span.edit', function (t) {
                t.preventDefault(), a.$panelList.hide();
                var i = $(this).parent(), n = i.find('a');
                a.$panelEdit.find('input.search_name').val(n.html());
                var r = a.$panelEdit.find('table').html('');
                r.attr('favoriteId', i.attr('favoriteId'));
                var o = $.parseJSON(n.attr('conditions'));
                $.each(o, function (t, i) {
                    var n = a.getItem(i.item, a.data.items);
                    if (null != n && void 0 != n) {
                        var o = ['<span class=\"num\"></span><span class=\"name\">', a.getItemFilter(a.data.items, i.item), '</span>'].join(''), s = ['<span class=\"condition\">', a.getConditionFilter(n.searchType, n.id), '</span>'].join(''), l = ['<span class=\"value\">', a.getValueInput(i.item, a.data.items), '</span>'].join(''), d = '<span class=\"delete\"><a href=\"javascript:;\" class=\"del_tip\" href=\"javascript:;\" title=\"' + e.i18n('OLDCRM_CORE_COMMON_81') + '\"></a></span>';
                        r.append(['<tr><td><div class=\"baobiao_form_li\" index=\"', t, '\">', o, s, l, d, '</div></td></tr>'].join(''));
                    }
                }), r.find('div.baobiao_form_li').each(function () {
                    var e = $(this);
                    e.find('span.name').find('select').change(function () {
                        var t = $(this).val(), i = e.find('span.condition'), n = $(this).find('option:selected').attr('searchType');
                        i.html(a.getConditionFilter(n, t));
                        var r = e.find('span.value');
                        r.html(a.getValueInput(t, a.data.items)), a.setValueInput(e, t, a.data);
                    }), e.off('change', 'span.condition>select').on('change', 'span.condition>select', function () {
                        if ($(this).find('option[value=\"13\"]').size()) {
                            var t = e.find('span.name').find('select').val(), i = e.find('span.value');
                            i.html(a.getValueInput(t, a.data.items)), a.setValueInput(e, t, a.data);
                        }
                    });
                    var t = o[e.attr('index')];
                    e.find('span.condition').find('select').val(t.type), a.setValueInput(e, t.item, a.data, t.value);
                }), n.attr('expression') ? (a.$panelEdit.find('input#edit_useFormula').attr('checked', 'checked'), a.$panelEdit.find('input.edit_advancedFormula').val(n.attr('expression').toLowerCase()), a.$panelEdit.find('div.js-advanced_formula').show(), a.$panelEdit.find('span.js-default_criteria').hide(), a.reorderNum(a.$panelEdit)) : a.$panelEdit.find('input#edit_useFormula').size() && (a.$panelEdit.find('input#edit_useFormula').removeAttr('checked'), a.$panelEdit.find('input.edit_advancedFormula').val(''), a.$panelEdit.find('div.js-advanced_formula').hide(), a.$panelEdit.find('span.js-default_criteria').show()), a.$panelEdit.show('fade', 'fast');
            });
        },
        search: function (e) {
            $('#div_main_content').customerList('option', 'customData', e);
        },
        _addNewFilter: function (t, a) {
            var i = this, n = i.options, r = t.find('table'), o = r.find('div.baobiao_form_li').size();
            if (o > 9)return $.msg(e.i18n('OLDCRM_CORE_COMMON_20'), !1), !1;
            var s = i.getFirstItem(a.items), l = ['<span class=\"num\"></span><span class=\"name\">', i.getItemFilter(a.items), '</span>'].join(''), d = ['<span class=\"condition\">', i.getConditionFilter(s.searchType, s.id), '</span>'].join(''), c = ['<span class=\"value\">', i.getValueInput(s.id, a.items), '</span>'].join(''), p = '<span class=\"delete\"><a href=\"javascript:;\" class=\"del_tip\" href=\"javascript:;\" title=\"' + e.i18n('OLDCRM_CORE_COMMON_81') + '\"></a></span>';
            r.append(['<tr><td><div class=\"baobiao_form_li\" index=\"', o, '\">', l, d, c, p, '</div></td></tr>'].join(''));
            var f = t.find('div.baobiao_form_li:last'), u = f.find('span.condition');
            u.html(i.getConditionFilter(s.searchType, s.id));
            var m = f.find('span.value');
            if (m.html(i.getValueInput(s.id, a.items)), i.setValueInput(f, s.id, a), t.find('span.name').find('select').on('change', function () {
                    var e = $(this).val(), t = $(this).parent().parent(), n = t.find('span.condition'), r = $(this).find('option:selected').attr('searchType');
                    n.html(i.getConditionFilter(r, e));
                    var o = t.find('span.value');
                    o.html(i.getValueInput(e, a.items)), i.setValueInput(t, e, a);
                }), f.off('change', 'span.condition>select').on('change', 'span.condition>select', function () {
                    if ($(this).find('option[value=\"13\"]').size()) {
                        var e = f.find('span.name').find('select').val(), t = f.find('span.value');
                        t.html(i.getValueInput(e, i.data.items)), i.setValueInput(f, e, i.data);
                    }
                }), 'customize' == n.entityKeyword || 'account' == n.entityKeyword || 'opportunity' == n.entityKeyword || 'contract' == n.entityKeyword || 'contact' == n.entityKeyword || 'order' == n.entityKeyword) {
                i.reorderNum(t);
                var _, v, h;
                if (t.find('input#useFormula').size() ? (_ = t.find('input#useFormula'), h = i.$panelCustom, v = h.find('input.advancedFormula')) : (_ = t.find('input#edit_useFormula'), h = i.$panelEdit, v = h.find('input.edit_advancedFormula')), 'checked' == _.attr('checked')) {
                    var y = $.parseJSON(i.getConditions(h));
                    if (y.length > 1) {
                        for (var g = [], b = 0; b < y.length; b++)g.push(b + 1);
                        var C = g.join(' and ');
                        v.val(C);
                    }
                    h.find('div.js-advanced_formula').show(), h.find('span.js-default_criteria').hide();
                } else h.find('div.js-advanced_formula').hide(), h.find('span.js-default_criteria').show(), v.val(''), h.find('.nc_error').html('').hide();
            }
        },
        reorderNum: function (e) {
            if (e.find('input#useFormula').size() && 'checked' == e.find('input#useFormula').attr('checked') || e.find('input#edit_useFormula').size() && 'checked' == e.find('input#edit_useFormula').attr('checked')) {
                var t = 0;
                e.find('span.num').each(function () {
                    t++, $(this).html(t).show();
                });
            } else e.find('span.num').html('').hide();
        },
        setValueInput: function (t, a, i, r) {
            var o = this, s = (this.options, o.getItem(a, i.items));
            if (99 == s.searchType || 3 == s.searchType || 4 == s.searchType || 10 == s.searchType)if ('expense.expenseType' == s.entryPropertyName) {
                var l = i.expenseTypes;
                if (t.find('input.filterValue').multitreeselector({
                        source: '/json/crm_expense/expense-type-tree.action',
                        noCheckbox: 'parent'
                    }), r) {
                    var d = $.map(r.split(','), function (t) {
                        return {label: e.htmlEscape(l[t].name), value: t};
                    });
                    t.find('input.filterValue').multitreeselector('val', d);
                }
            } else if ('opportunity.saleStageId' == s.entryPropertyName && 0 == i.opportunityTypeNotEnabled) {
                if (t.find('input.filterValue').multitreeselector({
                        source: '/json/crm_entitybelongtype/stage-tree.action',
                        noCheckbox: 'parent'
                    }), r) {
                    var d = $.map(r.split(','), function (t) {
                        return {label: e.htmlEscape(s.values[t].name), value: t};
                    });
                    t.find('input.filterValue').multitreeselector('val', d);
                }
            } else if ($.inArray(s.entryPropertyNameOnly, n) != -1) {
                var l = i.departs;
                if ('dimDepart' != s.entryPropertyNameOnly && (l = i.dimensions), t.find('input.filterValue').multitreeselector({source: o.dummyUrl[s.entryPropertyNameOnly] + '&belongId=' + s.belongId}), r) {
                    var d = $.map(r.split(','), function (t) {
                        return {label: e.htmlEscape(l[t].name), value: t};
                    });
                    t.find('input.filterValue').multitreeselector('val', d);
                }
            } else if (o.dummyUrl[s.entryPropertyNameOnly]) {
                if ('accountId' == s.entryPropertyNameOnly && 68 == s.belongId && (o.dummyUrl[s.entryPropertyNameOnly] = '/json/crm_search/accounts.action?pageNo=1&s=fcbk'), o.initAutoComplete(t.find('select.filterValue'), o.dummyUrl[s.entryPropertyNameOnly]), r) {
                    var l = i.users;
                    'accountId' == s.entryPropertyNameOnly ? l = i.accountList : 'product' == s.entryPropertyNameOnly ? l = i.products : 'parentAccountId' == s.entryPropertyNameOnly ? l = i.accountList : 'expenseAccountId' == s.entryPropertyNameOnly ? l = i.expenseAccountList : 'contractId' == s.entryPropertyNameOnly ? l = i.contractList : 'orderId' == s.entryPropertyNameOnly ? l = i.orderList : 'contactId' == s.entryPropertyNameOnly && (l = i.contactList), $.each(r.split(','), function (a, i) {
                        o.setAutoCompleteValue(t.find('select.filterValue'), {
                            key: i,
                            value: e.htmlEscape(l && l[i] && l[i].name || '')
                        });
                    });
                }
            } else if (s.entryPropertyNameOnly.indexOf('dbcRelation') != -1 || 10 == s.searchType) {
                var c = o._belongIdUrl[s.relationBelongId];
                s.relationBelongId > 999 && (c = o._belongIdUrl[999] + '&belongId=' + s.relationBelongId), o.initAutoComplete(t.find('select.filterValue'), c);
                var l = i.relationObjects && i.relationObjects[s.relationBelongId];
                r && $.each(r.split(','), function (a, i) {
                    o.setAutoCompleteValue(t.find('select.filterValue'), {
                        key: i,
                        value: e.htmlEscape(l && l[i] && l[i].name || '')
                    });
                });
            } else if ('activityRecordFrom' == s.entryPropertyNameOnly) {
                t.addClass('activity-record-div');
                var p = t.find('select.filterValue'), f = '', u = {
                    510: '/json/oa_search/search-account.action',
                    511: '/json/oa_search/search-opp.action',
                    515: '/json/oa_search/search-account.action?accountTypes=2',
                    516: '/json/oa_search/search-campaign.action',
                    518: '/json/oa_search/search-contact.action',
                    522: '/json/oa_search/search-lead.action'
                };
                $.each(s.values, function (t, a) {
                    f += '<option value=\"' + a.id + '\">' + e.htmlEscape(a.name) + '</option>>', u[a.id] || (u[a.id] = '/json/crm_search/customize.action');
                }), p.append(f);
                var m = t.find('input.activity-bus-input');
                m.acSingle({
                    source: $.noop, minLength: 1, select: function (e, t) {
                        var a = t.item;
                        p.val();
                        return m.val(a.label), !1;
                    }, focus: function (e, t) {
                        var a = t.item;
                        return m.val(a.label), !1;
                    }
                }), p.on('change', function (t) {
                    m.val('');
                    var a = $(this).val(), i = Number(a) > 999, n = {};
                    m.acSingle('option', 'source', function (t, r) {
                        i ? (n.belongId = a, n.s = 'fcbk') : (n = {
                            pageNo: 1,
                            key: t.term
                        }, 510 == a && (n.accountTypes = 1)), $.postJson(u[a], n).done(function (t) {
                            r($.map(t, function (t) {
                                return i ? {label: e.htmlEscape(t.name), value: t.id} : {
                                    label: e.htmlEscape(t.label),
                                    value: t.value
                                };
                            }));
                        });
                    });
                }), r ? (p.val(r.belongId), p.trigger('change'), m.acSingle('val', {
                    value: r.objectId,
                    label: e.htmlEscape(r.objectName)
                })) : p.trigger('change');
            } else o.initAutoSelect(t.find('select.filterValue'), s.values), r && $.each(r.split(','), function (a, i) {
                o.setAutoCompleteValue(t.find('select.filterValue'), {key: i, value: e.htmlEscape(s.values[i].name)});
            }); else if (7 == s.searchType) {
                var _ = t.find('span.condition').find('select').val();
                13 == _ ? (t.find('input.filterValue').replaceWith('<div class=\"name_select ui-select-buttonset\"><select class=\"filterValue\" ></select></div>'), $.postJson('/json/crm_dates/date-list.action').done(function (e) {
                    if (!e.status) {
                        var a = '';
                        $.each(e.data, function (e, t) {
                            a += '<optgroup label=\"' + t.name + '\">', $.each(t.nodes, function (e, t) {
                                a += '<option value=\"' + t.code + '\">' + t.name + '</option>';
                            }), a += '</optgroup>';
                        }), t.find('select.filterValue').html(a), t.find('select.filterValue').selectmenu({
                            appendTo: 'body',
                            width: 171
                        }).selectmenu('menuWidget').css('max-height', 400);
                    }
                }).fail(function (e, t, a) {
                })) : (t.find('input.filterValue').datepicker({
                    changeMonth: !0,
                    changeYear: !0
                }), t.find('input.filterValue').datepicker('widget').on('click', function (e) {
                    e.stopPropagation();
                })), r && (13 == _ ? setTimeout(function () {
                    t.find('select.filterValue').val(r), t.find('select.filterValue').selectmenu('refresh');
                }, 100) : t.find('input.filterValue').val(r));
            } else r && t.find('input.filterValue').val(r);
        },
        getConditions: function (e) {
            var t = this, a = 0;
            return JSON.stringify($.map(e.find('div.baobiao_form_li'), function (e) {
                var i = $(e), r = i.find('span.name').find('select').val(), o = i.find('span.condition').find('select').val(), s = i.find('span.value').find('.filterValue'), l = $.trim(s.val());
                if ($.inArray(s.attr('itemName'), n) != -1) {
                    var d = $.map(s.multitreeselector('val'), function (e) {
                        return 'dimDepart' != s.attr('itemName') ? t.data.dimensions[e.value] = {
                            id: e.value,
                            name: e.label
                        } : t.data.departs[e.value] = {id: e.value, name: e.label}, e.value;
                    }).join(',');
                    l = d;
                } else if ('saleStageId' == s.attr('itemName') && 0 == t.data.opportunityTypeNotEnabled) {
                    var d = $.map(s.multitreeselector('val'), function (e) {
                        return e.value;
                    }).join(',');
                    l = d;
                } else if ('expenseType' == s.attr('itemName')) {
                    var d = $.map(s.multitreeselector('val'), function (e) {
                        return e.value;
                    }).join(',');
                    l = d;
                } else if (s.hasClass('js-activity-record-from')) {
                    var c = s.next(), p = c.acSingle('val');
                    p = p ? p.value : '';
                    var f = {};
                    f.belongId = l, f.objectId = p, f.objectName = c.val(), l = f;
                }
                return a++, {id: a.toString(), item: r, type: o, value: null == l ? '' : l};
            }));
        },
        setSmartViewName: function (e) {
            this.$tab.find('span.view_name').text(e), this.$tab.find('span.view_name').attr('title', e);
        },
        setAutoCompleteValue: function (e, t) {
            e.trigger('addItem', t);
        },
        initAutoComplete: function (t, a) {
            var i = this;
            t.fcbkcomplete({
                json_url: a,
                addontab: !0,
                maxitems: 100,
                height: 100,
                filter_selected: !0,
                input_min_size: 0,
                width: 185,
                complete_text: e.i18n('CRM_CORE_PLEASE_INPUT_2') + '...',
                cache: !1,
                onselect: function (e) {
                    a != i.dummyUrl.createdBy && a != i.dummyUrl.updatedBy && a != i.dummyUrl.applicantId && a != i.dummyUrl.signerId && a != i.dummyUrl.ownerId && a != i.dummyUrl.memberId || i.data.users[e._value] || (i.data.users[Number(e._value)] = {
                        id: e._value,
                        name: $('#' + e._id).trimHtml(),
                        icon: ''
                    }), a == i.dummyUrl.contractId && (i.data.contractList || (i.data.contractList = {}), i.data.contractList[e._value] || (i.data.contractList[Number(e._value)] = {
                        id: e._value,
                        name: $('#' + e._id).trimHtml()
                    })), a == i.dummyUrl.orderId && (i.data.orderList || (i.data.orderList = {}), i.data.orderList[e._value] || (i.data.orderList[Number(e._value)] = {
                        id: e._value,
                        name: $('#' + e._id).trimHtml()
                    })), a == i.dummyUrl.contactId && (i.data.contactList || (i.data.contactList = {}), i.data.contactList[e._value] || (i.data.contactList[Number(e._value)] = {
                        id: e._value,
                        name: $('#' + e._id).trimHtml()
                    }));
                }
            });
        },
        initAutoSelect: function (t, a) {
            t.fcbkcomplete({
                json: a ? $.map(a, function (t) {
                    return {key: t.id, value: e.htmlEscape(t.name)};
                }) : {},
                addontab: !0,
                maxitems: 100,
                height: 14,
                filter_selected: !0,
                input_min_size: -1,
                width: 185,
                cache: !1,
                complete_text: e.i18n('CRM_CORE_PLEASE_INPUT_2') + '...'
            });
        },
        getValueInput: function (e, t) {
            var a = this, i = '<input class=\"filterValue\" type=\"text\">', r = a.getItem(e, t);
            if (r) {
                var o = r.searchType;
                7 == o || $.inArray(r.entryPropertyNameOnly, n) != -1 || 'opportunity.saleStageId' == r.entryPropertyName && 0 == a.data.opportunityTypeNotEnabled || 'expense.expenseType' == r.entryPropertyName ? i = '<input class=\"filterValue\" itemName=\"' + r.entryPropertyNameOnly + '\" type=\"text\">' : 3 != o && 4 != o && 99 != o && 10 != o || (i = 'activityRecordFrom' == r.entryPropertyNameOnly ? '<div class=\"name_select\"><select class=\"filterValue js-activity-record-from\"></select><input type=\"text\" class=\"activity-bus-input text\"/></div>' : '<div class=\"name_select\"><select class=\"filterValue\" ></select></div>');
            }
            return i;
        },
        getItem: function (e, t) {
            var a;
            return $.each(t, function (t, i) {
                i.id == e && (a = i);
            }), a;
        },
        getConditionFilter: function (t, a) {
            var i, n = this, r = n.options;
            if (1 == t || 2 == t || 22 == t || 23 == t || 24 == t ? i = n.filterConditions.text : 5 == t || 6 == t || 7 == t ? (i = n.filterConditions.range, 'customize' != r.entityKeyword && 'account' != r.entityKeyword && 'opportunity' != r.entityKeyword && 'contract' != r.entityKeyword && 'contact' != r.entityKeyword && 'order' != r.entityKeyword || 7 == t && i.length < 7 && i.push({
                    name: e.i18n('REPORT_44'),
                    value: '13'
                })) : i = 9 == t ? n.filterConditions.text : n.filterConditions.select, 'activityrecord' == r.entityKeyword)for (var o = 0; o < i.length; o++)'14' == i[o].value && i.pop();
            var s = $.map(i, function (t) {
                return ['<option value=\"', t.value, '\">', e.htmlEscape(t.name), '</option>'];
            }).join('');
            return ['<select>', s, '</select>'].join('');
        },
        getItemFilter: function (t, a) {
            var i = $.map(t, function (t) {
                if (t.isJoin)return '';
                if (26 != t.searchType && 29 != t.searchType && 30 != t.searchType && 'expense.relateEntity' != t.entryPropertyName)return '1' == t.quickSearchFlg ? ['<option value=\"', t.id, '\"', a && a == t.id ? 'selected=\"true\"' : '', ' searchType=\"', t.searchType, '\" propName=\"', t.entryPropertyNameOnly, '\">', e.htmlEscape(t.itemName), '</option>'].join('') : void 0;
            }).join('');
            return ['<select>', i, '</select>'].join('');
        },
        getFirstItem: function (e) {
            var t = e[0];
            return $.each(e, function (e, a) {
                if ('1' == a.quickSearchFlg)return t = a, !1;
            }), t;
        },
        close: function () {
            var e = this, t = e.element;
            e.options;
            e.$panel.hide('fade', 'fast'), t.removeClass('has_drop');
        },
        getSearchConditionForActivityRecord: function () {
            return i;
        },
        checkFormula: function (e, t, a) {
            var i = function (e) {
                throw new Error(JSON.stringify(e));
            }, n = function () {
            };
            n.prototype = {
                rOperand: /^\d+$/, parse: function (e) {
                    for (var t, a, n, r, o = [{
                        type: '^',
                        value: '',
                        index: 0
                    }], s = /\d+|and|or|\(|\)|（|）|\S+/g; t = s.exec(e);)n = t[0], r = t.index, a = {
                        value: n,
                        index: r
                    }, 'and' == n ? a.type = 'operator' : 'or' == n ? a.type = 'operator' : '(' == n || '\uFF08' == n ? a.type = 'limit_start' : ')' == n || '\uFF09' == n ? a.type = 'limit_end' : this.rOperand.test(n) ? (this.operands && this.operands.length && !~this.operands.indexOf(n) && i({
                        code: -1,
                        message: '存在错误的编号\uFF01',
                        index: r
                    }), a.type = 'operand') : i({code: -2, message: '存在错误的字符\uFF01', index: r}), o.push(a);
                    return o.push({type: '$', value: '', index: e.length}), o;
                }, setValidOperands: function (e) {
                    this.operands = e;
                }
            };
            var r = function () {
            };
            r.prototype = {
                parse: function (e) {
                    var t, a, n, r, o = [0];
                    return e.forEach(function (s, l) {
                        if (0 != l)switch (t = e[l - 1], n = {code: -3, message: '公式错误', index: s.index}, t.type) {
                            case'operand':
                                switch (s.type) {
                                    case'operator':
                                        r.fall || 'operator' != r.type || s.value == r.value || i({
                                            code: -5,
                                            message: 'and与or需要用括号分隔',
                                            index: s.index
                                        }), s.left = r, r = o[o.length - 1] = s;
                                        break;
                                    case'limit_end':
                                        a = o.pop(), o.length > 0 ? r = o[o.length - 1] : i({
                                            code: -5,
                                            message: '缺失左括号',
                                            index: s.index
                                        }), 0 === r ? (r = o[o.length - 1] = a, r.fall = !0) : 'operator' == r.type ? r.right = a : i(n);
                                        break;
                                    case'$':
                                        break;
                                    default:
                                        i(n);
                                }
                                break;
                            case'operator':
                                switch (s.type) {
                                    case'operand':
                                        t.right = s;
                                        break;
                                    case'limit_start':
                                        o.push(0);
                                        break;
                                    default:
                                        i(n);
                                }
                                break;
                            case'limit_start':
                                switch (s.type) {
                                    case'operand':
                                        r = o[o.length - 1] = s;
                                        break;
                                    case'limit_start':
                                        o.push(0);
                                        break;
                                    default:
                                        i(n);
                                }
                                break;
                            case'limit_end':
                                switch (s.type) {
                                    case'operator':
                                        r.fall || 'operator' != r.type || s.value == r.value || i({
                                            code: -5,
                                            message: '缺失左括号',
                                            index: s.index
                                        }), s.left = r, r = o[o.length - 1] = s;
                                        break;
                                    case'limit_end':
                                        a = o.pop(), o.length > 0 ? r = o[o.length - 1] : i({
                                            code: -5,
                                            message: '缺失左括号',
                                            index: s.index
                                        }), 0 === r ? r = o[o.length - 1] = a : 'operator' == r.type ? r.right = a : i(n);
                                        break;
                                    case'$':
                                        break;
                                    default:
                                        i(n);
                                }
                                break;
                            case'^':
                                switch (s.type) {
                                    case'operand':
                                        0 === o[o.length - 1] && (r = o[o.length - 1] = s);
                                        break;
                                    case'limit_start':
                                        o.push(0);
                                        break;
                                    case'$':
                                        break;
                                    default:
                                        i(n);
                                }
                        }
                    }), 1 == o.length ? this.ast = r : void i({code: -4, message: '缺失右括号'});
                }, getString: function () {
                    var e = this.ast;
                    return e ? this._ldr(e).map(function (e) {
                        return 'and' == e || 'or' == e ? ' ' + e + ' ' : e;
                    }).join('') : '';
                }, _ldr: function (e, t) {
                    if (!e)return [];
                    var a = this._ldr(e.left, 'operator' == e.type ? e.value : null).concat([e.value], this._ldr(e.right, 'operator' == e.type ? e.value : null));
                    return t && 'operator' == e.type && e.value != t ? ['('].concat(a, [')']) : a;
                }
            }, a.find('.nc_error').html('').hide();
            var o = function (e) {
                for (var t, a = [], i = {}, n = 0; null != (t = e[n]); n++)i[t] || (a.push(t), i[t] = !0);
                return a;
            };
            try {
                var s = new n(), l = new Array();
                $.each($.parseJSON(e), function (e, t) {
                    l.push(t.id);
                });
                var d = new Array();
                s.setValidOperands(l);
                var c = s.parse(t);
                if (c) {
                    c.slice(1, -1).map(function (e) {
                        return 'operand' == e.type && d.push(e.value), e.value;
                    });
                    var p = new r();
                    p.parse(c);
                }
                if (l.sort().join(',') != o(d).sort().join(','))return a.find('.nc_error').html('存在没有被公式引用的条件\uFF01').show(), !1;
            } catch (e) {
                return a.find('.nc_error').html('公式格式有误\uFF0C请检查您的输入\uFF01').show(), !1;
            }
            return !0;
        }
    }), $;
})
define("crm/js/apps/crm/tmpl/page.tpl", [], "<div id=\"div_main\" class=\"main_grid new-main-grid\"> <div id=\"crm_toolbar\" class=\"main_grid_top\"></div> <div id=\"crm_grid_con\" class=\"main_grid_middlle main-grid-box\"> <div id=\"div_main_content\"></div> {{ if app == 'activityrecord'}} <div id=\"div_main_right\" style=\"display:block;\" class=\"record_filter rightsidetable right-panel-collapsed\" style=\"height:100%\"> <div class=\"record_filter_inner\"> <div class=\"customer_filter\"> <ul class=\"customer_filter_list clear\"> <li class=\"first\"><a class=\"selected js-right-filter\" href=\"javascript:;\" period=\"yesterday\">{{'SCRPT_TMPL_CONTAINER_CONTENT_ACTIVITYRECORD_3' | i18n}}</a></li> <li>|</li> <li><a  href=\"javascript:;\" class=\"js-right-filter\" period=\"week\">{{'SCRPT_TMPL_CONTAINER_CONTENT_ACTIVITYRECORD_4' | i18n}}</a></li> <li>|</li> <li><a  href=\"javascript:;\" class=\"js-right-filter\" period=\"month\">{{'SCRPT_TMPL_CONTAINER_CONTENT_ACTIVITYRECORD_6' | i18n}}</a></li> <li>|</li> <li><a href=\"javascript:;\" class=\"custom_set js-right-filter\" period=\"custom\">{{'SCRPT_TMPL_CONTAINER_CONTENT_ACTIVITYRECORD_8' | i18n}}</a></li> </ul> </div> <div id=\"timeDiv\" class=\"time_interval js-right-time\"></div> <div id=\"SSDiv\" class=\"customer_result_list\"> <ul class=\"js-activityTypeCount\"></ul> </div> <div id=\"SMDiv\"></div> <div id=\"MMDiv\"></div> </div> <a href=\"javascript:;\" class=\"collapse-right-panel\"><span>{{'SCRPT_TMPL_CONTAINER_CONTENT_ACTIVITYRECORD_11' | i18n}}</span></a> <a href=\"javascript:;\" class=\"expand-right-panel\" style=\"display:block;\"><span>{{'SCRPT_TMPL_CONTAINER_CONTENT_ACTIVITYRECORD_12' | i18n}}</span></a> </div> <div class=\"customer_filter_list js-right-custom-time\"  style=\"display: none; right:53px; top:15px; position:absolute;\"> <div class=\"calendar_tag_area\"> <div  class=\"meter_edit\" style=\"display: block;\" > <div class=\"calendar_tag_box clear\"><em>{{'SCRPT_TMPL_CONTAINER_CONTENT_LEADHIGHSEA_1' | i18n}}</em> <input type=\"text\" placeholder=\"{{'CUSTOMSIZE_SCRPT_TMPL_SELECT_DATE_3' | i18n}}\" class=\"text js-start-date\"><b>{{'SCRPT_TMPL_CONTAINER_CONTENT_LEADHIGHSEA_2' | i18n}}</b> <input type=\"text\"   placeholder=\"{{'CUSTOMSIZE_SCRPT_TMPL_SELECT_DATE_4' | i18n}}\"  class=\"text js-end-date\"> </div> <a class=\"green_button js-search-summary\" href=\"javascript:;\">{{'CUSTOMSIZE_SCRPT_TMPL_SELECT_DATE_6' | i18n}}</a> </div> </div> </div> {{ /if}} <!-- <div class=\"large-loading\" style=\"display:none\"> <div id=\"floatingCirclesG\"><div class=\"f_circleG\" id=\"frotateG_01\"></div><div class=\"f_circleG\" id=\"frotateG_02\"></div><div class=\"f_circleG\" id=\"frotateG_03\"></div><div class=\"f_circleG\" id=\"frotateG_04\"></div><div class=\"f_circleG\" id=\"frotateG_05\"></div><div class=\"f_circleG\" id=\"frotateG_06\"></div><div class=\"f_circleG\" id=\"frotateG_07\"></div><div class=\"f_circleG\" id=\"frotateG_08\"></div></div> <span>表格加载中...</span> </div>  --> <div class=\"loading-mask\" style=\"display:none\"> <div class=\"large-loading\" > <div id=\"floatingCirclesG\"><div class=\"f_circleG\" id=\"frotateG_01\"></div><div class=\"f_circleG\" id=\"frotateG_02\"></div><div class=\"f_circleG\" id=\"frotateG_03\"></div><div class=\"f_circleG\" id=\"frotateG_04\"></div><div class=\"f_circleG\" id=\"frotateG_05\"></div><div class=\"f_circleG\" id=\"frotateG_06\"></div><div class=\"f_circleG\" id=\"frotateG_07\"></div><div class=\"f_circleG\" id=\"frotateG_08\"></div></div> <span>{{ 'CRM_CORE_FILTER_DATA_LOADING' | i18n }}</span> </div> </div> <div class=\"grid-no-entities\" style=\"display:none;\"><p>{{ 'CRM_CORE_FILTER_NO_DATA_DISPLAY' | i18n }}</p><p><a href=\"javascript:;\">{{ 'CRM_CORE_FILTER_CLEAR_FILTER' | i18n }}</a></p></div> </div> </div> <div id=\"crm_detail\" class=\"crm-detail\"> <div class=\"cd-header\"></div> <div class=\"cd-body\"></div> <div class=\"cd-footer\" style=\"display:none;\"></div> </div>")
define("crm/js/apps/crm/tmpl/toolbar.tpl", [], "<!-- grid view --> {{if entityKeyword == 'opportunity'}} <div class=\"xsy-con\"> <header> <span title=\"{{'CARD_VIEW' | i18n}}\" type=\"kanban\" class=\"icon1 js_opportunity_kanban\"></span> <span title=\"{{'LIST_VIEW' | i18n}}\" type=\"list\" class=\"icon2 hover js_opportunity_list\"></span> <span class=\"ver-line\"></span> </header> </div> {{/if}} {{if entityKeyword == 'leadhighsea' || entityKeyword == 'highsea'}} <div class=\"grid_view clear js-navigation\"> <div class=\"view_class\"><span class=\"lead_pool\"></span>{#SESSION.keywords.lead}{{'SCRPT_TMPL_CONTAINER_CONTENT_HIGHSEA_1' | i18n}}</div> </div> {{ else if entityKeyword == 'product'}} <div class=\"grid_view clear js-navigation\"> <div class=\"product_view_class product\"><a herf=\"javascript:;\" productid=\"0\" class=\"js-product-dir-name\">{{entityName}}</a></div> </div> {{ else}} <div class=\"grid_view clear\"> <div class=\"view_class\" {{ if entityKeyword == 'customize'}}id=\"div-customize-info\"{{/if}}><span class=\"{{ entityKeyword }}\"></span>{{ entityName }}</div> <div id=\"div_grid_filter\" class=\"view_now\" {{if entityKeyword == 'opportunity'}}style=\"margin:1px 0 0 -8px;\"{{/if}}> <span class=\"js-smartview-tab\"> <span class=\"view_name\"></span> <span class=\"arrow\"></span> </span> <!-- drop view --> <div class=\"js-smartview-panel drop_div view_select\" style=\"display: none;\"> <div class=\"view_select_bg\"> <div class=\"view_level_1\"> <ul> <li class=\"selected\"><a href=\"javascript:;\">{{'SCRIPT_TEMPLATE_CONTAINER_CONTENT_2' | i18n}}</a><span class=\"triangle_left\"></span></li> <li><a href=\"javascript:;\" class=\"view_add\">{{'SCRIPT_TEMPLATE_CONTAINER_CONTENT_3' | i18n}}</a><span class=\"triangle_left\"></span></li> </ul> </div> <div class=\"view_level_2\"> <!-- 选择常用检索 --> <ul class=\"view_list js-smartview-panel\"></ul> <!-- 编辑常用检索 --> <div class=\"search_list js-smartview-edit\" style=\"display: none;\"> <p>{{'SCRIPT_TEMPLATE_CONTAINER_CONTENT_4' | i18n}}</p> <input class=\"search_name\" type=\"text\"> <p>{{'SCRIPT_TEMPLATE_CONTAINER_CONTENT_5' | i18n}}</p> <div class=\"baobiao_form_list_wrapper\"><table border=\"0\" class=\"baobiao_form_list\"></table></div> <a href=\"javascript:;\" class=\"more_link\">+{{'SCRIPT_TEMPLATE_CONTAINER_CONTENT_6' | i18n}}</a> {{if entityKeyword == 'account' || entityKeyword == 'customize' || entityKeyword == 'opportunity' || entityKeyword == 'contract' || entityKeyword == 'contact' || entityKeyword == 'order'}} <div class=\"enable_formula\"> <input type=\"checkbox\" id=\"edit_useFormula\"><label for=\"edit_useFormula\">{{'Enable_advanced_formula' | i18n}}</label> </div> <div class=\"enable_formula_warp js-advanced_formula\" style=\"display: none\"> <input type=\"text\" class=\"edit_advancedFormula\"><a class=\"clear_link js-clear_condition\" href=\"javascript:;\">{{'CLEAR_CONDITION' | i18n}}</a> <span class=\"add_tip layout_add_tip edit_formula_tip\" title=\"\"></span> </div> <div style=\"clear: both;margin-left: 20px;margin-bottom:10px;\"> <span class=\"nc_error edit_nc_error\" style=\"width:180px;display: none\">{{'Formula_format_ERROR' | i18n}}</span> </div> {{/if}} <div class=\"pop_up_bottom\"> <div class=\"pop_up_button_left\"> <a href=\"javascript:;\" class=\"cancel\">{{'CUSTOMSIZE_SCRPT_TMPL_SELECT_DATE_5' | i18n}}</a> </div> <div class=\"pop_up_button\"> <a title=\"\" href=\"javascript:;\" class=\"search_button\">{{'SCRIPT_TEMPLATE_CONTAINER_CONTENT_7' | i18n}}</a> <a title=\"\" href=\"javascript:;\" class=\"green_button\" onclick=\"\">{{'SCRIPT_CREATE_SOLUTION_DETAIL_4' | i18n}}</a> </div> </div> </div> <!-- 自定义检索 --> <div class=\"search_list js-smartview-panel\" style=\"display: none;\"> <p>{{'SCRIPT_TEMPLATE_CONTAINER_CONTENT_4' | i18n}}</p> <input class=\"search_name\" type=\"text\"> <p>{{'SCRIPT_TEMPLATE_CONTAINER_CONTENT_5' | i18n}}</p> <div class=\"baobiao_form_list_wrapper\"><table border=\"0\" class=\"baobiao_form_list\"></table></div> <a href=\"javascript:;\" class=\"more_link\">+{{'SCRIPT_TEMPLATE_CONTAINER_CONTENT_6' | i18n}}</a> {{if entityKeyword == 'account' || entityKeyword == 'customize' || entityKeyword == 'opportunity' || entityKeyword == 'contract' || entityKeyword == 'contact' || entityKeyword == 'order'}} <div class=\"enable_formula\"> <input type=\"checkbox\" id=\"useFormula\"><label for=\"useFormula\">{{'Enable_advanced_formula' | i18n}}</label> </div> <div class=\"enable_formula_warp js-advanced_formula\" style=\"display: none\"> <input type=\"text\" class=\"advancedFormula\"><a class=\"clear_link js-clear_condition\" href=\"javascript:;\">{{'CLEAR_CONDITION' | i18n}}</a> <span class=\"add_tip layout_add_tip formula_tip\" title=\"\"></span> </div> <div style=\"clear: both;margin-left: 20px;margin-bottom:10px;\"> <span class=\"nc_error\" style=\"width:180px;display: none\">{{'Formula_format_ERROR' | i18n}}</span> </div> {{/if}} <div class=\"pop_up_bottom\"> <div class=\"pop_up_button\"> <a act=\"save\" onclick=\"\" title=\"\" href=\"javascript:;\" class=\"cancel\">{{'SCRIPT_TEMPLATE_CONTAINER_CONTENT_8' | i18n}}</a> <a act=\"search\" title=\"\" href=\"javascript:;\" class=\"green_button search_green\" onclick=\"\">{{'SCRIPT_TEMPLATE_CONTAINER_CONTENT_7' | i18n}}</a> </div> </div> </div> <!--  --> </div> </div> </div> <!-- drop view end --> </div> <span id=\"quickSave\" class=\"view_save\" style=\"display: none\"><a href=\"javascript:;\"></a></span> </div> {{/if}} {{if entityKeyword == 'opportunity'}} <div class=\"kanban_opptype\" style=\"display: none;\"> <div class=\"kanban_opptype_staselect\" title=\"\"> <span></span> <i class=\"arrow\"></i> </div> </div> {{/if}} <!-- tool --> <div class=\"grid-view-filterresult lfloat\"> <div class=\"grid-sort-filter-result grid-sort-result prelative lfloat dinline-block sort_tip\" style=\"display:none;\"> <span class=\"filter-title .dinline-flex lfloat\"><i class=\"asc-ico\"></i>{{ 'CRM_CORE_FILTER_SORT' | i18n }}：</span> <span class=\"filter-content dinline-block lfloat ellipsis\"></span> <a href=\"javascript:;\" class=\"close lfloat dinline-flex\"><i class=\"dinline-block\"></i></a> </div> <div class=\"filter_box grid-flex-box\" style=\"height:32px;overflow:hidden;float:left;\"></div> </div>")
define("crm/js/core/grid/tmpl/subgridRefer.tpl", [], "<div class=\"table_body\"> <div class=\"pg-loading\"><div class=\"ico\">{{'LOADING' | i18n}}</div></div> <table class=\"product_table\" style=\"width:{{_totalWidth}}\" cellspacing=\"0\" cellpadding=\"0\"> <thead> <tr> {{each columns as column key}} <th data-id=\"{{column.id}}\" style=\"width:{{column.width}};\" {{if column.attrs}} {{each column.attrs as attr key2}} {{attr}} {{/each}} {{/if}} ><span>{{column.title}}</span></th> {{/each}} </tr> </thead> <tbody> </tbody> </table> </div>")
define("crm/js/core/grid/tmpl/subgrid.tpl", [], "<div class=\"table_header\"> <table class=\"product_table\" style=\"width:{{_totalWidth}}\" cellspacing=\"0\" cellpadding=\"0\"> <thead> <tr> {{each columns as column key}} <th data-id=\"{{column.id}}\" style=\"width:{{column.width}};\" {{if column.attrs}} {{each column.attrs as attr key2}} {{attr}} {{/each}} {{/if}} ><span>{{column.title}}</span></th> {{/each}} </tr> </thead> <tbody></tbody> </table> </div> <div class=\"table_body\"> <div class=\"pg-loading\"><div class=\"ico\">{{'LOADING' | i18n}}</div></div> <table class=\"product_table\" style=\"width:{{_totalWidth}}\" cellspacing=\"0\" cellpadding=\"0\"> <thead></thead> <tbody> </tbody> </table> </div>")
define("crm/js/core/grid/subgrid.js", ["core/rkloader.js", "crm/js/core/grid/tmpl/subgridRefer.tpl", "crm/js/core/grid/tmpl/subgrid.tpl"], function (require, exports, module) {
    'use strict';
    var t = require('rk');
    $.widget('rk.subgrid', {
        options: {numberType: 'numeric', width: '100%', height: '100%', defaultColumnWidth: 120},
        _create: function () {
            var e = this, i = e.element, a = e.options, l = ($(i).outerWidth(), 0), d = a.numberType;
            e.isHybirdNumType = !1;
            for (var n = 0, r = a.columns.length; n < r; n++) {
                var o = 'col' + n, s = a.columns[n];
                if (s.width && $.isNumeric(s.width)) {
                    a.numberType = d ? d : 'numeric';
                    break;
                }
                if (s.width && /[\/d]*\%/gi.test(s.width)) {
                    a.numberType = d ? d : 'percentage';
                    break;
                }
            }
            e.columnsInfo = {};
            for (var n = 0, r = a.columns.length; n < r; n++) {
                var o = 'col' + n, s = a.columns[n];
                s.id = o, e.columnsInfo[o] = s, 'numeric' == a.numberType ? ($.isNumeric(s.width) || (s.width = a.defaultColumnWidth), l += s.width, s.width += 'px') : e.isHybirdNumType = !0, s.origin_width = s.width;
            }
            if (a._totalWidth = 'numeric' == a.numberType ? l + 'px' : a.width, a.lastColumnWidth)var p = require('./tmpl/subgridRefer.tpl'); else var p = require('./tmpl/subgrid.tpl');
            var h = t.templateText(p, a);
            i.html(h), e.updateHybirdColumnsWidth();
        },
        _init: function () {
            var t = this, e = t.element, i = t.options;
            t.ptable = e, i.lastColumnWidth ? t.ptableHeadDiv = t.ptable.find('.table_body') : t.ptableHeadDiv = t.ptable.find('.table_header'), t.ptableHeadTable = t.ptableHeadDiv.find('table.product_table'), t.ptableHeadTbody = t.ptableHeadDiv.find('table.product_table>tbody'), t.ptableBodyDiv = t.ptable.find('.table_body'), t.ptableBodyTable = t.ptableBodyDiv.find('table.product_table'), t.ptableBodyTbody = t.ptableBodyDiv.find('table.product_table>tbody'), i.lastColumnWidth ? t.ptableBodyDiv.find('table.product_table').css('table-layout', 'fixed') : t.ptableBodyTable.find('thead').html(t.ptableHeadTable.find('thead').html()).css({
                visibility: 'hidden',
                height: '0px',
                lineHeight: '0px'
            }).find('th').css({
                height: '0px',
                lineHeight: '0px'
            }), 'numeric' == i.numberType && t.ptableBodyDiv.beScroll({
                axis: 'yx', whileScrolling: function () {
                    var e = t.ptableBodyTbody.closest('.mCSB_container').css('left');
                    t.ptableHeadTable.css('margin-left', e);
                }
            });
        },
        updateHybirdColumnsWidth: function () {
            var t = this, e = t.element, i = t.options;
            if (t.isHybirdNumType) {
                for (var a = 0, l = 0, d = i.columns.length; l < d; l++) {
                    var n = i.columns[l];
                    $.isNumeric(n.origin_width) && (a += n.width);
                }
                if (0 != a)for (var r = e.width(), o = r - a, l = 0, d = i.columns.length; l < d; l++) {
                    var n = i.columns[l];
                    if ($.isNumeric(n.origin_width))n.width = 100 * (n.origin_width / r) + '%'; else {
                        var s = parseFloat(n.origin_width), p = s / 100 * r, h = p * (o / r) / r;
                        n.width = 100 * h + '%';
                    }
                    e.find('thead [data-id=\"' + n.id + '\"]').css('width', n.width);
                }
            }
        },
        showError: function (t) {
            var e = this;
            e.element, e.options;
            e.ptableBodyDiv.find('.pg-loading').remove(), e.ptableBodyTbody.html('<p class=\"none_info\">' + t + '</p>');
        },
        load: function (e) {
            var i = this, a = (i.element, i.options), l = [];
            if ($.isArray(e)) {
                l = e;
                for (var d = 0, n = l.length; d < n; d++)l[d]._rowId || (l[d].id ? l[d]._rowId = l[d].id : l[d]._rowId = 'r' + Math.random());
            } else for (var r in e)e[r]._rowId = r, l.push(e[r]);
            0 == e.length && i.ptableBodyDiv.html('没有数据');
            for (var o = i.ptableHeadTable.find('>thead').find('th'), s = '', d = 0, n = l.length; d < n; d++) {
                var r = l[d]._rowId;
                s = s + '<tr data-rid=\"' + r + '\">';
                for (var p = '', h = 0, b = o.size(); h < b; h++) {
                    var c = $(o.get(h)), u = l[d], r = u._rowId, m = c.data('id'), f = i.columnsInfo[m];
                    f.colIdx = h;
                    var y = '', v = '';
                    f.cellTmpl && (y = f.cellTmpl, v = t.templateText(y, u)), $.isFunction(f.cellRender) && (v = f.cellRender(f, u));
                    var w = f.cellTip ? t.templateText(f.cellTip, u) : v;
                    if (w != t.htmlEscape(w))try {
                        w = $(w).text();
                    } catch (t) {
                    }
                    p = p + '<td data-cid=\"' + f.id + '\"><span class=\"cell-product cell-text\" title=\"' + w + '\">' + v + '</span></td>';
                }
                s = s + p + '</tr>';
            }
            i.ptableBodyDiv.find('.pg-loading').remove(), i.ptableBodyTbody.html(s), a.lastColumnWidth && (i.ptableHeadTable.find('th:last').width(a.lastColumnWidth), i.ptableBodyTbody.find('tr').each(function () {
                $(this).find('td:last').find('span').css('max-width', a.lastColumnWidth);
            })), i.currentData = e;
        },
        getRowData: function (t) {
            if ($.isArray(me.currentData))for (var e = 0, i = me.currentData.length; e < i; e++) {
                var a = me.currentData[e];
                if (a._rowId == _rowId)return a;
            }
        }
    }), module.exports = $;
})
define("crm/js/apps/crm/crm.js", ["core/rkloader.js", "crm/js/apps/crm/crmToolbar.js", "crm/js/core/grid/grid.js", "crm/js/core/grid/subgrid.js", "crm/js/apps/crm/tmpl/page.tpl", "crm/js/apps/crm/tmpl/toolbar.tpl"], function (require, exports, module) {
    'use strict';
    var t = require('rk');
    return require('./crmToolbar'), require('../../core/grid/grid'), require('../../core/grid/subgrid'), $.widget('rk.crm', {
        gridConId: 'crm_grid_con',
        gridId: 'div_main_content',
        toolbarId: 'crm_toolbar',
        detailId: 'crm_detail',
        listData: null,
        options: {_appName: null},
        _create: function () {
            var t = this;
            t.element, t.options;
        },
        _init: function () {
            var t = this;
            t.element, t.options;
            t._initCustomizedHtml ? t._initCustomizedHtml() : t._initHtml(), t._initCustomizedGrid ? t._initCustomizedGrid() : t._initGrid(), t._initDetailPopup(), t._initSubGridPopup();
        },
        _initHtml: function () {
            var i = this, r = i.element, o = i.options, e = require('./tmpl/page.tpl');
            r.find('#div_container_content').html(t.templateText(e, {app: o._appName}));
        },
        _initGrid: function (t) {
            var i = this;
            i.element, i.options;
            i._createGrid(t);
        },
        _initToolbar: function (i) {
            var r = this, o = (r.element, r.options, require('./tmpl/toolbar.tpl'));
            $('#' + r.toolbarId).html(t.templateText(o, i)), 'undefined' == typeof i && (i = {}), r._createToolbar(i);
        },
        _initDetailPopup: function () {
            var i = this, r = i.element, o = i.options, e = $('#div_main_content');
            o._appName;
            r.on('click', '#' + i.gridConId + ' .jqx_grid_row .jqx-grid-cell a.entry_name, #' + i.gridConId + ' .jqx_grid_row .jqx-grid-cell a.entry_name[belongid]', function () {
                var r = $(this), o = r.attr('business');
                if (o && $.inArray(o, ['account', 'partner', 'activityrecord', 'opportunity', 'order', 'paymentplan', 'payment', 'contract', 'customize', 'product']) != -1) {
                    var n = r.attr('belongid'), a = r.attr('businessid'), d = e.jqxGrid('getRowDataById', a);
                    clearTimeout(i.detailClickTimer), i.detailClickTimer = setTimeout(function () {
                        t.crm.popupDetailAsSlide(o, {business: o, belongId: n, id: a}, d);
                        var i = r.closest('div[role=\"row\"]').index(), l = e.jqxGrid('getrowid', i);
                        e = $('#div_main_content'), e.customerList('option', 'detailOpenIndex', l), e.find('div[role=\"gridcell\"]').removeClass('jqx-grid-cell-selected'), r.closest('div[role=\"row\"]').find('div[role=\"gridcell\"]').addClass('jqx-grid-cell-selected');
                    }, 200);
                }
            }), r.on('dblclick', '#' + i.gridConId + ' .jqx_grid_row .jqx-grid-cell a.entry_name, #' + i.gridConId + ' .jqx_grid_row .jqx-grid-cell a.entry_name[belongid]', function (r) {
                var o = $(this), e = o.attr('business');
                if (e && $.inArray(e, ['account', 'partner', 'activityrecord', 'opportunity', 'order', 'paymentplan', 'payment', 'contract', 'customize', 'product']) != -1) {
                    var n = o.attr('belongid'), a = o.attr('businessid');
                    clearTimeout(i.detailClickTimer), t.crm.popupDetailAsWindow(e, {belongid: n, id: a});
                }
            });
        },
        _initSubGridPopup: function () {
            var t = this, i = t.element;
            t.options;
            i.on('click', '#' + t.gridConId + ' .jqx_grid_row .jqx-grid-cell [act=\"popupSub\"]', function () {
                var i = $(this);
                t.popupSubGrid(i);
            });
        },
        _createGrid: function (t) {
            var i = this;
            i.element, i.options;
            'undefined' == typeof t && (t = {});
            var r = {
                param1: 'param1', param2: 'param2', showFilterTips: function (t, r) {
                    $('#' + i.toolbarId).crmToolbar('renderFilterTip', r);
                }, showSortTips: function (t, r) {
                    $('#' + i.toolbarId).crmToolbar('renderSortTip', r);
                }, listNewDataGet: function (t, r) {
                    i.listData = r, i._initCustomizedToolbar ? i._initCustomizedToolbar() : i._initToolbar();
                }, showGridOperations: function (t, r) {
                    $('#' + i.toolbarId).crmToolbar('showGridOperations', r);
                }, hideGridOperations: function (t, r) {
                    $('#' + i.toolbarId).crmToolbar('hideGridOperations', r);
                }, resizeToolbar: function (t, r) {
                    $('#' + i.toolbarId).crmToolbar('filterTipArrowAdded');
                }
            };
            for (var o in t)r[o] = t[o];
            $('#' + i.gridConId).find('#' + i.gridId).customerList(r);
        },
        _createToolbar: function (t) {
            var i = this;
            i.element, i.options;
            'undefined' == typeof t && (t = {});
            var r = {
                param1: 'param1', param2: 'param2', initData: i.listData, clearAllFilter: function () {
                    $('#' + i.gridId).customerList('clearAllFilter');
                }, clearFilter: function (t, r) {
                    $('#' + i.gridId).customerList('clearFilter', r);
                }, clearSort: function () {
                    $('#' + i.gridId).customerList('clearSort');
                }
            };
            for (var o in t)r[o] = t[o];
            $('#' + i.toolbarId).crmToolbar(r);
        },
        closeSubGrid: function () {
            $('#' + me.gridId).customerList('closeSubGrid');
        },
        popupSubGrid: function (t) {
            var i = this, r = (i.element, i.options, t.attr('rowid'));
            $.isNumeric(r) && (r = parseInt(r));
            var o = $('#' + i.gridId).customerList('getRowDataById', r);
            $('#' + i.gridId).customerList('popupSubGrid', t).then(function (r, e) {
                var n = i._renderSubGrid(t, r, o);
                n.complete(function () {
                    $('#' + i.gridId).customerList('adjustSubGridPosition', t), e();
                });
            });
        },
        setTitle: function () {
            var i = this, r = (i.element, i.options), o = t.getUrlParam('fromBelongId'), e = t.getUrlParam('fromDataId');
            $.post('/json/crm_oa/fromobject.action', {fromBelongId: o, fromDataId: e}, function (i, o, e) {
                var i = $.parseJSON(i), n = r.returnOrder ? t.i18n('ORDER_14') : SESSION.keywords[i.data.fromObject.actionName] || i.data.fromObject.belongLabel, a = i.data.fromObject.belongId > 999 ? '&belongId=' + i.data.fromObject.belongId : '', d = ['/', i.data.fromObject.actionName, '_detail.action?id=', i.data.fromObject.id, a].join('');
                t.setTitle([n, {title: i.data.fromObject.name, href: d}]);
            });
        },
        _loadSubGridData: function (t, i) {
        }
    }), $;
})
define("crm/js/core/grid/gridBase.js", ["core/rkloader.js", "crm/js/apps/crm/crm.js"], function (require, exports, module) {
    'use strict';
    var e = require('rk');
    require('crm/js/apps/crm/crm'), $.widget('rk.gridBase', $.rk.crm, {
        options: {
            details: [],
            appName: 'account',
            entityName: SESSION.keywords.account
        }, _create: function () {
            var e = this;
            e.element, e.options;
        }, _initCustomizedToolbar: function () {
            var e = this, t = (e.element, e.options), n = e._getTmpl(), a = {
                entityName: t.entityName,
                entityKeyword: t.appName,
                toolbarTpl: n
            };
            t.toolbarExtra && (a = $.extend(a, t.toolbarExtra)), e._initToolbar(a);
        }, _getTmpl: function () {
        }, _initCustomizedGrid: function () {
            var e = this, t = (e.element, e.options), n = e._getGridOption();
            n = $.extend(n, {
                dataBeforeProcessing: function (t, n, a, i, r, c) {
                    e._dataHandler(t, n, a, i, r, c);
                }, appName: t.appName
            }), e.gridOpt = n, e._createGrid(n), e._gridOperate(), $('#div_main').newEditVisibleItems({
                onSuccess: function () {
                    $('#div_main').find('a[act=closeGridOperate]').trigger('click'), e._createGrid(n);
                }
            }), $.each(t.details, function (e, t) {
                t.init && t.init();
            });
        }, _getGridOption: function () {
            var e = this, t = (e.element, e.options);
            return t.gridOption;
        }, _gridOperate: function () {
        }, _dataHandler: function (e, t, n, a, i, r, c) {
            var s = this, o = (s.element, s.options);
            if ('expense' == o.appName && (t.belongId = 63), 'expenseaccount' == o.appName && (t.belongId = 64), $.each(t, function (e, n) {
                    4 == r[e] ? (t[e + '_value'] = n && i[e] ? $.map(n, function (t) {
                        return i[e][t] && i[e][t].name;
                    }).join(',') : '', c && (t[e] = t[e + '_value'])) : 7 == r[e] ? c && $('#div_main_content').jqxGrid('setcellvaluebyid', t.id, e, Number(n)) : i[e] && (t[e + '_value'] = n && i[e][n] ? i[e][n].name : '', 'relateEntity' == e && (t[e + '_value'] = t[e]), c && (t[e] = t[e + '_value']));
                }), '' != t.parentAccountId) {
                if ('' == n.accountList)return;
                for (var p in n.accountList)t.parentAccountId == n.accountList[p].id && (t.parentAccountName = n.accountList[p].accountName);
            }
            t.parentAccountId = String(t.parentAccountId);
            for (var d = 1; d <= 20; d++) {
                var l = t['dbcRelation' + d];
                if (l) {
                    var m = r['dbcRelation' + d + '_relationBelong'] + '_' + l;
                    t['dbcRelation' + d] = n.relations[m] || t['dbcRelation' + d];
                }
            }
            if (t.applicantId && n.users[t.applicantId] && (t.applicantIdIcon = n.users[t.applicantId].icon || DEFAULTS.USER_DEFAULT_ICON, t.applicantIdName = n.users[t.applicantId].name), t.campaignId && (t.campaignName = n.campaigns && n.campaigns[t.campaignId] && n.campaigns[t.campaignId].campaignName || ''), t.accountId && (t.accountName = n.accounts[t.accountId] ? n.accounts[t.accountId].accountName : '', t.accountType = n.accounts[t.accountId] ? n.accounts[t.accountId].accountType : ''), 'case' != o.appName && (t.product = t.product && 'object' == typeof t.product ? $.map(t.product, function (e) {
                    return e.name;
                }).join(', ') : ''), t.entityType && Number(t.entityType) && (t.entityTypeId = t.entityType, t.entityType = n.entityTypes && n.entityTypes[t.entityType] && n.entityTypes[t.entityType].name, t.entityName = t.entityType), 'account' == o.appName && (t.hasOppListPermission = 1 == a.permission.func.opportunity.l), t.status && (t.status_select_item_id = t.status, t.status_id = t.status), t.contractId && Number(t.contractId) && n.contracts) {
                var u = n.contracts[t.contractId];
                t.contractName = u ? u.contractName : '';
            }
            if (t.opportunityId && Number(t.opportunityId)) {
                var _ = n.opportunities[t.opportunityId];
                t.opportunityName = _ ? _.opportunityName : '';
            }
            if (t.hasProductListPermission = 1, t.signerId && Number(t.signerId) && n.users[t.signerId] && (t.signerIcon = n.users[t.signerId].icon || DEFAULTS.USER_DEFAULT_ICON, t.signerName = n.users[t.signerId].name), t.lockValue = t.lockStatus, t.lockUser && n.users[t.lockUser].name && (t.lockUserName = n.users[t.lockUser].name), t.contactId && n.contacts[t.contactId]) {
                var y = n.contacts[t.contactId];
                t.contactName = y ? y.contactName : '';
            }
            t.expenseType && n.expenseTypes[t.expenseType] && (t.expenseTypeName = n.expenseTypes[t.expenseType].name), t.expenseAccountId && n.expenseAccounts[t.expenseAccountId] && (t.expenseAccountTitle = n.expenseAccounts[t.expenseAccountId].name), t.relateEntity && '' != t.relateEntity && t.relateEntityId && '' != t.relateEntityId && (1 == t.relateEntity ? t.relateEntityName = n.accounts && n.accounts[t.relateEntityId] && n.accounts[t.relateEntityId].name || '' : 2 == t.relateEntity ? t.relateEntityName = n.contacts && n.contacts[t.relateEntityId] && n.contacts[t.relateEntityId].name || '' : 3 == t.relateEntity ? t.relateEntityName = n.opportunities && n.opportunities[t.relateEntityId] && n.opportunities[t.relateEntityId].name || '' : 6 == t.relateEntity ? t.relateEntityName = n.campaigns && n.campaigns[t.relateEntityId] && n.campaigns[t.relateEntityId].name || '' : 66 == t.relateEntity ? t.relateEntityName = n.accounts && n.accounts[t.relateEntityId] && n.accounts[t.relateEntityId].name || '' : 67 == t.relateEntity ? t.relateEntityName = n.accounts && n.accounts[t.relateEntityId] && n.accounts[t.relateEntityId].name || '' : t.relateEntityName = n.customDatas && n.customDatas[t.relateEntityId] && n.customDatas[t.relateEntityId].name || ''), t.orderId && (t.orderName = n.orders && n.orders[t.orderId] && n.orders[t.orderId].name || '', t.orderAmount = n.orders && n.orders[t.orderId] && n.orders[t.orderId].amount || '', t.orderPayBack = n.orders && n.orders[t.orderId] && n.orders[t.orderId].payBack || ''), (t.contractId && 'payment' == o.appName || 'paymentplan' == o.appName) && (t.contractName = n.contracts && n.contracts[t.contractId] && n.contracts[t.contractId].name || '', t.contractAmount = n.contracts && n.contracts[t.contractId] && n.contracts[t.contractId].amount || '', t.contractPayBack = n.contracts && n.contracts[t.contractId] && n.contracts[t.contractId].payBack || ''), t.lastOwnerId && n.users[t.lastOwnerId] && (t.lastOwnerIcon = n.users[t.lastOwnerId].icon || DEFAULTS.USER_DEFAULT_ICON, t.lastOwnerName = n.users[t.lastOwnerId].name);
        }
    }), $.widget('rk.gridOperateBase', {
        options: {}, _create: function () {
            var e = this, t = e.options, n = (e.element, ''), a = '', i = '';
            'customize' == t.appName ? (a = $('#div-customize-info').attr('belongName'), n = '?belongId=' + $('#div-customize-info').attr('belongId'), i = 'name') : (a = SESSION.keywords[t.appName], i = 'contract' == t.appName ? 'title' : t.appName + 'Name'), e.isCustomize = n, e.belongName = a, e.dataName = i, e._bindCommonOp(), e._bindOwnOp();
        }, _bindCommonOp: function () {
            var e = this, t = (e.options, e.element);
            t.find('a[act=closeGridOperate]').on('click', function () {
                t.find('div.grid_operate').hide();
            }), e._deleteOp(), e._transferOp(), e._removeOp(), e._mergeOp(), e._batchFollowOp();
        }, _deleteOp: function () {
            var t = this, n = t.options, a = t.element;
            a.on('click', 'a[act^=\"multiDelete\"]', function () {
                var a = $('#div_main_content').customerList('getSelectedData'), i = a.length > 1 ? e.i18n('ACCOUNT_SELECTED_ACCOUNTS_STRING', a.length, t.belongName) : t.belongName + '\u3010' + a[0][t.dataName] + '\u3011', r = e.i18n('ACCOUNT_DELETE_ARRAY_STRING_1', i);
                $.confirm(r, function () {
                    var i = {};
                    i[n.appName + 'Ids'] = $.map(a, function (e) {
                        return e.id;
                    }).join(','), $.postJson('/json/crm_' + n.appName + '/delete.action' + t.isCustomize, i).done(function (t) {
                        if (0 == t.status)$('#div_main_content').jqxGrid('clearselection', !1, !1), $('#div_main_content').trigger('rowunselect'), $('#div_main_content').jqxGrid('updatebounddata', 'data'), $.msg(e.i18n('CRM_CORE_DELETE') + e.i18n('CRM_CORE_SUCCESS'), 1); else if (t.data) {
                            var n = $.map(JSON.parse(t.data), function (t) {
                                return [e.i18n('CRM_CORE_DELETE') + '\u3010', t.name, '\u3011' + e.i18n('CRM_CORE_FAILED') + '\uFF1A', t.message].join('');
                            }).join('<br/>');
                            $.msg(n);
                        } else $.msg(e.i18n('CRM_CORE_DELETE') + e.i18n('CRM_CORE_FAILED'));
                    }).fail(function (t, n, a) {
                        0 != t.status && $.msg(e.i18n('REQUEST_ERROR'));
                    });
                });
            });
        }, _transferOp: function () {
            var t = this, n = t.options, a = t.element;
            a.on('click', 'a[act^=\"multiTransfer\"]', function () {
                var a = $('#div_main_content').customerList('getSelectedData'), i = {};
                'customize' == n.appName && (i.belongId = $('#div-customize-info').attr('belongId')), i[n.appName + 'Ids'] = $.map(a, function (e) {
                    return e.id;
                }).join(','), $.postJson('/json/crm_' + n.appName + '/validate-transfer.action', i).done(function (r) {
                    if (0 == r.status) {
                        var c = a.length > 1 ? e.i18n('ACCOUNT_SELECTED_ACCOUNTS_STRING', a.length, t.belongName) : t.belongName + '\u3010' + a[0][t.dataName] + '\u3011', s = '<div class=\"pop_up_02\"><div class=\"pop_up_content\"><div class=\"add_new_list clear\"><div class=\"field clear\"><div class=\"field_name\"></div><div class=\"field_content\">', o = '</div></div><div class=\"field clear\"><div class=\"field_name\">' + e.i18n('CRM_CORE_NEW') + e.i18n('CRM_CORE_IN_CHARGE') + '\uFF1A</div><div class=\"field_content\"><input type=\"text\" class=\"text\" field=\"transferUser\" placeholder=\"' + e.i18n('CRM_CORE_INPUT_SELECT') + e.i18n('CRM_CORE_IN_CHARGE') + '\"></div></div></div></div><div class=\"pop_up_bottom\"><div class=\"pop_up_button\"><a title=\"\" href=\"javascript:;\" class=\"green_button\" act=\"save\">' + e.i18n('CRM_CORE_CONFIRM') + '</a></div></div></div>', p = e.i18n('ACCOUNT_TRANSFER_ARRAY_STRING', s, c, o);
                        t.$dialog = $(p);
                        var d = t.$dialog.find('input[field=transferUser]');
                        t.$dialog.popup({
                            width: 520,
                            title: e.i18n('CRM_CORE_TRANSFER') + t.belongName,
                            actions: {
                                save: function (t, a) {
                                    var r = d.attr('ownerId');
                                    r ? (i.target = r, $.postJson('/json/crm_' + n.appName + '/transfer.action', i).done(function (t) {
                                        if ($.msg(t.statusText, 0 == t.status), 0 == t.status)$('#div_main_content').jqxGrid('clearselection', !1, !1), $('#div_main_content').trigger('rowunselect'), $('#div_main_content').jqxGrid('updatebounddata', 'data'), $.msg(e.i18n('CRM_CORE_TRANSFER') + e.i18n('CRM_CORE_SUCCESS'), 1), a.close(); else if (t.data) {
                                            $.map(JSON.parse(t.data), function (t) {
                                                return [e.i18n('CRM_CORE_TRANSFER') + '\u3010', t.name, '\u3011' + e.i18n('CRM_CORE_FAILED') + '\uFF1A', t.message].join('');
                                            }).join('<br/>');
                                        } else $.msg(e.i18n('CRM_CORE_TRANSFER') + e.i18n('CRM_CORE_FAILED'));
                                    })) : $.msg(e.i18n('ACCOUNT_SELECTED_TRANSFER_TO'));
                                }
                            },
                            create: function () {
                                d.autocomplete({
                                    minLength: 0, source: function (e, t) {
                                        var n = $.trim(e.term);
                                        $.postJson('/json/crm_search/all-users.action', {
                                            pageNo: 1,
                                            key: n
                                        }).done(function (e) {
                                            var a;
                                            e.length > 0 && $.each(e, function (e, t) {
                                                t.value == n && (a = t.id);
                                            }), a ? d.attr('ownerId', a) : d.removeAttr('ownerId'), t(e);
                                        });
                                    }, select: function (e, t) {
                                        var n = t.item.id;
                                        d.attr('ownerId', n);
                                    }
                                });
                            }
                        });
                    } else 300001 == r.status ? $.msg(e.i18n('CRM_CORE_NO_PERMISSION') + e.i18n('CRM_CORE_TRANSFER') + '\u3010' + r.data + '\u3011') : 310005 == r.status && $.msg(e.i18n('CAMPAIGN_LEAD_TRANSFER_CONDITION_FAILED', '\u3010' + r.data + '\u3011', t.belongName));
                }).fail(function (t, n, a) {
                    $.msg(e.i18n('REQUEST_ERROR'));
                });
            });
        }, _removeOp: function () {
            var t = this, n = t.options, a = t.element;
            a.on('click', 'a[act^=\"multiRemove\"]', function () {
                var t = $('#div_main_content').customerList('getSelectedData'), a = null != $('#div_main_content').customerList('getSearchData').relationIds ? $.parseJSON($('#div_main_content').customerList('getSearchData').relationIds) : {}, i = {
                    opportunityId: $.query('fromDataId'),
                    entityIds: $.map(t, function (e) {
                        return 'contact' == n.appName ? e.oppContactId : a[e.id];
                    }).join(',')
                };
                return $.confirm(e.i18n('CRM_CORE_REMOVE_CONFIRM_1'), function () {
                    $.postJson('/json/crm_opportunity/remove-accounts.action', i).done(function (t) {
                        0 == t.status ? ($('#div_main_content').jqxGrid('clearselection', !1, !1), $('#div_main_content').trigger('rowunselect'), $('#div_main_content').jqxGrid('updatebounddata', 'data')) : $.msg(e.i18n('CRM_CORE_REMOVE') + e.i18n('CRM_CORE_FAILED'));
                    }).fail(function (t, n, a) {
                        0 != t.status && $.msg(e.i18n('REQUEST_ERROR'));
                    });
                }), !1;
            });
        }, _mergeOp: function () {
            var t = this, n = t.options, a = t.element;
            a.on('click', 'a[act^=\"merger\"]', function () {
                var a = '<div class=\"pop_up_02\"><div class=\"pop_up_content\">', i = '</div><div class=\"pop_up_bottom\"><div class=\"pop_up_button\"><a class=\"cancel\" act=\"close\" href=\"javascript:void(0)\" title=\"\">' + e.i18n('CRM_CORE_CANCEL') + '</a><a act=\"merge\" class=\"green_button\" href=\"javascript:void(0)\" title=\"\">' + e.i18n('ACCOUNT_BEGIN_MERGE') + '</a></div></div></div>', r = $('#div_main_content').customerList('getSelectedData');
                if (2 !== r.length)return void $.msg(e.i18n('ACCOUNT_MERGE_SELECT', t.belongName));
                var c = $.map(r, function (e) {
                    return e.id;
                }).join(',');
                $.getJSON('/json/crm_' + n.appName + '/popup-merge.action', {mergeIds: c}).done(function (c) {
                    if (0 == c.status) {
                        var s = t._renderMergeViewHtml(c.data), o = $([a, $.trim(s), i].join(''));
                        o.popup({
                            panel: !0, width: 600, title: t.belongName + e.i18n('CRM_CORE_MERGE'), open: function () {
                                $(this).popup('refresh');
                            }, actions: {
                                merge: function (a, i) {
                                    var c = $(this);
                                    $.confirm(e.i18n('ACCOUNT_MERGE_CONFIRM', t.belongName), function () {
                                        c.loading();
                                        var t = {
                                            iframe: !1, success: function (t) {
                                                0 == t.status ? (i.destroy(), $('#div_main_content').jqxGrid('clearselection', !1, !1), $('#div_main_content').trigger('rowunselect'), $('#div_main_content').jqxGrid('updatebounddata', 'data'), $.each(r, function (e, t) {
                                                    $('#div_main_content').jqxGrid('unselectrow', t.rowindex);
                                                }), $.msg(e.i18n('CRM_CORE_MERGE') + e.i18n('CRM_CORE_SUCCESS'), 1)) : (c.loading('delay'), $.msg(e.i18n('CRM_CORE_MERGE') + e.i18n('CRM_CORE_FAILED')));
                                            }
                                        };
                                        $('#nid_' + n.appName + 'merge_form').ajaxSubmit(t);
                                    });
                                }, close: function (e, t) {
                                    t.destroy();
                                }
                            }, create: function () {
                                var e = $(this);
                                e.find('a.nc_left_all').on('click', function (e) {
                                    e.preventDefault(), $(':radio.nc_left').attr('checked', 'checked'), $(':radio.nc_right').removeAttr('checked');
                                }), e.find('a.nc_right_all').on('click', function (e) {
                                    e.preventDefault(), $(':radio.nc_right').attr('checked', 'checked'), $(':radio.nc_left').removeAttr('checked');
                                }), e.find('input.nc_left_all').on('click', function (e) {
                                    $(':radio.nc_left').attr('checked', 'checked'), $(':radio.nc_right').removeAttr('checked');
                                }), e.find('input.nc_right_all').on('click', function (e) {
                                    $(':radio.nc_right').attr('checked', 'checked'), $(':radio.nc_left').removeAttr('checked');
                                });
                            }
                        });
                    }
                    310090 == c.status && $.msg(e.i18n('ACCOUNT_MERGE_CONDITION_FAILED_1', t.belongName)), 310091 == c.status && $.msg(e.i18n('ACCOUNT_MERGE_CONDITION_FAILED_2', t.belongName)), 310092 == c.status && $.msg(e.i18n('ACCOUNT_MERGE_CONDITION_FAILED_3', t.belongName)), 310093 == c.status && $.msg(e.i18n('ACCOUNT_MERGE_CONDITION_FAILED_4')), 310094 == c.status && $.msg(e.i18n('OPPORTUNITY_MERGE_CONDITION_FAILED', SESSION.keywords.account));
                }).fail(function (t, n, a) {
                    0 != t.status && $.msg(e.i18n('REQUEST_ERROR'));
                });
            });
        }, _batchFollowOp: function () {
            var t = this, n = t.options, a = t.element;
            a.on('click', 'a[act=batchFollow]', function () {
                var t = $('#div_main_content').customerList('getSelectedData'), a = $.map(t, function (e) {
                    return e.id;
                }).join(',');
                $.postJson('/json/sns_group/batchFollow.action', {
                    entityIds: a,
                    belongId: Number(e.queryBelong(n.appName).id)
                }).done(function (t) {
                    0 == t.status ? $.msg(e.i18n('CRM_CORE_FOLLOW') + e.i18n('CRM_CORE_SUCCESS'), 1) : $.msg(e.i18n('CRM_CORE_FOLLOW_FAILED'));
                }).fail(function (t, n, a) {
                    $.msg(e.i18n('REQUEST_ERROR'));
                });
            });
        }, _bindOwnOp: function () {
        }, _renderMergeViewHtml: function (t) {
            var n = this, a = n.options, i = (n.element, '<div class=\"account_merge clear\">');
            return i += '<p class=\"tip_info\">', i += 'account' == a.appName ? e.i18n('ACCOUNT_MERGE_RECORD_TIP', n.belongName) : e.i18n('OPPORTUNITY_MERGE_RECORD_TIP', n.belongName), i += '</p>', i += '<form method=\"post\" id=\"nid_' + a.appName + 'merge_form\" action=\"/json/crm_' + a.appName + '/save-merge.action\">', i += '<table cellpadding=\"0\" cellspacing=\"0\" class=\"account_table\">', i += '<tr class=\"table_head\">', i += '<th class=\"left_th\"></th>', i += '<th>' + e.htmlEscape(t.businessNameA) + '&nbsp;[<a class=\"nc_left_all\" href=\"javascript:void(0);\">' + e.i18n('CRM_CORE_SELECT_ALL') + '</a>]</th>', i += '<th>' + e.htmlEscape(t.businessNameB) + '&nbsp;[<a class=\"nc_right_all\" href=\"javascript:void(0);\">' + e.i18n('CRM_CORE_SELECT_ALL') + '</a>]</th>', i += '</tr>', i += '<tr class=\"high_light\">', i += '<th class=\"left_th\">' + e.i18n('ACCOUNT_MAIN_RECORD') + '</th>', i += '<td><input type=\"radio\" name=\"' + a.appName + 'MainId\" class=\"nc_left nc_left_all\" value=\"' + t.businessIdA + '\" checked=\"checked\" /></td>', i += '<td><input type=\"radio\" name=\"' + a.appName + 'MainId\" class=\"nc_right nc_right_all\" value=\"' + t.businessIdB + '\" ' + (1 == t.lockFirst ? 'disabled=\"disabled\"' : '') + '/></td>', i += '<input type=\"hidden\" name=\"' + a.appName + 'AId\" value=\"' + t.businessIdA + '\">', i += '<input type=\"hidden\" name=\"' + a.appName + 'BId\" value=\"' + t.businessIdB + '\">', i += '</tr>', $.each(t.mergeData, function (t, n) {
                if (1 != n.itemTypeEntry && 2 != n.itemTypeEntry && 3 != n.itemTypeEntry && 4 != n.itemTypeEntry && 5 != n.itemTypeEntry && 6 != n.itemTypeEntry && 7 != n.itemTypeEntry && 99 != n.itemTypeEntry)return !0;
                if ('account' == a.appName && 99 == n.itemTypeEntry && 'account.accountName' != n.entryPropertyName && 'account.zipCode' != n.entryPropertyName && 'account.phone' != n.entryPropertyName && 'account.fax' != n.entryPropertyName && 'account.ownerId' != n.entryPropertyName && 'account.industryId' != n.entryPropertyName && 'account.comment' != n.entryPropertyName)return !0;
                if ('opportunity' == a.appName && 99 == n.itemTypeEntry && 'opportunity.opportunityName' != n.entryPropertyName && 'opportunity.ownerId' != n.entryPropertyName)return !0;
                if (i += '<tr' + (1 == n.isHighLight ? ' class=\"high_light\"' : '') + '>', i += '<th class=\"left_th\">' + e.htmlEscape(n.itemName) + '</th>', n.businessValueA = e.htmlEscape(n.businessValueA) || '', n.businessValueB = e.htmlEscape(n.businessValueB) || '', '' == n.businessValueA && '' == n.businessValueB)i += '<td></td><td></td>'; else {
                    var r = 'account' == a.appName && 1 == n.readOnlyFlag ? ' disabled ' : '';
                    if (1 == n.itemTypeEntry || 2 == n.itemTypeEntry || 5 == n.itemTypeEntry)i += '<td><input type=\"radio\" ' + r + ' checked=\"checked\" class=\"nc_left\" name=\"paramMap[\'' + n.entryPropertyNameOnly + '\']\" value=\"' + n.businessValueA + '\"/><span>' + n.businessValueA + '</span></td>', i += '<td><input type=\"radio\" ' + r + ' class=\"nc_right\" name=\"paramMap[\'' + n.entryPropertyNameOnly + '\']\" value=\"' + n.businessValueB + '\"/><span>' + n.businessValueB + '</span></td>'; else if (3 == n.itemTypeEntry) {
                        var c = '', s = '';
                        $.each(n.selectItemNameArray, function (t, n) {
                            c += (e.htmlEscape(n.selectItemNameA) || '') + ' ', s += (e.htmlEscape(n.selectItemNameB) || '') + ' ';
                        }), i += '<td><input type=\"radio\" ' + r + ' checked=\"checked\" class=\"nc_left\" name=\"paramMap[\'' + n.entryPropertyNameOnly + '\']\" value=\"' + n.businessValueA + '\"/><span>' + c + '</span></td>', i += '<td><input type=\"radio\" ' + r + ' class=\"nc_right\" name=\"paramMap[\'' + n.entryPropertyNameOnly + '\']\" value=\"' + n.businessValueB + '\"/><span>' + s + '</span></td>';
                    } else 4 == n.itemTypeEntry ? (i += '<td><input type=\"radio\" ' + r + ' checked=\"checked\" class=\"nc_left\" name=\"paramMap[\'' + n.entryPropertyNameOnly + '\']\" value=\"' + e.htmlEscape(n.checkValueA) + '\"/><span>' + n.businessValueA + '</span></td>', i += '<td><input type=\"radio\" ' + r + ' class=\"nc_right\" name=\"paramMap[\'' + n.entryPropertyNameOnly + '\']\" value=\"' + e.htmlEscape(n.checkValueB) + '\"/><span>' + n.businessValueB + '</span></td>') : 6 == n.itemTypeEntry ? (i += '<td><input type=\"radio\" ' + r + ' checked=\"checked\" class=\"nc_left\" name=\"paramMap[\'' + n.entryPropertyNameOnly + '\']\" value=\"' + n.businessValueA + '\"/><span>' + (n.currencyFlg ? numeral(n.businessValueA).format('0,0.[00]') : n.businessValueA) + '</span></td>', i += '<td><input type=\"radio\" ' + r + ' class=\"nc_right\" name=\"paramMap[\'' + n.entryPropertyNameOnly + '\']\" value=\"' + n.businessValueB + '\"/><span>' + (n.currencyFlg ? numeral(n.businessValueB).format('0,0.[00]') : n.businessValueB) + '</span></td>') : 7 == n.itemTypeEntry ? (i += '<td><input type=\"radio\" ' + r + ' checked=\"checked\" class=\"nc_left\" name=\"paramMap[\'' + n.entryPropertyNameOnly + '\']\" value=\"' + n.businessValueA + '\"/><span>' + (2 == n.dateMode ? Globalize.format(new Date(n.businessValueA - 0), 'yyyy-MM-dd HH:mm') : Globalize.format(new Date(n.businessValueA - 0), 'yyyy-MM-dd')) + '</span></td>', i += '<td><input type=\"radio\" ' + r + ' class=\"nc_right\" name=\"paramMap[\'' + n.entryPropertyNameOnly + '\']\" value=\"' + n.businessValueB + '\"/><span>' + (2 == n.dateMode ? Globalize.format(new Date(n.businessValueB - 0), 'yyyy-MM-dd HH:mm') : Globalize.format(new Date(n.businessValueB - 0), 'yyyy-MM-dd')) + '</span></td>') : 99 == n.itemTypeEntry && ('account.accountName' == n.entryPropertyName || 'account.zipCode' == n.entryPropertyName || 'account.phone' == n.entryPropertyName || 'account.fax' == n.entryPropertyName || 'account.comment' == n.entryPropertyName || 'opportunity.opportunityName' == n.entryPropertyName ? (i += '<td><input type=\"radio\" ' + r + ' checked=\"checked\" class=\"nc_left\" name=\"paramMap[\'' + n.entryPropertyNameOnly + '\']\" value=\"' + n.businessValueA + '\"/><span>' + n.businessValueA + '</span></td>', i += '<td><input type=\"radio\" ' + r + ' class=\"nc_right\" name=\"paramMap[\'' + n.entryPropertyNameOnly + '\']\" value=\"' + n.businessValueB + '\"/><span>' + n.businessValueB + '</span></td>') : 'account.ownerId' == n.entryPropertyName || 'opportunity.ownerId' == n.entryPropertyName ? (i += '<td><input type=\"radio\" ' + r + ' checked=\"checked\" class=\"nc_left\" name=\"paramMap[\'' + n.entryPropertyNameOnly + '\']\" value=\"' + n.businessValueA + '\"/><span>' + (e.htmlEscape(n.ownerNameA) || '') + '</span></td>', i += '<td><input type=\"radio\" ' + r + ' class=\"nc_right\" name=\"paramMap[\'' + n.entryPropertyNameOnly + '\']\" value=\"' + n.businessValueB + '\"/><span>' + (e.htmlEscape(n.ownerNameB) || '') + '</span></td>') : 'account.industryId' == n.entryPropertyName && (i += '<td><input type=\"radio\" ' + r + ' checked=\"checked\" class=\"nc_left\" name=\"paramMap[\'' + n.entryPropertyNameOnly + '\']\" value=\"' + n.businessValueA + '\"/><span>' + e.htmlEscape(n.industryNameA) + '</span></td>', i += '<td><input type=\"radio\" ' + r + ' class=\"nc_right\" name=\"paramMap[\'' + n.entryPropertyNameOnly + '\']\" value=\"' + n.businessValueB + '\"/><span>' + (e.htmlEscape(n.industryNameB) || '') + '</span></td>'));
                }
                i += '</tr>';
            }), i += '</table>', i += '</form>', i += '</div>';
        }
    });
})