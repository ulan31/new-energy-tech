(function($){
$(document).ready(function(){

    $('.ancr').each(function(){
        var $ancr = $(this);
        this.announcer = new Announcer($ancr);
    });

});
})(jQuery);

function Announcer_Position(){
    this.spacer = false;
    this.normal_moved = false;

    this.sticky_offset = 0;
    this.sticky_group = false;
    this.sticky_elements = false;
}

function Announcer_State(){

    this.bars = [];
    this.top = new Announcer_Position();
    this.bottom = new Announcer_Position();
    this.on_scroll_bars = [];

    this.listen_on_scroll();

}

Announcer_State.prototype.add = function(bar){

    var position = bar.props.position;
    var position_class = '.ancr-pos-' + position;

    this.bars.push(bar);

    if(bar.props.sticky == 'yes'){
        this.add_spacer(position);
        if(!this[position].sticky_group){
            this[position].sticky_group = jQuery(position_class + '.ancr-sticky');
        }
    }else{
        if(position == 'top'){
            if(!this[position].normal_moved){
                var normal_class = position_class + '.ancr-normal';
                if(this[position].spacer){
                    jQuery(normal_class).detach().insertAfter(this[position].spacer);
                }else{
                    jQuery(normal_class).detach().prependTo('body');
                }
                this[position].normal_moved = true;
            }
        }
    }

    if(bar.props.show_on == 'page_scroll'){
        this.on_scroll_bars.push(bar);
    }

}

Announcer_State.prototype.add_spacer = function(position){
    if(!this[position].spacer){
        var $spacer = jQuery('<div class="ancr-' + position + '-spacer"></div>');
        this[position].spacer = $spacer;
        if(position == 'top'){
            jQuery('body').prepend($spacer);
        }else{
            jQuery('body').append($spacer);
        }
    }
}

Announcer_State.prototype.update_offsets = function(position){

    if(this[position].sticky_group){
        this[position].sticky_offset = this[position].sticky_group.outerHeight();
        this[position].spacer.height(this[position].sticky_offset);
        if(jQuery('body').hasClass('admin-bar')){
            jQuery('html').css('margin-top', this[position].sticky_offset + 'px');
        }
    }

}

Announcer_State.prototype.set_cookie = function(name, value, expiry_days, site_wide){

    if(('' + name).includes('PREVIEW')){
        return;
    }

    var expires = '';
    var path = '; path=/';

    if(expiry_days) {
        var date = new Date();
        date.setTime(date.getTime()+(expiry_days*24*60*60*1000));
        expires = "; expires=" + date.toGMTString();
    }

    if(!site_wide){
        path = '; path=' + window.location.pathname;
    }

    document.cookie = name + '=' + value + expires + path;

}

Announcer_State.prototype.get_cookie = function(name){

    var name_eq = name + "=";
    var ca = document.cookie.split(';');

    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);

        if (c.indexOf(name_eq) == 0){
            return c.substring(name_eq.length, c.length);
        }
    }

    return null;

}

Announcer_State.prototype.listen_on_scroll = function(){

    var self = this;
    var $ = jQuery;

    $(window).scroll(function(){
        var at = $(window).scrollTop();

        for(var i = 0; i < self.on_scroll_bars.length; i++){
            var bar = self.on_scroll_bars[i];
            
            if(at >= bar.props.show_after_scroll){
                if(!bar.is_shown){
                    if(bar.can_show()) bar.show();
                }
            }else{
                if(bar.is_shown){
                    bar.hide(false);
                }
            }
        }

    });

}

Announcer_State.prototype.adjust_fixed_elements = function(){

    var top = this['top'];

    if(!top.sticky_group){
        return;
    }

    if(!top.sticky_elements){

        var possible_stickies = document.querySelectorAll('div, header, nav');
        top.sticky_elements = [];

        for(var i = 0; i < possible_stickies.length; i++){
            var element = possible_stickies[i];

            if(element.className.includes('ancr-')){
                continue;
            }

            var element_bound = element.getBoundingClientRect();
            var element_style = window.getComputedStyle(element, null);
    
            if(element_style.position === 'fixed' && element_style.display != 'none' && element_bound.top <= top['sticky_offset'] && element_bound.left == 0){
                top.sticky_elements.push(element);
            }
        }

    }

    for(i = 0; i < top.sticky_elements.length; i++){
        var element = top.sticky_elements[i];
        element.style.top = top['sticky_offset'] + 'px';
    }

}

Announcer_State.prototype.is_mobile = function(){
    return /Mobi|Android/i.test(navigator.userAgent);
}

window.ancr_state = new Announcer_State();

function Announcer($el){

    this.$el = $el;
    this.props = $el.data('props');
    this.id = this.props.id;
    this.is_shown = false;
    this.close_cookie = 'ancr_close_' + this.id;
    this.force_closed = false;

    ancr_state.add(this);

    this.register_events();
    this.check_show();

}

Announcer.prototype.register_events = function(){

    var self = this;
    var $close_btn = this.$el.find('.ancr-close');

    if(this.props.close_content_click == 'yes'){
        $close_btn = $close_btn.add(this.$el.find('.ancr-inner a'));
    }

    if($close_btn.length != 0){
        $close_btn.on('click', function(e){
            if(jQuery(this).attr('href') == '#'){
                e.preventDefault();
            }
            self.hide();
            if(self.props.show_on == 'page_scroll'){
                self.force_closed = true;
            }
        });
    }

}

Announcer.prototype.can_show = function(){

    if(this.props.display == 'custom'){
        return false;
    }

    var closed_cookie = ancr_state.get_cookie(this.close_cookie);

    if(this.props.devices == 'mobile_only' && !ancr_state.is_mobile()){
        return false;
    }

    if(this.props.devices == 'desktop_only' && ancr_state.is_mobile()){
        return false;
    }

    if(this.props.keep_closed == 'yes' && closed_cookie){
        return false;
    }

    if(this.props.display == 'schedule'){
        var now = Date.now()/1000;
        var schedule_from = this.props.schedule_from || (now - 1);
        var schedule_to = this.props.schedule_to || (now + 1);

        if(now > schedule_from && now < schedule_to){
            return true;
        }else{
            return false;
        }
    }

    if(this.force_closed){
        return false;
    }

    return true;

}

Announcer.prototype.check_show = function(){

    var self = this;

    if(!this.can_show()){
        return;
    }

    if(this.props.show_on == 'page_open'){
        self.show();
    }else if(this.props.show_on == 'duration'){
        setTimeout(function(){
            self.show();
        }, this.props.show_after_duration * 1000)
    }

}

Announcer.prototype.show = function(){
    var self = this;
    this.is_shown = true;

    this.animate('show', function(){
        self.after_show();
    });

}

Announcer.prototype.after_show = function(){

    var position = this.props.position;
    ancr_state.update_offsets(position);
    ancr_state.adjust_fixed_elements();

    if(this.props.auto_close != '0'){
        this.auto_close();
    }

}

Announcer.prototype.hide = function(set_cookie=true){
    var self = this;
    this.is_shown = false;

    this.animate('hide', function(){
        self.after_hide(set_cookie);
    });
}

Announcer.prototype.after_hide = function(set_cookie=true){

    var position = this.props.position;
    ancr_state.update_offsets(position);
    ancr_state.adjust_fixed_elements();

    var closed_duration = (this.props.closed_duration == '0') ? false : this.props.closed_duration;

    if(this.props.keep_closed == 'yes' && set_cookie){
        ancr_state.set_cookie(this.close_cookie, 1, closed_duration, true);
    }

}

Announcer.prototype.set_offset = function(){
    var position = this.props.position;
    var css_props = {};
    var offset = ancr_state[position].offset_total;

    css_props[position] = offset + 'px';
    //this.$el.animate(css_props);

}

Announcer.prototype.auto_close = function(){
    var self = this;
    setTimeout(function(){
        self.hide();
    }, this.props.auto_close * 1000);
}

Announcer.prototype.animate = function(type, callback){

    var animations = {
        'slide' : ['slideDown', 'slideUp'],
        'fade' : ['fadeIn', 'fadeOut']
    };

    var chosen = (type == 'show') ? this.props.open_animation : this.props.close_animation;
    var duration = 400;
    var animation = 'show';

    if(chosen == 'none'){
        animation = (type == 'show') ? 'show' : 'hide';
        duration = 0;
    }else{
        animation = (type == 'show') ? animations[chosen][0] : animations[chosen][1];
    }

    this.$el[animation](duration, callback);

}