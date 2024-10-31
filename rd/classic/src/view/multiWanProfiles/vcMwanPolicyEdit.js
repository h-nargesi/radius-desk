Ext.define('Rd.view.multiWanProfiles.vcMwanPolicyEdit', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMwanPolicyEdit',
    init    : function() {
    
    },
    config: {
        urlView : '/cake4/rd_cake/multi-wan-profiles/policy-view.json', 
        urlSave : '/cake4/rd_cake/multi-wan-profiles/policy-edit.json'   
    },
    control: {
        'pnlMwanPolicyEdit' : {
            activate : 'pnlActive'
        },
        '#btnLoadBalance' : {
            click   : 'loadBalanceClicked'
        },
        '#btnFailOver' : {
            click   : 'failOverClicked'
        },
        '#save': {
            click   : 'btnSave'
        },  
    },
    pnlActive   : function(form){
        var me  = this; 
        var id  = me.getView().multi_wan_profile_id;
        form.load({
            url         : me.getUrlView(), 
            method      : 'GET',
            params      : { id: id },
            success     : function(a,b,c){
                console.log("Remove items")
                me.getView().down('#cntInterfaces').removeAll();             
                Ext.Array.forEach(b.result.data.interfaces,function(interf){
                    me.getView().down('#cntInterfaces').add({
                        xtype   : 'pnlMwanPolicyInterface',
                        if_nr   : interf.id,
                        name    : interf.name,
                        type    : interf.type,
                        policy_active : interf.policy_active,
                        policy_ratio  : interf.policy_ratio,
                        policy_role   : interf.policy_role
                    });
                }); 
                       
                //--Mode buttons--           
                if(b.result.data.mode == 'load_balance'){
            		form.down('#btnLoadBalance').click();	
            	} 
            	if(b.result.data.mode == 'fail_over'){
            		form.down('#btnFailOver').click();	
            	}          	  	                       
            }
        });          
    },
    loadBalanceClicked : function(btn){
        var me = this;
        me.getView().down('#txtMode').setValue('load_balance'); 
        var items   = Ext.ComponentQuery.query('pnlMwanPolicyInterface',me.getView());
        Ext.Array.forEach(items, function(interf){
            interf.down('#rgrpRole').disable();
            interf.down('#rgrpRole').hide();
        });        
    },
    failOverClicked : function(btn){
        var me = this;
        me.getView().down('#txtMode').setValue('fail_over');
        var items   = Ext.ComponentQuery.query('pnlMwanPolicyInterface',me.getView());
        Ext.Array.forEach(items, function(interf){
            interf.down('#rgrpRole').show();
            if(interf.down('#chkEnable').getValue()){
                interf.down('#rgrpRole').enable();
            }else{
                interf.down('#rgrpRole').disable();
            }
        });
        
    },
    btnSave:function(button){
        var me          = this;
        var formPanel   = this.getView();
        //Checks passed fine...      
        formPanel.submit({
            clientValidation    : true,
            url                 : me.getUrlSave(),
            success             : function(form, action) {
                if (formPanel.closable) {
                    formPanel.close();
                }
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
});
