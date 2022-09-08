Ext.define('Rd.model.mHardware', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'name',         type: 'string'  },
         {name: 'vendor',       type: 'string'  },
         {name: 'model',        type: 'string'  },
         {name: 'fw_id',        type: 'string'  },
         {name: 'owner',        type: 'string'  },
		 {name: 'for_mesh',     type: 'bool'},
		 {name: 'for_ap',       type: 'bool'},
      
         {name: 'radio_count',  type: 'int'},
         
         {name: 'radio_0_disabled', type: 'bool', default : true},
         {name: 'radio_0_txpower', type: 'int'}, 
         {name: 'radio_0_include_beacon_int',  type: 'bool', default : 100},
         {name: 'radio_0_beacon_int',  type: 'int'},
         {name: 'radio_0_include_distance',  type: 'bool', default : 300},
         {name: 'radio_0_distance',  type: 'int'},
         {name: 'radio_0_ht_capab',  type: 'string'},
         {name: 'radio_0_mesh',  type: 'bool'},
         {name: 'radio_0_ap',  type: 'bool'},
         {name: 'radio_0_config',  type: 'bool'},
         {name: 'radio_0_band',  type: 'string'},
         {name: 'radio_0_mode',  type: 'string'},
         {name: 'radio_0_width', type: 'string'},
         
         {name: 'radio_1_disabled', type: 'bool', default : true},
         {name: 'radio_1_txpower', type: 'int'}, 
         {name: 'radio_1_include_beacon_int',  type: 'bool'},
         {name: 'radio_1_beacon_int',  type: 'int'},
         {name: 'radio_1_include_distance',  type: 'bool'},
         {name: 'radio_1_distance',  type: 'int'},
         {name: 'radio_1_ht_capab',  type: 'string'},
         {name: 'radio_1_mesh',  type: 'bool'},
         {name: 'radio_1_ap',  type: 'bool'},
         {name: 'radio_1_config',  type: 'bool'},
         {name: 'radio_1_band',  type: 'string'},
         {name: 'radio_1_mode',  type: 'string'},
         {name: 'radio_1_width', type: 'string'},
         
         {name: 'radio_2_disabled', type: 'bool', default : true},
         {name: 'radio_2_txpower', type: 'int'}, 
         {name: 'radio_2_include_beacon_int',  type: 'bool'},
         {name: 'radio_2_beacon_int',  type: 'int'},
         {name: 'radio_2_include_distance',  type: 'bool'},
         {name: 'radio_2_distance',  type: 'int'},
         {name: 'radio_2_ht_capab',  type: 'string'},
         {name: 'radio_2_mesh',  type: 'bool'},
         {name: 'radio_2_ap',  type: 'bool'},
         {name: 'radio_2_config',  type: 'bool'},
         {name: 'radio_2_band',  type: 'string'},
         {name: 'radio_2_mode',  type: 'string'},
         {name: 'radio_2_width', type: 'string'},
              
         {name: 'update',       type: 'bool'},
         {name: 'delete',       type: 'bool'},
         {name: 'created',           type: 'date' },
         {name: 'modified',          type: 'date' },
         {name: 'created_in_words',  type: 'string'  },
         {name: 'modified_in_words', type: 'string'  }
        ]
});