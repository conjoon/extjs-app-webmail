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
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * TagField implementation for use as address field in the
 * {@link conjoon.cn_mail.view.mail.message.editor.MessageEditor}
 */
Ext.define('conjoon.cn_mail.view.mail.message.editor.AddressField', {

    extend : 'Ext.form.field.Tag',

    requires : [
        'conjoon.cn_mail.model.mail.message.EmailAddress'
     ],

    alias : 'widget.cn_mail-mailmessageeditoraddressfield',

    cls : 'cn_mail-mailmessageeditoraddressfield',

    displayField     : 'name',
    valueField       : 'address',

    config : {
        addressType : undefined
    },

    store: {
        data  : [],
        model : 'conjoon.cn_mail.model.mail.message.EmailAddress'
    },

    queryMode        : 'local',
    forceSelection   : false,
    triggerOnClick   : false,
    createNewOnEnter : true,
    hideTrigger      : true,
    createNewOnBlur  : false,

    initComponent : function() {
        var me          = this,
            addressType = me.getAddressType();

        if (addressType === 'cc' || addressType === 'bcc') {
            me.tagItemTextCls = Ext.baseCSSPrefix +
                                'tagfield-item-text x-fa ' +
                                addressType;
        }


        me.callParent(arguments);
    }

});
