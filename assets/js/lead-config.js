/* Lead destination. While endpoint is empty, enquiries are NOT sent anywhere: the form validates,
   unlocks the brochure and shows the thank-you page only.
   To capture leads, set endpoint to a URL that accepts a JSON POST and replies { success: true }. */
window.ANANTA_LEADS = { endpoint: '', brochure: 'assets/brochures/ananta-lifestyle.pdf', thankYou: 'thank-you.html' };
