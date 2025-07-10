import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, Link, Font } from '@react-pdf/renderer'
import { CompleteGrandSlamOffer } from '@/types'

// PDF Template Styles matching the text view design
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
    backgroundColor: '#ffffff',
    color: '#000000',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Cover page styles with SVG background
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
    backgroundColor: 'rgba(139, 69, 19, 0.1)', // Subtle overlay for text readability
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 20,
  },
  coverSubtitle: {
    fontSize: 20,
    color: '#CD853F',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  coverDescription: {
    fontSize: 14,
    color: '#654321',
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
    color: '#8B4513',
    fontWeight: 'bold',
  },
  brandingSubtext: {
    fontSize: 10,
    color: '#CD853F',
    marginTop: 5,
  },

  // Business description section
  businessDescriptionContainer: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  businessDescriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  businessDescriptionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    marginRight: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessDescriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  businessDescriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 1.6,
  },

  // Component header styles matching text view gradients
  componentContainer: {
    marginBottom: 40,
  },
  componentHeader: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Gradient backgrounds for each component (approximated with solid colors)
  componentHeader1: { backgroundColor: '#EC4899' }, // Pink gradient
  componentHeader2: { backgroundColor: '#F97316' }, // Orange gradient
  componentHeader3: { backgroundColor: '#3B82F6' }, // Blue gradient
  componentHeader4: { backgroundColor: '#10B981' }, // Emerald gradient
  componentHeader5: { backgroundColor: '#F59E0B' }, // Amber gradient
  componentHeader6: { backgroundColor: '#8B5CF6' }, // Purple gradient
  componentHeader7: { backgroundColor: '#EF4444' }, // Red gradient
  componentHeader8: { backgroundColor: '#0EA5E9' }, // Sky gradient
  componentHeader9: { backgroundColor: '#8B5CF6' }, // Violet gradient
  componentHeader10: { backgroundColor: '#14B8A6' }, // Teal gradient
  componentHeader11: { backgroundColor: '#06B6D4' }, // Cyan gradient

  componentIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    marginRight: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  componentHeaderContent: {
    flex: 1,
  },
  componentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  componentDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  componentStats: {
    textAlign: 'right',
  },
  componentStatsNumber: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  componentStatsLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
  },

  // Component items list
  itemsContainer: {
    marginLeft: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E2E8F0',
  },
  itemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    marginTop: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNumberText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 1.5,
  },
  itemTags: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  valueTag: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  priorityTag: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },

  // Special styles for Solutions component (component 3)
  solutionsItemContainer: {
    marginBottom: 20,
  },
  problemSolutionRow: {
    marginTop: 8,
  },
  problemLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 4,
  },
  solutionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  problemText: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 8,
  },
  solutionText: {
    fontSize: 11,
    color: '#475569',
  },

  // Footer styles
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 35,
    right: 35,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 10,
    color: '#64748B',
  },
})

// Component color mapping for item numbers
const getComponentColor = (componentId: number) => {
  const colors: Record<number, string> = {
    1: '#EC4899', // Pink
    2: '#F97316', // Orange
    3: '#3B82F6', // Blue
    4: '#10B981', // Emerald
    5: '#F59E0B', // Amber
    6: '#8B5CF6', // Purple
    7: '#EF4444', // Red
    8: '#0EA5E9', // Sky
    9: '#8B5CF6', // Violet
    10: '#14B8A6', // Teal
    11: '#06B6D4', // Cyan
  }
  return colors[componentId] || '#8B5CF6'
}

interface PDFTemplateProps {
  data: CompleteGrandSlamOffer
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
  coverImageUrl = '/GrandSlamCover.svg',
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
        <View style={styles.coverImageContainer}>
          <Image style={styles.coverImage} src={coverImageUrl} />
        </View>
        <View style={styles.coverOverlay} />
        <View style={styles.coverContent}>
          <Text style={styles.coverTitle}>Grand Slam Offer</Text>
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

      {/* Content Pages */}
      <Page size="A4" style={styles.page}>
        {/* Business Description */}
        <View style={styles.businessDescriptionContainer}>
          <View style={styles.businessDescriptionHeader}>
            <View style={styles.businessDescriptionIcon}>
              <Text style={{ color: '#ffffff', fontSize: 16 }}>💼</Text>
            </View>
            <Text style={styles.businessDescriptionTitle}>Your Business Description</Text>
          </View>
          <Text style={styles.businessDescriptionText}>
            {data.businessContext.businessDescription}
          </Text>
        </View>

        {/* Components */}
        {data.components.map((component, index) => {
          const componentColor = getComponentColor(component.componentId)
          const headerStyle = [styles.componentHeader, { backgroundColor: componentColor }]

          return (
            <View key={component.componentId} style={styles.componentContainer} break={index > 0}>
              {/* Component Header */}
              <View style={headerStyle}>
                <View style={styles.componentIconContainer}>
                  <Text style={{ color: '#ffffff', fontSize: 16 }}>
                    {component.componentId === 1
                      ? '🎯'
                      : component.componentId === 2
                        ? '⚠️'
                        : component.componentId === 3
                          ? '💡'
                          : component.componentId === 4
                            ? '🚀'
                            : component.componentId === 5
                              ? '📊'
                              : component.componentId === 6
                                ? '📦'
                                : component.componentId === 7
                                  ? '⏰'
                                  : component.componentId === 8
                                    ? '⚡'
                                    : component.componentId === 9
                                      ? '⭐'
                                      : component.componentId === 10
                                        ? '🛡️'
                                        : '✨'}
                  </Text>
                </View>
                <View style={styles.componentHeaderContent}>
                  <Text style={styles.componentTitle}>
                    {component.componentId}. {component.componentName}
                  </Text>
                  <Text style={styles.componentDescription}>{component.description}</Text>
                </View>
                <View style={styles.componentStats}>
                  <Text style={styles.componentStatsNumber}>
                    {component.items.length} strategies
                  </Text>
                  <Text style={styles.componentStatsLabel}>complete roadmap</Text>
                </View>
              </View>

              {/* Component Items */}
              <View style={styles.itemsContainer}>
                {component.items.map((item, itemIndex) => (
                  <View key={item.id} style={styles.itemContainer}>
                    <View style={[styles.itemNumber, { backgroundColor: componentColor }]}>
                      <Text style={styles.itemNumberText}>{itemIndex + 1}</Text>
                    </View>
                    <View style={styles.itemContent}>
                      {component.componentId === 3 ? (
                        // Special layout for Solutions component
                        <View style={styles.solutionsItemContainer}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          <View style={styles.itemTags}>
                            {item.value && item.value !== '$0 value' && item.value !== '$0' && (
                              <Text style={styles.valueTag}>{item.value}</Text>
                            )}
                            {item.priority === 'high' && (
                              <Text style={styles.priorityTag}>High Impact</Text>
                            )}
                          </View>
                          <View style={styles.problemSolutionRow}>
                            <Text style={styles.problemLabel}>Problem:</Text>
                            <Text style={styles.problemText}>{item.linkedProblem}</Text>
                            <Text style={styles.solutionLabel}>Solution:</Text>
                            <Text style={styles.solutionText}>{item.solutionDetails}</Text>
                          </View>
                        </View>
                      ) : (
                        // Standard layout for other components
                        <View>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          <View style={styles.itemTags}>
                            {item.value && item.value !== '$0 value' && item.value !== '$0' && (
                              <Text style={styles.valueTag}>{item.value}</Text>
                            )}
                            {item.priority === 'high' && (
                              <Text style={styles.priorityTag}>High Impact</Text>
                            )}
                          </View>
                          <Text style={styles.itemDescription}>{item.description}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )
        })}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by GrandSlamGenerator.ai • Powered by Alex Hormozi's $100M Offers Methodology
          </Text>
        </View>
      </Page>
    </Document>
  )
}
