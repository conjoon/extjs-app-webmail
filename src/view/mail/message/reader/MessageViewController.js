/**
 * conjoon
 * (c) 2007-2019 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg/conjoon.org
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
     * @param {conjoon.cn_mail.view.mail.message.reader.MessageViewIframe} iframe
     *
     * @see #sanitizeLinks
     */
    onIframeLoad : function(iframe) {

        const me = this,
              view = me.getView(),
              body = iframe.getBody(),
              cnt  = view.down('#msgBodyContainer');

        // Ext.isGecko === check for Mozilla. Elements have a margin added which is not
        // considered bei querying offsetHeight
        iframe.setHeight(Ext.isGecko
                        ? iframe.cn_iframeEl.dom.contentDocument.scrollHeight
                        : body.offsetHeight);
        iframe.setWidth(body.offsetWidth);

        me.sanitizeLinks(iframe.cn_iframeEl.dom.contentWindow.document.getElementsByTagName('a'));

        cnt.setScrollY(0);
        cnt.setScrollX(0);
    },


    /**
     * Sanitizes all the links found in the passed Array and makes sure of the
     * following:
     * - if no href attribute is found, the target-attribute will be removed
     * - if the href-attribute is a local anchor, the target-attribute will be
     * removed to make sure the links is treated as anchor of the owning document
     * - if the href-attribute's value starts with "mailto:", the value will be
     * prepended with "#cn_mail/message/compose/" to make sure the routing of
     * the mail-module will process the link, and the target of the element will
     * be set to "_top"
     * - in every other case, the target of the link will be set to _blank
     *
     * @param {Array} an array of HTMLElements representing links (<a>).
     *
     * @private
     */
    sanitizeLinks : function(elements) {

        const me = this;

        let a, href;

        for (let i = 0, len = elements.length; i < len; i++) {
            a = elements[i];
            href = a.getAttribute('href');

            if (!href || href.indexOf('#') === 0) {
                a.removeAttribute('target');
                continue;
            }

            if (href.indexOf('mailto:') === 0) {

                a.setAttribute('href', '#cn_mail/message/compose/' + encodeURIComponent(href));
                a.setAttribute('target', '_top');
                continue;
            }

            a.setAttribute('target', '_blank');
        }


    }
});
