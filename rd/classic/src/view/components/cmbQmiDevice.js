Ext.define('Rd.view.components.cmbQmiDevice', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbQmiDevice',
    fieldLabel      : 'Device',
    labelSeparator  : '',
    forceSelection  : true,
    queryMode       : 'local',
    displayField    : 'text',
    valueField      : 'id',
    typeAhead       : true,
    allowBlank      : false,
    mode            : 'local',
    name            : 'qmi_device',
    labelClsExtra   : 'lblRd',
    value           : '/dev/cdc-wdm0',
    initComponent   : function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {'id':'/dev/cdc-wdm0',   'text': '/dev/cdc-wdm0'},
                {'id':'/dev/cdc-wdm1',   'text': '/dev/cdc-wdm1'},
                {'id':'/dev/cdc-wdm2',   'text': '/dev/cdc-wdm2'},
                {'id':'/dev/cdc-wdm3',   'text': '/dev/cdc-wdm3'},
                {'id':'/dev/cdc-wdm4',   'text': '/dev/cdc-wdm4'},
                {'id':'/dev/cdc-wdm5',   'text': '/dev/cdc-wdm5'}
            ]
        });
        me.store = s;
        this.callParent(arguments);
    }
});
