(function($, undefined){

	var model = {
		ccyData: null,
		baseCcy: null,
		state: {
			have: {
				value: null
			},
			want: {
				value: null,
				hidden: null
			},
			amount: null,
			result: null
		}
	}
	var CCY_LEN = 3;
	var have = $('#have');
	var want = $('#want');
	var amount = $('#amount');
	var exchange = $("#exchange");
	var result = $('#result');


	initCurrencies();


	have.on('change', null, haveChangeHandler);
	want.on('change', null, wantChangeHandler);
	amount.on('change', null, amountChangeHandler);
	exchange.on('click', null, exchangeHandler);

	function initCurrencies() {
		var xhr = $.ajax({
			method: 'GET',
			data: {
				coursid: 5
			},
			url: "https://api.privatbank.ua/p24api/pubinfo?json&exchange"
		});
		xhr.success(handleInit);
	}

	function handleInit(data) {
		model.ccyData = data;
		model.baseCcy = model.ccyData[0].base_ccy;
		render();
		exchange.prop('disabled', false);
	}

	function render() {

		var baseCcy = model.baseCcy;
		var fragment = $(document.createDocumentFragment());
		var defaultOption = '<option>Select currency</option>';
		var baseCcyOption = '<option value="' + baseCcy + '" >' + baseCcy + '</option>';

		fragment.append(defaultOption, baseCcyOption);
		$(model.ccyData).each(function(i, el) {
			if(el.ccy == 'BTC') return;
			fragment.append('<option value="' + el.ccy + '" >' + el.ccy + '</option>');
		});

		$(want).append(fragment.clone());
		$(have).append(fragment);
	}

	function haveChangeHandler() {
		var val = $(this).val();
		var haveVal;
		var elToHide;
		var hiddenEl;


		if (val.length > CCY_LEN) {
			model.state.have.value = null;
			return;
		}
		model.state.have.value = val;
		haveVal = model.state.have.value;
		wantVal = model.state.want.value;
		elToHide = $(want).find('option[value="' + haveVal + '"]');
		hiddenEl = model.state.want.hidden;

		if (haveVal == wantVal && elToHide.next().val()) {
			$(want).val(elToHide.next().val());
			model.state.want.value = $(want).val();
		}
		else if(haveVal == wantVal && elToHide.prev().val()) {
			$(want).val(elToHide.prev().val());
			model.state.want.value = $(want).val();
		}
		if (hiddenEl) hiddenEl.show();
		model.state.want.hidden = elToHide;
		model.state.want.hidden.hide();
	}

	function wantChangeHandler() {
		var val = $(this).val();
		if (val.length > CCY_LEN) {
			model.state.want.value = null;
			return;
		}
		console.log(val);
		model.state.want.value = val;
	}

	function amountChangeHandler() {
		model.state.amount = parseFloat($(this).val());
	}

	function exchangeHandler() {
		if (!validateForm()) return;
		$(result).val(calcResult());
	}

	function calcResult() {
		var haveVal = model.state.have.value;
		var wantVal = model.state.want.value;
		var baseCcy = model.baseCcy;

		if (haveVal == baseCcy) {
			return model.state.result = convertFromHryvna();
		}

		else if (wantVal == baseCcy) {
			return model.state.result = convertToHryvna();
		}

		else {
			console.log(_.find(model.ccyData, {'ccy': wantVal}));
			return model.state.result = (convertToHryvna() / _.find(model.ccyData, {'ccy': wantVal}).sale).toFixed(2);
		}
	}

	function convertToHryvna() {
		var haveVal = model.state.have.value;
		var have = _.find(model.ccyData, {'ccy': haveVal});
		return (model.state.amount * parseFloat(have.buy)).toFixed(2);
	}

	function convertFromHryvna() {
		var wantVal = model.state.want.value;
		var want = _.find(model.ccyData, {'ccy': wantVal});
		return (model.state.amount / parseFloat(want.sale)).toFixed(2);
	}

	function validateForm() {
		var haveVal = model.state.have.value;
		var wantVal = model.state.want.value;
		var amount = model.state.amount;
		var haveBlock = $('.form__have');
		var wantBlock = $('.form__want');
		var amountBlock = $('.form__amount');
		var flag = false;

		if (!haveVal) {
			flag = true;
			showError(haveBlock);
		}
		else hideError(haveBlock);

		if (!wantVal) {
			flag = true;
			showError(wantBlock);
		}
		else hideError(wantBlock);

		if (amount < 1) {
			flag = true;
			showError(amountBlock);
		}
		else hideError(amountBlock);

		if (!flag) {
			flag = false;
			return true;
		}
	}

	function showError(block) {
		var errorClass = 'has-error';

		$(block).addClass(errorClass);
		$(block).find('.help-block').show();
		$(result).val('');
	}

	function hideError(block) {
		var errorClass = 'has-error';

		$(block).removeClass(errorClass);
		$(block).find('.help-block').hide();
	}

})(jQuery);
