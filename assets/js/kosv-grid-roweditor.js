/**
 * @link https://github.com/Konstantin-Vl/yii2-grid-rowEditable
 * @copyright Copyright (c) 2018 Konstantin Voloshchuk
 * @license https://github.com/Konstantin-Vl/yii2-grid-rowEditable/blob/master/LICENSE
 * @author Konstantin Voloshchuk <kosv.dev@gmail.com>
 * @since 1.0
 */
if (typeof kosv == 'undefined' || !kosv) {
    var kosv = {};
}

(function ($) {
    kosv.GridRowEditor = function (gridSelector, params) {
        this.SELECT_MODE_CHECKBOX = 0x1;
        this.SELECT_MODE_CLICK = 0x2;

        var defaultParams = {
            inputWrapHtmlClass: 'input-wrap',
            prefix: 'gre',
            saveAction: location.pathname,
            saveAjax: false,
            saveButton: '.' + this.p('save-btn'),
            massiveChangeControl: '.' + this.p('massive-change-control'),
            saveMethod: 'POST',
            selectMode: this.SELECT_MODE_CHECKBOX,
            selectParams: {},
        };

        this.$grid = $(gridSelector).eq(0);
        $.extend(this, $.extend(defaultParams, params));

        this._initEvents();
    };
    var proto = kosv.GridRowEditor.prototype;



    proto.dataAttr = function (name) {
        return 'data-' + this.p('-' + name);
    };
    proto.p = function (str) {
        return this.prefix + str;
    };



    proto.getSelectedRows = function () {
        var selector = 'tr[' + this.dataAttr('selected') + '="true"]';
        return this.$grid.find(selector)
    };

    proto.invertSelectedRow = function ($row) {
        this.selectRow($row, !this.isSelectedRow($row));
    };

    proto.isSelectedRow = function ($row) {
        return $row.attr(this.dataAttr('selected')) === 'true';
    };

    proto.selectRow = function ($row, state) {
        state = state ? 'true' : 'false';
        $row.attr(this.dataAttr('selected'), state);
    };



    proto.getSelectedInputs = function (toFind = ':input') {
        var selector = '.' + this.inputWrapHtmlClass + ' ' + toFind;
        return this.getSelectedRows().find(selector);
    };


    proto.submitAjaxSaveForm = function () {
        var ajaxParams = {
            method: this.saveMethod,
            url: this.saveAction,
        };

        var inputs = this.getSelectedInputs().clone();
        var form =  $('<form />').append(inputs);
        if (typeof yii.getCsrfParam() != 'undefined') {
            form.append($('<input />').attr({
                type: 'hidden',
                name: yii.getCsrfParam(),
                value: yii.getCsrfToken()
            }));
        }

        if (typeof window.FormData != 'undefined') {
            ajaxParams.contentType = false;
            ajaxParams.data = new FormData(form[0]);
            ajaxParams.processData = false;
        } else {
            ajaxParams.data = form.serialize();
        }

        $.ajax(ajaxParams);
    };

    proto.submitSaveForm = function () {
        var inputs = this.getSelectedInputs().clone();

        var form =  $('<form />').attr({
            action: this.saveAction,
            method: this.saveMethod
        }).append(inputs);

        if (typeof yii.getCsrfParam() != 'undefined') {
            form.append($('<input />').attr({
                type: 'hidden',
                name: yii.getCsrfParam(),
                value: yii.getCsrfToken()
            }));
        }

        form.append($('<input />').attr({
            type: 'submit',
            value: 'true'
        }));

        // see: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-algorithm
        $(document.body).append(form.hide());

        form.submit();
    };


    proto.displayChangeControl = function () {
        if (this.getSelectedInputs().length) {
            $(this.saveButton + ', ' + this.massiveChangeControl).show();
        } else {
            $(this.saveButton + ', ' + this.massiveChangeControl).hide();
        }
    };


    proto._initEvents = function () {
        this._initRowSelectorEvents();
        this._initSaveFormEvents();
    };

    proto._initRowSelectorEvents = function () {
        var self = this;
        var selectParams = self.selectParams[self.selectMode];

        self.$grid.on(self.p('rowSelected'), function (e, $row, state) {
            self.selectRow($row, state);
            self.displayChangeControl();
        });

        if (self.selectMode & self.SELECT_MODE_CHECKBOX) {
            $(selectParams.itemSelector).on('change', function () {
                var row = $(this).closest('tr');
                self.$grid
                    .trigger(self.p('rowSelected'), [row, !!this.checked]);
            });

            // to improve performance (everything works!!!)
            /*$(selectParams.allSelector).on('change', function () {
                $(this)
                    .closest('table')
                    .find(selectParams.itemSelector)
                    .change();
            });*/

            self.$grid
                .find(selectParams.itemSelector + ':checked')
                .change();

            self.$grid
                .find('.' + self.inputWrapHtmlClass + '[' + self.dataAttr('valid-error') + '="true"]')
                .closest('tr')
                .find(selectParams.itemSelector + ':not(:checked)')
                .attr('checked', true)
                .change();

        }
    };

    proto._initSaveFormEvents = function () {
        var self = this;

        self.$grid.on(self.p('submitSaveForm'), function () {
            if (self.saveAjax) {
                self.submitAjaxSaveForm();
            } else {
                self.submitSaveForm();
            }
        });

        if (self.saveButton) {
            $(self.saveButton).on('click', function () {
                self.$grid.trigger(self.p('submitSaveForm'));
            });
        }

        if (self.massiveChangeControl) {
            $(self.massiveChangeControl).on('change', function () {
                var toChangeControl = $(this).data('control');
                var new_value = $(this).val();
                self.getSelectedInputs(toChangeControl).val(new_value);
            });
        }
    };

})(jQuery);