// Ratchet
var conn = new WebSocket('ws://'+window.location.hostname+':8081');
conn.onopen = function(e) {
  console.log("Connection established!");
};

conn.onmessage = function(e) {
  var payload = JSON.parse(e.data);
  console.log(payload);

    switch (payload.event){
        case 'new-message':
            newComment(payload.user, payload.text);
            break;
        case 'new-changes':
            addNewChanges(payload.elements /*payload.element_name, payload.user*/);
            break;
        case 'new-connection':
            newConnection(payload.data);
            break;
        default: break;
    }
};

function newComment(user, text) {
    reloadComments();

    $.Notify({
        caption: 'new comment',
        content: user+': '+text,
        type: 'info',
        keepOpen: true
    });
}
function newConnection(user) {
    $.Notify({
        caption: '',
        content: 'new connection: '+user,
        type: 'alert',
        keepOpen: true
    });
}

function reloadComments() {
    var image = $('#imageurl').attr('data-image');

    $.get('/ajax-get-comments', {'image': image})
        .success(function (results) {
            var comments = JSON.parse(results);
            var commentsBlock = $('#comments');
            $(commentsBlock).html('');

            for(var i = 0; i < comments.length; i++){
                commentsBlock.append(createCommentView(comments[i].user, comments[i].text, comments[i].date))
            }
        })
}

function createCommentView (user, comment, date) {
    return "<div class=\"panel\">"+
                "<div class=\"heading bg-steel\">"+
                    "<span class=\"title\">"+
                        "<small>"+date+"</small>"+
                    "</span>"+
                    "<span class=\"title\">"+user+"</span>"+
                "</div>"+
                "<div class=\"content padding10\" style=\"background: rgba(100,100,100,0.52)\">"+
                    comment+
                "</div>"+
            "</div>"+"<br>";
}

function addNewChanges(elements/*, elementName, user*/) {
    var canvasElement = JSON.parse(elements);

    canvasElement = [canvasElement];
    fabric.util.enlivenObjects(canvasElement, function(objects) {
        var origRenderOnAddRemove = canvas.renderOnAddRemove;
        canvas.renderOnAddRemove = false;

        objects.forEach(function(o) {
            canvas.add(o);
        });

        canvas.renderOnAddRemove = origRenderOnAddRemove;
        canvas.renderAll();
    });
}