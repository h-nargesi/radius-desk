Ext.define('Rd.view.multiWanProfiles.pnlMultiWanProfiles', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlMultiWanProfiles',
    border  : false,
    frame   : false,
    layout: {
        type    : 'hbox',         
        align   : 'stretch'
    },
    store   : undefined,
  	requires    : [
        'Rd.view.components.ajaxToolbar',
        'Rd.view.multiWanProfiles.vcMultiWanProfiles',
        'Rd.view.multiWanProfiles.winMultiWanProfileInterfaceAdd', 
        'Rd.view.multiWanProfiles.pnlMultiWanProfileInterfaceAddEdit',   
         'Rd.view.components.cmbMultiWanProfile'  
    ],
    viewConfig  : {
        loadMask:true
    },
    urlMenu     : '/cake4/rd_cake/multi-wan-profiles/menu-for-grid.json',
    controller  : 'vcMultiWanProfiles',
    initComponent: function(){
        var me = this;

        //Create the view for the wallpapers:
    
         var tpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="plain-wrap">',
                	'<tpl if="type==\'multi_wan_profile\'">',
                		'<div class="main">',
                			'<i class="fa fa-sitemap"></i>',
                				'<tpl if="for_system">',
                					'<i class="fa fa-umbrella"></i>',
                				'</tpl>',
                			' {name}',
                		'</div>',
                		'<tpl if="reminder_flag">', 
                    		'<div class="reminder-message">',
                                '<span class="icon">&#9432;</span>',
                                '<span>{reminder_message}</span>',
                            '</div>',
                        '</tpl>',
                	'</tpl>',
                	
                	'<tpl if="type==\'mwan_interface\'">',
                		'<div class="sub">',
                			'<tpl if="con_type==\'ethernet\'">',
                				'<div style="font-size:25px;color:#9999c7;text-align:left;padding-left:20px;padding-top:10px;"><i class="fa fa-sitemap"></i> {name} ',
                			'</tpl>',
                			'<tpl if="con_type==\'lte\'">',
                				'<div style="font-size:25px;color:#9999c7;text-align:left;padding-left:20px;padding-top:10px;"><i class="fa fa-signal"></i> {name} ',
                			'</tpl>',
                			'<tpl if="con_type==\'wifi\'">',
                				'<div style="font-size:25px;color:#9999c7;text-align:left;padding-left:20px;padding-top:10px;"><i class="fa fa-wifi"></i> {name} ',
                			'</tpl>',               			
				            '</div>',
				            
				            '<tpl if="apply_sqm_profile">',
				                '<div style="padding-top:5px;"></div>',
				    	        '<div style="font-size:16px;color:blue;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
		            				'<span style="font-family:FontAwesome;">&#xf00a</span>',
		            				'  {sqm_profile.name}',
		            			'</div>',				                			              
			                '</tpl>',
			                
				    	    '<tpl if="policy_active">',					    	    
				    	        '<div style="padding-top:5px;"></div>',
				    	        '<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
		            				'<span style="font-family:FontAwesome;">&#xf1de</span>',
		            				'  {percent_ratio}% Ratio',
		            			'</div>',
				            			
				    	    			    	    
				    	        '<tpl if="policy_mode==\'load_balance\'">',
			                        '<div style="padding-top:5px;"></div>',
			            			'<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
			            				'<span style="font-family:FontAwesome;">&#xf24e</span>',
			            				'  LOAD BALANCE',
			            			'</div>',
				            	'</tpl>',				    	    
				    	        '<tpl if="policy_mode==\'fail_over\'">',
				    	            '<div style="padding-top:5px;"></div>',
			            			'<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
			            				'<span style="font-family:FontAwesome;">&#xf205</span>',
			            				'  FAIL-OVER ',
			            				'<tpl if="policy_role==\'active\'">',
			            				    '(<span style="font-family:FontAwesome;">&#xf01d</span> Active)',
			            			    '<tpl else>',
			            			        '(<span style="font-family:FontAwesome;">&#xf28c</span> Standby)',
			            		        '</tpl>', 
			            			'</div>',				    	        
				    	        '</tpl>',
				    	        				    	        				    	    
				    	    '</tpl>',				    	    			    	    			                				                		        					        	
				        '</div>',
                	'</tpl>',               	
                	
                	'<tpl if="type==\'add\'">',
                		'<div style="margin-bottom:40px;padding:5px;cursor:move;font-size:18px;color:green;text-align:right;">',
                			'<span style="padding:5px;border:1px solid #76cf15;" onMouseOver="this.style.background=\'#76cf15\'" onMouseOut="this.style.background=\'#FFF\'"><i class="fa fa-plus"></i> NEW WAN INTERFACE</span>',
                		'</div>', 
                	'</tpl>',
                '</div>',
            '</tpl>'
        );
                   
        me.store = Ext.create('Ext.data.Store',{
            model: 'Rd.model.mDynamicPhoto',
            proxy: {
                type        :'ajax',
                url         : '/cake4/rd_cake/multi-wan-profiles/index-data-view.json',
                batchActions: true,
                format      : 'json',
                reader      : {
                    type        : 'json',
                    rootProperty: 'items'
                }
            },
            listeners: {
                load: function(store, records, successful) {
                    if(!successful){
                        Ext.ux.Toaster.msg(
                            'Error encountered',
                            store.getProxy().getReader().rawData.message.message,
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                    } 
                },
                scope: this
            }
        });

        var v = Ext.create('Ext.view.View', {
            store       : me.store,
            multiSelect : true,
          //  cls         : 'custom-dataview', // Apply the custom CSS class here
            tpl         : tpl,
            itemSelector: 'div.plain-wrap',
            itemId		: 'dvMultiWanProfiles',
            emptyText   : 'No Multi-WAN Profiles Defined Yet'
        });
    
        me.items =  {
            xtype       : 'panel',
            frame       : false,
            height      : '100%', 
            width       :  600,
            itemId      : 'pnlForMultiWanProfileView',
            layout: {
               type: 'vbox',
               align: 'stretch'
            },
            items       : v,
            autoScroll  : true,
            tbar        : Ext.create('Rd.view.components.ajaxToolbar',{
                url         : me.urlMenu
            })
        };         
        me.callParent(arguments);
    }
});
