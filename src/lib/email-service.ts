// Email service for sending notifications about offer generation completion
// In a real application, you would integrate with an email service like SendGrid, Mailgun, or AWS SES

export interface OfferGenerationEmail {
  userEmail: string
  userName: string
  offerId: string
  offerTitle: string
  isFullGeneration: boolean
  businessDescription: string
}

export const emailService = {
  async sendOfferGenerationComplete(emailData: OfferGenerationEmail) {
    try {
      console.log('📧 Email notification would be sent:', {
        to: emailData.userEmail,
        subject: `Your Grand Slam Offer is Ready! ${emailData.isFullGeneration ? '(Complete Version)' : '(Free Preview)'}`,
        offerId: emailData.offerId,
        type: emailData.isFullGeneration ? 'full_generation' : 'free_generation',
      })

      // In a real implementation, you would integrate with an email service:
      // 
      // const emailContent = this.generateEmailTemplate(emailData)
      // 
      // await sendGridClient.send({
      //   to: emailData.userEmail,
      //   from: 'noreply@grandslamgenerator.ai',
      //   subject: emailContent.subject,
      //   html: emailContent.html,
      // })

      // For demonstration, we'll simulate the email content that would be sent
      const emailContent = this.generateEmailTemplate(emailData)
      
      return {
        success: true,
        message: 'Email notification sent successfully',
        emailContent: emailContent, // For debugging/testing
      }
    } catch (error) {
      console.error('Error sending email notification:', error)
      return {
        success: false,
        error: 'Failed to send email notification',
      }
    }
  },

  generateEmailTemplate(emailData: OfferGenerationEmail) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://grandslamgenerator.ai'
    const offerUrl = `${baseUrl}/offer/${emailData.offerId}`
    
    const subject = emailData.isFullGeneration
      ? `🎉 Your Complete Grand Slam Offer is Ready!`
      : `✨ Your Grand Slam Offer Preview is Ready!`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #1e293b; 
              background-color: #f8fafc;
              margin: 0;
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 16px; 
              overflow: hidden;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); 
              color: white; 
              padding: 30px 40px; 
              text-align: center; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: 700; 
            }
            .content { 
              padding: 40px; 
            }
            .offer-preview {
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              border-radius: 12px;
              padding: 24px;
              margin: 24px 0;
              border-left: 4px solid #7c3aed;
            }
            .cta-button { 
              display: inline-block; 
              background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); 
              color: white; 
              padding: 16px 32px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: 600;
              font-size: 18px;
              margin: 20px 0;
              box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
            }
            .footer { 
              background: #f1f5f9; 
              padding: 30px 40px; 
              text-align: center; 
              font-size: 14px; 
              color: #64748b; 
            }
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              margin: 10px 0;
            }
            .status-full {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
            }
            .status-preview {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
            }
            .features {
              margin: 20px 0;
            }
            .feature {
              display: flex;
              align-items: center;
              margin: 8px 0;
              font-size: 16px;
            }
            .feature-icon {
              width: 20px;
              height: 20px;
              margin-right: 12px;
              color: #10b981;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${emailData.isFullGeneration ? '🎉' : '✨'} Your Grand Slam Offer is Ready!</h1>
              <div class="status-badge ${emailData.isFullGeneration ? 'status-full' : 'status-preview'}">
                ${emailData.isFullGeneration ? 'Complete Version' : 'Free Preview'}
              </div>
            </div>
            
            <div class="content">
              <p>Hi ${emailData.userName || 'there'}!</p>
              
              <p>Great news! Your AI-powered Grand Slam Offer has been generated using Alex Hormozi's proven $100M methodology.</p>
              
              <div class="offer-preview">
                <h3 style="margin-top: 0; color: #7c3aed;">Your Business Concept:</h3>
                <p style="font-style: italic; margin-bottom: 0;">"${emailData.businessDescription}"</p>
              </div>

              ${emailData.isFullGeneration ? `
                <div class="features">
                  <h3 style="color: #1e293b;">✅ Your Complete Offer Includes:</h3>
                  <div class="feature">
                    <span class="feature-icon">🎯</span>
                    <span>Complete Dream Outcome strategies</span>
                  </div>
                  <div class="feature">
                    <span class="feature-icon">⚡</span>
                    <span>47+ Problems & Solutions identified</span>
                  </div>
                  <div class="feature">
                    <span class="feature-icon">🚀</span>
                    <span>17+ Delivery methods optimized</span>
                  </div>
                  <div class="feature">
                    <span class="feature-icon">💎</span>
                    <span>Value stacking and trim strategies</span>
                  </div>
                  <div class="feature">
                    <span class="feature-icon">⏰</span>
                    <span>Scarcity and urgency tactics</span>
                  </div>
                  <div class="feature">
                    <span class="feature-icon">🛡️</span>
                    <span>Risk reversal guarantees</span>
                  </div>
                  <div class="feature">
                    <span class="feature-icon">📄</span>
                    <span>Professional PDF export ready</span>
                  </div>
                </div>
              ` : `
                <div class="features">
                  <h3 style="color: #1e293b;">👀 Your Preview Includes:</h3>
                  <div class="feature">
                    <span class="feature-icon">🎯</span>
                    <span>3 sample strategies per component</span>
                  </div>
                  <div class="feature">
                    <span class="feature-icon">💡</span>
                    <span>Complete framework overview</span>
                  </div>
                  <div class="feature">
                    <span class="feature-icon">🔓</span>
                    <span>Upgrade option to unlock all ${47 + 17 + 12 + 8 + 6 + 5 + 7}+ strategies</span>
                  </div>
                </div>
              `}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${offerUrl}" class="cta-button">
                  ${emailData.isFullGeneration ? '🚀 View Your Complete Offer' : '👀 View Your Offer Preview'}
                </a>
              </div>
              
              <p style="font-size: 16px; color: #475569;">
                ${emailData.isFullGeneration 
                  ? 'Your complete offer is now ready for implementation. Use the Export PDF feature to create professional presentations for your business.'
                  : 'Ready to unlock the complete version? Upgrade to access all premium strategies and professional PDF export.'
                }
              </p>
              
              <p style="font-size: 14px; color: #64748b;">
                Having trouble with the link? Copy and paste this URL into your browser:<br>
                <span style="word-break: break-all; color: #7c3aed;">${offerUrl}</span>
              </p>
            </div>
            
            <div class="footer">
              <p>This offer was generated by <strong>GrandSlamGenerator.ai</strong></p>
              <p>Powered by Alex Hormozi's $100M Offers methodology</p>
              <p style="margin-top: 20px; font-size: 12px;">
                If you didn't request this offer generation, please ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    return {
      subject,
      html,
      text: this.generateTextVersion(emailData, offerUrl),
    }
  },

  generateTextVersion(emailData: OfferGenerationEmail, offerUrl: string) {
    return `
Hi ${emailData.userName || 'there'}!

Great news! Your AI-powered Grand Slam Offer has been generated using Alex Hormozi's proven $100M methodology.

Your Business Concept: "${emailData.businessDescription}"

${emailData.isFullGeneration ? 'COMPLETE VERSION READY' : 'FREE PREVIEW READY'}

View your offer here: ${offerUrl}

${emailData.isFullGeneration 
  ? 'Your complete offer includes all premium strategies and is ready for implementation. Use the Export PDF feature to create professional presentations.'
  : 'This is a preview version. Upgrade to unlock all premium strategies and professional PDF export.'
}

Generated by GrandSlamGenerator.ai
Powered by Alex Hormozi's $100M Offers methodology

If you didn't request this offer generation, please ignore this email.
    `
  },
}