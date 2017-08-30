/**
 * @author Landmaster
 * Modify localizations here. Prefix them with {@code $}.
 */

require('./l10n');

String.toLocaleString({
	'en': {
		$main_title: 'Lord of Dunans',
		$main_play: 'Play',
		
		$gui_login: 'Login',
		$gui_register: 'Register',
		$gui_back: 'Back',
		$gui_logout: 'Logout',
		
		$data_username: 'Username',
		$data_password: 'Password',
		$data_password_confirm: 'Confirm Password',
		
		$error_unconfirmed_password: 'The password and confirmed password do not match',
		$error_short_password: 'The password must have at least %d characters',
		$error_long_password: 'The password must have at most %d characters',
		$error_bad_username: 'The username ‘%s’ is already taken',
		$error_short_username: 'The username ‘%s’ must have at least %d characters',
		$error_missing_username: 'The username ‘%s’ does not exist',
		$error_bad_password: 'Incorrect password',
		$error_internal_server: 'Internal server error',
		$error_timeout: 'Request timed out',
	}
});