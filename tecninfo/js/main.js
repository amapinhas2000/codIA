/**
 * Main Javascript logic for Tecninfo Landing Page
 * Uses jQuery 3.7+ for high-level interactivity and modern UI enhancements.
 */

$(document).ready(function () {
  'use strict';

  /* ==========================================================================
     1. NAVBAR EFFECTS & SCROLL STATE
     ========================================================================== */
  const $navbar = $('.navbar');
  const scrollThreshold = 50;

  function checkNavbarScroll() {
    if ($(window).scrollTop() > scrollThreshold) {
      $navbar.addClass('scrolled');
    } else {
      $navbar.removeClass('scrolled');
    }
  }

  // Initial check and event bind
  checkNavbarScroll();
  $(window).on('scroll', checkNavbarScroll);

  /* ==========================================================================
     2. SMOOTH SCROLLING FOR NAVIGATION LINKS
     ========================================================================== */
  $('a[href^="#"]').on('click', function (e) {
    e.preventDefault();

    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const $target = $(targetId);
    if ($target.length) {
      // Close mobile menu if open
      $('.navbar-collapse').collapse('hide');

      const navbarHeight = $('.navbar').outerHeight();
      const targetPosition = $target.offset().top - navbarHeight + 10;

      $('html, body').animate(
        {
          scrollTop: targetPosition,
        },
        800,
        'swing'
      );
    }
  });

  /* ==========================================================================
     3. ANIMATED COUNTERS (METRICS SECTION)
     ========================================================================== */
  const $counters = $('.counter');
  let countersAnimated = false;

  function startCounters() {
    $counters.each(function () {
      const $this = $(this);
      const targetValue = parseInt($this.attr('data-target'), 10);
      const duration = 2000; // 2 seconds

      $this.prop('Counter', 0).animate(
        {
          Counter: targetValue,
        },
        {
          duration: duration,
          easing: 'swing',
          step: function (now) {
            // Apply formatting if necessary
            if (this.id === 'counter-employ') {
              $this.text(Math.ceil(now) + '%');
            } else if (this.id === 'counter-students') {
              $this.text(Math.ceil(now).toLocaleString('pt-BR') + '+');
            } else {
              $this.text(Math.ceil(now));
            }
          },
        }
      );
    });
  }

  // Trigger counters when scrolled into view
  const $metricsSection = $('#metricas');
  if ($metricsSection.length) {
    $(window).on('scroll.counters', function () {
      const hT = $metricsSection.offset().top,
        hH = $metricsSection.outerHeight(),
        wH = $(window).height(),
        wS = $(this).scrollTop();

      if (wS > hT + hH - wH && !countersAnimated) {
        startCounters();
        countersAnimated = true;
        $(window).off('scroll.counters'); // Remove listener after animation
      }
    });
  }

  /* ==========================================================================
     4. DIFFERENTIALS (TABS INTERACTIVE SHIFT)
     ========================================================================== */
  const $tabBtns = $('.diff-tab-btn');
  const $tabContents = $('.diff-tab-content');

  $tabBtns.on('click', function () {
    const $btn = $(this);
    const targetTabId = $btn.data('target');

    // Remove active classes
    $tabBtns.removeClass('active');
    $tabContents.addClass('d-none');

    // Add active to current
    $btn.addClass('active');
    $(targetTabId).removeClass('d-none').css('opacity', 0).animate({ opacity: 1 }, 500);
  });

  /* ==========================================================================
     5. PRE-ENROLLMENT FORM VALIDATION & MODAL SUCCESS
     ========================================================================== */
  const $form = $('#enrollmentForm');
  const $submitBtn = $form.find('button[type="submit"]');

  // Input helper selectors
  const $nameInput = $('#name');
  const $emailInput = $('#email');
  const $phoneInput = $('#phone');
  const $courseSelect = $('#course');
  const $privacyCheck = $('#privacy');

  // Regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[a-zA-ZÀ-ÿ\s]{3,50}$/;

  // Dynamic Phone Mask
  $phoneInput.on('input', function () {
    let value = $(this).val().replace(/\D/g, ''); // Remove non-digits
    
    // Format options: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    
    if (value.length > 6) {
      value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
    } else if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    
    $(this).val(value);
    validateField($(this), value.replace(/\D/g, '').length >= 10);
  });

  // Validation feedback helper
  function validateField($el, condition, errorMsg = '') {
    const $parent = $el.closest('.form-group');
    let $msg = $parent.find('.validation-msg');

    if (!$msg.length) {
      $msg = $('<span class="validation-msg"></span>');
      $parent.append($msg);
    }

    if (condition) {
      $el.removeClass('is-invalid').addClass('is-valid');
      $msg.removeClass('invalid').addClass('valid').text('Tudo certo!');
      return true;
    } else {
      $el.removeClass('is-valid').addClass('is-invalid');
      $msg.removeClass('valid').addClass('invalid').text(errorMsg);
      return false;
    }
  }

  // Real-time validation
  $nameInput.on('blur input', function () {
    const val = $(this).val().trim();
    validateField($(this), nameRegex.test(val), 'Digite seu nome completo (mínimo 3 letras, sem números).');
  });

  $emailInput.on('blur input', function () {
    const val = $(this).val().trim();
    validateField($(this), emailRegex.test(val), 'Digite um e-mail válido (ex: seuemail@provedor.com).');
  });

  $courseSelect.on('change', function () {
    const val = $(this).val();
    validateField($(this), val !== '', 'Por favor, selecione um curso técnico.');
  });

  $privacyCheck.on('change', function () {
    const checked = $(this).is(':checked');
    validateField($(this), checked, 'Você precisa aceitar os termos de privacidade.');
  });

  // Handle Form Submission
  $form.on('submit', function (e) {
    e.preventDefault();

    // Trigger validation for all fields
    const isNameValid = validateField($nameInput, nameRegex.test($nameInput.val().trim()), 'Nome completo é obrigatório (mínimo 3 letras).');
    const isEmailValid = validateField($emailInput, emailRegex.test($emailInput.val().trim()), 'E-mail válido é obrigatório.');
    const isPhoneValid = validateField($phoneInput, $phoneInput.val().replace(/\D/g, '').length >= 10, 'Digite um número de telefone/WhatsApp válido.');
    const isCourseValid = validateField($courseSelect, $courseSelect.val() !== '', 'Selecione um curso.');
    const isPrivacyValid = validateField($privacyCheck, $privacyCheck.is(':checked'), 'Aceite os termos de privacidade para prosseguir.');

    const formIsValid = isNameValid && isEmailValid && isPhoneValid && isCourseValid && isPrivacyValid;

    if (formIsValid) {
      // Disable submit button during "submission"
      $submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processando...');

      // Gather form data
      const name = $nameInput.val().trim();
      const email = $emailInput.val().trim();
      const phone = $phoneInput.val();
      const courseText = $courseSelect.find('option:selected').text();

      // Simulate API response delay
      setTimeout(function () {
        // Populate modal data
        $('#modal-student-name').text(name);
        $('#modal-student-email').text(email);
        $('#modal-student-phone').text(phone);
        $('#modal-student-course').text(courseText);

        // Show Success Modal
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();

        // Reset form & styles
        $form[0].reset();
        $form.find('.form-control, .form-select, .form-check-input').removeClass('is-valid is-invalid');
        $form.find('.validation-msg').remove();

        // Restore button state
        $submitBtn.prop('disabled', false).text('Garantir Minha Pré-Matrícula');
      }, 1500);
    } else {
      // Scroll to the first invalid field
      const $firstInvalid = $form.find('.is-invalid').first();
      if ($firstInvalid.length) {
        $('html, body').animate({
          scrollTop: $firstInvalid.offset().top - 120
        }, 500);
      }
    }
  });

  /* ==========================================================================
     6. NEWSLETTER FORM HANDLER (FOOTER)
     ========================================================================== */
  const $newsForm = $('#newsletterForm');
  $newsForm.on('submit', function (e) {
    e.preventDefault();
    const $input = $(this).find('input[type="email"]');
    const email = $input.val().trim();

    if (emailRegex.test(email)) {
      $input.val('');
      alert('Obrigado! Seu e-mail foi cadastrado com sucesso em nossa newsletter.');
    } else {
      alert('Por favor, informe um e-mail válido.');
    }
  });
});
