export const API_ENDPOINTS = {
  USER: {
    LOGIN: "/user/login",
    REGISTER: "/user/register",
    REGISTER_BRAND: "/user/registerBrand",
    PROFILE: "/user/profile",
    EDIT_PROFILE: "/user/editProfile",
    UPDATE_PROFILE: "/user/updateProfile",
    LOGOUT: "/user/logout",
    PORTFOLIO: "/user/portfolio",
    CREATORS_LIST: "/user/creators",
    CREATOR_DETAILS: "/user/creators/", // Will append ID to this
    CREATOR_BY_ID: "/user/creator/", // Singlular for contact details
    WALLET: "/wallet",
    TRANSACTIONS: "/transactions",
    WALLET_ADD: "/wallet/add",
    WALLET_REMOVE: "/wallet/remove",
    KYC: "/kyc",
    REQUEST_PAN_KYC: "/user/requestPanKyc",
    REQUEST_AADHAAR_KYC: "/user/requestAadhaarKyc",
    REQUEST_BANK_KYC: "/user/requestBankKyc",
    REQUEST_EMAIL_VERIFY: "/user/requestEmailVerify",
    VERIFY_EMAIL_OTP: "/user/verifyEmailOtp",
    REQUEST_MOBILE_VERIFY: "/user/requestMobileVerify",
    VERIFY_MOBILE_OTP: "/user/verifyMobileOtp",
    DASHBOARD: "/user/creator/dashboard",
    CHECK_EMAIL: "/user/check-email",
    RE_REQUEST_APPROVAL: "/user/request-approval",
  },
  PLATFORM: {
    LIST: "/platform",
  },
  SERVICE: {
    LIST: "/services", // This will be used as /service/[platformId]
  },
  CATEGORY: {
    LIST: "/category",
  },
  SOCIAL_ACCOUNTS: {
    LIST: "/social-accounts",
  },
  TESTIMONIAL: {
    LIST: "/testimonial/list",
  },
  CMS: "/cms",
  BLOG: "/blogs",
  CART: "/cart",
  FAVORITES: {
    LIST: "/favorites/lists",
    CREATE: "/favorites/lists",
    IN_LIST: "/favorites/in-list/", // GET specific list creators
    ADD_TO_LIST: "/favorites/add", 
    DELETE_LIST: "/favorites/lists/", // Will append ID
    EDIT_LIST: "/favorites/lists/", // Will append ID
    REMOVE_FROM_LIST: "/favorites/remove",
  },
  ORDER: {
    PLACE: "/order/place",
    LIST: "/order/list",
    UPDATE_STATUS: "/order/status",
    REVIEW: "/order/review",
    DELIVER: "/order/deliver",
  },
  SUBSCRIPTION: {
    PURCHASE: "/subscription/purchase",
  },
  PLANS: "/plans",
  REVIEWS: {
    ADD: "/reviews/add",
    EDIT: "/reviews/", // Will append reviewId
    DELETE: "/reviews/", // Will append reviewId
    GET_BY_CREATOR: "/reviews/creator/", // Will append creatorId
  },
  SUPPORT: {
    CREATE: "/support",
  },
  FOOTER_LINKS: {
    LIST: "/footer-links/list",
  },
  LEADS: {
    SUBSCRIBE: "/leads/subscribe",
  },
  // Add more endpoints here as needed
};
