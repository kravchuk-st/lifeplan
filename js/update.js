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
