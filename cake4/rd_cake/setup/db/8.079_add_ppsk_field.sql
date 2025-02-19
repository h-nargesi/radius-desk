drop procedure if exists add_ppsk_field;

delimiter //
create procedure add_ppsk_field()
begin

if not exists (select * from information_schema.columns
    where column_name = 'ppsk' and table_name = 'permanent_users' and table_schema = 'rd') then
    alter table permanent_users add column `ppsk` varchar(100) NOT NULL DEFAULT '';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'realm_vlan_id' and table_name = 'permanent_users' and table_schema = 'rd') then
    alter table permanent_users add column `realm_vlan_id` int(11) DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where table_name = 'realm_vlans' and table_schema = 'rd') then
	CREATE TABLE `realm_vlans` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `realm_id` int(11) NOT NULL,
      `vlan` int(4) DEFAULT NULL,
      `name` varchar(100) NOT NULL,
      `comment` varchar(255) NOT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'realm_ssids' and table_schema = 'rd') then
	CREATE TABLE `realm_ssids` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `realm_id` int(11) NOT NULL,
      `name` varchar(32) DEFAULT NULL,
      `ssid_type` enum('standalone','mesh','ap_profile') DEFAULT 'standalone',
      `mesh_id` int(11) DEFAULT NULL,
      `mesh_entry_id` int(11) DEFAULT NULL,
      `ap_profile_id` int(11) DEFAULT NULL,
      `ap_profile_entry_id` int(11) DEFAULT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
end if;

if not exists (select * from information_schema.columns
    where table_name = 'realm_pmks' and table_schema = 'rd') then
	CREATE TABLE `realm_pmks` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `realm_id` int(11) NOT NULL,
      `realm_ssid_id` int(11) NOT NULL,
      `ppsk` varchar(100) DEFAULT NULL,
      `pmk` varchar(64) DEFAULT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
end if;


if not exists (select * from information_schema.columns
    where table_name = 'realm_mac_users' and table_schema = 'rd') then
	CREATE TABLE `realm_mac_users` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `realm_id` int(11) NOT NULL,
      `mac` varchar(17) DEFAULT NULL,
      `username` varchar(64) DEFAULT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `realm_mac` (`realm_id`,`mac`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'realm_id' and table_name = 'ap_profile_entries' and table_schema = 'rd') then
    alter table ap_profile_entries add column `realm_id` int(11) DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'realm_id' and table_name = 'mesh_entries' and table_schema = 'rd') then
    alter table mesh_entries add column `realm_id` int(11) DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'operator_name' and table_name = 'radacct' and table_schema = 'rd') then
    alter table radacct add column `operator_name` varchar(32) NOT NULL DEFAULT '';
end if;


end//

delimiter ;
call add_ppsk_field;

