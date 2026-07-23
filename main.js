document.addEventListener('DOMContentLoaded', () => {

  // ===== Scroll Progress Bar =====
  const progressBar = document.getElementById('scrollProgress');
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  };

  // ===== Scroll Reveal =====
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => revealObserver.observe(el));

  // ===== Bottom Floating CTA =====
  const floatCta = document.getElementById('floatCta');
  const reservationSection = document.getElementById('reservation');

  const updateFloatCta = () => {
    const currentY = window.scrollY;
    const windowH = window.innerHeight;
    const resRect = reservationSection.getBoundingClientRect();
    const resVisible = resRect.top < windowH && resRect.bottom > 0;
    if (currentY < 300 || resVisible) {
      floatCta.classList.remove('visible');
    } else {
      floatCta.classList.add('visible');
    }
  };

  // Combined scroll handler
  window.addEventListener('scroll', () => {
    updateProgress();
    updateFloatCta();
  }, { passive: true });

  // ===== FAQ Accordion =====
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // ===== Smooth Scroll =====
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== Modal =====
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', e => {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.add('active');
    });
  });
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay').classList.remove('active');
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  // ===== Form Validation =====
  const form = document.getElementById('reservationForm');
  if (!form) return;

  let isSubmitting = false;

  const validations = {
    name:  { validate: (val) => val.trim().length > 0, message: 'お名前を入力してください' },
    email: { validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), message: '正しいメールアドレスを入力してください' },
    date:  { validate: (val) => val !== '', message: '来場日を選択してください' },
    time:  { validate: (val) => val !== '', message: '時間帯を選択してください' },
    agree: { validate: (el) => el.checked, message: '規約への同意が必要です' }
  };

  form.querySelectorAll('.form-input').forEach(input => {
    const event = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(event, () => {
      input.classList.remove('error');
      const errorEl = input.parentElement.querySelector('.form-error');
      if (errorEl) errorEl.classList.remove('show');
    });
  });

  form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const errorEl = cb.closest('.form-group').querySelector('.form-error');
      if (errorEl) errorEl.classList.remove('show');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    let isValid = true;
    let firstError = null;

    const fields = [
      { el: form.querySelector('[data-field="name"]'),  rule: validations.name,  isCheckbox: false },
      { el: form.querySelector('[data-field="email"]'), rule: validations.email, isCheckbox: false },
      { el: form.querySelector('[data-field="date"]'),  rule: validations.date,  isCheckbox: false },
      { el: form.querySelector('[data-field="time"]'),  rule: validations.time,  isCheckbox: false },
      { el: form.querySelector('[data-field="agree"]'), rule: validations.agree, isCheckbox: true },
    ];

    fields.forEach(({ el, rule, isCheckbox }) => {
      if (!el) return;
      const val = isCheckbox ? el : el.value;
      const valid = rule.validate(val);
      const container = isCheckbox ? el.closest('.form-group') : el.parentElement;
      const errorEl = container.querySelector('.form-error');
      if (!valid) {
        if (!isCheckbox) el.classList.add('error');
        if (errorEl) { errorEl.textContent = rule.message; errorEl.classList.add('show'); }
        if (!firstError) firstError = container;
        isValid = false;
      }
    });

    if (!isValid && firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Disable button to prevent double submission
    isSubmitting = true;
    const submitBtn = form.querySelector('.form-submit .cta-primary');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '送信中...';
      submitBtn.style.opacity = '0.5';
      submitBtn.style.pointerEvents = 'none';
    }

    // Simulate server response
    setTimeout(() => {
      form.style.display = 'none';
      const thanks = document.getElementById('formThanks');
      if (thanks) {
        thanks.classList.add('show');
        thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      history.pushState({ formSubmitted: true }, '', '#reserved');
    }, 600);
  });

  // Back button handling
  window.addEventListener('popstate', () => {
    const thanks = document.getElementById('formThanks');
    if (thanks && thanks.classList.contains('show')) {
      thanks.classList.remove('show');
      form.style.display = '';
      form.reset();
      isSubmitting = false;
      const submitBtn = form.querySelector('.form-submit .cta-primary');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '予約を確定する';
        submitBtn.style.opacity = '';
        submitBtn.style.pointerEvents = '';
      }
    }
  });

  // Forward button / bfcache handling
  window.addEventListener('pageshow', (e) => {
    if (e.persisted && window.location.hash !== '#reserved') {
      const thanks = document.getElementById('formThanks');
      if (thanks) { thanks.classList.remove('show'); form.style.display = ''; }
    }
  });

});
