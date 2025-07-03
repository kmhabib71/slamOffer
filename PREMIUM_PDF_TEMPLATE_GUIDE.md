# Premium PDF Template Guide

## Overview

The Premium PDF Template is a sophisticated HTML + TailwindCSS solution designed for creating professional, printable PDF documents for Grand Slam Offers. It features a clean, minimal design inspired by Notion and Apple Keynote, optimized for A4/Letter format printing.

## Features

### 🎨 Design Features

- **Clean, Minimal Aesthetic**: Inspired by Notion and Apple Keynote
- **Premium Typography**: Optimized font hierarchy and spacing
- **Professional Layout**: Consistent padding, margins, and visual hierarchy
- **Print-Optimized**: A4/Letter format with proper page breaks
- **Responsive Design**: Works on screen and print

### 📄 Document Structure

1. **Cover Page**: Gradient background with title and branding
2. **Table of Contents**: Value equation and component overview
3. **Component Pages**: 11 sections with detailed content
4. **Summary Page**: Implementation guide and next steps

### 🛠 Technical Features

- **HTML + TailwindCSS**: No external dependencies for styling
- **Print-Friendly**: Optimized CSS for browser print functionality
- **Puppeteer Ready**: Compatible with server-side PDF generation
- **TypeScript**: Full type safety and IntelliSense support
- **Reusable**: Template accepts dynamic data via props

## File Structure

```
src/
├── components/pdf/
│   ├── premium-pdf-template.tsx    # Main template component
│   └── premium-pdf-export.tsx      # Export functionality
├── utils/
│   └── premium-pdf-utils.ts        # PDF utilities and helpers
└── app/pdf-demo/premium-template/
    └── page.tsx                    # Demo page with sample data
```

## Usage

### Basic Implementation

```tsx
import PremiumPDFTemplate from '@/components/pdf/premium-pdf-template'
import { GrandSlamOfferData } from '@/types'

const data: GrandSlamOfferData = {
  id: 'offer-1',
  title: 'Your Grand Slam Offer',
  components: [
    {
      id: 'dream-outcomes',
      title: 'Dream Outcomes',
      description: 'The results your customers will achieve',
      items: [
        {
          id: 'outcome-1',
          title: 'Specific Result 1',
          content: 'Detailed description of the outcome',
          isEditable: false,
          order: 1,
        },
        // ... more items
      ],
      isEditable: false,
      color: '#06B6D4',
      order: 1,
    },
    // ... more components
  ],
}

const userInfo = {
  businessName: 'Your Business',
  ownerName: 'Your Name',
  email: 'your@email.com',
}

function MyComponent() {
  return <PremiumPDFTemplate data={data} coverImage="/images/cover.svg" userInfo={userInfo} />
}
```

### Export Functionality

```tsx
import PremiumPDFExport from '@/components/pdf/premium-pdf-export'

function ExportComponent() {
  return (
    <PremiumPDFExport
      data={data}
      coverImage="/images/cover.svg"
      userInfo={userInfo}
      onExport={url => console.log('PDF exported:', url)}
    />
  )
}
```

### Advanced Export Options

```tsx
import { exportToPDF, generatePDFFilename } from '@/utils/premium-pdf-utils'

const handleExport = async () => {
  try {
    const filename = generatePDFFilename(data)

    await exportToPDF(htmlContent, {
      format: 'print', // 'print' | 'download' | 'puppeteer'
      filename,
      includeMetadata: true,
      quality: 'standard', // 'standard' | 'high' | 'premium'
    })
  } catch (error) {
    console.error('Export failed:', error)
  }
}
```

## Data Format

### GrandSlamOfferData Interface

```typescript
interface GrandSlamOfferData {
  id: string
  title: string
  components: GrandSlamComponent[]
}

interface GrandSlamComponent {
  id: string
  title: string
  description: string
  items: MindmapItem[]
  isEditable: boolean
  color: string
  order: number
}

interface MindmapItem {
  id: string
  title: string
  content: string
  isEditable: boolean
  order: number
}
```

### Sample Data Structure

```javascript
{
  title: "Ultimate Fitness Transformation Program",
  components: [
    {
      title: "Dream Outcomes",
      description: "The specific, measurable results your customers will achieve",
      items: [
        {
          title: "Lose 20-30 pounds in 90 days",
          content: "Sustainable weight loss through proven nutrition and exercise protocols"
        },
        // ... more items
      ]
    },
    // ... 10 more components
  ]
}
```

## Export Methods

### 1. Browser Print (Recommended for Development)

```tsx
const handlePrint = () => {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Grand Slam Offer</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              .pdf-page { page-break-after: always; }
              @page { size: A4; margin: 0; }
            }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
}
```

### 2. Puppeteer (Production)

```typescript
// Server-side implementation
import puppeteer from 'puppeteer'

export async function generatePDF(html: string, options: any) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.setContent(html, {
    waitUntil: 'networkidle0',
  })

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  })

  await browser.close()
  return pdf
}
```

## Styling Customization

### Color Scheme

The template uses a sophisticated color palette:

```css
/* Primary Colors */
--cyan-400: #22d3ee --cyan-500: #06b6d4 --cyan-600: #0891b2 /* Neutral Colors */ --gray-50: #f9fafb
  --gray-100: #f3f4f6 --gray-600: #4b5563 --gray-700: #374151 --gray-900: #111827
  /* Accent Colors */ --slate-300: #cbd5e1 --slate-400: #94a3b8 --slate-800: #1e293b
  --slate-900: #0f172a;
```

### Typography

```css
/* Font Stack */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif

/* Font Sizes */
text-5xl: 48px (Cover title)
text-3xl: 30px (Section headers)
text-2xl: 24px (Component titles)
text-lg: 18px (Item titles)
text-base: 16px (Body text)
```

## Print Optimization

### CSS Print Rules

```css
@media print {
  /* Page Setup */
  @page {
    size: A4;
    margin: 0;
  }

  /* Page Breaks */
  .pdf-page {
    page-break-after: always;
    min-height: 297mm;
    width: 210mm;
  }

  /* Typography */
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #1a1a1a;
  }

  /* Color Preservation */
  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
}
```

## Best Practices

### 1. Content Guidelines

- Keep titles concise and impactful
- Use bullet points for better readability
- Limit content per page to avoid overflow
- Use consistent terminology throughout

### 2. Image Optimization

- Use SVG for logos and icons
- Optimize images for print (300 DPI minimum)
- Provide fallback text for accessibility
- Keep file sizes reasonable

### 3. Performance

- Minimize external dependencies
- Use system fonts when possible
- Optimize CSS for print rendering
- Test across different browsers

### 4. Accessibility

- Use semantic HTML structure
- Provide alt text for images
- Ensure sufficient color contrast
- Test with screen readers

## Troubleshooting

### Common Issues

1. **Page Breaks Not Working**
   - Ensure `.pdf-page` class is applied
   - Check for conflicting CSS
   - Verify print media queries

2. **Fonts Not Loading**
   - Use system fonts as fallbacks
   - Include font files in the project
   - Test with different browsers

3. **Colors Not Printing**
   - Add `-webkit-print-color-adjust: exact`
   - Test print settings in browser
   - Consider grayscale alternatives

4. **Layout Breaking**
   - Check for fixed widths/heights
   - Use relative units when possible
   - Test with different content lengths

### Debug Tips

```typescript
// Validate data before export
import { validatePDFContent } from '@/utils/premium-pdf-utils'

const errors = validatePDFContent(data)
if (errors.length > 0) {
  console.error('PDF validation errors:', errors)
}
```

## Demo

Visit `/pdf-demo/premium-template` to see the template in action with sample data.

## Contributing

When contributing to the PDF template:

1. Maintain the clean, minimal aesthetic
2. Test print functionality thoroughly
3. Ensure cross-browser compatibility
4. Update documentation for new features
5. Follow TypeScript best practices

## License

This template is part of the GrandSlamGenerator.ai project and follows the same licensing terms.
