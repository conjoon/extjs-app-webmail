/**
 * conjoon
 * (c) 2007-2017 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2017 Thorsten Suckow-Homberg/conjoon.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * The default Message Grid representing the contents of a message folder.
 * This grid's columns are configured to be used with models of the type
 * {@link conjoon.cn_mail.model.mail.MessageItem}.
 */
Ext.define('conjoon.cn_mail.view.mail.message.MessageGrid', {

    extend : 'Ext.grid.Panel',

    requires : [
        'conjoon.cn_comp.grid.feature.RowBodySwitch'
    ],

    alias : 'widget.cn_mail-mailmessagegrid',

    cls   : 'cn_mail-mailmessagegrid',

    flex : 1,

    headerBorders : false,
    rowLines      : false,


    features : [{
        ftype              : 'cn_comp-gridfeature-rowbodyswitch',
        enableCls          : 'previewEnabled',
        disableCls         : 'previewDisabled',
        id                 : 'cn_mail-mailMessageFeature-messagePreview',
        getAdditionalData  : function (data, idx, record, orig) {

            var me = this;

            if (me.disabled) {
                return undefined;
            }

            return {
                rowBody : '<div class="subject '+ (!record.get('isRead') ? 'unread' : '')+'">' + record.get("subject") + '</div>' +
                           '<div class="previewText">' + record.get("previewText") + '</div>',
                rowBodyCls : 'cn_mail-mailmessagepreviewfeature'
            };
        },
        previewColumnConfig : {
            'isRead'         : {visible : false},
            'subject'        : {visible : false},
            'to'             : {visible : false},
            'from'           : {flex : 1},
            'date'           : {},
            'hasAttachments' : {},
            'size'           : {visible : false}
        }
    }],

    viewConfig : {
        markDirty   : false,
        getRowClass : function(record, rowIndex, rowParams, store){
            return record.get("isRead") ? "" : "boldFont";
        }
    },

    columns : [{
        dataIndex : 'isRead',
        text      : '<span class="x-fa fa-circle"></span>',
        /**
         * @bug
         * BufferedStore omly triggeres update of cell if at least metaData and
         * record are specified in its arguments. might be an issue with the
         * needsUpdate computing and considering argument values?
         */
        renderer  : function(value, metaData, record) {
            return '<span class="x-fa fa-circle'+ (!value ? '' : '-thin') +'"></span>';
        },
        menuDisabled : true,
        width        : 40
    }, {
        dataIndex : 'hasAttachments',
        text      : '<span class="x-fa fa-paperclip"></span>',
        renderer  : function(value) {
            return value ? '<span class="x-fa fa-paperclip"></span>' : '';
        },
        menuDisabled : true,
        width        : 40
    }, {
        dataIndex : 'subject',
        text      : 'Subject',
        flex      : 2
    }, {
        dataIndex : 'to',
        text      : 'To',
        width     : 240,
        renderer  : function(value) {
            var names = [];
            for (var i = 0, len = value.length; i < len; i++) {
                names.push(value[i].name);
            }
            return names.join(', ');
        }
    }, {
        dataIndex : 'from',
        text      : 'From',
        width     : 140,
        renderer  : function(value, meta, record, rowIndex, colIndex, store, view) {

            var feature = view.getFeature('cn_mail-mailMessageFeature-messagePreview');

            if (!feature.disabled) {
                meta.tdCls += 'previewLarge';
            }

            return value ? value.name : "";
        }
    }, {
        dataIndex : 'date',
        xtype     : 'datecolumn',
        format    : 'd.m.Y H:i',
        align     : 'right',
        text      : 'Date',
        width     : 140
    }, {
        dataIndex : 'size',
        align     : 'right',
        text      : 'Size',
        width     : 80,
        renderer  : Ext.util.Format.fileSize
    }],


    /**
     * Allows to switch between preview- and detail view, whereas the detail
     * view is a regular gridpanel view with column headers and table cells,
     * and the preview view uses the {conjoon.cn_comp.grid.feature.RowBodySwitch}.
     *
     * @param {Boolean} enable true to switch to the grid view, falsy to
     * switch to preview mode.
     */
    enableRowPreview : function(enable) {

        var me      = this,
            enable  = enable === undefined ? true : !!enable,
            view    = me.getView(),
            feature = view.getFeature('cn_mail-mailMessageFeature-messagePreview');

        if (enable) {
            feature.enable();
        } else {
            feature.disable();
        }
    }

});
