/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
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
 * A MessageGrid can either be configured with an EmptyStore or a
 * conjoon.cn_mail.store.mail.message.MessageItemStore.
 */
Ext.define('conjoon.cn_mail.view.mail.message.MessageGrid', {

    extend : 'Ext.grid.Panel',

    requires : [
        'conjoon.cn_comp.grid.feature.RowBodySwitch',
        'conjoon.cn_comp.grid.feature.Livegrid',
        'conjoon.cn_mail.store.mail.message.MessageItemStore',
        'conjoon.cn_comp.grid.feature.RowFlyMenu'
    ],

    alias : 'widget.cn_mail-mailmessagegrid',


    /**
     * Gets fired when the conjoon.cn_mail.store.mail.message.MessageItemStore
     * beforeload-event fires. This relay is needed due to the late binding behavior
     * of the two-way-databinding. This event is not canceable.
     * @event cn_mail-mailmessagegridbeforeload
     * @param {conjoon.cn_mail.store.mail.message.MessageItemStore} store
     */

    /**
     * Gets fired when the conjoon.cn_mail.store.mail.message.MessageItemStore
     * load-event fires. This relay is needed due to the late binding behavior
     * of the two-way-databinding.
     * @event cn_mail-mailmessagegridload
     * @param {conjoon.cn_mail.store.mail.message.MessageItemStore} store
     */

    /**
     * "storeRelayers" was already taken
     * @private
     */
    myStoreRelayers : null,

    cls : 'cn_mail-mailmessagegrid',

    flex : 1,

    headerBorders : false,
    rowLines      : false,

    selModel : {
        pruneRemoved : false
    },

    features : [{
        ftype : 'cn_comp-gridfeature-livegrid',
        id    : 'cn_mail-mailMessageFeature-livegrid'
    }, {
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
                rowBody :
                          '<div class="head '+ (!record.get('isRead') ? 'unread' : '')+'">' +
                          '<div class="subject '+ (!record.get('isRead') ? 'unread' : '')+'">' + record.get("subject") + '</div>' +
                          '<div class="date">' + Ext.util.Format.date(record.get("date"), "d.m.Y H:i") + '</div>' +
                          '</div>' +
                           '<div class="previewText">' + record.get("previewText") + '</div>',
                rowBodyCls : 'cn_mail-mailmessagepreviewfeature'
            };
        },
        previewColumnConfig : {
            'isRead'         : {visible : false},
            'subject'        : {visible : false},
            'to'             : {visible : false},
            'from'           : {flex : 1},
            'date'           : {visible : false},
            'hasAttachments' : {},
            'size'           : {visible : false}
        }
    }, {
        ftype : 'cn_comp-gridfeature-rowflymenu',
        id    : 'cn_mail-mailMessageFeature-rowFlyMenu',
        items  : [{
            cls    : 'fa fa-envelope-o',
            title  : 'Mark as Unread',
            action : 'markunread',
            id     : 'cn_mail-mailMessageFeature-rowFlyMenu-markUnread'
        }],
        alignTo : ['tr-tr', [-12, 4]]
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
        width     : 150
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
     * @inheritdoc
     */
    initComponent : function() {

        const me = this;

        me.callParent(arguments);

        me.relayEvents(
            me.view.getFeature('cn_mail-mailMessageFeature-rowFlyMenu'),
            ['itemclick', 'beforemenushow'],
            'cn_comp-rowflymenu-'
        );
    },

    /**
     * Allows to switch between preview- and detail view, whereas the detail
     * view is a regular gridpanel view with column headers and table cells,
     * and the preview view uses the {conjoon.cn_comp.grid.feature.RowBodySwitch}.
     * This method will also enable/disable the RowFlyMenu (enabled only if
     * RowPreview is enabled).
     *
     * @param {Boolean} enable true to switch to the grid view, falsy to
     * switch to preview mode.
     */
    enableRowPreview : function(enable) {

        const me         = this,
              view       = me.getView(),
              feature    = view.getFeature('cn_mail-mailMessageFeature-messagePreview'),
              rowFlyMenu = view.getFeature('cn_mail-mailMessageFeature-rowFlyMenu');

        enable = enable === undefined ? true : !!enable;

        if (me.getStore().isLoading()) {
            Ext.raise({
                msg       : 'cannot call enableRowPreview during store\'s load-operation',
                isLoading : me.getStore().isLoading()
            });
        }

        if (enable) {
            feature.enable();
            rowFlyMenu.enable();
        } else {
            feature.disable();
            rowFlyMenu.disable();
        }
    },


    /**
     * Overridden to relay events from the store to this grid
     *
     * @inheritdoc
     */
    bindStore : function(store, initial) {

        const me  = this;

        if (store && !store.isEmptyStore &&
            !(store instanceof conjoon.cn_mail.store.mail.message.MessageItemStore)) {
            Ext.raise({
                msg   : 'store must be an instance of "conjoon.cn_mail.store.message.MessageItemStore"',
                store : store
            });
        }

        if (store && me.getStore() !== store) {
            me.myStoreRelayers = me.relayEvents(store, ['beforeload', 'load'], 'cn_mail-mailmessagegrid');
        }

        return me.callParent(arguments);
    },


    /**
     * Overridden to detach relayed events.
     *
     * @inheritdoc
     */
    unbindStore : function(store) {

        const me = this;

        if (me.myStoreRelayers) {
            me.myStoreRelayers.destroy();
        }
        me.myStoreRelayers = null;

        return me.callParent(arguments);
    },


    /**
     * Updates the current RowFlyMenu for the specified record.
     * Updates the menu's items to represent the proper state for the following
     * properties:
     *  - isRead
     *
     * @param {conjoon.cn_mail.model.mail.message.reader.MessageItem} record
     */
    updateRowFlyMenu : function(record) {

        const me      = this,
              feature = me.view.getFeature('cn_mail-mailMessageFeature-rowFlyMenu'),
              menu    = feature.menu,
              readItem = menu.query('div[id=cn_mail-mailMessageFeature-rowFlyMenu-markUnread]', true);

        switch (record.get('isRead')) {
            case (true):
                readItem[0].title = "Mark as Unread";
                break;

            default:
                readItem[0].title = "Mark as Read";
        }

    }



});
