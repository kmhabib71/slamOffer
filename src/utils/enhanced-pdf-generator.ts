import { GrandSlamOfferData, PDFTemplateData, ObjectId } from '@/types'

export interface EnhancedPDFOptions {
  userId: string
  offerId?: string
  templateId?: string
  userInfo?: {
    businessName?: string
    ownerName?: string
    email?: string
    phone?: string
    website?: string
  }
  coverImageUrl?: string
}

export class EnhancedPDFGenerator {
  /**
   * Get user's selected PDF template or default template
   */
  static async getUserTemplate(userId: string, offerId?: string): Promise<PDFTemplateData | null> {
    try {
      // For now, return the hardcoded default template since we're not using Supabase anymore
      // This would need to be implemented with MongoDB if PDF templates are needed
      return this.getHardcodedDefault()
    } catch (error) {
      console.error('Error getting user PDF template:', error)
      return null
    }
  }

  /**
   * Get default template
   */
  static async getDefaultTemplate(): Promise<PDFTemplateData> {
    try {
      // Return hardcoded default since we're not using Supabase anymore
      return this.getHardcodedDefault()
    } catch (error) {
      console.error('Error fetching default template:', error)
      return this.getHardcodedDefault()
    }
  }

  /**
   * Get hardcoded default template as fallback
   */
  static getHardcodedDefault(): PDFTemplateData {
    return {
      _id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'Default Template',
      category: 'business',
      styles: {
        colors: {
          primary: '#06B6D4',
          secondary: '#8B5CF6',
          accent: '#F59E0B',
          background: '#FFFFFF',
          text: '#0A0E1A',
          muted: '#64748B',
        },
        fonts: {
          primary: 'Helvetica',
          secondary: 'Helvetica-Bold',
          size: {
            small: 10,
            medium: 12,
            large: 16,
            xl: 20,
            xxl: 24,
          },
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        },
        borders: {
          width: 1,
          radius: 8,
          color: '#E2E8F0',
        },
      },
      components: [],
    }
  }

  /**
   * Get all available templates for user selection
   */
  static async getAvailableTemplates(): Promise<PDFTemplateData[]> {
    try {
      // Return hardcoded default since we're not using Supabase anymore
      return [this.getHardcodedDefault()]
    } catch (error) {
      console.error('Error fetching available templates:', error)
      return [this.getHardcodedDefault()]
    }
  }

  /**
   * Save user's template selection
   */
  static async saveUserTemplateSelection(
    userId: string,
    templateId: string,
    offerId?: string
  ): Promise<boolean> {
    try {
      // This would need to be implemented with MongoDB if PDF selections are needed
      console.log('Saving PDF selection for user:', userId, {
        template_id: templateId,
        offer_id: offerId,
      })
      return true
    } catch (error) {
      console.error('Error saving PDF selection:', error)
      return false
    }
  }

  /**
   * Generate dynamic styles object for PDF rendering
   */
  static generatePDFStyles(template: PDFTemplateData): any {
    const { colors, fonts, spacing, borders } = template.styles

    return {
      // Page styles
      page: {
        fontFamily: fonts.primary,
        fontSize: fonts.size.medium,
        paddingTop: spacing.lg,
        paddingLeft: spacing.lg,
        paddingRight: spacing.lg,
        paddingBottom: spacing.lg,
        lineHeight: 1.5,
        backgroundColor: colors.background,
        color: colors.text,
      },

      // Cover page
      coverPage: {
        fontFamily: fonts.primary,
        fontSize: fonts.size.medium,
        padding: 0,
        backgroundColor: colors.primary,
        color: colors.background,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      },

      // Headers
      coverTitle: {
        fontSize: fonts.size.xxl * 2,
        fontWeight: 'bold',
        color: colors.accent,
        textAlign: 'center',
        marginBottom: spacing.lg,
      },

      coverSubtitle: {
        fontSize: fonts.size.xl,
        color: colors.secondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
        fontWeight: 'bold',
      },

      // Component styles
      componentContainer: {
        marginBottom: spacing.xl,
        padding: spacing.lg,
        backgroundColor: colors.background,
        borderRadius: borders.radius,
        borderWidth: borders.width,
        borderColor: borders.color,
      },

      componentTitle: {
        fontSize: fonts.size.xl,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.md,
      },

      componentDescription: {
        fontSize: fonts.size.medium,
        color: colors.muted,
        marginBottom: spacing.sm,
      },

      // Text styles
      sectionHeader: {
        fontSize: fonts.size.large,
        fontWeight: 'bold',
        color: colors.secondary,
        marginBottom: spacing.md,
      },

      bodyText: {
        fontSize: fonts.size.medium,
        color: colors.text,
        lineHeight: 1.6,
      },

      accentText: {
        color: colors.accent,
        fontWeight: 'bold',
      },

      mutedText: {
        color: colors.muted,
        fontSize: fonts.size.small,
      },

      // Utility styles
      divider: {
        height: 1,
        backgroundColor: colors.primary,
        marginVertical: spacing.md,
      },

      highlightBox: {
        backgroundColor: colors.accent + '20', // Adding transparency
        padding: spacing.md,
        borderRadius: borders.radius,
        borderLeftWidth: 4,
        borderLeftColor: colors.accent,
      },
    }
  }

  /**
   * Track PDF generation analytics
   */
  static async trackPDFGeneration(userId: string, templateId: string, offerId?: string) {
    try {
      // This would need to be implemented with MongoDB if analytics tracking is needed
      console.log('Analytics event:', {
        user_id: userId,
        event_name: 'pdf_generated',
        properties: {
          template_id: templateId,
          offer_id: offerId,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error('Error tracking analytics event:', error)
    }
  }
}
