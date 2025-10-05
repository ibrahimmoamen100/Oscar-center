// ثوابت المركز التعليمي - ملف مركزي لجميع معلومات المركز
export const CENTER_CONSTANTS = {
  // ===== معلومات المركز الأساسية =====
  name: "مركز اوسكار التعليمي",
  nameEn: "Future Educational Center",
  shortName: "مركز المستقبل",
  shortNameEn: "Future Center",
  
  // ===== معلومات الاتصال =====
  contact: {
    phone: "01024911062",
    whatsapp: "201024911062",
    email: "info@future-center.edu.eg",
    website: "https://future-center.edu.eg",
    facebook: "https://facebook.com/futurecenter",
    instagram: "https://instagram.com/futurecenter",
    youtube: "https://youtube.com/futurecenter"
  },
  
  // ===== العنوان والموقع =====
  location: {
    address: "شارع النصر، مدينة نصر، القاهرة الجديدة",
    city: "القاهرة الجديدة",
    governorate: "القاهرة",
    country: "مصر",
    coordinates: {
      lat: 30.0444,
      lng: 31.2357
    },
    googleMapsUrl: "https://maps.google.com/?q=30.0444,31.2357",
    directions: "بجوار مسجد النصر، خلف مول سيتي سنتر"
  },
  
  // ===== الألوان الرئيسية للمركز =====
  colors: {
    primary: "#36a988", // أخضر زمردي أساسي
    secondary: "#059669", // أخضر
    accent: "#7c3aed", // بنفسجي
    warning: "#dc2626", // أحمر
    success: "#16a34a", // أخضر فاتح
    info: "#0891b2", // أزرق فاتح
    light: "#f8fafc", // رمادي فاتح
    dark: "#1e293b", // رمادي داكن
    gradient: {
      primary: "from-blue-600 to-green-600",
      secondary: "from-purple-600 to-pink-600",
      accent: "from-indigo-600 to-purple-600"
    }
  },
  
  // ===== معلومات إضافية =====
  info: {
    description: "مركز تعليمي متخصص في تدريس جميع المواد الدراسية للمراحل الإعدادية والثانوية",
    longDescription: "نحن نؤمن بأن التعليم هو مفتاح المستقبل. انضم إلينا في رحلة التميز الأكاديمي حيث نقدم تعليماً عالي الجودة مع نظام تشجيعي متطور",
    vision: "أن نكون المركز التعليمي الرائد في المنطقة",
    mission: "تقديم تعليم متميز يساعد الطلاب على تحقيق أحلامهم",
    founded: "2021",
    license: "رقم الترخيص: 12345/2021",
    taxNumber: "123456789"
  },
  
  // ===== ساعات العمل =====
  workingHours: {
    weekdays: {
      days: "من الأحد إلى الخميس",
      time: "9:00 ص - 9:00 م",
      fullText: "من الأحد إلى الخميس: 9:00 ص - 9:00 م"
    },
    weekends: {
      days: "الجمعة والسبت",
      time: "10:00 ص - 6:00 م",
      fullText: "الجمعة والسبت: 10:00 ص - 6:00 م"
    },
    holidays: "مغلق في الأعياد الرسمية"
  },
  
  // ===== الإحصائيات =====
  stats: {
    students: "500+",
    teachers: "25+",
    successRate: "95%",
    yearsOfExcellence: "3+",
    subjects: "15+",
    certificates: "1000+"
  },
  
  // ===== كلمة سر الإدارة =====
  admin: {
    password: "admin123",
    username: "admin",
    email: "admin@future-center.edu.eg"
  },
  
  // ===== إعدادات التطبيق =====
  appSettings: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    supportedImageTypes: ["image/jpeg", "image/png", "image/webp"],
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 ساعة
    maxStudentsPerClass: 15,
    maxTeachersPerSubject: 3,
    defaultPoints: 100,
    pointsPerSession: 10,
    pointsPerAchievement: 50
  },
  
  // ===== رسائل النظام =====
  messages: {
    welcome: "مرحباً بك في مركز المستقبل التعليمي",
    loginSuccess: "تم تسجيل الدخول بنجاح",
    loginError: "خطأ في تسجيل الدخول",
    adminLoginSuccess: "تم تسجيل الدخول للإدارة بنجاح",
    adminLoginError: "كلمة المرور غير صحيحة",
    logoutSuccess: "تم تسجيل الخروج بنجاح",
    dataLoadError: "حدث خطأ في تحميل البيانات",
    saveSuccess: "تم الحفظ بنجاح",
    deleteSuccess: "تم الحذف بنجاح",
    updateSuccess: "تم التحديث بنجاح"
  },
  
  // ===== روابط مفيدة =====
  links: {
    studentPortal: "/login",
    adminPortal: "/admin",
    contactUs: "/contact",
    aboutUs: "/about",
    subjects: "/subjects",
    teachers: "/teachers",
    schedule: "/schedule"
  }
};

// ===== دوال مساعدة =====

// دالة للحصول على الاسم الكامل
export const getFullName = () => CENTER_CONSTANTS.name;

// دالة للحصول على الاسم المختصر
export const getShortName = () => CENTER_CONSTANTS.shortName;

// دالة للحصول على معلومات الاتصال
export const getContactInfo = () => CENTER_CONSTANTS.contact;

// دالة للحصول على العنوان الكامل
export const getFullAddress = () => CENTER_CONSTANTS.location.address;

// دالة للحصول على ساعات العمل
export const getWorkingHours = () => CENTER_CONSTANTS.workingHours;

// دالة للحصول على الإحصائيات
export const getStats = () => CENTER_CONSTANTS.stats;

// دالة للحصول على الألوان
export const getColors = () => CENTER_CONSTANTS.colors;

// دالة للحصول على رسائل النظام
export const getMessages = () => CENTER_CONSTANTS.messages;

// دالة للتحقق من كلمة مرور الإدارة
export const checkAdminPassword = (password: string) => {
  return password === CENTER_CONSTANTS.admin.password;
};

// دالة للحصول على معلومات الإدارة
export const getAdminInfo = () => CENTER_CONSTANTS.admin;

// دالة للحصول على إعدادات التطبيق
export const getAppSettings = () => CENTER_CONSTANTS.appSettings;

// تصدير الثوابت للاستخدام في التطبيق
export default CENTER_CONSTANTS; 