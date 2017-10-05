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

/**
 * Base store for managing {@link conjoon.cn_mail.model.mail.message.MessageItem}.
 *
 *
 */
Ext.define('conjoon.cn_mail.store.mail.message.MessageItemStore', {

    extend : 'Ext.data.BufferedStore',

    requires : [
        'conjoon.cn_mail.model.mail.message.MessageItem'
    ],

    alias : 'store.cn_mail-mailmessageitemstore',

    model : 'conjoon.cn_mail.model.mail.message.MessageItem',

    remoteSort : true,

    remoteFilter : true,

    autoLoad : false,

    sorters : [{
        property  : 'date',
        direction : 'DESC'
    }],


    /**
     * @inheritdoc
     * Overriden to make sure that this store instance allows only one sorter
     */
    applySorters : function(sorters) {

        var me = this;

        if (sorters && sorters.length !== 0 &&
            ((me.getSorters(false) && me.getSorters(false).length !== 0) ||
            sorters.length !== 1)) {
            Ext.raise({
                sorters : sorters,
                msg     : "Only one sorter allowed for MessageItem store"
            });
        }

        return me.callParent(arguments);
    },


    /**
     * (Local sort only) Inserts the passed Record into the Store at the index where it
     * should go based on the current sort information.
     *
     * @param {Ext.data.Record} record
     */
    addSorted : function(record) {
        var me         = this,
            data       = me.getData(),
            index      = me.findInsertIndexInPagesForRecord(record),
            storeIndex = 0,
            page, pos, values;

        if (index === null) {
            return null;
        }

        page   = index[0];
        pos    = index[1];
        values = data.map[page].value;

        Ext.Array.splice(values, pos, 0, record);
        Ext.Array.splice(values, values.length - 1, 1);


        for (var startIdx in data.map) {
            // Maintain the indexMap so that we can implement indexOf(record)
            for (var i = 0, len = data.map[startIdx].value.length; i < len; i++) {
                data.indexMap[data.map[startIdx].value[i].internalId] = storeIndex++;
            }
        }

        return record;
    },


    privates : {

        isFirstPageLoaded : function() {
            return !!this.getData().map[1]
        },

        cmpFuncHelper : function(val1, val2) {

            return val1 < val2
                   ? -1
                   : val1 === val2
                     ? 0
                     : 1;
        },


        /**
         * Same values: Presedence is given the newly inserted record.
         *
         * @param record
         * @returns {*}
         */
        findInsertIndexInPagesForRecord : function(record) {

            var me  = this,
                map = me.getData().map,
                // guaranteed to be only one sorter
                sorters     = me.getSorters(),
                target      = null,
                isBeginning = this.isFirstPageLoaded(),
                pageIterate,
                values, property,
                direction, cmpRecord, cmp, cmpFunc,
                firstPage;

            // iterate through maps
            // insert at map n
            // shift records through pages
            // update indexMap
            if (!sorters || sorters.length != 1) {
                return [1, 0];
            }

            property  = sorters.getAt(0).getProperty();
            direction = sorters.getAt(0).getDirection();

            cmpFunc = record.getField(property)
                      ? record.getField(property).compare
                      : me.cmpFuncHelper;

            for (var i in map) {

                if (!map.hasOwnProperty(i)) {
                    continue;
                }

                pageIterate = parseInt(i, 10) ;
                firstPage   = firstPage ? firstPage : pageIterate;

                values = map[i].value;

                for (var a = 0, lena = values.length; a < lena; a++) {
                    cmpRecord = values[a];

                    cmp = cmpFunc(record.get(property), cmpRecord.get(property));

                    // -1 less, 0 equal, 1 greater
                    switch (direction) {
                        case 'ASC':
                            if (cmp === 0) {
                                return [pageIterate, a];
                            } else if (cmp === -1) {

                                if (a === 0) {
                                    if (firstPage === 1 && pageIterate >= 1) {
                                        return [pageIterate, a];
                                    } else {
                                        return null;
                                    }
                                }

                                return [pageIterate, a];
                            }
                            break;
                        default:
                            //console.log(record.get(property), cmpRecord.get(property), cmp);
                            if (record.get(property) === 10000.5) {
                                console.log(record.get(property), cmpRecord.get(property), cmp, a, pageIterate);
                            }
                           // console.log(record.get(property), cmpRecord.get(property), cmp);
                            if (cmp === 0) {
                                return [pageIterate, a];
                            } else if (cmp === 1) {
                                if (firstPage !== 1 &&  !map.hasOwnProperty(pageIterate - 1)) {
                                    return null;
                                }
                                return [pageIterate, a];
                            }
                            break;
                    }
                }
            }

            return null;

        }

    }

});