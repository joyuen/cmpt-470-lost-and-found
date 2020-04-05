/*
Powered by 
Guilherme henrique <guih@hotmail.com.br>
@since 27/10
URL: http://guih.us/btoa/
FB: http://fb.com/profile.php?id=100001670353742
*/
$(function () {
    b64.init();
    $('#b64errorbox').hide();
});

const $images = ['gif', 'jpg', 'jpeg', 'png', 'bmp'];

var b64 =
{
    init: function () {
        $('#b64reset').click(function () {
            $('#b64result').hide();
            $('#b64image').val('');
        });
        this.b64ImageEncoder();
    },
    b64ImageEncoder: function () {
        var $select = $('#b64encoder input[type="file"]');
        $select.on('change', function (event) {
            $('.b64name, #b64error').text('');
            $('#b64errorbox').hide();

            var $file = event.target.files[0],
                $handler = new FileReader(),
                $fname = $file.name;

            if ($file) {
                $handler.onload = function (e) {

                    $toLowerCase = $fname.toLowerCase();

                    if (!$toLowerCase.match(/(?:gif|jpg|png|bmp|jpeg)$/)) {
                        $('#b64error')
                            .html('Supported Filetypes: ' + $images.toString())
                            .parent()
                            .fadeIn();
                        $('#b64result').hide();
                        return;
                    }

                    var $tmp_string = e.target.result,
                        encodedData = b64.b64_enc($tmp_string),
                        $endOf_File = 'data:' + $file.type + ';base64,' + encodedData;

                    $('#b64name').text($file.name);

                    $('#b64image').val($endOf_File);

                    $('#b64result').fadeIn(function () {
                        $('.dl').attr({
                            'href': $endOf_File,
                            'target': '_blank'
                        });
                    });

                    $('#b64result_image').attr('src', $endOf_File);
                    $('#b64reset').attr('hidden', false);
                    labelImage(encodedData);
                }
                $handler.readAsBinaryString($file);
            }
        });
    },
    b64_enc: function (input) {
        return btoa(input);
    },
};



/*
Below is code written by us (the students)
*/
function labelImage(data) {
    'use strict';
    let req = new XMLHttpRequest();
    function reqListener(e) {
        let span = document.getElementById('labelres');
        span.textContent = '';
        req.response.labels.concat(req.response.logos).forEach(label => {
            let i = document.createElement('input');
            let s = document.createElement('span');
            let l = document.createElement('label');
            i.type = 'checkbox';
            i.value = label.description;
            i.name = 'tag';
            s.classList.add('toggle', 'pseudo', 'button', 'smalllabel');
            s.innerText = label.description;
            l.append(i, s);
            span.append(l);
        });
        span.hidden = false;
    }

    req.responseType = "json";
    req.addEventListener("load", reqListener);
    req.open('POST', '/api/vision', true);
    req.setRequestHeader("Content-Type", "text/plain");
    req.send(data);
}