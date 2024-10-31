Ext.define('Rd.view.multiWanProfiles.vcMultiWanProfiles', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMultiWanProfiles',
    init    : function() {
    	var me = this;   
    	var dd = Rd.getApplication().getDashboardData();
    	//Set root to use later in the app in order to set 'for_system' (root)
        me.root    = false;
        if(dd.isRootUser){
            me.root = true;   
        }  
    },
    config: {
        urlAdd          : '/cake4/rd_cake/multi-wan-profiles/add.json',
        urlDelete       : '/cake4/rd_cake/multi-wan-profiles/delete.json',
		urlEdit         : '/cake4/rd_cake/multi-wan-profiles/edit.json',
		UrlDeleteInter  : '/cake4/rd_cake/multi-wan-profiles/interface-delete.json'
    },
    control: {
    	'pnlMultiWanProfiles #reload': {
            click   : 'reload'
        },
        'pnlMultiWanProfiles #add': {
             click: 'add'
        },
        'pnlMultiWanProfiles #delete': {
            click   : 'del'
        },
        'pnlMultiWanProfiles #edit': {
            click: 'edit'
        },
        'pnlMultiWanProfiles #mwan_policies': {
            click: 'policy'
        },
        'pnlMultiWanProfiles cmbMultiWanProfile': {
           change   : 'cmbMultiWanProfileChange'
        },
        'pnlMultiWanProfiles #dvMultiWanProfiles' : {
        	itemclick	: 'itemSelected'
        }, 
        'winMultiWanProfileAdd #btnAddSave' : {
            click   : 'btnAddSave'
        },
        'winMultiWanProfileEdit #btnSave' : {
            click   : 'btnEditSave'
        }       
    },
    itemSelected: function(dv,record){
    	var me = this;
    	//--Add Multi-WAN Profile Component--
    	if(record.get('type') == 'add'){
    		if(!me.rightsCheck(record)){
	    		return;
	    	}
	    	var tp      = me.getView().up('tabpanel');
	    	var id		= 'tabInterfaceAddEdit'+ 0;
	    	
	    	var newTab  = tp.items.findBy(
            function (tab){
                return tab.getItemId() === id;
            });
         
            if (!newTab){
                newTab = tp.add({
                    itemId                  : id,
                    interface_id            : 0,
                    xtype                   : 'pnlMultiWanProfileInterfaceAddEdit',
                    multi_wan_profile_id    : record.get('multi_wan_profile_id'),
                    multi_wan_profile_name  : record.get('name'),
                    store                   : me.getView().down('#dvMultiWanProfiles').getStore()
                     
                });
            }    
            tp.setActiveTab(newTab);
    	} 	
    },
    reload: function(){
        var me = this;
        me.getView().down('#dvMultiWanProfiles').getStore().reload();
    },
    add: function(button) {	
        var me      = this;
        var c_name 	= Rd.getApplication().getCloudName();
        var c_id	= Rd.getApplication().getCloudId();    
        if(!Ext.WindowManager.get('winMultiWanProfileAddId')){
            var w = Ext.widget('winMultiWanProfileAdd',{id:'winMultiWanProfileAddId',cloudId: c_id, cloudName: c_name, root: me.root});
            this.getView().add(w);
            let appBody = Ext.getBody();
            w.showBy(appBody);        
        }
    },
    btnAddSave:  function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlAdd(),
            success: function(form, action) {
                win.close();
                me.reload();
                me.reloadComboBox();
                Ext.ux.Toaster.msg(
                    i18n('sNew_item_created'),
                    i18n('sItem_created_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
    del: function(button) {
        var me      = this;        
        if(me.getView().down('#dvMultiWanProfiles').getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
        	var sr   =  me.getView().down('#dvMultiWanProfiles').getSelectionModel().getLastSelected();
        	
        	if(!me.rightsCheck(sr)){
	    		return;
	    	}
        	
		    if(sr.get('type') == 'multi_wan_profile'){
		    	 me.delMwanProfile();
		    }
		    
		    if(sr.get('type') == 'mwan_interface'){
		        me.delMwanInterface();            
		    }            
        }      
    },           
    delMwanProfile:   function(){
        var me      = this;     
        Ext.MessageBox.confirm(i18n('sConfirm'), 'This will DELETE the Multi-WAN Profile and ALL its Interfaces' , function(val){
            if(val== 'yes'){
                var selected    = me.getView().down('#dvMultiWanProfiles').getSelectionModel().getSelection();
                var list        = [];
                Ext.Array.forEach(selected,function(item){
                    var id = item.get('multi_wan_profile_id');
                    Ext.Array.push(list,{'id' : id});
                });
                Ext.Ajax.request({
                    url: me.getUrlDelete(),
                    method: 'POST',          
                    jsonData: list,
                    success: function(batch,options){
                        Ext.ux.Toaster.msg(
                            i18n('sItem_deleted'),
                            i18n('sItem_deleted_fine'),
                            Ext.ux.Constants.clsInfo,
                            Ext.ux.Constants.msgInfo
                        );
                        me.reload(); //Reload from server
                        me.reloadComboBox();
                    },                                    
                    failure: function(batch,options){
                        Ext.ux.Toaster.msg(
                            i18n('sProblems_deleting_item'),
                            batch.proxy.getReader().rawData.message.message,
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                        me.reload(); //Reload from server
                    }
                });
            }
        });
    },
    edit: function(button) {
        var me      = this;
        //Find out if there was something selected
        if(me.getView().down('#dvMultiWanProfiles').getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
		    var sr   =  me.getView().down('#dvMultiWanProfiles').getSelectionModel().getLastSelected();
		    if(!me.rightsCheck(sr)){
	    		return;
	    	}
		    if(sr.get('type') == 'multi_wan_profile'){
				if(!Ext.WindowManager.get('winFirewallProfileEditId')){
				    if(!Ext.WindowManager.get('winMultiWanProfileEditId')){
                        var w = Ext.widget('winMultiWanProfileEdit',{id:'winMultiWanProfileEditId',record: sr,root: me.root});
                        me.getView().add(w); 
                        let appBody = Ext.getBody();
                        w.showBy(appBody);      
                    }      
		        }
		  	}
		  	
		    if(sr.get('type') == 'mwan_interface'){		   
		        me.editMwanInterface(sr);				
	      	}	  			  		  	  
        }     
    },
    policy: function(button) {
        var me      = this;
        //Find out if there was something selected
        if(me.getView().down('#dvMultiWanProfiles').getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
		    var sr   =  me.getView().down('#dvMultiWanProfiles').getSelectionModel().getLastSelected();
		    if(!me.rightsCheck(sr)){
	    		return;
	    	}

            var tp      = me.getView().up('tabpanel');
        	var id		= 'tabMwanPolicyEdit'+ sr.getId();        	
        	var newTab  = tp.items.findBy(
            function (tab){
                return tab.getItemId() === id;
            });
         
            if (!newTab){
                newTab = tp.add({
                    itemId                  : id,
                    multi_wan_profile_id    : sr.get('multi_wan_profile_id'),
                    multi_wan_profile_name  : sr.get('multi_wan_profile_name'),
                    xtype                   : 'pnlMwanPolicyEdit'            
                });
            }    
            tp.setActiveTab(newTab); 			  		  	  
        }     
    },
    
    
    btnEditSave:function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlEdit(),
            success             : function(form, action) {
                me.reload();
                win.close();
                Ext.ux.Toaster.msg(
                    i18n('sItems_modified'),
                    i18n('sItems_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    },
    editMwanInterface :  function(sr){
        var me      = this;
        var tp      = me.getView().up('tabpanel');
    	var id		= 'tabInterfaceAddEdit'+ sr.getId();
    	
    	var newTab  = tp.items.findBy(
        function (tab){
            return tab.getItemId() === id;
        });
     
        if (!newTab){
            newTab = tp.add({
                itemId                  : id,
                interface_id            : sr.getId(),
                interface_name          : sr.get('name'),
                multi_wan_profile_id    : sr.get('multi_wan_profile_id'),
                xtype                   : 'pnlMultiWanProfileInterfaceAddEdit',
                store                   : me.getView().down('#dvMultiWanProfiles').getStore()               
            });
        }    
        tp.setActiveTab(newTab);
    },
    delMwanInterface :   function(){
        var me      = this;     
        //Find out if there was something selected
        Ext.MessageBox.confirm(i18n('sConfirm'), 'This will DELETE the selected Multi-WAN Interface' , function(val){
            if(val== 'yes'){
                var selected    = me.getView().down('#dvMultiWanProfiles').getSelectionModel().getSelection();
                var list        = [];
                Ext.Array.forEach(selected,function(item){
                    var id = item.getId();
                    Ext.Array.push(list,{'id' : id});
                });
                Ext.Ajax.request({
                    url     : me.getUrlDeleteInter(),
                    method  : 'POST',          
                    jsonData: list,
                    success : function(batch,options){
                        Ext.ux.Toaster.msg(
                            i18n('sItem_deleted'),
                            i18n('sItem_deleted_fine'),
                            Ext.ux.Constants.clsInfo,
                            Ext.ux.Constants.msgInfo
                        );
                        me.reload(); //Reload from server
                    },                                    
                    failure: function(batch,options){
                        Ext.ux.Toaster.msg(
                            i18n('sProblems_deleting_item'),
                            batch.proxy.getReader().rawData.message.message,
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                        me.reload(); //Reload from server
                    }
                });
            }
        });
    },
    cmbMultiWanProfileChange: function(cmb,new_value){
    	var me = this;
    	me.getView().down('#dvMultiWanProfiles').getStore().getProxy().setExtraParams({id:new_value});
 		me.reload();
    },
    reloadComboBox: function(){  
    	var me = this;
    	me.getView().down('cmbMultiWanProfile').getStore().reload();
    },
    rightsCheck: function(record){
    	var me = this;
    	if(record.get('for_system') && (!me.root)){
			Ext.ux.Toaster.msg(
                'No Rights',
                'No Rights For This Action',
                Ext.ux.Constants.clsWarn,
                Ext.ux.Constants.msgWarn
        	);
			return false; //has no rights
		}
    	return true; //has rights    
    }   
    
});
