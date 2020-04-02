function renderPosts(postings) {
    var x = ejs.render(`
        <table>
        <tbody>
        <% for(var i=0; i<postings.length; i++) { %>
            <tr class="posting <%= postings[i].status %>">
                <td><%= postings[i].statusFull %></td>
                <td><a href='/viewpost?id=<%= postings[i].id %>'><%= postings[i].title %></a></td>
                <td><%= postings[i].campusFull %></td>
                <td title="<%= new Date(postings[i].lostDate) %>"><%= moment.duration(new Date(postings[i].lostDate) - now, 'milliseconds').humanize(true); %></td>
            </tr>
        <% } %>
        </tbody>
        </table>
    `, { 'postings': postings, 'now': new Date() });
    document.getElementById('postings').innerHTML = x;
}

function Paginator() {
};

Paginator.prototype.init = async function (searchparams, postsperpage) {
    this.cache = {};
    this.POSTS_PER_PAGE = postsperpage;
    this.numtotal = 0;
    this.numpages = 0;
    this.searchparams = Object.assign({ numPostings: this.POSTS_PER_PAGE }, searchparams);
    this.curpost = 0;
    this.token = "";

    var self = this;
    return new Promise(function (resolve, reject) {
        $.get(`/api/postings?${$.param(searchparams)}`, function (data) {
            console.log(data);
            self.numtotal = data.numTotal;
            self.numpages = Math.max(1, Math.ceil(self.numtotal / self.POSTS_PER_PAGE));
            self.addToCache(0, data.data);
            self.curpost += data.data.length;
            self.token = data.token;
            resolve();
        });
    });
};

Paginator.prototype.fetchPosts = async function () {
    var self = this;
    var paramsWithToken = Object.assign({ token: this.token }, this.searchparams);
    return new Promise(function (resolve, reject) {
        $.get(`/api/postings?${$.param(paramsWithToken)}`, function (data) {
            console.log(data);
            self.addToCache(self.curpost, data.data);
            self.curpost += data.data.length;
            self.token = data.token;
            resolve();
        });
    });
};

Paginator.prototype.addToCache = function (start, p) {
    for (var i = 0; i < p.length; i++) {
        this.cache[start + i] = p[i];
    }
};

Paginator.prototype.getPage = async function (p) {
    var startpost = (p - 1) * this.POSTS_PER_PAGE;
    var lastpost = Math.min(this.numtotal, p * this.POSTS_PER_PAGE - 1);
    while (this.curpost < lastpost) {
        await this.fetchPosts();
    }

    var arr = [];
    for (var i = startpost; i < lastpost; i++) {
        arr.push(this.cache[i]);
    }
    return arr;
};

var inator;
var currentpage;
async function startPagination(searchparams, postsperpage) {
    inator = new Paginator();
    await inator.init(searchparams, postsperpage);
    currentpage = 1;
    totalpages = inator.numpages;
    $("#pageTotal").text(inator.numpages);
    renderPage(currentpage);
}

async function renderPage(i) {
    renderPosts(await inator.getPage(i));
    $("#pageLeft").prop('disabled', (currentpage == 1));
    $("#pageRight").prop('disabled', (currentpage == inator.numpages));
    $("#pageNum").text(currentpage);
}

async function prevPage() {
    if (currentpage > 1)
        currentpage--;
    await renderPage(currentpage);
}
async function nextPage() {
    if (currentpage < inator.numpages)
        currentpage++;
    await renderPage(currentpage);
}
function initAdvButtons() {
    $('#showAdvanced').on('click', function (event) {
        $('#advancedOptions').toggle();
        $('#showAdvanced').hide();
        $('#hideAdvanced').show();
        event.preventDefault();
    });

    $('#hideAdvanced').on('click', function (event) {
        $('#advancedOptions').toggle();
        $('#showAdvanced').show();
        $('#hideAdvanced').hide();
        event.preventDefault();
    });

    // show options by default
    $('#advancedOptions').hide();
    $('#hideAdvanced').hide();
}

function initDatePicker() {
    var dateRangeFormat = {
        locale: {
            format: 'YYYY/MM/DD',
            cancelLabel: 'Clear'
        },
        ranges: {
            'Today': [moment().startOf('day'), moment()],
            'Last 3 days': [moment().subtract(2, 'days').startOf('day'), moment()],
            'Last 7 days': [moment().subtract(6, 'days').startOf('day'), moment()],
            'Last 14 days': [moment().subtract(13, 'days').startOf('day'), moment()],
            'Last 30 days': [moment().subtract(29, 'days').startOf('day'), moment()],
        }
    };
    $('input[name="lostDateRange"]').daterangepicker(dateRangeFormat).val('');
}

function getPostsPerPage() {
    return 20;
}

function initSearch() {
    $("#search").submit(function (e) {
        e.preventDefault();

        var form = $(this);
        var formJson = {};
        for (let obj of form.serializeArray()) {
            formJson[obj.name] = obj.value;
        }
        var [start, end] = formJson["lostDateRange"].split(" - ");
        formJson["lostDateStart"] = start ? start : "";
        formJson["lostDateEnd"] = end ? end : "";
        delete formJson["lostDateRange"];

        // don't submit any blank fields
        for (let [key, val] of Object.entries(formJson)) {
            if (val == "") {
                delete formJson[key];
            }
        }

        startPagination(formJson, getPostsPerPage());
    });

    $('#pageLeft').on('click', prevPage);
    $('#pageRight').on('click', nextPage);
}

$(document).ready(function () {
    initAdvButtons();
    initDatePicker();
    initSearch();
    startPagination({}, getPostsPerPage());        // by default, search with no params
});