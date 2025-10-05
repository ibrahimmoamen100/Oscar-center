// نظام API للتعامل مع الخادم
const API_BASE_URL = 'http://localhost:3001/api';

// واجهات TypeScript
export interface Student {
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
  points: number;
  notes: string;
  certificates: string[];
}

export interface Message {
  id: string;
  title: string;
  content: string;
  targetType: 'all_students' | 'all_teachers' | 'preparatory_students' | 'secondary_students' | 'specific_grade' | 'specific_subject_grade' | 'specific_teacher_subject' | 'specific_schedule';
  targetValue?: string; // للصف أو المادة أو الموعد المحدد
  createdAt: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  password: string;
  photo?: string;
  phone: string;
  subjects: string[];
  schedule: any[];
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  educationLevel: 'preparatory' | 'secondary';
  grade: string[];
}

export interface ClassSchedule {
  id: string;
  subjectId: string;
  teacherId: string;
  studentIds: string[];
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface ScheduleType {
  id: string;
  subjectId: string;
  teacherId: string;
  studentIds: string[];
  scheduleType: 'weekly' | 'single';
  dayOfWeek: string | string[]; // يمكن أن يكون يوم واحد أو مصفوفة من الأيام
  startTime: string;
  endTime: string;
  room: string;
  startDate: string;
  endDate?: string;
}

export interface CenterData {
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  schedules: ClassSchedule[];
  customSchedules: ScheduleType[];
}

// دالة مساعدة للتعامل مع الأخطاء
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// ==================== الطلاب ====================

// جلب جميع الطلاب
export const getStudents = async (): Promise<Student[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
};

// جلب طالب واحد
export const getStudent = async (id: string): Promise<Student | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching student:', error);
    return null;
  }
};

// إضافة طالب جديد
export const addStudent = async (student: Omit<Student, 'id'>): Promise<Student | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(student),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error adding student:', error);
    return null;
  }
};

// تحديث طالب
export const updateStudent = async (id: string, updatedStudent: Partial<Student>): Promise<Student | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedStudent),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating student:', error);
    return null;
  }
};

// حذف طالب
export const deleteStudent = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
    return true;
  } catch (error) {
    console.error('Error deleting student:', error);
    return false;
  }
};

// تسجيل دخول الطالب
export const loginStudent = async (username: string, password: string): Promise<Student | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error logging in student:', error);
    return null;
  }
};

// ==================== المدرسين ====================

// جلب جميع المدرسين
export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return [];
  }
};

// جلب مدرس واحد
export const getTeacher = async (id: string): Promise<Teacher | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return null;
  }
};

// إضافة مدرس جديد
export const addTeacher = async (teacher: Omit<Teacher, 'id'>): Promise<Teacher | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teacher),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error adding teacher:', error);
    return null;
  }
};

// تحديث مدرس
export const updateTeacher = async (id: string, updatedTeacher: Partial<Teacher>): Promise<Teacher | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTeacher),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating teacher:', error);
    return null;
  }
};

// حذف مدرس
export const deleteTeacher = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
    return true;
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return false;
  }
};

// تسجيل دخول المدرس
export const loginTeacher = async (email: string, password: string): Promise<Teacher | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error logging in teacher:', error);
    return null;
  }
};

// ==================== المواد ====================

// جلب جميع المواد
export const getSubjects = async (): Promise<Subject[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
};

// جلب مادة واحدة
export const getSubject = async (id: string): Promise<Subject | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching subject:', error);
    return null;
  }
};

// إضافة مادة جديدة
export const addSubject = async (subject: Omit<Subject, 'id'>): Promise<Subject | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subject),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error adding subject:', error);
    return null;
  }
};

// تحديث مادة
export const updateSubject = async (id: string, updatedSubject: Partial<Subject>): Promise<Subject | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSubject),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating subject:', error);
    return null;
  }
};

// حذف مادة
export const deleteSubject = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
    return true;
  } catch (error) {
    console.error('Error deleting subject:', error);
    return false;
  }
};

// ==================== المواعيد ====================

// جلب جميع المواعيد
export const getSchedules = async (): Promise<ScheduleType[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return [];
  }
};

// جلب موعد واحد
export const getSchedule = async (id: string): Promise<ScheduleType | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return null;
  }
};

// إضافة موعد جديد
export const addSchedule = async (schedule: Omit<ScheduleType, 'id'>): Promise<ScheduleType | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schedule),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error adding schedule:', error);
    return null;
  }
};

// تحديث موعد
export const updateSchedule = async (id: string, updatedSchedule: Partial<ScheduleType>): Promise<ScheduleType | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSchedule),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return null;
  }
};

// حذف موعد
export const deleteSchedule = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
    return true;
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return false;
  }
};

// حذف جميع المواعيد المنتهية
export const cleanupExpiredSchedules = async (): Promise<{ removedCount: number; remainingCount: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/expired/cleanup`, {
      method: 'DELETE',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error cleaning up expired schedules:', error);
    return { removedCount: 0, remainingCount: 0 };
  }
};

// ==================== عمليات إضافية ====================

// جلب جميع البيانات
export const getAllData = async (): Promise<CenterData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/data`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching all data:', error);
    return null;
  }
};

// حساب السعر الإجمالي للمواد المختارة
export const calculateTotalPrice = async (selectedSubjectIds: string[]): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/calculate-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedSubjectIds }),
    });
    const result = await handleResponse(response);
    return result.totalPrice || 0;
  } catch (error) {
    console.error('Error calculating price:', error);
    return 0;
  }
};

// جلب مواعيد طالب معين
export const getStudentSchedules = async (studentId: string): Promise<ScheduleType[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}/schedules`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching student schedules:', error);
    return [];
  }
};

// جلب مواعيد مدرس معين
export const getTeacherSchedules = async (teacherId: string): Promise<ScheduleType[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}/schedules`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching teacher schedules:', error);
    return [];
  }
};

// دالة لحساب العمر من تاريخ الميلاد
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}; 

// ==================== دوال الرسائل ====================

export const getMessages = async (): Promise<Message[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages`);
    if (!response.ok) throw new Error('فشل في جلب الرسائل');
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const addMessage = async (message: Omit<Message, 'id' | 'createdAt'>): Promise<Message | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    if (!response.ok) throw new Error('فشل في إضافة الرسالة');
    return await response.json();
  } catch (error) {
    console.error('Error adding message:', error);
    return null;
  }
};

export const updateMessage = async (id: string, message: Partial<Message>): Promise<Message | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    if (!response.ok) throw new Error('فشل في تحديث الرسالة');
    return await response.json();
  } catch (error) {
    console.error('Error updating message:', error);
    return null;
  }
};

export const deleteMessage = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
};

export const getMessagesForUser = async (userId: string, userType: 'student' | 'teacher'): Promise<Message[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/user/${userId}?type=${userType}`);
    if (!response.ok) throw new Error('فشل في جلب رسائل المستخدم');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user messages:', error);
    return [];
  }
};