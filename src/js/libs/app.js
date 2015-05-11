// If script is not localized apply defaults
var scriptData = scriptData || {
	navbarHeight : 90,
	navbarScrolled : 70,
	navbarScrolledPoint : 90,
	scrollFinishedMessage : 'No more items to load.',
	hoverMenu : {
		hoverActive : false,
		hoverDelay : 1,
		hoverFadeDelay : 200
	}
};

var dangers_text = {
	'physical-attack': 'Physical Attack',
	'verbal-attack': 'Verbal Attack',
	'car-accident': 'Car Accident',
	'fire-danger': 'Fire',
	'being-followed': 'Being Followed',
	'high-risk-activity': 'High-Risk Activity',
	'feeling-unsafe': 'Feeling Unsafe',
	'completely-lost': 'Completely Lost'
};

var dangers_prefix = {
	'physical-attack': 'a ',
	'verbal-attack': 'a ',
	'car-accident': 'a ',
	'fire-danger': 'a ',
	'being-followed': '',
	'high-risk-activity': 'a ',
	'feeling-unsafe': '',
	'completely-lost': 'being '
};

var dangers_html = {
	'physical-attack': 'Physical<br/>Attack',
	'verbal-attack': 'Verbal<br/>Attack',
	'car-accident': 'Car<br/>Accident',
	'fire-danger': 'Fire<br/>Danger',
	'being-followed': 'Being<br/>Followed',
	'high-risk-activity': 'High-Risk<br/>Activity',
	'feeling-unsafe': 'Feeling<br/>Unsafe',
	'completely-lost': 'Completely<br/>Lost'
};

var types = {
	'immediate': 'Immediate Danger',
	'potential': 'Potential Danger'
};

var initScrollr = false;

var initialized = false;

function scroll_to_top()
{
	setTimeout(function(){
		window.scrollTo(0, 0);
	}, 250);
}

function load_jquery()
{
	// Attempt to lock HTML in Portrait Mode
	var lockOrientation = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;

	$('header a.navbar-brand, header ul.navbar-nav li a').click(function(){
		$('header button.navbar-toggle:not(.collapsed)').trigger('click');
		scroll_to_top();
	});

	// Function to init bootstrap's tooltip
	$('[data-toggle="tooltip"]').tooltip();

	scroll_to_top();

	// Icon Animations
	// ======================

	$('[data-animation]').each(function(){
		var element         = $(this);

		element.on('mouseenter', function(){
			element.addClass('animated ' + element.attr('data-animation'));

		});

		element.on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(e) {
			element.removeClass('animated ' + element.attr('data-animation'));
		});

	});

	// fix placeholders for IE 8 & 9
	$('html.ie8, html.ie9').find('input, textarea').placeholder();

	// add background colour to icons
	$('[data-bgcolor]').each(function(){
		var element         = $(this),
			bg              = element.attr('data-bgcolor');
		element.find('.box-inner').css('background-color' , bg);
	});

	// Add wrapper to select boxes
	$('select').not('.country_to_state, #billing_state, #shipping_state, #calc_shipping_state').wrap('<div class="select-wrap">');

	var menu = $('#masthead');
	var menuInitOffset = $('#masthead').position();
	menuInitOffset = menuInitOffset === undefined ? 0 : menuInitOffset.top;

	var menuItems = $('.navbar').find('a');
	var scrollMenuItems = [];

	if( scrollMenuItems.length ) {
		var sections = [];
		$('body').find('section').each( function() {
			// if section has an id
			if( this.id ) {
				sections.push(this);
			}
		});
		if( sections.length ) {
			menuItems.parent().removeClass('active current-menu-item');
			$.each( sections, function( index, section) {
				var $section = $(section);

				// set all section up waypoints
				$section.waypoint({
					offset: function() {
						return sectionWaypointOffset( $section, 'up', menu );
					},
					handler: function(direction) {
						if( 'up' === direction ) {
							sectionWaypointHandler( scrollMenuItems, menuItems, section );
						}
					}
				});
				// set all section down waypoints
				$section.waypoint({
					offset: function() {
						return sectionWaypointOffset( $section, 'down', menu );
					},
					handler: function(direction) {
						if( 'down' === direction ) {
							sectionWaypointHandler( scrollMenuItems, menuItems, section );
						}
					}
				});
			});
		}
	}

	function sectionWaypointOffset( $section, direction, menu ) {
		// if we are going up start from -1 to make sure event triggers
		var offset = direction === 'up' ? -($section.height() / 2) : 0;
		var menuHeight = parseInt(scriptData.navbarHeight);
		if( menu.length && menu.hasClass('navbar-sticky') && menu.hasClass('navbar-scrolled') ){
			menuHeight = parseInt(scriptData.navbarScrolled);
		}
		var sectionOffset = $section.offset().top;
		var menuOffset = menu.length? menu.position().top : 0;
		if( menu.length && menu.hasClass('navbar-sticky') && (  (menuOffset + menuHeight)  <= sectionOffset ) ){
			offset += menuHeight;
		}
		return offset;
	}

	function sectionWaypointHandler( scrollMenuItems, menuItems, section ) {
		if( scrollMenuItems.length ) {
			menuItems.parent().removeClass('active current-menu-item').end().filter('[href$="' + section.id + '"]').parent().addClass('active current-menu-item');
		}
	}

	// Init SkrollR after portfolio init
	if ( initScrollr === true) {
		skrollr.init({
			forceHeight: false
		});
	}

	// Init classes for Hex boxes
	$('.box-hex').append('<div class="hex-right"></div><div class="hex-left"></div>');

	// header menu changes
	var mastheader = $('.navbar-sticky');

	// stop navbar when at top of the page
	mastheader.waypoint('sticky', {
		stuckClass: 'navbar-stuck'
	});

	// trigger the waypoint only for fixed position navbar
	var menuContainer = $('#masthead.navbar-sticky');
	if(menuContainer.length && menuContainer.hasClass('navbar-sticky')){
		// calculate menu offset in case menu is placed inside the page
		var menuOffset =  menuContainer.position().top;
		$('body').waypoint({
			offset: -( parseInt( scriptData.navbarScrolledPoint ) + menuOffset ),
			handler: function(direction) {
				// add / remove scrolled class
				menuContainer.toggleClass('navbar-scrolled');

				menuContainer.one('MSTransitionEnd webkitTransitionEnd oTransitionEnd transitionend', function(){
					// refresh waypoints only once transition ends in order to get correct offsets for sections.
					if( !menuContainer.hasClass( 'refreshing' ) ) {
						$.waypoints('refresh');
					}
					menuContainer.toggleClass('refreshing');
				});
			}
		});
	}

	$('body').waypoint({
		offset: -90,
		handler: function(direction) {
			if(direction === 'down'){
				$('.go-top').css('bottom', '12px').css('opacity', '1');
			}
			else{
				$('.go-top').css('bottom', '-44px').css('opacity', '0');
			}
		}
	});

	// Animate the scroll to top
	$('.go-top').click(function(event) {
		event.preventDefault();
		$('html, body').animate({scrollTop: 0}, 300);
	});

	// Init On scroll animations
	$('.os-animation').each( function() {
		var osElement = $(this),
			osAnimationClass = osElement.attr('data-os-animation'),
			osAnimationDelay = osElement.attr('data-os-animation-delay');

		osElement.css('-webkit-animation-delay', osAnimationDelay);
		osElement.css('-moz-animation-delay', osAnimationDelay);
		osElement.css('animation-delay', osAnimationDelay);

		$(this).addClass('animated').addClass(osAnimationClass);
	});

	// Hover menu
	// ======================
	if (scriptData.hoverMenu.hoverActive === true) {
		if($('body:not([class*="oxy-agent"])').length) {
			$('.navbar .dropdown').hover(function() {
				$(this).find('.dropdown-menu').first().stop(true, true).delay(scriptData.hoverMenu.hoverDelay).fadeIn(parseInt(scriptData.hoverMenu.hoverFadeDelay));
			}, function() {
				$(this).find('.dropdown-menu').first().stop(true, true).delay(scriptData.hoverMenu.hoverDelay).fadeOut(parseInt(scriptData.hoverMenu.hoverFadeDelay));
			});
		}

		$('#masthead .nav li.dropdown a').on('click', function(){
			var $dropdown = $(this);
			if($dropdown.parent().hasClass('open') && ($dropdown.attr('data-link') !== undefined) ) {
				window.location = $dropdown.attr('data-link');
			}
		});
	}
}

function init_jquery()
{
	if(initialized)
	{
		return false;
	}

	initialized = true;

	setTimeout(load_jquery, 250);
}

function title_case(str)
{
	return clean_string(str.replace(/\w\S*/g, function(txt){
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	}));
}

function clean_string(str)
{
	return str.replace(/[|&;$%@"<>()+,]/g, "").trim();
}

function phone_number(tel)
{
	if (!tel) { return ''; }

	var value = tel.toString().trim().replace(/^\+/, '');

	if (value.match(/[^0-9]/)) {
		return tel;
	}

	var country, city, number;

	switch (value.length) {
		case 10: // +1PPP####### -> C (PPP) ###-####
			country = 1;
			city = value.slice(0, 3);
			number = value.slice(3);
			break;

		case 11: // +CPPP####### -> CCC (PP) ###-####
			country = value[0];
			city = value.slice(1, 4);
			number = value.slice(4);
			break;

		case 12: // +CCCPP####### -> CCC (PP) ###-####
			country = value.slice(0, 3);
			city = value.slice(3, 5);
			number = value.slice(5);
			break;

		default:
			return tel;
	}

	if (country == 1) {
		country = "";
	}

	number = number.slice(0, 3) + '-' + number.slice(3);

	return (country + " (" + city + ") " + number).trim();
}

/**
 * Compare Current Version Number against latest_app_info.current_version
 * @param installed_version Current Version Number to Check Against
 * @param include_beta Whether we should check for possible beta builds too
 * @returns {number} How many versions behind the user is
 */
function compare_app_versions(installed_version, latest_app_info, include_beta)
{
	var start = null;
	var behind = 0;

	if(installed_version !== latest_app_info.current_version)
	{
		for(var i=0; i<latest_app_info.release.length; i++)
		{
			if(include_beta)
			{
				if(start === null && latest_app_info.release[i].version === latest_app_info.current_version)
				{
					start = i;
				}
				if(start !== null && installed_version < latest_app_info.release[i].version)
				{
					behind++;
				}
				if(start !== null && installed_version === latest_app_info.release[i].version)
				{
					break;
				}
			}
			else
			{
				if(start === null && latest_app_info.release[i].production_release === true  && latest_app_info.release[i].production_ios_release_date !== null && latest_app_info.release[i].production_android_release_date !== null && latest_app_info.release[i].version === latest_app_info.current_version)
				{
					start = i;
				}
				if(start !== null && latest_app_info.release[i].production_release === true  && latest_app_info.release[i].production_ios_release_date !== null && latest_app_info.release[i].production_android_release_date !== null && installed_version < latest_app_info.release[i].version)
				{
					behind++;
				}
				if(start !== null && latest_app_info.release[i].production_release === true  && latest_app_info.release[i].production_ios_release_date !== null && latest_app_info.release[i].production_android_release_date !== null && installed_version === latest_app_info.release[i].version)
				{
					break;
				}
			}
		}
	}

	return behind;
}