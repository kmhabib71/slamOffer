import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { GrandSlamOfferData, PDFTemplateData } from '@/types'
import { EnhancedPDFGenerator } from '@/utils/enhanced-pdf-generator'

interface EnhancedPDFTemplateProps {
  data: GrandSlamOfferData
  template: PDFTemplateData
  userInfo?: {
    businessName?: string
    ownerName?: string
    email?: string
    phone?: string
    website?: string
  }
  coverImageUrl?: string
}

export const EnhancedPDFTemplate: React.FC<EnhancedPDFTemplateProps> = ({
  data,
  template,
  userInfo = {},
  coverImageUrl,
}) => {
  // Generate dynamic styles based on selected template
  const dynamicStyles = EnhancedPDFGenerator.generatePDFStyles(template)

  // Convert to react-pdf StyleSheet with proper typing
  const styles = StyleSheet.create({
    ...dynamicStyles,
    coverPage: {
      ...dynamicStyles.coverPage,
      display: 'flex' as const,
      flexDirection: 'column' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    coverContent: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: 60,
      display: 'flex' as const,
      flexDirection: 'column' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    tocContainer: {
      marginBottom: 30,
    },
    tocTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: template.styles.colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    tocItem: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingVertical: 8,
      paddingHorizontal: 15,
      marginBottom: 5,
      backgroundColor: template.styles.colors.background,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: template.styles.colors.primary,
    },
    tocNumber: {
      fontSize: 14,
      fontWeight: 'bold' as const,
      color: template.styles.colors.secondary,
      width: 30,
    },
    tocText: {
      fontSize: 14,
      color: template.styles.colors.text,
      flex: 1,
      marginLeft: 10,
    },
    tocPage: {
      fontSize: 12,
      color: template.styles.colors.muted,
    },
    componentHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: 15,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: template.styles.colors.primary,
    },
    componentNumber: {
      fontSize: 16,
      fontWeight: 'bold' as const,
      backgroundColor: template.styles.colors.secondary,
      color: '#ffffff',
      marginRight: 10,
      padding: 8,
      borderRadius: 20,
      width: 35,
      textAlign: 'center' as const,
    },
    brandingText: {
      fontSize: 14,
      color: template.styles.colors.primary,
      fontWeight: 'bold' as const,
    },
    brandingSubtext: {
      fontSize: 10,
      color: template.styles.colors.secondary,
      marginTop: 5,
    },
  })

  const renderCoverPage = () => (
    <Page size="A4" style={styles.coverPage}>
      <View style={styles.coverContent}>
        <Text style={styles.coverTitle}>{userInfo.businessName || 'Grand Slam Offer'}</Text>
        <Text style={styles.coverSubtitle}>{data.title || 'Irresistible Offer Blueprint'}</Text>
        <Text style={styles.coverDescription}>
          A comprehensive guide to creating offers so good people feel stupid saying no.
        </Text>
        <View style={styles.coverBranding}>
          <Text style={styles.brandingText}>{userInfo.ownerName || 'SlamOffer'}</Text>
          <Text style={styles.brandingSubtext}>
            {userInfo.website || 'Generated with SlamOffer'}
          </Text>
        </View>
      </View>
    </Page>
  )

  const renderTableOfContents = () => (
    <Page size="A4" style={styles.page}>
      <View style={styles.tocContainer}>
        <Text style={styles.tocTitle}>Table of Contents</Text>

        {data.components.map((component, index) => {
          const pageNumber = index + 3 // Account for cover and TOC pages
          return (
            <View key={component.id} style={styles.tocItem}>
              <Text style={styles.tocNumber}>{index + 1}</Text>
              <Text style={styles.tocText}>{component.title}</Text>
              <Text style={styles.tocPage}>{pageNumber}</Text>
            </View>
          )
        })}
      </View>
    </Page>
  )

  const renderComponent = (component: any, index: number) => (
    <Page key={component.id} size="A4" style={styles.page}>
      <View style={styles.componentContainer}>
        <View style={styles.componentHeader}>
          <Text style={styles.componentNumber}>{index + 1}</Text>
          <View>
            <Text style={styles.componentTitle}>{component.title}</Text>
            <Text style={styles.componentDescription}>{component.description}</Text>
          </View>
        </View>

        {/* Render component items */}
        {component.items.map((item: any, itemIndex: number) => (
          <View key={item.id} style={{ marginBottom: 20 }}>
            <Text style={styles.sectionHeader}>{item.title}</Text>
            <Text style={styles.bodyText}>{item.content}</Text>

            {/* Add highlight boxes for important content */}
            {item.title.toLowerCase().includes('value') && (
              <View style={styles.highlightBox}>
                <Text style={[styles.bodyText, styles.accentText]}>
                  💎 Key Value Point: This component adds significant value to your overall offer
                </Text>
              </View>
            )}
          </View>
        ))}

        {/* Component summary */}
        <View style={styles.divider} />
        <Text style={styles.mutedText}>
          Component {index + 1} of {data.components.length} • {template.name} Design
        </Text>
      </View>
    </Page>
  )

  const renderSummaryPage = () => (
    <Page size="A4" style={styles.page}>
      <View style={styles.componentContainer}>
        <Text style={styles.componentTitle}>Your Grand Slam Offer Summary</Text>

        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionHeader}>Offer Overview</Text>
          <Text style={styles.bodyText}>{data.title}</Text>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionHeader}>Key Components</Text>
          {data.components.map((component, index) => (
            <View key={component.id} style={{ marginBottom: 8 }}>
              <Text style={styles.bodyText}>
                {index + 1}. {component.title}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.highlightBox}>
          <Text style={[styles.sectionHeader, styles.accentText]}>🚀 Next Steps</Text>
          <Text style={styles.bodyText}>
            1. Review each component of your offer 2. Test with your target audience 3. Iterate
            based on feedback 4. Launch with confidence!
          </Text>
        </View>

        {userInfo.businessName && (
          <View style={{ marginTop: 32 }}>
            <Text style={styles.mutedText}>Generated for {userInfo.businessName}</Text>
            {userInfo.email && <Text style={styles.mutedText}>Contact: {userInfo.email}</Text>}
            <Text style={styles.mutedText}>Created on {new Date().toLocaleDateString()}</Text>
          </View>
        )}
      </View>
    </Page>
  )

  return (
    <Document
      title={data.title || 'Grand Slam Offer'}
      author={userInfo.ownerName || 'SlamOffer User'}
      subject="Grand Slam Offer PDF Export"
      keywords="offer, business, sales, marketing"
    >
      {/* Cover Page */}
      {renderCoverPage()}

      {/* Table of Contents */}
      {renderTableOfContents()}

      {/* Component Pages */}
      {data.components.map((component, index) => renderComponent(component, index))}

      {/* Summary Page */}
      {renderSummaryPage()}
    </Document>
  )
}

// Export default template wrapper that fetches user's template
export const EnhancedPDFTemplateWrapper: React.FC<{
  data: GrandSlamOfferData
  userId: string
  offerId?: string
  userInfo?: any
  coverImageUrl?: string
}> = async ({ data, userId, offerId, userInfo, coverImageUrl }) => {
  // Get user's selected template
  const template =
    (await EnhancedPDFGenerator.getUserTemplate(userId, offerId)) ||
    (await EnhancedPDFGenerator.getDefaultTemplate())

  return (
    <EnhancedPDFTemplate
      data={data}
      template={template}
      userInfo={userInfo}
      coverImageUrl={coverImageUrl}
    />
  )
}
