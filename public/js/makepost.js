window.addEventListener('load', function() {
    function pad(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    
    var today = new Date();
    var YYYY = today.getFullYear();
    var MM = pad(today.getMonth()+1, 2);
    var DD = pad(today.getDate(), 2);
    var hh = pad(today.getHours(), 2);
    var mm = pad(today.getMinutes(), 2);
    var today_formatted = `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
    var input_date = document.getElementById("date");
    input_date.max = today_formatted;
    input_date.value = today_formatted;
});