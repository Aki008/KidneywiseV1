import { Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

// Get all symptom types
export async function getSymptomTypes(req: AuthRequest, res: Response): Promise<void> {
  try {
    const symptomTypes = await db('symptom_types')
      .select('*')
      .orderBy('category', 'asc')
      .orderBy('display_name', 'asc');

    const grouped = symptomTypes.reduce((acc: any, type) => {
      const category = type.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: type.symptom_type_id,
        name: type.name,
        displayName: type.display_name,
        description: type.description,
        icon: type.icon,
        requiresMedicalAttention: type.requires_medical_attention,
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        symptomTypes: grouped,
      },
    });
  } catch (error) {
    console.error('Get symptom types error:', error);
    throw new AppError(500, 'Failed to get symptom types', 'GET_SYMPTOM_TYPES_FAILED');
  }
}

// Log a symptom
export async function logSymptom(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { symptomType, severity, notes } = req.body;

    if (!symptomType || !severity) {
      throw new AppError(400, 'Symptom type and severity are required', 'INVALID_INPUT');
    }

    if (severity < 1 || severity > 10) {
      throw new AppError(400, 'Severity must be between 1 and 10', 'INVALID_SEVERITY');
    }

    const [symptom] = await db('symptoms')
      .insert({
        user_id: userId,
        symptom_type: symptomType,
        severity,
        notes: notes || null,
        logged_at: new Date(),
      })
      .returning('*');

    // Check if medical attention is needed
    const symptomTypeData = await db('symptom_types')
      .where({ name: symptomType })
      .first();

    res.status(201).json({
      success: true,
      data: {
        symptomId: symptom.symptom_id,
        symptomType: symptom.symptom_type,
        severity: symptom.severity,
        notes: symptom.notes,
        loggedAt: symptom.logged_at,
        requiresMedicalAttention:
          symptomTypeData?.requires_medical_attention && severity >= 7,
      },
      message: 'Symptom logged successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Log symptom error:', error);
    throw new AppError(500, 'Failed to log symptom', 'LOG_SYMPTOM_FAILED');
  }
}

// Get symptoms history
export async function getSymptoms(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { startDate, endDate, symptomType, limit = 50, offset = 0 } = req.query;

    let query = db('symptoms')
      .where({ user_id: userId })
      .orderBy('logged_at', 'desc')
      .limit(Number(limit))
      .offset(Number(offset));

    if (startDate) {
      query = query.where('logged_at', '>=', new Date(startDate as string));
    }

    if (endDate) {
      query = query.where('logged_at', '<=', new Date(endDate as string));
    }

    if (symptomType) {
      query = query.where('symptom_type', symptomType);
    }

    const symptoms = await query;

    // Get symptom type details
    const symptomTypes = await db('symptom_types').select('*');
    const typeMap = symptomTypes.reduce((acc: any, type) => {
      acc[type.name] = type;
      return acc;
    }, {});

    const formattedSymptoms = symptoms.map((symptom) => {
      const typeData = typeMap[symptom.symptom_type];
      return {
        symptomId: symptom.symptom_id,
        symptomType: symptom.symptom_type,
        displayName: typeData?.display_name || symptom.symptom_type,
        icon: typeData?.icon,
        severity: symptom.severity,
        notes: symptom.notes,
        loggedAt: symptom.logged_at,
        requiresMedicalAttention:
          typeData?.requires_medical_attention && symptom.severity >= 7,
      };
    });

    res.json({
      success: true,
      data: {
        symptoms: formattedSymptoms,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total: symptoms.length,
        },
      },
    });
  } catch (error) {
    console.error('Get symptoms error:', error);
    throw new AppError(500, 'Failed to get symptoms', 'GET_SYMPTOMS_FAILED');
  }
}

// Get symptom statistics
export async function getSymptomStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get symptoms in date range
    const symptoms = await db('symptoms')
      .where({ user_id: userId })
      .where('logged_at', '>=', startDate)
      .orderBy('logged_at', 'desc');

    // Calculate statistics
    const stats = {
      totalSymptoms: symptoms.length,
      averageSeverity:
        symptoms.length > 0
          ? Math.round(
              symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length
            )
          : 0,
      mostCommon: {} as Record<string, number>,
      severityDistribution: { mild: 0, moderate: 0, severe: 0 },
      requiresAttention: 0,
    };

    // Count by type
    symptoms.forEach((symptom) => {
      stats.mostCommon[symptom.symptom_type] =
        (stats.mostCommon[symptom.symptom_type] || 0) + 1;

      // Severity distribution
      if (symptom.severity <= 3) {
        stats.severityDistribution.mild++;
      } else if (symptom.severity <= 6) {
        stats.severityDistribution.moderate++;
      } else {
        stats.severityDistribution.severe++;
      }
    });

    // Get symptom types that require medical attention
    const symptomTypes = await db('symptom_types')
      .whereIn('name', Object.keys(stats.mostCommon))
      .where('requires_medical_attention', true);

    const requiresAttentionTypes = new Set(symptomTypes.map((t) => t.name));

    symptoms.forEach((symptom) => {
      if (
        requiresAttentionTypes.has(symptom.symptom_type) &&
        symptom.severity >= 7
      ) {
        stats.requiresAttention++;
      }
    });

    // Get top 5 most common
    const topSymptoms = Object.entries(stats.mostCommon)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Get display names
    const typeDetails = await db('symptom_types')
      .whereIn('name', topSymptoms.map((s) => s.name))
      .select('name', 'display_name', 'icon');

    const topSymptomsFormatted = topSymptoms.map((symptom) => {
      const detail = typeDetails.find((t) => t.name === symptom.name);
      return {
        name: symptom.name,
        displayName: detail?.display_name || symptom.name,
        icon: detail?.icon,
        count: symptom.count,
      };
    });

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        totalSymptoms: stats.totalSymptoms,
        averageSeverity: stats.averageSeverity,
        topSymptoms: topSymptomsFormatted,
        severityDistribution: stats.severityDistribution,
        requiresAttention: stats.requiresAttention,
      },
    });
  } catch (error) {
    console.error('Get symptom stats error:', error);
    throw new AppError(500, 'Failed to get symptom statistics', 'GET_STATS_FAILED');
  }
}

// Delete symptom
export async function deleteSymptom(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const symptom = await db('symptoms')
      .where({ symptom_id: id, user_id: userId })
      .first();

    if (!symptom) {
      throw new AppError(404, 'Symptom not found', 'SYMPTOM_NOT_FOUND');
    }

    await db('symptoms')
      .where({ symptom_id: id })
      .del();

    res.json({
      success: true,
      message: 'Symptom deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Delete symptom error:', error);
    throw new AppError(500, 'Failed to delete symptom', 'DELETE_SYMPTOM_FAILED');
  }
}
