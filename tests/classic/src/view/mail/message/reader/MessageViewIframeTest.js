
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

describe('conjoon.cn_mail.view.mail.message.reader.MessageViewIframeTest', function(t) {


    t.it("config / default checks / setSrcDoc()", function (t) {
        let iframe = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewIframe', {
            renderTo : document.body
        });


        t.isInstanceOf(iframe, 'coon.comp.component.Iframe');

        t.expect(iframe.alias).toContain('widget.cn_mail-mailmessagereadermessageviewiframe');

        let str = iframe.getDefaultCss();

        t.expect(Ext.isString(str)).toBe(true);
        t.expect(str.length).toBeGreaterThan(1);

        let val = "test";

        iframe.setSrcDoc(val);

        t.expect(iframe.getSrcDoc()).toBe(str + val);

        iframe.setSrcDoc(null);

        t.expect(iframe.getSrcDoc()).toBe("");


        iframe.destroy();
        iframe = null;
    });

});