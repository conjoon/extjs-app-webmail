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

describe('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopierTest', function(t) {

    t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {

        Ext.ux.ajax.SimManager.init({
            delay: 1
        });


        t.it("constructor()", function(t) {
            var copier;

            copier = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopier');

            t.expect(copier).toBeTruthy();
        });


        t.it("loadMessageDraftCopy() - exceptions", function(t) {
            var copier, exc, e, request;
            copier = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopier');

            try {
                copier.loadMessageDraftCopy(null, Ext.emptyFn);
            } catch (e) {
                exc = e;
            }

            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toContain("must be an instance of");
            exc = e = undefined;


            request = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
                id       : '1',
                editMode : conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO
            });

            try {
                copier.loadMessageDraftCopy(request, null);
            } catch (e) {
                exc = e;
            }

            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toContain("must be a valid callback");
        });


        t.it("loadMessageDraftCopy()", function(t) {
            var SUCCESS     = false,
                DRAFTCONFIG = null,
                COPIER      = null,
                SCOPE       = null,
                scope       = {foo : 'bar'},
                func        = function(copier, draftConfig, success) {
                    SCOPE       = this;
                    COPIER      = copier;
                    SUCCESS     = success;
                    DRAFTCONFIG = draftConfig;
                },
                request = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
                    id       : '1',
                    editMode : conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO
                }),
                copier;
            copier = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopier');

            copier.loadMessageDraftCopy(request, func, scope);

            t.waitForMs(500, function() {

                t.expect(SCOPE).toBe(scope);
                t.expect(COPIER).toBe(copier);
                t.expect(SUCCESS).toBe(true);
                t.isInstanceOf(DRAFTCONFIG, conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig);

            });


        });


    });

});
