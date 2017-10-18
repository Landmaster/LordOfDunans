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
		
		$prompt_choose_character: 'Choose Main and Towers',
		
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
		$error_opponent_disconnected: 'Opponent disconnected',
		$error_user_already_logged: 'User ‘%s’ is already logged on',
		
		$character_landmaster: 'Landmaster',
		
		$prep_chosen_character: 'Chosen character: %s',
		$prep_tower: 'Towers',
		
		$image_start: '/assets/images/start/en_us.svg',
		$image_start_desc: 'Start',
		
		$tower_petty_tower: 'Petty Tower',
		$tower_tower_of_ignorance: 'Tower of Ignorance',
		$tower_covert_tower: 'Covert Tower',
		$tower_tower_of_activists: 'Tower of Activists',
		
		$start_timer: '%s seconds left',
		$start_wait: 'Waiting for opponent (%s seconds)',
		
		$error_not_in_time: 'Did not start in time',
		$error_opponent_not_in_time: 'Opponent did not start in time',
	}
});