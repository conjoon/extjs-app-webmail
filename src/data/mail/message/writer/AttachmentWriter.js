/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2021-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * An specialized version of a coon.core.data.writer.FormData that moves the form data
 * originally returned by writeRecords  into more expressive keys.
 */
Ext.define("conjoon.cn_mail.data.mail.message.writer.AttachmentWriter", {

    extend: "coon.core.data.writer.FormData",

    alias: "writer.cn_mail-mailmessageattachmentwriter",

    /**
     * The following keys are generated:
     * Files are available via  "files[dataCount][keyName]".
     * The keyName for the blob-content of a file is "blob".
     *
     *      @example
     *      // the following model is given
     *      Ext.define("FileModel", {
     *          extend : 'Ext.data.Model',
     *
     *          fields : [{
     *              name : 'fileName',
     *              type : 'string'
     *          }, {
     *              name : 'file',
     *              type : 'cn_core-datafieldblob'
     *          }]
     *      });
     *
     *      // data is created
     *      var data = [
     *          Ext.create("FileModel", {fileName : 'blob.txt', file : new Blob()}),
     *          Ext.create("FileModel", {fileName : 'blob2.txt', file : new Blob()}),
     *      ];
     *
     *      // passing the data to the Writer by creating the operation with the
     *      // records and invoking the proxy's sendRequest() method, the
     *      // following data is queryable on the server:
     *      //
     *      // files[0]["blob"] => [Blob]
     *      // files[0]['fileName'] => 'blob.txt'
     *      // files[1]["blob"] => [Blob]
     *      // files[1]['fileName'] => 'blob2.txt'
     *
     *
     * @inheritdoc
     */
    writeRecords (request, data) {

        const
            me = this,
            pCall = me.callParent(arguments);

        if (!(pCall instanceof coon.core.data.FormDataRequest)) {
            return pCall;
        }

        const
            formData = pCall.getFormData(),
            files = [];

        for(let pair of formData.entries()) {
            let key = pair[0],
                value = pair[1];

            const 
                regex = /(.*)\[(\d*)\]\[(.*)\]/gmi,
                mapping = ["", "type", "index", "keyName"];
            let m;
            while ((m = regex.exec(key)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++;
                }

                let obj = {};
                // The result can be accessed through the `m`-variable.
                m.forEach((match, groupIndex) => {
                    obj[mapping[groupIndex]] = match;
                });

                if (!files[obj.index]) {
                    files[obj.index] = {};
                }
                switch (obj.type) {
                case "file": {
                    files[obj.index]["blob"] = value;
                }
                    break;
                case "data": {
                    files[obj.index][obj.keyName] = value;
                }
                    break;
                }
                
            }
        }

        const transferredFormData = new FormData();
        //files[0][fileName]
        //files[0][blob]
        files.forEach((entry, index) => {
            const entries = Object.entries(entry);
            entries.forEach(entry => {
                const
                    key = entry[0],
                    value = entry[1];
                transferredFormData.set(`files[${index}][${key}]`, value);
            });
        });

        request.setFormData(transferredFormData);

        return request;
    }


});
