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

describe('conjoon.cn_mail.view.mail.message.AbstractAttachmentListControllerTest', function(t) {


    t.beforeEach(function() {

        viewConfig = {

        }
    });


    t.it("Should make sure setting up controller works", function(t) {

        var controller = Ext.create(
            'conjoon.cn_mail.view.mail.message.AbstractAttachmentListController', {
            });

        t.expect(controller instanceof Ext.app.ViewController).toBe(true);
        t.expect(controller.onAttachmentItemClick).toBe(Ext.emptyFn);
    });


    t.it("Should register and catch the events properly", function(t) {

        var clicked = 0;

        var controller = Ext.create(
            'conjoon.cn_mail.view.mail.message.AbstractAttachmentListController', {
        });

        controller.onAttachmentItemClick = function() {
            clicked++;
        };

        Ext.define("MockAttachmentList", {
            extend     : 'conjoon.cn_mail.view.mail.message.AbstractAttachmentList',
            alias      : 'widget.mockattachmentlist'
        });

        t.waitForMs(500, function() {
            var view = Ext.create(
                'conjoon.cn_mail.view.mail.message.AbstractAttachmentList', {
                    controller : controller,
                    renderTo   : document.body,
                    store      : {
                        data : [{
                           text  : 'filename',
                            size : 100000
                        }],
                        proxy : {
                            type : 'memory'
                        }
                    }
                });

            // clicked
            t.expect(clicked).toBe(0);
            t.click(view.el.selectNode('div.attachment'));
            t.expect(clicked).toBe(1);
            t.click(view.el.selectNode('div.attachment'));
            t.expect(clicked).toBe(2);

        });

    });

});
