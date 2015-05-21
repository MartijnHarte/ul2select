/**
 * Function to turn an ul-li to an select-like component
 * that will store the data or navigate to the a-link when clicked or chosen
 */
(function ($) {
    $.fn.ul2select = function (settings) {
        settings = $.extend({
            novalue: 'Maak uw keuze',
            type: ''
        }, settings);

        /**
         * Function to select li and follow the a-node
         * in the li
         *
         * @param li
         */
        function selectLi(li) {
            $ul = li.parent('ul');

            $allOptions = $ul.children('li:not(.init)');
            $allOptions.removeClass('selected');

            li.addClass('selected');

            $ul.children('.init').html(li.html());
            $ul.removeClass('open');

            switch (settings.type) {
              default:
                $ul.data('value', li.data('value'));
                break;
              case 'input:radio':
                $radio = li.find(settings.type);
                $radio.prop('checked', true);
                $ul.data('value', $radio.val());
                break;
              case 'a':
                // follow link, when pressed enter
                window.location = li.find(settings.type).attr('href');
                break;
            }

            $ul.trigger('change');
        }

        return this.each(
            function () {
                var $ul = $(this);
                var $selected = $ul.find('.active');

                // $ul.find('li').each(
                //   function() {
                //     if(!$(this).find(settings.type).length) {
                //       $(this).append($('<input type="radio" class="hidden" name="' + $(this).closest("ul").attr('id') + '" value="' + $(this).data('value') + '">'));
                //     }
                //   }
                // );

                // add default class
                $ul.addClass('ul2select');

                // make it possible to attach keyboard events
                $ul.attr('tabindex', 0);

                // set 'title'
                if(settings.novalue != false) {
                    $ul.prepend('<li class="init selected">' + settings.novalue + '</li>');
                } else {
                    if($selected.length == 1) {
                        // move active item to the top
                        $init = $selected.clone();
                        $init.prependTo($ul).removeClass('active');
                        $init.addClass('init');
                        $selected.addClass('selected');
                    } else {
                        $ul.find('li').first().addClass('init');
                    }
                }

                // register click function on ul
                $ul.on("click", ".init", function() {
                    // remove all open classes from other ul2selects
                    $(document).find('ul.ul2select').removeClass('open');

                    $(this).closest("ul").toggleClass('open');
                });

                // register click function on li's
                $ul.on("click", "li:not(.init)", function() {
                    selectLi($(this));
                });

                // register click function on li.init a
                // preventing it to navigate
                $ul.on("click", "li.init a", function(e) {
                    e.preventDefault();
                });

                // register mouse-out function set timer to close list
                // when user comes back, we keep the list open
                $ul.on("mouseleave", "li", function() {
                    $ul = $(this).parent('ul');
                    if(!$ul.hasClass('open')) {
                        return;
                    }
                    $ul.data('closing', true);
                    setTimeout(function() {
                       $ul.trigger('closeList');
                    }, 500);
                });

                // register mouse-enter function
                // remove data-closing to prevent the list from closing
                $ul.on("mouseenter", "li", function() {
                    $ul = $(this).parent('ul');
                    $ul.data('closing', false);
                });

                // Register Closelist event on ul
                $ul.on("closeList", function() {
                    if($(this).data('closing')) {
                        $ul.removeClass('open');
                    }
                });

                // register keyboard functions on ul
                $ul.keydown(function(e) {

                    // ingore keyboard events when list isn't open
                    if(!$(this).hasClass('open')) {
                        return;
                    }

                    // filter only the keys we need
                    if(jQuery.inArray( e.keyCode, [38, 40, 13] ) == -1) {
                        return;
                    }

                    var selected = $(this).find(".selected");
                    selected.removeClass('selected');

                    switch(e.keyCode) {
                        case 38:
                            // user pressed 'up'
                            if (selected.prev().length == 0) {
                                selected.siblings().last().addClass("selected");
                            } else {
                                selected.prev().addClass("selected");
                            }

                            break;
                        case 40:
                            // user pressed 'down'
                            if (selected.next().length == 0) {
                                selected.siblings().first().addClass("selected");
                            } else {
                                selected.next().addClass("selected");
                            }

                            break;
                        case 13:
                            // user pressed 'enter'
                            selectLi(selected);
                            break;
                    }

                    e.preventDefault();
                });
            }
        );
    };
})(jQuery);
