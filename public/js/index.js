function humanizeRelative(now, date) {
    return moment.duration(date - now, 'milliseconds').humanize(true);
}

function removeNotif(notifid, button) {
    var target = $(button).closest(".notif");
    target.remove();
    // target.animate({ 'left': "-=200px" }, 4000, function () { target.remove(); });
}

function removeAllNotif() {
    for (let target of $("#notifs-table").children()) {
        target.remove();
    }
}

function createNotifElement(notif) {
    return ejs.render(`
      <div class="card notif" style="position: relative;">
        <p class="notif-message"><%- notif.message %></p>
        <p class="notif-sent">
          <%= humanizeRelative(now, new Date(notif.sent)) %>
          <button class="pseudo notif-remove" onclick="removeNotif('<%= notif._id %>', this);">Remove</button>
        </p>
      </div>
    `, { 'notif': notif, 'now': new Date() });
}

$(document).ready(function () {
    $.get("/api/notifications/read", function (data) {
        for (let notif of data) {
            $("#notifs-table").append(createNotifElement(notif));
        }
    });

    $("#notif-remove-all").on('click', function (e) {
        removeAllNotif();
    });
});