import { wrapper } from '../utils/wrapper.js';
import { Counselor } from '../models/counselor-model.js';
import { Price } from '../models/price-model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const getPriceConstraints = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  console.log('yoyo');

  // Get counselor's experience level
  const counselorData = await Counselor.findById(counselorId).select('-password');
  if (!counselorData) {
    throw new ApiError(404, 'Counselor not found. Please login again');
  }

  console.log(counselorData);
  counselorData.toObject();
  console.log(counselorData.experienceLevel);

  // Get price constraints based on experience level
  const priceData = await Price.findOne({
    experienceLevel: counselorData.experienceLevel,
  });
  console.log(priceData);

  if (!priceData) {
    throw new ApiError(
      404,
      `No pricing information found for ${counselorData.experienceLevel} level`
    );
  }

  const { minPrice, maxPrice } = priceData;

  if (!minPrice || !maxPrice) {
    throw new ApiError(400, 'Incomplete pricing data found');
  }

  // Using ApiResponse class
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        minPrice,
        maxPrice,
        experienceLevel: counselorData.experienceLevel,
      },
      'Price constraints fetched successfully'
    )
  );
});

export { getPriceConstraints };
