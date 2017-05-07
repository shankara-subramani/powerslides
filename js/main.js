// all thanks to https://github.com/jennschiffer/
jQuery(document).ready(function($){

  var ID = {
    slideshow : 'powerslides',
    slide : 'slide',
    counter : 'counter',
    navigation : 'navigation',
    next : 'next',
    previous : 'previous',
    current : 'current'
  },
  labels = {
    next : '&rarr;',
    previous : '&larr;',
    separator : ' / '
  };

  var $slideshow = $('#' + ID.slideshow),
      $navigation = $('<div>').attr('id','navigation'),
      $slides = $slideshow.children('div').addClass(ID.slide),
      $currentSlide,
      $firstSlide = $slides.first(),
      $lastSlide = $slides.last();

  // make sure the last slide doesn't page break while printing.
  $('head').append( '<style> .slide:nth-child(' + $slides.length + ') { page-break-after: auto }</style>' );

  // remove non-div children (like html comments which wp wraps in <p> tags)
  $slideshow.children().not('div').remove();

  // add navigational arrows and counter
  $navigation.append($('<a href="#">').attr('id',ID.previous).html(labels.previous));
  $navigation.append($('<a href="#">').attr('id',ID.next).html(labels.next));
  $slideshow.append($navigation);
  $slideshow.append($('<div>').attr('id',ID.counter));

  var $counter = $('#'+ID.counter),
      $next = $('#'+ID.next),
      $previous = $('#'+ID.previous);


  /*** FUNCTIONS ***/

  var updateCounter = function() {
    // updates the counter
    $counter.text(slidePointer.current + labels.separator + slidePointer.last);
  };

  var updateURL = function() {
    // updates slide state
    var currentURL = document.location.toString();

    if (currentURL.indexOf('#') != 1){
      currentURL = currentURL.substr(0,currentURL.indexOf('#'));
    }

    $.bbq.pushState({ slide: slidePointer.current });
  };

  var hideCurrentSlide = function() {
    // hide the current slide
    if ( $currentSlide ) {
      $currentSlide.hide().removeClass(ID.current);
    }
  };

  var nextSlide = function() {
    // hide current slide
    hideCurrentSlide();

    // get the next slide
    var nextSlide = $currentSlide.next();

    // not the last slide => go to the next one and increment the counter
    if ( slidePointer.current != slidePointer.last ) {
      nextSlide.show().addClass(ID.current);
      $currentSlide = nextSlide;
      slidePointer.current++;
    }
    else {
      // is the last slide => go back to the first slide and reset the counter.
      $firstSlide.show().addClass(ID.current);
      $currentSlide = $firstSlide;
      slidePointer.current = 1;
    }

    // update counter
    updateCounter();

    // update url
    updateURL();

    // fire slide event
    fireSlideEvent();
  };

  var previousSlide = function() {
    // hide current slide
    hideCurrentSlide();

    // get the previous slide
    var prevSlide = $currentSlide.prev();

    // If not the first slide, go to the previous one and decrement the counter
    if ( slidePointer.current != 1 ) {
      prevSlide.show().addClass(ID.current);
      $currentSlide = prevSlide;
      slidePointer.current--;
    }
    else {
      // This must be the first slide, so go back to the last slide and set the counter.
      $lastSlide.show().addClass(ID.current);
      $currentSlide = $lastSlide;
      slidePointer.current = slidePointer.last;
    }

    // update counter
    updateCounter();

    // update URL
    updateURL();

    // fire slide event
    fireSlideEvent();
  };

  var goToSlide = function(slideNumber) {
    // hide current slide
    hideCurrentSlide();
    moveToSlide = slideNumber-1;

    $currentSlide = $slides.eq(moveToSlide);
    $currentSlide.show().addClass(ID.current);
    slidePointer.current = slideNumber;

    // update counter
    updateCounter();
  }

  var fireSlideEvent = function(slide) {
    var slideEvent = new window.CustomEvent('slidechanged', {
      detail: { slide: slide || $currentSlide }
    });
    window.dispatchEvent(slideEvent);
  }

  /*** INIT SLIDESHOW ***/

  // Initially hide all slides
  $slides.hide();

  // The first slide is number first, last is slides length
  var slidePointer = {
    current : 1,
    last : $slides.length
  };

  var slideState = parseInt($.bbq.getState('slide'));

  if ( slideState && (slideState > 0 && slideState <= $slides.length )) {
    // if slide= hash state is given and valid, go to that slide
    goToSlide(slideState);
  }
  else {
    // The first slide is the first slide, so make visible and set the counter...
    $currentSlide = $firstSlide.show().addClass(ID.current);
    updateCounter();
  }


  /*** EVENTS ***/

  // "next" arrow clicked => next slide
  $next.click( function(e){
    e.preventDefault();
    nextSlide();
  });

  // "previous" arrow clicked => previous slide
  $previous.click( function(e){
    e.preventDefault();
    previousSlide()
  });

  // Add keyboard shortcuts for changing slides
  $(document).keydown(function(e){
    if (e.which == 39) {
      // right key pressed => next slide
      nextSlide();
      return false;
    }
    else if (e.which == 37) {
        // left or l key pressed => previous slide
        previousSlide();
        return false;
      }
  });

});
