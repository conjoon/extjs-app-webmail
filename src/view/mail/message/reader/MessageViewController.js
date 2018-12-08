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
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * This is the view controller for
 * {@link conjoon.cn_mail.view.mail.message.reader.MessageViewC}.
 * It takes care of resizing the view properly according to the contents of the
 * iframe.
 *
 */

Ext.define('conjoon.cn_mail.view.mail.message.reader.MessageViewController', {

    extend : 'Ext.app.ViewController',

    alias : 'controller.cn_mail-mailmessagereadermessageviewcontroller',

    control : {

        'cn_mail-mailmessagereadermessageviewiframe' : {
            load : 'onIframeLoad'
        }

    },


    /**
     * Callback for the embedded iframe's load event. Recalculates the iframe's
     * size and resets scroll positions of the msgBodyContainer.
     *
     * @param iframe
     */
    onIframeLoad : function(iframe) {

        const me = this,
              view = me.getView(),
              body = iframe.getBody(),
              cnt  = view.down('#msgBodyContainer');

        iframe.setHeight(body.offsetHeight);
        iframe.setWidth(body.offsetWidth);

        cnt.setScrollY(0);
        cnt.setScrollX(0);
    }


});
