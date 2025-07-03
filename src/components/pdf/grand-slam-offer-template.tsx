import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, Link, Font } from '@react-pdf/renderer'
import { GrandSlamOfferData } from '@/types'

// PDF Template Styles matching the cosmic theme
const styles = StyleSheet.create({
  // Page styles
  page: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    paddingTop: 35,
    paddingLeft: 35,
    paddingRight: 35,
    paddingBottom: 35,
    lineHeight: 1.5,
    backgroundColor: '#ffffff',
  },
  coverPage: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    padding: 0,
    backgroundColor: '#0A0E1A',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Cover page styles
  coverImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 14, 26, 0.8)',
  },
  coverContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#06B6D4',
    textAlign: 'center',
    marginBottom: 20,
  },
  coverSubtitle: {
    fontSize: 24,
    color: '#8B5CF6',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  coverDescription: {
    fontSize: 16,
    color: '#F8FAFC',
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 1.8,
    marginBottom: 40,
  },
  coverBranding: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  brandingText: {
    fontSize: 14,
    color: '#06B6D4',
    fontWeight: 'bold',
  },
  brandingSubtext: {
    fontSize: 10,
    color: '#8B5CF6',
    marginTop: 5,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#06B6D4',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A0E1A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8B5CF6',
    marginTop: 5,
  },

  // Table of Contents styles
  tocContainer: {
    marginBottom: 30,
  },
  tocTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0A0E1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  tocItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 5,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#06B6D4',
  },
  tocNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5CF6',
    width: 30,
  },
  tocText: {
    fontSize: 14,
    color: '#0A0E1A',
    flex: 1,
    marginLeft: 10,
  },
  tocPage: {
    fontSize: 12,
    color: '#64748B',
  },

  // Component styles
  componentContainer: {
    marginBottom: 40,
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#06B6D4',
  },
  componentNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#8B5CF6',
    color: '#ffffff',
    marginRight: 10,
    padding: 8,
    borderRadius: 20,
    width: 35,
    textAlign: 'center',
  },
  componentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0A0E1A',
    marginBottom: 10,
  },
  componentDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    fontStyle: 'italic',
  },

  // Item styles
  itemContainer: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#06B6D4',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A0E1A',
    marginBottom: 5,
  },
  itemContent: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 1.6,
  },

  // Footer styles
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 35,
    right: 35,
    textAlign: 'center',
    fontSize: 10,
    color: '#64748B',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  // Section break styles
  sectionBreak: {
    marginTop: 30,
    marginBottom: 30,
    height: 2,
    backgroundColor: '#06B6D4',
  },

  // Value equation styles
  valueEquation: {
    backgroundColor: '#EFF6FF',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#06B6D4',
  },
  equationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A0E1A',
    marginBottom: 10,
    textAlign: 'center',
  },
  equationFormula: {
    fontSize: 14,
    color: '#8B5CF6',
    textAlign: 'center',
    fontFamily: 'Courier',
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 4,
  },
})

interface PDFTemplateProps {
  data: GrandSlamOfferData
  userInfo?: {
    businessName?: string
    ownerName?: string
    email?: string
    phone?: string
    website?: string
  }
  coverImageUrl?: string
}

export const GrandSlamOfferPDFTemplate: React.FC<PDFTemplateProps> = ({
  data,
  userInfo = {},
  coverImageUrl,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        {coverImageUrl && (
          <View style={styles.coverImageContainer}>
            <Image style={styles.coverImage} src={coverImageUrl} />
          </View>
        )}
        <View style={styles.coverOverlay} />
        <View style={styles.coverContent}>
          <Text style={styles.coverTitle}>{data.title}</Text>
          <Text style={styles.coverSubtitle}>The Ultimate Irresistible Offer</Text>
          <Text style={styles.coverDescription}>
            A complete Grand Slam Offer built using Alex Hormozi's proven $100M methodology. This
            offer has been designed to be so good that your customers feel stupid saying no.
          </Text>
          {userInfo.businessName && (
            <Text style={styles.coverDescription}>Created for: {userInfo.businessName}</Text>
          )}
          {userInfo.ownerName && (
            <Text style={styles.coverDescription}>By: {userInfo.ownerName}</Text>
          )}
          <Text style={styles.coverDescription}>Generated on: {currentDate}</Text>
        </View>
        <View style={styles.coverBranding}>
          <Text style={styles.brandingText}>GrandSlamGenerator.ai</Text>
          <Text style={styles.brandingSubtext}>
            Powered by Alex Hormozi's $100M Offers Methodology
          </Text>
        </View>
      </Page>

      {/* Table of Contents */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Table of Contents</Text>
            <Text style={styles.headerSubtitle}>Your Grand Slam Offer Blueprint</Text>
          </View>
        </View>

        <View style={styles.tocContainer}>
          <Text style={styles.tocTitle}>The 11 Components</Text>

          {/* Value Equation */}
          <View style={styles.valueEquation}>
            <Text style={styles.equationTitle}>The Value Equation</Text>
            <Text style={styles.equationFormula}>
              Value = (Dream Outcome × Likelihood) / (Time Delay × Effort & Sacrifice)
            </Text>
          </View>

          {data.components.map((component, index) => (
            <View key={component.id} style={styles.tocItem}>
              <Text style={styles.tocNumber}>{String(index + 1).padStart(2, '0')}</Text>
              <Text style={styles.tocText}>{component.title}</Text>
              <Text style={styles.tocPage}>Page {index + 4}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>
            This Grand Slam Offer was generated using proven methodologies from Alex Hormozi's $100M
            Offers
          </Text>
        </View>
      </Page>

      {/* Component Pages */}
      {data.components.map((component, componentIndex) => (
        <Page key={component.id} size="A4" style={styles.page}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>{data.title}</Text>
              <Text style={styles.headerSubtitle}>Component {componentIndex + 1} of 11</Text>
            </View>
          </View>

          <View style={styles.componentContainer}>
            <Text style={styles.componentTitle}>
              {componentIndex + 1}. {component.title}
            </Text>

            <Text style={styles.componentDescription}>{component.description}</Text>

            {component.items && component.items.length > 0 && (
              <View>
                {component.items.map((item, itemIndex) => (
                  <View key={item.id} style={styles.itemContainer}>
                    <Text style={styles.itemTitle}>
                      {itemIndex + 1}. {item.title}
                    </Text>
                    <Text style={styles.itemContent}>{item.content}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text>
              Page {componentIndex + 4} | {userInfo.businessName || 'Grand Slam Offer'} | Generated{' '}
              {currentDate}
            </Text>
          </View>
        </Page>
      ))}

      {/* Summary Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Implementation Summary</Text>
            <Text style={styles.headerSubtitle}>Your Next Steps</Text>
          </View>
        </View>

        <View style={styles.componentContainer}>
          <Text style={styles.componentTitle}>🎯 Your Grand Slam Offer is Ready!</Text>
          <Text style={styles.componentDescription}>
            You now have a complete offer built using Alex Hormozi's proven methodology. Here's how
            to implement it:
          </Text>

          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>1. Review & Customize</Text>
            <Text style={styles.itemContent}>
              Review each component and customize the details to match your specific business,
              audience, and market conditions.
            </Text>
          </View>

          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>2. Test Your Messaging</Text>
            <Text style={styles.itemContent}>
              Start with small tests to validate your offer messaging before rolling out to your
              entire audience.
            </Text>
          </View>

          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>3. Create Your Sales Materials</Text>
            <Text style={styles.itemContent}>
              Use this document as the foundation for your sales pages, presentations, and marketing
              materials.
            </Text>
          </View>

          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>4. Launch & Optimize</Text>
            <Text style={styles.itemContent}>
              Launch your offer and continuously optimize based on customer feedback and conversion
              data.
            </Text>
          </View>
        </View>

        <View style={styles.valueEquation}>
          <Text style={styles.equationTitle}>
            Remember: Make It So Good They Feel Stupid Saying No
          </Text>
          <Text style={styles.itemContent}>
            Your offer should be so compelling, so valuable, and so risk-free that your ideal
            customers can't help but say yes. If they're not saying yes, revisit the components and
            increase the value or reduce the risk.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>
            Final Page | Thank you for using GrandSlamGenerator.ai | Visit us at
            grandslamgenerator.ai
          </Text>
        </View>
      </Page>
    </Document>
  )
}
