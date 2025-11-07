# إصلاح مشكلة عرض المواعيد متعددة الأيام في التقويم

## المشكلة
كانت المواعيد التي تحتوي على أكثر من يوم في الأسبوع لا تظهر في التقويم، حيث كان الكود يتعامل مع `dayOfWeek` كـ string واحد فقط.

## الحل المطبق

### 1. تحديث منطق معالجة الأيام في التقويم
- تم تغيير `schedules.map()` إلى `schedules.flatMap()` للتعامل مع المصفوفات
- تم إضافة دعم للتعامل مع `dayOfWeek` كـ string أو array
- تم إنشاء حدث منفصل لكل يوم في الموعد

### 2. التحديثات التقنية

#### في `src/pages/Admin.tsx`:

**قبل التحديث:**
```javascript
const dayNumber = dayMap[schedule.dayOfWeek];
if (dayNumber === undefined) {
  console.warn(`Unknown day: ${schedule.dayOfWeek}`);
  return null;
}
```

**بعد التحديث:**
```javascript
// التعامل مع dayOfWeek كـ string أو array
const days = Array.isArray(schedule.dayOfWeek) ? schedule.dayOfWeek : [schedule.dayOfWeek];

// تحويل الأيام إلى أرقام
const dayNumbers = days.map(day => dayMap[day]).filter(dayNumber => dayNumber !== undefined);

if (dayNumbers.length === 0) {
  console.warn(`No valid days found for schedule ${schedule.id}:`, schedule.dayOfWeek);
  return [];
}
```

#### إنشاء أحداث منفصلة لكل يوم:
```javascript
// إنشاء حدث منفصل لكل يوم
return dayNumbers.map((dayNumber, index) => ({
  id: `${schedule.id}-${index}`,
  title: `${subject?.name || 'مادة غير محددة'}\n${teacher?.name || 'مدرس غير محدد'}\nالقاعة: ${schedule.room}`,
  daysOfWeek: [dayNumber],
  startTime: schedule.startTime,
  endTime: schedule.endTime,
  start: startDate.toISOString().split('T')[0],
  end: endDate ? endDate.toISOString().split('T')[0] : undefined,
  backgroundColor: backgroundColor,
  borderColor: borderColor,
  textColor: '#ffffff',
  extendedProps: {
    subject: subject?.name,
    teacher: teacher?.name,
    room: schedule.room,
    type: schedule.scheduleType,
    expired: isExpired,
    originalScheduleId: schedule.id
  }
}));
```

### 3. الميزات الجديدة
- ✅ **دعم المواعيد متعددة الأيام**: الآن تظهر جميع الأيام المختارة في التقويم
- ✅ **أحداث منفصلة**: كل يوم له حدث منفصل في التقويم
- ✅ **معرفات فريدة**: كل حدث له معرف فريد (`${schedule.id}-${index}`)
- ✅ **تتبع الموعد الأصلي**: `originalScheduleId` للربط مع الموعد الأصلي
- ✅ **توافق مع البيانات القديمة**: يدعم المواعيد التي تحتوي على يوم واحد

### 4. كيفية عمل النظام الآن

#### للمواعيد التي تحتوي على يوم واحد:
- يتم إنشاء حدث واحد في التقويم
- المعرف: `schedule.id-0`

#### للمواعيد التي تحتوي على عدة أيام:
- يتم إنشاء حدث منفصل لكل يوم
- المعرفات: `schedule.id-0`, `schedule.id-1`, `schedule.id-2`, إلخ
- كل حدث يظهر في اليوم المحدد له

### 5. مثال عملي
إذا كان لديك موعد في الأحد والثلاثاء:
- سيظهر حدث في الأحد مع المعرف `schedule.id-0`
- سيظهر حدث في الثلاثاء مع المعرف `schedule.id-1`
- كلاهما يشيران إلى نفس الموعد الأصلي عبر `originalScheduleId`

## الاختبار
- تم اختبار البناء بنجاح
- تم التحقق من عدم وجود أخطاء TypeScript
- النظام يدعم جميع أنواع البيانات (قديمة وجديدة)

## ملاحظات مهمة
- تم الحفاظ على التوافق مع البيانات القديمة
- لا توجد حاجة لتحديث البيانات الموجودة
- جميع الميزات السابقة تعمل كما هو متوقع 