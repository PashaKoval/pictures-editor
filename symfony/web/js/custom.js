function paste(src) {
    data = new FormData();
    data.append("file", src);    
    
    $('#uploaded_img').attr('src','');
    $('#img_url').attr('href','').text('Идет загрузка...');
    $.ajax({
        data: data,
        type: "POST",
        url: "/ajax-image-upload",
        cache: false,
        contentType: false,
        processData: false,
        success: function(url) {
            if(url == 'error'){
                $('#img_url').text('Изображение не загружено! Ошибка при загрузке!');
            }else{
              window.location = url;
            }
	       
        },
          error: function(xhr, textStatus, error){
              alert("Ошибка");
      }
    });
    
}

function createFormData(image) {
	var formImage = new FormData();
	formImage.append('userImage', image[0]);
    formImage.append('dragAndDrop', 1);
	uploadFormData(formImage);
}

function uploadFormData(formData) {
    
    $('#img_url').attr('href','').text('Идет загрузка...');
	$.ajax({
	url: "/ajax-image-upload",
	type: "POST",
	data: formData,
	contentType:false,
	cache: false,
	processData: false,
	success: function(data){
		if(data == 'error'){
            $('#img_url').text('Изображение не загружено! Ошибка при загрузке!');
        }else{
                window.location = data;
        }
	}});
}

function pasteFromUrl(url){
    var form = new FormData();
    form.append('url',url);
    $('#img_url').attr('href','').text('Идет загрузка...');
    
    $.ajax({
	url: "/ajax-image-upload",
	type: "POST",
	data: form,
	contentType:false,
	cache: false,
	processData: false,
	success: function(data){
		if(data === 'error'){
            
            $('#img_url').text('Вы вставляете не картинку!!! Попробуйте еще раз.');
        }else{
            window.location = data;
        }
	}});
}

function add_favorite(a) { 
  title='Онлайн редактирование картинок'; 
  url='http://prtscr.cx.ua'; 
  try { 
    // Internet Explorer 
    window.external.AddFavorite(url, title); 
  } 
  catch (e) { 
    try { 
      // Mozilla 
      window.sidebar.addPanel(title, url, ""); 
    } 
    catch (e) { 
      // Opera и Firefox 23+ 
      if (typeof(opera)=="object" || window.sidebar) { 
        a.rel="sidebar"; 
        a.title=title; 
        a.url=url; 
        a.href=url; 
        return true; 
      } 
      else { 
        // Unknown 
        alert('Нажмите Ctrl-D чтобы добавить страницу в закладки'); 
      } 
    } 
  } 
  return false; 
} 


$(function() {
	$.pasteimage(paste);
    
    $("#drop-area").on('dragenter', function (e){
    	$('#drop-area-shadow').addClass('block-shadow-success');
        e.preventDefault();
	});

	$("#drop-area").on('dragleave', function (e){
	   $('#drop-area-shadow').removeClass('block-shadow-success');
       e.preventDefault();
	});
    
    $("#drop-area").on('dragover', function (e){
	   $('#drop-area-shadow').addClass('block-shadow-success');
       e.preventDefault();
	});

	$("#drop-area").on('drop', function (e){
    	//$(this).css('background', '#D8F9D3');
        //alert(1);
    	$('#drop-area-shadow').removeClass('block-shadow-success');
        e.preventDefault();
    	var image = e.originalEvent.dataTransfer.files;
    	createFormData(image);
	});
});