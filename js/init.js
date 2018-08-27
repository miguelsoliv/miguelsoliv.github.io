/*-----------------------------------------------------------------------------------
 /*
 /* Init JS
 /*
 -----------------------------------------------------------------------------------*/

jQuery(document).ready(function ($) {
    $('#contactForm #contactName').val("");
    $('#contactForm #contactEmail').val("");
    $('#contactForm #contactSubject').val("");
    $('#contactForm #contactMessage').val("");

    /*----------------------------------------------------*/
    /* FitText Settings
     ------------------------------------------------------ */

    setTimeout(function () {
        $('h1.responsive-headline').fitText(1, {minFontSize: '40px', maxFontSize: '90px'});
    }, 100);

    /*----------------------------------------------------*/
    /* Smooth Scrolling
     ------------------------------------------------------ */

    $('.smoothscroll').on('click', function (e) {
        e.preventDefault();

        var target = this.hash,
                $target = $(target);

        $('html, body').stop().animate({
            'scrollTop': $target.offset().top
        }, 800, 'swing', function () {
            window.location.hash = target;
        });
    });

    /*----------------------------------------------------*/
    /* Highlight the current section in the navigation bar
     ------------------------------------------------------*/

    var sections = $("section");
    var navigation_links = $("#nav-wrap a");

    sections.waypoint({
        handler: function (event, direction) {

            var active_section;

            active_section = $(this);
            if (direction === "up")
                active_section = active_section.prev();

            var active_link = $('#nav-wrap a[href="#' + active_section.attr("id") + '"]');

            navigation_links.parent().removeClass("current");
            active_link.parent().addClass("current");

        },
        offset: '35%'

    });

    /*----------------------------------------------------*/
    /*	Make sure that #header-background-image height is
     /* equal to the browser height.
     ------------------------------------------------------ */

    $('header').css({'height': $(window).height()});
    $(window).on('resize', function () {

        $('header').css({'height': $(window).height()});
        $('body').css({'width': $(window).width()});
    });

    /*----------------------------------------------------*/
    /*	Fade In/Out Primary Navigation
     ------------------------------------------------------*/

    $(window).on('scroll', function () {
        var h = $('header').height();
        var y = $(window).scrollTop();
        var nav = $('#nav-wrap');

        if ((y > h * .20) && (y < h) && ($(window).outerWidth() > 768)) {
            nav.fadeOut('fast');
        } else {
            if (y < h * .20) {
                nav.removeClass('opaque').fadeIn('fast');
            } else {
                nav.addClass('opaque').fadeIn('fast');
            }
        }
    });

    /*----------------------------------------------------*/
    /*	Modal Popup
     ------------------------------------------------------*/

    $('.item-wrap a').magnificPopup({
        type: 'inline',
        fixedContentPos: false,
        removalDelay: 200,
        showCloseBtn: false,
        mainClass: 'mfp-fade'
    });

    $(document).on('click', '.popup-modal-dismiss', function (e) {
        e.preventDefault();
        $.magnificPopup.close();
    });

    /*----------------------------------------------------*/
    /*	Flexslider
     /*----------------------------------------------------*/
    $('.flexslider').flexslider({
        namespace: "flex-",
        controlsContainer: ".flex-container",
        animation: 'slide',
        controlNav: true,
        directionNav: false,
        smoothHeight: true,
        slideshowSpeed: 7000,
        animationSpeed: 600,
        randomize: false
    });
});

    /*----------------------------------------------------*/
    /*	contact form
     ------------------------------------------------------*/
(function () {
    function validEmail(email) {
        var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return regex.test(email);
    }

    // get all data in form and return object
    function getFormData(form) {
        var elements = form.elements;

        var fields = Object.keys(elements).filter(function (k) {
            return (elements[k].name !== "honeypot");
        }).map(function (k) {
            if (elements[k].name !== undefined) {
                return elements[k].name;
                // special case for Edge's html collection
            } else if (elements[k].length > 0) {
                return elements[k].item(0).name;
            }
        }).filter(function (item, pos, self) {
            return self.indexOf(item) == pos && item;
        });

        var formData = {};
        fields.forEach(function (name) {
            var element = elements[name];

            // singular form elements just have one value
            formData[name] = element.value;

            // when our element has multiple items, get their values
            if (element.length) {
                var data = [];
                for (var i = 0; i < element.length; i++) {
                    var item = element.item(i);
                    if (item.checked || item.selected) {
                        data.push(item.value);
                    }
                }
                formData[name] = data.join(', ');
            }
        });

        // add form-specific values into the data
        formData.formDataNameOrder = JSON.stringify(fields);
        formData.formGoogleSheetName = form.dataset.sheet || "responses"; // default sheet name
        formData.formGoogleSendEmail = form.dataset.email || ""; // no email by default

        return formData;
    }

    function handleFormSubmit(event) {
        jQuery(function ($) {
            // we are submitting via xhr below
            event.preventDefault();
            
            $('form#contactForm button').prop("disabled", true);
            $('#image-loader').fadeIn();
            
            var form = event.target;
            // get the values submitted in the form
            var data = getFormData(form);

            $('#name-error').html("");
            $('#email-error').html("");
            $('#msg-error').html("");

            var check = false;

            if (data.contactName.length < 2) {
                $('#name-error').html("Por favor, informe seu nome");
                check = true;
            }

            if (!validEmail(data.contactEmail)) {
                $('#email-error').html("Por favor, digite um e-mail válido");
                check = true;
            }

            if (data.contactSubject == '') {
                data.contactSubject = "Contact Form Submission";
            }

            if (data.contactMessage.length < 15) {
                $('#msg-error').html("Por favor, digite sua mensagem (min. de 15 caracteres)");
                check = true;
            }

            if (check) {
                $([document.documentElement, document.body]).animate({
                    scrollTop: $(".lead").offset().top
                }, 750);
                $('#image-loader').fadeOut();
                $('form#contactForm button').prop("disabled", false);
                return false;
            }

            var url = form.action;
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function () {
                $('form#contactForm').fadeOut();
                
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var response = JSON.parse(xhr.responseText);
                    if (xhr.status === 200 && response.result === 'success') {
                        $('#message-success').fadeIn();
                    }
                }

                return;
            };
            
            xhr.addEventListener("error", function () {
                $('#message-warning').fadeIn();
            });
            
            // url encode form data for sending as post data
            var encoded = Object.keys(data).map(function (k) {
                return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
            }).join('&');
            xhr.send(encoded);
        });
    }

    function loaded() {
        // bind to the submit event of our form
        var forms = document.querySelectorAll("form.contactForm");
        for (var i = 0; i < forms.length; i++) {
            forms[i].addEventListener("submit", handleFormSubmit, false);
        }
    }
    ;
    document.addEventListener("DOMContentLoaded", loaded, false);
})();