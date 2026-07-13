// contact.js — submits website enquiries to the configured Formspree form.
const FORMSPREE_ENDPOINT = document.documentElement.dataset.formspreeEndpoint || '';

document.addEventListener('DOMContentLoaded', () => {
  const form   = document.getElementById('contact-form');
  const btn    = document.getElementById('submit-btn');
  const result = document.getElementById('form-result');

  if (!form) return;

  // Prefill requests arriving from the technical-document library.
  const params = new URLSearchParams(window.location.search);
  const requestedService = params.get('service')?.trim();
  const requestType = params.get('request');
  if (requestedService) {
    const matchingOption = [...form.service.options].find(option => option.textContent.trim() === requestedService);
    form.service.value = matchingOption?.value || 'Other';
    if (requestType === 'technical' && !form.message.value.trim()) {
      form.message.value = `Please send the current technical specification and method statement for ${requestedService}.`;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect form data
    const data = {
      first_name: form.first_name.value.trim(),
      last_name:  form.last_name.value.trim(),
      company:    form.company.value.trim(),
      email:      form.email.value.trim(),
      phone:      form.phone.value.trim(),
      service:    form.service.value,
      message:    form.message.value.trim(),
    };

    // Basic client-side validation
    if (!data.first_name || !data.last_name || !data.email || !data.message) {
      showResult('error', '⚠️ Please fill in all required fields.');
      return;
    }
    if (!isValidEmail(data.email)) {
      showResult('error', '⚠️ Please enter a valid email address.');
      return;
    }
    if (data.message.length < 10) {
      showResult('error', '⚠️ Message must be at least 10 characters.');
      return;
    }
    if (data.message.length > 5000) {
      showResult('error', '⚠️ Message must be 5,000 characters or fewer.');
      return;
    }

    if (!FORMSPREE_ENDPOINT.startsWith('https://formspree.io/f/')) {
      showResult('error',
        '⚠️ The enquiry form is temporarily unavailable. Please email piletestcon@gmail.com.');
      return;
    }

    btn.disabled    = true;
    btn.textContent = 'Sending…';
    result.style.display = 'none';

    try {
      const formData = new FormData(form);
      formData.set('_subject', `Website enquiry: ${data.service || 'Pile testing services'}`);
      formData.set('submitted_at', new Date().toISOString());
      formData.set('page_url', window.location.href);

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body: formData,
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        showResult('success',
          '✅ Message sent! We will contact you within 1 business day.');
        form.reset();
      } else {
        const errMsg = Array.isArray(json.errors)
          ? json.errors.map(error => error.message).filter(Boolean).join(', ')
          : 'Submission failed. Please try again.';
        showResult('error', `⚠️ ${errMsg}`);
      }
    } catch (err) {
      showResult('error',
        '❌ Could not connect to server. Please call us: +94 70 3 600 600');
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Send Message →';
    }
  });

  function showResult(type, msg) {
    result.textContent     = msg;
    result.style.display   = 'block';
    result.className       = `form-result form-result--${type}`;
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
});
