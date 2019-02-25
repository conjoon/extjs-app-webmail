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

describe('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopierTest', function(t) {

    t.requireOk('conjoon.dev.cn_mailsim.data.mail.PackageSim', function() {
    t.requireOk('conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey', function() {

        const createKey = function(id1, id2, id3) {
            return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(id1, id2, id3);
            },
            createKeyForExistingMessage = function(messageIndex){
                let item = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(messageIndex);

                let key = createKey(
                    item.mailAccountId, item.mailFolderId, item.id
                );

                return key;
            };


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
                compoundKey : createKeyForExistingMessage(1),
                editMode    : conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO,
                defaultMailAccountId : 'foo',
                defaultMailFolderId : 'bar'
            });

            try {
                copier.loadMessageDraftCopy(request, null);
            } catch (e) {
                exc = e;
            }

            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toContain("must be a valid callback");


            request = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
                compoundKey : createKeyForExistingMessage(1),
                editMode    : conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO
            });

            try {
                copier.loadMessageDraftCopy(request, Ext.emptyFn);
            } catch (e) {
                exc = e;
            }

            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toContain("is not fully configured");
        });


        const testLoad = function(t, key, expected) {

            var SUCCESS     = false,
                DRAFTCONFIG = null,
                COPIER      = null,
                OPERATION   = null,
                SCOPE       = null,
                scope       = {foo : 'bar'},
                func        = function(copier, draftConfig, success, operation) {
                    SCOPE       = this;
                    COPIER      = copier;
                    SUCCESS     = success;
                    DRAFTCONFIG = draftConfig;
                    OPERATION   = operation;
                },
                request = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
                    compoundKey : key,
                    editMode    : conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO,
                    defaultMailAccountId : 'foo',
                    defaultMailFolderId : 'bar'
                }),
                copier;
            copier = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopier');

            copier.loadMessageDraftCopy(request, func, scope);

            t.waitForMs(500, function() {

                t.expect(SCOPE).toBe(scope);
                t.expect(COPIER).toBe(copier);
                t.expect(SUCCESS).toBe(expected);

                t.isInstanceOf(OPERATION, 'Ext.data.operation.Read');

                if (expected) {
                    t.isInstanceOf(DRAFTCONFIG, conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig);
                    t.expect(DRAFTCONFIG.getMailAccountId()).toBe('foo');
                    t.expect(DRAFTCONFIG.getMailFolderId()).toBe('bar');
                } else {
                    t.expect(DRAFTCONFIG).toBe(null);
                }

            });
        };


        t.it("loadMessageDraftCopy() - success", function(t) {
            testLoad(t, createKeyForExistingMessage(1), true);
        });


        t.it("loadMessageDraftCopy() - failure", function(t) {
            testLoad(t, createKey(1, 2, 3), false);
        });


    });

});});
