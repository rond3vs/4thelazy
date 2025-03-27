// src/pages/api/subscribe-to-beehiiv.js
export async function POST({ request }) {
    try {
      const { email } = await request.json();
      
      if (!email || !validateEmail(email)) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Invalid email address' 
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      // Using your Beehiiv publication ID from your previous code
      const BEEHIIV_PUBLICATION_ID = 'fca6d43e-12ca-48ca-b944-9718ba1a094a';
      
      // Make request to Beehiiv Subscriber API
      const response = await fetch(`https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          utm_source: 'freelance-things',
          utm_medium: 'resource-submit',
          utm_campaign: 'resource-submission-form',
          referring_site: 'freelancethings.com',
          source: 'website_form'
        })
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Beehiiv subscription error:', responseData);
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Failed to subscribe to newsletter' 
        }), {
          status: response.status,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Successfully subscribed to newsletter'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
    } catch (error) {
      console.error('Server error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Server error' 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
  
  // Simple email validation function
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }