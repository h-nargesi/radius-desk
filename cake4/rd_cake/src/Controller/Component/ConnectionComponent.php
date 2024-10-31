<?php

namespace App\Controller\Component;

use Cake\Controller\Component;
use Cake\ORM\TableRegistry;

class ConnectionComponent extends Component {

    //These are set and read by the other component
    public $br_int      = '';
    public $QmiActive   = false;
    public $MwanActive  = false;    
    public $wanBridgeId = 0; 
    
    public $MwanSettings= [];
       
    protected $vlanHack     = false;

	public function initialize(array $config):void{
        $this->ApConnectionSettings   = TableRegistry::get('ApConnectionSettings');
        $this->Hardwares              = TableRegistry::get('Hardwares');
        $this->MwanInterfaces         = TableRegistry::get('MwanInterfaces');
    }
    
    public function getMwanSettings(){  
        if (count($this->MwanSettings)>0) {
            return $this->MwanSettings;
        }
        return false;
    }
    
    public function getConnectionInfo($ap_id,$hardware){
    
        $network = [];
        array_push( $network,
        [
            "interface"    => "loopback",
            "options"   => [
                "device"        => "lo",
                "proto"         => "static",
                "ipaddr"        => "127.0.0.1",
                "netmask"       => "255.0.0.0"
           ]
        ]);
        
        //-- Test for MWAN--
        $mwanInfo = $this->_getMwanInfo($ap_id);
       	
       	if($mwanInfo){      	      	     	
       	    $network = array_merge( $network,$mwanInfo);       	   	
       	    $this->MwanActive = true;
       	    $this->MwanSettings['network'] = $network;
       	    return $network;
        }
             
        $eWanBridge = $this->ApConnectionSettings->find()
            ->where([
                'ap_id' => $ap_id,
                'name'  => 'wan_bridge',
            ])
            ->first();

        $wanBridgeId = $eWanBridge ? $eWanBridge->value : 0;
        
        $this->wanBridgeId = $wanBridgeId;

        $brInt          = $this->_wanFor($hardware);
        $this->br_int   = $brInt;
        $wanIf          = ($wanBridgeId === 0) ? $brInt : 'wan0';
        
        //--Admin VLAN--
        $eVlanSetting = $this->{'ApConnectionSettings'}->find()->where([
            'ApConnectionSettings.ap_id'    => $ap_id,
            'ApConnectionSettings.grouping' => 'vlan_setting',
            'ApConnectionSettings.name' 	=> 'vlan_admin',
        ])->first();
        
        if($eVlanSetting){
        	$wanIf = $wanIf.'.'.$eVlanSetting->value;
        }
        
        array_push( $network,
            [
                "device" => "br-lan",
                "options"   => [
                	'name'	=> 'br-lan',
                	'type'	=> 'bridge'
                ],
                'lists'	=> ['ports' => [
                	$wanIf
                ]
        	]
        ]);
        
        $wanOptions = $this->_getWanOptions($ap_id);
        
        array_push($network,
            [
                "interface" => 'lan',
                "options"   => $wanOptions
       	]);
       	
       	$wwanOptions = $this->_getWwanOptions($ap_id);
       	
       	if($wwanOptions){   	     	
       	 array_push( $network,
	            [
	                "interface" => "wwan",
	                "options"   => $wwan_options
	       	]);       	   	
        }
        
        return $network;    
    }
    
    private function _getMwanInfo($ap_id){
    
        $config = false;
    
        $mwanSetting = $this->ApConnectionSettings
            ->find()
            ->where([
                'ap_id'     => $ap_id,
                'name'      => 'multi_wan_profile_id',
                'grouping'  => 'mwan_setting',
            ])
            ->first();
    
        if($mwanSetting){
            $multi_wan_profile_id = $mwanSetting->value;
            $mwanInterfaces = $this->MwanInterfaces->find()
                ->where(['MwanInterfaces.multi_wan_profile_id' => $multi_wan_profile_id])
                ->contain(['MwanInterfaceSettings'])
                ->all();
            if (!$mwanInterfaces->isEmpty()) {
                $config = [];
                $this->_buildMwanConfig($mwanInterfaces);
            }
            foreach($mwanInterfaces as $mwanInterface){
                $if_id  = $mwanInterface->id;
                $metric = $mwanInterface->metric;
                
                $this->MwanSettings['firewall']['masq_zones'][] = "mw$if_id";
                
                //-- ETHERNET and WIFI --
                if($mwanInterface->type == 'ethernet'){
                    //find the port
                    $port   = false;
                    $vlan   = false;
                    $dns    = [];
                    $ifOptions = [
            	        'proto'     => 'dhcp',
	                    'device'    => "br-mw$if_id",
	                    'metric'    => $metric
            	    ];
                                        
                    foreach($mwanInterface->mwan_interface_settings as $mwanInterfaceSetting){
                        //--Port--
                        if(($mwanInterfaceSetting->grouping == 'ethernet_setting')&&
                           ($mwanInterfaceSetting->name == 'port')){                           
                           $port = $mwanInterfaceSetting->value;
                        }
                        
                        //--VLAN--
                        if(($mwanInterfaceSetting->grouping == 'ethernet_setting')&&
                           ($mwanInterfaceSetting->name == 'vlan')){                           
                           $vlan = $mwanInterfaceSetting->value;
                        }
                        
                        if($mwanInterfaceSetting->grouping == 'static_setting'){
                            $ifOptions['proto'] = 'static';
                        }
                        
                        if($mwanInterfaceSetting->grouping == 'pppoe_setting'){
                            $ifOptions['proto'] = 'pppoe';
                        }
                        
                        //--Static setting / pppoe setting --
                        if( ($mwanInterfaceSetting->grouping == 'static_setting')||
                            ($mwanInterfaceSetting->grouping == 'pppoe_setting')
                        ){
                            if (in_array($mwanInterfaceSetting->name, ['dns_1', 'dns_2']) && !empty($mwanInterfaceSetting->value)) {
                                $dns[] = $mwanInterfaceSetting->value;
                            } elseif (!in_array($mwanInterfaceSetting->name, ['dns_1', 'dns_2']) && !empty($mwanInterfaceSetting->value)) {
                                $ifOptions[$mwanInterfaceSetting->name] = $mwanInterfaceSetting->value;
                            }
                        }
                    }
                    
                    if($port){
                        //-- First the device
                        if($vlan){
                            $port = $port.'.'.$vlan;
                        }
                        
                        if (!empty($dns)) {
                            $ifOptions['dns'] = implode(' ', $dns);
                        }
                        
                        array_push($config,[
                	        'device'    => "br-mw$if_id",
                	        'options'   => [
                	            'name'      => "br-mw$if_id",
                	            'type'      => 'bridge'
                	        ], 
                	        'lists'     => [
                	            'ports' => [
                	                "$port"
                	            ]
                	        ]
                	    ]);
                	    
                	    array_push($config,[
                	        'interface' => "mw$if_id",
                	        'options'   => $ifOptions
                	    ]);
                	                        
                    }                               
                }
                
                //-- LTE --
                if($mwanInterface->type == 'lte'){                
                    $ifOptions = [
                        'proto'     => 'qmi',
                        'disabled'  => '0',
                        'ifname'    => "mw$if_id",
                        'wan_bridge'=> '0',
                        'metric'    => $metric
                    ];
                
                    foreach($mwanInterface->mwan_interface_settings as $mwanInterfaceSetting){                  
                        if($mwanInterfaceSetting->grouping == 'qmi_setting'){
                            $ifOptions[$mwanInterfaceSetting->name] = $mwanInterfaceSetting->value;
                        }                   
                    }
                
                    array_push($config,[
                        'interface' => "mw$if_id",
                        'options'   => $ifOptions
                    ]);                                
                }
                
                //-- WIFI --
                if($mwanInterface->type == 'wifi'){ 
                
                    if(!isset($this->MwanSettings['wireless'])){
                        $this->MwanSettings['wireless'] = [];
                    }
                               
                    $dns        = [];
                    $wireless   = [];
                    $if_name    = "mw$if_id";
                    
                    $wireless['wifi-iface'] = $if_name;
                    $wireless['options']    = [];
                    
                    $wireless['options']['ifname'] = $if_name;
                    $wireless['options']['mode']   = 'sta';
                    $wireless['options']['network']= $if_name;
                    
                    $ifOptions  = [
            	        'proto'     => 'dhcp',
	                    'metric'    => $metric
            	    ];
                                     
                    foreach($mwanInterface->mwan_interface_settings as $mwanInterfaceSetting){
                                               
                        if($mwanInterfaceSetting->grouping == 'static_setting'){
                            $ifOptions['proto'] = 'static';
                        }
                        
                        if($mwanInterfaceSetting->grouping == 'pppoe_setting'){
                            $ifOptions['proto'] = 'pppoe';
                        }
                        
                        //--Static setting / pppoe setting --
                        if( ($mwanInterfaceSetting->grouping == 'static_setting')||
                            ($mwanInterfaceSetting->grouping == 'pppoe_setting')
                        ){
                            if (in_array($mwanInterfaceSetting->name, ['dns_1', 'dns_2']) && !empty($mwanInterfaceSetting->value)) {
                                $dns[] = $mwanInterfaceSetting->value;
                            } elseif (!in_array($mwanInterfaceSetting->name, ['dns_1', 'dns_2']) && !empty($mwanInterfaceSetting->value)) {
                                $ifOptions[$mwanInterfaceSetting->name] = $mwanInterfaceSetting->value;
                            }
                        }
                        
                        if($mwanInterfaceSetting->grouping == 'wbw_setting'){
                            $wireless['options'][$mwanInterfaceSetting->name] = $mwanInterfaceSetting->value;
                        }                        
                    }
                                                                
                    if (!empty($dns)) {
                        $ifOptions['dns'] = implode(' ', $dns);
                    }
                                  	    
            	    array_push($config,[
            	        'interface' => $if_name,
            	        'options'   => $ifOptions
            	    ]);
            	    
            	    array_push($this->MwanSettings['wireless'],$wireless);
                	                                                       
                }
                                         
            }                                 
        }
        
        return $config;       
    }
    
    private function _getWanOptions($ap_id){
    
        //Defaults
        $wanOptions = [
            'proto'     => 'dhcp',
            'device'    => 'br-lan'
        ];
                
        //---26Jan24 VLAN Hack---
        // --Sample--
        // config interface 'lan'
        //     option device 'br-lan'
        //     option proto 'dhcp'
        //     option ifname 'eth0 eth1'
        //      option stp '1'
        //(Undocumented feature in OpenWrt)
        if($this->vlanHack){       
            $wanOptions['ifname'] = 'eth0 eth1'; 
            $wanOptions['stp']    =  '1';
        }
        //---
        
        //--Static WAN--
        $wanSettings = $this->ApConnectionSettings
            ->find()
            ->where([
                'ap_id'     => $ap_id,
                'grouping'  => 'wan_static_setting',
            ])
            ->all();

        if (!$wanSettings->isEmpty()) {
            $wanOptions = ['proto' => 'static'];
            $dns = [];

            foreach ($wanSettings as $setting) {
                if (in_array($setting->name, ['dns_1', 'dns_2']) && !empty($setting->value)) {
                    $dns[] = $setting->value;
                } elseif (!in_array($setting->name, ['dns_1', 'dns_2']) && !empty($setting->value)) {
                    $wanOptions[$setting->name] = $setting->value;
                }
            }

            if (!empty($dns)) {
                $wanOptions['dns'] = implode(' ', $dns);
            }
        }
            
        //--PPPoE on WAN--
        $wanPppoeSettings = $this->ApConnectionSettings
            ->find()
            ->where([
                'ap_id'     => $ap_id,
                'grouping'  => 'wan_pppoe_setting',
            ])
            ->all();

        if (!$wanPppoeSettings->isEmpty()) {
            $wanOptions = ['proto' => 'pppoe'];
            $dns = [];

            foreach ($wanPppoeSettings as $setting) {
                if (in_array($setting->name, ['dns_1', 'dns_2']) && !empty($setting->value)) {
                    $dns[] = $setting->value;
                } elseif (!in_array($setting->name, ['dns_1', 'dns_2']) && !empty($setting->value)) {
                    $wanOptions[$setting->name] = $setting->value;
                }
            }

            if (!empty($dns)) {
                $wanOptions['dns'] = implode(' ', $dns);
            }
        }
    
        return $wanOptions;
    
    }
      
    private function _wanFor($hardware){
		$return_val = 'eth0'; //some default	
		$q_e = $this->{'Hardwares'}->find()->where(['Hardwares.fw_id' => $hardware, 'Hardwares.for_ap' => true])->first();
		if($q_e){
		    $return_val = $q_e->wan;   
		}
		
		//--26Jan24 Tweak for VLAN hack--
		if($return_val == 'eth0 eth1'){
		    $return_val     = 'lan';
		    $this->vlanHack = true;
		}
			
		return $return_val;
	}
	
	private function _getWwanOptions($ap_id){
	
	    $wwanOptions = false;
	
	    $qmiSettings = $this->{'ApConnectionSettings'}->find()->where([
            'ApConnectionSettings.ap_id'    => $ap_id,
            'ApConnectionSettings.grouping' => 'qmi_setting',
        ])->all();
        
        if (!$qmiSettings->isEmpty()) {
            $this->QmiActive           = true;
            $wwanOptions               = [];
            $wwanOptions['proto']      = 'qmi';
            $wwanOptions['device']     = '/dev/cdc-wdm0';
            $wwanOptions['disabled']   = '0';
            $wwanOptions['ifname']     = 'wwan';
            foreach($qmiSettings as $acp){              
                if($acp->value !== ''){     
                    $wwanOptions[$acp->name] = $acp->value;
                }        
            }                  
        }
	
	    return $wwanOptions;
	}
	
	private function _buildMwanConfig($mwanInterfaces){
		
	    $config = [];	    
	    array_push($config, [
	        'globals'   => 'globals',
	        'options'   => [
	             'mmx_mask' => '0x3F00'       
	        ]	    
	    ]);
	    
	    $policy_members = [];
	    $policy_name    = 'rd_load_balance';
	    
	    foreach($mwanInterfaces as $mwanInterface){
            $if_id  = $mwanInterface->id;
                
            //Interfaces
            array_push($config, [
                'interface'   => "mw$if_id",
                'options'   => [
                    'enabled'       => 1,
                    'family'        => 'ipv4',
                    'reliability'   => '2'      
                ],
                'lists'     => [
                    'track_ip' => [
                        '1.0.0.1',
                        '1.1.1.1',
                        '208.67.222.222',
                         '208.67.220.220'
                    ]
                ]	    
            ]);

            if($mwanInterface->policy_active){
                $policy_metric = 1;
                if($mwanInterface->policy_role == 'standby'){
                    $policy_metric = 2;
                    $policy_name = 'rd_fail_over';
                       
                }
                $member_name = "mw$if_id"."_m".$policy_metric."_w".$mwanInterface->policy_ratio;
                array_push($config, [
                    'member' => $member_name,
                    'options'   => [
                        'metric'    => $policy_metric,
                        'weight'    => $mwanInterface->policy_ratio,
                        'interface' => "mw$if_id"
                    ]
                ]);
                $policy_members[] = $member_name;            	            
            }	            	             
        }
        if(count($policy_members) > 0){
            array_push($config, [
                'policy'=> $policy_name,
                'lists' => [
                    'use_member'    => $policy_members                
                ]            
            ]);
            
            //--Standard Rules
            array_push($config, [
                'rule'=> 'https',
                'options'   => [
                    'sticky'    => '1',
                    'dest_port' => 433,
                    'proto'     => 'tcp',
                    'use_policy'=> $policy_name
                ]         
            ]);
            
            array_push($config, [
                'rule'=> 'default_rule_v4',
                'options'   => [
                    'dest_ip'   => '0.0.0.0/0',
                    'family'    => 'ipv4',
                    'use_policy'=> $policy_name
                ]         
            ]);
                 
        }      
	    $this->MwanSettings['mwan3'] = $config;
	    
	}
}
