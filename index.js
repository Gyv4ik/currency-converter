(function($, undefined){

	var model = {
		ccyData: null,
		state: {
			have: {
				selected: null
			},
			want: {
				selected: null,
				hidden: null
			},
			amount: null,
			result: null
		}
	}
	var CCY_LEN = 3;
	var have = $('#have');
	var want = $('#want');


	initCurrencies();


	$("#have").on('change', null, haveChangeHandler);
	$("#want").on('change', null, wantChangeHandler);
	$("#exchange").on('click', null, function(event) {

		if (!validateForm()) return;
		$('.help-block').hide();
		$("#result").prop('disabled', false);
		model.state.amount = +($('#amount').val());
		$('#result').val(calcResult());
		return false;
	});

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
		render();
		$('#exchange').prop('disabled', false);
	}

	function render() {

		var baseCcy = model.ccyData[0].base_ccy;
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
		var haveVal = $(this).val();
		var selectedCcy = $(have).find('option[value="' + haveVal + '"]');
		var elToHide = $(want).find('option[value="' + haveVal + '"]');
		var selectedItem = model.state.have.selected;
		var hiddenEl = model.state.want.hidden;

		model.state.have.selected = selectedCcy;
		if (haveVal == $(want).val()) {
			$(want).val($(selectedItem).next().val() || $(selectedItem).prev().val());
		}
		if (hiddenEl) hiddenEl.show();
		model.state.want.hidden = elToHide;
		model.state.want.hidden.css('display', 'none');
	}

	function wantChangeHandler() {
		var val = $(this).val();
		var selectedCcy = $(want).find('option[value="' + val + '"]');

		model.state.want.selected = selectedCcy;
	}

	function calcResult() {
		var have = model.state.have.selected;
		var want = model.state.want.selected;
		var baseCcy = model.ccyData[0].base_ccy;

		if ($(have).val() == baseCcy) {
			return model.state.result = convertFromHryvna();
		}

		else if ($(want).val() == baseCcy) {
			return model.state.result = convertToHryvna();
		}

		else {
			return model.state.result = (convertToHryvna() / _.find(model.ccyData, {'ccy': $(want).val()}).sale).toFixed(2);
		}
	}

	function convertToHryvna() {
		var have = model.state.have.selected;
		var ccyInHave = _.find(model.ccyData, {'ccy': $(have).val()});
		return result = (model.state.amount * parseFloat(ccyInHave.buy)).toFixed(2);
	}

	function convertFromHryvna() {
		var want = model.state.want.selected;
		var ccyInWant = _.find(model.ccyData, {'ccy': $(want).val()});
		return result = (model.state.amount / parseFloat(ccyInWant.sale)).toFixed(2);
	}

	function validateForm() {
		var amount = $('#amount');
		if ($(have).val().length !== CCY_LEN) {
			$(have).next().show();
		}
		if ($(want).val().length !== CCY_LEN) {
			$(want).next().show();
			return;
		}
		if (+($(amount).val()) < 0) {
			$(amount).next().show();
			return;
		}
		return true;
	}

})(jQuery);
