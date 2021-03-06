/** @format */

/**
 * Publicize connections verification component.
 *
 * Component to create Ajax request to check
 * all connections. If any connection tests failed,
 * a refresh link may be provided to the user. If
 * no connection tests fail, this component will
 * not render anything.
 */

/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class PublicizeConnectionVerify extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			failedConnections: {},
			isLoading: false,
		};
	}

	/**
	 * Callback for connection test request
	 *
	 * Receives results of connection request and
	 * updates component state to display potentially
	 * failed connections.
	 *
	 * @param {object} response Response from '/publicize/connection-test-results' endpoint
	 */
	connectionTestComplete = response => {
		const failureList = response.data.filter( connection => ! connection.test_success );
		this.setState( {
			failedConnections: failureList,
			isLoading: false,
		} );
	};

	/**
	 * Callback for connection test request failure
	 */
	connectionTestRequestFailed = () => {
		this.setState( {
			isLoading: false,
		} );
	};

	/**
	 * Starts request to check connections
	 *
	 * Checks connections with using the '/publicize/connection-test-results' endpoint
	 */
	connectionTestStart = () => {
		apiFetch( { path: '/wpcom/v2/publicize/connection-test-results' } )
			.then( () => this.connectionTestComplete )
			.catch( () => this.connectionTestRequestFailed );
	};

	/**
	 * Opens up popup so user can refresh connection
	 *
	 * Displays pop up with to specified URL where user
	 * can refresh a specific connection.
	 *
	 * @param {object} event Event instance for onClick.
	 */
	refreshConnectionClick = event => {
		const { href, title } = event.target;
		event.preventDefault();
		// open a popup window
		// when it is closed, kick off the tests again
		const popupWin = window.open( href, title, '' );
		window.setInterval( () => {
			if ( false !== popupWin.closed ) {
				this.connectionTestStart();
			}
		}, 500 );
	};

	componentDidMount() {
		this.connectionTestStart();
	}

	render() {
		const { failedConnections } = this.state;
		if ( failedConnections.length > 0 ) {
			return (
				<div className="below-h2 error publicize-token-refresh-message">
					<p key="error-title">
						{ __(
							'Before you hit Publish, please refresh the following connection(s) to make sure we can Publicize your post:'
						) }
					</p>
					{ failedConnections.filter( connection => connection.userCanRefresh ).map( connection => (
						<a
							className="pub-refresh-button button"
							title={ connection.refreshText }
							href={ connection.refreshURL }
							target={ '_refresh_' + connection.serviceName }
							onClick={ this.refreshConnectionClick }
							key={ connection.connectionID }
						>
							{ connection.refreshText }
						</a>
					) ) }
				</div>
			);
		}
		return null;
	}
}

export default PublicizeConnectionVerify;
