  var quill = new Quill('#editor', {
    theme: 'snow',
  placeholder: 'Type away!'
  });
  var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); 
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;
  $(".mybtn").on("click", function() {
    $.post("/", {"date": today, "title" : $(".titleinputt").val(), "subtitle": $(".subinputt").val(), "picture": $(".linkinputt").val(), "post" : document.querySelector(".ql-editor").innerHTML}, function(data) {

    })
  })