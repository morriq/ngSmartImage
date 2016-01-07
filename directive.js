export default class Directive{
    constructor() {
        return ($compile) => {
            'ngInject';

            const tolerance = 0.05;

            const WIDTH = 1;

            const HEIGHT = 0;

            var isScrolledIntoView = function(el) {
                var elemTop     = el.getBoundingClientRect().top;
                var elemBottom  = el.getBoundingClientRect().bottom;

                return elemTop < window.innerHeight && elemBottom >= 0;
            };

            return {
                restrict: 'A',
                link: (scope, element, attrs) => {
                    var loadedImage;

                    let src = attrs.smartImageSrc;
                    let invDisabled = attrs.smartImageDisabledInview || false;
                    let resDisabled = attrs.smartImageDisableResize || false;
                    let fitToContainer = () => {
                        if (!loadedImage) return;

                        var ctnWidth    = element[0].offsetWidth;
                        var ctnHeight   = element[0].offsetHeight;
                        var ctnRatio    = ctnWidth / ctnHeight;

                        var imgWidth    = loadedImage.width;
                        var imgHeight   = loadedImage.height;
                        var imgRatio    = imgWidth / imgHeight;

                        if (Math.abs(ctnRatio - imgRatio) <= tolerance) return;

                        var widthRatio  = ctnWidth / imgWidth;
                        var heightRatio = ctnHeight / ctnHeight;

                        var fitTo = WIDTH;
                        if (widthRatio > heightRatio) fitTo = HEIGHT;

                        if (fitTo === WIDTH) {
                            element[0].style.backgroundSize = `${Math.max(ctnHeight * imgRatio, ctnWidth)}px`;
                        } else {
                            element[0].style.backgroundSize = `${Math.max(ctnWidth * imgRatio, ctnHeight)}px`;
                        }
                    };
                    let initImage = () => {
                        var loader = $compile(`
                            <md-progress-circular class="md-hue-2 block-center" style="margin-top: calc(50% - 50px);" md-mode="indeterminate"></md-progress-circular>
                        `)(scope);
                        element[0].appendChild(loader[0]);

                        loadedImage = new Image();
                        loadedImage.onload = () => {
                            fitToContainer();
                            element[0].style.backgroundImage = `url('${src}')`;
                            element[0].style.backgroundPosition = '50% 50%';

                            element[0].removeChild(loader[0]);
                        };
                        loadedImage.src = src;
                    };
                    let loadInView = () => {
                        if (!isScrolledIntoView(element[0])) return;

                        window.removeEventListener('scroll', loadInView);
                        initImage();
                    };

                    if (!invDisabled) {
                        window.addEventListener('scroll', loadInView);
                        scope.$on('$destroy', () => {
                            window.removeEventListener('scroll', loadInView);
                        });
                        loadInView();
                    } else {
                        initImage();
                    }

                    if (resDisabled) return;
                    window.addEventListener('resize', fitToContainer);
                    scope.$on('$destroy', () => {
                        window.removeEventListener('resize', fitToContainer);
                    });
                }
            };
        };
    }
};
