/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


/**
 * Ext.tip.ToolTip-specific for EmailAddresses. beforeshow() will pass the trigger element to the queryAddress()
 * method which has to query the passed node for an EmailAddress, translate this to an object so the properties
 * "name", "address" can properly be rendered into the tip.
 *
 */
Ext.define("conjoon.cn_mail.view.mail.EmailAddressTip", {

    extend: "Ext.tip.ToolTip",

    trackMouse: false,

    renderTo: Ext.getBody(),

    /**
     * @cfg {HTMLElement} target
     * @required
     */

    /**
     * @cfg {String} delegate
     * @required
     */


    /**
     * Queries the address for the given node. Returns an object representing an email address
     * with "name" holding the name of the recipient and address containing the email-address.
     *
     * @param {HTMLElement} node
     *
     * @return {Object} address
     * @return {String} address.name
     * @return {String} address.address
     */
    queryAddress (node) {
        throw new Error("queryAddress needs to be implemented in the target class");
    },


    /**
     * Update this component with the name and address as part of an email address.
     *
     * @param name
     * @param address
     * @returns {string}
     */
    setAddress ({name, address}) {
        const
            me = this,
            str = `${name} &lt;${address}&gt;`;


        me.update(str);

        return str;
    },


    listeners: {
        /**
         * @param tip
         * @see queryAddress
         */
        beforeshow: function updateTipBody (tip) {
            tip.setAddress(tip.queryAddress(tip.triggerElement));
        }
    }


});
