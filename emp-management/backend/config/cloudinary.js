
// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const multer = require('multer');

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
// // console.log("CLOUDINARY CONFIG 👉", {
// //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// //   api_key: process.env.CLOUDINARY_API_KEY ? "OK" : "MISSING",
// //   api_secret: process.env.CLOUDINARY_API_SECRET ? "OK" : "MISSING"
// // });


// const cloudStorage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     let folder = 'hrms/misc';

//     if (file.fieldname === 'resume') folder = 'hrms/resumes';
//     else if (file.fieldname === 'offerLetter') folder = 'hrms/offer-letters';
//     else if (file.fieldname === 'documents') folder = 'hrms/onboarding-docs';
//     else if (file.fieldname === 'payslip') folder = 'hrms/payslips';

//     return {
//       folder,
//       resource_type: 'auto',

//       timeout: 120000, // 🔥🔥🔥 MAIN FIX (VERY IMPORTANT)

//       allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'],

//       public_id: `${Date.now()}-${file.originalname
//         .replace(/\s+/g, '-')
//         .replace(/[^a-zA-Z0-9.-]/g, '')}`,
//     };
//   },
// });

// const cloudUpload = multer({
//   storage: cloudStorage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
//   fileFilter: (req, file, cb) => {
//     const allowed = [
//       'application/pdf',
//       'application/msword',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       'image/jpeg',
//       'image/jpg',
//       'image/png',
//       'image/webp'
//     ];

//     if (allowed.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('File type not supported'), false);
//     }
//   },
// });

// module.exports = { cloudinary, cloudUpload };














// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const multer = require('multer');

// // 🔥 Cloudinary Config
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // 🔥 Storage Config
// const cloudStorage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     let folder = 'hrms/misc';

//     if (file.fieldname === 'resume') folder = 'hrms/resumes';
//     else if (file.fieldname === 'offerLetter') folder = 'hrms/offer-letters';
//     else if (file.fieldname === 'documents') folder = 'hrms/onboarding-docs';
//     else if (file.fieldname === 'payslip') folder = 'hrms/payslips';

//     return {
//       folder,
//       resource_type: 'auto', // 🔥 auto detect (image/pdf/doc)
      
//       allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'],

//       public_id: `${Date.now()}-${file.originalname
//         .replace(/\s+/g, '-')
//         .replace(/[^a-zA-Z0-9.-]/g, '')}`,
//     };
//   },
// });

// // 🔥 Multer Upload Config
// const cloudUpload = multer({
//   storage: cloudStorage,

//   limits: {
//     fileSize: 5 * 1024 * 1024, // ✅ 5MB (safe & fast)
//   },

//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       'application/pdf',
//       'application/msword',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       'image/jpeg',
//       'image/jpg',
//       'image/png',
//       'image/webp',
//     ];

//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       console.log("❌ Invalid file type:", file.mimetype);
//       return cb(new Error('File type not supported'), false);
//     }
//   },
// });

// module.exports = { cloudinary, cloudUpload };




// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const multer = require('multer');

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const cloudStorage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     let folder = 'hrms/misc';
//     if (file.fieldname === 'resume') folder = 'hrms/resumes';
//     else if (file.fieldname === 'offerLetter') folder = 'hrms/offer-letters';
//     else if (file.fieldname === 'documents') folder = 'hrms/onboarding-docs';
//     else if (file.fieldname === 'payslip') folder = 'hrms/payslips';

//     return {
//       folder,
//       resource_type: 'auto',
//       allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'],
//       public_id: `${Date.now()}-${file.originalname
//         .replace(/\s+/g, '-')
//         .replace(/[^a-zA-Z0-9.-]/g, '')}`,
//     };
//   },
// });

// // const cloudUpload = multer({
// //   storage: cloudStorage,
// //   limits: { fileSize: 5 * 1024 * 1024 },
// //   fileFilter: (req, file, cb) => {
// //     const allowedTypes = [
// //       'application/pdf',
// //       'application/msword',
// //       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// //       'image/jpeg',
// //       'image/jpg',
// //       'image/png',
// //       'image/webp',
// //     ];
// //     if (allowedTypes.includes(file.mimetype)) {
// //       cb(null, true);
// //     } else {
// //       console.log('❌ Invalid file type:', file.mimetype);
// //       return cb(new Error('File type not supported'), false);
// //     }
// //   },
// // });
// const cloudUpload = multer({
//   storage: cloudStorage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       'application/pdf',
//       'application/msword',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       'image/jpeg',
//       'image/jpg',
//       'image/png',
//       'image/webp',
//     ];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       return cb(new Error('File type not supported'), false);
//     }
//   },
// });

// module.exports = { cloudinary, cloudUpload };


const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// console.log("CLOUDINARY CONFIG:");
// console.log("cloud_name:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("api_key:", process.env.CLOUDINARY_API_KEY);
// console.log("api_secret:", process.env.CLOUDINARY_API_SECRET ? "✅ Loaded" : "❌ Missing");


const cloudStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'hrms/misc';
    if (file.fieldname === 'resume') folder = 'hrms/resumes';
    else if (file.fieldname === 'offerLetter') folder = 'hrms/offer-letters';
    else if (file.fieldname === 'documents') folder = 'hrms/onboarding-docs';
    else if (file.fieldname === 'payslip') folder = 'hrms/payslips';
    return {
      folder,
      resource_type: 'auto',
      allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'],
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '')}`,
    };
  },
});

const cloudUpload = multer({
  storage: cloudStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('File type not supported'), false);
  },
});

module.exports = { cloudinary, cloudUpload };