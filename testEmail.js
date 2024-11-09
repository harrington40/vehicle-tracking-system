try {
    await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
      service_id: 'service_99g0ail',
      template_id: 'template_e5lcfg3',
      user_id: 'Kt8nh8pqBRiLyxqee',
      accessToken: 'Pv43gugk8ucREk09c0KDJ',
      template_params: { user_email: 'test@example.com', reset_url: 'https://example.com/reset-password' }
    });
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Error in minimal payload test:', error.response?.data || error.message);
  }
  