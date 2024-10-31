Ext.define('Rd.view.multiWanProfiles.pnlMwanPolicyInterface', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlMwanPolicyInterface',
    margin      : 5,
    width       : 500,
    border      : true,
    layout      : 'anchor',
    defaults    : {
        anchor  : '100%'
    },
    requires: [
        'Rd.view.multiWanProfiles.vcMwanPolicyInterface'
    ],
    controller  : 'vcMwanPolicyInterface',
    initComponent: function() {
        var me 		= this;
        var if_nr   = me.if_nr;
        
        var type_glyph = '<i class="fa fa-sitemap"></i> '; 
        
        if (me.type == 'lte'){
            var type_glyph = '<i class="fa fa-signal"></i> '; 
        }
        
        if (me.type == 'wifi'){
            var type_glyph = '<i class="fa fa-wifi"></i> '; 
        }
        
        var btnActivePressed  = true;
        var btnStandbyPressed = false;
        if(me.policy_role == 'standby'){
            btnActivePressed  = false;
            btnStandbyPressed = true;
        }
        
        var flagDisable = true;      
        if(me.policy_active){
            flagDisable = false;
        }
             
        me.items  = [
            {
                xtype       : 'checkbox',
                itemId      : 'chkEnable',     
                boxLabel  	: type_glyph+me.name,
                boxLabelCls	: 'boxLabelRd',
                name        : 'if_'+if_nr+'_policy_active',
                value       : me.policy_active,
                listeners   : {
		            change  : 'onChkInterfaceChange'
		        }
            },
             {
                xtype       : 'numberfield',
                name        : 'if_'+if_nr+'_policy_ratio',
                fieldLabel  : 'Ratio',
                allowBlank  : true,
                maxValue    : 10,
                minValue    : 1,
                value       : me.policy_ratio,
                labelClsExtra : 'lblRd',
                hideTrigger : true,
                keyNavEnabled  : false,
                mouseWheelEnabled	: false,
                itemId      : 'nrRatio',
                disabled    : flagDisable
                
            },            
            {
                xtype       : 'textfield',
                name        : 'type',
                itemId	    : 'txtRole',
                hidden      : true,
                name	    : 'if_'+if_nr+'_policy_role',
                value       : me.policy_role
            }, 
            {
                xtype       : 'radiogroup',
                itemId      : 'rgrpRole',
                fieldLabel  : 'Role',
                labelClsExtra: 'lblRd',
                disabled    : flagDisable,
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
			        toggleGroup     : 'if_'+if_nr+'role',
			        allowDepress    : false,					
		        },             
                items: [
			        { text: 'Active',   itemId: 'btnActive',  glyph: Rd.config.icnPlayO,    flex:1, ui : 'default-toolbar', 'margin' : '0 5 0 0', pressed: btnActivePressed },
			        { text: 'Standby',  itemId: 'btnStandby', glyph: Rd.config.icnPauseO,   flex:1, ui : 'default-toolbar', 'margin' : '0 0 0 5', pressed: btnStandbyPressed },
		        ]
            }
                    
        ]; 
                      
        me.callParent(arguments);
    }
});
