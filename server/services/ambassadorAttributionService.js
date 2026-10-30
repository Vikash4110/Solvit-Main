// services/ambassadorAttributionService.js
import CampusAmbassador from '../models/campusAmbassador-model.js';
import AmbassadorAttribution from '../models/ambassadorAttribution-model.js';

/**
 * Service to manage frictionless attribution linking between clients and Campus Ambassadors.
 */
class AmbassadorAttributionService {
  /**
   * Resolve an ambassador by code or tracking slug.
   * Only returns ambassador if status is 'active'.
   * @param {string} codeOrSlug
   * @returns {Promise<Object|null>}
   */
  async resolveActiveAmbassador(codeOrSlug) {
    if (!codeOrSlug || typeof codeOrSlug !== 'string') return null;

    const trimmed = codeOrSlug.trim();
    if (trimmed.length < 3) return null;

    const ambassador = await CampusAmbassador.findOne({
      $or: [
        { referralCode: trimmed.toUpperCase() },
        { trackingSlug: trimmed.toLowerCase() },
      ],
      status: 'active',
    }).select('_id fullName referralCode status metrics');

    return ambassador;
  }

  /**
   * Attribute a client to a campus ambassador if not already attributed.
   * Guarantees 1 client = max 1 ambassador.
   * Safe to call multiple times (idempotent).
   *
   * @param {string|ObjectId} clientId
   * @param {string} codeOrSlug
   * @param {string} source - 'link_click' | 'signup_ref' | 'booking_ref'
   * @returns {Promise<{ success: boolean, attribution?: Object, message?: string }>}
   */
  async attributeClient(clientId, codeOrSlug, source = 'link_click') {
    if (!clientId || !codeOrSlug) {
      return { success: false, message: 'Client ID and referral code are required.' };
    }

    try {
      // 1. Check if client is already attributed to any ambassador
      const existingAttribution = await AmbassadorAttribution.findOne({ clientId });
      if (existingAttribution) {
        return {
          success: true,
          attribution: existingAttribution,
          message: 'Client is already attributed to an ambassador.',
          alreadyAttributed: true,
        };
      }

      // 2. Resolve active ambassador
      const ambassador = await this.resolveActiveAmbassador(codeOrSlug);
      if (!ambassador) {
        return {
          success: false,
          message: 'Ambassador code or link is invalid or inactive.',
        };
      }

      // 3. Create attribution record
      const attribution = await AmbassadorAttribution.create({
        ambassadorId: ambassador._id,
        clientId,
        attributionSource: source,
        attributedAt: new Date(),
        firstSessionDate: null,
        eligibilityEndsAt: null,
        isWindowActive: false,
      });

      // 4. Atomically increment ambassador attributed clients counter
      await CampusAmbassador.findByIdAndUpdate(ambassador._id, {
        $inc: { 'metrics.totalAttributedClients': 1 },
      });

      return {
        success: true,
        attribution,
        ambassador: {
          id: ambassador._id,
          fullName: ambassador.fullName,
          code: ambassador.referralCode,
        },
        message: 'Client successfully attributed to ambassador.',
      };
    } catch (err) {
      // Handle race condition where another concurrent call already attributed this client
      if (err.code === 11000) {
        const existing = await AmbassadorAttribution.findOne({ clientId });
        return {
          success: true,
          attribution: existing,
          alreadyAttributed: true,
        };
      }
      throw err;
    }
  }

  /**
   * Retrieve attribution details for a client.
   * @param {string|ObjectId} clientId
   * @returns {Promise<Object|null>}
   */
  async getClientAttribution(clientId) {
    if (!clientId) return null;
    return AmbassadorAttribution.findOne({ clientId })
      .populate('ambassadorId', 'fullName referralCode collegeName')
      .lean();
  }
}

export const ambassadorAttributionService = new AmbassadorAttributionService();
export default ambassadorAttributionService;
