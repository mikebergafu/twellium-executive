/*
Author       : Dreamstechnologies
Template Name: CRMS - Bootstrap Admin Template
*/

(function () {
    "use strict";

	// Variables declarations
	const $wrapper = $('.main-wrapper');
	const $overlay = $('<div class="sidebar-overlay"></div>');
	$overlay.insertBefore('.main-wrapper');

	// Toggle Mobile Menu
	$(document).on('click', '#mobile_btn', function (e) {
		e.preventDefault();
		$wrapper.toggleClass('slide-nav');
		$overlay.toggleClass('opened');
		$('html').toggleClass('menu-opened');
	});

	// Close sidebar on close button click
	$(document).on('click', '.sidebar-close, .sidebar-overlay', function () {
		$wrapper.removeClass('slide-nav');
		$overlay.removeClass('opened');
		$('html').removeClass('menu-opened');
	});

	// Sidebar
	function initSidebarMenu() {
		const $menuLinks = $('.sidebar-menu a');

		$menuLinks.on('click', function (e) {
			const $link = $(this);
			const $submenu = $link.next('ul');

			if ($link.parent().hasClass('submenu')) {
				e.preventDefault();

				if (!$link.hasClass('subdrop')) {
					// Collapse all sibling submenus
					$link.closest('ul').find('ul').slideUp(250);
					$link.closest('ul').find('a').removeClass('subdrop');

					// Expand current
					$submenu.slideDown(350);
					$link.addClass('subdrop');
				} else {
					// Collapse current
					$link.removeClass('subdrop');
					$submenu.slideUp(350);
				}
			}
		});

		// Expand parent menus if active link is inside
		$('.sidebar-menu ul li.submenu a.active').parents('li.submenu').children('a').addClass('active subdrop').next('ul').show();
	}

	// Initialize Sidebar
	initSidebarMenu();

	// Mouse Over
	$(document).on('mouseover', function(e) {
        e.stopPropagation();
        if ($('body').hasClass('mini-sidebar') && $('#toggle_btn').is(':visible')) {
            var targ = $(e.target).closest('.sidebar, .header-left').length;
            if (targ) {
               	$('body').addClass('expand-menu');
                $('.subdrop + ul').slideDown();
            } else {
               	$('body').removeClass('expand-menu');
                $('.subdrop + ul').slideUp();
            }
            return false;
        }
    });

	// Star Filled
	$(document).ready(function() {
		setTimeout(function() {
			$(".rating-select").on('click', function() {
				$(this).toggleClass("filled");
			});
		}, 100);
	});

	// Editor
   	if($('.editor').length > 0) {
        document.querySelectorAll('.editor').forEach((editor) => {
            new Quill(editor, {
             	theme: 'snow'
            });
        });
    }

	// Multiple Image
	if ($('.multiple-img').length > 0) {
		function formatState(state) {
			if (!state.id) return state.text;
			const imageUrl = $(state.element).data('image');
			const $state = $(`
				<span>
					<img src="${imageUrl}" class="img-flag me-1" width="16" alt="flag">
					${state.text}
				</span>
			`);
			return $state;
		}
		$('.multiple-img').select2({
			minimumResultsForSearch: Infinity,
			templateResult: formatState,
			templateSelection: formatState
		});
	}

	// Collapes Header
	if($('#collapse-header').length > 0) {
		const collapseHeader = document.getElementById('collapse-header');
		if (collapseHeader) {
		collapseHeader.addEventListener('click', function () {
				this.classList.toggle('active');
				document.body.classList.toggle('header-collapse');
			});
		}
	}

	// Toggle Button
	$(document).on('click', '#toggle_btn, #toggle_btn2', function () {
		const $body = $('body');
		const $html = $('html');
		const isMini = $body.hasClass('mini-sidebar');
		const isFullWidth = $html.attr('data-layout') === 'full-width';
		const isHidden = $html.attr('data-layout') === 'hidden';
	
		if (isMini) {
			$body.removeClass('mini-sidebar');
			$(this).addClass('active');
			localStorage.setItem('screenModeNightTokenState', 'night');
			setTimeout(function () {
				$(".header-left").addClass("active");
			}, 100);
		} else {
			$body.addClass('mini-sidebar');
			$(this).removeClass('active');
			localStorage.removeItem('screenModeNightTokenState');
			setTimeout(function () {
				$(".header-left").removeClass("active");
			}, 100);
		}
	
		// data-layout="full-width", apply full-width class to <body>
		if (isFullWidth) {
			$body.addClass('full-width').removeClass('mini-sidebar');
			$('.sidebar-overlay').addClass('opened');
			$(document).on('click', '.sidebar-close', function () {
				$('body').removeClass('full-width');
			});
		} else {
			$body.removeClass('full-width');
		}

		// data-layout="hidden", apply hidden-layout class to <body>
		if (isHidden) {
			$body.toggleClass('hidden-layout');
			$body.removeClass('mini-sidebar');
			$(document).on('click', '.sidebar-close', function () {
				$('body').removeClass('full-width');
			});
		} 
	
		return false;
	});

	// Filter Close
	document.addEventListener('DOMContentLoaded', () => {
		document.querySelectorAll('.close-filter-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				const dropdown = btn.closest('.dropdown');
				if (!dropdown) return;
				const toggle = dropdown.querySelector('[data-bs-toggle="dropdown"]');
				if (!toggle) return;
				const dropdownInstance = bootstrap.Dropdown.getInstance(toggle) || new bootstrap.Dropdown(toggle);
				dropdownInstance.hide();
			});
		});
	});
	
	// Tooltip
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
	const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
	
	// Input Mask
	document.querySelectorAll('[data-toggle="input-mask"]').forEach(input => {
		const format = input.getAttribute('data-mask-format');
		const reverse = input.getAttribute('data-reverse') === 'true';		
		if (format && typeof Inputmask !== 'undefined') {
			Inputmask({ 
				mask: format.replace(/0/g, '9'), 
				reverse: reverse 
			}).mask(input);
		}
	});

	// Form Validation
	document.querySelectorAll('.needs-validation').forEach(form => {
		form.addEventListener('submit', event => {
			if (!form.checkValidity()) {
				event.preventDefault();
				event.stopPropagation();
			}
			form.classList.add('was-validated');
		}, false);
	});

	// Choices
	function initChoices() {
		document.querySelectorAll('[data-choices]').forEach(item => {
			const config = {
				allowHTML: true  
			};
			const attrs = item.attributes;	
			if (attrs['data-choices-groups']) {
				config.placeholderValue = 'This is a placeholder set in the config';
			}
			if (attrs['data-choices-search-false']) {
				config.searchEnabled = false;
			}
			if (attrs['data-choices-search-true']) {
				config.searchEnabled = true;
			}
			if (attrs['data-choices-removeItem']) {
				config.removeItemButton = true;
			}
			if (attrs['data-choices-sorting-false']) {
				config.shouldSort = false;
			}
			if (attrs['data-choices-sorting-true']) {
				config.shouldSort = true;
			}
			if (attrs['data-choices-multiple-remove']) {
				config.removeItemButton = true;
			}
			if (attrs['data-choices-limit']) {
				config.maxItemCount = parseInt(attrs['data-choices-limit'].value);
			}
			if (attrs['data-choices-editItem-true']) {
				config.editItems = true;
			}
			if (attrs['data-choices-editItem-false']) {
				config.editItems = false;
			}
			if (attrs['data-choices-text-unique-true']) {
				config.duplicateItemsAllowed = false;
			}
			if (attrs['data-choices-text-disabled-true']) {
				config.addItems = false;
			}	
			const instance = new Choices(item, config);	
			if (attrs['data-choices-text-disabled-true']) {
				instance.disable();
			}
		});
	}
		
	// Call it when the DOM is ready
	document.addEventListener('DOMContentLoaded', initChoices);
		
	// Initialize Flatpickr on elements with data-provider="flatpickr"
	document.querySelectorAll('[data-provider="flatpickr"]').forEach(el => {
		const config = {
			disableMobile: true
		};
		if (el.hasAttribute('data-date-format')) {
			config.dateFormat = el.getAttribute('data-date-format');
		}
		if (el.hasAttribute('data-enable-time')) {
			config.enableTime = true;
			config.dateFormat = config.dateFormat ? `${config.dateFormat} H:i` : 'Y-m-d H:i';
		}
		if (el.hasAttribute('data-altFormat')) {
			config.altInput = true;
			config.altFormat = el.getAttribute('data-altFormat');
		}
		if (el.hasAttribute('data-minDate')) {
			config.minDate = el.getAttribute('data-minDate');
		}
		if (el.hasAttribute('data-maxDate')) {
			config.maxDate = el.getAttribute('data-maxDate');
		}
		if (el.hasAttribute('data-default-date')) {
			config.defaultDate = el.getAttribute('data-default-date');
		}
		if (el.hasAttribute('data-multiple-date')) {
			config.mode = 'multiple';
		}
		if (el.hasAttribute('data-range-date')) {
			config.mode = 'range';
		}
		if (el.hasAttribute('data-inline-date')) {
			config.inline = true;
			config.defaultDate = el.getAttribute('data-inline-date');
		}
		if (el.hasAttribute('data-disable-date')) {
			config.disable = el.getAttribute('data-disable-date').split(',');
		}
		if (el.hasAttribute('data-week-number')) {
			config.weekNumbers = true;
		}
		flatpickr(el, config);
	});

	// Time Picker
	document.querySelectorAll('[data-provider="timepickr"]').forEach(item => {
		const attrs = item.attributes;
		const config = {
			enableTime: true,
			noCalendar: true,
			dateFormat: "H:i"
		};
		if (attrs["data-time-hrs"]) {
			config.time_24hr = true;
		}
		if (attrs["data-min-time"]) {
			config.minTime = attrs["data-min-time"].value;
		}
		if (attrs["data-max-time"]) {
			config.maxTime = attrs["data-max-time"].value;
		}
		if (attrs["data-default-time"]) {
			config.defaultDate = attrs["data-default-time"].value;
		}
		if (attrs["data-time-inline"]) {
			config.inline = true;
			config.defaultDate = attrs["data-time-inline"].value;
		}
		flatpickr(item, config);
	});
  
	// Select2
	if (jQuery().select2) {
		$('[data-toggle="select2"]').each(function () {
			const $el = $(this);
			const options = {};

			// Placeholder
			if ($el.attr('data-placeholder')) {
				options.placeholder = $el.attr('data-placeholder');
			}

			// Allow clear
			if ($el.attr('data-allow-clear') === 'true') {
				options.allowClear = true;
			}

			// Tags input (user can enter new values)
			if ($el.attr('data-tags') === 'true') {
				options.tags = true;
			}

			// Maximum selection
			if ($el.attr('data-max-selections')) {
				options.maximumSelectionLength = parseInt($el.attr('data-max-selections'));
			}

			// AJAX (for dynamic search)
			if ($el.attr('data-ajax--url')) {
				options.ajax = {
					url: $el.attr('data-ajax--url'),
					dataType: 'json',
					delay: 250,
					data: function (params) {
						return {
							q: params.term, // search term
							page: params.page || 1
						};
					},
					processResults: function (data, params) {
						params.page = params.page || 1;
						return {
							results: data.items || [],
							pagination: {
								more: data.more
							}
						};
					},
					cache: true
				};
			}

			// Init Select2 with options
			$el.select2(options);
		});
	}

	// Select 2    
    if ($('.select').length > 0) {
        $('.select').select2({
            minimumResultsForSearch: -1,
            width: '100%'
        });
    }

	// Popover
	const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
	const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))

	// Toasts
	document.addEventListener('DOMContentLoaded', function () {
		const toastPlacement = document.getElementById('toastPlacement');
		const placementSelect = document.getElementById('selectToastPlacement');
		if (toastPlacement && placementSelect) {
			const originalClass = toastPlacement.className;
			placementSelect.addEventListener('change', function () {
			toastPlacement.className = `${originalClass} ${this.value}`.trim();
			});
		}
	});

	// Datatable
	if($('.datatable').length > 0) {
		$('.datatable').DataTable({
			"bFilter": true,
			"sDom": 'fBtlpi',  
			"ordering": true,
			"language": {
				search: ' ',
				sLengthMenu: '_MENU_',
				searchPlaceholder: "Search",
				sLengthMenu: 'Row Per Page _MENU_ Entries',
				info: "_START_ - _END_ of _TOTAL_ items",
				paginate: {
					next: '<i class="ti ti-arrow-right"></i>',
					previous: '<i class="ti ti-arrow-left"></i> '
				},
			},
			"responsive": true,
			"autoWidth": false,
			initComplete: (settings, json)=>{
				$('.dataTables_filter').appendTo('#tableSearch');
				$('.dataTables_filter').appendTo('.search-input');
			},	
		});
	}		

	// Filter
	document.addEventListener("DOMContentLoaded", () => {
		const closeBtn = document.getElementById("close-filter");
		const filterDropdown = document.getElementById("filter-dropdown");
		if (closeBtn && filterDropdown) {
			closeBtn.addEventListener("click", () => {
			filterDropdown.classList.remove("show");
			});
		}
	});
  
	// Toggle Password
	if ($('.toggle-password').length > 0) {
		$(document).on('click', '.toggle-password', function () {
			const $icon = $(this).find('i');
			const $input = $(this).closest('.input-group').find('.pass-input');		
			if ($input.attr('type') === 'password') {
				$input.attr('type', 'text');
				$icon.removeClass('ti-eye-off').addClass('ti-eye');
			} else {
				$input.attr('type', 'password');
				$icon.removeClass('ti-eye').addClass('ti-eye-off');
			}
		});
	}

	// Date Range Picker
	if ($('#reportrange').length > 0) {
		const start = moment().subtract(29, "days");
		const end = moment();
		const report_range = (start, end) => {
			$("#reportrange span").html(`${start.format("D MMM YY")} - ${end.format("D MMM YY")}`);
		};
		$("#reportrange").daterangepicker({
			startDate: start,
			endDate: end,
			ranges: {
				'Today': [moment(), moment()],
				'Yesterday': [moment().subtract(1, "days"), moment().subtract(1, "days")],
				"Last 7 Days": [moment().subtract(6, "days"), moment()],
				"Last 30 Days": [moment().subtract(29, "days"), moment()],
				"This Month": [moment().startOf("month"), moment().endOf("month")],
				"Last Month": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")]
			}
		}, report_range);
		report_range(start, end);
	}

	// Reportrange
	if ($('.reportrange').length > 0) {
		const start = moment().subtract(29, "days");
		const end = moment();
		const report_range = (start, end) => {
			$(".reportrange span").html(`${start.format("D MMM YY")} - ${end.format("D MMM YY")}`);
		};
		$(".reportrange").daterangepicker({
			startDate: start,
			endDate: end,
			ranges: {
				'Today': [moment(), moment()],
				'Yesterday': [moment().subtract(1, "days"), moment().subtract(1, "days")],
				"Last 7 Days": [moment().subtract(6, "days"), moment()],
				"Last 30 Days": [moment().subtract(29, "days"), moment()],
				"This Month": [moment().startOf("month"), moment().endOf("month")],
				"Last Month": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")]
			}
		}, report_range);
		report_range(start, end);
	}

	// Custom Country Code Selector
	if ($('.phone').length > 0) {
		document.querySelectorAll(".phone").forEach(input => {
			window.intlTelInput(input, {
				utilsScript: "assets/plugins/intltelinput/js/utils.js",
			});
		});
	}

	// Select Table Checkbox
	$('#select-all').on('click', function () {
		const isChecked = this.checked;
		$('.form-check.form-check-md :checkbox').prop('checked', isChecked);
	});

	$('#select-all-2').on('click', function () {
		$('.form-check.form-check-md :checkbox').prop('checked', this.checked);
	});

	$('#select-all-3').on('click', function () {
		$('.form-check.form-check-md :checkbox').prop('checked', this.checked);
	});

	// Full Screen
    if ($('.btnFullscreen').length) {
		const toggleFullscreen = function () {
			if (!document.fullscreenElement) {
				document.documentElement.requestFullscreen();
			} else {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				}
			}
		};
		$('.btnFullscreen').on('click', toggleFullscreen);
	}

	// Aprrearence Settings 
	$('.theme-image').on('click', function(){
		$('.theme-image').removeClass('active');
		$(this).addClass('active');
	});

	// Sticky Sidebar
	if ($(window).width() > 767) {
		if ($('.theiaStickySidebar').length > 0) {
			$('.theiaStickySidebar').theiaStickySidebar({
				additionalMarginTop: 30
			});
		}
	}

	// Date Range Picker
	if ($('.daterangepick').length > 0) {
		const start = moment().subtract(29, 'days');
		const end = moment();
		$('.daterangepick').daterangepicker({
			startDate: start,
			endDate: end,
			ranges: {
				'Today': [moment(), moment()],
				'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
				'Last 7 Days': [moment().subtract(6, 'days'), moment()],
				'Last 30 Days': [moment().subtract(29, 'days'), moment()],
				'This Month': [moment().startOf('month'), moment().endOf('month')],
				'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
			}
		}, function (start, end) {
			$('.daterangepick span').html(`${start.format('D MMM YY')} - ${end.format('D MMM YY')}`);
		});

		// Set initial value manually
		$('.daterangepick span').html(`${start.format('D MMM YY')} - ${end.format('D MMM YY')}`);
	}

	// Card Drag
	if($('.kanban-drag-wrap').length > 0) {
        $(".kanban-drag-wrap").sortable({
            connectWith: ".kanban-drag-wrap",
            handle: ".kanban-card",
            placeholder: "drag-placeholder"
        });
    }

	// Otp Verfication  
	$('.digit-group input').each(function () {
		const $input = $(this);
		$input.attr('maxlength', 1);

		$input.on('keyup', function (e) {
			const $this = $(this);
			const $parent = $this.closest('.digit-group');
			const key = e.keyCode;
			const prevInput = $parent.find(`#${$this.data('previous')}`);
			const nextInput = $parent.find(`#${$this.data('next')}`);

			if (key === 8 || key === 37) {
				if (prevInput.length) prevInput.select();
			} else if (
				(key >= 48 && key <= 57) || // 0-9
				(key >= 65 && key <= 90) || // A-Z
				(key >= 96 && key <= 105) || // numpad 0-9
				key === 39 // right arrow
			) {
				if (nextInput.length) {
					nextInput.select();
				} else if ($parent.data('autosubmit')) {
					$parent.submit();
				}
			}
		});
		$input.on('keyup', function () {
			$(this).toggleClass('active', this.value !== '');
		});
	});

	// Coming Soon
	if ($('.comming-soon').length > 0) {
		const dayEl = document.querySelector('.days');
		const hourEl = document.querySelector('.hours');
		const minuteEl = document.querySelector('.minutes');
		const secondEl = document.querySelector('.seconds');
		const countdownDate = new Date('Aug 27, 2025 16:00:00').getTime();
		const timer = setInterval(() => {
			const now = Date.now();
			const distance = countdownDate - now;
			if (distance <= 0) {
				clearInterval(timer);
				document.querySelector('.comming-soon').innerHTML = '<h1>EXPIRED</h1>';
				return;
			}
			const days = Math.floor(distance / (1000 * 60 * 60 * 24));
			const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((distance % (1000 * 60)) / 1000);

			dayEl.textContent = days;
			hourEl.textContent = hours;
			minuteEl.textContent = minutes;
			secondEl.textContent = seconds;
		}, 1000);
	}

	// Add new invoice input on '+' click
	$(document).on('click', '.add-invoices', function (e) {
		e.preventDefault();
	
		const newInvoice = `
			<tr class="invoices-list-item">
				<td><input type="text" class="form-control" /></td>
				<td><input type="text" class="form-control" /></td>
				<td><input type="number" class="form-control" /></td>
				<td><input type="number" class="form-control" /></td>
				<td><input type="text" class="form-control" readonly /></td>
				<td><button class="btn remove-invoices btn-sm border shadow-sm p-2 d-flex align-items-center justify-content-center rounded fs-14">
					<i class="ti ti-trash"></i>
				</button></td>
			</tr>
		`;
	
		// Insert before the last row (the add button row)
		$('.invoices-list tr:last').before(newInvoice);
	});

	// Add new invoice input on '+' click
	$(document).on('click', '.add-invoices-two', function (e) {
		e.preventDefault();
	
		const newInvoice = `
			<tr class="invoices-list-item">
				<td>
					<div class="input-table input-table-descripition">
						<input type="text" class="form-control">
					</div>
				</td>
				<td>
					<div>
						<input type="text" class="form-control">
					</div>
				</td>
				<td>
					<div>
						<input type="text" class="form-control">
					</div>
				</td>
				<td>
					<div>
						<select class="select">
							<option>0%</option>
							<option>5%</option>
						</select>
					</div>
				</td>
				<td>
					<div>
						<input type="text" class="form-control">
					</div>
				</td>
				<td>
					<a href="#" class="btn btn-icon btn-sm remove-invoices text-danger">
						<i class="ti ti-xbox-x"></i>
					</a>
				</td>
			</tr>`;
	
		// Insert before the last row (the add button row)
		$('.invoices-list-two tr:last').after(newInvoice);

		setTimeout(function () {
            $('.select');
            setTimeout(function () {
                $('.select').select2({
                    minimumResultsForSearch: -1,
                    width: '100%'
                });
            }, 100);
        }, 100);
	});

	// Add new invoice input on '+' click
	$(document).on('click', '.add-invoices-3', function (e) {
		e.preventDefault();
	
		const newInvoice = `
			<tr class="invoices-list-item">
				<td>
					<div class="input-table input-table-descripition">
						<input type="text" class="form-control">
					</div>
				</td>
				<td>
					<div>
						<input type="text" class="form-control">
					</div>
				</td>
				<td>
					<div>
						<input type="text" class="form-control">
					</div>
				</td>
				<td>
					<div>
						<select class="select">
							<option>0%</option>
							<option>5%</option>
						</select>
					</div>
				</td>
				<td>
					<div>
						<input type="text" class="form-control">
					</div>
				</td>
				<td>
					<a href="#" class="btn btn-icon btn-sm remove-invoices text-danger">
						<i class="ti ti-xbox-x"></i>
					</a>
				</td>
			</tr>`;
	
		// Insert before the last row (the add button row)
		$('.invoices-list-3 tr:last').after(newInvoice);

		setTimeout(function () {
            $('.select');
            setTimeout(function () {
                $('.select').select2({
                    minimumResultsForSearch: -1,
                    width: '100%'
                });
            }, 100);
        }, 100);
	});
	
	// Remove Invoices input on trash icon click
	$(document).on('click', '.remove-invoices', function (e) {
		e.preventDefault();
		$(this).closest('.invoices-list-item').remove();
	}); 

	// Theme Color
	$('.themecolorset').on('click', function(){
		$('.themecolorset').removeClass('active');
		$(this).addClass('active');
	});

	// Add Comment
	if($('.add-comment').length > 0) {
		$(".add-comment").on("click", function() {
		   	$(this).closest('.notes-editor').find('.note-edit-wrap').slideToggle();
		});
		$(".add-cancel").on("click", function() {
		  	$(this).closest(".note-edit-wrap").slideUp();
		});
	}

	// Contact Wizard
	$(document).on('click', '.add-info-fieldset .wizard-next-btn', function () {
		const $fieldset = $(this).closest('fieldset');
		const $nextFieldset = $fieldset.next();
		const $progressBar = $('.progress-bar-wizard');

		$fieldset.hide();              // Hide current step
		$nextFieldset.fadeIn('slow');  // Show next step with fade

		// Update progress bar state
		$progressBar.find('.active').removeClass('active').addClass('activated').next().addClass('active');
	});

	// Add Sign
	$(document).on('click', '.trash-sign', function () {
		$(this).closest('.sign-cont').remove();
		return false;
	});
	$(document).on('click','.add-sign',function(e) {
  		e.preventDefault();

		const signcontent = '<div class="row sign-cont">' +
			'<div class="col-md-6">' +
				'<div class="form-wrap mb-3">' +
					'<input class="form-control" type="text" placeholder="Enter Name">' +
				'</div>' +
			'</div>' +
			'<div class="col-md-6">' +
				'<div class="d-flex align-items-center mb-3">' +    
					'<div class="form-wrap w-100 me-3">' +    
					'<input class="form-control" type="text" placeholder="Email Address">' +    
					'</div>' +
					'<div class="input-btn">' +
						'<a href="javascript:void(0);" class="trash-sign"><i class="ti ti-trash"></i></a>' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</div>';
		$(".sign-content > div:last-child").after(signcontent);
		return false;
	});

	// Delete Reason
	$('#deleteReason').on('select2:select', function (e) {
		const value = e.params.data.id;
		if (value === 'others') {
			$('#otherReasonBox').slideDown();
		} else {
			$('#otherReasonBox').slideUp();
		}
	});

})();
