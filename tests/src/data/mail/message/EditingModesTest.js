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

describe('conjoon.cn_mail.data.mail.message.EditingModesTest', function(t) {

        t.it("Should properly check variables", function(t) {

            Ext.require('conjoon.cn_mail.data.mail.message.EditingModes');

            t.waitForMs(500, function() {
                var EditingModes = conjoon.cn_mail.data.mail.message.EditingModes;

                t.expect(EditingModes.REPLY_TO).toBeTruthy();
                t.expect(EditingModes.REPLY_ALL).toBeTruthy();
                t.expect(EditingModes.FORWARD).toBeTruthy();
                t.expect(EditingModes.EDIT).toBeTruthy();
                t.expect(EditingModes.CREATE).toBeTruthy();

                var values = [
                    EditingModes.REPLY_TO,
                    EditingModes.REPLY_All,
                    EditingModes.FORWARD,
                    EditingModes.EDIT,
                    EditingModes.CREATE
                ];

                t.expect(Array.from(new Set(values))).toEqual(values);

            });

        });



});