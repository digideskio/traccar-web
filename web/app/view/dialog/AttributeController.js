/*
 * Copyright 2016 - 2017 Anton Tananaev (anton@traccar.org)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

Ext.define('Traccar.view.dialog.AttributeController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.attribute',

    onSaveClick: function (button) {
        var dialog, store, record;
        dialog = button.up('window').down('form');
        dialog.updateRecord();
        record = dialog.getRecord();
        store = record.store;
        if (store) {
            if (record.phantom) {
                store.add(record);
            }
            store.sync({
                failure: function (batch) {
                    store.rejectChanges();
                    Traccar.app.showError(batch.exceptions[0].getError().response);
                }
            });
        } else {
            record.save();
        }
        button.up('window').close();
    },

    onValidityChange: function (form, valid) {
        this.lookupReference('saveButton').setDisabled(!valid);
    },

    defaultFieldConfig: {
        name: 'value',
        reference: 'valueField',
        allowBlank: false,
        fieldLabel: Strings.stateValue
    },

    onNameChange: function (combobox, newValue) {
        var type, config, attribute, valueField = this.lookupReference('valueField');
        attribute = combobox.getStore().getById(newValue);
        if (attribute) {
            type = attribute.get('type');
            config = Ext.clone(this.defaultFieldConfig);
            if (type === 'number') {
                config.xtype = 'customNumberField';
                if (attribute.get('allowDecimals') !== undefined) {
                    config.allowDecimals = attribute.get('allowDecimals');
                } else {
                    config.allowDecimals = true;
                }
                config.convert = attribute.get('convert');
                config.maxValue = attribute.get('maxValue');
                config.minValue = attribute.get('minValue');
            } else if (type === 'boolean') {
                config.xtype = 'checkboxfield';
                config.inputValue = true;
                config.uncheckedValue = false;
            } else if (type === 'color') {
                config.xtype = 'customcolorpicker';
            } else {
                config.xtype = 'textfield';
            }
            if (valueField.getXType() !== config.xtype || valueField.convert !== config.convert) {
                this.getView().down('form').insert(this.getView().down('form').items.indexOf(valueField), config);
                this.getView().down('form').remove(valueField);
            } else if (config.xtype === 'numberfield') {
                valueField.setConfig(config);
            }
        }
    }
});
