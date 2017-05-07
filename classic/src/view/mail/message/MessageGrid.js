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

    alias : 'widget.cn_mail-mailmessagegrid',

    cls   : 'cn_mail-mailmessagegrid shadow-panel',

    margin : '0 5 0 0',

    flex : 1,

    headerBorders : false,
    rowLines      : false,


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
        width     : 140
    }, {
        dataIndex : 'date',
        align     : 'right',
        text      : 'Date',
        width     : 140
    }, {
        dataIndex : 'size',
        align     : 'right',
        text      : 'Size',
        width     : 80
    }]

});
