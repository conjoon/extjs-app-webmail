/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2022-2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 *
 */
Ext.define("conjoon.cn_mail.data.mail.BaseProxy", {

    extend: "Ext.data.proxy.Rest",

    requires: [
        "conjoon.cn_mail.data.mail.message.proxy.UtilityMixin",
        "coon.core.data.request.Configurator",
        "conjoon.cn_mail.data.jsonApi.PnFilterEncoder"
    ],

    mixins: {
        utilityMixin: "conjoon.cn_mail.data.mail.message.proxy.UtilityMixin"
    },

    inheritableStatics: {
        required: {
            requestConfigurator: "coon.core.data.request.Configurator"
        }
    },


    /**
     * The entity being used with this Proxy.
     * @cfg {string}
     */
    entityName: null,

    appendId: false,

    /**
     * @type {coon.core.data.request.Configurator} requestConfigurator
     * @private
     */

    /**
     * @param request
     * @returns {*}
     */
    sendRequest (request) {

        const me = this;

        request = me.requestConfigurator.configure(request);

        return me.callParent([request]);
    },


    /**
     * https://jsonapi.org/faq/ - "Where's PUT?"
     *
     * @param {Ext.data.Request} request
     *
     * @return {String}
     */
    getMethod (request) {

        const actionMethods = {
            create: "POST",
            read: "GET",
            update: "PATCH",
            destroy: "DELETE"
        };

        return actionMethods[request.getAction()];
    }

});
