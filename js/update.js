$('#burger').on('click', function () {
  $('#burger').toggleClass('burger__btn_open');
})

$('#burger').click(function() {
  $('#burger').toggleClass('burger__btn_open');
});

function setMenuClass() {
  if($(window).width() < 768)
  {   
    $("#offcanvasExample").removeClass("offcanvas-start");
    $("#offcanvasExample").addClass("offcanvas-end");
  }
  else
  {
    $("#offcanvasExample").removeClass("offcanvas-end");
    $("#offcanvasExample").addClass("offcanvas-start");
  }
}

setMenuClass();

$(window).resize(function() {
  setMenuClass();
});
