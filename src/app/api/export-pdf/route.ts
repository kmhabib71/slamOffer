import puppeteer from 'puppeteer'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
    })

    // Create new page
    const page = await browser.newPage()

    // Set viewport for better PDF quality
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2,
    })

    // Add print styles
    await page.addStyleTag({
      content: `
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
          }
        }
      `,
    })

    // Navigate to the offer showcase page
    await page.goto(`${process.env.NEXT_PUBLIC_SITE_URL}/offer-showcase`, {
      waitUntil: 'networkidle0',
    })

    // Wait for content to be fully rendered
    await page.waitForSelector('.min-h-screen')

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
    })

    // Close browser
    await browser.close()

    // Return PDF as response
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=grand-slam-offer.pdf',
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
