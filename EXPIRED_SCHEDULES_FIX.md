# إصلاح مشكلة عدم إخفاء المواعيد المنتهية من التقويم

## المشكلة
كانت المواعيد المنتهية لا تختفي من التقويم وتظل ظاهرة باللون الرمادي، حتى بعد انتهاء تاريخ انتهائها (مثل الموعد الذي ينتهي في 2025-10-16).

## سبب المشكلة
1. **استخدام تاريخ افتراضي**: دالة `isScheduleExpired` كانت تستخدم تاريخ افتراضي `2025-08-01` للاختبار بدلاً من التاريخ الحالي الفعلي
2. **عرض المواعيد المنتهية**: التقويم كان يعرض المواعيد المنتهية باللون الرمادي بدلاً من إخفائها

## الحل المطبق

### 1. تحديث دالة `isScheduleExpired`

**قبل التحديث:**
```javascript
// استخدام تاريخ افتراضي للاختبار
const manualDate = '2025-08-01';

if (schedule.scheduleType === 'single') {
  const isExpired = schedule.startDate < manualDate;
  return isExpired;
} else if (schedule.scheduleType === 'weekly' && schedule.endDate) {
  const hasStarted = schedule.startDate <= manualDate;
  const hasEnded = schedule.endDate < manualDate;
  const isExpired = hasStarted && hasEnded;
  return isExpired;
}
```

**بعد التحديث:**
```javascript
// استخدام التاريخ الحالي الفعلي
const currentDate = todayString;

if (schedule.scheduleType === 'single') {
  const isExpired = schedule.startDate < currentDate;
  return isExpired;
} else if (schedule.scheduleType === 'weekly' && schedule.endDate) {
  const hasStarted = schedule.startDate <= currentDate;
  const hasEnded = schedule.endDate < currentDate;
  const isExpired = hasStarted && hasEnded;
  return isExpired;
}
```

### 2. تحديث منطق التقويم لإخفاء المواعيد المنتهية

**قبل التحديث:**
```javascript
// إظهار المواعيد المنتهية باللون الرمادي
if (isExpired) {
  console.log(`Showing expired schedule ${schedule.id} with endDate: ${schedule.endDate} in gray`);
}

const backgroundColor = isExpired ? '#6b7280' : (schedule.scheduleType === 'weekly' ? '#10b981' : '#f59e0b');
const borderColor = isExpired ? '#4b5563' : (schedule.scheduleType === 'weekly' ? '#059669' : '#d97706');
```

**بعد التحديث:**
```javascript
// إخفاء المواعيد المنتهية تماماً
if (isExpired) {
  console.log(`Hiding expired schedule ${schedule.id} with endDate: ${schedule.endDate}`);
  return [];
}

const backgroundColor = schedule.scheduleType === 'weekly' ? '#10b981' : '#f59e0b';
const borderColor = schedule.scheduleType === 'weekly' ? '#059669' : '#d97706';
```

### 3. تحديث `eventDidMount`

**قبل التحديث:**
```javascript
if (expired) {
  // مواعيد منتهية - رمادي
  info.el.style.backgroundColor = '#6b7280';
  info.el.style.borderColor = '#4b5563';
} else if (type === 'weekly') {
  // مواعيد أسبوعية - أخضر
  info.el.style.backgroundColor = '#10b981';
  info.el.style.borderColor = '#059669';
} else {
  // مواعيد منفردة - برتقالي
  info.el.style.backgroundColor = '#f59e0b';
  info.el.style.borderColor = '#d97706';
}
```

**بعد التحديث:**
```javascript
if (type === 'weekly') {
  // مواعيد أسبوعية - أخضر
  info.el.style.backgroundColor = '#10b981';
  info.el.style.borderColor = '#059669';
} else {
  // مواعيد منفردة - برتقالي
  info.el.style.backgroundColor = '#f59e0b';
  info.el.style.borderColor = '#d97706';
}
```

### 4. تحديث مفتاح الألوان

**قبل التحديث:**
```html
<div className="flex items-center">
  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
  <span className="text-sm">مواعيد أسبوعية نشطة</span>
</div>
<div className="flex items-center">
  <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
  <span className="text-sm">مواعيد منفردة نشطة</span>
</div>
<div className="flex items-center text-gray-500">
  <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
  <span className="text-sm">مواعيد منتهية الصلاحية</span>
</div>
```

**بعد التحديث:**
```html
<div className="flex items-center">
  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
  <span className="text-sm">مواعيد أسبوعية</span>
</div>
<div className="flex items-center">
  <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
  <span className="text-sm">مواعيد منفردة</span>
</div>
```

## الميزات الجديدة
- ✅ **إخفاء المواعيد المنتهية**: المواعيد المنتهية لا تظهر في التقويم
- ✅ **استخدام التاريخ الحقيقي**: النظام يستخدم التاريخ الحالي الفعلي
- ✅ **تنظيف الواجهة**: إزالة الألوان الرمادية والمراجع للمواعيد المنتهية
- ✅ **تحسين الأداء**: تقليل عدد الأحداث المعروضة في التقويم

## كيفية عمل النظام الآن

### للمواعيد المنفردة:
- إذا كان تاريخ الموعد أقل من التاريخ الحالي → لا يظهر في التقويم

### للمواعيد الأسبوعية:
- إذا كان تاريخ انتهاء الموعد أقل من التاريخ الحالي → لا يظهر في التقويم
- يجب أن يكون الموعد قد بدأ أيضاً (تاريخ البداية <= التاريخ الحالي)

## مثال عملي
- موعد ينتهي في `2025-10-16`
- التاريخ الحالي: `2025-12-01`
- النتيجة: الموعد لا يظهر في التقويم لأنه منتهي الصلاحية

## الاختبار
- تم اختبار البناء بنجاح
- تم التحقق من عدم وجود أخطاء TypeScript
- النظام يستخدم التاريخ الحقيقي بدلاً من التاريخ الافتراضي

## ملاحظات مهمة
- تم إزالة جميع المراجع للمواعيد المنتهية من الواجهة
- النظام الآن أكثر دقة في تحديد المواعيد النشطة
- تحسين تجربة المستخدم مع تقويم أنظف 