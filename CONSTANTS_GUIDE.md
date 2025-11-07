# دليل استخدام ملف الثوابت - مركز المستقبل التعليمي

## نظرة عامة
ملف `constants.ts` هو الملف المركزي الذي يحتوي على جميع معلومات المركز التعليمي. يمكنك تغيير أي معلومات من هذا الملف وسيتم تطبيق التغييرات تلقائياً في جميع أنحاء التطبيق.

## كيفية تغيير اسم المركز

### 1. تغيير الاسم الكامل
```typescript
// في ملف constants.ts
export const CENTER_CONSTANTS = {
  name: "مركز المستقبل التعليمي", // غير هذا الاسم
  nameEn: "Future Educational Center", // غير الاسم بالإنجليزية
  // ...
};
```

### 2. تغيير الاسم المختصر
```typescript
shortName: "مركز المستقبل", // غير هذا الاسم
shortNameEn: "Future Center", // غير الاسم المختصر بالإنجليزية
```

## كيفية تغيير معلومات الاتصال

```typescript
contact: {
  phone: "01024911062", // رقم الهاتف
  whatsapp: "201024911062", // رقم الواتساب
  email: "info@future-center.edu.eg", // البريد الإلكتروني
  website: "https://future-center.edu.eg", // الموقع الإلكتروني
  facebook: "https://facebook.com/futurecenter", // صفحة الفيسبوك
  instagram: "https://instagram.com/futurecenter", // صفحة الإنستغرام
  youtube: "https://youtube.com/futurecenter" // قناة اليوتيوب
},
```

## كيفية تغيير العنوان والموقع

```typescript
location: {
  address: "شارع النصر، مدينة نصر، القاهرة الجديدة", // العنوان الكامل
  city: "القاهرة الجديدة", // المدينة
  governorate: "القاهرة", // المحافظة
  country: "مصر", // الدولة
  coordinates: {
    lat: 30.0444, // خط العرض
    lng: 31.2357  // خط الطول
  },
  googleMapsUrl: "https://maps.google.com/?q=30.0444,31.2357", // رابط جوجل مابس
  directions: "بجوار مسجد النصر، خلف مول سيتي سنتر" // توجيهات الوصول
},
```

## كيفية تغيير الألوان

```typescript
colors: {
  primary: "#2563eb", // اللون الأساسي (أزرق)
  secondary: "#059669", // اللون الثانوي (أخضر)
  accent: "#7c3aed", // اللون المميز (بنفسجي)
  warning: "#dc2626", // لون التحذير (أحمر)
  success: "#16a34a", // لون النجاح (أخضر فاتح)
  info: "#0891b2", // لون المعلومات (أزرق فاتح)
  // ...
},
```

## كيفية تغيير الإحصائيات

```typescript
stats: {
  students: "500+", // عدد الطلاب
  teachers: "25+", // عدد المدرسين
  successRate: "95%", // معدل النجاح
  yearsOfExcellence: "3+", // سنوات التميز
  subjects: "15+", // عدد المواد
  certificates: "1000+" // عدد الشهادات
},
```

## كيفية تغيير ساعات العمل

```typescript
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
```

## كيفية تغيير كلمة مرور الإدارة

```typescript
admin: {
  password: "admin123", // كلمة المرور
  username: "admin", // اسم المستخدم
  email: "admin@future-center.edu.eg" // بريد الإدارة
},
```

## كيفية تغيير رسائل النظام

```typescript
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
```

## الدوال المساعدة

### الحصول على الاسم الكامل
```typescript
import { getFullName } from './constants';
const centerName = getFullName(); // "مركز المستقبل التعليمي"
```

### الحصول على الاسم المختصر
```typescript
import { getShortName } from './constants';
const shortName = getShortName(); // "مركز المستقبل"
```

### الحصول على معلومات الاتصال
```typescript
import { getContactInfo } from './constants';
const contact = getContactInfo();
console.log(contact.phone); // "01024911062"
```

### الحصول على الإحصائيات
```typescript
import { getStats } from './constants';
const stats = getStats();
console.log(stats.students); // "500+"
```

### التحقق من كلمة مرور الإدارة
```typescript
import { checkAdminPassword } from './constants';
const isValid = checkAdminPassword("admin123"); // true
```

### الحصول على رسائل النظام
```typescript
import { getMessages } from './constants';
const messages = getMessages();
console.log(messages.welcome); // "مرحباً بك في مركز المستقبل التعليمي"
```

## أمثلة على الاستخدام في الملفات

### في ملف React Component
```typescript
import CENTER_CONSTANTS, { getFullName, getStats } from '../../constants';

const MyComponent = () => {
  return (
    <div>
      <h1>{getFullName()}</h1>
      <p>عدد الطلاب: {getStats().students}</p>
      <p>الهاتف: {CENTER_CONSTANTS.contact.phone}</p>
    </div>
  );
};
```

### في ملف API
```typescript
import { getAdminInfo } from '../../constants';

const adminInfo = getAdminInfo();
console.log(adminInfo.password); // "admin123"
```

## ملاحظات مهمة

1. **احفظ الملف بعد التغيير**: تأكد من حفظ ملف `constants.ts` بعد إجراء أي تغييرات.

2. **أعد تشغيل التطبيق**: في بعض الحالات، قد تحتاج إلى إعادة تشغيل التطبيق لرؤية التغييرات.

3. **تحقق من الأخطاء**: تأكد من عدم وجود أخطاء في الكود بعد التغيير.

4. **اختبار التغييرات**: اختبر التطبيق للتأكد من أن جميع التغييرات تعمل بشكل صحيح.

## استكشاف الأخطاء

### إذا لم تظهر التغييرات:
1. تأكد من حفظ الملف
2. أعد تشغيل التطبيق
3. امسح ذاكرة التخزين المؤقت للمتصفح
4. تحقق من وجود أخطاء في وحدة التحكم

### إذا ظهرت أخطاء:
1. تحقق من صحة الكود في ملف `constants.ts`
2. تأكد من استخدام الدوال الصحيحة
3. تحقق من استيراد الثوابت بشكل صحيح

## الدعم

إذا واجهت أي مشاكل أو لديك أسئلة حول استخدام ملف الثوابت، يمكنك التواصل مع فريق التطوير. 