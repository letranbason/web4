var App = {
   textAnimation: function(){
      let $titleWrapper = jQuery('.dblh__title-wrapper.wgl-pop-out');
      if ($titleWrapper.length) {
          $titleWrapper.each(function() {
              var $this = jQuery(this);
              Splitting({
                  target: $this,
                  by: "chars",
                  key: null
              });
          });
      }
   },
   slideText: function(){
    var containers = $('.text_slide');

    if (containers.length) {
        containers.each(function() {
            var container = $(this);

            // Support small text - copy to fill screen width
            if (container.find('.scrolling-text').outerWidth() < $(window).width()) {
                var windowToScrolltextRatio = Math.round($(window).width() / container.find('.scrolling-text').outerWidth()),
                    scrollTextContent = container.find('.scrolling-text .scrolling-text-content').text(),
                    newScrollText = '';
                for (var i = 0; i < windowToScrolltextRatio; i++) {
                    newScrollText += ' ' + scrollTextContent;
                }
                container.find('.scrolling-text .scrolling-text-content').text(newScrollText);
            }

            // Init variables and config
            var scrollingText = container.find('.scrolling-text'),
                scrollingTextWidth = scrollingText.outerWidth(),
                scrollingTextHeight = scrollingText.outerHeight(true),
                startLetterIndent = parseInt(scrollingText.find('.scrolling-text-content').css('font-size'), 10) / 4.8,
                startLetterIndent = Math.round(startLetterIndent),
                scrollAmountBoundary = Math.abs($(window).width() - scrollingTextWidth),
                transformAmount = 0,
                leftBound = 0,
                rightBound = scrollAmountBoundary,
                transformDirection = container.hasClass('left-to-right') ? -1 : 1,
                transformSpeed = 200;

            // Read transform speed
            if (container.attr('speed')) {
                transformSpeed = container.attr('speed');
            }
        
            // Make scrolling text copy for scrolling infinity
            container.append(scrollingText.clone().addClass('scrolling-text-copy'));
            container.find('.scrolling-text').css({'position': 'absolute', 'left': 0});
            container.css('height', scrollingTextHeight);
        
            var getActiveScrollingText = function(direction) {
                var firstScrollingText = container.find('.scrolling-text:nth-child(1)');
                var secondScrollingText = container.find('.scrolling-text:nth-child(2)');
        
                var firstScrollingTextLeft = parseInt(container.find('.scrolling-text:nth-child(1)').css("left"), 10);
                var secondScrollingTextLeft = parseInt(container.find('.scrolling-text:nth-child(2)').css("left"), 10);
        
                if (direction === 'left') {
                    return firstScrollingTextLeft < secondScrollingTextLeft ? secondScrollingText : firstScrollingText;
                } else if (direction === 'right') {
                    return firstScrollingTextLeft > secondScrollingTextLeft ? secondScrollingText : firstScrollingText;
                }
            }
        
            $(window).on('wheel', function(e) {
                var delta = e.originalEvent.deltaY;
                
                if (delta > 0) {
                    // going down
                    transformAmount += transformSpeed * transformDirection;
                    container.find('.scrolling-text .scrolling-text-content').css('transform', 'skewX(10deg)');
                }
                else {
                    transformAmount -= transformSpeed * transformDirection;
                    container.find('.scrolling-text .scrolling-text-content').css('transform', 'skewX(-10deg)');
                }
                setTimeout(function(){
                    container.find('.scrolling-text').css('transform', 'translate3d('+ transformAmount * -1 +'px, 0, 0)');
                }, 10);
                setTimeout(function() {
                    container.find('.scrolling-text .scrolling-text-content').css('transform', 'skewX(0)');
                }, 500)
        
                // Boundaries
                if (transformAmount < leftBound) {
                    var activeText = getActiveScrollingText('left');
                    activeText.css({'left': Math.round(leftBound - scrollingTextWidth - startLetterIndent) + 'px'});
                    leftBound = parseInt(activeText.css("left"), 10);
                    rightBound = leftBound + scrollingTextWidth + scrollAmountBoundary + startLetterIndent;
        
                } else if (transformAmount > rightBound) {
                    var activeText = getActiveScrollingText('right');
                    activeText.css({'left': Math.round(rightBound + scrollingTextWidth - scrollAmountBoundary + startLetterIndent) + 'px'});
                    rightBound += scrollingTextWidth + startLetterIndent;
                    leftBound = rightBound - scrollingTextWidth - scrollAmountBoundary - startLetterIndent;
                }
            });
        })
    }
   },
   customCursor: function(){
  // set the starting position of the cursor outside of the screen
  let clientX = 100;
  let clientY = 100;
  const innerCursor = document.querySelector(".cursor--small");
  
  const initCursor = () => {
    // add listener to track the current mouse position
    document.addEventListener("mousemove", e => {
      clientX = e.clientX;
      clientY = e.clientY;
    });
    
    // transform the innerCursor to the current mouse position
    // use requestAnimationFrame() for smooth performance
    const render = () => {
      innerCursor.style.transform = `translate(${clientX}px, ${clientY}px)`;
      // if you are already using TweenMax in your project, you might as well
      // use TweenMax.set() instead
      // TweenMax.set(innerCursor, {
      //   x: clientX,
      //   y: clientY
      // });
      
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  };
  
  initCursor();
  
  let lastX = 0;
  let lastY = 0;
  let isStuck = false;
  let showCursor = false;
  let group, stuckX, stuckY, fillOuterCursor;
  
  const initCanvas = () => {
    const canvas = document.querySelector(".cursor--canvas");
    const shapeBounds = {
      width: 75,
      height: 75
    };
    paper.setup(canvas);
    const strokeColor = "rgba(24, 173, 214, 0.5)";
    const strokeWidth = 1;
    const segments = 8;
    const radius = 20;
    
    // we'll need these later for the noisy circle
    const noiseScale = 250; // speed
    const noiseRange = 4; // range of distortion
    let isNoisy = false; // state
    
    // the base shape for the noisy circle
    const polygon = new paper.Path.RegularPolygon(
      new paper.Point(0, 0),
      segments,
      radius
    );
    polygon.strokeColor = strokeColor;
    polygon.strokeWidth = strokeWidth;
    polygon.smooth();
    group = new paper.Group([polygon]);
    group.applyMatrix = false;
    
    const noiseObjects = polygon.segments.map(() => new SimplexNoise());
    let bigCoordinates = [];
    
    // function for linear interpolation of values
    const lerp = (a, b, n) => {
      return (1 - n) * a + n * b;
    };
    
    // function to map a value from one range to another range
    const map = (value, in_min, in_max, out_min, out_max) => {
      return (
        ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
      );
    };
    
    // the draw loop of Paper.js 
    // (60fps with requestAnimationFrame under the hood)
    paper.view.onFrame = event => {
      // using linear interpolation, the circle will move 0.2 (20%)
      // of the distance between its current position and the mouse
      // coordinates per Frame
      lastX = lerp(lastX, clientX, 0.2);
      lastY = lerp(lastY, clientY, 0.2);
      group.position = new paper.Point(lastX, lastY);
    }
  }
    initCanvas();
  },
  scrollMenu: function(){
    // Get the header element
    const header = document.querySelector('#header_site');

    if (window.pageYOffset > 10) {
      // Add the 'scrolled' class to the header
      header.classList.add('scrolled');
    } else {
      // Otherwise, remove the 'scrolled' class from the header
      header.classList.remove('scrolled');
    }
    // Listen for the scroll event on the window
    window.addEventListener('scroll', () => {
      // Check if the offsetTop of the window is greater than 0
      if (window.pageYOffset > 10) {
        // Add the 'scrolled' class to the header
        header.classList.add('scrolled');
      } else {
        // Otherwise, remove the 'scrolled' class from the header
        header.classList.remove('scrolled');
      }
    });
  }
};

jQuery(document).ready(function () {
    App.textAnimation();
    App.slideText();
    App.customCursor();
    App.scrollMenu();
    jQuery('body').imagesLoaded().progress( function() {
      AOS.init({
        duration: 800
      });
    });
    var scene1 = document.getElementById('scene');
    var parallaxInstance1 = new Parallax(scene1);
    var scene2 = document.getElementById('scene2');
    var parallaxInstance2 = new Parallax(scene2);
    var scene3 = document.getElementById('scene3');
    var parallaxInstance3 = new Parallax(scene3);
    var scene4 = document.getElementById('scene4');
    var parallaxInstance4 = new Parallax(scene4);
    var scene5 = document.getElementById('scene5');
    var parallaxInstance5 = new Parallax(scene5);
    var scene6 = document.getElementById('img_parallax');
    var parallaxInstance5 = new Parallax(scene6,{
      limitX: 0
    });
});