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

describe('conjoon.cn_mail.view.mail.message.AbstractAttachmentListTest', function(t) {

    var view,
        viewConfig;

    t.afterEach(function() {
       if (view) {
            view.destroy();
            view = null;
        }

    });

    t.beforeEach(function() {

        viewConfig = {

        }
    });


    t.it("Should create and show the attachment list along with default config checks", function(t) {
        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.AbstractAttachmentList', viewConfig);

        t.expect(view instanceof Ext.view.View).toBeTruthy();

        t.expect(view.cls).toContain('cn_mail-attachment-list');
        t.expect(view.overItemCls).toContain('over');
        t.expect(view.selectedItemCls).toContain('selected');
        t.expect(view.itemSelector).toContain('div.attachment');
        t.expect(view.displayButtonType).toBe(Ext.emptyFn);
     });


    t.it("Should test getPreviewCssClass properly", function(t) {
        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.AbstractAttachmentList', viewConfig);

        var tests = [{
            type   : 'image/png',
            src    :'somesting',
            expect : true
        }, {
            type   : 'image/png',
            src    :'',
            expect : false
        }, {
            type   : 'image/jpg',
            src    :'somesting',
            expect : true
        }, {
            type   : 'IMAGE/GIF',
            src    :'somesting',
            expect : true
        }, {
            type   : 'file/pdf',
            src    :'somesting',
            expect : false
        },{
            type   : 'application/json',
            src    :'',
            expect : false
        }];

        for (var i = 0, len = tests.length; i < len; i++) {

            if (tests[i]['expect'] === true) {
                t.expect(
                    view.getPreviewCssClass(tests[i]['type'], tests[i]['src'])
                ).toBe('preview');
            } else {
                t.expect(
                    view.getPreviewCssClass(tests[i]['type'], tests[i]['src'])
                    ).toBe("");
            }
        }
    });

    t.it("Should test getMimeTypeIcon properly", function(t) {

        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.AbstractAttachmentList', viewConfig);

        t.expect(typeof(view.getMimeTypeIcon('foo'))).toBe('string');
        t.expect(typeof(view.getMimeTypeIcon())).toBe('string');
        t.expect(typeof(view.getMimeTypeIcon(null))).toBe('string');
        t.expect(typeof(view.getMimeTypeIcon(1))).toBe('string');

    });



});
