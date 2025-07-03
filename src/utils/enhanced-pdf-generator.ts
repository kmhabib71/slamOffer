import { supabase } from '@/lib/supabase'
import { GrandSlamOfferData, PDFTemplateData } from '@/types'

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
      // Use the database function to get user's selected template
      const { data, error } = await supabase.rpc('get_user_pdf_template', {
        user_uuid: userId,
        offer_uuid: offerId || null,
      })

      if (error) {
        console.error('Error fetching user template:', error)
        return null
      }

      if (!data || data.length === 0) {
        // Fallback to default template
        return this.getDefaultTemplate()
      }

      const templateData = data[0]
      return {
        id: templateData.template_id,
        name: templateData.template_name,
        category: templateData.template_category,
        styles: templateData.styles,
        components: Array.isArray(templateData.components) ? templateData.components : [],
      }
    } catch (error) {
      console.error('Error in getUserTemplate:', error)
      return this.getDefaultTemplate()
    }
  }

  /**
   * Get default template
   */
  static async getDefaultTemplate(): Promise<PDFTemplateData> {
    try {
      const { data, error } = await supabase
        .from('pdf_design_templates')
        .select(
          `
          id,
          name,
          category,
          pdf_design_styles (
            styles
          )
        `
        )
        .eq('is_default', true)
        .eq('status', 'published')
        .single()

      if (error || !data) {
        // Return hardcoded default if nothing in database
        return this.getHardcodedDefault()
      }

      return {
        id: data.id,
        name: data.name,
        category: data.category,
        styles: data.pdf_design_styles?.[0]?.styles || this.getHardcodedDefault().styles,
        components: [],
      }
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
      id: 'default',
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
      const { data, error } = await supabase
        .from('pdf_design_templates')
        .select(
          `
          id,
          name,
          description,
          category,
          preview_image,
          pdf_design_styles (
            styles
          )
        `
        )
        .eq('status', 'published')
        .order('name')

      if (error) throw error

      return (data || []).map(template => ({
        id: template.id,
        name: template.name,
        category: template.category,
        styles: template.pdf_design_styles?.[0]?.styles || this.getHardcodedDefault().styles,
        components: [],
      }))
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
      const { error } = await supabase.from('user_pdf_selections').upsert(
        {
          user_id: userId,
          template_id: templateId,
          offer_id: offerId || null,
        },
        {
          onConflict: offerId ? 'user_id,offer_id' : 'user_id',
        }
      )

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error saving template selection:', error)
      return false
    }
  }

  /**
   * Generate dynamic styles object for PDF rendering
   */
  static generatePDFStyles(template: PDFTemplateData) {
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
      await supabase.from('analytics_events').insert({
        user_id: userId,
        event_name: 'pdf_generated',
        properties: {
          template_id: templateId,
          offer_id: offerId,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error('Error tracking PDF generation:', error)
    }
  }
}
