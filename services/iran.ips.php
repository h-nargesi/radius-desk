<?php

function get_url_contents($url) {
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	$contents = curl_exec($ch);
	curl_close($ch);
	return $contents;
}

function add_phrase_to_beginning($contents, $phrase) {
	$lines = explode("\n", $contents);
	$new_lines = array();
	foreach ($lines as $line) {
		if (strlen($line) > 0)
			array_push($new_lines, $phrase . $line);
	}
	return implode("\n", $new_lines);
}

$url = 'https://www.ipdeny.com/ipblocks/data/aggregated/ir-aggregated.zone';
$contents = get_url_contents($url);
$phrase = '/ip firewall address-list add comment="Iran (Islamic Republic of)" list=Local address=';
$new_contents = add_phrase_to_beginning($contents, $phrase);

header("Content-Disposition: attachment; filename=\"iran-ips.rsc\"");
header('Content-type: text/plain');

echo $new_contents;

?>
