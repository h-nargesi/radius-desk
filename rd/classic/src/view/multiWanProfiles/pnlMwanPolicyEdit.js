Ext.define('Rd.view.multiWanProfiles.pnlMwanPolicyEdit', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlMwanPolicyEdit',
    closable    : true,
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5,  
    multi_wan_profile_id : '',
    multi_wan_profile_name : '',
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq'
    },
    buttons : [
        {
            itemId  : 'save',
            text    : 'SAVE',
            scale   : 'large',
            formBind: true,
            glyph   : Rd.config.icnYes,
            margin  : Rd.config.buttonMargin,
            ui      : 'button-teal'
        }
    ],
    requires: [
        'Rd.view.multiWanProfiles.vcMwanPolicyEdit',
        'Rd.view.multiWanProfiles.pnlMwanPolicyInterface'
    ],
    controller  : 'vcMwanPolicyEdit',
    initComponent: function() {
        var me 		= this;
        
        me.setTitle('Edit Policy For '+me.multi_wan_profile_name);
        
        var w_prim  = 500;
        
        var pnlIntE  = {
            xtype       : 'panel',
            margin      : 5,
            width       : w_prim,
            border      : true,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },       
            items   : [
                {
                    xtype       : 'checkbox',      
                    boxLabel  	: '<i class="fa fa-sitemap"></i> WAN (MTN Fibre)',
                    boxLabelCls	: 'boxLabelRd',
                    name        : 'if_1_active',
                    listeners   : {
			           // change  : 'onChkApplySqmProfileChange'
			        }
                },
                {
                    xtype       : 'numberfield',
                    name        : 'if_1_ratio',
                    fieldLabel  : 'Ratio',
                    allowBlank  : true,
                    maxValue    : 10,
                    minValue    : 1,
                    value       : 1,
                    labelClsExtra : 'lblRd',
                    hideTrigger : true,
                    keyNavEnabled  : false,
                    mouseWheelEnabled	: false
                }, 
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Role',
                    labelClsExtra: 'lblRd',
                    layout      : {
				        type	: 'hbox',
				        align	: 'middle',
				        pack	: 'stretchmax',
				        padding	: 0,
				        margin	: 0
			        },
                    defaultType : 'button',
    				defaults    : {
				        enableToggle    : true,
				        toggleGroup     : 'role1',
				        allowDepress    : false,					
			        },             
                    items: [
				        { text: 'Active',   itemId: 'btnActive',  glyph: Rd.config.icnPlayO,    flex:1, ui : 'default-toolbar', 'margin' : '0 5 0 0', pressed: true },
				        { text: 'Standby',  itemId: 'btnStandby', glyph: Rd.config.icnPauseO,   flex:1, ui : 'default-toolbar', 'margin' : '0 5 0 0' },
			        ]
                }           
            ]     
        }
        
        var cntMode = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
            
                {
                    xtype       : 'textfield',
                    name        : 'type',
                    itemId	    : 'txtMode',
                    hidden      : true,
                    name	    : 'mode',
                    value       : me.policy_role
                },             
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Mode',
                    labelClsExtra: 'lblRd',
                    layout: {
				        type	: 'hbox',
				        align	: 'middle',
				        pack	: 'stretchmax',
				        padding	: 0,
				        margin	: 0
			        },
                    defaultType: 'button',
    				defaults: {
				        enableToggle    : true,
				        toggleGroup     : 'mode',
				        allowDepress    : false,					
			        },             
                    items: [
				        { text: 'Load Balance', itemId: 'btnLoadBalance',  glyph: Rd.config.icnScale,    flex:1, ui : 'default-toolbar', 'margin' : 5 },
				        { text: 'Fail-Over',    itemId: 'btnFailOver',     glyph: Rd.config.icnToggleOn, flex:1, ui : 'default-toolbar', 'margin' : 5 },
			        ]
                }                            
            ]
        }
        
        var cntInterfaces = {
            xtype       : 'container',
            itemId      : 'cntInterfaces',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            }
        }
        var cntLastResort = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items   : [
                {
                    xtype       : 'combobox',
                    fieldLabel  : 'Last Resort',
                    value       : 'unreachable',
                    name        : 'last_resort',
                    displayField: 'name', 
                    editable    : false, 
                    queryMode   : 'local', 
                    valueField  : 'id',
                    labelClsExtra: 'lblRd',
                    store: { 
                        fields: ['id', 'name'],                      
                        data: [ 
                            {id: 'unreachable', name: 'Unreachable (Reject)'}, 
                            {id: 'blackhole',   name: 'Blackhole (Drop)'},
                            {id: 'default',     name: 'Default (Main routing table)'}, 
                        ] 
                    }
                }          
            ]        
        } 
              
        me.items = [          
            {
                xtype       : 'panel',
                title       : 'POLICY EDITOR',
                glyph       : Rd.config.icnChain, 
                ui          : 'panel-blue',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : [
                    cntMode,
                    cntInterfaces,
                    cntLastResort                    
                ]				
            }
        ];      
               
        me.callParent(arguments);
    }
});
