// controllers/workerController.js - Artisan & Worker Management Logic
const supabase = require('../config/supabase');
const cloudinary = require('cloudinary').v2;
const { sendVerificationEmail, sendNewWorkerAlertToAdmin } = require('../utils/emailService');

// Configure Cloudinary using either individual keys or full CLOUDINARY_URL
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * GET /api/workers
 * Fetch artisans from Supabase database.
 * - By default: returns ONLY VERIFIED workers (verified: true) for customers/public.
 * - ?all=true: returns all workers (used by admin and personal profiles).
 * - ?status=pending: returns workers awaiting verification (verified: false).
 */
exports.getAllWorkers = async (req, res) => {
  try {
    const { all, status } = req.query;

    let query = supabase.from('workers').select('*');

    if (status === 'pending') {
      // Pending verification only
      query = query.eq('verified', false);
    } else if (all !== 'true') {
      // Public default: ONLY verified and non-banned artisans
      query = query.eq('verified', true).neq('banned', true);
    }

    // Try ordering by id DESC (safest on all postgres databases)
    let { data, error } = await query.order('id', { ascending: false });

    if (error) {
      console.warn('getAllWorkers order attempt warning:', error.message);
      // Fallback: simple query
      const fallback = await supabase.from('workers').select('*');
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error('Error fetching workers:', error.message);
      return res.status(500).json({ success: false, message: error.message, workers: [] });
    }

    res.json({
      success: true,
      count: data?.length || 0,
      workers: data || [],
      data: data || []
    });
  } catch (err) {
    console.error('Server error in getAllWorkers:', err.message);
    res.status(500).json({ success: false, message: 'Server error', workers: [] });
  }
};

/**
 * GET /api/workers/search
 * Filter verified and non-banned workers by skill, location, or general search term
 */
exports.searchWorkers = async (req, res) => {
  try {
    const { skill, location, q } = req.query;

    // Public search only finds VERIFIED & NON-BANNED workers
    let query = supabase.from('workers').select('*').eq('verified', true).neq('banned', true);

    if (skill) {
      query = query.ilike('skill', `%${skill}%`);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (q) {
      query = query.or(`name.ilike.%${q}%,skill.ilike.%${q}%,location.ilike.%${q}%`);
    }

    let { data, error } = await query.order('rating', { ascending: false });

    if (error) {
      console.warn('searchWorkers order warning, falling back:', error.message);
      const fallback = await query;
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error('Error searching workers:', error.message);
      return res.status(500).json({ success: false, message: error.message, workers: [] });
    }

    res.json({ success: true, count: data?.length || 0, workers: data || [], data: data || [] });
  } catch (err) {
    console.error('Server error in searchWorkers:', err.message);
    res.status(500).json({ success: false, message: 'Server error', workers: [] });
  }
};

/**
 * GET /api/workers/:id
 * Fetch single artisan profile by ID
 */
exports.getWorkerById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    res.json({ success: true, data, worker: data });
  } catch (err) {
    console.error('Server error in getWorkerById:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PUT /api/workers/:id
 * Update an artisan's profile (name, skill, phone, location, about, experience, etc.)
 */
exports.updateWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      skill,
      location,
      phone,
      about,
      experience,
      image,
      portfolio,
      available_days,
      working_hours,
      hourly_rate,
    } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (skill !== undefined) updates.skill = skill;
    if (location !== undefined) updates.location = location;
    if (phone !== undefined) updates.phone = phone;
    if (about !== undefined) updates.about = about;
    if (experience !== undefined) updates.experience = experience;
    if (image !== undefined) updates.image = image;
    if (portfolio !== undefined) updates.portfolio = portfolio;
    if (available_days !== undefined) updates.available_days = available_days;
    if (working_hours !== undefined) updates.working_hours = working_hours;
    if (hourly_rate !== undefined) updates.hourly_rate = hourly_rate;

    const { data, error } = await supabase
      .from('workers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating worker:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      worker: data,
      data,
    });
  } catch (err) {
    console.error('Server error in updateWorker:', err.message);
    res.status(500).json({ success: false, message: 'Server error while updating profile' });
  }
};

/**
 * PATCH /api/workers/:id/verify
 * Admin Portal Endpoint: Approve or reject an artisan's account
 */
exports.verifyWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved = true } = req.body;

    if (approved) {
      // Mark as verified
      const { data, error } = await supabase
        .from('workers')
        .update({ verified: true })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error approving worker:', error.message);
        return res.status(500).json({ success: false, message: error.message });
      }

      // Lookup artisan's email address to send congratulatory notification
      try {
        let recipientEmail = data.email || null;

        if (!recipientEmail && data.user_id) {
          const { data: userRecord } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', data.user_id)
            .maybeSingle();
          if (userRecord && userRecord.email) {
            recipientEmail = userRecord.email;
          }
        }

        // Secondary lookup by phone or name in users table if user_id wasn't set
        if (!recipientEmail && (data.phone || data.name)) {
          let userQuery = supabase.from('users').select('email, full_name');
          if (data.phone) {
            userQuery = userQuery.eq('phone', data.phone);
          } else {
            userQuery = userQuery.ilike('full_name', `%${data.name}%`);
          }
          const { data: matchedUser } = await userQuery.maybeSingle();
          if (matchedUser && matchedUser.email) {
            recipientEmail = matchedUser.email;
          }
        }

        if (recipientEmail) {
          // Asynchronously dispatch email notification
          sendVerificationEmail({
            to: recipientEmail,
            workerName: data.name,
            skill: data.skill,
            location: data.location,
          }).catch((mailErr) => {
            console.warn('[verifyWorker] Email dispatch warning:', mailErr.message);
          });
        } else {
          console.log(`[verifyWorker] No email address linked to worker #${data.id} (${data.name}).`);
        }
      } catch (emailLookupErr) {
        console.warn('[verifyWorker] Email lookup notice:', emailLookupErr.message);
      }

      return res.json({
        success: true,
        message: `${data.name} has been approved and is now publicly visible!`,
        worker: data,
      });
    } else {
      // Admin rejected: delete the worker profile from the database
      const { error } = await supabase
        .from('workers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error rejecting worker:', error.message);
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.json({
        success: true,
        message: 'Worker application has been rejected and removed.',
      });
    }
  } catch (err) {
    console.error('Server error in verifyWorker:', err.message);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
};

/**
 * POST /api/workers/upload
 * Upload artisan photo to Cloudinary
 */
exports.uploadImage = async (req, res) => {
  try {
    const { imageBase64, fileName = 'worker-photo' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided. Please choose a file.'
      });
    }

    const hasCloudName = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'Root';
    const hasCloudUrl = !!process.env.CLOUDINARY_URL;

    if (!hasCloudUrl && !hasCloudName) {
      console.error('Cloudinary credentials missing or invalid in server/.env');
      return res.status(500).json({
        success: false,
        message: 'Image upload is not configured. Please ensure your Cloud Name is set correctly in server/.env'
      });
    }

    const uploadResult = await cloudinary.uploader.upload(imageBase64, {
      folder: 'workconnect/workers',
      public_id: `worker-${Date.now()}`,
      resource_type: 'image',
      overwrite: true,
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    res.json({
      success: true,
      message: 'Photo uploaded successfully!',
      imageUrl: uploadResult.secure_url
    });

  } catch (err) {
    console.error('Cloudinary upload error:', err.message);
    res.status(500).json({
      success: false,
      message: `Image upload failed: ${err.message}`
    });
  }
};

/**
 * POST /api/workers
 * Add a new artisan / worker profile to Supabase database.
 * Default status is verified: false (PENDING ADMIN APPROVAL).
 */
exports.createWorker = async (req, res) => {
  try {
    const {
      user_id = null,
      name,
      skill,
      location,
      phone,
      email = null,
      rating = 5.0,
      reviews = 0,
      image = '',
      portfolio = [],
      verified = false, // <-- PENDING by default unless explicitly verified by admin
      about = '',
      experience = '1+ years',
      hourly_rate = 'Negotiable',
      available_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      working_hours = '08:00 - 18:00'
    } = req.body;

    if (!name || !skill || !location) {
      return res.status(400).json({
        success: false,
        message: 'Name, skill, and location are required.'
      });
    }

    if (user_id) {
      const { data: existingProfile } = await supabase
        .from('workers')
        .select('*')
        .eq('user_id', user_id)
        .maybeSingle();

      if (existingProfile) {
        return res.status(200).json({
          success: true,
          message: 'Worker profile already exists.',
          worker: existingProfile,
          data: existingProfile
        });
      }
    }

    const insertPayload = {
      user_id,
      name,
      skill,
      location,
      phone,
      email,
      rating,
      reviews,
      image,
      portfolio,
      verified: Boolean(verified),
      about,
      experience,
      hourly_rate,
      available_days,
      working_hours
    };

    const { data, error } = await supabase
      .from('workers')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('Error creating worker:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }

    // Always notify admin whenever a new artisan profile is created (pending or verified)
    let notificationEmail = email || data.email || null;
    if (!notificationEmail && user_id) {
      const { data: userRecord } = await supabase
        .from('users')
        .select('email')
        .eq('id', user_id)
        .maybeSingle();
      notificationEmail = userRecord?.email || null;
    }

    sendNewWorkerAlertToAdmin({
      workerName: data.name,
      skill: data.skill,
      location: data.location,
      phone: data.phone || null,
      email: notificationEmail,
    }).catch((err) => console.warn('[createWorker] Admin alert email failed:', err.message));

    // If worker was created with immediate verification and has an email, dispatch alert
    if (data.verified && (email || user_id)) {
      const recipient = email || (await (async () => {
        if (!user_id) return null;
        const { data: u } = await supabase.from('users').select('email').eq('id', user_id).maybeSingle();
        return u?.email || null;
      })());

      if (recipient) {
        sendVerificationEmail({
          to: recipient,
          workerName: data.name,
          skill: data.skill,
          location: data.location,
        }).catch((err) => console.warn('[createWorker] Email notice:', err.message));
      }
    }

    res.status(201).json({
      success: true,
      message: data.verified
        ? 'Worker profile created and verified successfully!'
        : 'Worker profile created successfully. Awaiting admin verification.',
      worker: data,
      data
    });
  } catch (err) {
    console.error('Server error in createWorker:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/workers/:id/reviews
 * Fetch all customer reviews for a worker
 */
exports.getWorkerReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('worker_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Reviews fetch notice:', error.message);
      return res.json({ success: true, reviews: [] });
    }

    res.json({ success: true, reviews: data || [] });
  } catch (err) {
    console.error('Server error in getWorkerReviews:', err.message);
    res.json({ success: true, reviews: [] });
  }
};

/**
 * POST /api/workers/:id/reviews
 * Customer adds a review with rating (1-5) and comment
 */
exports.createReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_name = 'Anonymous Customer', rating = 5, comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Please write a review comment.' });
    }

    const numRating = Math.max(1, Math.min(5, Number(rating) || 5));

    const { data: newReview, error: reviewError } = await supabase
      .from('reviews')
      .insert([
        {
          worker_id: id,
          user_name: user_name.trim(),
          rating: numRating,
          comment: comment.trim(),
        }
      ])
      .select()
      .single();

    if (reviewError) {
      console.error('Error inserting review:', reviewError.message);
      return res.status(500).json({
        success: false,
        message: `Could not save review: ${reviewError.message}`
      });
    }

    // Recalculate worker's average rating and total review count
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('worker_id', id);

    if (allReviews && allReviews.length > 0) {
      const avg = (
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      ).toFixed(1);

      await supabase
        .from('workers')
        .update({ rating: parseFloat(avg), reviews: allReviews.length })
        .eq('id', id);
    }

    res.status(201).json({
      success: true,
      message: 'Review posted successfully!',
      review: newReview,
    });
  } catch (err) {
    console.error('Server error in createReview:', err.message);
    res.status(500).json({ success: false, message: 'Server error while submitting review' });
  }
};

/**
 * PATCH /api/workers/:id/ban
 * Admin bans or unbans an artisan
 */
exports.banWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { banned = true } = req.body;

    const { data, error } = await supabase
      .from('workers')
      .update({ banned: Boolean(banned) })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling ban on worker:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({
      success: true,
      message: banned
        ? `Worker ${data.name} has been banned and delisted from public search.`
        : `Worker ${data.name} has been unbanned.`,
      worker: data,
    });
  } catch (err) {
    console.error('Server error in banWorker:', err.message);
    res.status(500).json({ success: false, message: 'Server error updating worker ban status' });
  }
};
