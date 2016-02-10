(function(window, angular) {
    var ngSmartImage = angular.module('ngSmartImage', []);

    ngSmartImage.directive('smartImage', ['$compile', function($compile) {
        const WIDTH = 1;

        const HEIGHT = 0;

        var isScrolledIntoView = function(el) {
            var elemTop     = el.getBoundingClientRect().top;
            var elemBottom  = el.getBoundingClientRect().bottom;

            return elemTop < window.innerHeight && elemBottom >= 0;
        };

        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var loadedImage;

                attrs.$observe('smartImageSrc', function(value) {
                    var src = value;
                    var invDisabled = attrs.smartImageDisabledInview || false;
                    var resDisabled = attrs.smartImageDisabledResize || false;

                    var fitToContainer = function() {
                        if (!loadedImage) return;

                        var ctnWidth    = element[0].offsetWidth;
                        var ctnHeight   = element[0].offsetHeight;
                        var ctnRatio    = ctnWidth / ctnHeight;

                        var imgWidth    = loadedImage.width;
                        var imgHeight   = loadedImage.height;
                        var imgRatio    = imgWidth / imgHeight;

                        var widthRatio  = ctnWidth / imgWidth;
                        var heightRatio = ctnHeight / imgHeight;

                        var fitTo = WIDTH;
                        if (widthRatio > heightRatio) fitTo = HEIGHT;

                        if (fitTo === WIDTH) {
                            element[0].style.backgroundSize = Math.max(ctnHeight * imgRatio, ctnWidth) + 'px';
                        } else {
                            element[0].style.backgroundSize = Math.max(ctnWidth * imgRatio, ctnHeight) + 'px';
                        }
                    };
                    var initImage = function() {
                        var loader = $compile('<md-progress-circular class="md-hue-2 block-center" style="margin-top: calc(50% - 50px);" md-mode="indeterminate"></md-progress-circular>')(scope);
                        element[0].appendChild(loader[0]);

                        loadedImage = new Image();
                        loadedImage.onload = function() {
                            fitToContainer();
                            element[0].style.backgroundImage    = 'url("' + src + '")';
                            element[0].style.backgroundPosition = '50% 50%';
                            element[0].style.backgroundRepeat   = 'no-repeat';

                            element[0].removeChild(loader[0]);
                        };
                        loadedImage.onerror = function() {
                            element[0].removeChild(loader[0]);
                        };
                        loadedImage.src = src;
                    };
                    var loadInView = function() {
                        if (!isScrolledIntoView(element[0])) return;

                        window.removeEventListener('scroll', loadInView);
                        initImage();
                    };

                    if (!invDisabled) {
                        window.addEventListener('scroll', loadInView);
                        scope.$on('$destroy', function() {
                            window.removeEventListener('scroll', loadInView);
                        });
                        loadInView();
                    } else {
                        initImage();
                    }

                    if (resDisabled) return;
                    window.addEventListener('resize', fitToContainer);
                    scope.$on('$destroy', function() {
                        window.removeEventListener('resize', fitToContainer);
                    });
                });
            }
        };
    }]);

})(window, window.angular);
