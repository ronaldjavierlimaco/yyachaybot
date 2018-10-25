var cloudinaryText = {
  "powered_by_cloudinary": "",
  "sources.local.title": "Mis archivos",
  "sources.local.drop_file": "Arrastre su archivo hasta aquí",
  "sources.local.drop_files": "Arrastre sus archivos hasta aquí",
  "sources.local.drop_or": "o",
  "sources.local.select_file": "Archivo seleccionado",
  "sources.local.select_files": "Archivos seleccionados",
  "sources.url.title": "Dirección web",
  "sources.url.note": "Url publica de una imagen:",
  "sources.url.upload": "Subir",
  "sources.url.error": "Por favor digite un HTTP URL valido.",
  "sources.camera.title": "Camara",
  "sources.camera.note": "Asegurese de que su navegador tenga permisos para tomar fotos de su camara, quedese al frente de la camra y haga click en capturar:",
  "sources.camera.capture": "Capturar",
  "progress.uploading": "Subiendo...",
  "progress.upload_cropped": "Subir",
  "progress.processing": "Procesando...",
  "progress.retry_upload": "Intende de nuevo",
  "progress.use_succeeded": "OK",
  "progress.failed_note": "Algunas de sus imagenes no pudieron subirse."
};

function processImage(id) {
  var options = {
      client_hints: true,
  };
  return '<img src="'+ $.cloudinary.url(id, options) +'" style="width: 100%; height: auto"/>';
}

$('#uploadphoto').click((e) => {
  e.preventDefault()
  // alert('hola')
  $.cloudinary.config({ cloud_name: 'dft8lq2m7', api_key: '511831476544168'});
  var uploadButton = $('#uploadphoto');
  cloudinary.openUploadWidget({ cloud_name: 'dft8lq2m7', upload_preset: 'evr9esdo', tags: ['cgal'], text: cloudinaryText}, 
  function(error, result) { 
    if(error) console.log(error);
    var id = result[0].public_id;
    console.log('Ver la imagen de la url: ', result[0])
    $('#photoactual').attr('src',result[0].secure_url)
    $('#photolink').attr('value', result[0].secure_url)
  });
})