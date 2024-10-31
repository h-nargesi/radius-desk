Ext.define('Rd.view.multiWanProfiles.vcMwanPolicyInterface', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMwanPolicyInterface',
    init    : function() {
    
    },
    control: {
        '#btnActive' : {
            click   : 'activeClicked'
        },
        '#btnStandby' : {
            click   : 'standbyClicked'
        } 
    },
    onChkInterfaceChange   : function(chk){
        var me  = this;
        if(chk.getValue()){
            me.getView().down('#nrRatio').enable();
            me.getView().down('#rgrpRole').enable();
        }else{
            me.getView().down('#nrRatio').disable();
            me.getView().down('#rgrpRole').disable();
        }           
    },
    activeClicked : function(){
        var me = this;
        me.getView().down('#txtRole').setValue('active');   
    },
    standbyClicked : function(){
        var me = this;
        me.getView().down('#txtRole').setValue('standby');
    }
});
