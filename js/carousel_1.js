(function ($) {
  $(document).ready(function(){
    $(".slider > .wpb_column > .vc_column-inner > .wpb_wrapper").addClass('owl-carousel');

    $(".owl-carousel").owlCarousel({
      items: 1,
      loop: true,
      autoplay: true,
      autoplayHoverPause: true,
    });
  });
})(jQuery);