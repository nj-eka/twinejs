// The main entry point for the application.

'use strict';
let Vue = require('vue');

// Customize Vue with our global extensions. This has to be done as early as
// possible in the module loading process so that the extensions are available
// throughout the application.

const localeFilters = require('./vue/filters/locale');
const mountMixin = require('./vue/mixins/mount-to');
const tooltipDirective = require('./vue/directives/tooltip');
const mouseScrollingDirective = require('./vue/directives/mouse-scrolling');

Vue.mixin(mountMixin);
localeFilters.addTo(Vue);
tooltipDirective.addTo(Vue);
mouseScrollingDirective.addTo(Vue);

const locale = require('./locale');
const notify = require('./ui/notify');
const AppPref = require('./data/models/app-pref');
const TwineApp = require('./common/app');
const TwineRouter = require('./common/router');

// Shim ES6 promises if the browser doesn't support them.

require('es6-promise');

// Start the application after loading the appropriate locale data.

((() => {
	let userLocale;

	// The user can specify a locale parameter in the URL to override the app
	// preference, in case things go severely wrong and they need to force it.

	const localeUrlMatch = /locale=([^&]+)&?/.exec(window.location.search);

	if (localeUrlMatch) {
		userLocale = localeUrlMatch[1];
	}
	else {
		// If an app preference is not yet set, default to our best guess based
		// on the browser.
		// http://stackoverflow.com/questions/673905/best-way-to-determine-users-locale-within-browser

		const localePref = AppPref.withName(
			'locale',
			window.navigator.userLanguage ||
			window.navigator.language ||
			window.navigator.browserLanguage ||
			window.navigator.systemLanguage ||
			'en-us'
		);

		userLocale = localePref.get('value');
	}

	if (typeof userLocale === 'string') {
		// Load the locale, then start the application.

		locale.load(userLocale.toLowerCase(), () => {
			TwineRouter.start(TwineApp, '#main');
		});
	}
	else {
		// Something has gone pretty wrong; fall back to English as a last
		// resort.

		locale.load('en', () => {
			TwineRouter.start(TwineApp, '#main');

			Vue.nextTick(() => {
				// The message below is not localized because if we've reached
				// this step, localization is not working.

				notify(
					'Your locale preference has been reset to English due ' +
					'to a technical problem.<br>Please change it with the ' +
					'<b>Language</b> option in the story list.', 'danger');
			});
		});
	}
}))();
