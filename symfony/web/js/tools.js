window.onload = function() {

    if(!$('#edit').length){

        canvas = new fabric.Canvas('canvas',{
              selection: true,
              selectionColor: 'blue',
              selectionLineWidth: 2
        });

        var state = [];
        var mods = 0;
        marker = true;
        canvas.on(
            'object:modified', function () {
            updateModifications(true);
            console.log('modified');
        },
            'object:added', function () {
            updateModifications(true);
            console.log('add');
        });

        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = size = $('#size').val();
        canvas.freeDrawingBrush.color = brushColor = $('#brushColor').val();
        container = document.getElementById('canvas').getBoundingClientRect();
        imgElement = document.getElementById('uploaded_img');
        var del = false;
        var save = true;
        var proportion;
        if(($(window).width()-300) < imgElement.width)
            proportion = (($(window).width()-250)/imgElement.width)-0.05;
        else
            proportion = 1;

        imgInstance = new fabric.Image(imgElement, {
         left: 0,
         top: 0,
         scaleX: proportion,
         scaleY: proportion
        });
        canvas.setWidth(imgInstance.getWidth());
        canvas.setHeight(imgInstance.getHeight());
        imgInstance.selectable = false;
        canvas.add(imgInstance);
        //console.log('test');

        function updateModifications(savehistory) {
            if (savehistory === true) {
                myjson = canvas.toJSON(['selectable']);
                //console.log('mod');
                state.push(myjson);
            }
        }

        updateModifications(true);//сохраняем изминения

        $('#cut').click( function() {
            marker = false;
            save = false;
            selectTools($(this));
            canvas.isDrawingMode = false;
            disableSelection(canvas);

            if (typeof(frameDownHandler) === "function")canvas.off('mouse:down', frameDownHandler);
            if (typeof(frameUpHandler) === "function")canvas.off('mouse:up', frameUpHandler);
            if (typeof(frameMoveHandler) === "function")canvas.off('mouse:move', frameMoveHandler);
            if (typeof(textUpHandler) == "function")canvas.off('mouse:up', textUpHandler);

            //var container = document.getElementById('canvas').getBoundingClientRect();
            var mouseDown;
            // only allow one crop. turn it off after that
            var disabled = false;
            var rectangle = new fabric.Rect({
                fill: 'transparent',
                stroke: '#000',
                strokeDashArray: [2, 2],
                visible: false
            });

            canvas.add(rectangle);

            var elements = canvas.getObjects();
            for(i = 0; i < elements.length; i++){
                elements[i].selectable = false;
            }
            canvas.on("mouse:up", cutUpHandler = function () {
                mouseDown = null;
                disabled = false;
                rectangle.visible = false;
                canvas.renderAll();

                if(rectangle.width > 30 && rectangle.height > 30){
                    var cropped = new Image();
                    cropped.src = canvas.toDataURL({
                        left: rectangle.left,
                        top: rectangle.top,
                        width: rectangle.width,
                        height: rectangle.height
                    });
                    cropped.onload = function() {
                        canvas.clear();
                        imgInstance = new fabric.Image(cropped);
                        imgInstance.left = 0;//rectangle.left;
                        imgInstance.top = 0;//rectangle.top;
                        imgInstance.setCoords();
                        $('.frame').width(rectangle.width)
                            .height(rectangle.height);
                        canvas.setWidth(rectangle.width);
                        canvas.setHeight(rectangle.height);
                        canvas.add(imgInstance);
                        canvas.renderAll();
                        disableSelection(canvas);
                        state = [];
                        mods=0;
                        updateModifications(true);

                    };
                }
            });

            canvas.on("mouse:down",cutDownHandler= function (options) {
                if(!disabled) {
                    rectangle.width = 2;
                    rectangle.height = 2;
                    rectangle.left = options.e.layerX;
                    rectangle.top = options.e.layerY;
                    rectangle.visible = true;
                    mouseDown = options.e;
                    canvas.bringToFront(rectangle);
                }
            });
            // draw the rectangle as the mouse is moved after a down click
            canvas.on("mouse:move", cutMoveHandler = function (event) {
                if(mouseDown && !disabled) {
                    rectangle.width = event.e.layerX - mouseDown.layerX;
                    rectangle.height = event.e.layerY - mouseDown.layerY;
                    canvas.renderAll();
                }
            });
        });

        $('#marker').click( markerHandler = function () {
            save = false;
            marker = true;
            if (typeof(frameDownHandler) === "function")canvas.off('mouse:down', frameDownHandler);
            if (typeof(frameUpHandler) === "function")canvas.off('mouse:up', frameUpHandler);
            if (typeof(frameMoveHandler) === "function")canvas.off('mouse:move', frameMoveHandler);
            if (typeof(cutDownHandler) === "function") canvas.off('mouse:down', cutDownHandler);
            if (typeof(cutUpHandler) === "function") canvas.off('mouse:up', cutUpHandler);
            if (typeof(cutMoveHandler) === "function") canvas.off('mouse:move', cutMoveHandler);
            if (typeof(textUpHandler) === "function") canvas.off('mouse:up', textUpHandler);

            selectTools($(this));
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.width = size;
            canvas.freeDrawingBrush.color = brushColor;
            updateModifications(true);//сохраняем изминения
        });

        $('#frame').click( frameHandler = function () {
            save = false;
            marker = false;
            selectTools($(this));
            canvas.isDrawingMode = false;
            disableSelection(canvas);

            if (typeof(textUpHandler) == "function")canvas.off('mouse:up', textUpHandler);
            if (typeof(cutDownHandler) === "function")canvas.off('mouse:down', cutDownHandler);
            if (typeof(cutUpHandler) === "function")canvas.off('mouse:up', cutUpHandler);
            if (typeof(cutMoveHandler) === "function")canvas.off('mouse:move', cutMoveHandler);

            var mouseDown;

            var rectangle;

            canvas.on("mouse:up", frameUpHandler = function () {
                disableSelection(canvas);
                canvas.add(rectangle);
                mouseDown = null;
                canvas.renderAll();
                //sendChanges(JSON.stringify(rectangle), 'rectangle');
                updateModifications(true);//сохраняем изминения
            });

            canvas.on("mouse:down",frameDownHandler= function (options) {
                rectangle = new fabric.Rect({
                    fill: 'transparent',
                    stroke: '#000',
                    strokeWidth: size,
                    stroke: brushColor,
                    visible: true
                });
                canvas.add(rectangle);

                rectangle.width = 2;
                rectangle.height = 2;
                rectangle.left = options.e.layerX;
                rectangle.top = options.e.layerY;
                mouseDown = options.e;
                canvas.bringToFront(rectangle);
            });
            // draw the rectangle as the mouse is moved after a down click
            canvas.on("mouse:move", frameMoveHandler = function (event) {
                if(mouseDown) {
                    rectangle.width = event.e.layerX - mouseDown.layerX;
                    rectangle.height = event.e.layerY - mouseDown.layerY;
                    canvas.renderAll();
                }
            });
        })

        $('#text').click(function() {
            save = false;
            marker = false;
            selectTools($(this));
            disableSelection(canvas);
            if (typeof(frameDownHandler) === "function")canvas.off('mouse:down', frameDownHandler);
            if (typeof(frameUpHandler) === "function")canvas.off('mouse:up', frameUpHandler);
            if (typeof(frameMoveHandler) === "function")canvas.off('mouse:move', frameMoveHandler);
            if (typeof(cutDownHandler) === "function")canvas.off('mouse:down', cutDownHandler);
            if (typeof(cutUpHandler) === "function")canvas.off('mouse:up', cutUpHandler);
            if (typeof(cutMoveHandler) === "function")canvas.off('mouse:move', cutMoveHandler);


            disableDrawingMode(canvas);
            canvas.on('mouse:up',textUpHandler = function (options) {
                if(options.target.type != 'i-text'){
                    var newText = new fabric.IText("",{
                        left: options.e.layerX,
                        top: options.e.layerY-20
                    });

                    var fontSize = size*4;
                    if(fontSize < 15)
                        fontSize = 15;
                    newText.setFontSize(fontSize);
                    newText.setColor(brushColor);
                    canvas.add(newText);
                    updateModifications(true);//сохраняем изминения
                    //window.setTimeout(sendChanges(JSON.stringify(newText), 'text'),9000);

                    canvas.setActiveObject(newText);
                    newText.enterEditing();
                    newText.selectAll();
                }
            });
        });

        $('#brushColor').change(function () {
            brushColor = $(this).val();
            canvas.freeDrawingBrush.color = brushColor;
        });

        $('#size').change(function () {
            size = $(this).val();
            canvas.freeDrawingBrush.width = size;
        });

        $('#save').click(function (){
            save = true;
            savePicture(canvas);
        });

        //console.log('test');
        $(window).on('beforeunload', function() {
            if(del === true || save === true){
                return;
            }
            if(canvas.getObjects().length > 1)
                return 'Вы внесли изменения. Для сохранения изменений вернитесь и нажмите \'Сохранить\'';
            return;
        });

        //привязка слушателя к  ctrl+z
        $(document).keydown( function(e) {
            if (e.keyCode == 90 && e.ctrlKey) {
                undoHandler();
            }
        });

        $('#undo-button').click(function() {
            undoHandler();
        });

        undo = function undo() {
            if (mods < state.length /*> 0*/ && (canvas.getObjects().length > 1)) {
                canvas.clear().renderAll();
                canvas.loadFromJSON(state[state.length-2-mods], canvas.renderAll.bind(canvas));
                mods += 1;
            }
        };

        function undoHandler(){
            if(marker === true && canvas.getObjects().length > 1){
                canvas.remove(canvas.getObjects()[canvas.getObjects().length - 1]);
            }else{
                undo();
            }
        }

   }else{

        canvas = new fabric.Canvas('canvas');

        canvas.isDrawingMode = false;
        imgElement = document.getElementById('uploaded_img');

        var proportion;
        if(($(window).width()-50) < imgElement.width)
            proportion = ($(window).width()/imgElement.width)-0.05;
        else
            proportion = 1;

        imgInstance = new fabric.Image(imgElement, {
            left: 0,
            top: 0,
            scaleX: proportion,
            scaleY: proportion
        });

        canvas.setWidth(imgInstance.getWidth());
        canvas.setHeight(imgInstance.getHeight());

        canvas.add(imgInstance);
        disableSelection(canvas)

        $(document).on('click','.frame',function () {
            openImageWindow($('#uploaded_img').attr('src'));
        })

   }
};
    
function savePicture (canvas) {
    var src = $('#uploaded_img').attr('src');
    $.ajax({
        type: 'post',
        data: "name="+src+"&dataUrl="+canvas.toDataURL('png'),
        url: '/ajax-image-save',
        success: function (data) {
            if(data == 'success'){
                console.log('success');
                $.Notify({
                    caption: 'Success',
                    content: 'File saved.',
                    type: 'success'
                });
            }else{
                console.log(data);
                $.Notify({
                    caption: 'Error',
                    content: 'File not saved.',
                    type: 'alert'
                });
            }
        }
    })
}

function disableDrawingMode(canvas){
    canvas.isDrawingMode = false;
}

function disableSelection(canvas){
    //console.log(canvas);
    var elements = canvas.getObjects();
    for(i = 0; i < elements.length; i++){
        elements[i].selectable = false;
    }
}

function selectTools(newTool){
    $('#text').removeClass("bg-lighterGray");
    $('#text').removeClass("fg-black");
    $('#cut').removeClass("bg-lighterGray");
    $('#cut').removeClass("fg-black");
    $('#marker').removeClass("bg-lighterGray");
    $('#marker').removeClass("fg-black");
    $('#frame').removeClass("bg-lighterGray");
    $('#frame').removeClass("fg-black");
    newTool.addClass("bg-lighterGray");
    newTool.addClass("fg-black");
}

function copyUrlToClipboard() {
    $('#img_url').val()
}

function openImageWindow(src) {
    var image = new Image();
    image.src = src;
    var width = image.width;
    var height = image.height;
    window.open(src,"Image","width=" + width + ",height=" + height);
}

function sendChanges(element, name){
    $.post('/ajax-send-changes', {'element':element, 'element_name': name});
}

window.setInterval(function () {
        sendChanges(JSON.stringify(canvas.getObjects(), 'marker'));
    },
    9000
);