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

describe('conjoon.cn_mail.data.mail.ajax.sim.message.MessageTableTest', function(t) {

    t.requireOk('conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable', function() {

        const MessageTable = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable,
              ITEM_LENGTH = 10000;


        t.it("buildBaseMessageItems()", function(t) {

            let items = MessageTable.buildBaseMessageItems(), i;

            t.expect(items.length).toBe(ITEM_LENGTH);


            for (i = 0; i < ITEM_LENGTH; i++) {
                if (!items[i].mailAccountId || !items[i].mailFolderId || !items[i].id) {
                    t.fail("Compound key information missing");
                }

                if (items[i].localId || items[i].messageBodyId) {
                    t.fail("client side key information available, though it should get created at the client.");
                }
            }

            t.expect(i).toBe(ITEM_LENGTH);


        });


    });



});


