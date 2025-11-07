import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// مسار ملف قاعدة البيانات
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../data/db.json');

// واجهات TypeScript
interface Student {
  id: string;
  name: string;
  username: string;
  password: string;
  photo?: string;
  gender: 'male' | 'female';
  birthDate: string;
  age: number;
  phone: string;
  parentPhone: string;
  educationLevel: 'preparatory' | 'secondary';
  grade: string;
  selectedSubjects: string[];
  totalPrice: number;
  hasPaid: boolean;
  paidSubjects: string[];
  enrolledSubjects: string[];
  schedule: any[];
  points?: number;
  notes?: string;
  certificates?: string[];
  monthStartDate?: string;
  monthEndDate?: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  password: string;
  photo?: string;
  phone: string;
  subjects: string[];
  schedule: any[];
}

interface Subject {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  educationLevel: 'preparatory' | 'secondary';
  grade: string[];
}

interface ClassSchedule {
  id: string;
  subjectId: string;
  teacherId: string;
  studentIds: string[];
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
}

interface ScheduleType {
  id: string;
  subjectId: string;
  teacherId: string;
  studentIds: string[];
  scheduleType: 'weekly' | 'single';
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  startDate: string;
  endDate?: string;
}

interface Message {
  id: string;
  title: string;
  content: string;
  targetType: 'all_students' | 'all_teachers' | 'preparatory_students' | 'secondary_students' | 'specific_grade' | 'specific_subject_grade' | 'specific_teacher_subject' | 'specific_schedule';
  targetValue?: string;
  createdAt: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface CenterData {
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  schedules: ClassSchedule[];
  customSchedules: ScheduleType[];
  messages: Message[];
}

// دوال مساعدة لقراءة وكتابة البيانات
const readDatabase = (): CenterData => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return {
      students: [],
      teachers: [],
      subjects: [],
      schedules: [],
      customSchedules: [],
      messages: []
    };
  }
};

const writeDatabase = (data: CenterData): void => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing database:', error);
    throw error;
  }
};

// ==================== الطلاب ====================

// جلب جميع الطلاب
app.get('/api/students', (req, res) => {
  try {
    const data = readDatabase();
    res.json(data.students);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب بيانات الطلاب' });
  }
});

// جلب طالب واحد
app.get('/api/students/:id', (req, res) => {
  try {
    const data = readDatabase();
    const student = data.students.find(s => s.id === req.params.id);
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ error: 'الطالب غير موجود' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب بيانات الطالب' });
  }
});

// دالة لإنشاء ID عشوائي
const generateRandomId = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// إضافة طالب جديد
app.post('/api/students', (req, res) => {
  try {
    const data = readDatabase();
    const newStudent: Student = {
      ...req.body,
      id: `STD-${generateRandomId()}`,
      schedule: []
    };
    data.students.push(newStudent);
    writeDatabase(data);
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة الطالب' });
  }
});

// تحديث طالب
app.put('/api/students/:id', (req, res) => {
  try {
    const data = readDatabase();
    const index = data.students.findIndex(s => s.id === req.params.id);
    if (index !== -1) {
      data.students[index] = { ...data.students[index], ...req.body };
      writeDatabase(data);
      res.json(data.students[index]);
    } else {
      res.status(404).json({ error: 'الطالب غير موجود' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث الطالب' });
  }
});

// حذف طالب
app.delete('/api/students/:id', (req, res) => {
  try {
    const data = readDatabase();
    const index = data.students.findIndex(s => s.id === req.params.id);
    if (index !== -1) {
      data.students.splice(index, 1);
      writeDatabase(data);
      res.json({ message: 'تم حذف الطالب بنجاح' });
    } else {
      res.status(404).json({ error: 'الطالب غير موجود' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في حذف الطالب' });
  }
});

// تسجيل دخول الطالب
app.post('/api/students/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const data = readDatabase();
    const student = data.students.find(s => s.username === username && s.password === password);
    if (student) {
      res.json(student);
    } else {
      res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تسجيل الدخول' });
  }
});

// ==================== المدرسين ====================

// جلب جميع المدرسين
app.get('/api/teachers', (req, res) => {
  try {
    const data = readDatabase();
    res.json(data.teachers);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب بيانات المدرسين' });
  }
});

// جلب مدرس واحد
app.get('/api/teachers/:id', (req, res) => {
  try {
    const data = readDatabase();
    const teacher = data.teachers.find(t => t.id === req.params.id);
    if (teacher) {
      res.json(teacher);
    } else {
      res.status(404).json({ error: 'المدرس غير موجود' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب بيانات المدرس' });
  }
});

// إضافة مدرس جديد
app.post('/api/teachers', (req, res) => {
  try {
    const data = readDatabase();
    const newTeacher: Teacher = {
      ...req.body,
      id: Date.now().toString(),
      schedule: []
    };
    data.teachers.push(newTeacher);
    writeDatabase(data);
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة المدرس' });
  }
});

// تحديث مدرس
app.put('/api/teachers/:id', (req, res) => {
  try {
    const data = readDatabase();
    const index = data.teachers.findIndex(t => t.id === req.params.id);
    if (index !== -1) {
      data.teachers[index] = { ...data.teachers[index], ...req.body };
      writeDatabase(data);
      res.json(data.teachers[index]);
    } else {
      res.status(404).json({ error: 'المدرس غير موجود' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث المدرس' });
  }
});

// حذف مدرس
app.delete('/api/teachers/:id', (req, res) => {
  try {
    const data = readDatabase();
    const index = data.teachers.findIndex(t => t.id === req.params.id);
    if (index !== -1) {
      data.teachers.splice(index, 1);
      writeDatabase(data);
      res.json({ message: 'تم حذف المدرس بنجاح' });
    } else {
      res.status(404).json({ error: 'المدرس غير موجود' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في حذف المدرس' });
  }
});

// تسجيل دخول المدرس
app.post('/api/teachers/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const data = readDatabase();
    const teacher = data.teachers.find(t => t.email === email && t.password === password);
    if (teacher) {
      res.json(teacher);
    } else {
      res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تسجيل الدخول' });
  }
});

// ==================== المواد ====================

// جلب جميع المواد
app.get('/api/subjects', (req, res) => {
  try {
    const data = readDatabase();
    res.json(data.subjects);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب بيانات المواد' });
  }
});

// جلب مادة واحدة
app.get('/api/subjects/:id', (req, res) => {
  try {
    const data = readDatabase();
    const subject = data.subjects.find(s => s.id === req.params.id);
    if (subject) {
      res.json(subject);
    } else {
      res.status(404).json({ error: 'المادة غير موجودة' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب بيانات المادة' });
  }
});

// إضافة مادة جديدة
app.post('/api/subjects', (req, res) => {
  try {
    const data = readDatabase();
    const newSubject: Subject = {
      ...req.body,
      id: Date.now().toString()
    };
    data.subjects.push(newSubject);
    writeDatabase(data);
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة المادة' });
  }
});

// تحديث مادة
app.put('/api/subjects/:id', (req, res) => {
  try {
    const data = readDatabase();
    const index = data.subjects.findIndex(s => s.id === req.params.id);
    if (index !== -1) {
      data.subjects[index] = { ...data.subjects[index], ...req.body };
      writeDatabase(data);
      res.json(data.subjects[index]);
    } else {
      res.status(404).json({ error: 'المادة غير موجودة' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث المادة' });
  }
});

// حذف مادة
app.delete('/api/subjects/:id', (req, res) => {
  try {
    const data = readDatabase();
    const index = data.subjects.findIndex(s => s.id === req.params.id);
    if (index !== -1) {
      data.subjects.splice(index, 1);
      writeDatabase(data);
      res.json({ message: 'تم حذف المادة بنجاح' });
    } else {
      res.status(404).json({ error: 'المادة غير موجودة' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في حذف المادة' });
  }
});

// ==================== المواعيد ====================

// دالة للتحقق من انتهاء المواعيد
const isScheduleExpired = (schedule: ScheduleType): boolean => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  if (schedule.scheduleType === 'single') {
    return schedule.startDate < todayString;
  } else if (schedule.scheduleType === 'weekly' && schedule.endDate) {
    const hasStarted = schedule.startDate <= todayString;
    const hasEnded = schedule.endDate < todayString;
    return hasStarted && hasEnded;
  }
  return false;
};

// جلب جميع المواعيد
app.get('/api/schedules', (req, res) => {
  try {
    const data = readDatabase();
    
    // إزالة المواعيد المنتهية تلقائياً
    const activeSchedules = data.customSchedules.filter(schedule => !isScheduleExpired(schedule));
    
    // إذا كان هناك مواعيد منتهية، احفظ التغييرات
    if (activeSchedules.length !== data.customSchedules.length) {
      data.customSchedules = activeSchedules;
      writeDatabase(data);
      console.log(`Removed ${data.customSchedules.length - activeSchedules.length} expired schedules`);
    }
    
    res.json(activeSchedules);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب بيانات المواعيد' });
  }
});

// جلب موعد واحد
app.get('/api/schedules/:id', (req, res) => {
  try {
    const data = readDatabase();
    const schedule = data.customSchedules.find(s => s.id === req.params.id);
    if (schedule) {
      res.json(schedule);
    } else {
      res.status(404).json({ error: 'الموعد غير موجود' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب بيانات الموعد' });
  }
});

// إضافة موعد جديد
app.post('/api/schedules', (req, res) => {
  try {
    const data = readDatabase();
    const newSchedule: ScheduleType = {
      ...req.body,
      id: Date.now().toString()
    };
    data.customSchedules.push(newSchedule);
    writeDatabase(data);
    res.status(201).json(newSchedule);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة الموعد' });
  }
});

// تحديث موعد
app.put('/api/schedules/:id', (req, res) => {
  try {
    const data = readDatabase();
    const index = data.customSchedules.findIndex(s => s.id === req.params.id);
    if (index !== -1) {
      data.customSchedules[index] = { ...data.customSchedules[index], ...req.body };
      writeDatabase(data);
      res.json(data.customSchedules[index]);
    } else {
      res.status(404).json({ error: 'الموعد غير موجود' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث الموعد' });
  }
});

// حذف موعد
app.delete('/api/schedules/:id', (req, res) => {
  try {
    const data = readDatabase();
    const index = data.customSchedules.findIndex(s => s.id === req.params.id);
    if (index !== -1) {
      data.customSchedules.splice(index, 1);
      writeDatabase(data);
      res.json({ message: 'تم حذف الموعد بنجاح' });
    } else {
      res.status(404).json({ error: 'الموعد غير موجود' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في حذف الموعد' });
  }
});

// حذف جميع المواعيد المنتهية
app.delete('/api/schedules/expired/cleanup', (req, res) => {
  try {
    const data = readDatabase();
    const originalCount = data.customSchedules.length;
    data.customSchedules = data.customSchedules.filter(schedule => !isScheduleExpired(schedule));
    const removedCount = originalCount - data.customSchedules.length;
    
    if (removedCount > 0) {
      writeDatabase(data);
      res.json({ 
        message: `تم حذف ${removedCount} موعد منتهي بنجاح`,
        removedCount,
        remainingCount: data.customSchedules.length
      });
    } else {
      res.json({ 
        message: 'لا توجد مواعيد منتهية للحذف',
        removedCount: 0,
        remainingCount: data.customSchedules.length
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في حذف المواعيد المنتهية' });
  }
});

// ==================== عمليات إضافية ====================

// جلب جميع البيانات
app.get('/api/data', (req, res) => {
  try {
    const data = readDatabase();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب البيانات' });
  }
});

// حساب السعر الإجمالي للمواد المختارة
app.post('/api/calculate-price', (req, res) => {
  try {
    const { selectedSubjectIds } = req.body;
    const data = readDatabase();
    const totalPrice = selectedSubjectIds.reduce((total: number, subjectId: string) => {
      const subject = data.subjects.find(s => s.id === subjectId);
      return total + (subject?.price || 0);
    }, 0);
    res.json({ totalPrice });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في حساب السعر' });
  }
});

// جلب مواعيد طالب معين
app.get('/api/students/:id/schedules', (req, res) => {
  try {
    const data = readDatabase();
    const studentSchedules = data.customSchedules.filter(schedule => 
      schedule.studentIds.includes(req.params.id)
    );
    res.json(studentSchedules);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب مواعيد الطالب' });
  }
});

// جلب مواعيد مدرس معين
app.get('/api/teachers/:id/schedules', (req, res) => {
  try {
    const data = readDatabase();
    const teacherSchedules = data.customSchedules.filter(schedule => 
      schedule.teacherId === req.params.id
    );
    res.json(teacherSchedules);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب مواعيد المدرس' });
  }
});

// ==================== الرسائل ====================

// جلب جميع الرسائل
app.get('/api/messages', (req, res) => {
  try {
    const data = readDatabase();
    res.json(data.messages || []);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الرسائل' });
  }
});

// جلب رسالة واحدة
app.get('/api/messages/:id', (req, res) => {
  try {
    const data = readDatabase();
    const message = data.messages?.find(m => m.id === req.params.id);
    if (message) {
      res.json(message);
    } else {
      res.status(404).json({ error: 'الرسالة غير موجودة' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الرسالة' });
  }
});

// إضافة رسالة جديدة
app.post('/api/messages', (req, res) => {
  try {
    const data = readDatabase();
    const newMessage: Message = {
      ...req.body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    if (!data.messages) data.messages = [];
    data.messages.push(newMessage);
    writeDatabase(data);
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة الرسالة' });
  }
});

// تحديث رسالة
app.put('/api/messages/:id', (req, res) => {
  try {
    const data = readDatabase();
    const index = data.messages?.findIndex(m => m.id === req.params.id);
    if (index !== -1 && data.messages) {
      data.messages[index] = { ...data.messages[index], ...req.body };
      writeDatabase(data);
      res.json(data.messages[index]);
    } else {
      res.status(404).json({ error: 'الرسالة غير موجودة' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث الرسالة' });
  }
});

// حذف رسالة
app.delete('/api/messages/:id', (req, res) => {
  try {
    const data = readDatabase();
    const index = data.messages?.findIndex(m => m.id === req.params.id);
    if (index !== -1 && data.messages) {
      data.messages.splice(index, 1);
      writeDatabase(data);
      res.json({ message: 'تم حذف الرسالة بنجاح' });
    } else {
      res.status(404).json({ error: 'الرسالة غير موجودة' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في حذف الرسالة' });
  }
});

// جلب رسائل لمستخدم معين
app.get('/api/messages/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query;
    const data = readDatabase();
    
    if (!data.messages) {
      res.json([]);
      return;
    }

    const userMessages = data.messages.filter(message => {
      if (!message.isActive) return false;
      
      switch (message.targetType) {
        case 'all_students':
          return type === 'student';
        case 'all_teachers':
          return type === 'teacher';
        case 'preparatory_students':
          if (type !== 'student') return false;
          const student = data.students.find(s => s.id === userId);
          return student?.educationLevel === 'preparatory';
        case 'secondary_students':
          if (type !== 'student') return false;
          const student2 = data.students.find(s => s.id === userId);
          return student2?.educationLevel === 'secondary';
        case 'specific_grade':
          if (type !== 'student') return false;
          const student3 = data.students.find(s => s.id === userId);
          return student3?.grade === message.targetValue;
        case 'specific_subject_grade':
          if (type !== 'student') return false;
          const student4 = data.students.find(s => s.id === userId);
          return student4?.selectedSubjects.includes(message.targetValue || '');
        case 'specific_teacher_subject':
          if (type !== 'teacher') return false;
          const teacher = data.teachers.find(t => t.id === userId);
          return teacher?.subjects.includes(message.targetValue || '');
        case 'specific_schedule':
          const schedule = data.customSchedules.find(s => s.id === message.targetValue);
          if (type === 'student') {
            return schedule?.studentIds.includes(userId);
          } else if (type === 'teacher') {
            return schedule?.teacherId === userId;
          }
          return false;
        default:
          return false;
      }
    });

    res.json(userMessages);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب رسائل المستخدم' });
  }
});

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
  console.log(`📊 قاعدة البيانات: ${DB_PATH}`);
  console.log(`🌐 API متاح على: http://localhost:${PORT}/api`);
});

export default app;
