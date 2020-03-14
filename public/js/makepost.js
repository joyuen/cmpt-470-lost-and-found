window.addEventListener('load', function() {
    function pad(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    var today = new Date();

    var input_date = document.getElementById("date");
    var YYYY = today.getFullYear();
    var MM = (today.getMonth()+1).toString().padStart(2, '0');
    var DD = pad(today.getDate(), 2);
    var today_date = `${YYYY}-${MM}-${DD}`;
    input_date.max = today_date;
    input_date.value = today_date;

    var input_time = document.getElementById("time");
    var hh = pad(today.getHours(), 2);
    var mm = pad(today.getMinutes(), 2);
    var today_time = `${hh}:${mm}`;
    input_time.max = today_time;
    input_time.value = today_time;

    // make sure that date+time <= now
    input_date.addEventListener('change', function(e) {
        if (e.target.value == today_date) {
            input_time.max = today_time; 
        } else {
            input_time.max = "";
        }
    });
});