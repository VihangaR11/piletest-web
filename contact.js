// contact.js — handles form submission to backend API
const API_URL = 'http://localhost:3001/api/contact';

document.addEventListener('DOMContentLoaded', () => {
  const form   = document.getElementById('contact-form');
  const btn    = document.getElementById('submit-btn');
  const result = document.getElementById('form-result');

  if (!form) return;

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

    // Submit
    btn.disabled    = true;
    btn.textContent = 'Sending…';
    result.style.display = 'none';

    try {
      const res  = await fetch(API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showResult('success',
          '✅ Message sent! We will contact you within 1 business day.');
        form.reset();
      } else {
        const errMsg = json.errors
          ? json.errors.join(', ')
          : json.error || 'Submission failed. Please try again.';
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
