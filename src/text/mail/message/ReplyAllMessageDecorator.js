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
 * Text Decorator for Email Messages which are used in "reply all" context.
 */
Ext.define('conjoon.cn_mail.text.mail.message.ReplyAllMessageDecorator', {

    extend : 'conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator',

    requires : [
        'conjoon.cn_mail.text.mail.message.DecoratorFormat'
    ],

    /**
     * @inheritdoc
     */
    getTo : function() {

        var me = this;

        return me.callParent().concat(me.copyAddresses('to'));
    },


    /**
     * @inheritdoc
     */
    getCc : function() {
        var me = this;


        return me.copyAddresses('cc');
    }

});