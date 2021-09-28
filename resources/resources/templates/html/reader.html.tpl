<!--
/**
 * This is the html-template for the iframe of the message-reader.
 * It allows for dynamically setting template variables based
 * on the theme-object, which will pass all available theme-settings
 * to this template.
 * Additional template variables are available in the reader-object.
 */
-->
<!DOCTYPE html>
<html>
<head>

    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; connect-src 'self'; img-src data: ${reader.imagesAllowed ? "*" : "'self'"}; style-src * 'unsafe-inline';">
    <!--meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; connect-src 'self'; img-src data: 'self'; style-src * 'unsafe-inline';"-->


    <style type="text/css">


        html, body {
            margin:0px;
            padding:0px 14px 0 4px;
        }

        body {
            min-height: fit-content;
            min-width: fit-content;
            width: 100%;
            height: 100%;
            text-align: justify;
            font-family: "Roboto", "Open Sans", "Helvetica Neue", helvetica, arial, verdana, sans-serif;
            font-size: 14px;
            font-weight: 400;
            line-height: 22.4px;
            margin: 0px;
            color: ${theme.color};
        }

        p, ul, blockquote {
            margin:0px;
            margin-block-start:0px;
            margin-block-end: 0px;
            margin-inline-end:0px;
            padding-inline-start: 0px;
            padding-inline-end: 0px;
        }
        blockquote {
            padding-left:10px;
            border-left:4px solid ${theme["accent-color"]};
        }
        a {
            color:${theme.color}
        }
    </style>
</head>
<body>
${reader.body}
</body>
</html>