<?php

	##	# get certificate
	##	location ~ ^/cert/get\?(.+)$ {
	##		rewrite ^/cert/get\?(.+)$ /cake4/rd_cake/src/Controller/Certificates.php?$1;
	##	}
	##	location ~ ^/cert/(.+)$ {
	##		rewrite ^/cert/(.+)$ /cake4/rd_cake/src/Controller/Certificates.php?realm=$1;
	##	}

	$realm = $_GET['realm'];
	$options = $_GET['options'];

	$ovpn_config = file_get_contents('../../resources/configs/default.ovpn');

	$servers = array('lo-a', 'lo-b', 'lo-c');

	switch ($realm) {
		case 'Amir':
			$servers = array('amr-a');
			break;
		case 'Always':
		case 'RyLondon':
			$servers = sort_servers($servers, 0);
			break;
		case 'RyFrankfort':
			$servers = sort_servers($servers, 1);
			break;
		case 'MehrAzar':
		case 'RyHelsinki':
			$servers = sort_servers($servers, 2);
			break;
		default:
			$domain = find_domain($realm);
			if (!is_null($domain)) $servers = $domain;
			else $servers = default_servers($realm, $servers);
			break;
	}

	$title = '.none';
	$remote = 'Photon';

	if ($options === 'all') {
		$remote .= '+';
	} else if (count($servers) > 0) {
		$remote .= ' (' . get_title($servers[0]) . ')';
		$servers = array($servers[0]);
	}

	$remote = "\nsetenv FRIENDLY_NAME \"$remote\"\n";
	foreach ($servers as $domain) {
		if ($title === '.none') {
			$title = ".$domain.photon-bypass";
		}
		$remote .= "remote $domain.photon-bypass.com\n";
	}

	# replace remote
	$ovpn_config = preg_replace("/(^|\\n)remote\s.*(\\n|$)/i", $remote, $ovpn_config);

	header("Content-Disposition: attachment; filename=\"config$title.ovpn\"");
	header('Content-type: application/x-openvpn-profile');

	echo $ovpn_config;

	function find_domain($realm) {
		$realm_components = explode('/', $realm);
		if (count($realm_components) > 1) {
			return array(end($realm_components));
		}
	}

	function default_servers($realm, $servers) {
		foreach ($servers as $domain) {
			if (str_ends_with($realm, '/'. $domain)) {
				return array($domain);
			}
		}
		return sort_servers($servers, count($servers) - 1);
	}

	function sort_servers($servers, $base_index) {
		$step = 1;
		$servers_count = count($servers);
		$sorted_result = array($servers[$base_index]);

		while ($base_index + $step < $servers_count || $base_index - $step >= 0) {

			if ($base_index + $step < $servers_count) array_push($sorted_result, $servers[$base_index + $step]);
			if ($base_index - $step >= 0) array_push($sorted_result, $servers[$base_index - $step]);

			$step = $step + 1;
		}

		return $sorted_result;
	}

	function get_title($server_name) {
		$server_name = strtoupper($server_name);
		$server_name = str_replace('LO', 'ARV', $server_name);
		return $server_name;
	}
?>
